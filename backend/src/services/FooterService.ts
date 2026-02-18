import FooterCategoryTitleRepository from '../integration/repositories/FooterCategoryTitleRepository';
import FooterMainPageRepository from '../integration/repositories/FooterMainPageRepository';
import {
  FooterCategoryTitleDTO,
  CreateFooterCategoryTitleDTO,
  UpdateFooterCategoryTitleDTO,
  FooterMainPageDTO,
  CreateFooterMainPageDTO,
  UpdateFooterMainPageDTO,
  FooterStructureDTO,
} from '../models/dto/FooterDTO';
import FooterCategoryTitle from '../models/sequelize/FooterCategoryTitle';
import FooterMainPage from '../models/sequelize/FooterMainPage';

/**
 * Footer Service - Business Logic Layer
 * Handles footer category titles and main pages business operations
 */
export class FooterService {
  private categoryRepository: FooterCategoryTitleRepository;
  private pageRepository: FooterMainPageRepository;

  constructor() {
    this.categoryRepository = new FooterCategoryTitleRepository();
    this.pageRepository = new FooterMainPageRepository();
  }

  // ===============================
  // Footer Category Title Methods
  // ===============================

  /**
   * Get all footer categories with their active pages (public view)
   */
  async getActiveFooterStructure(): Promise<FooterStructureDTO> {
    const categories = await this.categoryRepository.findAllActive();
    return {
      categories: categories.map((cat) => this.mapCategoryToDTO(cat)),
    };
  }

  /**
   * Get all footer categories with all pages (admin view)
   */
  async getAllCategories(): Promise<FooterCategoryTitleDTO[]> {
    const categories = await this.categoryRepository.findAllWithPages();
    return categories.map((cat) => this.mapCategoryToDTO(cat));
  }

  /**
   * Get category by ID
   */
  async getCategoryById(id: string): Promise<FooterCategoryTitleDTO | null> {
    const category = await this.categoryRepository.findByIdWithPages(id);
    return category ? this.mapCategoryToDTO(category) : null;
  }

  /**
   * Create new footer category (Admin)
   */
  async createCategory(data: CreateFooterCategoryTitleDTO): Promise<FooterCategoryTitleDTO> {
    // Validate data
    this.validateCategoryData(data);

    const category = await this.categoryRepository.create(data);
    return this.mapCategoryToDTO(category);
  }

  /**
   * Update footer category (Admin)
   */
  async updateCategory(
    id: string,
    data: UpdateFooterCategoryTitleDTO
  ): Promise<FooterCategoryTitleDTO | null> {
    const existingCategory = await this.categoryRepository.findById(id);
    if (!existingCategory) {
      return null;
    }

    // Validate data if titles are being updated
    if (data.categoryTitle_en || data.categoryTitle_sv) {
      this.validateCategoryData(data as any);
    }

    const [, updatedCategories] = await this.categoryRepository.update(id, data);
    return updatedCategories[0] ? this.mapCategoryToDTO(updatedCategories[0]) : null;
  }

  /**
   * Delete footer category (Admin)
   */
  async deleteCategory(id: string): Promise<boolean> {
    const deleted = await this.categoryRepository.delete(id);
    return deleted > 0;
  }

  /**
   * Toggle category active status (Admin)
   */
  async toggleCategoryActive(id: string): Promise<FooterCategoryTitleDTO | null> {
    const category = await this.categoryRepository.toggleActive(id);
    return category ? this.mapCategoryToDTO(category) : null;
  }

  /**
   * Update category display order (Admin)
   */
  async updateCategoryOrder(id: string, displayOrder: number): Promise<void> {
    await this.categoryRepository.updateDisplayOrder(id, displayOrder);
  }

  // ===============================
  // Footer Main Page Methods
  // ===============================

  /**
   * Get all footer pages (for admin - includes inactive)
   */
  async getAllPages(): Promise<FooterMainPageDTO[]> {
    const pages = await this.pageRepository.findAllPages();
    return pages.map((page) => this.mapPageToDTO(page));
  }

  /**
   * Get all active footer pages
   */
  async getActivePages(): Promise<FooterMainPageDTO[]> {
    const pages = await this.pageRepository.findAllActive();
    return pages.map((page) => this.mapPageToDTO(page));
  }

  /**
   * Get all pages by category ID
   */
  async getPagesByCategoryId(categoryId: string): Promise<FooterMainPageDTO[]> {
    const pages = await this.pageRepository.findByCategoryId(categoryId);
    return pages.map((page) => this.mapPageToDTO(page));
  }

  /**
   * Get active pages by category ID
   */
  async getActivePagesByCategoryId(categoryId: string): Promise<FooterMainPageDTO[]> {
    const pages = await this.pageRepository.findActiveByCategoryId(categoryId);
    return pages.map((page) => this.mapPageToDTO(page));
  }

  /**
   * Get page by ID
   */
  async getPageById(id: string): Promise<FooterMainPageDTO | null> {
    const page = await this.pageRepository.findByIdWithCategory(id);
    return page ? this.mapPageToDTO(page) : null;
  }

  /**
   * Get page by URL
   */
  async getPageByUrl(url: string): Promise<FooterMainPageDTO | null> {
    const pages = await this.pageRepository.findAll();
    const page = pages.find((p) => p.pageUrl === url && p.isActive);
    if (!page) return null;

    // Check if page is within availability dates
    const now = new Date();
    if (page.availableFrom && new Date(page.availableFrom) > now) return null;
    if (page.availableTo && new Date(page.availableTo) < now) return null;

    return this.mapPageToDTO(page);
  }

  /**
   * Create new footer page (Admin)
   */
  async createPage(data: CreateFooterMainPageDTO): Promise<FooterMainPageDTO> {
    // Validate data
    await this.validatePageData(data);

    const page = await this.pageRepository.create(data);
    return this.mapPageToDTO(page);
  }

  /**
   * Update footer page (Admin)
   */
  async updatePage(id: string, data: UpdateFooterMainPageDTO): Promise<FooterMainPageDTO | null> {
    const existingPage = await this.pageRepository.findById(id);
    if (!existingPage) {
      return null;
    }

    // Validate data if required fields are being updated
    if (data.pageName_en || data.pageName_sv || data.footerCategoryTitleId) {
      await this.validatePageData(data as any);
    }

    const [, updatedPages] = await this.pageRepository.update(id, data);
    return updatedPages[0] ? this.mapPageToDTO(updatedPages[0]) : null;
  }

  /**
   * Delete footer page (Admin)
   */
  async deletePage(id: string): Promise<boolean> {
    const deleted = await this.pageRepository.delete(id);
    return deleted > 0;
  }

  /**
   * Toggle page active status (Admin)
   */
  async togglePageActive(id: string): Promise<FooterMainPageDTO | null> {
    const page = await this.pageRepository.toggleActive(id);
    return page ? this.mapPageToDTO(page) : null;
  }

  /**
   * Update page display order (Admin)
   */
  async updatePageOrder(id: string, displayOrder: number): Promise<void> {
    await this.pageRepository.updateDisplayOrder(id, displayOrder);
  }

  /**
   * Check if page is available (Admin)
   */
  async isPageAvailable(id: string): Promise<boolean> {
    return await this.pageRepository.isPageAvailable(id);
  }

  // ===============================
  // Helper Methods
  // ===============================

  private mapCategoryToDTO(category: FooterCategoryTitle): FooterCategoryTitleDTO {
    return {
      id: category.id,
      categoryTitle_en: category.categoryTitle_en,
      categoryTitle_sv: category.categoryTitle_sv,
      includeBusinessName: category.includeBusinessName,
      displayOrder: category.displayOrder,
      isActive: category.isActive,
      pages: (category as any).pages
        ? (category as any).pages.map((page: FooterMainPage) => this.mapPageToDTO(page))
        : undefined,
    };
  }

  private mapPageToDTO(page: FooterMainPage): FooterMainPageDTO {
    return {
      id: page.id,
      pageName_en: page.pageName_en,
      pageName_sv: page.pageName_sv,
      includeBusinessName: page.includeBusinessName,
      pageUrl: page.pageUrl,
      footerCategoryTitleId: page.footerCategoryTitleId,
      displayOrder: page.displayOrder,
      availableFrom: page.availableFrom,
      availableTo: page.availableTo,
      pageHtmlContent_en: page.pageHtmlContent_en,
      pageHtmlContent_sv: page.pageHtmlContent_sv,
      isHtmlContent: page.isHtmlContent,
      isActive: page.isActive,
      category: (page as any).category
        ? this.mapCategoryToDTO((page as any).category)
        : undefined,
    };
  }

  private validateCategoryData(data: Partial<CreateFooterCategoryTitleDTO>): void {
    if (data.categoryTitle_en && data.categoryTitle_en.length < 2) {
      throw new Error('English category title must be at least 2 characters');
    }
    if (data.categoryTitle_sv && data.categoryTitle_sv.length < 2) {
      throw new Error('Swedish category title must be at least 2 characters');
    }
    if (data.displayOrder !== undefined && data.displayOrder < 0) {
      throw new Error('Display order cannot be negative');
    }
  }

  private async validatePageData(data: Partial<CreateFooterMainPageDTO>): Promise<void> {
    if (data.pageName_en && data.pageName_en.length < 2) {
      throw new Error('English page name must be at least 2 characters');
    }
    if (data.pageName_sv && data.pageName_sv.length < 2) {
      throw new Error('Swedish page name must be at least 2 characters');
    }
    if (data.pageUrl && !this.isValidUrl(data.pageUrl)) {
      throw new Error('Invalid page URL format');
    }
    if (data.displayOrder !== undefined && data.displayOrder < 0) {
      throw new Error('Display order cannot be negative');
    }
    if (data.footerCategoryTitleId) {
      const categoryExists = await this.categoryRepository.findById(data.footerCategoryTitleId);
      if (!categoryExists) {
        throw new Error('Footer category does not exist');
      }
    }
    if (data.availableFrom && data.availableTo) {
      if (new Date(data.availableFrom) > new Date(data.availableTo)) {
        throw new Error('Available from date must be before available to date');
      }
    }
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      // Also allow relative URLs
      return url.startsWith('/') || url.startsWith('#');
    }
  }
}

export default FooterService;
