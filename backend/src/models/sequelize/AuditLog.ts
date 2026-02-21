import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../../config/database';

export interface AuditLogAttributes {
  id: string;
  adminUserId: string;
  adminUserName: string;
  action: string;
  targetType: string;
  targetId: string;
  details?: string;
  ipAddress?: string;
  createdAt?: Date;
}

interface AuditLogCreationAttributes extends Optional<AuditLogAttributes, 'id' | 'details' | 'ipAddress'> {}

class AuditLog extends Model<AuditLogAttributes, AuditLogCreationAttributes> implements AuditLogAttributes {
  public id!: string;
  public adminUserId!: string;
  public adminUserName!: string;
  public action!: string;
  public targetType!: string;
  public targetId!: string;
  public details?: string;
  public ipAddress?: string;

  public readonly createdAt!: Date;
}

AuditLog.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    adminUserId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    adminUserName: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    action: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    targetType: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    targetId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    details: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    ipAddress: {
      type: DataTypes.STRING(45),
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'AuditLogs',
    timestamps: true,
    updatedAt: false,
    indexes: [
      { fields: ['targetType', 'targetId'] },
      { fields: ['adminUserId'] },
      { fields: ['action'] },
      { fields: ['createdAt'] },
    ],
  }
);

export default AuditLog;
