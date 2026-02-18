import { EmailService } from './EmailService';
import { EmailVerificationDTO, PasswordResetDTO, SendEmailDTO } from '../models/dto/emailDTO';
import { EmailTemplateType, EmailPriority } from '../config/emailConfig';
import { config } from '../config/environment';
import SiteSettingsRepository from '../integration/repositories/SiteSettingsRepository';

export class AuthEmailService {
  private emailService: EmailService;
  private settingsRepo: SiteSettingsRepository;

  constructor() {
    this.emailService = new EmailService();
    this.settingsRepo = new SiteSettingsRepository();
  }

  /**
   * Send welcome email after registration
   */
  async sendWelcomeEmail(
    email: string,
    userName: string,
    language: 'en' | 'sv' = 'en'
  ): Promise<void> {
    const settings = await this.settingsRepo.getSettings();
    const siteName = (language === 'sv' ? settings?.siteName_sv : settings?.siteName_en) || settings?.siteName_en || '';
    const subject = language === 'sv' ? `Välkommen till ${siteName}!` : `Welcome to ${siteName}!`;

    const emailData: SendEmailDTO = {
      to: email,
      subject,
      templateType: EmailTemplateType.WELCOME,
      templateData: {
        userName,
        language,
        dashboardUrl: `${config.frontendUrl}/dashboard`,
        supportEmail: process.env.SUPPORT_EMAIL || process.env.SMTP_USER,
      },
      priority: EmailPriority.NORMAL,
      language,
    };

    await this.emailService.sendEmail(emailData);
  }

  /**
   * Send email verification
   */
  async sendEmailVerification(data: EmailVerificationDTO): Promise<void> {
    const verificationUrl = `${config.frontendUrl}/verify-email/${data.verificationToken}`;

    const subject =
      data.language === 'sv' ? 'Verifiera din e-postadress' : 'Verify Your Email Address';

    const emailData: SendEmailDTO = {
      to: data.email,
      subject,
      templateType: EmailTemplateType.EMAIL_VERIFICATION,
      templateData: {
        verificationUrl,
        language: data.language,
        expiresIn: '24 hours',
      },
      priority: EmailPriority.HIGH,
      userId: data.userId,
      language: data.language,
    };

    await this.emailService.sendEmailWithRetry(emailData);
  }

  /**
   * Send password reset email
   */
  async sendPasswordReset(data: PasswordResetDTO): Promise<void> {
    const resetUrl = `${config.frontendUrl}/reset-password/${data.resetToken}`;

    const subject =
      data.language === 'sv' ? 'Återställ ditt lösenord' : 'Reset Your Password';

    const emailData: SendEmailDTO = {
      to: data.email,
      subject,
      templateType: EmailTemplateType.PASSWORD_RESET,
      templateData: {
        userName: data.userName,
        resetUrl,
        language: data.language,
        expiresIn: '1 hour',
        ipAddress: 'Unknown', // Can be passed from request
        requestedAt: new Date(),
      },
      priority: EmailPriority.HIGH,
      language: data.language,
    };

    await this.emailService.sendEmailWithRetry(emailData);
  }

  /**
   * Send password changed notification
   */
  async sendPasswordChangedNotification(
    email: string,
    userName: string,
    language: 'en' | 'sv' = 'en'
  ): Promise<void> {
    const subject =
      language === 'sv' ? 'Ditt lösenord har ändrats' : 'Your Password Has Been Changed';

    const emailData: SendEmailDTO = {
      to: email,
      subject,
      templateType: EmailTemplateType.PASSWORD_RESET,
      templateData: {
        userName,
        language,
        isConfirmation: true,
        changedAt: new Date(),
        supportEmail: process.env.SUPPORT_EMAIL || process.env.SMTP_USER,
      },
      priority: EmailPriority.HIGH,
      language,
    };

    await this.emailService.sendEmail(emailData);
  }

  /**
   * Resend email verification
   */
  async resendEmailVerification(
    userId: string,
    email: string,
    verificationToken: string,
    language: 'en' | 'sv' = 'en'
  ): Promise<void> {
    await this.sendEmailVerification({
      userId,
      email,
      verificationToken,
      language,
    });
  }

  /**
   * Send account activation email
   */
  async sendAccountActivation(
    email: string,
    userName: string,
    language: 'en' | 'sv' = 'en'
  ): Promise<void> {
    const subject =
      language === 'sv' ? 'Ditt konto har aktiverats' : 'Your Account Has Been Activated';

    const emailData: SendEmailDTO = {
      to: email,
      subject,
      templateType: EmailTemplateType.WELCOME,
      templateData: {
        userName,
        language,
        isActivation: true,
        activatedAt: new Date(),
        loginUrl: `${config.frontendUrl}/login`,
      },
      priority: EmailPriority.NORMAL,
      language,
    };

    await this.emailService.sendEmail(emailData);
  }

  /**
   * Send account deactivation notification
   */
  async sendAccountDeactivation(
    email: string,
    userName: string,
    reason?: string,
    language: 'en' | 'sv' = 'en'
  ): Promise<void> {
    const subject =
      language === 'sv' ? 'Ditt konto har inaktiverats' : 'Your Account Has Been Deactivated';

    const emailData: SendEmailDTO = {
      to: email,
      subject,
      templateType: EmailTemplateType.WELCOME,
      templateData: {
        userName,
        language,
        isDeactivation: true,
        reason,
        deactivatedAt: new Date(),
        supportEmail: process.env.SUPPORT_EMAIL || process.env.SMTP_USER,
      },
      priority: EmailPriority.HIGH,
      language,
    };

    await this.emailService.sendEmail(emailData);
  }

  /**
   * Send login notification (security feature)
   */
  async sendLoginNotification(
    email: string,
    userName: string,
    ipAddress: string,
    device: string,
    language: 'en' | 'sv' = 'en'
  ): Promise<void> {
    const subject =
      language === 'sv' ? 'Ny inloggning på ditt konto' : 'New Login to Your Account';

    const emailData: SendEmailDTO = {
      to: email,
      subject,
      templateType: EmailTemplateType.WELCOME,
      templateData: {
        userName,
        language,
        isLoginNotification: true,
        ipAddress,
        device,
        loginAt: new Date(),
        supportEmail: process.env.SUPPORT_EMAIL || process.env.SMTP_USER,
      },
      priority: EmailPriority.NORMAL,
      language,
    };

    await this.emailService.sendEmail(emailData);
  }
}
