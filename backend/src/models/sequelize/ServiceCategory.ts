import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../../config/database';

// ServiceCategory attributes interface
export interface ServiceCategoryAttributes {
  id: string;
  name_en: string;
  name_sv: string;
  displayOrder: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// Optional fields for creation
interface ServiceCategoryCreationAttributes
  extends Optional<ServiceCategoryAttributes, 'id' | 'displayOrder' | 'isActive'> {}

// ServiceCategory model class
class ServiceCategory
  extends Model<ServiceCategoryAttributes, ServiceCategoryCreationAttributes>
  implements ServiceCategoryAttributes {
  public id!: string;
  public name_en!: string;
  public name_sv!: string;
  public displayOrder!: number;
  public isActive!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Initialize model
ServiceCategory.init(
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
    tableName: 'ServiceCategories',
    timestamps: true,
    indexes: [
      { fields: ['displayOrder'] },
      { fields: ['isActive'] },
    ],
  }
);

export default ServiceCategory;
