import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../../config/database';

// FooterCategoryTitle attributes interface
export interface FooterCategoryTitleAttributes {
  id: string;
  categoryTitle_en: string;
  categoryTitle_sv: string;
  includeBusinessName: boolean;
  displayOrder: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// Optional fields for creation
interface FooterCategoryTitleCreationAttributes
  extends Optional<FooterCategoryTitleAttributes, 'id' | 'includeBusinessName' | 'displayOrder' | 'isActive'> {}

// FooterCategoryTitle model class
class FooterCategoryTitle
  extends Model<FooterCategoryTitleAttributes, FooterCategoryTitleCreationAttributes>
  implements FooterCategoryTitleAttributes {
  public id!: string;
  public categoryTitle_en!: string;
  public categoryTitle_sv!: string;
  public includeBusinessName!: boolean;
  public displayOrder!: number;
  public isActive!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Initialize model
FooterCategoryTitle.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    categoryTitle_en: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'categoryTitle_en',
    },
    categoryTitle_sv: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'categoryTitle_sv',
    },
    includeBusinessName: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    displayOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
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
    tableName: 'FooterCategoryTitles',
    timestamps: true,
    indexes: [
      { fields: ['displayOrder'] },
      { fields: ['isActive'] },
    ],
  }
);

export default FooterCategoryTitle;
