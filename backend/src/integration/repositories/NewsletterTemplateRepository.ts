import { BaseDAO } from '../dao/BaseDAO';
import NewsletterTemplate from '../../models/sequelize/NewsletterTemplate';

export class NewsletterTemplateRepository extends BaseDAO<NewsletterTemplate> {
  constructor() {
    super(NewsletterTemplate);
  }

  async findAllOrdered(): Promise<NewsletterTemplate[]> {
    return this.findAll({
      order: [
        ['isDefault', 'DESC'],
        ['updatedAt', 'DESC'],
      ],
    });
  }

  async findDefault(): Promise<NewsletterTemplate | null> {
    return this.findOne({ isDefault: true } as any);
  }

  async clearDefault(): Promise<void> {
    await this.model.update(
      { isDefault: false },
      { where: { isDefault: true } as any }
    );
  }

  async incrementUsageCount(id: string): Promise<void> {
    await this.model.increment('usageCount', {
      where: { id } as any,
    });
  }
}

export default new NewsletterTemplateRepository();
