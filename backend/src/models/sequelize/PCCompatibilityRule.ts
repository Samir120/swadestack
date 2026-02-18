import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../../config/database';

// Rule type enum
export type RuleType =
  | 'cpu_motherboard'
  | 'motherboard_ram'
  | 'gpu_case'
  | 'psu_power'
  | 'storage_motherboard'
  | 'cooling_cpu';

// Rule operator types
export type RuleOperator =
  | 'equals'
  | 'contains'
  | 'gte'
  | 'lte'
  | 'custom';

// Rule definition interface
export interface RuleDefinition {
  field1: string; // Field name in component1's specifications
  field2: string; // Field name in component2's specifications
  operator: RuleOperator;
  customValidator?: string; // Function name for complex validation
  description?: string; // Internal description of what this rule checks
}

// Rule severity
export type RuleSeverity = 'error' | 'warning';

// Model attributes interface
export interface PCCompatibilityRuleAttributes {
  id: string;
  ruleType: RuleType;
  componentType1: string; // e.g., 'cpu'
  componentType2: string; // e.g., 'motherboard'

  // Rule definition
  rule: RuleDefinition;

  // Bilingual error messages
  errorMessage_en: string;
  errorMessage_sv: string;

  // Severity level
  severity: RuleSeverity;

  // Active status
  isActive: boolean;

  createdAt?: Date;
  updatedAt?: Date;
}

// Creation attributes
interface PCCompatibilityRuleCreationAttributes extends Optional<
  PCCompatibilityRuleAttributes,
  'id' | 'isActive' | 'createdAt' | 'updatedAt'
> {}

// Model class
class PCCompatibilityRule extends Model<
  PCCompatibilityRuleAttributes,
  PCCompatibilityRuleCreationAttributes
> implements PCCompatibilityRuleAttributes {

  public id!: string;
  public ruleType!: RuleType;
  public componentType1!: string;
  public componentType2!: string;

  public rule!: RuleDefinition;

  public errorMessage_en!: string;
  public errorMessage_sv!: string;

  public severity!: RuleSeverity;

  public isActive!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Initialize model
PCCompatibilityRule.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    ruleType: {
      type: DataTypes.ENUM(
        'cpu_motherboard',
        'motherboard_ram',
        'gpu_case',
        'psu_power',
        'storage_motherboard',
        'cooling_cpu'
      ),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    componentType1: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    componentType2: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },

    // Rule definition (stored as JSON)
    rule: {
      type: DataTypes.JSON,
      allowNull: false,
      validate: {
        notEmpty: true,
        isValidRule(value: RuleDefinition) {
          if (!value.field1 || !value.field2 || !value.operator) {
            throw new Error('Rule must contain field1, field2, and operator');
          }
          if (value.operator === 'custom' && !value.customValidator) {
            throw new Error('Custom operator requires customValidator');
          }
        },
      },
    },

    // Bilingual error messages
    errorMessage_en: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [10, 1000],
      },
    },
    errorMessage_sv: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [10, 1000],
      },
    },

    // Severity
    severity: {
      type: DataTypes.ENUM('error', 'warning'),
      allowNull: false,
      defaultValue: 'error',
      validate: {
        isIn: [['error', 'warning']],
      },
    },

    // Active status
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: 'PCCompatibilityRules',
    timestamps: true,
    indexes: [
      {
        fields: ['ruleType'],
      },
      {
        fields: ['isActive'],
      },
      {
        fields: ['componentType1', 'componentType2'],
      },
      {
        fields: ['ruleType', 'isActive'],
      },
    ],
  }
);

export default PCCompatibilityRule;
