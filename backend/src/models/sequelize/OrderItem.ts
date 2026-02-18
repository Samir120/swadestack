import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../../config/database';

// OrderItem attributes interface
export interface OrderItemAttributes {
  id: string;
  orderId: string;
  serviceId?: string; // Optional - null for PC configurations
  pcConfigurationId?: string; // Optional - for PC configuration orders
  quantity: number;
  price: number;
  serviceName: string;
  serviceDescription?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Optional fields for creation
interface OrderItemCreationAttributes extends Optional<OrderItemAttributes, 'id' | 'quantity' | 'serviceId' | 'pcConfigurationId'> {}

// OrderItem model class
class OrderItem extends Model<OrderItemAttributes, OrderItemCreationAttributes> implements OrderItemAttributes {
  public id!: string;
  public orderId!: string;
  public serviceId?: string;
  public pcConfigurationId?: string;
  public quantity!: number;
  public price!: number;
  public serviceName!: string;
  public serviceDescription?: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Initialize model
OrderItem.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    orderId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Orders',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    serviceId: {
      type: DataTypes.UUID,
      allowNull: true, // Nullable for PC configuration orders
      references: {
        model: 'Services',
        key: 'id',
      },
      onDelete: 'RESTRICT',
    },
    pcConfigurationId: {
      type: DataTypes.UUID,
      allowNull: true, // Nullable for regular service orders
      references: {
        model: 'PCConfigurations',
        key: 'id',
      },
      onDelete: 'RESTRICT',
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 1,
      },
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    serviceName: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    serviceDescription: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'OrderItems',
    timestamps: true,
    indexes: [
      { fields: ['orderId'] },
      { fields: ['serviceId'] },
      { fields: ['pcConfigurationId'] },
    ],
  }
);

export default OrderItem;
