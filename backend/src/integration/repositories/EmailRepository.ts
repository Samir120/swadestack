import Email, { EmailAttributes } from '../../models/sequelize/Email';
import { EmailTemplateType, EmailPriority } from '../../config/emailConfig';
import { Op } from 'sequelize';

export class EmailRepository {
  /**
   * Create email record
   */
  async create(emailData: Partial<EmailAttributes>): Promise<Email> {
    return await Email.create(emailData as any);
  }

  /**
   * Find email by ID
   */
  async findById(id: string): Promise<Email | null> {
    return await Email.findByPk(id);
  }

  /**
   * Find emails by status
   */
  async findByStatus(status: 'pending' | 'sent' | 'failed' | 'queued', limit?: number): Promise<Email[]> {
    return await Email.findAll({
      where: { status },
      limit,
      order: [
        ['priority', 'DESC'],
        ['createdAt', 'ASC'],
      ],
    });
  }

  /**
   * Find failed emails for retry
   */
  async findFailedForRetry(maxRetries: number = 3): Promise<Email[]> {
    return await Email.findAll({
      where: {
        status: 'failed',
        retryCount: {
          [Op.lt]: maxRetries,
        },
      },
      order: [
        ['priority', 'DESC'],
        ['failedAt', 'ASC'],
      ],
    });
  }

  /**
   * Update email status
   */
  async updateStatus(
    id: string,
    status: 'pending' | 'sent' | 'failed' | 'queued',
    additionalData?: Partial<EmailAttributes>
  ): Promise<Email | null> {
    const email = await this.findById(id);
    if (!email) return null;

    await email.update({
      status,
      ...additionalData,
    });

    return email;
  }

  /**
   * Mark email as sent
   */
  async markAsSent(id: string): Promise<Email | null> {
    return await this.updateStatus(id, 'sent', {
      sentAt: new Date(),
    });
  }

  /**
   * Mark email as failed
   */
  async markAsFailed(id: string, errorMessage: string): Promise<Email | null> {
    const email = await this.findById(id);
    if (!email) return null;

    return await this.updateStatus(id, 'failed', {
      failedAt: new Date(),
      errorMessage,
      retryCount: email.retryCount + 1,
    });
  }

  /**
   * Get emails by user
   */
  async findByUser(userId: string, limit?: number): Promise<Email[]> {
    return await Email.findAll({
      where: { userId },
      limit,
      order: [['createdAt', 'DESC']],
    });
  }

  /**
   * Get emails by order
   */
  async findByOrder(orderId: string): Promise<Email[]> {
    return await Email.findAll({
      where: { orderId },
      order: [['createdAt', 'DESC']],
    });
  }

  /**
   * Get email statistics
   */
  async getStatistics(startDate?: Date, endDate?: Date): Promise<any> {
    const whereClause: any = {};

    if (startDate && endDate) {
      whereClause.createdAt = {
        [Op.between]: [startDate, endDate],
      };
    }

    const [totalCount, sentCount, failedCount, pendingCount] = await Promise.all([
      Email.count({ where: whereClause }),
      Email.count({ where: { ...whereClause, status: 'sent' } }),
      Email.count({ where: { ...whereClause, status: 'failed' } }),
      Email.count({ where: { ...whereClause, status: 'pending' } }),
    ]);

    return {
      total: totalCount,
      sent: sentCount,
      failed: failedCount,
      pending: pendingCount,
      successRate: totalCount > 0 ? (sentCount / totalCount) * 100 : 0,
    };
  }

  /**
   * Delete old emails (cleanup)
   */
  async deleteOlderThan(days: number): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const result = await Email.destroy({
      where: {
        createdAt: {
          [Op.lt]: cutoffDate,
        },
        status: 'sent',
      },
    });

    return result;
  }

  /**
   * Get emails by template type
   */
  async findByTemplateType(templateType: EmailTemplateType, limit?: number): Promise<Email[]> {
    return await Email.findAll({
      where: { templateType },
      limit,
      order: [['createdAt', 'DESC']],
    });
  }
}
