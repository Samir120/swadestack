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

  // Coupon <-> Order (One-to-Many)
  Coupon.hasMany(Order, {
    foreignKey: 'couponId',
    as: 'orders',
  });

  Order.belongsTo(Coupon, {
    foreignKey: 'couponId',
    as: 'coupon',
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
};
