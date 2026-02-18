import { BaseDAO } from '../dao/BaseDAO';
import PCCompatibilityRule, { RuleType, RuleSeverity } from '../../models/sequelize/PCCompatibilityRule';

export class PCCompatibilityRuleRepository extends BaseDAO<PCCompatibilityRule> {
  constructor() {
    super(PCCompatibilityRule);
  }

  /**
   * Find all active compatibility rules
   */
  async findActiveRules(): Promise<PCCompatibilityRule[]> {
    return await this.model.findAll({
      where: { isActive: true },
      order: [['ruleType', 'ASC']],
    });
  }

  /**
   * Find rules by rule type
   */
  async findRulesByType(ruleType: RuleType): Promise<PCCompatibilityRule[]> {
    return await this.model.findAll({
      where: {
        ruleType,
        isActive: true,
      },
    });
  }

  /**
   * Find rules by component types (bidirectional search)
   */
  async findRulesByComponentTypes(
    type1: string,
    type2: string
  ): Promise<PCCompatibilityRule[]> {
    return await this.model.findAll({
      where: {
        isActive: true,
        componentType1: type1,
        componentType2: type2,
      },
    });
  }

  /**
   * Find rules by severity
   */
  async findRulesBySeverity(severity: RuleSeverity): Promise<PCCompatibilityRule[]> {
    return await this.model.findAll({
      where: {
        severity,
        isActive: true,
      },
      order: [['ruleType', 'ASC']],
    });
  }

  /**
   * Find error rules (blocking rules)
   */
  async findErrorRules(): Promise<PCCompatibilityRule[]> {
    return await this.findRulesBySeverity('error');
  }

  /**
   * Find warning rules (non-blocking rules)
   */
  async findWarningRules(): Promise<PCCompatibilityRule[]> {
    return await this.findRulesBySeverity('warning');
  }

  /**
   * Toggle rule active status
   */
  async toggleActive(id: string): Promise<PCCompatibilityRule | null> {
    const rule = await this.findById(id);
    if (!rule) return null;

    rule.isActive = !rule.isActive;
    await rule.save();
    return rule;
  }

  /**
   * Bulk toggle rules by rule type
   */
  async bulkToggleByType(ruleType: RuleType, isActive: boolean): Promise<number> {
    const [affectedCount] = await this.model.update(
      { isActive },
      { where: { ruleType } }
    );
    return affectedCount;
  }

  /**
   * Get rule count by type
   */
  async getCountByType(ruleType: RuleType): Promise<number> {
    return await this.count({ ruleType, isActive: true });
  }

  /**
   * Get all rule types with counts
   */
  async getRuleTypeCounts(): Promise<{ ruleType: RuleType; count: number }[]> {
    const rules = await this.model.findAll({
      attributes: [
        'ruleType',
        [this.model.sequelize!.fn('COUNT', this.model.sequelize!.col('id')), 'count'],
      ],
      where: { isActive: true },
      group: ['ruleType'],
    });

    return rules.map((rule: any) => ({
      ruleType: rule.ruleType,
      count: parseInt(rule.get('count') as string, 10),
    }));
  }
}

export default PCCompatibilityRuleRepository;
