import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../config/database';

export type CampaignStatus = 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed' | 'cancelled';

export interface NewsletterCampaignAttributes {
  id: string;
  name: string;
  subject: string;
  previewText?: string;
  contentJson?: object;
  templateId?: string;
  status: CampaignStatus;
  targetSegmentIds?: string[];
  targetSubscriberIds?: string[];
  targetSubscriberCount?: number;
  scheduledAt?: Date;
  sentAt?: Date;
  sentByAdminId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface NewsletterCampaignCreationAttributes
  extends Optional<NewsletterCampaignAttributes, 'id' | 'status' | 'createdAt' | 'updatedAt'> {}

class NewsletterCampaign
  extends Model<NewsletterCampaignAttributes, NewsletterCampaignCreationAttributes>
  implements NewsletterCampaignAttributes {
  public id!: string;
  public name!: string;
  public subject!: string;
  public previewText?: string;
  public contentJson?: object;
  public templateId?: string;
  public status!: CampaignStatus;
  public targetSegmentIds?: string[];
  public targetSubscriberIds?: string[];
  public targetSubscriberCount?: number;
  public scheduledAt?: Date;
  public sentAt?: Date;
  public sentByAdminId?: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

NewsletterCampaign.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    subject: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    previewText: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    contentJson: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    templateId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'NewsletterTemplates',
        key: 'id',
      },
    },
    status: {
      type: DataTypes.ENUM('draft', 'scheduled', 'sending', 'sent', 'failed', 'cancelled'),
      allowNull: false,
      defaultValue: 'draft',
    },
    targetSegmentIds: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    targetSubscriberIds: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    targetSubscriberCount: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    scheduledAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    sentAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    sentByAdminId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
  },
  {
    sequelize,
    tableName: 'NewsletterCampaigns',
    timestamps: true,
    indexes: [
      {
        fields: ['status'],
      },
      {
        fields: ['sentByAdminId'],
      },
      {
        fields: ['scheduledAt'],
      },
    ],
  }
);

export default NewsletterCampaign;
