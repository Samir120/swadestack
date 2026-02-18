import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../../config/database';

// Order status type
export type OrderStatus = 'pending' | 'partial_paid' | 'awaiting_final' | 'paid' | 'cancelled' | 'completed';

// Partial payment status type
export type PartialPaymentStatus = 'initial_pending' | 'initial_paid' | 'final_pending' | 'full_paid';

// Order attributes interface
export interface OrderAttributes {
  id: string;
  userId?: string;
  orderNumber: string;
  totalAmount: number;
  status: OrderStatus;
  currency: string;
  paymentId?: string;
  email: string;
  firstName: string;
  lastName: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country: string;
  requiresPartialPayment?: boolean;
  partialPaymentStatus?: PartialPaymentStatus;
  readyForFinalPayment?: boolean;
  readyForFinalPaymentAt?: Date;
  couponId?: string;
  couponCode?: string;
  discountAmount?: number;
  notifiedForFinalPayment?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// Optional fields for creation
interface OrderCreationAttributes extends Optional<OrderAttributes, 'id' | 'status' | 'currency' | 'country' | 'userId' | 'paymentId' | 'address' | 'city' | 'postalCode' | 'requiresPartialPayment' | 'partialPaymentStatus' | 'readyForFinalPayment' | 'readyForFinalPaymentAt' | 'notifiedForFinalPayment' | 'couponId' | 'couponCode' | 'discountAmount'> {}

// Order model class
class Order extends Model<OrderAttributes, OrderCreationAttributes> implements OrderAttributes {
  public id!: string;
  public userId?: string;
  public orderNumber!: string;
  public totalAmount!: number;
  public status!: OrderStatus;
  public currency!: string;
  public paymentId?: string;
  public email!: string;
  public firstName!: string;
  public lastName!: string;
  public address?: string;
  public city?: string;
  public postalCode?: string;
  public country!: string;
  public requiresPartialPayment?: boolean;
  public partialPaymentStatus?: PartialPaymentStatus;
  public readyForFinalPayment?: boolean;
  public readyForFinalPaymentAt?: Date;
  public couponId?: string;
  public couponCode?: string;
  public discountAmount?: number;
  public notifiedForFinalPayment?: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Initialize model
Order.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id',
      },
      onDelete: 'SET NULL',
    },
    orderNumber: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    status: {
      type: DataTypes.ENUM('pending', 'partial_paid', 'awaiting_final', 'paid', 'cancelled', 'completed'),
      allowNull: false,
      defaultValue: 'pending',
    },
    currency: {
      type: DataTypes.STRING(3),
      allowNull: false,
      defaultValue: 'SEK',
    },
    paymentId: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    firstName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    postalCode: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    country: {
      type: DataTypes.STRING(2),
      allowNull: false,
      defaultValue: 'SE',
    },
    requiresPartialPayment: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    partialPaymentStatus: {
      type: DataTypes.ENUM('initial_pending', 'initial_paid', 'final_pending', 'full_paid'),
      allowNull: true,
    },
    readyForFinalPayment: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    readyForFinalPaymentAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    couponId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Coupons',
        key: 'id',
      },
      onDelete: 'SET NULL',
    },
    couponCode: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    discountAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0,
    },
    notifiedForFinalPayment: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: 'Orders',
    timestamps: true,
    indexes: [
      { fields: ['userId'] },
      { fields: ['status'] },
      { fields: ['orderNumber'] },
      { fields: ['createdAt'] },
    ],
  }
);

export default Order;
