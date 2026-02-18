import { EmailService } from './EmailService';
import { ContactFormDTO, SendEmailDTO } from '../models/dto/emailDTO';
import { EmailTemplateType, EmailPriority } from '../config/emailConfig';
import { ContactMessageRepository } from '../integration/repositories/ContactMessageRepository';
import ContactMessage from '../models/sequelize/ContactMessage';

export class ContactService {
  private emailService: EmailService;
  private contactMessageRepository: ContactMessageRepository;

  constructor() {
    this.emailService = new EmailService();
    this.contactMessageRepository = new ContactMessageRepository();
  }

  /**
   * Process contact form submission
   */
  async processContactForm(data: ContactFormDTO): Promise<{ success: boolean; messageId: string }> {
    try {
      // Save contact message to database
      const contactMessage = await this.contactMessageRepository.create({
        name: data.name,
        email: data.email,
        phone: data.phone,
        subject: data.subject,
        message: data.message,
        language: data.language,
        status: 'new',
        isRead: false,
      });

      // Send confirmation email to user
      await this.sendUserConfirmation(data);

      // Send notification email to admin
      await this.sendAdminNotification(data);

      return { success: true, messageId: contactMessage.id };
    } catch (error: any) {
      console.error('Failed to process contact form:', error);
      throw new Error(`Failed to process contact form: ${error.message}`);
    }
  }

  /**
   * Send confirmation email to user
   */
  private async sendUserConfirmation(data: ContactFormDTO): Promise<void> {
    const subject =
      data.language === 'sv'
        ? 'Vi har mottagit ditt meddelande'
        : 'We have received your message';

    const emailData: SendEmailDTO = {
      to: data.email,
      subject,
      templateType: EmailTemplateType.CONTACT_FORM,
      templateData: {
        name: data.name,
        subject: data.subject,
        message: data.message,
        phone: data.phone,
        language: data.language,
        submittedAt: new Date(),
      },
      priority: EmailPriority.NORMAL,
      language: data.language,
    };

    await this.emailService.sendEmail(emailData);
  }

  /**
   * Send notification email to admin
   */
  private async sendAdminNotification(data: ContactFormDTO): Promise<void> {
    const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER;

    if (!adminEmail) {
      console.warn('Admin email not configured, skipping admin notification');
      return;
    }

    const subject = `New Contact Form Submission: ${data.subject}`;

    const emailData: SendEmailDTO = {
      to: adminEmail,
      subject,
      templateType: EmailTemplateType.CONTACT_FORM_ADMIN,
      templateData: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        subject: data.subject,
        message: data.message,
        language: data.language,
        submittedAt: new Date(),
        replyToEmail: data.email,
      },
      priority: EmailPriority.HIGH,
      language: 'en', // Admin emails always in English
    };

    await this.emailService.sendEmail(emailData);
  }

  /**
   * Send custom email response to contact form submission
   */
  async sendCustomResponse(
    to: string,
    subject: string,
    message: string,
    language: 'en' | 'sv' = 'en',
    originalMessageData?: {
      originalSubject: string;
      originalMessage: string;
      submittedAt: Date;
    }
  ): Promise<void> {
    const emailData: SendEmailDTO = {
      to,
      subject,
      templateType: EmailTemplateType.CONTACT_FORM,
      templateData: {
        name: to.split('@')[0], // Extract name from email
        message,
        isCustomResponse: true,
        language,
        ...originalMessageData,
      },
      priority: EmailPriority.NORMAL,
      language,
    };

    await this.emailService.sendEmail(emailData);
  }

  /**
   * Get all contact messages with filtering (Admin only)
   */
  async getAllMessages(options: {
    limit?: number;
    offset?: number;
    status?: 'new' | 'read' | 'replied' | 'archived';
    isRead?: boolean;
  }): Promise<{ messages: ContactMessage[]; total: number }> {
    return await this.contactMessageRepository.findAllWithFilters(options);
  }

  /**
   * Get a single contact message by ID (Admin only)
   */
  async getMessageById(id: string): Promise<ContactMessage | null> {
    const message = await this.contactMessageRepository.findById(id);

    // Automatically mark as read when admin views
    if (message && !message.isRead) {
      await this.contactMessageRepository.markAsRead(id);
      return await this.contactMessageRepository.findById(id);
    }

    return message;
  }

  /**
   * Mark message as read (Admin only)
   */
  async markMessageAsRead(id: string): Promise<ContactMessage | null> {
    return await this.contactMessageRepository.markAsRead(id);
  }

  /**
   * Update message status (Admin only)
   */
  async updateMessageStatus(
    id: string,
    status: 'new' | 'read' | 'replied' | 'archived'
  ): Promise<ContactMessage | null> {
    return await this.contactMessageRepository.updateStatus(id, status);
  }

  /**
   * Add admin notes to message (Admin only)
   */
  async addAdminNotes(id: string, notes: string): Promise<ContactMessage | null> {
    return await this.contactMessageRepository.addAdminNotes(id, notes);
  }

  /**
   * Send reply to contact message and mark as replied (Admin only)
   */
  async replyToMessage(
    messageId: string,
    replySubject: string,
    replyMessage: string,
    adminId: string
  ): Promise<void> {
    // Get the original message
    const message = await this.contactMessageRepository.findById(messageId);
    if (!message) {
      throw new Error('Contact message not found');
    }

    // Send reply email with original message details
    await this.sendCustomResponse(
      message.email,
      replySubject,
      replyMessage,
      message.language,
      {
        originalSubject: message.subject,
        originalMessage: message.message,
        submittedAt: message.createdAt,
      }
    );

    // Mark message as replied
    await this.contactMessageRepository.markAsReplied(messageId, adminId);
  }

  /**
   * Get contact message statistics (Admin only)
   */
  async getStatistics(): Promise<{
    total: number;
    new: number;
    read: number;
    replied: number;
    archived: number;
    unread: number;
  }> {
    return await this.contactMessageRepository.getStatistics();
  }

  /**
   * Search contact messages (Admin only)
   */
  async searchMessages(keyword: string): Promise<ContactMessage[]> {
    return await this.contactMessageRepository.search(keyword);
  }

  /**
   * Delete message (Admin only)
   */
  async deleteMessage(id: string): Promise<boolean> {
    const deleted = await this.contactMessageRepository.delete(id);
    return deleted > 0;
  }
}
