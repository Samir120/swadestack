import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../config/database';

export interface GlobalStylesConfig {
  emailWidth?: number;
  backgroundColor?: string;
  contentBackgroundColor?: string;
  defaultFont?: string;
  defaultTextColor?: string;
  defaultLinkColor?: string;
  header?: {
    showLogo?: boolean;
    logoUrl?: string;
    logoWidth?: number;
    alignment?: 'left' | 'center' | 'right';
    backgroundColor?: string;
    padding?: number;
  };
}

export interface SocialMediaConfigItem {
  platform: string;
  url: string;
  enabled: boolean;
}

export interface SocialMediaConfig {
  style?: 'icons' | 'icons-text';
  alignment?: 'left' | 'center' | 'right';
  iconSize?: number;
  platforms: SocialMediaConfigItem[];
}

export interface FooterConfig {
  companyName?: string;
  addressLine?: string;
  showUnsubscribe?: boolean;
  unsubscribeText?: string;
  customHtml?: string;
  backgroundColor?: string;
  textColor?: string;
  padding?: number;
}

export interface ContentBlock {
  id: string;
  type: string;
  order: number;
  settings: Record<string, any>;
}

export interface NewsletterTemplateAttributes {
  id: string;
  name: string;
  isDefault: boolean;
  previewThumbnailUrl?: string;
  globalStyles?: GlobalStylesConfig;
  socialMediaConfig?: SocialMediaConfig;
  footerConfig?: FooterConfig;
  contentBlocks?: ContentBlock[];
  usageCount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface NewsletterTemplateCreationAttributes
  extends Optional<NewsletterTemplateAttributes, 'id' | 'isDefault' | 'usageCount' | 'createdAt' | 'updatedAt'> {}

class NewsletterTemplate
  extends Model<NewsletterTemplateAttributes, NewsletterTemplateCreationAttributes>
  implements NewsletterTemplateAttributes {
  public id!: string;
  public name!: string;
  public isDefault!: boolean;
  public previewThumbnailUrl?: string;
  public globalStyles?: GlobalStylesConfig;
  public socialMediaConfig?: SocialMediaConfig;
  public footerConfig?: FooterConfig;
  public contentBlocks?: ContentBlock[];
  public usageCount!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

NewsletterTemplate.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    isDefault: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    previewThumbnailUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    globalStyles: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    socialMediaConfig: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    footerConfig: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    contentBlocks: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    usageCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    tableName: 'NewsletterTemplates',
    timestamps: true,
    indexes: [
      {
        fields: ['isDefault'],
      },
      {
        fields: ['name'],
      },
    ],
  }
);

export default NewsletterTemplate;
