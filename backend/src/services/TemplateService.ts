import { NewsletterTemplateRepository } from '../integration/repositories/NewsletterTemplateRepository';
import NewsletterTemplate from '../models/sequelize/NewsletterTemplate';

interface CreateTemplateDTO {
  name: string;
  globalStyles?: object;
  socialMediaConfig?: object;
  footerConfig?: object;
  contentBlocks?: object[];
}

interface UpdateTemplateDTO {
  name?: string;
  globalStyles?: object;
  socialMediaConfig?: object;
  footerConfig?: object;
  contentBlocks?: object[];
}

class TemplateService {
  private templateRepository: NewsletterTemplateRepository;

  constructor() {
    this.templateRepository = new NewsletterTemplateRepository();
  }

  async getTemplates(): Promise<NewsletterTemplate[]> {
    return this.templateRepository.findAllOrdered();
  }

  async getTemplateById(id: string): Promise<NewsletterTemplate | null> {
    return this.templateRepository.findById(id);
  }

  async createTemplate(data: CreateTemplateDTO): Promise<NewsletterTemplate> {
    return this.templateRepository.create(data);
  }

  async updateTemplate(id: string, data: UpdateTemplateDTO): Promise<NewsletterTemplate | null> {
    const [count, updated] = await this.templateRepository.update(id, data);
    if (count === 0) return null;
    return updated[0] || this.templateRepository.findById(id);
  }

  async deleteTemplate(id: string): Promise<boolean> {
    const template = await this.templateRepository.findById(id);
    if (!template) return false;
    if (template.isDefault) {
      throw new Error('Cannot delete the default template');
    }
    const count = await this.templateRepository.delete(id);
    return count > 0;
  }

  async duplicateTemplate(id: string): Promise<NewsletterTemplate | null> {
    const template = await this.templateRepository.findById(id);
    if (!template) return null;

    return this.templateRepository.create({
      name: `${template.name} (Copy)`,
      globalStyles: template.globalStyles,
      socialMediaConfig: template.socialMediaConfig,
      footerConfig: template.footerConfig,
      contentBlocks: template.contentBlocks,
    });
  }

  async setDefault(id: string): Promise<NewsletterTemplate | null> {
    const template = await this.templateRepository.findById(id);
    if (!template) return null;

    await this.templateRepository.clearDefault();
    const [, updated] = await this.templateRepository.update(id, { isDefault: true } as any);
    return updated[0] || this.templateRepository.findById(id);
  }

  async updateThumbnail(id: string, thumbnailUrl: string): Promise<NewsletterTemplate | null> {
    const [count, updated] = await this.templateRepository.update(id, {
      previewThumbnailUrl: thumbnailUrl,
    } as any);
    if (count === 0) return null;
    return updated[0] || this.templateRepository.findById(id);
  }
}

export default TemplateService;
