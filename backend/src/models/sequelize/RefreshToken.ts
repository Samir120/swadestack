import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../../config/database';

export interface RefreshTokenAttributes {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  isRevoked: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface RefreshTokenCreationAttributes extends Optional<RefreshTokenAttributes, 'id' | 'isRevoked'> {}

class RefreshToken extends Model<RefreshTokenAttributes, RefreshTokenCreationAttributes> implements RefreshTokenAttributes {
  public id!: string;
  public userId!: string;
  public token!: string;
  public expiresAt!: Date;
  public isRevoked!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

RefreshToken.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    token: {
      type: DataTypes.STRING(500),
      allowNull: false,
      unique: true,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    isRevoked: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: 'RefreshTokens',
    timestamps: true,
    indexes: [
      { fields: ['token'] },
      { fields: ['userId'] },
      { fields: ['expiresAt'] },
    ],
  }
);

export default RefreshToken;
