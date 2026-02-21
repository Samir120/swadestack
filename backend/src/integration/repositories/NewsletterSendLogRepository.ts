import { BaseDAO } from '../dao/BaseDAO';
import NewsletterSendLog from '../../models/sequelize/NewsletterSendLog';
import NewsletterSubscriber from '../../models/sequelize/NewsletterSubscriber';

export class NewsletterSendLogRepository extends BaseDAO<NewsletterSendLog> {
  constructor() {
    super(NewsletterSendLog);
  }

  async findByCampaign(campaignId: string, options?: {
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ logs: NewsletterSendLog[]; total: number }> {
    const where: any = { campaignId };
    if (options?.status) {
      where.status = options.status;
    }

    const { count, rows } = await this.model.findAndCountAll({
      where,
      include: [
        {
          model: NewsletterSubscriber,
          as: 'subscriber',
          attributes: ['id', 'email', 'firstName', 'lastName'],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: options?.limit || 50,
      offset: options?.offset || 0,
    });

    return { logs: rows, total: count };
  }

  async createBatch(logs: Array<{
    campaignId: string;
    subscriberId: string;
    email: string;
    status?: string;
  }>): Promise<NewsletterSendLog[]> {
    return await this.model.bulkCreate(logs as any);
  }

  async getStatsForCampaign(campaignId: string): Promise<{
    totalSent: number;
    totalDelivered: number;
    totalOpened: number;
    totalClicked: number;
    totalBounced: number;
    totalFailed: number;
  }> {
    const results = await this.model.findAll({
      where: { campaignId } as any,
      attributes: [
        [this.model.sequelize!.fn('COUNT', this.model.sequelize!.col('id')), 'total'],
        'status',
      ],
      group: ['status'],
      raw: true,
    }) as any[];

    const statusCounts: Record<string, number> = {};
    for (const row of results) {
      statusCounts[row.status] = parseInt(row.total) || 0;
    }

    return {
      totalSent: (statusCounts['sent'] || 0) + (statusCounts['delivered'] || 0) + (statusCounts['opened'] || 0) + (statusCounts['clicked'] || 0),
      totalDelivered: (statusCounts['delivered'] || 0) + (statusCounts['opened'] || 0) + (statusCounts['clicked'] || 0),
      totalOpened: statusCounts['opened'] || 0,
      totalClicked: statusCounts['clicked'] || 0,
      totalBounced: statusCounts['bounced'] || 0,
      totalFailed: statusCounts['failed'] || 0,
    };
  }
}
