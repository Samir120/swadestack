import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../../config/database';

export interface ExchangeRateAttributes {
  id: string;
  baseCurrency: string;
  targetCurrency: string;
  rate: number;
  fetchedAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ExchangeRateCreationAttributes
  extends Optional<ExchangeRateAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class ExchangeRate
  extends Model<ExchangeRateAttributes, ExchangeRateCreationAttributes>
  implements ExchangeRateAttributes
{
  public id!: string;
  public baseCurrency!: string;
  public targetCurrency!: string;
  public rate!: number;
  public fetchedAt!: Date;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ExchangeRate.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    baseCurrency: {
      type: DataTypes.STRING(3),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    targetCurrency: {
      type: DataTypes.STRING(3),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    rate: {
      type: DataTypes.DECIMAL(16, 8),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    fetchedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'ExchangeRates',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['baseCurrency', 'targetCurrency'],
      },
    ],
  }
);

export default ExchangeRate;
