import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../../config/database';

export interface CartAttributes {
  id: string;
  userId: string;
  lastReminderSentAt?: Date | null;
  forceCleared?: boolean;
  adminModified?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface CartCreationAttributes extends Optional<CartAttributes, 'id' | 'lastReminderSentAt' | 'forceCleared' | 'adminModified'> {}

class Cart extends Model<CartAttributes, CartCreationAttributes> implements CartAttributes {
  public id!: string;
  public userId!: string;
  public lastReminderSentAt!: Date | null;
  public forceCleared!: boolean;
  public adminModified!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Cart.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      references: {
        model: 'Users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    lastReminderSentAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    forceCleared: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    adminModified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: 'Carts',
    timestamps: true,
    indexes: [
      { unique: true, fields: ['userId'] },
      { fields: ['updatedAt'] },
    ],
  }
);

export default Cart;
