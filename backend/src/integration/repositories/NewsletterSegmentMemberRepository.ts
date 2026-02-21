import { BaseDAO } from '../dao/BaseDAO';
import NewsletterSegmentMember from '../../models/sequelize/NewsletterSegmentMember';
import NewsletterSubscriber from '../../models/sequelize/NewsletterSubscriber';
import NewsletterSegment from '../../models/sequelize/NewsletterSegment';

export class NewsletterSegmentMemberRepository extends BaseDAO<NewsletterSegmentMember> {
  constructor() {
    super(NewsletterSegmentMember);
  }

  async findBySegment(segmentId: string): Promise<NewsletterSegmentMember[]> {
    return await this.model.findAll({
      where: { segmentId } as any,
      include: [
        {
          model: NewsletterSubscriber,
          as: 'subscriber',
        },
      ],
      order: [['addedAt', 'DESC']],
    });
  }

  async addMembers(segmentId: string, subscriberIds: string[]): Promise<NewsletterSegmentMember[]> {
    const records = subscriberIds.map(subscriberId => ({
      segmentId,
      subscriberId,
      addedAt: new Date(),
    }));
    return await this.model.bulkCreate(records as any, {
      ignoreDuplicates: true,
    });
  }

  async removeMembers(segmentId: string, subscriberIds: string[]): Promise<number> {
    return await this.model.destroy({
      where: {
        segmentId,
        subscriberId: subscriberIds,
      } as any,
    });
  }

  async getSubscriberSegments(subscriberId: string): Promise<NewsletterSegmentMember[]> {
    return await this.model.findAll({
      where: { subscriberId } as any,
      include: [
        {
          model: NewsletterSegment,
          as: 'segment',
          attributes: ['id', 'name'],
        },
      ],
    });
  }
}
