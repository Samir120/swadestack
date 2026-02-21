import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../config/database';

export type SendLogStatus = 'queued' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'failed';

export interface NewsletterSendLogAttributes {
  id: string;
  campaignId: string;
  subscriberId: string;
  email: string;
  status: SendLogStatus;
  sentAt?: Date;
  openedAt?: Date;
  clickedAt?: Date;
  bouncedAt?: Date;
  failureReason?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface NewsletterSendLogCreationAttributes
  extends Optional<NewsletterSendLogAttributes, 'id' | 'status' | 'createdAt' | 'updatedAt'> {}

class NewsletterSendLog
  extends Model<NewsletterSendLogAttributes, NewsletterSendLogCreationAttributes>
  implements NewsletterSendLogAttributes {
  public id!: string;
  public campaignId!: string;
  public subscriberId!: string;
  public email!: string;
  public status!: SendLogStatus;
  public sentAt?: Date;
  public openedAt?: Date;
  public clickedAt?: Date;
  public bouncedAt?: Date;
  public failureReason?: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

NewsletterSendLog.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    campaignId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'NewsletterCampaigns',
        key: 'id',
      },
    },
    subscriberId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'NewsletterSubscribers',
        key: 'id',
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('queued', 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed'),
      allowNull: false,
      defaultValue: 'queued',
    },
    sentAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    openedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    clickedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    bouncedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    failureReason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'NewsletterSendLogs',
    timestamps: true,
    indexes: [
      {
        fields: ['campaignId'],
      },
      {
        fields: ['subscriberId'],
      },
      {
        fields: ['status'],
      },
      {
        fields: ['campaignId', 'subscriberId'],
      },
    ],
  }
);

export default NewsletterSendLog;
