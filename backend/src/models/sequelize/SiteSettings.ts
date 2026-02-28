import { Model, DataTypes } from 'sequelize';
import sequelize from '../../config/database';

// SiteSettings attributes interface
export interface SiteSettingsAttributes {
  id: string;
  
  // Site Identity
  siteName_en: string;
  siteName_sv: string;
  tagline_en: string;
  tagline_sv: string;
  logoUrl: string;
  logoFile: string | null; // For uploaded logo file path
  faviconUrl: string;
  faviconFile: string | null; // For uploaded favicon file path
  
  // SEO
  metaTitle_en: string;
  metaTitle_sv: string;
  metaDescription_en: string;
  metaDescription_sv: string;
  metaKeywords_en: string;
  metaKeywords_sv: string;
  
  // Contact Information
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  postalCode: string;
  
  // Social Media
  facebookUrl: string | null;
  facebookIcon: string | null;
  twitterUrl: string | null;
  twitterIcon: string | null;
  instagramUrl: string | null;
  instagramIcon: string | null;
  linkedinUrl: string | null;
  linkedinIcon: string | null;
  youtubeUrl: string | null;
  youtubeIcon: string | null;
  githubUrl: string | null;
  
  // Footer
  copyrightText_en: string;
  copyrightText_sv: string;
  footerDescription_en: string;
  footerDescription_sv: string;
  
  // Landing Page Content
  // Hero Section
  heroStatus_en: string;
  heroStatus_sv: string;
  heroFallbackText_en: string;
  heroFallbackText_sv: string;
  heroButtonPrimary_en: string;
  heroButtonPrimary_sv: string;
  heroButtonSecondary_en: string;
  heroButtonSecondary_sv: string;
  // Portfolio Section
  portfolioTitle_en: string;
  portfolioTitle_sv: string;
  portfolioSubtitle_en: string;
  portfolioSubtitle_sv: string;
  portfolioEmptyMessage_en: string;
  portfolioEmptyMessage_sv: string;
  // Services Section
  servicesTitle_en: string;
  servicesTitle_sv: string;
  servicesSubtitle_en: string;
  servicesSubtitle_sv: string;
  servicesEmptyMessage_en: string;
  servicesEmptyMessage_sv: string;
  // Contact Section
  contactTitle_en: string;
  contactTitle_sv: string;
  contactSubtitle_en: string;
  contactSubtitle_sv: string;
  contactEmailLabel_en: string;
  contactEmailLabel_sv: string;
  contactPhoneLabel_en: string;
  contactPhoneLabel_sv: string;
  
  // Analytics & Tracking
  googleAnalyticsId: string | null;
  facebookPixelId: string | null;
  googleAdSenseId: string | null;
  googleAdSenseScript: string | null;
  
  // Payment Gateways
  stripePublicKey: string | null;
  stripeSecretKey: string | null;
  klarnaApiKey: string | null;
  klarnaApiSecret: string | null;
  paypalClientId: string | null;
  paypalClientSecret: string | null;
  
  // Ad Banners
  enableAdBanners: boolean;
  headerAdBannerCode: string | null;
  sidebarAdBannerCode: string | null;
  footerAdBannerCode: string | null;
  
  // Business Hours
  businessHours: string | null; // JSON string
  
  // Maintenance Mode
  maintenanceMode: boolean;
  maintenanceMessage_en: string | null;
  maintenanceMessage_sv: string | null;

  // Feature Section
  featureSectionTitle_en: string;
  featureSectionTitle_sv: string;
  featureSectionSubtitle_en: string;
  featureSectionSubtitle_sv: string;
  featureSectionImageFile: string | null;
  featureSectionMobileImageFile: string | null;

  // Gaming PC Section
  gamingPcSectionVisible: boolean;
  gamingPcBadge_en: string;
  gamingPcBadge_sv: string;
  gamingPcTitle_en: string;
  gamingPcTitle_sv: string;
  gamingPcTagline_en: string;
  gamingPcTagline_sv: string;
  gamingPcDescription_en: string;
  gamingPcDescription_sv: string;
  gamingPcButtonPrimary_en: string;
  gamingPcButtonPrimary_sv: string;
  gamingPcButtonSecondary_en: string;
  gamingPcButtonSecondary_sv: string;
  gamingPcShowWarranty: boolean;
  gamingPcWarrantyYears: number;
  gamingPcWarrantyLabel_en: string;
  gamingPcWarrantyLabel_sv: string;
  // Circle Badge 2
  gamingPcShowCircleBadge2: boolean;
  gamingPcCircleBadge2Value: number | null;
  gamingPcCircleBadge2Label_en: string | null;
  gamingPcCircleBadge2Label_sv: string | null;
  // Circle Badge 3
  gamingPcShowCircleBadge3: boolean;
  gamingPcCircleBadge3Value: number | null;
  gamingPcCircleBadge3Label_en: string | null;
  gamingPcCircleBadge3Label_sv: string | null;
  gamingPcSectionTitle_en: string;
  gamingPcSectionTitle_sv: string;
  gamingPcViewAllButton_en: string;
  gamingPcViewAllButton_sv: string;
  gamingPcEmptyMessage_en: string;
  gamingPcEmptyMessage_sv: string;

  // Cookie Consent
  cookieConsentEnabled: boolean;
  cookieConsentTitle_en: string;
  cookieConsentTitle_sv: string;
  cookieConsentDescription_en: string;
  cookieConsentDescription_sv: string;
  cookieConsentAcceptButton_en: string;
  cookieConsentAcceptButton_sv: string;
  cookieConsentReadMoreType: string;
  cookieConsentReadMoreInternal: string | null;
  cookieConsentReadMoreExternal: string | null;
  cookieConsentExpiryDays: number;

  createdAt?: Date;
  updatedAt?: Date;
}

// SiteSettings model class
class SiteSettings extends Model<SiteSettingsAttributes> implements SiteSettingsAttributes {
  public id!: string;
  
  // Site Identity
  public siteName_en!: string;
  public siteName_sv!: string;
  public tagline_en!: string;
  public tagline_sv!: string;
  public logoUrl!: string;
  public logoFile!: string | null;
  public faviconUrl!: string;
  public faviconFile!: string | null;
  
  // SEO
  public metaTitle_en!: string;
  public metaTitle_sv!: string;
  public metaDescription_en!: string;
  public metaDescription_sv!: string;
  public metaKeywords_en!: string;
  public metaKeywords_sv!: string;
  
  // Contact Information
  public email!: string;
  public phone!: string;
  public address!: string;
  public city!: string;
  public country!: string;
  public postalCode!: string;
  
  // Social Media
  public facebookUrl!: string | null;
  public facebookIcon!: string | null;
  public twitterUrl!: string | null;
  public twitterIcon!: string | null;
  public instagramUrl!: string | null;
  public instagramIcon!: string | null;
  public linkedinUrl!: string | null;
  public linkedinIcon!: string | null;
  public youtubeUrl!: string | null;
  public youtubeIcon!: string | null;
  public githubUrl!: string | null;
  
  // Footer
  public copyrightText_en!: string;
  public copyrightText_sv!: string;
  public footerDescription_en!: string;
  public footerDescription_sv!: string;
  
  // Landing Page Content
  public heroStatus_en!: string;
  public heroStatus_sv!: string;
  public heroFallbackText_en!: string;
  public heroFallbackText_sv!: string;
  public heroButtonPrimary_en!: string;
  public heroButtonPrimary_sv!: string;
  public heroButtonSecondary_en!: string;
  public heroButtonSecondary_sv!: string;
  public portfolioTitle_en!: string;
  public portfolioTitle_sv!: string;
  public portfolioSubtitle_en!: string;
  public portfolioSubtitle_sv!: string;
  public portfolioEmptyMessage_en!: string;
  public portfolioEmptyMessage_sv!: string;
  public servicesTitle_en!: string;
  public servicesTitle_sv!: string;
  public servicesSubtitle_en!: string;
  public servicesSubtitle_sv!: string;
  public servicesEmptyMessage_en!: string;
  public servicesEmptyMessage_sv!: string;
  public contactTitle_en!: string;
  public contactTitle_sv!: string;
  public contactSubtitle_en!: string;
  public contactSubtitle_sv!: string;
  public contactEmailLabel_en!: string;
  public contactEmailLabel_sv!: string;
  public contactPhoneLabel_en!: string;
  public contactPhoneLabel_sv!: string;
  
  // Analytics
  public googleAnalyticsId!: string | null;
  public facebookPixelId!: string | null;
  public googleAdSenseId!: string | null;
  public googleAdSenseScript!: string | null;
  
  // Payment Gateways
  public stripePublicKey!: string | null;
  public stripeSecretKey!: string | null;
  public klarnaApiKey!: string | null;
  public klarnaApiSecret!: string | null;
  public paypalClientId!: string | null;
  public paypalClientSecret!: string | null;
  
  // Ad Banners
  public enableAdBanners!: boolean;
  public headerAdBannerCode!: string | null;
  public sidebarAdBannerCode!: string | null;
  public footerAdBannerCode!: string | null;
  
  // Business Hours
  public businessHours!: string | null;
  
  // Maintenance
  public maintenanceMode!: boolean;
  public maintenanceMessage_en!: string | null;
  public maintenanceMessage_sv!: string | null;

  // Feature Section
  public featureSectionTitle_en!: string;
  public featureSectionTitle_sv!: string;
  public featureSectionSubtitle_en!: string;
  public featureSectionSubtitle_sv!: string;
  public featureSectionImageFile!: string | null;
  public featureSectionMobileImageFile!: string | null;

  // Gaming PC Section
  public gamingPcSectionVisible!: boolean;
  public gamingPcBadge_en!: string;
  public gamingPcBadge_sv!: string;
  public gamingPcTitle_en!: string;
  public gamingPcTitle_sv!: string;
  public gamingPcTagline_en!: string;
  public gamingPcTagline_sv!: string;
  public gamingPcDescription_en!: string;
  public gamingPcDescription_sv!: string;
  public gamingPcButtonPrimary_en!: string;
  public gamingPcButtonPrimary_sv!: string;
  public gamingPcButtonSecondary_en!: string;
  public gamingPcButtonSecondary_sv!: string;
  public gamingPcShowWarranty!: boolean;
  public gamingPcWarrantyYears!: number;
  public gamingPcWarrantyLabel_en!: string;
  public gamingPcWarrantyLabel_sv!: string;
  // Circle Badge 2
  public gamingPcShowCircleBadge2!: boolean;
  public gamingPcCircleBadge2Value!: number | null;
  public gamingPcCircleBadge2Label_en!: string | null;
  public gamingPcCircleBadge2Label_sv!: string | null;
  // Circle Badge 3
  public gamingPcShowCircleBadge3!: boolean;
  public gamingPcCircleBadge3Value!: number | null;
  public gamingPcCircleBadge3Label_en!: string | null;
  public gamingPcCircleBadge3Label_sv!: string | null;
  public gamingPcSectionTitle_en!: string;
  public gamingPcSectionTitle_sv!: string;
  public gamingPcViewAllButton_en!: string;
  public gamingPcViewAllButton_sv!: string;
  public gamingPcEmptyMessage_en!: string;
  public gamingPcEmptyMessage_sv!: string;

  // Cookie Consent
  public cookieConsentEnabled!: boolean;
  public cookieConsentTitle_en!: string;
  public cookieConsentTitle_sv!: string;
  public cookieConsentDescription_en!: string;
  public cookieConsentDescription_sv!: string;
  public cookieConsentAcceptButton_en!: string;
  public cookieConsentAcceptButton_sv!: string;
  public cookieConsentReadMoreType!: string;
  public cookieConsentReadMoreInternal!: string | null;
  public cookieConsentReadMoreExternal!: string | null;
  public cookieConsentExpiryDays!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Initialize model
SiteSettings.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    // Site Identity
    siteName_en: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: 'My Company',
    },
    siteName_sv: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: 'Mitt Företag',
    },
    tagline_en: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: 'Your tagline here',
    },
    tagline_sv: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: 'Din slogan här',
    },
    logoUrl: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '/logo.png',
    },
    logoFile: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Base64 encoded logo data or file path',
    },
    faviconUrl: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '/favicon.ico',
    },
    faviconFile: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Base64 encoded favicon data or file path',
    },
    // SEO
    metaTitle_en: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: 'My Company - Web Design & Development',
    },
    metaTitle_sv: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: 'Mitt Företag - Webbdesign & Utveckling',
    },
    metaDescription_en: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: 'Professional web design and development services',
    },
    metaDescription_sv: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: 'Professionella webbdesign- och utvecklingstjänster',
    },
    metaKeywords_en: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: 'web design, web development, portfolio',
    },
    metaKeywords_sv: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: 'webbdesign, webbutveckling, portfolio',
    },
    // Contact
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: 'info@example.com',
    },
    phone: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: '+46 123 456 789',
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: 'Street Address',
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: 'Stockholm',
    },
    country: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: 'Sweden',
    },
    postalCode: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: '12345',
    },
    // Social Media
    facebookUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    facebookIcon: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Base64 encoded Facebook icon image',
    },
    twitterUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    twitterIcon: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Base64 encoded Twitter/X icon image',
    },
    instagramUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    instagramIcon: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Base64 encoded Instagram icon image',
    },
    linkedinUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    linkedinIcon: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Base64 encoded LinkedIn icon image',
    },
    youtubeUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    youtubeIcon: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Base64 encoded YouTube icon image',
    },
    githubUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    // Footer
    copyrightText_en: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: '© 2024 My Company. All rights reserved.',
    },
    copyrightText_sv: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: '© 2024 Mitt Företag. Alla rättigheter förbehållna.',
    },
    footerDescription_en: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: 'We create amazing digital experiences.',
    },
    footerDescription_sv: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: 'Vi skapar fantastiska digitala upplevelser.',
    },
    // Landing Page Content - Hero Section
    heroStatus_en: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: 'Available for new projects',
    },
    heroStatus_sv: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: 'Tillgängliga för nya projekt',
    },
    heroFallbackText_en: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'Agency',
    },
    heroFallbackText_sv: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'Byrå',
    },
    heroButtonPrimary_en: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'View Our Work',
    },
    heroButtonPrimary_sv: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'Se Vårt Arbete',
    },
    heroButtonSecondary_en: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'Contact Us',
    },
    heroButtonSecondary_sv: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'Kontakta Oss',
    },
    // Portfolio Section
    portfolioTitle_en: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: 'Selected Work',
    },
    portfolioTitle_sv: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: 'Utvalda Projekt',
    },
    portfolioSubtitle_en: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: 'We build digital products that help brands grow.',
    },
    portfolioSubtitle_sv: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: 'Vi bygger digitala produkter som hjälper varumärken att växa.',
    },
    portfolioEmptyMessage_en: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: 'Projects coming soon',
    },
    portfolioEmptyMessage_sv: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: 'Projekt kommer snart',
    },
    // Services Section
    servicesTitle_en: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: 'Expertise',
    },
    servicesTitle_sv: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: 'Expertis',
    },
    servicesSubtitle_en: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: 'High-end solutions for ambitious companies.',
    },
    servicesSubtitle_sv: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: 'Högklassiga lösningar för ambitiösa företag.',
    },
    servicesEmptyMessage_en: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: 'No services available',
    },
    servicesEmptyMessage_sv: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: 'Inga tjänster tillgängliga',
    },
    // Contact Section
    contactTitle_en: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: 'Let\'s work together.',
    },
    contactTitle_sv: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: 'Låt oss samarbeta.',
    },
    contactSubtitle_en: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: 'Ready to start your next project? Drop us a line.',
    },
    contactSubtitle_sv: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: 'Redo att starta ditt nästa projekt? Hör av dig till oss.',
    },
    contactEmailLabel_en: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'Email',
    },
    contactEmailLabel_sv: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'E-post',
    },
    contactPhoneLabel_en: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'Phone',
    },
    contactPhoneLabel_sv: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'Telefon',
    },
    // Analytics
    googleAnalyticsId: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    facebookPixelId: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    googleAdSenseId: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    googleAdSenseScript: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Full AdSense script code',
    },
    // Payment Gateways
    stripePublicKey: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    stripeSecretKey: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    klarnaApiKey: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    klarnaApiSecret: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    paypalClientId: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    paypalClientSecret: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    // Ad Banners
    enableAdBanners: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    headerAdBannerCode: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    sidebarAdBannerCode: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    footerAdBannerCode: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    // Business Hours
    businessHours: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'JSON string with business hours',
    },
    // Maintenance
    maintenanceMode: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    maintenanceMessage_en: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    maintenanceMessage_sv: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    // Feature Section
    featureSectionTitle_en: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: 'What We Offer',
    },
    featureSectionTitle_sv: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: 'Vad Vi Erbjuder',
    },
    featureSectionSubtitle_en: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: 'Our Core Capabilities',
    },
    featureSectionSubtitle_sv: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: 'Våra Kärnkompetenser',
    },
    featureSectionImageFile: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    featureSectionMobileImageFile: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    // Gaming PC Section
    gamingPcSectionVisible: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    gamingPcBadge_en: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: 'Gaming PCs',
    },
    gamingPcBadge_sv: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: 'Speldatorer',
    },
    gamingPcTitle_en: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: 'Pre-Built Gaming PCs',
    },
    gamingPcTitle_sv: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: 'Förkonfigurerade Speldatorer',
    },
    gamingPcTagline_en: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: 'No compromise. Pure Power.',
    },
    gamingPcTagline_sv: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: 'Inga kompromisser. Ren kraft.',
    },
    gamingPcDescription_en: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: 'Premium components, expertly assembled, and ready to game. Same components a demanding user would choose, optimized for gaming.',
    },
    gamingPcDescription_sv: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: 'Premiumkomponenter, fackmässigt monterade och redo för gaming. Samma komponenter som en krävande användare skulle välja, optimerade för gaming.',
    },
    gamingPcButtonPrimary_en: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: 'Pre-Built PCs',
    },
    gamingPcButtonPrimary_sv: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: 'Färdigbyggda datorer',
    },
    gamingPcButtonSecondary_en: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: 'Build Your Own',
    },
    gamingPcButtonSecondary_sv: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: 'Välj komponenter själv',
    },
    gamingPcShowWarranty: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    gamingPcWarrantyYears: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 3,
    },
    gamingPcWarrantyLabel_en: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: 'Year Warranty',
    },
    gamingPcWarrantyLabel_sv: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: 'Års Garanti',
    },
    // Circle Badge 2
    gamingPcShowCircleBadge2: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    gamingPcCircleBadge2Value: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    gamingPcCircleBadge2Label_en: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    gamingPcCircleBadge2Label_sv: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    // Circle Badge 3
    gamingPcShowCircleBadge3: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    gamingPcCircleBadge3Value: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    gamingPcCircleBadge3Label_en: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    gamingPcCircleBadge3Label_sv: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    gamingPcSectionTitle_en: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: 'Popular Pre-Built Models',
    },
    gamingPcSectionTitle_sv: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: 'Populära förkonfigurerade modeller',
    },
    gamingPcViewAllButton_en: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: 'See all pre-built models',
    },
    gamingPcViewAllButton_sv: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: 'Se alla färdigbyggda modeller',
    },
    gamingPcEmptyMessage_en: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: 'No pre-built PCs available',
    },
    gamingPcEmptyMessage_sv: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: 'Inga färdigbyggda datorer tillgängliga',
    },
    // Cookie Consent
    cookieConsentEnabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    cookieConsentTitle_en: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: 'We use cookies',
    },
    cookieConsentTitle_sv: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: 'Vi använder cookies',
    },
    cookieConsentDescription_en: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: 'This website uses cookies to ensure you get the best experience. By clicking "I accept", you consent to the use of all cookies in accordance with our cookie policy.',
    },
    cookieConsentDescription_sv: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: 'Denna webbplats använder cookies för att säkerställa att du får den bästa upplevelsen. Genom att klicka på "Jag accepterar" samtycker du till användningen av alla cookies i enlighet med vår cookiepolicy.',
    },
    cookieConsentAcceptButton_en: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: 'I accept',
    },
    cookieConsentAcceptButton_sv: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: 'Jag accepterar',
    },
    cookieConsentReadMoreType: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'internal',
    },
    cookieConsentReadMoreInternal: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    cookieConsentReadMoreExternal: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    cookieConsentExpiryDays: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 365,
    },
  },
  {
    sequelize,
    tableName: 'SiteSettings',
    timestamps: true,
  }
);

export default SiteSettings;
