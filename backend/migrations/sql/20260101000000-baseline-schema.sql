CREATE TYPE public."enum_Addresses_type" AS ENUM (
    'shipping',
    'billing'
);

CREATE TYPE public."enum_ContactMessages_language" AS ENUM (
    'en',
    'sv'
);

CREATE TYPE public."enum_ContactMessages_status" AS ENUM (
    'new',
    'read',
    'replied',
    'archived'
);

CREATE TYPE public."enum_Emails_priority" AS ENUM (
    'low',
    'normal',
    'high'
);

CREATE TYPE public."enum_Emails_status" AS ENUM (
    'pending',
    'sent',
    'failed',
    'queued'
);

CREATE TYPE public."enum_Emails_templateType" AS ENUM (
    'welcome',
    'email-verification',
    'order-confirmation',
    'partial-payment-confirmation',
    'final-payment-confirmation',
    'order-status-update',
    'contact-form',
    'contact-form-admin',
    'newsletter',
    'password-reset',
    'newsletter-subscription',
    'cart-reminder',
    'admin-custom',
    'order-balance-due',
    'two-factor-recovery'
);

CREATE TYPE public."enum_InternalNotes_targetType" AS ENUM (
    'customer',
    'order'
);

CREATE TYPE public."enum_NewsletterSubscribers_language" AS ENUM (
    'en',
    'sv'
);

CREATE TYPE public."enum_OrderAdjustments_type" AS ENUM (
    'discount',
    'fee',
    'correction',
    'refund'
);

CREATE TYPE public."enum_Orders_status" AS ENUM (
    'pending',
    'partial_paid',
    'awaiting_final',
    'paid',
    'cancelled',
    'completed'
);

CREATE TYPE public."enum_PCBuildServiceOptions_priceType" AS ENUM (
    'fixed',
    'percentage'
);

CREATE TYPE public."enum_PCCompatibilityRules_ruleType" AS ENUM (
    'cpu_motherboard',
    'motherboard_ram',
    'gpu_case',
    'psu_power',
    'storage_motherboard',
    'cooling_cpu'
);

CREATE TYPE public."enum_PCCompatibilityRules_severity" AS ENUM (
    'error',
    'warning'
);

CREATE TYPE public."enum_PCComponents_componentType" AS ENUM (
    'cpu',
    'motherboard',
    'ram',
    'gpu',
    'ssd',
    'hdd',
    'psu',
    'case',
    'cooling',
    'optical',
    'fan',
    'os'
);

CREATE TYPE public."enum_PCConfigurations_status" AS ENUM (
    'draft',
    'saved',
    'ordered'
);

CREATE TYPE public."enum_PCConfigurations_tier" AS ENUM (
    'core',
    'pro',
    'ultra',
    'custom'
);

CREATE TYPE public."enum_ProfitMarginRules_marginType" AS ENUM (
    'percentage',
    'flat'
);

CREATE TYPE public."enum_ProfitMarginRules_type" AS ENUM (
    'global',
    'category',
    'product'
);

CREATE TYPE public."enum_Users_accountStatus" AS ENUM (
    'active',
    'suspended',
    'deactivated'
);

CREATE TYPE public."enum_Users_role" AS ENUM (
    'admin',
    'user'
);

CREATE TYPE public."enum_Users_userType" AS ENUM (
    'personal',
    'company'
);

CREATE TABLE public."Addresses" (
    id uuid NOT NULL,
    "userId" uuid NOT NULL,
    type public."enum_Addresses_type" NOT NULL,
    "isDefault" boolean DEFAULT false NOT NULL,
    "fullName" character varying(200) NOT NULL,
    company character varying(200),
    "streetAddress" character varying(255) NOT NULL,
    "postalCode" character varying(20) NOT NULL,
    city character varying(100) NOT NULL,
    country character varying(100) DEFAULT 'Sweden'::character varying NOT NULL,
    phone character varying(20),
    "organizationNumber" character varying(50),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);

CREATE TABLE public."AuditLogs" (
    id uuid NOT NULL,
    "adminUserId" uuid NOT NULL,
    "adminUserName" character varying(200) NOT NULL,
    action character varying(100) NOT NULL,
    "targetType" character varying(50) NOT NULL,
    "targetId" uuid NOT NULL,
    details text,
    "ipAddress" character varying(45),
    "createdAt" timestamp with time zone NOT NULL
);

CREATE TABLE public."Banner" (
    id uuid NOT NULL,
    title_en character varying(255) NOT NULL,
    title_sv character varying(255) NOT NULL,
    desc_en text NOT NULL,
    desc_sv text NOT NULL,
    image_url text,
    image_file text,
    is_active boolean DEFAULT true NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    mobile_image_url text,
    mobile_image_file text
);

CREATE TABLE public."CartItems" (
    id uuid NOT NULL,
    "cartId" uuid NOT NULL,
    "serviceId" uuid,
    "pcConfigurationId" uuid,
    quantity integer DEFAULT 1 NOT NULL,
    "itemData" jsonb NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "pcComponentId" uuid
);

CREATE TABLE public."Carts" (
    id uuid NOT NULL,
    "userId" uuid NOT NULL,
    "lastReminderSentAt" timestamp with time zone,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "forceCleared" boolean DEFAULT false NOT NULL,
    "adminModified" boolean DEFAULT false NOT NULL
);

CREATE TABLE public."CompanyLegalSettings" (
    id uuid NOT NULL,
    "companyName" character varying(255) DEFAULT ''::character varying NOT NULL,
    "tradingName" character varying(255),
    "orgNumber" character varying(50) DEFAULT ''::character varying NOT NULL,
    "vatNumber" character varying(50) DEFAULT ''::character varying NOT NULL,
    "managingDirector" character varying(255),
    "streetAddress" character varying(255) DEFAULT ''::character varying NOT NULL,
    "postalCode" character varying(20) DEFAULT ''::character varying NOT NULL,
    city character varying(100) DEFAULT ''::character varying NOT NULL,
    country character varying(100) DEFAULT 'Sweden'::character varying NOT NULL,
    email character varying(255) DEFAULT ''::character varying NOT NULL,
    "phoneNumber" character varying(50) DEFAULT ''::character varying NOT NULL,
    "showCheckoutConsent" boolean DEFAULT false NOT NULL,
    "checkoutConsentText_en" text,
    "checkoutConsentText_sv" text,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "showInvoiceDisclaimer" boolean DEFAULT true NOT NULL,
    "invoiceDisclaimer_en" character varying(500),
    "invoiceDisclaimer_sv" character varying(500),
    "showFooterLegalEntity" boolean DEFAULT true NOT NULL
);

CREATE TABLE public."ContactMessages" (
    id uuid NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    phone character varying(255),
    subject character varying(255) NOT NULL,
    message text NOT NULL,
    language public."enum_ContactMessages_language" DEFAULT 'en'::public."enum_ContactMessages_language" NOT NULL,
    status public."enum_ContactMessages_status" DEFAULT 'new'::public."enum_ContactMessages_status" NOT NULL,
    "isRead" boolean DEFAULT false NOT NULL,
    "adminNotes" text,
    "repliedAt" timestamp with time zone,
    "repliedBy" uuid,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);

CREATE TABLE public."Currencies" (
    id uuid NOT NULL,
    code character varying(3) NOT NULL,
    name character varying(100) NOT NULL,
    symbol character varying(10) NOT NULL,
    "decimalPlaces" integer DEFAULT 2 NOT NULL,
    "isBaseCurrency" boolean DEFAULT false NOT NULL,
    "isDisplayCurrency" boolean DEFAULT false NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);

CREATE TABLE public."Emails" (
    id uuid NOT NULL,
    "to" character varying(255) NOT NULL,
    cc character varying(255),
    bcc character varying(255),
    subject character varying(255) NOT NULL,
    "templateType" public."enum_Emails_templateType" NOT NULL,
    "templateData" jsonb DEFAULT '{}'::jsonb NOT NULL,
    priority public."enum_Emails_priority" DEFAULT 'normal'::public."enum_Emails_priority" NOT NULL,
    status public."enum_Emails_status" DEFAULT 'pending'::public."enum_Emails_status" NOT NULL,
    "sentAt" timestamp with time zone,
    "failedAt" timestamp with time zone,
    "errorMessage" text,
    "retryCount" integer DEFAULT 0 NOT NULL,
    "userId" uuid,
    "orderId" uuid,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);

CREATE TABLE public."ExchangeRates" (
    id uuid NOT NULL,
    "baseCurrency" character varying(3) NOT NULL,
    "targetCurrency" character varying(3) NOT NULL,
    rate numeric(16,8) NOT NULL,
    "fetchedAt" timestamp with time zone NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);

CREATE TABLE public."FooterCategoryTitles" (
    id uuid NOT NULL,
    "categoryTitle_en" character varying(255) NOT NULL,
    "categoryTitle_sv" character varying(255) NOT NULL,
    "includeBusinessName" boolean DEFAULT false NOT NULL,
    "displayOrder" integer DEFAULT 0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);

CREATE TABLE public."FooterMainPages" (
    id uuid NOT NULL,
    "pageName_en" character varying(255) NOT NULL,
    "pageName_sv" character varying(255) NOT NULL,
    "includeBusinessName" boolean DEFAULT false NOT NULL,
    "pageUrl" character varying(500) NOT NULL,
    "footerCategoryTitleId" uuid NOT NULL,
    "displayOrder" integer DEFAULT 0 NOT NULL,
    "availableFrom" timestamp with time zone,
    "availableTo" timestamp with time zone,
    "pageHtmlContent_en" text DEFAULT ''::text NOT NULL,
    "pageHtmlContent_sv" text DEFAULT ''::text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "isHtmlContent" boolean DEFAULT false NOT NULL
);

CREATE TABLE public."InternalNotes" (
    id uuid NOT NULL,
    "targetType" public."enum_InternalNotes_targetType" NOT NULL,
    "targetId" uuid NOT NULL,
    "authorId" uuid NOT NULL,
    "authorName" character varying(200) NOT NULL,
    content text NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);

CREATE TABLE public."LoginAttempts" (
    id uuid NOT NULL,
    "userId" uuid,
    email character varying(255) NOT NULL,
    success boolean NOT NULL,
    "ipAddress" character varying(45),
    "userAgent" text,
    "failureReason" character varying(255),
    "createdAt" timestamp with time zone NOT NULL
);

CREATE TABLE public."NewsletterSubscribers" (
    id uuid NOT NULL,
    email character varying(255) NOT NULL,
    "firstName" character varying(255),
    "lastName" character varying(255),
    "isActive" boolean DEFAULT true NOT NULL,
    "verificationToken" character varying(255),
    "verifiedAt" timestamp with time zone,
    "unsubscribedAt" timestamp with time zone,
    "unsubscribeToken" character varying(255),
    language public."enum_NewsletterSubscribers_language" DEFAULT 'en'::public."enum_NewsletterSubscribers_language" NOT NULL,
    preferences jsonb DEFAULT '{}'::jsonb,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);

CREATE TABLE public."OrderAdjustments" (
    id uuid NOT NULL,
    "orderId" uuid NOT NULL,
    type public."enum_OrderAdjustments_type" NOT NULL,
    description character varying(500) NOT NULL,
    amount numeric(10,2) NOT NULL,
    "adminUserId" uuid NOT NULL,
    "adminUserName" character varying(200) NOT NULL,
    "createdAt" timestamp with time zone NOT NULL
);

CREATE TABLE public."OrderItems" (
    id uuid NOT NULL,
    "orderId" uuid NOT NULL,
    "serviceId" uuid,
    quantity integer DEFAULT 1 NOT NULL,
    price numeric(10,2) NOT NULL,
    "serviceName" character varying(255) NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "pcComponentId" uuid
);

CREATE TABLE public."Orders" (
    id uuid NOT NULL,
    "userId" uuid,
    "orderNumber" character varying(50) NOT NULL,
    "totalAmount" numeric(10,2) NOT NULL,
    status public."enum_Orders_status" DEFAULT 'pending'::public."enum_Orders_status" NOT NULL,
    currency character varying(3) DEFAULT 'SEK'::character varying NOT NULL,
    "paymentId" character varying(255),
    email character varying(255) NOT NULL,
    "firstName" character varying(100) NOT NULL,
    "lastName" character varying(100) NOT NULL,
    address character varying(255),
    city character varying(100),
    "postalCode" character varying(20),
    country character varying(2) DEFAULT 'SE'::character varying NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);

CREATE TABLE public."PCBuildServiceOptions" (
    id uuid NOT NULL,
    name_en character varying(255) NOT NULL,
    name_sv character varying(255) NOT NULL,
    desc_en text,
    desc_sv text,
    "priceType" public."enum_PCBuildServiceOptions_priceType" NOT NULL,
    amount numeric(10,2) NOT NULL,
    "estimatedBuildTime_en" character varying(100),
    "estimatedBuildTime_sv" character varying(100),
    "warrantyInfo_en" text,
    "warrantyInfo_sv" text,
    "isActive" boolean DEFAULT true NOT NULL,
    "isDefault" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);

CREATE TABLE public."PCCompatibilityRules" (
    id uuid NOT NULL,
    "ruleType" public."enum_PCCompatibilityRules_ruleType" NOT NULL,
    "componentType1" character varying(50) NOT NULL,
    "componentType2" character varying(50) NOT NULL,
    rule json NOT NULL,
    "errorMessage_en" text NOT NULL,
    "errorMessage_sv" text NOT NULL,
    severity public."enum_PCCompatibilityRules_severity" DEFAULT 'error'::public."enum_PCCompatibilityRules_severity" NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);

CREATE TABLE public."PCComponents" (
    id uuid NOT NULL,
    "componentType" public."enum_PCComponents_componentType" NOT NULL,
    name_en character varying(255) NOT NULL,
    name_sv character varying(255) NOT NULL,
    desc_en text,
    desc_sv text,
    manufacturer character varying(100) NOT NULL,
    "modelNumber" character varying(100),
    price numeric(10,2) NOT NULL,
    currency character varying(3) DEFAULT 'SEK'::character varying NOT NULL,
    "imageUrl" text,
    specifications json NOT NULL,
    stock integer DEFAULT 0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "compatibilityNotes_en" text,
    "compatibilityNotes_sv" text,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "distributorCost" numeric(10,2),
    "costCurrency" character varying(3) DEFAULT 'SEK'::character varying
);

CREATE TABLE public."PCConfigurations" (
    id uuid NOT NULL,
    "userId" uuid,
    name_en character varying(255),
    name_sv character varying(255),
    components json DEFAULT '{}'::json NOT NULL,
    "totalPrice" numeric(10,2) DEFAULT 0 NOT NULL,
    currency character varying(3) DEFAULT 'SEK'::character varying NOT NULL,
    "discountedPrice" numeric(10,2),
    "includesBuildService" boolean DEFAULT false NOT NULL,
    "buildServiceCharge" numeric(10,2) DEFAULT 0 NOT NULL,
    "buildServiceSnapshot" json,
    "isValid" boolean DEFAULT false NOT NULL,
    "validationErrors" json DEFAULT '[]'::json NOT NULL,
    "validationWarnings" json DEFAULT '[]'::json NOT NULL,
    "powerSummary" json,
    status public."enum_PCConfigurations_status" DEFAULT 'draft'::public."enum_PCConfigurations_status" NOT NULL,
    "orderId" uuid,
    "isPreConfigured" boolean DEFAULT false NOT NULL,
    "isFeatured" boolean DEFAULT false NOT NULL,
    tier public."enum_PCConfigurations_tier",
    "displayOrder" integer DEFAULT 0 NOT NULL,
    "imageUrl" text,
    "imageUrls" json DEFAULT '[]'::json,
    "shortDescription_en" character varying(500),
    "shortDescription_sv" character varying(500),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    stock integer DEFAULT 0 NOT NULL
);

CREATE TABLE public."PortfolioItems" (
    id uuid NOT NULL,
    title_en character varying(255) NOT NULL,
    title_sv character varying(255) NOT NULL,
    description_en text NOT NULL,
    description_sv text NOT NULL,
    category character varying(100) NOT NULL,
    "techStack" json DEFAULT '[]'::json NOT NULL,
    "projectUrl" character varying(500),
    "imageUrl" text NOT NULL,
    "imageFile" text,
    "thumbnailUrl" character varying(500),
    "deviceFrame" character varying(50) DEFAULT 'none'::character varying,
    featured boolean DEFAULT false NOT NULL,
    "order" integer DEFAULT 0 NOT NULL,
    "isPublished" boolean DEFAULT true NOT NULL,
    "completedDate" date,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);

CREATE TABLE public."ProfitMarginRules" (
    id uuid NOT NULL,
    name character varying(200) NOT NULL,
    type public."enum_ProfitMarginRules_type" NOT NULL,
    "pcComponentId" uuid,
    "componentType" character varying(50),
    "marginType" public."enum_ProfitMarginRules_marginType" NOT NULL,
    "marginValue" numeric(10,2) NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);

CREATE TABLE public."ServiceCategories" (
    id uuid NOT NULL,
    name_en character varying(255) NOT NULL,
    name_sv character varying(255) NOT NULL,
    "displayOrder" integer DEFAULT 0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);

CREATE TABLE public."Services" (
    id uuid NOT NULL,
    name_en character varying(255) NOT NULL,
    name_sv character varying(255) NOT NULL,
    desc_en text NOT NULL,
    desc_sv text NOT NULL,
    price numeric(10,2) NOT NULL,
    "discountPrice" numeric(10,2) DEFAULT NULL::numeric,
    currency character varying(3) DEFAULT 'SEK'::character varying NOT NULL,
    features_en json,
    features_sv json,
    "excludedFeatures_en" json DEFAULT '[]'::json,
    "excludedFeatures_sv" json DEFAULT '[]'::json,
    category character varying(100),
    "imageUrl" text,
    "imageFile" text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "serviceCategoryId" uuid,
    "isPopular" boolean DEFAULT false NOT NULL
);

CREATE TABLE public."SiteSettings" (
    id uuid NOT NULL,
    "siteName_en" character varying(255) DEFAULT 'My Company'::character varying NOT NULL,
    "siteName_sv" character varying(255) DEFAULT 'Mitt Företag'::character varying NOT NULL,
    tagline_en character varying(255) DEFAULT 'Your tagline here'::character varying NOT NULL,
    tagline_sv character varying(255) DEFAULT 'Din slogan här'::character varying NOT NULL,
    "logoUrl" text DEFAULT '/logo.png'::text NOT NULL,
    "logoFile" text,
    "faviconUrl" text DEFAULT '/favicon.ico'::text NOT NULL,
    "faviconFile" text,
    "metaTitle_en" character varying(255) DEFAULT 'My Company - Web Design & Development'::character varying NOT NULL,
    "metaTitle_sv" character varying(255) DEFAULT 'Mitt Företag - Webbdesign & Utveckling'::character varying NOT NULL,
    "metaDescription_en" text DEFAULT 'Professional web design and development services'::text NOT NULL,
    "metaDescription_sv" text DEFAULT 'Professionella webbdesign- och utvecklingstjänster'::text NOT NULL,
    "metaKeywords_en" text DEFAULT 'web design, web development, portfolio'::text NOT NULL,
    "metaKeywords_sv" text DEFAULT 'webbdesign, webbutveckling, portfolio'::text NOT NULL,
    email character varying(255) DEFAULT 'info@example.com'::character varying NOT NULL,
    phone character varying(50) DEFAULT '+46 123 456 789'::character varying NOT NULL,
    address character varying(255) DEFAULT 'Street Address'::character varying NOT NULL,
    city character varying(100) DEFAULT 'Stockholm'::character varying NOT NULL,
    country character varying(100) DEFAULT 'Sweden'::character varying NOT NULL,
    "postalCode" character varying(20) DEFAULT '12345'::character varying NOT NULL,
    "facebookUrl" character varying(500),
    "facebookIcon" text,
    "twitterUrl" character varying(500),
    "twitterIcon" text,
    "instagramUrl" character varying(500),
    "instagramIcon" text,
    "linkedinUrl" character varying(500),
    "linkedinIcon" text,
    "youtubeUrl" character varying(500),
    "youtubeIcon" text,
    "githubUrl" character varying(500),
    "copyrightText_en" character varying(255) DEFAULT '© 2024 My Company. All rights reserved.'::character varying NOT NULL,
    "copyrightText_sv" character varying(255) DEFAULT '© 2024 Mitt Företag. Alla rättigheter förbehållna.'::character varying NOT NULL,
    "footerDescription_en" text DEFAULT 'We create amazing digital experiences.'::text NOT NULL,
    "footerDescription_sv" text DEFAULT 'Vi skapar fantastiska digitala upplevelser.'::text NOT NULL,
    "heroStatus_en" character varying(100) DEFAULT 'Available for new projects'::character varying NOT NULL,
    "heroStatus_sv" character varying(100) DEFAULT 'Tillgängliga för nya projekt'::character varying NOT NULL,
    "heroFallbackText_en" character varying(50) DEFAULT 'Agency'::character varying NOT NULL,
    "heroFallbackText_sv" character varying(50) DEFAULT 'Byrå'::character varying NOT NULL,
    "heroButtonPrimary_en" character varying(50) DEFAULT 'View Our Work'::character varying NOT NULL,
    "heroButtonPrimary_sv" character varying(50) DEFAULT 'Se Vårt Arbete'::character varying NOT NULL,
    "heroButtonSecondary_en" character varying(50) DEFAULT 'Contact Us'::character varying NOT NULL,
    "heroButtonSecondary_sv" character varying(50) DEFAULT 'Kontakta Oss'::character varying NOT NULL,
    "portfolioTitle_en" character varying(100) DEFAULT 'Selected Work'::character varying NOT NULL,
    "portfolioTitle_sv" character varying(100) DEFAULT 'Utvalda Projekt'::character varying NOT NULL,
    "portfolioSubtitle_en" text DEFAULT 'We build digital products that help brands grow.'::text NOT NULL,
    "portfolioSubtitle_sv" text DEFAULT 'Vi bygger digitala produkter som hjälper varumärken att växa.'::text NOT NULL,
    "portfolioEmptyMessage_en" character varying(100) DEFAULT 'Projects coming soon'::character varying NOT NULL,
    "portfolioEmptyMessage_sv" character varying(100) DEFAULT 'Projekt kommer snart'::character varying NOT NULL,
    "servicesTitle_en" character varying(100) DEFAULT 'Expertise'::character varying NOT NULL,
    "servicesTitle_sv" character varying(100) DEFAULT 'Expertis'::character varying NOT NULL,
    "servicesSubtitle_en" text DEFAULT 'High-end solutions for ambitious companies.'::text NOT NULL,
    "servicesSubtitle_sv" text DEFAULT 'Högklassiga lösningar för ambitiösa företag.'::text NOT NULL,
    "servicesEmptyMessage_en" character varying(100) DEFAULT 'No services available'::character varying NOT NULL,
    "servicesEmptyMessage_sv" character varying(100) DEFAULT 'Inga tjänster tillgängliga'::character varying NOT NULL,
    "contactTitle_en" text DEFAULT 'Let''s work together.'::text NOT NULL,
    "contactTitle_sv" text DEFAULT 'Låt oss samarbeta.'::text NOT NULL,
    "contactSubtitle_en" text DEFAULT 'Ready to start your next project? Drop us a line.'::text NOT NULL,
    "contactSubtitle_sv" text DEFAULT 'Redo att starta ditt nästa projekt? Hör av dig till oss.'::text NOT NULL,
    "contactEmailLabel_en" character varying(50) DEFAULT 'Email'::character varying NOT NULL,
    "contactEmailLabel_sv" character varying(50) DEFAULT 'E-post'::character varying NOT NULL,
    "contactPhoneLabel_en" character varying(50) DEFAULT 'Phone'::character varying NOT NULL,
    "contactPhoneLabel_sv" character varying(50) DEFAULT 'Telefon'::character varying NOT NULL,
    "googleAnalyticsId" character varying(50),
    "facebookPixelId" character varying(50),
    "googleAdSenseId" character varying(50),
    "googleAdSenseScript" text,
    "stripePublicKey" character varying(255),
    "stripeSecretKey" character varying(255),
    "klarnaApiKey" character varying(255),
    "klarnaApiSecret" character varying(255),
    "paypalClientId" character varying(255),
    "paypalClientSecret" character varying(255),
    "enableAdBanners" boolean DEFAULT false NOT NULL,
    "headerAdBannerCode" text,
    "sidebarAdBannerCode" text,
    "footerAdBannerCode" text,
    "businessHours" text,
    "maintenanceMode" boolean DEFAULT false NOT NULL,
    "maintenanceMessage_en" text,
    "maintenanceMessage_sv" text,
    "gamingPcSectionVisible" boolean DEFAULT false NOT NULL,
    "gamingPcBadge_en" character varying(100) DEFAULT 'Gaming PCs'::character varying NOT NULL,
    "gamingPcBadge_sv" character varying(100) DEFAULT 'Speldatorer'::character varying NOT NULL,
    "gamingPcTitle_en" character varying(255) DEFAULT 'Pre-Built Gaming PCs'::character varying NOT NULL,
    "gamingPcTitle_sv" character varying(255) DEFAULT 'Förkonfigurerade Speldatorer'::character varying NOT NULL,
    "gamingPcTagline_en" character varying(255) DEFAULT 'No compromise. Pure Power.'::character varying NOT NULL,
    "gamingPcTagline_sv" character varying(255) DEFAULT 'Inga kompromisser. Ren kraft.'::character varying NOT NULL,
    "gamingPcDescription_en" text DEFAULT 'Premium components, expertly assembled, and ready to game. Same components a demanding user would choose, optimized for gaming.'::text NOT NULL,
    "gamingPcDescription_sv" text DEFAULT 'Premiumkomponenter, fackmässigt monterade och redo för gaming. Samma komponenter som en krävande användare skulle välja, optimerade för gaming.'::text NOT NULL,
    "gamingPcButtonPrimary_en" character varying(100) DEFAULT 'Pre-Built PCs'::character varying NOT NULL,
    "gamingPcButtonPrimary_sv" character varying(100) DEFAULT 'Färdigbyggda datorer'::character varying NOT NULL,
    "gamingPcButtonSecondary_en" character varying(100) DEFAULT 'Build Your Own'::character varying NOT NULL,
    "gamingPcButtonSecondary_sv" character varying(100) DEFAULT 'Välj komponenter själv'::character varying NOT NULL,
    "gamingPcShowWarranty" boolean DEFAULT true NOT NULL,
    "gamingPcWarrantyYears" integer DEFAULT 3 NOT NULL,
    "gamingPcWarrantyLabel_en" character varying(100) DEFAULT 'Year Warranty'::character varying NOT NULL,
    "gamingPcWarrantyLabel_sv" character varying(100) DEFAULT 'Års Garanti'::character varying NOT NULL,
    "gamingPcShowCircleBadge2" boolean DEFAULT false NOT NULL,
    "gamingPcCircleBadge2Value" integer,
    "gamingPcCircleBadge2Label_en" character varying(100),
    "gamingPcCircleBadge2Label_sv" character varying(100),
    "gamingPcShowCircleBadge3" boolean DEFAULT false NOT NULL,
    "gamingPcCircleBadge3Value" integer,
    "gamingPcCircleBadge3Label_en" character varying(100),
    "gamingPcCircleBadge3Label_sv" character varying(100),
    "gamingPcSectionTitle_en" character varying(255) DEFAULT 'Popular Pre-Built Models'::character varying NOT NULL,
    "gamingPcSectionTitle_sv" character varying(255) DEFAULT 'Populära förkonfigurerade modeller'::character varying NOT NULL,
    "gamingPcViewAllButton_en" character varying(100) DEFAULT 'See all pre-built models'::character varying NOT NULL,
    "gamingPcViewAllButton_sv" character varying(100) DEFAULT 'Se alla färdigbyggda modeller'::character varying NOT NULL,
    "gamingPcEmptyMessage_en" character varying(255) DEFAULT 'No pre-built PCs available'::character varying NOT NULL,
    "gamingPcEmptyMessage_sv" character varying(255) DEFAULT 'Inga färdigbyggda datorer tillgängliga'::character varying NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "featureSectionMobileImageFile" text
);

CREATE TABLE public."TeamMember" (
    id uuid NOT NULL,
    name_en character varying(255) NOT NULL,
    name_sv character varying(255) NOT NULL,
    role_en character varying(255) NOT NULL,
    role_sv character varying(255) NOT NULL,
    bio_en text NOT NULL,
    bio_sv text NOT NULL,
    image_url text,
    image_file text,
    linkedin_url character varying(500),
    sort_order integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);

CREATE TABLE public."Users" (
    id uuid NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    "firstName" character varying(100) NOT NULL,
    "lastName" character varying(100) NOT NULL,
    role public."enum_Users_role" DEFAULT 'user'::public."enum_Users_role" NOT NULL,
    "userType" public."enum_Users_userType" DEFAULT 'personal'::public."enum_Users_userType" NOT NULL,
    "isEmailVerified" boolean DEFAULT false NOT NULL,
    "emailVerificationToken" character varying(255),
    "emailVerificationExpires" timestamp with time zone,
    "resetPasswordToken" character varying(255),
    "resetPasswordExpires" timestamp with time zone,
    phone character varying(20),
    address character varying(255),
    city character varying(100),
    "postalCode" character varying(20),
    country character varying(100) DEFAULT 'Sweden'::character varying,
    "avatarUrl" text,
    "dateOfBirth" date,
    company character varying(200),
    "organizationNumber" character varying(50),
    "vatNumber" character varying(50),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "accountStatus" public."enum_Users_accountStatus" DEFAULT 'active'::public."enum_Users_accountStatus" NOT NULL,
    "suspensionReason" text,
    "suspensionEndDate" timestamp with time zone,
    "lastLoginAt" timestamp with time zone,
    "lastLoginIp" character varying(45),
    "lastLoginUserAgent" text,
    "twoFactorSecret" character varying(255),
    "twoFactorEnabled" boolean DEFAULT false NOT NULL,
    "twoFactorVerifiedAt" timestamp with time zone
);

ALTER TABLE ONLY public."Addresses"
    ADD CONSTRAINT "Addresses_pkey" PRIMARY KEY (id);

ALTER TABLE ONLY public."AuditLogs"
    ADD CONSTRAINT "AuditLogs_pkey" PRIMARY KEY (id);

ALTER TABLE ONLY public."Banner"
    ADD CONSTRAINT "Banner_pkey" PRIMARY KEY (id);

ALTER TABLE ONLY public."CartItems"
    ADD CONSTRAINT "CartItems_pkey" PRIMARY KEY (id);

ALTER TABLE ONLY public."Carts"
    ADD CONSTRAINT "Carts_pkey" PRIMARY KEY (id);

ALTER TABLE ONLY public."Carts"
    ADD CONSTRAINT "Carts_userId_key" UNIQUE ("userId");

ALTER TABLE ONLY public."CompanyLegalSettings"
    ADD CONSTRAINT "CompanyLegalSettings_pkey" PRIMARY KEY (id);

ALTER TABLE ONLY public."ContactMessages"
    ADD CONSTRAINT "ContactMessages_pkey" PRIMARY KEY (id);

ALTER TABLE ONLY public."Currencies"
    ADD CONSTRAINT "Currencies_code_key" UNIQUE (code);

ALTER TABLE ONLY public."Currencies"
    ADD CONSTRAINT "Currencies_pkey" PRIMARY KEY (id);

ALTER TABLE ONLY public."Emails"
    ADD CONSTRAINT "Emails_pkey" PRIMARY KEY (id);

ALTER TABLE ONLY public."ExchangeRates"
    ADD CONSTRAINT "ExchangeRates_pkey" PRIMARY KEY (id);

ALTER TABLE ONLY public."FooterCategoryTitles"
    ADD CONSTRAINT "FooterCategoryTitles_pkey" PRIMARY KEY (id);

ALTER TABLE ONLY public."FooterMainPages"
    ADD CONSTRAINT "FooterMainPages_pkey" PRIMARY KEY (id);

ALTER TABLE ONLY public."InternalNotes"
    ADD CONSTRAINT "InternalNotes_pkey" PRIMARY KEY (id);

ALTER TABLE ONLY public."LoginAttempts"
    ADD CONSTRAINT "LoginAttempts_pkey" PRIMARY KEY (id);

ALTER TABLE ONLY public."NewsletterSubscribers"
    ADD CONSTRAINT "NewsletterSubscribers_email_key" UNIQUE (email);

ALTER TABLE ONLY public."NewsletterSubscribers"
    ADD CONSTRAINT "NewsletterSubscribers_pkey" PRIMARY KEY (id);

ALTER TABLE ONLY public."NewsletterSubscribers"
    ADD CONSTRAINT "NewsletterSubscribers_unsubscribeToken_key" UNIQUE ("unsubscribeToken");

ALTER TABLE ONLY public."OrderAdjustments"
    ADD CONSTRAINT "OrderAdjustments_pkey" PRIMARY KEY (id);

ALTER TABLE ONLY public."OrderItems"
    ADD CONSTRAINT "OrderItems_pkey" PRIMARY KEY (id);

ALTER TABLE ONLY public."Orders"
    ADD CONSTRAINT "Orders_orderNumber_key" UNIQUE ("orderNumber");

ALTER TABLE ONLY public."Orders"
    ADD CONSTRAINT "Orders_pkey" PRIMARY KEY (id);

ALTER TABLE ONLY public."PCBuildServiceOptions"
    ADD CONSTRAINT "PCBuildServiceOptions_pkey" PRIMARY KEY (id);

ALTER TABLE ONLY public."PCCompatibilityRules"
    ADD CONSTRAINT "PCCompatibilityRules_pkey" PRIMARY KEY (id);

ALTER TABLE ONLY public."PCComponents"
    ADD CONSTRAINT "PCComponents_pkey" PRIMARY KEY (id);

ALTER TABLE ONLY public."PCConfigurations"
    ADD CONSTRAINT "PCConfigurations_pkey" PRIMARY KEY (id);

ALTER TABLE ONLY public."PortfolioItems"
    ADD CONSTRAINT "PortfolioItems_pkey" PRIMARY KEY (id);

ALTER TABLE ONLY public."ProfitMarginRules"
    ADD CONSTRAINT "ProfitMarginRules_pkey" PRIMARY KEY (id);

ALTER TABLE ONLY public."ServiceCategories"
    ADD CONSTRAINT "ServiceCategories_pkey" PRIMARY KEY (id);

ALTER TABLE ONLY public."Services"
    ADD CONSTRAINT "Services_pkey" PRIMARY KEY (id);

ALTER TABLE ONLY public."SiteSettings"
    ADD CONSTRAINT "SiteSettings_pkey" PRIMARY KEY (id);

ALTER TABLE ONLY public."TeamMember"
    ADD CONSTRAINT "TeamMember_pkey" PRIMARY KEY (id);

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key" UNIQUE (email);

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_pkey" PRIMARY KEY (id);

CREATE INDEX addresses_user_id ON public."Addresses" USING btree ("userId");

CREATE INDEX addresses_user_id_type ON public."Addresses" USING btree ("userId", type);

CREATE INDEX audit_logs_action ON public."AuditLogs" USING btree (action);

CREATE INDEX audit_logs_admin_user_id ON public."AuditLogs" USING btree ("adminUserId");

CREATE INDEX audit_logs_created_at ON public."AuditLogs" USING btree ("createdAt");

CREATE INDEX audit_logs_target_type_target_id ON public."AuditLogs" USING btree ("targetType", "targetId");

CREATE INDEX banner_is_active ON public."Banner" USING btree (is_active);

CREATE INDEX cart_items_cart_id ON public."CartItems" USING btree ("cartId");

CREATE INDEX cart_items_pc_component_id ON public."CartItems" USING btree ("pcComponentId");

CREATE INDEX cart_items_pc_configuration_id ON public."CartItems" USING btree ("pcConfigurationId");

CREATE INDEX cart_items_service_id ON public."CartItems" USING btree ("serviceId");

CREATE INDEX carts_updated_at ON public."Carts" USING btree ("updatedAt");

CREATE UNIQUE INDEX carts_user_id ON public."Carts" USING btree ("userId");

CREATE INDEX contact_messages_created_at ON public."ContactMessages" USING btree ("createdAt");

CREATE INDEX contact_messages_email ON public."ContactMessages" USING btree (email);

CREATE INDEX contact_messages_is_read ON public."ContactMessages" USING btree ("isRead");

CREATE INDEX contact_messages_replied_by ON public."ContactMessages" USING btree ("repliedBy");

CREATE INDEX contact_messages_status ON public."ContactMessages" USING btree (status);

CREATE UNIQUE INDEX currencies_code ON public."Currencies" USING btree (code);

CREATE INDEX currencies_is_active ON public."Currencies" USING btree ("isActive");

CREATE INDEX emails_created_at ON public."Emails" USING btree ("createdAt");

CREATE INDEX emails_order_id ON public."Emails" USING btree ("orderId");

CREATE INDEX emails_status ON public."Emails" USING btree (status);

CREATE INDEX emails_user_id ON public."Emails" USING btree ("userId");

CREATE UNIQUE INDEX exchange_rates_base_currency_target_currency ON public."ExchangeRates" USING btree ("baseCurrency", "targetCurrency");

CREATE INDEX footer_category_titles_display_order ON public."FooterCategoryTitles" USING btree ("displayOrder");

CREATE INDEX footer_category_titles_is_active ON public."FooterCategoryTitles" USING btree ("isActive");

CREATE INDEX footer_main_pages_display_order ON public."FooterMainPages" USING btree ("displayOrder");

CREATE INDEX footer_main_pages_footer_category_title_id ON public."FooterMainPages" USING btree ("footerCategoryTitleId");

CREATE INDEX footer_main_pages_is_active ON public."FooterMainPages" USING btree ("isActive");

CREATE INDEX internal_notes_author_id ON public."InternalNotes" USING btree ("authorId");

CREATE INDEX internal_notes_created_at ON public."InternalNotes" USING btree ("createdAt");

CREATE INDEX internal_notes_target_type_target_id ON public."InternalNotes" USING btree ("targetType", "targetId");

CREATE INDEX login_attempts_created_at ON public."LoginAttempts" USING btree ("createdAt");

CREATE INDEX login_attempts_email ON public."LoginAttempts" USING btree (email);

CREATE INDEX login_attempts_success ON public."LoginAttempts" USING btree (success);

CREATE INDEX login_attempts_user_id ON public."LoginAttempts" USING btree ("userId");

CREATE UNIQUE INDEX newsletter_subscribers_email ON public."NewsletterSubscribers" USING btree (email);

CREATE INDEX newsletter_subscribers_is_active ON public."NewsletterSubscribers" USING btree ("isActive");

CREATE INDEX newsletter_subscribers_unsubscribe_token ON public."NewsletterSubscribers" USING btree ("unsubscribeToken");

CREATE INDEX newsletter_subscribers_verification_token ON public."NewsletterSubscribers" USING btree ("verificationToken");

CREATE INDEX order_adjustments_created_at ON public."OrderAdjustments" USING btree ("createdAt");

CREATE INDEX order_adjustments_order_id ON public."OrderAdjustments" USING btree ("orderId");

CREATE INDEX order_adjustments_type ON public."OrderAdjustments" USING btree (type);

CREATE INDEX order_items_order_id ON public."OrderItems" USING btree ("orderId");

CREATE INDEX order_items_pc_component_id ON public."OrderItems" USING btree ("pcComponentId");

CREATE INDEX order_items_service_id ON public."OrderItems" USING btree ("serviceId");

CREATE INDEX orders_created_at ON public."Orders" USING btree ("createdAt");

CREATE INDEX orders_order_number ON public."Orders" USING btree ("orderNumber");

CREATE INDEX orders_status ON public."Orders" USING btree (status);

CREATE INDEX orders_user_id ON public."Orders" USING btree ("userId");

CREATE INDEX p_c_build_service_options_is_active ON public."PCBuildServiceOptions" USING btree ("isActive");

CREATE INDEX p_c_build_service_options_is_active_is_default ON public."PCBuildServiceOptions" USING btree ("isActive", "isDefault");

CREATE INDEX p_c_build_service_options_is_default ON public."PCBuildServiceOptions" USING btree ("isDefault");

CREATE INDEX p_c_compatibility_rules_component_type1_component_type2 ON public."PCCompatibilityRules" USING btree ("componentType1", "componentType2");

CREATE INDEX p_c_compatibility_rules_is_active ON public."PCCompatibilityRules" USING btree ("isActive");

CREATE INDEX p_c_compatibility_rules_rule_type ON public."PCCompatibilityRules" USING btree ("ruleType");

CREATE INDEX p_c_compatibility_rules_rule_type_is_active ON public."PCCompatibilityRules" USING btree ("ruleType", "isActive");

CREATE INDEX p_c_components_component_type ON public."PCComponents" USING btree ("componentType");

CREATE INDEX p_c_components_component_type_is_active ON public."PCComponents" USING btree ("componentType", "isActive");

CREATE INDEX p_c_components_is_active ON public."PCComponents" USING btree ("isActive");

CREATE INDEX p_c_components_manufacturer ON public."PCComponents" USING btree (manufacturer);

CREATE INDEX p_c_components_price ON public."PCComponents" USING btree (price);

CREATE INDEX p_c_configurations_created_at ON public."PCConfigurations" USING btree ("createdAt");

CREATE INDEX p_c_configurations_is_featured ON public."PCConfigurations" USING btree ("isFeatured");

CREATE INDEX p_c_configurations_is_pre_configured ON public."PCConfigurations" USING btree ("isPreConfigured");

CREATE INDEX p_c_configurations_is_pre_configured_display_order ON public."PCConfigurations" USING btree ("isPreConfigured", "displayOrder");

CREATE INDEX p_c_configurations_is_pre_configured_is_featured ON public."PCConfigurations" USING btree ("isPreConfigured", "isFeatured");

CREATE INDEX p_c_configurations_order_id ON public."PCConfigurations" USING btree ("orderId");

CREATE INDEX p_c_configurations_status ON public."PCConfigurations" USING btree (status);

CREATE INDEX p_c_configurations_tier ON public."PCConfigurations" USING btree (tier);

CREATE INDEX p_c_configurations_user_id ON public."PCConfigurations" USING btree ("userId");

CREATE INDEX p_c_configurations_user_id_status ON public."PCConfigurations" USING btree ("userId", status);

CREATE INDEX portfolio_items_category ON public."PortfolioItems" USING btree (category);

CREATE INDEX portfolio_items_featured ON public."PortfolioItems" USING btree (featured);

CREATE INDEX portfolio_items_is_published ON public."PortfolioItems" USING btree ("isPublished");

CREATE INDEX portfolio_items_order ON public."PortfolioItems" USING btree ("order");

CREATE INDEX profit_margin_rules_component_type ON public."ProfitMarginRules" USING btree ("componentType");

CREATE INDEX profit_margin_rules_is_active ON public."ProfitMarginRules" USING btree ("isActive");

CREATE INDEX profit_margin_rules_pc_component_id ON public."ProfitMarginRules" USING btree ("pcComponentId");

CREATE INDEX profit_margin_rules_type ON public."ProfitMarginRules" USING btree (type);

CREATE INDEX service_categories_display_order ON public."ServiceCategories" USING btree ("displayOrder");

CREATE INDEX service_categories_is_active ON public."ServiceCategories" USING btree ("isActive");

CREATE INDEX services_category ON public."Services" USING btree (category);

CREATE INDEX services_is_active ON public."Services" USING btree ("isActive");

CREATE INDEX services_service_category_id ON public."Services" USING btree ("serviceCategoryId");

CREATE INDEX team_member_is_active ON public."TeamMember" USING btree (is_active);

CREATE INDEX team_member_sort_order ON public."TeamMember" USING btree (sort_order);

CREATE INDEX users_email ON public."Users" USING btree (email);

CREATE INDEX users_role ON public."Users" USING btree (role);

ALTER TABLE ONLY public."Addresses"
    ADD CONSTRAINT "Addresses_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY public."CartItems"
    ADD CONSTRAINT "CartItems_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES public."Carts"(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY public."CartItems"
    ADD CONSTRAINT "CartItems_pcComponentId_fkey" FOREIGN KEY ("pcComponentId") REFERENCES public."PCComponents"(id) ON UPDATE CASCADE ON DELETE SET NULL;

ALTER TABLE ONLY public."CartItems"
    ADD CONSTRAINT "CartItems_pcConfigurationId_fkey" FOREIGN KEY ("pcConfigurationId") REFERENCES public."PCConfigurations"(id) ON UPDATE CASCADE ON DELETE SET NULL;

ALTER TABLE ONLY public."CartItems"
    ADD CONSTRAINT "CartItems_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES public."Services"(id) ON UPDATE CASCADE ON DELETE SET NULL;

ALTER TABLE ONLY public."Carts"
    ADD CONSTRAINT "Carts_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY public."ContactMessages"
    ADD CONSTRAINT "ContactMessages_repliedBy_fkey" FOREIGN KEY ("repliedBy") REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE SET NULL;

ALTER TABLE ONLY public."Emails"
    ADD CONSTRAINT "Emails_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Orders"(id) ON UPDATE CASCADE ON DELETE SET NULL;

ALTER TABLE ONLY public."Emails"
    ADD CONSTRAINT "Emails_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE SET NULL;

ALTER TABLE ONLY public."FooterMainPages"
    ADD CONSTRAINT "FooterMainPages_footerCategoryTitleId_fkey" FOREIGN KEY ("footerCategoryTitleId") REFERENCES public."FooterCategoryTitles"(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY public."InternalNotes"
    ADD CONSTRAINT "InternalNotes_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES public."Users"(id) ON UPDATE CASCADE;

ALTER TABLE ONLY public."LoginAttempts"
    ADD CONSTRAINT "LoginAttempts_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE SET NULL;

ALTER TABLE ONLY public."OrderAdjustments"
    ADD CONSTRAINT "OrderAdjustments_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Orders"(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY public."OrderItems"
    ADD CONSTRAINT "OrderItems_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Orders"(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY public."OrderItems"
    ADD CONSTRAINT "OrderItems_pcComponentId_fkey" FOREIGN KEY ("pcComponentId") REFERENCES public."PCComponents"(id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE ONLY public."OrderItems"
    ADD CONSTRAINT "OrderItems_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES public."Services"(id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE ONLY public."Orders"
    ADD CONSTRAINT "Orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE SET NULL;

ALTER TABLE ONLY public."PCConfigurations"
    ADD CONSTRAINT "PCConfigurations_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Orders"(id) ON UPDATE CASCADE ON DELETE SET NULL;

ALTER TABLE ONLY public."PCConfigurations"
    ADD CONSTRAINT "PCConfigurations_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY public."ProfitMarginRules"
    ADD CONSTRAINT "ProfitMarginRules_pcComponentId_fkey" FOREIGN KEY ("pcComponentId") REFERENCES public."PCComponents"(id) ON UPDATE CASCADE ON DELETE SET NULL;

ALTER TABLE ONLY public."Services"
    ADD CONSTRAINT "Services_serviceCategoryId_fkey" FOREIGN KEY ("serviceCategoryId") REFERENCES public."ServiceCategories"(id) ON UPDATE CASCADE ON DELETE SET NULL;
