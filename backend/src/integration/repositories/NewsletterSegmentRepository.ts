import { BaseDAO } from '../dao/BaseDAO';
import NewsletterSegment from '../../models/sequelize/NewsletterSegment';
import NewsletterSegmentMember from '../../models/sequelize/NewsletterSegmentMember';
import { sequelize } from '../../config/database';

export class NewsletterSegmentRepository extends BaseDAO<NewsletterSegment> {
  constructor() {
    super(NewsletterSegment);
  }

  async findAllWithCounts(): Promise<NewsletterSegment[]> {
    return await this.model.findAll({
      order: [['createdAt', 'DESC']],
    });
  }

  async findByName(name: string): Promise<NewsletterSegment | null> {
    return await this.findOne({ name } as any);
  }

  async updateSubscriberCount(segmentId: string): Promise<void> {
    const count = await NewsletterSegmentMember.count({
      where: { segmentId },
    });
    await this.model.update(
      { subscriberCount: count } as any,
      { where: { id: segmentId } as any }
    );
  }
}
