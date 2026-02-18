import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../../config/database';

export interface FeatureAttributes {
  id: string;
  title_en: string;
  title_sv: string;
  shortDescription_en: string;
  shortDescription_sv: string;
  fullDescription_en: string;
  fullDescription_sv: string;
  iconName: string;
  previewImageUrl?: string;
  previewImageFile?: string;
  displayOrder: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface FeatureCreationAttributes
  extends Optional<FeatureAttributes, 'id' | 'displayOrder' | 'isActive' | 'previewImageUrl' | 'previewImageFile'> {}

class Feature extends Model<FeatureAttributes, FeatureCreationAttributes>
  implements FeatureAttributes {
  public id!: string;
  public title_en!: string;
  public title_sv!: string;
  public shortDescription_en!: string;
  public shortDescription_sv!: string;
  public fullDescription_en!: string;
  public fullDescription_sv!: string;
  public iconName!: string;
  public previewImageUrl?: string;
  public previewImageFile?: string;
  public displayOrder!: number;
  public isActive!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Feature.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title_en: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    title_sv: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    shortDescription_en: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    shortDescription_sv: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    fullDescription_en: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    fullDescription_sv: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    iconName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: 'HelpCircle',
    },
    previewImageUrl: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    previewImageFile: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    displayOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: 'Features',
    timestamps: true,
    indexes: [
      { fields: ['isActive'] },
      { fields: ['displayOrder'] },
    ],
  }
);

export default Feature;
