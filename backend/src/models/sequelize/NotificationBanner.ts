import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../../config/database';

export interface NotificationBannerAttributes {
  id: string;
  title: string;
  message_en: string;
  message_sv: string;
  linkUrl: string | null;
  linkText_en: string | null;
  linkText_sv: string | null;
  couponCode: string | null;
  showPhone: boolean;
  showEmail: boolean;
  backgroundColor: string;
  textColor: string;
  backgroundType: 'solid' | 'gradient';
  gradientEndColor: string | null;
  gradientDirection: string | null;
  fontWeight: 'normal' | 'medium' | 'semibold' | 'bold';
  fontSize: 'xs' | 'sm' | 'base' | 'lg';
  icon: string | null;
  isActive: boolean;
  showOnAuthPages: boolean;
  showOnAdminPanel: boolean;
  isDismissible: boolean;
  startDate: Date | null;
  endDate: Date | null;
  showOnPages: string[];
  priority: number;
  impressions: number;
  clicks: number;
  dismissals: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface NotificationBannerCreationAttributes
  extends Optional<
    NotificationBannerAttributes,
    | 'id'
    | 'linkUrl'
    | 'linkText_en'
    | 'linkText_sv'
    | 'couponCode'
    | 'showPhone'
    | 'showEmail'
    | 'backgroundColor'
    | 'textColor'
    | 'backgroundType'
    | 'gradientEndColor'
    | 'gradientDirection'
    | 'fontWeight'
    | 'fontSize'
    | 'icon'
    | 'isActive'
    | 'showOnAuthPages'
    | 'showOnAdminPanel'
    | 'isDismissible'
    | 'startDate'
    | 'endDate'
    | 'showOnPages'
    | 'priority'
    | 'impressions'
    | 'clicks'
    | 'dismissals'
  > {}

class NotificationBanner
  extends Model<NotificationBannerAttributes, NotificationBannerCreationAttributes>
  implements NotificationBannerAttributes
{
  public id!: string;
  public title!: string;
  public message_en!: string;
  public message_sv!: string;
  public linkUrl!: string | null;
  public linkText_en!: string | null;
  public linkText_sv!: string | null;
  public couponCode!: string | null;
  public showPhone!: boolean;
  public showEmail!: boolean;
  public backgroundColor!: string;
  public textColor!: string;
  public backgroundType!: 'solid' | 'gradient';
  public gradientEndColor!: string | null;
  public gradientDirection!: string | null;
  public fontWeight!: 'normal' | 'medium' | 'semibold' | 'bold';
  public fontSize!: 'xs' | 'sm' | 'base' | 'lg';
  public icon!: string | null;
  public isActive!: boolean;
  public showOnAuthPages!: boolean;
  public showOnAdminPanel!: boolean;
  public isDismissible!: boolean;
  public startDate!: Date | null;
  public endDate!: Date | null;
  public showOnPages!: string[];
  public priority!: number;
  public impressions!: number;
  public clicks!: number;
  public dismissals!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

NotificationBanner.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    message_en: {
      type: DataTypes.STRING(300),
      allowNull: false,
    },
    message_sv: {
      type: DataTypes.STRING(300),
      allowNull: false,
    },
    linkUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    linkText_en: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    linkText_sv: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    couponCode: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    showPhone: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    showEmail: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    backgroundColor: {
      type: DataTypes.STRING(7),
      allowNull: false,
      defaultValue: '#1e40af',
    },
    textColor: {
      type: DataTypes.STRING(7),
      allowNull: false,
      defaultValue: '#ffffff',
    },
    backgroundType: {
      type: DataTypes.ENUM('solid', 'gradient'),
      allowNull: false,
      defaultValue: 'solid',
    },
    gradientEndColor: {
      type: DataTypes.STRING(7),
      allowNull: true,
    },
    gradientDirection: {
      type: DataTypes.STRING(20),
      allowNull: true,
      defaultValue: 'to right',
    },
    fontWeight: {
      type: DataTypes.ENUM('normal', 'medium', 'semibold', 'bold'),
      allowNull: false,
      defaultValue: 'medium',
    },
    fontSize: {
      type: DataTypes.ENUM('xs', 'sm', 'base', 'lg'),
      allowNull: false,
      defaultValue: 'sm',
    },
    icon: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    showOnAuthPages: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    showOnAdminPanel: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    isDismissible: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    showOnPages: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: ['all'],
    },
    priority: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    impressions: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: 0,
    },
    clicks: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: 0,
    },
    dismissals: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    tableName: 'NotificationBanners',
    timestamps: true,
    indexes: [
      { fields: ['isActive'] },
      { fields: ['priority'] },
      { fields: ['startDate', 'endDate'] },
    ],
  }
);

export default NotificationBanner;
