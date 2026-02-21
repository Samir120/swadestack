import { NewsletterRepository } from '../integration/repositories/NewsletterRepository'
import { NewsletterSegmentMemberRepository } from '../integration/repositories/NewsletterSegmentMemberRepository';
import { EmailService } from './EmailService';
import {
  NewsletterSubscriptionDTO,
  NewsletterBroadcastDTO,
  SendEmailDTO,
} from '../models/dto/emailDTO';
import { EmailTemplateType, EmailPriority } from '../config/emailConfig';
import NewsletterSubscriber from '../models/sequelize/NewsletterSubscriber';
import User from '../models/sequelize/User';
import {
  AdminSubscriberListDTO,
  AdminSubscriberDetailDTO,
  AdminSubscriberListQueryDTO,
  CreateSubscriberDTO,
  UpdateSubscriberDTO,
  NewsletterDashboardDTO,
} from '../models/dto/NewsletterAdminDTO';
import { Op } from 'sequelize';
import crypto from 'crypto';

export class NewsletterService {
  private newsletterRepository: NewsletterRepository;
  private segmentMemberRepository: NewsletterSegmentMemberRepository;
  private emailService: EmailService;

  constructor() {
    this.newsletterRepository = new NewsletterRepository();
    this.segmentMemberRepository = new NewsletterSegmentMemberRepository();
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
      // Resubscribe — set pending until re-verified
      const resubscribed = await this.newsletterRepository.resubscribe(data.email);
      if (!resubscribed) {
        throw new Error('Failed to resubscribe');
      }

      // Update name from User table if subscriber has no name
      if (!resubscribed.firstName) {
        const user = await User.findOne({ where: { email: data.email } });
        if (user) {
          await resubscribed.update({
            firstName: user.firstName,
            lastName: user.lastName,
          });
        }
      }

      // Send verification email before activating
      await this.sendSubscriptionConfirmation(resubscribed);
      return resubscribed;
    }

    // Look up User table to auto-populate name
    let firstName = data.firstName;
    let lastName = data.lastName;
    if (!firstName) {
      const user = await User.findOne({ where: { email: data.email } });
      if (user) {
        firstName = user.firstName;
        lastName = lastName || user.lastName;
      }
    }

    // Create new subscriber (pending until email verified)
    const subscriber = await this.newsletterRepository.create({
      email: data.email,
      firstName,
      lastName,
      language: data.language || 'en',
      preferences: data.preferences,
      isActive: false,
      status: 'pending_confirmation',
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
   * Check subscription status by email
   */
  async checkStatus(email: string): Promise<{ isSubscribed: boolean }> {
    const subscriber = await this.newsletterRepository.findByEmail(email);
    return { isSubscribed: !!subscriber && subscriber.isActive };
  }

  /**
   * Unsubscribe by email (public endpoint)
   */
  async unsubscribeByEmail(email: string): Promise<void> {
    const subscriber = await this.newsletterRepository.findByEmail(email);

    if (!subscriber) {
      throw new Error('Email not found in newsletter subscribers');
    }

    if (!subscriber.isActive) {
      throw new Error('Email is already unsubscribed');
    }

    await subscriber.update({
      isActive: false,
      status: 'unsubscribed',
      unsubscribedAt: new Date(),
    });
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

  // ==================== Admin Methods ====================

  /**
   * Get subscribers with admin filtering, search, sort, and pagination
   */
  async getSubscribersAdmin(query: AdminSubscriberListQueryDTO): Promise<{ subscribers: AdminSubscriberListDTO[]; total: number }> {
    const page = query.page || 1;
    const pageSize = query.pageSize || 25;
    const offset = (page - 1) * pageSize;

    const where: any = {};

    if (query.search) {
      where[Op.or] = [
        { email: { [Op.iLike]: `%${query.search}%` } },
        { firstName: { [Op.iLike]: `%${query.search}%` } },
        { lastName: { [Op.iLike]: `%${query.search}%` } },
      ];
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.language) {
      where.language = query.language;
    }

    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder || 'desc';

    const { count, rows } = await NewsletterSubscriber.findAndCountAll({
      where,
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: pageSize,
      offset,
    });

    const subscribers = rows.map(s => this.mapToAdminSubscriberListDTO(s));
    return { subscribers, total: count };
  }

  /**
   * Get single subscriber detail for admin
   */
  async getSubscriberDetail(id: string): Promise<AdminSubscriberDetailDTO | null> {
    const subscriber = await NewsletterSubscriber.findByPk(id);
    if (!subscriber) return null;

    const segmentMemberships = await this.segmentMemberRepository.getSubscriberSegments(id);
    const segments = segmentMemberships.map((m: any) => ({
      id: m.segment.id,
      name: m.segment.name,
    }));

    return {
      ...this.mapToAdminSubscriberListDTO(subscriber),
      userId: subscriber.userId,
      preferences: subscriber.preferences,
      segments,
      updatedAt: subscriber.updatedAt,
    };
  }

  /**
   * Create subscriber from admin panel
   */
  async createSubscriberAdmin(data: CreateSubscriberDTO): Promise<AdminSubscriberListDTO> {
    const existing = await this.newsletterRepository.findByEmail(data.email);
    if (existing) {
      throw new Error('Email is already subscribed');
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const unsubscribeToken = crypto.randomBytes(32).toString('hex');

    const subscriber = await NewsletterSubscriber.create({
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      language: data.language || 'en',
      status: data.status || 'active',
      source: data.source || 'admin_manual',
      isActive: data.status !== 'unsubscribed',
      verifiedAt: new Date(),
      verificationToken,
      unsubscribeToken,
    } as any);

    return this.mapToAdminSubscriberListDTO(subscriber);
  }

  /**
   * Update subscriber from admin panel
   */
  async updateSubscriberAdmin(id: string, data: UpdateSubscriberDTO): Promise<AdminSubscriberListDTO | null> {
    const subscriber = await NewsletterSubscriber.findByPk(id);
    if (!subscriber) return null;

    const updateData: any = {};
    if (data.firstName !== undefined) updateData.firstName = data.firstName;
    if (data.lastName !== undefined) updateData.lastName = data.lastName;
    if (data.language !== undefined) updateData.language = data.language;
    if (data.status !== undefined) {
      updateData.status = data.status;
      updateData.isActive = data.status === 'active';
      if (data.status === 'unsubscribed') {
        updateData.unsubscribedAt = new Date();
      }
    }

    await subscriber.update(updateData);
    return this.mapToAdminSubscriberListDTO(subscriber);
  }

  /**
   * Delete subscriber from admin panel
   */
  async deleteSubscriberAdmin(id: string): Promise<boolean> {
    const result = await NewsletterSubscriber.destroy({ where: { id } });
    return result > 0;
  }

  /**
   * Get dashboard stats for admin
   */
  async getDashboardStats(): Promise<Omit<NewsletterDashboardDTO, 'recentCampaigns'>> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [total, active, unsubscribed, newThisMonth] = await Promise.all([
      NewsletterSubscriber.count(),
      NewsletterSubscriber.count({ where: { status: 'active' } }),
      NewsletterSubscriber.count({ where: { status: 'unsubscribed' } }),
      NewsletterSubscriber.count({
        where: {
          createdAt: { [Op.gte]: startOfMonth },
        },
      }),
    ]);

    // Generate subscriber growth data for the last 30 days
    const subscriberGrowth: Array<{ date: string; count: number }> = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(23, 59, 59, 999);

      const count = await NewsletterSubscriber.count({
        where: {
          createdAt: { [Op.lte]: date },
          status: 'active',
        },
      });

      subscriberGrowth.push({
        date: date.toISOString().split('T')[0],
        count,
      });
    }

    return {
      totalSubscribers: total,
      activeSubscribers: active,
      unsubscribedCount: unsubscribed,
      newThisMonth,
      avgOpenRate: 0,
      avgClickRate: 0,
      subscriberGrowth,
    };
  }

  /**
   * Export subscribers as CSV string
   */
  async exportSubscribersCSV(query?: { status?: string; language?: string }): Promise<string> {
    const where: any = {};
    if (query?.status) where.status = query.status;
    if (query?.language) where.language = query.language;

    const subscribers = await NewsletterSubscriber.findAll({
      where,
      order: [['createdAt', 'DESC']],
    });

    const headers = ['Email', 'First Name', 'Last Name', 'Status', 'Language', 'Source', 'Verified At', 'Created At'];
    const rows = subscribers.map(s => [
      s.email,
      s.firstName || '',
      s.lastName || '',
      s.status,
      s.language,
      s.source || '',
      s.verifiedAt ? s.verifiedAt.toISOString() : '',
      s.createdAt.toISOString(),
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    return csv;
  }

  private mapToAdminSubscriberListDTO(subscriber: NewsletterSubscriber): AdminSubscriberListDTO {
    return {
      id: subscriber.id,
      email: subscriber.email,
      firstName: subscriber.firstName,
      lastName: subscriber.lastName,
      status: subscriber.status,
      source: subscriber.source,
      language: subscriber.language,
      isActive: subscriber.isActive,
      verifiedAt: subscriber.verifiedAt,
      unsubscribedAt: subscriber.unsubscribedAt,
      createdAt: subscriber.createdAt,
    };
  }
}
