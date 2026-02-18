import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../../config/database';

// FooterMainPage attributes interface
export interface FooterMainPageAttributes {
  id: string;
  pageName_en: string;
  pageName_sv: string;
  includeBusinessName: boolean;
  pageUrl: string;
  footerCategoryTitleId: string;
  displayOrder: number;
  availableFrom: Date | null;
  availableTo: Date | null;
  pageHtmlContent_en: string;
  pageHtmlContent_sv: string;
  isHtmlContent: boolean;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// Optional fields for creation
interface FooterMainPageCreationAttributes
  extends Optional<
    FooterMainPageAttributes,
    'id' | 'includeBusinessName' | 'displayOrder' | 'availableFrom' | 'availableTo' | 'isHtmlContent' | 'isActive'
  > {}

// FooterMainPage model class
class FooterMainPage
  extends Model<FooterMainPageAttributes, FooterMainPageCreationAttributes>
  implements FooterMainPageAttributes {
  public id!: string;
  public pageName_en!: string;
  public pageName_sv!: string;
  public includeBusinessName!: boolean;
  public pageUrl!: string;
  public footerCategoryTitleId!: string;
  public displayOrder!: number;
  public availableFrom!: Date | null;
  public availableTo!: Date | null;
  public pageHtmlContent_en!: string;
  public pageHtmlContent_sv!: string;
  public isHtmlContent!: boolean;
  public isActive!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Initialize model
FooterMainPage.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    pageName_en: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'pageName_en',
    },
    pageName_sv: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'pageName_sv',
    },
    includeBusinessName: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    pageUrl: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    footerCategoryTitleId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'footerCategoryTitleId',
      references: {
        model: 'FooterCategoryTitles',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    displayOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    availableFrom: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },
    availableTo: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },
    pageHtmlContent_en: {
      type: DataTypes.TEXT('long'),
      allowNull: false,
      defaultValue: '',
      field: 'pageHtmlContent_en',
    },
    pageHtmlContent_sv: {
      type: DataTypes.TEXT('long'),
      allowNull: false,
      defaultValue: '',
      field: 'pageHtmlContent_sv',
    },
    isHtmlContent: {
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
    tableName: 'FooterMainPages',
    timestamps: true,
    indexes: [
      { fields: ['footerCategoryTitleId'] },
      { fields: ['displayOrder'] },
      { fields: ['isActive'] },
    ],
  }
);

export default FooterMainPage;
