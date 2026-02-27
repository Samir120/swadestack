import BannersRepository from '../integration/repositories/BannersRepository';
import {
  BannerDTO,
  CreateBannerDTO,
  UpdateBannerDTO,
  ListBannerDTO,
} from '../models/dto/BannerDTO';

/**
 * Banners Service - Business Logic Layer
 * Handles banner-related business operations
 */
export class BannersService {
  private bannersRepository: BannersRepository;

  constructor() {
    this.bannersRepository = new BannersRepository();
  }

  /**
   * Get all banners (for admin - includes inactive)
   */
  async getAllBanners(
    page: number = 1,
    limit: number = 10
  ): Promise<ListBannerDTO> {
    const offset = (page - 1) * limit;
    const { banners, total } = await this.bannersRepository.findAllBanners(
      limit,
      offset
    );

    return {
      banners: banners.map(this.mapToDTO),
      total,
    };
  }

  /**
   * Get all active banners with pagination
   */
  async getActiveBanners(
    page: number = 1,
    limit: number = 10
  ): Promise<ListBannerDTO> {
    const offset = (page - 1) * limit;
    const { banners, total } = await this.bannersRepository.findActive(
      limit,
      offset
    );

    return {
      banners: banners.map(this.mapToDTO),
      total,
    };
  }

  /**
   * Get banner by ID
   */
  async getBannerById(id: string): Promise<BannerDTO | null> {
    const banner = await this.bannersRepository.findById(id);
    return banner ? this.mapToDTO(banner) : null;
  }

  /**
   * Create new banner (Admin)
   */
  async createBanner(data: CreateBannerDTO): Promise<BannerDTO> {
    // Validate data
    this.validateBannerData(data);

    const banner = await this.bannersRepository.create(data);
    return this.mapToDTO(banner);
  }

  /**
   * Update banner (Admin)
   */
  async updateBanner(id: string, data: UpdateBannerDTO): Promise<BannerDTO | null> {
    const existingBanner = await this.bannersRepository.findById(id);
    if (!existingBanner) {
      return null;
    }

    // Validate data if titles or descriptions are being updated
    if (data.title_en || data.title_sv || data.desc_en || data.desc_sv) {
      this.validateBannerData(data as any);
    }

    const [, updatedBanners] = await this.bannersRepository.update(id, data);
    return updatedBanners[0] ? this.mapToDTO(updatedBanners[0]) : null;
  }

  /**
   * Delete banner (Admin)
   */
  async deleteBanner(id: string): Promise<boolean> {
    const deleted = await this.bannersRepository.delete(id);
    return deleted > 0;
  }

  /**
   * Toggle banner active status (Admin)
   */
  async toggleActive(id: string): Promise<BannerDTO | null> {
    const banner = await this.bannersRepository.toggleActive(id);
    return banner ? this.mapToDTO(banner) : null;
  }

  // Helper methods

  private mapToDTO(banner: any): BannerDTO {
    return {
      id: banner.id,
      title_en: banner.title_en,
      title_sv: banner.title_sv,
      desc_en: banner.desc_en,
      desc_sv: banner.desc_sv,
      image_url: banner.image_url,
      image_file: banner.image_file,
      mobile_image_url: banner.mobile_image_url,
      mobile_image_file: banner.mobile_image_file,
      is_active: banner.is_active
    };
  }

  private validateBannerData(data: Partial<CreateBannerDTO>): void {
    if (data.title_en && data.title_en.length < 3) {
      throw new Error('English title must be at least 3 characters');
    }
    if (data.title_sv && data.title_sv.length < 3) {
      throw new Error('Swedish title must be at least 3 characters');
    }
    if (data.desc_en && data.desc_en.length < 10) {
      throw new Error('English description must be at least 10 characters');
    }
    if (data.desc_sv && data.desc_sv.length < 10) {
      throw new Error('Swedish description must be at least 10 characters');
    }
  }
}

export default BannersService;