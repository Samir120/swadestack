import { BaseDAO } from '../dao/BaseDAO';
import User, { UserAttributes } from '../../models/sequelize/User';

export class UsersRepository extends BaseDAO<User> {
  constructor() {
    super(User);
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    return await this.model.findOne({
      where: { email: email.toLowerCase() },
    });
  }

  /**
   * Check if email exists
   */
  async emailExists(email: string): Promise<boolean> {
    return await this.exists({ email: email.toLowerCase() } as any);
  }

  /**
   * Find admin users
   */
  async findAdmins(): Promise<User[]> {
    return await this.model.findAll({
      where: { role: 'admin' },
      order: [['createdAt', 'ASC']],
    });
  }

  /**
   * Create user with lowercase email
   */
  async createUser(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: 'admin' | 'user';
    userType?: 'personal' | 'company';
    company?: string;
    organizationNumber?: string;
    vatNumber?: string;
    emailVerificationToken?: string;
    emailVerificationExpires?: Date;
  }): Promise<User> {
    return await this.create({
      ...userData,
      email: userData.email.toLowerCase(),
    });
  }

  /**
   * Update user password
   */
  async updatePassword(userId: string, newPassword: string): Promise<void> {
    const user = await this.findById(userId);
    if (user) {
      user.password = newPassword;
      await user.save();
    }
  }

  /**
   * Authenticate user
   */
  async authenticate(email: string, password: string): Promise<User | null> {
    const user = await this.findByEmail(email);
    if (!user) return null;

    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) return null;

    return user;
  }

  /**
   * Find user by email verification token
   */
  async findByVerificationToken(token: string): Promise<User | null> {
    return await this.model.findOne({
      where: { emailVerificationToken: token },
    });
  }

  /**
   * Mark user email as verified and clear token
   */
  async markEmailVerified(userId: string): Promise<void> {
    await this.model.update(
      {
        isEmailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null,
      } as any,
      { where: { id: userId } as any }
    );
  }

  /**
   * Set email verification token and expiry
   */
  async setVerificationToken(userId: string, token: string, expires: Date): Promise<void> {
    await this.model.update(
      {
        emailVerificationToken: token,
        emailVerificationExpires: expires,
      } as any,
      { where: { id: userId } as any }
    );
  }

  /**
   * Find user by password reset token
   */
  async findByResetToken(token: string): Promise<User | null> {
    return await this.model.findOne({
      where: { resetPasswordToken: token },
    });
  }

  /**
   * Set password reset token and expiry
   */
  async setResetPasswordToken(userId: string, token: string, expires: Date): Promise<void> {
    await this.model.update(
      {
        resetPasswordToken: token,
        resetPasswordExpires: expires,
      } as any,
      { where: { id: userId } as any }
    );
  }

  /**
   * Clear password reset token
   */
  async clearResetPasswordToken(userId: string): Promise<void> {
    await this.model.update(
      {
        resetPasswordToken: null,
        resetPasswordExpires: null,
      } as any,
      { where: { id: userId } as any }
    );
  }
  /**
   * Update only 2FA-related columns
   */
  async updateTwoFactorFields(
    userId: string,
    fields: {
      twoFactorSecret?: string | null;
      twoFactorEnabled?: boolean;
      twoFactorVerifiedAt?: Date | null;
    }
  ): Promise<void> {
    await this.model.update(fields as any, { where: { id: userId } as any });
  }
}

export default UsersRepository;
