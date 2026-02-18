import { BaseDAO } from '../dao/BaseDAO';
import FooterCategoryTitle from '../../models/sequelize/FooterCategoryTitle';
import FooterMainPage from '../../models/sequelize/FooterMainPage';

export class FooterCategoryTitleRepository extends BaseDAO<FooterCategoryTitle> {
  constructor() {
    super(FooterCategoryTitle);
  }

  /**
   * Find all active footer category titles ordered by displayOrder
   */
  async findAllActive(): Promise<FooterCategoryTitle[]> {
    return await this.model.findAll({
      where: { isActive: true },
      order: [['displayOrder', 'ASC']],
      include: [
        {
          model: FooterMainPage,
          as: 'pages',
          where: { isActive: true },
          required: false,
          order: [['displayOrder', 'ASC']],
        },
      ],
    });
  }

  /**
   * Find all footer category titles with their pages (admin view)
   */
  async findAllWithPages(): Promise<FooterCategoryTitle[]> {
    return await this.model.findAll({
      order: [['displayOrder', 'ASC']],
      include: [
        {
          model: FooterMainPage,
          as: 'pages',
          order: [['displayOrder', 'ASC']],
        },
      ],
    });
  }

  /**
   * Find category by ID with its pages
   */
  async findByIdWithPages(id: string): Promise<FooterCategoryTitle | null> {
    return await this.model.findByPk(id, {
      include: [
        {
          model: FooterMainPage,
          as: 'pages',
          order: [['displayOrder', 'ASC']],
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
  async toggleActive(id: string): Promise<FooterCategoryTitle | null> {
    const category = await this.findById(id);
    if (!category) return null;

    category.isActive = !category.isActive;
    await category.save();
    return category;
  }
}

export default FooterCategoryTitleRepository;
