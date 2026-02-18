import ServicesRepository from '../integration/repositories/ServicesRepository';
import {
  ServiceDTO,
  CreateServiceDTO,
  UpdateServiceDTO,
  ServiceListDTO,
} from '../models/dto/ServiceDTO';

/**
 * Services Service - Business Logic Layer
 * Handles service-related business operations
 */
export class ServicesService {
  private servicesRepository: ServicesRepository;

  constructor() {
    this.servicesRepository = new ServicesRepository();
  }

  /**
   * Get all services (for admin - includes inactive)
   */
  async getAllServices(
    page: number = 1,
    limit: number = 20,
    category?: string
  ): Promise<ServiceListDTO> {
    const offset = (page - 1) * limit;
    const { services, total } = await this.servicesRepository.findAllServices(
      limit,
      offset,
      category
    );

    return {
      items: services.map(this.mapToDTO),
      total,
      page,
      limit,
    };
  }

  /**
   * Get all active services
   */
  async getActiveServices(
    page: number = 1,
    limit: number = 20,
    category?: string
  ): Promise<ServiceListDTO> {
    const offset = (page - 1) * limit;
    const { services, total } = await this.servicesRepository.findActive(
      limit,
      offset,
      category
    );

    return {
      items: services.map(this.mapToDTO),
      total,
      page,
      limit,
    };
  }

  /**
   * Get service by ID
   */
  async getServiceById(id: string): Promise<ServiceDTO | null> {
    const service = await this.servicesRepository.findActiveById(id);
    return service ? this.mapToDTO(service) : null;
  }

  /**
   * Get services by category ID
   */
  async getServicesByCategoryId(serviceCategoryId: string): Promise<ServiceDTO[]> {
    const services = await this.servicesRepository.findByCategoryId(serviceCategoryId);
    return services.map(this.mapToDTO);
  }

  /**
   * Get multiple services by IDs (for cart/checkout)
   */
  async getServicesByIds(ids: string[]): Promise<ServiceDTO[]> {
    if (ids.length === 0) return [];

    const services = await this.servicesRepository.findByIds(ids);
    return services.map(this.mapToDTO);
  }

  /**
   * Create new service (Admin)
   */
  async createService(data: CreateServiceDTO): Promise<ServiceDTO> {
    // Validate data
    this.validateServiceData(data);

    const service = await this.servicesRepository.create(data);

    // Enforce one popular per category
    if (data.isPopular && service.serviceCategoryId) {
      await this.servicesRepository.clearPopularInCategory(service.serviceCategoryId, service.id);
    }

    return this.mapToDTO(service);
  }

  /**
   * Update service (Admin)
   */
  async updateService(id: string, data: UpdateServiceDTO): Promise<ServiceDTO | null> {
    const existingService = await this.servicesRepository.findById(id);
    if (!existingService) {
      return null;
    }

    // Validate data if price or name is being updated
    if (data.price !== undefined || data.name_en || data.name_sv) {
      this.validateServiceData(data as any);
    }

    const [, updatedServices] = await this.servicesRepository.update(id, data);

    // Enforce one popular per category
    if (data.isPopular && updatedServices[0]) {
      const categoryId = updatedServices[0].serviceCategoryId || existingService.serviceCategoryId;
      if (categoryId) {
        await this.servicesRepository.clearPopularInCategory(categoryId, id);
      }
    }

    return updatedServices[0] ? this.mapToDTO(updatedServices[0]) : null;
  }

  /**
   * Delete service (Admin)
   */
  async deleteService(id: string): Promise<boolean> {
    const deleted = await this.servicesRepository.delete(id);
    return deleted > 0;
  }

  /**
   * Toggle service active status (Admin)
   */
  async toggleActive(id: string): Promise<ServiceDTO | null> {
    const service = await this.servicesRepository.toggleActive(id);
    return service ? this.mapToDTO(service) : null;
  }

  /**
   * Update service price (Admin)
   */
  async updatePrice(id: string, price: number): Promise<void> {
    if (price < 0) {
      throw new Error('Price cannot be negative');
    }
    await this.servicesRepository.updatePrice(id, price);
  }

  // Helper methods

  private mapToDTO(service: any): ServiceDTO {
    const dto: ServiceDTO = {
      id: service.id,
      name_en: service.name_en,
      name_sv: service.name_sv,
      desc_en: service.desc_en,
      desc_sv: service.desc_sv,
      price: parseFloat(service.price),
      discountPrice: service.discountPrice != null ? parseFloat(service.discountPrice) : null,
      currency: service.currency,
      features_en: service.features_en,
      features_sv: service.features_sv,
      excludedFeatures_en: service.excludedFeatures_en,
      excludedFeatures_sv: service.excludedFeatures_sv,
      category: service.category,
      serviceCategoryId: service.serviceCategoryId || null,
      imageUrl: service.imageUrl,
      imageFile: service.imageFile,
      isActive: service.isActive,
      isPopular: service.isPopular,
    };

    if (service.serviceCategory) {
      dto.serviceCategory = {
        id: service.serviceCategory.id,
        name_en: service.serviceCategory.name_en,
        name_sv: service.serviceCategory.name_sv,
        displayOrder: service.serviceCategory.displayOrder,
      };
    }

    return dto;
  }

  private validateServiceData(data: Partial<CreateServiceDTO>): void {
    if (data.name_en && data.name_en.length < 3) {
      throw new Error('English name must be at least 3 characters');
    }
    if (data.name_sv && data.name_sv.length < 3) {
      throw new Error('Swedish name must be at least 3 characters');
    }
    if (data.desc_en && data.desc_en.length < 10) {
      throw new Error('English description must be at least 10 characters');
    }
    if (data.desc_sv && data.desc_sv.length < 10) {
      throw new Error('Swedish description must be at least 10 characters');
    }
    if (data.price !== undefined && data.price < 0) {
      throw new Error('Price cannot be negative');
    }
    if ((data as any).discountPrice !== undefined && (data as any).discountPrice !== null) {
      if ((data as any).discountPrice < 0) {
        throw new Error('Discount price cannot be negative');
      }
      if (data.price !== undefined && (data as any).discountPrice >= data.price) {
        throw new Error('Discount price must be less than the original price');
      }
    }
  }
}

export default ServicesService;
