import { Op } from 'sequelize';
import { BaseDAO } from '../dao/BaseDAO';
import NotificationBanner from '../../models/sequelize/NotificationBanner';

export class NotificationBannersRepository extends BaseDAO<NotificationBanner> {
  constructor() {
    super(NotificationBanner);
  }

  async findAllBanners(): Promise<NotificationBanner[]> {
    return await this.model.findAll({
      order: [
        ['priority', 'DESC'],
        ['createdAt', 'DESC'],
      ],
    });
  }

  async findActiveBanner(): Promise<NotificationBanner | null> {
    const now = new Date();
    return await this.model.findOne({
      where: {
        isActive: true,
        [Op.and]: [
          {
            [Op.or]: [
              { startDate: null },
              { startDate: { [Op.lte]: now } },
            ],
          },
          {
            [Op.or]: [
              { endDate: null },
              { endDate: { [Op.gte]: now } },
            ],
          },
        ],
      },
      order: [['priority', 'DESC']],
    });
  }

  async incrementStat(
    id: string,
    field: 'impressions' | 'clicks' | 'dismissals'
  ): Promise<void> {
    await this.model.increment(field, { where: { id } as any });
  }

  async toggleActive(id: string): Promise<NotificationBanner | null> {
    const item = await this.findById(id);
    if (!item) return null;

    item.isActive = !item.isActive;
    await item.save();
    return item;
  }
}

export default NotificationBannersRepository;
