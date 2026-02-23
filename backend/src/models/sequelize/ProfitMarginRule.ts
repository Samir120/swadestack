import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../../config/database';

export type RuleType = 'global' | 'category' | 'product';
export type MarginType = 'percentage' | 'flat';

export interface ProfitMarginRuleAttributes {
  id: string;
  name: string;
  type: RuleType;
  pcComponentId?: string | null;
  componentType?: string | null;
  marginType: MarginType;
  marginValue: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ProfitMarginRuleCreationAttributes
  extends Optional<
    ProfitMarginRuleAttributes,
    'id' | 'pcComponentId' | 'componentType' | 'isActive' | 'createdAt' | 'updatedAt'
  > {}

class ProfitMarginRule
  extends Model<ProfitMarginRuleAttributes, ProfitMarginRuleCreationAttributes>
  implements ProfitMarginRuleAttributes
{
  public id!: string;
  public name!: string;
  public type!: RuleType;
  public pcComponentId!: string | null;
  public componentType!: string | null;
  public marginType!: MarginType;
  public marginValue!: number;
  public isActive!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ProfitMarginRule.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    type: {
      type: DataTypes.ENUM('global', 'category', 'product'),
      allowNull: false,
    },
    pcComponentId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'PCComponents',
        key: 'id',
      },
    },
    componentType: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    marginType: {
      type: DataTypes.ENUM('percentage', 'flat'),
      allowNull: false,
    },
    marginValue: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: 'ProfitMarginRules',
    timestamps: true,
    indexes: [
      {
        fields: ['type'],
      },
      {
        fields: ['pcComponentId'],
      },
      {
        fields: ['componentType'],
      },
      {
        fields: ['isActive'],
      },
    ],
  }
);

export default ProfitMarginRule;
