import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../config/database';
import { EmailTemplateType, EmailPriority } from '../../config/emailConfig';

export interface EmailAttributes {
  id: string;
  to: string;
  cc?: string;
  bcc?: string;
  subject: string;
  templateType: EmailTemplateType;
  templateData: object;
  priority: EmailPriority;
  status: 'pending' | 'sent' | 'failed' | 'queued';
  sentAt?: Date;
  failedAt?: Date;
  errorMessage?: string;
  retryCount: number;
  userId?: string;
  orderId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface EmailCreationAttributes extends Optional<EmailAttributes, 'id' | 'retryCount' | 'status' | 'createdAt' | 'updatedAt'> {}

class Email extends Model<EmailAttributes, EmailCreationAttributes> implements EmailAttributes {
  public id!: string;
  public to!: string;
  public cc?: string;
  public bcc?: string;
  public subject!: string;
  public templateType!: EmailTemplateType;
  public templateData!: object;
  public priority!: EmailPriority;
  public status!: 'pending' | 'sent' | 'failed' | 'queued';
  public sentAt?: Date;
  public failedAt?: Date;
  public errorMessage?: string;
  public retryCount!: number;
  public userId?: string;
  public orderId?: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Email.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    to: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    cc: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: true,
      },
    },
    bcc: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: true,
      },
    },
    subject: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    templateType: {
      type: DataTypes.ENUM(...Object.values(EmailTemplateType)),
      allowNull: false,
    },
    templateData: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
    priority: {
      type: DataTypes.ENUM(...Object.values(EmailPriority)),
      allowNull: false,
      defaultValue: EmailPriority.NORMAL,
    },
    status: {
      type: DataTypes.ENUM('pending', 'sent', 'failed', 'queued'),
      allowNull: false,
      defaultValue: 'pending',
    },
    sentAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    failedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    errorMessage: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    retryCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    orderId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Orders',
        key: 'id',
      },
    },
  },
  {
    sequelize,
    tableName: 'Emails',
    timestamps: true,
    indexes: [
      {
        fields: ['status'],
      },
      {
        fields: ['userId'],
      },
      {
        fields: ['orderId'],
      },
      {
        fields: ['createdAt'],
      },
    ],
  }
);

export default Email;
