import PortfolioRepository from '../integration/repositories/PortfolioRepository';
import {
  PortfolioDTO,
  CreatePortfolioDTO,
  UpdatePortfolioDTO,
  PortfolioListDTO,
} from '../models/dto/PortfolioDTO';

export class PortfolioService {
  private portfolioRepository: PortfolioRepository;

  constructor() {
    this.portfolioRepository = new PortfolioRepository();
  }

  /**
   * Get all published portfolio items
   */
  async getPublishedItems(
    page: number = 1,
    limit: number = 20,
    category?: string
  ): Promise<PortfolioListDTO> {
    const offset = (page - 1) * limit;
    const { items, total } = await this.portfolioRepository.findPublished(
      limit,
      offset,
      category
    );

    return {
      items: items.map(this.mapToDTO),
      total,
      page,
      limit,
    };
  }

  /**
   * Get ALL portfolio items (admin only - includes unpublished)
   */
  async getAllItems(
    page: number = 1,
    limit: number = 100,
    category?: string
  ): Promise<PortfolioListDTO> {
    const offset = (page - 1) * limit;
    const { items, total } = await this.portfolioRepository.findAllPaginated(
      limit,
      offset,
      category
    );

    return {
      items: items.map(this.mapToDTO),
      total,
      page,
      limit,
    };
  }

  /**
   * Get featured portfolio items
   */
  async getFeaturedItems(limit: number = 6): Promise<PortfolioDTO[]> {
    const items = await this.portfolioRepository.findFeatured(limit);
    return items.map(this.mapToDTO);
  }

  /**
   * Get portfolio item by ID
   */
  async getItemById(id: string): Promise<PortfolioDTO | null> {
    const item = await this.portfolioRepository.findById(id);
    return item ? this.mapToDTO(item) : null;
  }

  /**
   * Get portfolio items by category
   */
  async getItemsByCategory(category: string): Promise<PortfolioDTO[]> {
    const items = await this.portfolioRepository.findByCategory(category);
    return items.map(this.mapToDTO);
  }

  /**
   * Get all categories
   */
  async getCategories(): Promise<string[]> {
    return await this.portfolioRepository.getCategories();
  }

  /**
   * Create new portfolio item (Admin)
   */
  async createItem(data: CreatePortfolioDTO): Promise<PortfolioDTO> {
    // Validate data
    this.validatePortfolioData(data);

    const item = await this.portfolioRepository.create(data);
    return this.mapToDTO(item);
  }

  /**
   * Update portfolio item (Admin)
   */
  async updateItem(id: string, data: UpdatePortfolioDTO): Promise<PortfolioDTO | null> {
    const existingItem = await this.portfolioRepository.findById(id);
    if (!existingItem) {
      return null;
    }

    // Validate data
    if (data.title_en || data.title_sv || data.description_en || data.description_sv) {
      this.validatePortfolioData(data as any);
    }

    const [, updatedItems] = await this.portfolioRepository.update(id, data);
    return updatedItems[0] ? this.mapToDTO(updatedItems[0]) : null;
  }

  /**
   * Delete portfolio item (Admin)
   */
  async deleteItem(id: string): Promise<boolean> {
    const deleted = await this.portfolioRepository.delete(id);
    return deleted > 0;
  }

  /**
   * Toggle featured status (Admin)
   */
  async toggleFeatured(id: string): Promise<PortfolioDTO | null> {
    const item = await this.portfolioRepository.toggleFeatured(id);
    return item ? this.mapToDTO(item) : null;
  }

  /**
   * Update item order (Admin)
   */
  async updateOrder(id: string, order: number): Promise<void> {
    await this.portfolioRepository.updateOrder(id, order);
  }

  // Helper methods

  private mapToDTO(item: any): PortfolioDTO {
    return {
      id: item.id,
      title_en: item.title_en,
      title_sv: item.title_sv,
      description_en: item.description_en,
      description_sv: item.description_sv,
      category: item.category,
      techStack: item.techStack,
      projectUrl: item.projectUrl,
      imageUrl: item.imageUrl,
      imageFile: (item as any).imageFile,
      deviceFrame: (item as any).deviceFrame,
      thumbnailUrl: item.thumbnailUrl,
      featured: item.featured,
      order: item.order,
      isPublished: item.isPublished,
      completedDate: item.completedDate,
    };
  }

  private validatePortfolioData(data: Partial<CreatePortfolioDTO>): void {
    if (data.title_en && data.title_en.length < 3) {
      throw new Error('English title must be at least 3 characters');
    }
    if (data.title_sv && data.title_sv.length < 3) {
      throw new Error('Swedish title must be at least 3 characters');
    }
    if (data.description_en && data.description_en.length < 10) {
      throw new Error('English description must be at least 10 characters');
    }
    if (data.description_sv && data.description_sv.length < 10) {
      throw new Error('Swedish description must be at least 10 characters');
    }
    if (data.techStack && data.techStack.length === 0) {
      throw new Error('Tech stack must contain at least one technology');
    }
  }
}

export default PortfolioService;
