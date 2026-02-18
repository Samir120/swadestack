import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../config/database';

export interface NewsletterSubscriberAttributes {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  isActive: boolean;
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
  extends Optional<NewsletterSubscriberAttributes, 'id' | 'isActive' | 'language' | 'createdAt' | 'updatedAt'> {}

class NewsletterSubscriber 
  extends Model<NewsletterSubscriberAttributes, NewsletterSubscriberCreationAttributes> 
  implements NewsletterSubscriberAttributes {
  public id!: string;
  public email!: string;
  public firstName?: string;
  public lastName?: string;
  public isActive!: boolean;
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
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
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
    ],
  }
);

export default NewsletterSubscriber;
