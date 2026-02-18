import { BaseDAO } from '../dao/BaseDAO';
import FooterMainPage from '../../models/sequelize/FooterMainPage';
import FooterCategoryTitle from '../../models/sequelize/FooterCategoryTitle';
import { Op } from 'sequelize';

export class FooterMainPageRepository extends BaseDAO<FooterMainPage> {
  constructor() {
    super(FooterMainPage);
  }

  /**
   * Find all footer pages (for admin - includes inactive)
   */
  async findAllPages(): Promise<FooterMainPage[]> {
    return await this.model.findAll({
      order: [['displayOrder', 'ASC']],
      include: [
        {
          model: FooterCategoryTitle,
          as: 'category',
        },
      ],
    });
  }

  /**
   * Find all active footer pages within their availability date range
   */
  async findAllActive(): Promise<FooterMainPage[]> {
    const now = new Date();
    return await this.model.findAll({
      where: {
        isActive: true,
        [Op.and]: [
          {
            [Op.or]: [
              { availableFrom: null },
              { availableFrom: { [Op.lte]: now } },
            ],
          },
          {
            [Op.or]: [
              { availableTo: null },
              { availableTo: { [Op.gte]: now } },
            ],
          },
        ],
      },
      order: [['displayOrder', 'ASC']],
      include: [
        {
          model: FooterCategoryTitle,
          as: 'category',
        },
      ],
    });
  }

  /**
   * Find pages by category ID
   */
  async findByCategoryId(categoryId: string): Promise<FooterMainPage[]> {
    return await this.model.findAll({
      where: { footerCategoryTitleId: categoryId },
      order: [['displayOrder', 'ASC']],
    });
  }

  /**
   * Find active pages by category ID
   */
  async findActiveByCategoryId(categoryId: string): Promise<FooterMainPage[]> {
    const now = new Date();
    return await this.model.findAll({
      where: {
        footerCategoryTitleId: categoryId,
        isActive: true,
        [Op.and]: [
          {
            [Op.or]: [
              { availableFrom: null },
              { availableFrom: { [Op.lte]: now } },
            ],
          },
          {
            [Op.or]: [
              { availableTo: null },
              { availableTo: { [Op.gte]: now } },
            ],
          },
        ],
      },
      order: [['displayOrder', 'ASC']],
    });
  }

  /**
   * Find page by ID with category
   */
  async findByIdWithCategory(id: string): Promise<FooterMainPage | null> {
    return await this.model.findByPk(id, {
      include: [
        {
          model: FooterCategoryTitle,
          as: 'category',
        },
      ],
    });
  }

  /**
   * Update display order
   */
  async updateDisplayOrder(id: string, displayOrder: number): Promise<void> {
    await this.model.update({ displayOrder }, { where: { id } });
  }

  /**
   * Toggle active status
   */
  async toggleActive(id: string): Promise<FooterMainPage | null> {
    const page = await this.findById(id);
    if (!page) return null;

    page.isActive = !page.isActive;
    await page.save();
    return page;
  }

  /**
   * Check if page is currently available based on date range
   */
  async isPageAvailable(id: string): Promise<boolean> {
    const page = await this.findById(id);
    if (!page || !page.isActive) return false;

    const now = new Date();

    // Check availableFrom
    if (page.availableFrom && new Date(page.availableFrom) > now) {
      return false;
    }

    // Check availableTo
    if (page.availableTo && new Date(page.availableTo) < now) {
      return false;
    }

    return true;
  }
}

export default FooterMainPageRepository;
