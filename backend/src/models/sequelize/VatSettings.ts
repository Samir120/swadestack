import { Model, DataTypes } from 'sequelize';
import sequelize from '../../config/database';

export interface VatSettingsAttributes {
  id: string;
  vatRate: number;
  label_en: string;
  label_sv: string;
  createdAt?: Date;
  updatedAt?: Date;
}

class VatSettings extends Model<VatSettingsAttributes> implements VatSettingsAttributes {
  public id!: string;
  public vatRate!: number;
  public label_en!: string;
  public label_sv!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

VatSettings.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    vatRate: {
      type: DataTypes.DECIMAL(5, 4),
      allowNull: false,
      defaultValue: 0.2500,
    },
    label_en: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: 'VAT',
    },
    label_sv: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: 'Moms',
    },
  },
  {
    sequelize,
    tableName: 'VatSettings',
    timestamps: true,
  }
);

export default VatSettings;
