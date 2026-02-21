import sequelize from '../../config/database';
import User from './User';
import Service from './Service';
import ServiceCategory from './ServiceCategory';
import Order from './Order';
import OrderItem from './OrderItem';
import PortfolioItem from './PortfolioItem';
import Payment from './Payment';
import TeamMember from './TeamMember';
import Email from './Email';
import NewsletterSubscriber from './NewsletterSubscriber';
import FooterCategoryTitle from './FooterCategoryTitle';
import FooterMainPage from './FooterMainPage';
import ContactMessage from './ContactMessage';
import PCComponent from './PCComponent';
import PCCompatibilityRule from './PCCompatibilityRule';
import PCConfiguration from './PCConfiguration';
import PCBuildServiceOption from './PCBuildServiceOption';
import Feature from './Feature';
import RefreshToken from './RefreshToken';
import CompanyLegalSettings from './CompanyLegalSettings';
import Coupon from './Coupon';
import NotificationBanner from './NotificationBanner';
import VatSettings from './VatSettings';
import Address from './Address';
import AuditLog from './AuditLog';
import Cart from './Cart';
import CartItem from './CartItem';
import InternalNote from './InternalNote';
import LoginAttempt from './LoginAttempt';
import OrderAdjustment from './OrderAdjustment';
import NewsletterSegment from './NewsletterSegment';
import NewsletterSegmentMember from './NewsletterSegmentMember';
import NewsletterCampaign from './NewsletterCampaign';
import NewsletterCampaignStats from './NewsletterCampaignStats';
import NewsletterSendLog from './NewsletterSendLog';
import NewsletterTemplate from './NewsletterTemplate';

// Define associations
const initializeAssociations = () => {
  // User <-> Orders (One-to-Many, Optional)
  User.hasMany(Order, {
    foreignKey: 'userId',
    as: 'orders',
  });

  User.hasMany(Email, { foreignKey: 'userId', as: 'emails' });
  Email.belongsTo(User, { foreignKey: 'userId', as: 'user' });
  
  Order.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user',
  });

  // Order <-> OrderItems (One-to-Many)
  Order.hasMany(OrderItem, {
    foreignKey: 'orderId',
    as: 'items',
    onDelete: 'CASCADE',
  });
  
  OrderItem.belongsTo(Order, {
    foreignKey: 'orderId',
    as: 'order',
  });

  Order.hasMany(Email, { foreignKey: 'orderId', as: 'emails' });
  Email.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

  // Service <-> OrderItems (One-to-Many)
  Service.hasMany(OrderItem, {
    foreignKey: 'serviceId',
    as: 'orderItems',
  });

  OrderItem.belongsTo(Service, {
    foreignKey: 'serviceId',
    as: 'service',
  });

  // PCComponent <-> OrderItems (One-to-Many)
  PCComponent.hasMany(OrderItem, {
    foreignKey: 'pcComponentId',
    as: 'orderItems',
  });

  OrderItem.belongsTo(PCComponent, {
    foreignKey: 'pcComponentId',
    as: 'pcComponent',
  });

  // Order <-> Payments (One-to-Many)
  Order.hasMany(Payment, {
    foreignKey: 'orderId',
    as: 'payments',
    onDelete: 'CASCADE',
  });

  Payment.belongsTo(Order, {
    foreignKey: 'orderId',
    as: 'order',
  });

  // ServiceCategory <-> Service (One-to-Many)
  ServiceCategory.hasMany(Service, {
    foreignKey: 'serviceCategoryId',
    as: 'services',
  });

  Service.belongsTo(ServiceCategory, {
    foreignKey: 'serviceCategoryId',
    as: 'serviceCategory',
  });

  // FooterCategoryTitle <-> FooterMainPage (One-to-Many)
  FooterCategoryTitle.hasMany(FooterMainPage, {
    foreignKey: 'footerCategoryTitleId',
    as: 'pages',
    onDelete: 'CASCADE',
  });

  FooterMainPage.belongsTo(FooterCategoryTitle, {
    foreignKey: 'footerCategoryTitleId',
    as: 'category',
  });

  // User <-> ContactMessages (One-to-Many for admin replies)
  User.hasMany(ContactMessage, {
    foreignKey: 'repliedBy',
    as: 'repliedContactMessages',
  });

  ContactMessage.belongsTo(User, {
    foreignKey: 'repliedBy',
    as: 'admin',
  });

  // User <-> RefreshTokens (One-to-Many)
  User.hasMany(RefreshToken, {
    foreignKey: 'userId',
    as: 'refreshTokens',
    onDelete: 'CASCADE',
  });

  RefreshToken.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user',
  });

  // User <-> PCConfiguration (One-to-Many)
  User.hasMany(PCConfiguration, {
    foreignKey: 'userId',
    as: 'pcConfigurations',
    onDelete: 'CASCADE',
  });

  PCConfiguration.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user',
  });

  // Order <-> PCConfiguration (One-to-Many, Optional)
  Order.hasMany(PCConfiguration, {
    foreignKey: 'orderId',
    as: 'pcConfigurations',
  });

  PCConfiguration.belongsTo(Order, {
    foreignKey: 'orderId',
    as: 'order',
  });

  // User <-> Addresses (One-to-Many)
  User.hasMany(Address, {
    foreignKey: 'userId',
    as: 'addresses',
    onDelete: 'CASCADE',
  });

  Address.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user',
  });

  // Coupon <-> Order (One-to-Many)
  Coupon.hasMany(Order, {
    foreignKey: 'couponId',
    as: 'orders',
  });

  Order.belongsTo(Coupon, {
    foreignKey: 'couponId',
    as: 'coupon',
  });

  // User <-> Cart (One-to-One)
  User.hasOne(Cart, {
    foreignKey: 'userId',
    as: 'cart',
    onDelete: 'CASCADE',
  });

  Cart.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user',
  });

  // Cart <-> CartItems (One-to-Many)
  Cart.hasMany(CartItem, {
    foreignKey: 'cartId',
    as: 'items',
    onDelete: 'CASCADE',
  });

  CartItem.belongsTo(Cart, {
    foreignKey: 'cartId',
    as: 'cart',
  });

  // CartItem <-> Service (Optional)
  CartItem.belongsTo(Service, {
    foreignKey: 'serviceId',
    as: 'service',
  });

  // CartItem <-> PCConfiguration (Optional)
  CartItem.belongsTo(PCConfiguration, {
    foreignKey: 'pcConfigurationId',
    as: 'pcConfiguration',
  });

  // CartItem <-> PCComponent (Optional)
  CartItem.belongsTo(PCComponent, {
    foreignKey: 'pcComponentId',
    as: 'pcComponent',
  });

  // User <-> LoginAttempts (One-to-Many)
  User.hasMany(LoginAttempt, {
    foreignKey: 'userId',
    as: 'loginAttempts',
    onDelete: 'SET NULL',
  });

  LoginAttempt.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user',
  });

  // InternalNote <-> User (author)
  InternalNote.belongsTo(User, {
    foreignKey: 'authorId',
    as: 'author',
  });

  // Order <-> OrderAdjustments (One-to-Many)
  Order.hasMany(OrderAdjustment, {
    foreignKey: 'orderId',
    as: 'adjustments',
    onDelete: 'CASCADE',
  });

  OrderAdjustment.belongsTo(Order, {
    foreignKey: 'orderId',
    as: 'order',
  });

  // User <-> NewsletterSubscriber (One-to-One, Optional)
  User.hasOne(NewsletterSubscriber, {
    foreignKey: 'userId',
    as: 'newsletterSubscription',
  });

  NewsletterSubscriber.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user',
  });

  // NewsletterSegment <-> NewsletterSegmentMember (One-to-Many)
  NewsletterSegment.hasMany(NewsletterSegmentMember, {
    foreignKey: 'segmentId',
    as: 'members',
    onDelete: 'CASCADE',
  });

  NewsletterSegmentMember.belongsTo(NewsletterSegment, {
    foreignKey: 'segmentId',
    as: 'segment',
  });

  // NewsletterSubscriber <-> NewsletterSegmentMember (One-to-Many)
  NewsletterSubscriber.hasMany(NewsletterSegmentMember, {
    foreignKey: 'subscriberId',
    as: 'segmentMemberships',
    onDelete: 'CASCADE',
  });

  NewsletterSegmentMember.belongsTo(NewsletterSubscriber, {
    foreignKey: 'subscriberId',
    as: 'subscriber',
  });

  // NewsletterCampaign <-> NewsletterCampaignStats (One-to-One)
  NewsletterCampaign.hasOne(NewsletterCampaignStats, {
    foreignKey: 'campaignId',
    as: 'stats',
    onDelete: 'CASCADE',
  });

  NewsletterCampaignStats.belongsTo(NewsletterCampaign, {
    foreignKey: 'campaignId',
    as: 'campaign',
  });

  // NewsletterCampaign <-> NewsletterSendLog (One-to-Many)
  NewsletterCampaign.hasMany(NewsletterSendLog, {
    foreignKey: 'campaignId',
    as: 'sendLogs',
    onDelete: 'CASCADE',
  });

  NewsletterSendLog.belongsTo(NewsletterCampaign, {
    foreignKey: 'campaignId',
    as: 'campaign',
  });

  // NewsletterSubscriber <-> NewsletterSendLog (One-to-Many)
  NewsletterSubscriber.hasMany(NewsletterSendLog, {
    foreignKey: 'subscriberId',
    as: 'sendLogs',
    onDelete: 'CASCADE',
  });

  NewsletterSendLog.belongsTo(NewsletterSubscriber, {
    foreignKey: 'subscriberId',
    as: 'subscriber',
  });

  // User <-> NewsletterCampaign (sentByAdmin)
  User.hasMany(NewsletterCampaign, {
    foreignKey: 'sentByAdminId',
    as: 'sentCampaigns',
  });

  NewsletterCampaign.belongsTo(User, {
    foreignKey: 'sentByAdminId',
    as: 'sentByAdmin',
  });

  // NewsletterCampaign <-> NewsletterTemplate (Many-to-One, Optional)
  NewsletterTemplate.hasMany(NewsletterCampaign, {
    foreignKey: 'templateId',
    as: 'campaigns',
  });

  NewsletterCampaign.belongsTo(NewsletterTemplate, {
    foreignKey: 'templateId',
    as: 'template',
  });
};

// Initialize associations
initializeAssociations();

// Export all models
export {
  sequelize,
  User,
  Service,
  ServiceCategory,
  Order,
  Email,
  NewsletterSubscriber,
  OrderItem,
  PortfolioItem,
  Payment,
  TeamMember,
  FooterCategoryTitle,
  FooterMainPage,
  ContactMessage,
  PCComponent,
  PCCompatibilityRule,
  PCConfiguration,
  PCBuildServiceOption,
  Feature,
  RefreshToken,
  CompanyLegalSettings,
  Coupon,
  NotificationBanner,
  VatSettings,
  Address,
  AuditLog,
  Cart,
  CartItem,
  InternalNote,
  LoginAttempt,
  OrderAdjustment,
  NewsletterSegment,
  NewsletterSegmentMember,
  NewsletterCampaign,
  NewsletterCampaignStats,
  NewsletterSendLog,
  NewsletterTemplate,
};

// Export default object with all models
export default {
  sequelize,
  User,
  Service,
  ServiceCategory,
  Order,
  Email,
  NewsletterSubscriber,
  OrderItem,
  PortfolioItem,
  Payment,
  TeamMember,
  FooterCategoryTitle,
  FooterMainPage,
  ContactMessage,
  PCComponent,
  PCCompatibilityRule,
  PCConfiguration,
  PCBuildServiceOption,
  Feature,
  RefreshToken,
  CompanyLegalSettings,
  Coupon,
  NotificationBanner,
  VatSettings,
  Address,
  AuditLog,
  Cart,
  CartItem,
  InternalNote,
  LoginAttempt,
  OrderAdjustment,
  NewsletterSegment,
  NewsletterSegmentMember,
  NewsletterCampaign,
  NewsletterCampaignStats,
  NewsletterSendLog,
  NewsletterTemplate,
};
