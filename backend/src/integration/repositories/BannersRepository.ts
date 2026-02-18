import { BaseDAO } from '../dao/BaseDAO';
import Banner, { BannerAttributes } from '../../models/sequelize/Banner';

export class BannersRepository extends BaseDAO<Banner> {
  constructor() {
    super(Banner);
  }

  /**
   * Find all banners (for admin - includes inactive)
   */
  async findAllBanners(
    limit?: number,
    offset?: number,
  ): Promise<{ banners: Banner[]; total: number }> {
    const { count, rows } = await this.model.findAndCountAll({
      order: [['createdAt', 'DESC']],
      limit: limit || 50,
      offset: offset || 0,
    });

    return { banners: rows, total: count };
  }

  /**
   * Find all active banners
   */
  async findActive(
    limit?: number,
    offset?: number,
  ): Promise<{ banners: Banner[]; total: number }> {
    const where: any = { is_active: true };

    const { count, rows } = await this.model.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: limit || 50,
      offset: offset || 0,
    });

    return { banners: rows, total: count };
  }

  /**
   * Find service by ID (only if active)
   */
  async findActiveById(id: string): Promise<Banner | null> {
    return await this.model.findOne({
      where: {
        id,
        is_active: true,
      },
    });
  }

  /**
   * Find services by IDs (bulk)
   */
  async findByIds(ids: string[]): Promise<Banner[]> {
    return await this.model.findAll({
      where: {
        id: ids,
        is_active: true,
      },
    });
  }


  /**
   * Toggle service active status
   */
  async toggleActive(id: string): Promise<Banner | null> {
    const banner = await this.findById(id);
    if (!banner) return null;

    banner.is_active = !banner.is_active;
    await banner.save();
    return banner;
  }
}

export default BannersRepository;
