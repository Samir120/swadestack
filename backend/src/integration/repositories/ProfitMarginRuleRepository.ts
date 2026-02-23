import { BaseDAO } from '../dao/BaseDAO';
import ProfitMarginRule from '../../models/sequelize/ProfitMarginRule';
import PCComponent from '../../models/sequelize/PCComponent';

export class ProfitMarginRuleRepository extends BaseDAO<ProfitMarginRule> {
  constructor() {
    super(ProfitMarginRule);
  }

  async getGlobalRule(): Promise<ProfitMarginRule | null> {
    return await this.findOne({ type: 'global', isActive: true } as any);
  }

  async getRuleForCategory(componentType: string): Promise<ProfitMarginRule | null> {
    return await this.findOne({ type: 'category', componentType, isActive: true } as any);
  }

  async getRuleForProduct(pcComponentId: string): Promise<ProfitMarginRule | null> {
    return await this.findOne({ type: 'product', pcComponentId, isActive: true } as any);
  }

  /**
   * Get the effective rule for a component: product → category → global
   */
  async getEffectiveRule(pcComponentId: string, componentType: string): Promise<ProfitMarginRule | null> {
    // Priority 1: Product-specific rule
    const productRule = await this.getRuleForProduct(pcComponentId);
    if (productRule) return productRule;

    // Priority 2: Category-level rule
    const categoryRule = await this.getRuleForCategory(componentType);
    if (categoryRule) return categoryRule;

    // Priority 3: Global rule
    return await this.getGlobalRule();
  }

  async findAllWithComponent(): Promise<ProfitMarginRule[]> {
    return await this.findAll({
      include: [
        {
          model: PCComponent,
          as: 'pcComponent',
          attributes: ['id', 'name_en', 'name_sv', 'componentType'],
          required: false,
        },
      ],
      order: [['type', 'ASC'], ['createdAt', 'DESC']],
    });
  }
}

export default ProfitMarginRuleRepository;
