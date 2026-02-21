import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../../config/database';

export interface LoginAttemptAttributes {
  id: string;
  userId?: string;
  email: string;
  success: boolean;
  ipAddress?: string;
  userAgent?: string;
  failureReason?: string;
  createdAt?: Date;
}

interface LoginAttemptCreationAttributes extends Optional<LoginAttemptAttributes, 'id' | 'userId' | 'ipAddress' | 'userAgent' | 'failureReason'> {}

class LoginAttempt extends Model<LoginAttemptAttributes, LoginAttemptCreationAttributes> implements LoginAttemptAttributes {
  public id!: string;
  public userId?: string;
  public email!: string;
  public success!: boolean;
  public ipAddress?: string;
  public userAgent?: string;
  public failureReason?: string;

  public readonly createdAt!: Date;
}

LoginAttempt.init(
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
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    success: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    ipAddress: {
      type: DataTypes.STRING(45),
      allowNull: true,
    },
    userAgent: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    failureReason: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'LoginAttempts',
    timestamps: true,
    updatedAt: false,
    indexes: [
      { fields: ['userId'] },
      { fields: ['email'] },
      { fields: ['createdAt'] },
      { fields: ['success'] },
    ],
  }
);

export default LoginAttempt;
