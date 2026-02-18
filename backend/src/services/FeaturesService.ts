import FeaturesRepository from '../integration/repositories/FeaturesRepository';
import {
  FeatureDTO,
  CreateFeatureDTO,
  UpdateFeatureDTO,
} from '../models/dto/FeatureDTO';

export class FeaturesService {
  private featuresRepository: FeaturesRepository;

  constructor() {
    this.featuresRepository = new FeaturesRepository();
  }

  async getActive(): Promise<FeatureDTO[]> {
    const items = await this.featuresRepository.findActive();
    return items.map(this.mapToDTO);
  }

  async getAll(): Promise<FeatureDTO[]> {
    const items = await this.featuresRepository.findAllFeatures();
    return items.map(this.mapToDTO);
  }

  async getById(id: string): Promise<FeatureDTO | null> {
    const item = await this.featuresRepository.findById(id);
    return item ? this.mapToDTO(item) : null;
  }

  async create(data: CreateFeatureDTO): Promise<FeatureDTO> {
    this.validateFeatureData(data);
    const item = await this.featuresRepository.create(data);
    return this.mapToDTO(item);
  }

  async update(id: string, data: UpdateFeatureDTO): Promise<FeatureDTO | null> {
    const existing = await this.featuresRepository.findById(id);
    if (!existing) return null;

    if (data.title_en || data.title_sv) {
      this.validateFeatureData(data as any);
    }

    const [, updatedItems] = await this.featuresRepository.update(id, data);
    return updatedItems[0] ? this.mapToDTO(updatedItems[0]) : null;
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await this.featuresRepository.delete(id);
    return deleted > 0;
  }

  async toggleActive(id: string): Promise<FeatureDTO | null> {
    const item = await this.featuresRepository.toggleActive(id);
    return item ? this.mapToDTO(item) : null;
  }

  async updateOrder(id: string, displayOrder: number): Promise<void> {
    await this.featuresRepository.updateOrder(id, displayOrder);
  }

  private mapToDTO(item: any): FeatureDTO {
    return {
      id: item.id,
      title_en: item.title_en,
      title_sv: item.title_sv,
      shortDescription_en: item.shortDescription_en,
      shortDescription_sv: item.shortDescription_sv,
      fullDescription_en: item.fullDescription_en,
      fullDescription_sv: item.fullDescription_sv,
      iconName: item.iconName,
      previewImageUrl: item.previewImageUrl,
      previewImageFile: item.previewImageFile,
      displayOrder: item.displayOrder,
      isActive: item.isActive,
    };
  }

  private validateFeatureData(data: Partial<CreateFeatureDTO>): void {
    if (data.title_en && data.title_en.length < 3) {
      throw new Error('English title must be at least 3 characters');
    }
    if (data.title_sv && data.title_sv.length < 3) {
      throw new Error('Swedish title must be at least 3 characters');
    }
  }
}

export default FeaturesService;
