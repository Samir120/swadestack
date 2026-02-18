import ServiceCategoryRepository from '../integration/repositories/ServiceCategoryRepository';
import {
  ServiceCategoryDTO,
  CreateServiceCategoryDTO,
  UpdateServiceCategoryDTO,
} from '../models/dto/ServiceCategoryDTO';

export class ServiceCategoryService {
  private repository: ServiceCategoryRepository;

  constructor() {
    this.repository = new ServiceCategoryRepository();
  }

  async getActive(): Promise<ServiceCategoryDTO[]> {
    const categories = await this.repository.findAllActive();
    return categories.map(this.mapToDTO);
  }

  async getAll(): Promise<ServiceCategoryDTO[]> {
    const categories = await this.repository.findAllOrdered();
    return categories.map(this.mapToDTO);
  }

  async getById(id: string): Promise<ServiceCategoryDTO | null> {
    const category = await this.repository.findById(id);
    return category ? this.mapToDTO(category) : null;
  }

  async create(data: CreateServiceCategoryDTO): Promise<ServiceCategoryDTO> {
    this.validate(data);
    const category = await this.repository.create(data);
    return this.mapToDTO(category);
  }

  async update(id: string, data: UpdateServiceCategoryDTO): Promise<ServiceCategoryDTO | null> {
    const existing = await this.repository.findById(id);
    if (!existing) return null;

    if (data.name_en || data.name_sv) {
      this.validate(data as any);
    }

    const [, updated] = await this.repository.update(id, data);
    return updated[0] ? this.mapToDTO(updated[0]) : null;
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await this.repository.delete(id);
    return deleted > 0;
  }

  async toggleActive(id: string): Promise<ServiceCategoryDTO | null> {
    const category = await this.repository.toggleActive(id);
    return category ? this.mapToDTO(category) : null;
  }

  async updateDisplayOrder(id: string, displayOrder: number): Promise<void> {
    if (displayOrder < 0) {
      throw new Error('Display order cannot be negative');
    }
    await this.repository.updateDisplayOrder(id, displayOrder);
  }

  private mapToDTO(category: any): ServiceCategoryDTO {
    return {
      id: category.id,
      name_en: category.name_en,
      name_sv: category.name_sv,
      displayOrder: category.displayOrder,
      isActive: category.isActive,
    };
  }

  private validate(data: Partial<CreateServiceCategoryDTO>): void {
    if (data.name_en !== undefined && data.name_en.length < 2) {
      throw new Error('English name must be at least 2 characters');
    }
    if (data.name_sv !== undefined && data.name_sv.length < 2) {
      throw new Error('Swedish name must be at least 2 characters');
    }
    if (data.displayOrder !== undefined && data.displayOrder < 0) {
      throw new Error('Display order cannot be negative');
    }
  }
}

export default ServiceCategoryService;
