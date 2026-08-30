import { BaseDAO } from '../dao/BaseDAO';
import NewsletterCampaign from '../../models/sequelize/NewsletterCampaign';
import NewsletterCampaignStats from '../../models/sequelize/NewsletterCampaignStats';
import User from '../../models/sequelize/User';
import { CampaignStatus } from '../../models/sequelize/NewsletterCampaign';
import { Op } from 'sequelize';

export class NewsletterCampaignRepository extends BaseDAO<NewsletterCampaign> {
  constructor() {
    super(NewsletterCampaign);
  }

  async findAllWithStats(options?: {
    status?: CampaignStatus;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ campaigns: NewsletterCampaign[]; total: number }> {
    const where: any = {};
    if (options?.status) {
      where.status = options.status;
    }
    if (options?.search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${options.search}%` } },
        { subject: { [Op.iLike]: `%${options.search}%` } },
      ];
    }

    const { count, rows } = await this.model.findAndCountAll({
      where,
      include: [
        {
          model: NewsletterCampaignStats,
          as: 'stats',
        },
        {
          model: User,
          as: 'sentByAdmin',
          attributes: ['id', 'email', 'firstName', 'lastName'],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: options?.limit || 20,
      offset: options?.offset || 0,
    });

    return { campaigns: rows, total: count };
  }

  async findByIdWithStats(id: string): Promise<NewsletterCampaign | null> {
    return await this.model.findByPk(id, {
      include: [
        {
          model: NewsletterCampaignStats,
          as: 'stats',
        },
        {
          model: User,
          as: 'sentByAdmin',
          attributes: ['id', 'email', 'firstName', 'lastName'],
        },
      ],
    });
  }

  async getRecentCampaigns(limit: number = 5): Promise<NewsletterCampaign[]> {
    return await this.model.findAll({
      where: {
        status: ['sent', 'sending', 'scheduled'] as any,
      },
      include: [
        {
          model: NewsletterCampaignStats,
          as: 'stats',
        },
      ],
      order: [['createdAt', 'DESC']],
      limit,
    });
  }
}
