import nodemailer, { Transporter } from 'nodemailer';
import { emailConfig, EmailTemplateType, EmailPriority } from '../config/emailConfig';
import { EmailRepository } from '../integration/repositories/EmailRepository';
import { getTemplateRenderer } from '../utils/emailTemplateRenderer';
import { SendEmailDTO } from '../models/dto/emailDTO';
import Email from '../models/sequelize/Email';

export class EmailService {
  private transporter!: Transporter;
  private emailRepository: EmailRepository;
  private templateRenderer: ReturnType<typeof getTemplateRenderer>;

  constructor() {
    this.emailRepository = new EmailRepository();
    this.templateRenderer = getTemplateRenderer(emailConfig.templates.path);
    this.initializeTransporter();
  }

  /**
   * Initialize SMTP transporter
   */
  private initializeTransporter(): void {
    this.transporter = nodemailer.createTransport({
      host: emailConfig.smtp.host,
      port: emailConfig.smtp.port,
      secure: emailConfig.smtp.secure,
      auth: emailConfig.smtp.auth,
      pool: true, // Use pooled connections
      maxConnections: 5,
      maxMessages: 100,
    });

    // Verify connection
    this.verifyConnection();
  }

  /**
   * Verify SMTP connection
   */
  private async verifyConnection(): Promise<void> {
    try {
      await this.transporter.verify();
      console.log('✅ Email service ready');
    } catch (error) {
      console.error('❌ Email service connection failed:', error);
    }
  }

  /**
   * Send email
   */
  async sendEmail(emailData: SendEmailDTO): Promise<Email> {
    const language = emailData.language || 'en';

    // Create email record in database
    const emailRecord = await this.emailRepository.create({
      to: Array.isArray(emailData.to) ? emailData.to.join(',') : emailData.to,
      cc: emailData.cc ? (Array.isArray(emailData.cc) ? emailData.cc.join(',') : emailData.cc) : undefined,
      bcc: emailData.bcc ? (Array.isArray(emailData.bcc) ? emailData.bcc.join(',') : emailData.bcc) : undefined,
      subject: emailData.subject,
      templateType: emailData.templateType,
      templateData: emailData.templateData,
      priority: emailData.priority || EmailPriority.NORMAL,
      status: 'pending',
      userId: emailData.userId,
      orderId: emailData.orderId,
      retryCount: 0,
    });

    try {
      // Render template
      const { html, text } = await this.templateRenderer.render(
        emailData.templateType,
        emailData.templateData,
        language
      );

      // Send email via SMTP
      await this.transporter.sendMail({
        from: `"${emailConfig.from.name}" <${emailConfig.from.address}>`,
        to: emailData.to,
        cc: emailData.cc,
        bcc: emailData.bcc,
        subject: emailData.subject,
        html,
        text,
        priority: this.mapPriority(emailData.priority),
        attachments: emailData.attachments?.map(a => ({
          filename: a.filename,
          content: a.content,
          contentType: a.contentType,
        })),
      });

      // Mark as sent
      await this.emailRepository.markAsSent(emailRecord.id);

      return emailRecord;
    } catch (error: any) {
      // Mark as failed
      await this.emailRepository.markAsFailed(emailRecord.id, error.message);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  /**
   * Send email with retry logic
   */
  async sendEmailWithRetry(emailData: SendEmailDTO, maxRetries: number = 3): Promise<Email> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.sendEmail(emailData);
      } catch (error: any) {
        lastError = error;
        console.error(`Email send attempt ${attempt} failed:`, error.message);

        if (attempt < maxRetries) {
          // Wait before retry (exponential backoff)
          const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError || new Error('Failed to send email after retries');
  }

  /**
   * Queue email for later sending
   */
  async queueEmail(emailData: SendEmailDTO): Promise<Email> {
    const language = emailData.language || 'en';

    return await this.emailRepository.create({
      to: Array.isArray(emailData.to) ? emailData.to.join(',') : emailData.to,
      cc: emailData.cc ? (Array.isArray(emailData.cc) ? emailData.cc.join(',') : emailData.cc) : undefined,
      bcc: emailData.bcc ? (Array.isArray(emailData.bcc) ? emailData.bcc.join(',') : emailData.bcc) : undefined,
      subject: emailData.subject,
      templateType: emailData.templateType,
      templateData: emailData.templateData,
      priority: emailData.priority || EmailPriority.NORMAL,
      status: 'queued',
      userId: emailData.userId,
      orderId: emailData.orderId,
      retryCount: 0,
    });
  }

  /**
   * Process email queue
   */
  async processQueue(batchSize: number = 10): Promise<void> {
    const queuedEmails = await this.emailRepository.findByStatus('queued', batchSize);

    for (const email of queuedEmails) {
      try {
        // Update status to pending
        await this.emailRepository.updateStatus(email.id, 'pending');

        // Send email
        const { html, text } = await this.templateRenderer.render(
          email.templateType,
          email.templateData,
          'en' // Extract from templateData if needed
        );

        await this.transporter.sendMail({
          from: `"${emailConfig.from.name}" <${emailConfig.from.address}>`,
          to: email.to,
          cc: email.cc,
          bcc: email.bcc,
          subject: email.subject,
          html,
          text,
          priority: this.mapPriority(email.priority),
        });

        // Mark as sent
        await this.emailRepository.markAsSent(email.id);
      } catch (error: any) {
        // Mark as failed
        await this.emailRepository.markAsFailed(email.id, error.message);
      }
    }
  }

  /**
   * Retry failed emails
   */
  async retryFailedEmails(): Promise<void> {
    const failedEmails = await this.emailRepository.findFailedForRetry(emailConfig.limits.maxRetries);

    for (const email of failedEmails) {
      try {
        // Update status to pending
        await this.emailRepository.updateStatus(email.id, 'pending');

        // Render and send
        const { html, text } = await this.templateRenderer.render(
          email.templateType,
          email.templateData,
          'en'
        );

        await this.transporter.sendMail({
          from: `"${emailConfig.from.name}" <${emailConfig.from.address}>`,
          to: email.to,
          cc: email.cc,
          bcc: email.bcc,
          subject: email.subject,
          html,
          text,
          priority: this.mapPriority(email.priority),
        });

        // Mark as sent
        await this.emailRepository.markAsSent(email.id);
      } catch (error: any) {
        // Increment retry count
        await this.emailRepository.markAsFailed(email.id, error.message);
      }
    }
  }

  /**
   * Get email statistics
   */
  async getStatistics(startDate?: Date, endDate?: Date): Promise<any> {
    return await this.emailRepository.getStatistics(startDate, endDate);
  }

  /**
   * Map priority to nodemailer priority
   */
  private mapPriority(priority?: EmailPriority): 'high' | 'normal' | 'low' {
    switch (priority) {
      case EmailPriority.HIGH:
        return 'high';
      case EmailPriority.LOW:
        return 'low';
      default:
        return 'normal';
    }
  }

  /**
   * Test email configuration
   */
  async sendTestEmail(to: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: `"${emailConfig.from.name}" <${emailConfig.from.address}>`,
        to,
        subject: 'Test Email from Portfolio E-Commerce',
        html: '<h1>Test Email</h1><p>Your email configuration is working correctly!</p>',
        text: 'Test Email - Your email configuration is working correctly!',
      });
    } catch (error: any) {
      throw new Error(`Test email failed: ${error.message}`);
    }
  }

  /**
   * Cleanup old emails
   */
  async cleanupOldEmails(days: number = 90): Promise<number> {
    return await this.emailRepository.deleteOlderThan(days);
  }
}
