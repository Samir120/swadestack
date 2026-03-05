import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import bcrypt from 'bcrypt';
import UsersRepository from '../integration/repositories/UsersRepository';
import AuditLogService from './AuditLogService';
import { AuthEmailService } from './AuthEmailService';
import { encrypt, decrypt } from '../utils/encryptionUtils';
import { generateRecoveryCode, verifyRecoveryCode as verifyRecovery } from '../utils/twoFactorRecoveryStore';

export class TwoFactorService {
  private usersRepository: UsersRepository;
  private auditLogService: AuditLogService;
  private authEmailService: AuthEmailService;

  constructor() {
    this.usersRepository = new UsersRepository();
    this.auditLogService = new AuditLogService();
    this.authEmailService = new AuthEmailService();
  }

  async generateSetup(userId: string): Promise<{ qrCodeDataUrl: string; manualEntryCode: string }> {
    const user = await this.usersRepository.findById(userId);
    if (!user) throw new Error('User not found');
    if (user.twoFactorEnabled) throw new Error('Two-factor authentication is already enabled');

    const appName = process.env.APP_NAME || 'MyApp';
    const secret = speakeasy.generateSecret({
      length: 20,
      name: `${appName}:${user.email}`,
      issuer: appName,
    });

    const qrCodeDataUrl = await QRCode.toDataURL(secret.otpauth_url!);

    // Format manual entry key: uppercase, groups of 4
    const base32 = secret.base32;
    const manualEntryCode = base32.toUpperCase().match(/.{1,4}/g)!.join(' ');

    // Store encrypted secret (not enabled yet)
    await this.usersRepository.updateTwoFactorFields(userId, {
      twoFactorSecret: encrypt(base32),
    });

    return { qrCodeDataUrl, manualEntryCode };
  }

  async verifyAndEnable(userId: string, token: string): Promise<{ success: boolean; error?: string }> {
    const user = await this.usersRepository.findById(userId);
    if (!user) return { success: false, error: 'User not found' };
    if (!user.twoFactorSecret) return { success: false, error: 'Two-factor setup not initiated' };

    const secret = decrypt(user.twoFactorSecret);
    const verified = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 1,
    });

    if (!verified) {
      return { success: false, error: 'Invalid verification code' };
    }

    await this.usersRepository.updateTwoFactorFields(userId, {
      twoFactorEnabled: true,
      twoFactorVerifiedAt: new Date(),
    });

    try {
      await this.auditLogService.log({
        adminUserId: userId,
        adminUserName: `${user.firstName} ${user.lastName}`,
        action: 'user.2fa.enabled',
        targetType: 'user',
        targetId: userId,
      });
    } catch {
      // Audit log failure is non-critical
    }

    return { success: true };
  }

  async disable(userId: string, password: string): Promise<{ success: boolean; error?: string }> {
    const user = await this.usersRepository.findById(userId);
    if (!user) return { success: false, error: 'User not found' };

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return { success: false, error: 'Incorrect password' };
    }

    await this.usersRepository.updateTwoFactorFields(userId, {
      twoFactorSecret: null,
      twoFactorEnabled: false,
      twoFactorVerifiedAt: null,
    });

    try {
      await this.auditLogService.log({
        adminUserId: userId,
        adminUserName: `${user.firstName} ${user.lastName}`,
        action: 'user.2fa.disabled',
        targetType: 'user',
        targetId: userId,
      });
    } catch {
      // Audit log failure is non-critical
    }

    return { success: true };
  }

  async verifyTokenForLogin(userId: string, token: string): Promise<{ success: boolean }> {
    const user = await this.usersRepository.findById(userId);
    if (!user || !user.twoFactorSecret || !user.twoFactorEnabled) {
      return { success: false };
    }

    const secret = decrypt(user.twoFactorSecret);
    const verified = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 1,
    });

    return { success: verified };
  }

  async getStatus(userId: string): Promise<{ twoFactorEnabled: boolean; verifiedAt: Date | null }> {
    const user = await this.usersRepository.findById(userId);
    if (!user) throw new Error('User not found');
    return {
      twoFactorEnabled: user.twoFactorEnabled,
      verifiedAt: user.twoFactorVerifiedAt || null,
    };
  }

  async sendRecoveryCode(userId: string): Promise<{ success: boolean }> {
    const user = await this.usersRepository.findById(userId);
    if (!user) return { success: false };

    const code = generateRecoveryCode(userId);

    try {
      await this.authEmailService.sendTwoFactorRecoveryCode(
        user.email,
        user.firstName,
        code
      );
    } catch (error) {
      console.error('Failed to send 2FA recovery email:', error);
      return { success: false };
    }

    return { success: true };
  }

  async verifyRecoveryCode(userId: string, code: string): Promise<{ success: boolean; error?: string }> {
    const valid = verifyRecovery(userId, code);
    if (!valid) {
      return { success: false, error: 'Invalid or expired recovery code' };
    }
    return { success: true };
  }
}

export default TwoFactorService;
