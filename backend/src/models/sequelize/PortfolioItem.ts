import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../../config/database';

// PortfolioItem attributes interface
export interface PortfolioItemAttributes {
  id: string;
  title_en: string;
  title_sv: string;
  description_en: string;
  description_sv: string;
  category: string;
  techStack: string[];
  projectUrl?: string;
  imageUrl: string;
  imageFile?: string;
  thumbnailUrl?: string;
  deviceFrame?: string; // 'desktop' | 'laptop' | 'tablet' | 'mobile' | 'none'
  featured: boolean;
  order: number;
  isPublished: boolean;
  completedDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

// Optional fields for creation
interface PortfolioItemCreationAttributes 
  extends Optional<PortfolioItemAttributes, 'id' | 'featured' | 'order' | 'isPublished' | 'projectUrl' | 'thumbnailUrl' | 'completedDate'> {}

// PortfolioItem model class
class PortfolioItem extends Model<PortfolioItemAttributes, PortfolioItemCreationAttributes> 
  implements PortfolioItemAttributes {
  public id!: string;
  public title_en!: string;
  public title_sv!: string;
  public description_en!: string;
  public description_sv!: string;
  public category!: string;
  public techStack!: string[];
  public projectUrl?: string;
  public imageUrl!: string;
  public imageFile?: string;
  public thumbnailUrl?: string;
  public deviceFrame?: string;
  public featured!: boolean;
  public order!: number;
  public isPublished!: boolean;
  public completedDate?: Date;
  
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Initialize model
PortfolioItem.init(
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
    description_en: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'description_en',
    },
    description_sv: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'description_sv',
    },
    category: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    techStack: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
    projectUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
      validate: {
        isUrl: true,
      },
    },
    imageUrl: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    imageFile: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Base64 encoded image data',
    },
    thumbnailUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    deviceFrame: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: 'none',
      validate: {
        isIn: [['desktop', 'laptop', 'tablet', 'mobile', 'none']],
      },
    },
    featured: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    isPublished: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    completedDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'PortfolioItems',
    timestamps: true,
    indexes: [
      { fields: ['category'] },
      { fields: ['featured'] },
      { fields: ['isPublished'] },
      { fields: ['order'] },
    ],
  }
);

export default PortfolioItem;
