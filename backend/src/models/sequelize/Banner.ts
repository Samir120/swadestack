import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../../config/database';

// Service attributes interface
export interface BannerAttributes {
  id: string;
  title_en: string;
  title_sv: string;
  desc_en: string;
  desc_sv: string;
  image_url: string;
  image_file?: string;
  is_active: boolean;
}

// Optional fields for creation
interface BannerCreationAttributes extends Optional<BannerAttributes, 'id' | 'is_active' > {}

// Service model class
class Banner extends Model<BannerAttributes, BannerCreationAttributes> implements BannerAttributes {
  public id!: string;
  public title_en!: string;
  public title_sv!: string;
  public desc_en!: string;
  public desc_sv!: string;
  public image_url!: string;
  public image_file?: string;
  public is_active!: boolean;
  
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Initialize model
Banner.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title_en: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'title_en',
    },
    title_sv: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'title_sv',
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
    image_url: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    image_file: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Base64 encoded image data',
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: 'Banner',
    timestamps: true,
    indexes: [
      { fields: ['is_active'] },
    ],
  }
);

export default Banner;
