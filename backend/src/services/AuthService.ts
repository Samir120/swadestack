import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import UsersRepository from '../integration/repositories/UsersRepository';
import RefreshTokenRepository from '../integration/repositories/RefreshTokenRepository';
import { config } from '../config/environment';
import { validatePassword } from '../utils/passwordValidator';
import {
  UserDTO,
  CreateUserDTO,
  LoginDTO,
  AuthResponseDTO,
} from '../models/dto/UserDTO';

/**
 * Auth Service - Business Logic Layer
 * Handles authentication and user management
 */
export class AuthService {
  private usersRepository: UsersRepository;
  private refreshTokenRepository: RefreshTokenRepository;

  constructor() {
    this.usersRepository = new UsersRepository();
    this.refreshTokenRepository = new RefreshTokenRepository();
  }

  /**
   * Register a new user
   * Returns the created user and a verification token (no JWT - user must verify email first)
   */
  async register(data: CreateUserDTO): Promise<{ user: UserDTO; verificationToken: string }> {
    // Validate email format
    if (!this.isValidEmail(data.email)) {
      throw new Error('Invalid email format');
    }

    // Check if email already exists
    const emailExists = await this.usersRepository.emailExists(data.email);
    if (emailExists) {
      throw new Error('Email already registered');
    }

    // Validate password strength
    if (!this.isValidPassword(data.password)) {
      throw new Error(
        'Password must be at least 8 characters and contain letters and numbers'
      );
    }

    // Validate company-specific fields if userType is company
    if (data.userType === 'company') {
      if (!data.company) {
        throw new Error('Company name is required for company accounts');
      }
      if (!data.organizationNumber) {
        throw new Error('Organization number is required for company accounts');
      }
      if (!data.vatNumber) {
        throw new Error('VAT number is required for company accounts');
      }
    }

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create user with verification token included in the same INSERT
    const user = await this.usersRepository.createUser({
      ...data,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires,
    });

    return {
      user: this.mapToDTO(user),
      verificationToken,
    };
  }

  /**
   * Login user
   */
  async login(data: LoginDTO): Promise<AuthResponseDTO> {
    // Authenticate user
    const user = await this.usersRepository.authenticate(data.email, data.password);

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      throw new Error('Please verify your email address before logging in');
    }

    // Generate access + refresh tokens
    const token = this.generateAccessToken(user.id, user.email, user.role);
    const refreshToken = await this.generateRefreshToken(user.id);

    return {
      user: this.mapToDTO(user),
      token,
      refreshToken,
    };
  }

  /**
   * Refresh access token using a valid refresh token
   * Implements token rotation: old refresh token is revoked, new one is issued
   */
  async refreshAccessToken(refreshTokenValue: string): Promise<AuthResponseDTO> {
    const existingToken = await this.refreshTokenRepository.findValidByToken(refreshTokenValue);

    if (!existingToken) {
      throw new Error('Invalid or expired refresh token');
    }

    // Revoke old refresh token (rotation)
    await this.refreshTokenRepository.revokeToken(refreshTokenValue);

    // Look up user
    const user = await this.usersRepository.findById(existingToken.userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Generate new token pair
    const token = this.generateAccessToken(user.id, user.email, user.role);
    const refreshToken = await this.generateRefreshToken(user.id);

    return { user: this.mapToDTO(user), token, refreshToken };
  }

  /**
   * Revoke a single refresh token (used on logout)
   */
  async revokeRefreshToken(refreshTokenValue: string): Promise<void> {
    await this.refreshTokenRepository.revokeToken(refreshTokenValue);
  }

  /**
   * Get user by ID
   */
  async getUserById(id: string): Promise<UserDTO | null> {
    const user = await this.usersRepository.findById(id);
    return user ? this.mapToDTO(user) : null;
  }

  /**
   * Verify JWT token
   */
  verifyToken(token: string): { userId: string; email: string; role: string } {
    try {
      const decoded = jwt.verify(token, config.jwt.secret) as {
        userId: string;
        email: string;
        role: string;
      };
      return decoded;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * Change user password
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isValid = await user.comparePassword(currentPassword);
    if (!isValid) {
      throw new Error('Current password is incorrect');
    }

    // Validate new password
    if (!this.isValidPassword(newPassword)) {
      throw new Error(
        'New password must be at least 8 characters and contain letters and numbers'
      );
    }

    // Update password
    await this.usersRepository.updatePassword(userId, newPassword);
  }

  /**
   * Verify user email with token
   */
  async verifyEmail(token: string): Promise<UserDTO> {
    let user = await this.usersRepository.findByVerificationToken(token);

    // If token not found, user might already be verified - this is OK
    if (!user) {
      // Check if there's a recently verified user (token was cleared after verification)
      // This handles the case where user refreshes the verification page
      throw new Error('Invalid or already used verification token');
    }

    // Check if already verified (shouldn't happen but handle gracefully)
    if (user.isEmailVerified) {
      return this.mapToDTO(user);
    }

    // Check token expiry
    if (user.emailVerificationExpires && user.emailVerificationExpires < new Date()) {
      throw new Error('Verification token has expired');
    }

    // Mark as verified
    await this.usersRepository.markEmailVerified(user.id);

    // Fetch updated user to return
    const updatedUser = await this.usersRepository.findById(user.id);
    return this.mapToDTO(updatedUser || user);
  }

  /**
   * Resend email verification
   * Returns user info and new token for the controller to send the email
   */
  async resendVerificationEmail(email: string): Promise<{ user: UserDTO; verificationToken: string }> {
    const user = await this.usersRepository.findByEmail(email);

    if (!user) {
      // Return generic message to avoid user enumeration
      throw new Error('If this email is registered, a verification email has been sent');
    }

    if (user.isEmailVerified) {
      throw new Error('Email is already verified');
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    await this.usersRepository.setVerificationToken(user.id, verificationToken, expires);

    return {
      user: this.mapToDTO(user),
      verificationToken,
    };
  }

  /**
   * Request password reset
   * Generates a reset token and returns user info for the controller to send the email
   */
  async requestPasswordReset(email: string): Promise<{ user: UserDTO; resetToken: string } | null> {
    const user = await this.usersRepository.findByEmail(email);

    if (!user) {
      // Return null to avoid user enumeration — controller returns the same generic 200
      return null;
    }

    // Generate password reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour
    await this.usersRepository.setResetPasswordToken(user.id, resetToken, expires);

    return {
      user: this.mapToDTO(user),
      resetToken,
    };
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await this.usersRepository.findByResetToken(token);

    if (!user) {
      throw new Error('Invalid or expired password reset token');
    }

    // Check token expiry
    if (user.resetPasswordExpires && user.resetPasswordExpires < new Date()) {
      throw new Error('Password reset token has expired');
    }

    // Validate new password
    if (!this.isValidPassword(newPassword)) {
      throw new Error(
        'Password must be at least 8 characters and contain letters and numbers'
      );
    }

    // Update password and clear reset token
    await this.usersRepository.updatePassword(user.id, newPassword);
    await this.usersRepository.clearResetPasswordToken(user.id);
  }

  // Helper methods

  private generateAccessToken(userId: string, email: string, role: string): string {
    return jwt.sign(
      { userId, email, role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn } as jwt.SignOptions
    );
  }

  private async generateRefreshToken(userId: string): Promise<string> {
    const token = crypto.randomBytes(40).toString('hex');
    const expiresAt = new Date(Date.now() + config.jwt.refreshExpiresInDays * 24 * 60 * 60 * 1000);

    await this.refreshTokenRepository.create({
      userId,
      token,
      expiresAt,
    });

    return token;
  }

  private mapToDTO(user: any): UserDTO {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      userType: user.userType,
      isEmailVerified: user.isEmailVerified,
      company: user.company,
      organizationNumber: user.organizationNumber,
      vatNumber: user.vatNumber,
      createdAt: user.createdAt,
    };
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidPassword(password: string): boolean {
    return validatePassword(password).valid;
  }
}

export default AuthService;
