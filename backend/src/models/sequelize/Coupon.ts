import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../../config/database';

export type DiscountType = 'percentage' | 'fixed_amount';
export type ApplicableTo = 'all' | 'services' | 'gaming_pcs' | 'specific_categories';

export interface CouponAttributes {
  id: string;
  code: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  minimumOrderAmount?: number;
  maxDiscountAmount?: number;
  maxUses?: number;
  maxUsesPerUser?: number;
  currentUses: number;
  totalDiscountGiven: number;
  applicableTo: ApplicableTo;
  applicableCategoryIds?: string;
  firstOrderOnly: boolean;
  combinable: boolean;
  validFrom?: Date;
  validUntil?: Date;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface CouponCreationAttributes extends Optional<CouponAttributes, 'id' | 'description' | 'minimumOrderAmount' | 'maxDiscountAmount' | 'maxUses' | 'maxUsesPerUser' | 'currentUses' | 'totalDiscountGiven' | 'applicableTo' | 'applicableCategoryIds' | 'firstOrderOnly' | 'combinable' | 'validFrom' | 'validUntil' | 'isActive'> {}

class Coupon extends Model<CouponAttributes, CouponCreationAttributes> implements CouponAttributes {
  public id!: string;
  public code!: string;
  public description?: string;
  public discountType!: DiscountType;
  public discountValue!: number;
  public minimumOrderAmount?: number;
  public maxDiscountAmount?: number;
  public maxUses?: number;
  public maxUsesPerUser?: number;
  public currentUses!: number;
  public totalDiscountGiven!: number;
  public applicableTo!: ApplicableTo;
  public applicableCategoryIds?: string;
  public firstOrderOnly!: boolean;
  public combinable!: boolean;
  public validFrom?: Date;
  public validUntil?: Date;
  public isActive!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Coupon.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    discountType: {
      type: DataTypes.ENUM('percentage', 'fixed_amount'),
      allowNull: false,
    },
    discountValue: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    minimumOrderAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    maxDiscountAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    maxUses: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    maxUsesPerUser: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    currentUses: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    totalDiscountGiven: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    applicableTo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'all',
    },
    applicableCategoryIds: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    firstOrderOnly: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    combinable: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    validFrom: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    validUntil: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: 'Coupons',
    timestamps: true,
    indexes: [
      { fields: ['code'], unique: true },
      { fields: ['isActive'] },
    ],
  }
);

export default Coupon;
