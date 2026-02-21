import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../config/database';

export type SubscriberStatus = 'active' | 'unsubscribed' | 'bounced' | 'pending_confirmation';
export type SubscriberSource = 'registration' | 'website_signup' | 'checkout' | 'admin_manual' | 'csv_import';

export interface NewsletterSubscriberAttributes {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  userId?: string;
  isActive: boolean;
  status: SubscriberStatus;
  source?: SubscriberSource;
  verificationToken?: string;
  verifiedAt?: Date;
  unsubscribedAt?: Date;
  unsubscribeToken?: string;
  language: 'en' | 'sv';
  preferences?: object;
  createdAt?: Date;
  updatedAt?: Date;
}

interface NewsletterSubscriberCreationAttributes
  extends Optional<NewsletterSubscriberAttributes, 'id' | 'isActive' | 'status' | 'language' | 'createdAt' | 'updatedAt'> {}

class NewsletterSubscriber 
  extends Model<NewsletterSubscriberAttributes, NewsletterSubscriberCreationAttributes> 
  implements NewsletterSubscriberAttributes {
  public id!: string;
  public email!: string;
  public firstName?: string;
  public lastName?: string;
  public userId?: string;
  public isActive!: boolean;
  public status!: SubscriberStatus;
  public source?: SubscriberSource;
  public verificationToken?: string;
  public verifiedAt?: Date;
  public unsubscribedAt?: Date;
  public unsubscribeToken?: string;
  public language!: 'en' | 'sv';
  public preferences?: object;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

NewsletterSubscriber.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    status: {
      type: DataTypes.ENUM('active', 'unsubscribed', 'bounced', 'pending_confirmation'),
      allowNull: false,
      defaultValue: 'active',
    },
    source: {
      type: DataTypes.ENUM('registration', 'website_signup', 'checkout', 'admin_manual', 'csv_import'),
      allowNull: true,
    },
    verificationToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    verifiedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    unsubscribedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    unsubscribeToken: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    language: {
      type: DataTypes.ENUM('en', 'sv'),
      allowNull: false,
      defaultValue: 'en',
    },
    preferences: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
    },
  },
  {
    sequelize,
    tableName: 'NewsletterSubscribers',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['email'],
      },
      {
        fields: ['isActive'],
      },
      {
        fields: ['verificationToken'],
      },
      {
        fields: ['unsubscribeToken'],
      },
      {
        fields: ['userId'],
      },
      {
        fields: ['status'],
      },
      {
        fields: ['source'],
      },
    ],
  }
);

export default NewsletterSubscriber;
