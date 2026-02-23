import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../../config/database';

export interface CurrencyAttributes {
  id: string;
  code: string;
  name: string;
  symbol: string;
  decimalPlaces: number;
  isBaseCurrency: boolean;
  isDisplayCurrency: boolean;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface CurrencyCreationAttributes
  extends Optional<
    CurrencyAttributes,
    'id' | 'decimalPlaces' | 'isBaseCurrency' | 'isDisplayCurrency' | 'isActive' | 'createdAt' | 'updatedAt'
  > {}

class Currency extends Model<CurrencyAttributes, CurrencyCreationAttributes> implements CurrencyAttributes {
  public id!: string;
  public code!: string;
  public name!: string;
  public symbol!: string;
  public decimalPlaces!: number;
  public isBaseCurrency!: boolean;
  public isDisplayCurrency!: boolean;
  public isActive!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Currency.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    code: {
      type: DataTypes.STRING(3),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        len: [3, 3],
      },
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    symbol: {
      type: DataTypes.STRING(10),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    decimalPlaces: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 2,
    },
    isBaseCurrency: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    isDisplayCurrency: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: 'Currencies',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['code'],
      },
      {
        fields: ['isActive'],
      },
    ],
  }
);

export default Currency;
