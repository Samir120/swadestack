import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../../config/database';

export interface CartItemAttributes {
  id: string;
  cartId: string;
  serviceId?: string | null;
  pcConfigurationId?: string | null;
  pcComponentId?: string | null;
  quantity: number;
  itemData: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
}

interface CartItemCreationAttributes extends Optional<CartItemAttributes, 'id' | 'quantity' | 'serviceId' | 'pcConfigurationId' | 'pcComponentId'> {}

class CartItem extends Model<CartItemAttributes, CartItemCreationAttributes> implements CartItemAttributes {
  public id!: string;
  public cartId!: string;
  public serviceId!: string | null;
  public pcConfigurationId!: string | null;
  public pcComponentId!: string | null;
  public quantity!: number;
  public itemData!: Record<string, any>;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

CartItem.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    cartId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Carts',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    serviceId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Services',
        key: 'id',
      },
      onDelete: 'SET NULL',
    },
    pcConfigurationId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'PCConfigurations',
        key: 'id',
      },
      onDelete: 'SET NULL',
    },
    pcComponentId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'PCComponents',
        key: 'id',
      },
      onDelete: 'SET NULL',
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 1,
      },
    },
    itemData: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'CartItems',
    timestamps: true,
    indexes: [
      { fields: ['cartId'] },
      { fields: ['serviceId'] },
      { fields: ['pcConfigurationId'] },
      { fields: ['pcComponentId'] },
    ],
  }
);

export default CartItem;
