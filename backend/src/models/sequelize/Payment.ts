import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../../config/database';

// Payment phase type
export type PaymentPhase = 'initial' | 'final' | 'full' | 'additional';

// Payment status type
export type PaymentStatus = 'pending' | 'processing' | 'succeeded' | 'failed' | 'cancelled';

// Payment attributes interface
export interface PaymentAttributes {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  phase: PaymentPhase;
  status: PaymentStatus;
  klarnaOrderId?: string;
  klarnaReference?: string;
  failureReason?: string;
  metadata?: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
}

// Optional fields for creation
interface PaymentCreationAttributes extends Optional<PaymentAttributes, 'id' | 'status' | 'currency' | 'klarnaOrderId' | 'klarnaReference' | 'failureReason' | 'metadata'> {}

// Payment model class
class Payment extends Model<PaymentAttributes, PaymentCreationAttributes> implements PaymentAttributes {
  public id!: string;
  public orderId!: string;
  public amount!: number;
  public currency!: string;
  public phase!: PaymentPhase;
  public status!: PaymentStatus;
  public klarnaOrderId?: string;
  public klarnaReference?: string;
  public failureReason?: string;
  public metadata?: Record<string, any>;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Initialize model
Payment.init(
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
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    currency: {
      type: DataTypes.STRING(3),
      allowNull: false,
      defaultValue: 'SEK',
    },
    phase: {
      type: DataTypes.ENUM('initial', 'final', 'full', 'additional'),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'processing', 'succeeded', 'failed', 'cancelled'),
      allowNull: false,
      defaultValue: 'pending',
    },
    klarnaOrderId: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    klarnaReference: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    failureReason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'Payments',
    timestamps: true,
    indexes: [
      { fields: ['orderId'] },
      { fields: ['status'] },
      { fields: ['phase'] },
      { fields: ['klarnaOrderId'] },
      { fields: ['createdAt'] },
    ],
  }
);

export default Payment;
