import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../../config/database';

export type AdjustmentType = 'discount' | 'fee' | 'correction' | 'refund';

export interface OrderAdjustmentAttributes {
  id: string;
  orderId: string;
  type: AdjustmentType;
  description: string;
  amount: number;
  adminUserId: string;
  adminUserName: string;
  createdAt?: Date;
}

interface OrderAdjustmentCreationAttributes extends Optional<OrderAdjustmentAttributes, 'id'> {}

class OrderAdjustment extends Model<OrderAdjustmentAttributes, OrderAdjustmentCreationAttributes> implements OrderAdjustmentAttributes {
  public id!: string;
  public orderId!: string;
  public type!: AdjustmentType;
  public description!: string;
  public amount!: number;
  public adminUserId!: string;
  public adminUserName!: string;

  public readonly createdAt!: Date;
}

OrderAdjustment.init(
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
    type: {
      type: DataTypes.ENUM('discount', 'fee', 'correction', 'refund'),
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    adminUserId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    adminUserName: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'OrderAdjustments',
    timestamps: true,
    updatedAt: false,
    indexes: [
      { fields: ['orderId'] },
      { fields: ['type'] },
      { fields: ['createdAt'] },
    ],
  }
);

export default OrderAdjustment;
