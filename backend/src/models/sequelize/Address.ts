import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../../config/database';

export type AddressType = 'shipping' | 'billing';

export interface AddressAttributes {
  id: string;
  userId: string;
  type: AddressType;
  isDefault: boolean;
  fullName: string;
  company?: string;
  streetAddress: string;
  postalCode: string;
  city: string;
  country: string;
  phone?: string;
  organizationNumber?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface AddressCreationAttributes extends Optional<AddressAttributes, 'id' | 'isDefault' | 'company' | 'phone' | 'organizationNumber'> {}

class Address extends Model<AddressAttributes, AddressCreationAttributes> implements AddressAttributes {
  public id!: string;
  public userId!: string;
  public type!: AddressType;
  public isDefault!: boolean;
  public fullName!: string;
  public company?: string;
  public streetAddress!: string;
  public postalCode!: string;
  public city!: string;
  public country!: string;
  public phone?: string;
  public organizationNumber?: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Address.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    type: {
      type: DataTypes.ENUM('shipping', 'billing'),
      allowNull: false,
    },
    isDefault: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    fullName: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    company: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    streetAddress: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    postalCode: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    country: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: 'Sweden',
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    organizationNumber: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'Addresses',
    timestamps: true,
    indexes: [
      { fields: ['userId'] },
      { fields: ['userId', 'type'] },
    ],
  }
);

export default Address;
