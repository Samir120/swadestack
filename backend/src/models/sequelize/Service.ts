import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../../config/database';

// Service attributes interface
export interface ServiceAttributes {
  id: string;
  name_en: string;
  name_sv: string;
  desc_en: string;
  desc_sv: string;
  price: number;
  discountPrice?: number | null;
  currency: string;
  features_en?: string[];
  features_sv?: string[];
  excludedFeatures_en?: string[];
  excludedFeatures_sv?: string[];
  category: string;
  serviceCategoryId?: string | null;
  imageUrl?: string;
  imageFile?: string;
  isActive: boolean;
  isPopular: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// Optional fields for creation
interface ServiceCreationAttributes extends Optional<ServiceAttributes, 'id' | 'currency' | 'isActive' | 'isPopular' | 'features_en' | 'features_sv' | 'excludedFeatures_en' | 'excludedFeatures_sv' | 'imageUrl' | 'imageFile' | 'discountPrice' | 'serviceCategoryId' | 'category'> {}

// Service model class
class Service extends Model<ServiceAttributes, ServiceCreationAttributes> implements ServiceAttributes {
  public id!: string;
  public name_en!: string;
  public name_sv!: string;
  public desc_en!: string;
  public desc_sv!: string;
  public price!: number;
  public discountPrice?: number | null;
  public currency!: string;
  public features_en?: string[];
  public features_sv?: string[];
  public excludedFeatures_en?: string[];
  public excludedFeatures_sv?: string[];
  public category!: string;
  public serviceCategoryId?: string | null;
  public imageUrl?: string;
  public imageFile?: string;
  public isActive!: boolean;
  public isPopular!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Virtual association field
  public serviceCategory?: any;
}

// Initialize model
Service.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name_en: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'name_en',
    },
    name_sv: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'name_sv',
    },
    desc_en: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'desc_en',
    },
    desc_sv: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'desc_sv',
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    discountPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: null,
      validate: {
        min: 0,
      },
    },
    currency: {
      type: DataTypes.STRING(3),
      allowNull: false,
      defaultValue: 'SEK',
    },
    features_en: {
      type: DataTypes.JSON,
      allowNull: true,
      field: 'features_en',
    },
    features_sv: {
      type: DataTypes.JSON,
      allowNull: true,
      field: 'features_sv',
    },
    excludedFeatures_en: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
      field: 'excludedFeatures_en',
    },
    excludedFeatures_sv: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
      field: 'excludedFeatures_sv',
    },
    category: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    serviceCategoryId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    imageUrl: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    imageFile: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Base64 encoded image data',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    isPopular: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: 'Services',
    timestamps: true,
    indexes: [
      { fields: ['category'] },
      { fields: ['isActive'] },
      { fields: ['serviceCategoryId'] },
    ],
  }
);

export default Service;
