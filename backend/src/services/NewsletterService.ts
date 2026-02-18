import { NewsletterRepository } from '../integration/repositories/NewsletterRepository'
import { EmailService } from './EmailService';
import {
  NewsletterSubscriptionDTO,
  NewsletterBroadcastDTO,
  SendEmailDTO,
} from '../models/dto/emailDTO';
import { EmailTemplateType, EmailPriority } from '../config/emailConfig';
import NewsletterSubscriber from '../models/sequelize/NewsletterSubscriber';

export class NewsletterService {
  private newsletterRepository: NewsletterRepository;
  private emailService: EmailService;

  constructor() {
    this.newsletterRepository = new NewsletterRepository();
    this.emailService = new EmailService();
  }

  /**
   * Subscribe to newsletter
   */
  async subscribe(data: NewsletterSubscriptionDTO): Promise<NewsletterSubscriber> {
    // Check if already subscribed
    const existing = await this.newsletterRepository.findByEmail(data.email);

    if (existing) {
      if (existing.isActive) {
        throw new Error('Email is already subscribed to the newsletter');
      }
      // Resubscribe
      const resubscribed = await this.newsletterRepository.resubscribe(data.email);
      if (!resubscribed) {
        throw new Error('Failed to resubscribe');
      }

      // Send subscription confirmation
      await this.sendSubscriptionConfirmation(resubscribed);
      return resubscribed;
    }

    // Create new subscriber
    const subscriber = await this.newsletterRepository.create({
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      language: data.language || 'en',
      preferences: data.preferences,
      isActive: true,
    });

    // Send subscription confirmation
    await this.sendSubscriptionConfirmation(subscriber);

    return subscriber;
  }

  /**
   * Send subscription confirmation email
   */
  private async sendSubscriptionConfirmation(subscriber: NewsletterSubscriber): Promise<void> {
    const verificationUrl = `${process.env.FRONTEND_URL}/newsletter/verify/${subscriber.verificationToken}`;

    const emailData: SendEmailDTO = {
      to: subscriber.email,
      subject:
        subscriber.language === 'sv'
          ? 'Bekräfta din prenumeration'
          : 'Confirm Your Newsletter Subscription',
      templateType: EmailTemplateType.NEWSLETTER_SUBSCRIPTION,
      templateData: {
        firstName: subscriber.firstName || 'Subscriber',
        verificationUrl,
        language: subscriber.language,
      },
      priority: EmailPriority.NORMAL,
      language: subscriber.language,
    };

    await this.emailService.sendEmail(emailData);
  }

  /**
   * Verify email subscription
   */
  async verifySubscription(token: string): Promise<NewsletterSubscriber> {
    const subscriber = await this.newsletterRepository.verify(token);

    if (!subscriber) {
      throw new Error('Invalid or expired verification token');
    }

    return subscriber;
  }

  /**
   * Unsubscribe from newsletter
   */
  async unsubscribe(token: string): Promise<NewsletterSubscriber> {
    const subscriber = await this.newsletterRepository.unsubscribe(token);

    if (!subscriber) {
      throw new Error('Invalid unsubscribe token');
    }

    return subscriber;
  }

  /**
   * Broadcast newsletter to all active subscribers
   */
  async broadcast(data: NewsletterBroadcastDTO): Promise<{ sent: number; failed: number }> {
    let sent = 0;
    let failed = 0;

    // Get filter options
    const filter = {
      language: data.segmentFilter?.language,
      verifiedOnly: data.segmentFilter?.verifiedOnly ?? true,
    };

    // Get total count
    const totalSubscribers = await this.newsletterRepository.getCount(filter);

    // Process in batches
    const batchSize = 50;
    let offset = 0;

    while (offset < totalSubscribers) {
      const batch = await this.newsletterRepository.getBatch({
        ...filter,
        batchSize,
        offset,
      });

      // Send emails to batch
      for (const subscriber of batch) {
        try {
          const language = subscriber.language;
          const unsubscribeUrl = `${process.env.FRONTEND_URL}/newsletter/unsubscribe/${subscriber.unsubscribeToken}`;

          const emailData: SendEmailDTO = {
            to: subscriber.email,
            subject: data.subject[language],
            templateType: data.templateType,
            templateData: {
              ...data.templateData[language],
              firstName: subscriber.firstName || 'Subscriber',
              unsubscribeUrl,
              language,
            },
            priority: data.priority || EmailPriority.NORMAL,
            language,
          };

          await this.emailService.queueEmail(emailData);
          sent++;
        } catch (error) {
          console.error(`Failed to queue email for ${subscriber.email}:`, error);
          failed++;
        }
      }

      offset += batchSize;

      // Process the queue after each batch
      await this.emailService.processQueue(batchSize);
    }

    return { sent, failed };
  }

  /**
   * Send targeted newsletter to specific language group
   */
  async sendTargeted(
    language: 'en' | 'sv',
    subject: string,
    templateType: EmailTemplateType,
    templateData: any
  ): Promise<{ sent: number; failed: number }> {
    return await this.broadcast({
      subject: { en: subject, sv: subject },
      templateType,
      templateData: { en: templateData, sv: templateData },
      segmentFilter: { language, verifiedOnly: true },
    });
  }

  /**
   * Get newsletter statistics
   */
  async getStatistics(): Promise<any> {
    return await this.newsletterRepository.getStatistics();
  }

  /**
   * Update subscriber preferences
   */
  async updatePreferences(subscriberId: number, preferences: any): Promise<NewsletterSubscriber> {
    const subscriber = await this.newsletterRepository.updatePreferences(subscriberId, preferences);

    if (!subscriber) {
      throw new Error('Subscriber not found');
    }

    return subscriber;
  }

  /**
   * Update subscriber language
   */
  async updateLanguage(subscriberId: number, language: 'en' | 'sv'): Promise<NewsletterSubscriber> {
    const subscriber = await this.newsletterRepository.updateLanguage(subscriberId, language);

    if (!subscriber) {
      throw new Error('Subscriber not found');
    }

    return subscriber;
  }

  /**
   * Get subscriber by email
   */
  async getByEmail(email: string): Promise<NewsletterSubscriber | null> {
    return await this.newsletterRepository.findByEmail(email);
  }

  /**
   * Get all active subscribers
   */
  async getActiveSubscribers(options?: {
    language?: 'en' | 'sv';
    verifiedOnly?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<NewsletterSubscriber[]> {
    return await this.newsletterRepository.findActive(options);
  }

  /**
   * Delete subscriber
   */
  async deleteSubscriber(subscriberId: number): Promise<boolean> {
    return await this.newsletterRepository.delete(subscriberId);
  }
}
