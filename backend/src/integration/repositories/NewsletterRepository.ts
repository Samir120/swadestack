import NewsletterSubscriber, { NewsletterSubscriberAttributes } from '../../models/sequelize/NewsletterSubscriber';
import { Op } from 'sequelize';
import crypto from 'crypto';

export class NewsletterRepository {
  /**
   * Create newsletter subscriber
   */
  async create(subscriberData: Partial<NewsletterSubscriberAttributes>): Promise<NewsletterSubscriber> {
    // Generate tokens
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const unsubscribeToken = crypto.randomBytes(32).toString('hex');

    return await NewsletterSubscriber.create({
      ...subscriberData,
      verificationToken,
      unsubscribeToken,
    } as any);
  }

  /**
   * Find subscriber by email
   */
  async findByEmail(email: string): Promise<NewsletterSubscriber | null> {
    return await NewsletterSubscriber.findOne({
      where: { email },
    });
  }

  /**
   * Find subscriber by ID
   */
  async findById(id: number): Promise<NewsletterSubscriber | null> {
    return await NewsletterSubscriber.findByPk(id);
  }

  /**
   * Find subscriber by verification token
   */
  async findByVerificationToken(token: string): Promise<NewsletterSubscriber | null> {
    return await NewsletterSubscriber.findOne({
      where: { verificationToken: token },
    });
  }

  /**
   * Find subscriber by unsubscribe token
   */
  async findByUnsubscribeToken(token: string): Promise<NewsletterSubscriber | null> {
    return await NewsletterSubscriber.findOne({
      where: { unsubscribeToken: token },
    });
  }

  /**
   * Verify subscriber email
   */
  async verify(token: string): Promise<NewsletterSubscriber | null> {
    const subscriber = await this.findByVerificationToken(token);
    if (!subscriber) return null;

    await subscriber.update({
      verifiedAt: new Date(),
      verificationToken: undefined,
    });

    return subscriber;
  }

  /**
   * Unsubscribe by token
   */
  async unsubscribe(token: string): Promise<NewsletterSubscriber | null> {
    const subscriber = await this.findByUnsubscribeToken(token);
    if (!subscriber) return null;

    await subscriber.update({
      isActive: false,
      unsubscribedAt: new Date(),
    });

    return subscriber;
  }

  /**
   * Resubscribe
   */
  async resubscribe(email: string): Promise<NewsletterSubscriber | null> {
    const subscriber = await this.findByEmail(email);
    if (!subscriber) return null;

    await subscriber.update({
      isActive: true,
      unsubscribedAt: undefined,
    });

    return subscriber;
  }

  /**
   * Get active subscribers
   */
  async findActive(options?: {
    language?: 'en' | 'sv';
    verifiedOnly?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<NewsletterSubscriber[]> {
    const whereClause: any = {
      isActive: true,
    };

    if (options?.language) {
      whereClause.language = options.language;
    }

    if (options?.verifiedOnly) {
      whereClause.verifiedAt = {
        [Op.not]: null,
      };
    }

    return await NewsletterSubscriber.findAll({
      where: whereClause,
      limit: options?.limit,
      offset: options?.offset,
      order: [['createdAt', 'DESC']],
    });
  }

  /**
   * Get subscriber count
   */
  async getCount(options?: {
    language?: 'en' | 'sv';
    verifiedOnly?: boolean;
    activeOnly?: boolean;
  }): Promise<number> {
    const whereClause: any = {};

    if (options?.language) {
      whereClause.language = options.language;
    }

    if (options?.verifiedOnly) {
      whereClause.verifiedAt = {
        [Op.not]: null,
      };
    }

    if (options?.activeOnly) {
      whereClause.isActive = true;
    }

    return await NewsletterSubscriber.count({ where: whereClause });
  }

  /**
   * Update subscriber preferences
   */
  async updatePreferences(id: number, preferences: object): Promise<NewsletterSubscriber | null> {
    const subscriber = await this.findById(id);
    if (!subscriber) return null;

    await subscriber.update({ preferences });
    return subscriber;
  }

  /**
   * Update subscriber language
   */
  async updateLanguage(id: number, language: 'en' | 'sv'): Promise<NewsletterSubscriber | null> {
    const subscriber = await this.findById(id);
    if (!subscriber) return null;

    await subscriber.update({ language });
    return subscriber;
  }

  /**
   * Delete subscriber
   */
  async delete(id: number): Promise<boolean> {
    const result = await NewsletterSubscriber.destroy({
      where: { id },
    });
    return result > 0;
  }

  /**
   * Get statistics
   */
  async getStatistics(): Promise<any> {
    const [total, active, verified, english, swedish] = await Promise.all([
      NewsletterSubscriber.count(),
      NewsletterSubscriber.count({ where: { isActive: true } }),
      NewsletterSubscriber.count({ where: { verifiedAt: { [Op.not]: undefined } } }),
      NewsletterSubscriber.count({ where: { language: 'en', isActive: true } }),
      NewsletterSubscriber.count({ where: { language: 'sv', isActive: true } }),
    ]);

    return {
      total,
      active,
      verified,
      byLanguage: {
        en: english,
        sv: swedish,
      },
      verificationRate: total > 0 ? (verified / total) * 100 : 0,
    };
  }

  /**
   * Batch get subscribers for newsletter
   */
  async getBatch(options: {
    language?: 'en' | 'sv';
    verifiedOnly?: boolean;
    batchSize: number;
    offset: number;
  }): Promise<NewsletterSubscriber[]> {
    return await this.findActive({
      language: options.language,
      verifiedOnly: options.verifiedOnly,
      limit: options.batchSize,
      offset: options.offset,
    });
  }
}
