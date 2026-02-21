import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../config/database';

export interface NewsletterCampaignStatsAttributes {
  id: string;
  campaignId: string;
  totalSent: number;
  totalDelivered: number;
  totalOpened: number;
  uniqueOpens: number;
  totalClicked: number;
  uniqueClicks: number;
  totalUnsubscribed: number;
  totalBounced: number;
  totalFailed: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface NewsletterCampaignStatsCreationAttributes
  extends Optional<NewsletterCampaignStatsAttributes, 'id' | 'totalSent' | 'totalDelivered' | 'totalOpened' | 'uniqueOpens' | 'totalClicked' | 'uniqueClicks' | 'totalUnsubscribed' | 'totalBounced' | 'totalFailed' | 'createdAt' | 'updatedAt'> {}

class NewsletterCampaignStats
  extends Model<NewsletterCampaignStatsAttributes, NewsletterCampaignStatsCreationAttributes>
  implements NewsletterCampaignStatsAttributes {
  public id!: string;
  public campaignId!: string;
  public totalSent!: number;
  public totalDelivered!: number;
  public totalOpened!: number;
  public uniqueOpens!: number;
  public totalClicked!: number;
  public uniqueClicks!: number;
  public totalUnsubscribed!: number;
  public totalBounced!: number;
  public totalFailed!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

NewsletterCampaignStats.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    campaignId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      references: {
        model: 'NewsletterCampaigns',
        key: 'id',
      },
    },
    totalSent: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    totalDelivered: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    totalOpened: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    uniqueOpens: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    totalClicked: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    uniqueClicks: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    totalUnsubscribed: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    totalBounced: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    totalFailed: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    tableName: 'NewsletterCampaignStats',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['campaignId'],
      },
    ],
  }
);

export default NewsletterCampaignStats;
