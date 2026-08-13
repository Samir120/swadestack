--
-- PostgreSQL database dump
--

\restrict yy1IqfgS4SeZ1vtWcUfuIGQAjzcWi6Jnk6iGxrje7WyLTbaPeshNhtchItPWYZJ

-- Dumped from database version 16.14 (Ubuntu 16.14-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.14 (Ubuntu 16.14-0ubuntu0.24.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: enum_Addresses_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."enum_Addresses_type" AS ENUM (
    'shipping',
    'billing'
);


--
-- Name: enum_ContactMessages_language; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."enum_ContactMessages_language" AS ENUM (
    'en',
    'sv'
);


--
-- Name: enum_ContactMessages_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."enum_ContactMessages_status" AS ENUM (
    'new',
    'read',
    'replied',
    'archived'
);


--
-- Name: enum_Coupons_discountType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."enum_Coupons_discountType" AS ENUM (
    'percentage',
    'fixed_amount'
);


--
-- Name: enum_Emails_priority; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."enum_Emails_priority" AS ENUM (
    'low',
    'normal',
    'high'
);


--
-- Name: enum_Emails_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."enum_Emails_status" AS ENUM (
    'pending',
    'sent',
    'failed',
    'queued'
);


--
-- Name: enum_Emails_templateType; Type: TYPE; Schema: public; Owner: -
--

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


--
-- Name: enum_InternalNotes_targetType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."enum_InternalNotes_targetType" AS ENUM (
    'customer',
    'order'
);


--
-- Name: enum_NewsletterCampaigns_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."enum_NewsletterCampaigns_status" AS ENUM (
    'draft',
    'scheduled',
    'sending',
    'sent',
    'failed',
    'cancelled'
);


--
-- Name: enum_NewsletterSegments_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."enum_NewsletterSegments_type" AS ENUM (
    'auto',
    'manual'
);


--
-- Name: enum_NewsletterSendLogs_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."enum_NewsletterSendLogs_status" AS ENUM (
    'queued',
    'sent',
    'delivered',
    'opened',
    'clicked',
    'bounced',
    'failed'
);


--
-- Name: enum_NewsletterSubscribers_language; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."enum_NewsletterSubscribers_language" AS ENUM (
    'en',
    'sv'
);


--
-- Name: enum_NewsletterSubscribers_source; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."enum_NewsletterSubscribers_source" AS ENUM (
    'registration',
    'website_signup',
    'checkout',
    'admin_manual',
    'csv_import'
);


--
-- Name: enum_NewsletterSubscribers_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."enum_NewsletterSubscribers_status" AS ENUM (
    'active',
    'unsubscribed',
    'bounced',
    'pending_confirmation'
);


--
-- Name: enum_NotificationBanners_backgroundType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."enum_NotificationBanners_backgroundType" AS ENUM (
    'solid',
    'gradient'
);


--
-- Name: enum_NotificationBanners_fontSize; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."enum_NotificationBanners_fontSize" AS ENUM (
    'xs',
    'sm',
    'base',
    'lg'
);


--
-- Name: enum_NotificationBanners_fontWeight; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."enum_NotificationBanners_fontWeight" AS ENUM (
    'normal',
    'medium',
    'semibold',
    'bold'
);


--
-- Name: enum_OrderAdjustments_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."enum_OrderAdjustments_type" AS ENUM (
    'discount',
    'fee',
    'correction',
    'refund'
);


--
-- Name: enum_Orders_partialPaymentStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."enum_Orders_partialPaymentStatus" AS ENUM (
    'initial_pending',
    'initial_paid',
    'final_pending',
    'full_paid'
);


--
-- Name: enum_Orders_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."enum_Orders_status" AS ENUM (
    'pending',
    'partial_paid',
    'awaiting_final',
    'paid',
    'cancelled',
    'completed'
);


--
-- Name: enum_PCBuildServiceOptions_priceType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."enum_PCBuildServiceOptions_priceType" AS ENUM (
    'fixed',
    'percentage'
);


--
-- Name: enum_PCCompatibilityRules_ruleType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."enum_PCCompatibilityRules_ruleType" AS ENUM (
    'cpu_motherboard',
    'motherboard_ram',
    'gpu_case',
    'psu_power',
    'storage_motherboard',
    'cooling_cpu'
);


--
-- Name: enum_PCCompatibilityRules_severity; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."enum_PCCompatibilityRules_severity" AS ENUM (
    'error',
    'warning'
);


--
-- Name: enum_PCComponents_componentType; Type: TYPE; Schema: public; Owner: -
--

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


--
-- Name: enum_PCConfigurations_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."enum_PCConfigurations_status" AS ENUM (
    'draft',
    'saved',
    'ordered'
);


--
-- Name: enum_PCConfigurations_tier; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."enum_PCConfigurations_tier" AS ENUM (
    'core',
    'pro',
    'ultra',
    'custom'
);


--
-- Name: enum_Payments_phase; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."enum_Payments_phase" AS ENUM (
    'initial',
    'final',
    'full',
    'additional'
);


--
-- Name: enum_Payments_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."enum_Payments_status" AS ENUM (
    'pending',
    'processing',
    'succeeded',
    'failed',
    'cancelled'
);


--
-- Name: enum_ProfitMarginRules_marginType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."enum_ProfitMarginRules_marginType" AS ENUM (
    'percentage',
    'flat'
);


--
-- Name: enum_ProfitMarginRules_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."enum_ProfitMarginRules_type" AS ENUM (
    'global',
    'category',
    'product'
);


--
-- Name: enum_Users_accountStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."enum_Users_accountStatus" AS ENUM (
    'active',
    'suspended',
    'deactivated'
);


--
-- Name: enum_Users_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."enum_Users_role" AS ENUM (
    'admin',
    'user'
);


--
-- Name: enum_Users_userType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."enum_Users_userType" AS ENUM (
    'personal',
    'company'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Addresses; Type: TABLE; Schema: public; Owner: -
--

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


--
-- Name: AuditLogs; Type: TABLE; Schema: public; Owner: -
--

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


--
-- Name: Banner; Type: TABLE; Schema: public; Owner: -
--

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


--
-- Name: CartItems; Type: TABLE; Schema: public; Owner: -
--

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


--
-- Name: Carts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Carts" (
    id uuid NOT NULL,
    "userId" uuid NOT NULL,
    "lastReminderSentAt" timestamp with time zone,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "forceCleared" boolean DEFAULT false NOT NULL,
    "adminModified" boolean DEFAULT false NOT NULL
);


--
-- Name: CompanyLegalSettings; Type: TABLE; Schema: public; Owner: -
--

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


--
-- Name: ContactMessages; Type: TABLE; Schema: public; Owner: -
--

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


--
-- Name: Coupons; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Coupons" (
    id uuid NOT NULL,
    code character varying(50) NOT NULL,
    description character varying(255),
    "discountType" public."enum_Coupons_discountType" NOT NULL,
    "discountValue" numeric(10,2) NOT NULL,
    "minimumOrderAmount" numeric(10,2),
    "maxUses" integer,
    "maxUsesPerUser" integer,
    "currentUses" integer DEFAULT 0 NOT NULL,
    "validFrom" timestamp with time zone,
    "validUntil" timestamp with time zone,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "maxDiscountAmount" numeric(10,2),
    "totalDiscountGiven" numeric(10,2) DEFAULT 0 NOT NULL,
    "applicableTo" character varying(50) DEFAULT 'all'::character varying NOT NULL,
    "applicableCategoryIds" text,
    "firstOrderOnly" boolean DEFAULT false NOT NULL,
    combinable boolean DEFAULT true NOT NULL
);


--
-- Name: Currencies; Type: TABLE; Schema: public; Owner: -
--

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


--
-- Name: Emails; Type: TABLE; Schema: public; Owner: -
--

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


--
-- Name: ExchangeRates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ExchangeRates" (
    id uuid NOT NULL,
    "baseCurrency" character varying(3) NOT NULL,
    "targetCurrency" character varying(3) NOT NULL,
    rate numeric(16,8) NOT NULL,
    "fetchedAt" timestamp with time zone NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: Features; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Features" (
    id uuid NOT NULL,
    title_en character varying(255) NOT NULL,
    title_sv character varying(255) NOT NULL,
    "shortDescription_en" text NOT NULL,
    "shortDescription_sv" text NOT NULL,
    "fullDescription_en" text NOT NULL,
    "fullDescription_sv" text NOT NULL,
    "iconName" character varying(100) DEFAULT 'HelpCircle'::character varying NOT NULL,
    "previewImageUrl" text,
    "previewImageFile" text,
    "displayOrder" integer DEFAULT 0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: FooterCategoryTitles; Type: TABLE; Schema: public; Owner: -
--

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


--
-- Name: FooterMainPages; Type: TABLE; Schema: public; Owner: -
--

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


--
-- Name: InternalNotes; Type: TABLE; Schema: public; Owner: -
--

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


--
-- Name: LoginAttempts; Type: TABLE; Schema: public; Owner: -
--

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


--
-- Name: NewsletterCampaignStats; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."NewsletterCampaignStats" (
    id uuid NOT NULL,
    "campaignId" uuid NOT NULL,
    "totalSent" integer DEFAULT 0 NOT NULL,
    "totalDelivered" integer DEFAULT 0 NOT NULL,
    "totalOpened" integer DEFAULT 0 NOT NULL,
    "uniqueOpens" integer DEFAULT 0 NOT NULL,
    "totalClicked" integer DEFAULT 0 NOT NULL,
    "uniqueClicks" integer DEFAULT 0 NOT NULL,
    "totalUnsubscribed" integer DEFAULT 0 NOT NULL,
    "totalBounced" integer DEFAULT 0 NOT NULL,
    "totalFailed" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: NewsletterCampaigns; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."NewsletterCampaigns" (
    id uuid NOT NULL,
    name character varying(255) NOT NULL,
    subject character varying(255) NOT NULL,
    "previewText" character varying(255),
    "contentJson" jsonb,
    "templateId" uuid,
    status public."enum_NewsletterCampaigns_status" DEFAULT 'draft'::public."enum_NewsletterCampaigns_status" NOT NULL,
    "targetSegmentIds" jsonb,
    "targetSubscriberCount" integer,
    "scheduledAt" timestamp with time zone,
    "sentAt" timestamp with time zone,
    "sentByAdminId" uuid,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "targetSubscriberIds" jsonb
);


--
-- Name: NewsletterSegmentMembers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."NewsletterSegmentMembers" (
    id uuid NOT NULL,
    "segmentId" uuid NOT NULL,
    "subscriberId" uuid NOT NULL,
    "addedAt" timestamp with time zone NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: NewsletterSegments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."NewsletterSegments" (
    id uuid NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    type public."enum_NewsletterSegments_type" NOT NULL,
    rules jsonb,
    "subscriberCount" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: NewsletterSendLogs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."NewsletterSendLogs" (
    id uuid NOT NULL,
    "campaignId" uuid NOT NULL,
    "subscriberId" uuid NOT NULL,
    email character varying(255) NOT NULL,
    status public."enum_NewsletterSendLogs_status" DEFAULT 'queued'::public."enum_NewsletterSendLogs_status" NOT NULL,
    "sentAt" timestamp with time zone,
    "openedAt" timestamp with time zone,
    "clickedAt" timestamp with time zone,
    "bouncedAt" timestamp with time zone,
    "failureReason" text,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: NewsletterSubscribers; Type: TABLE; Schema: public; Owner: -
--

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
    "updatedAt" timestamp with time zone NOT NULL,
    "userId" uuid,
    status public."enum_NewsletterSubscribers_status" DEFAULT 'active'::public."enum_NewsletterSubscribers_status" NOT NULL,
    source public."enum_NewsletterSubscribers_source"
);


--
-- Name: NewsletterTemplates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."NewsletterTemplates" (
    id uuid NOT NULL,
    name character varying(100) NOT NULL,
    "isDefault" boolean DEFAULT false NOT NULL,
    "previewThumbnailUrl" character varying(255),
    "globalStyles" jsonb,
    "socialMediaConfig" jsonb,
    "footerConfig" jsonb,
    "contentBlocks" jsonb,
    "usageCount" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: NotificationBanners; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."NotificationBanners" (
    id uuid NOT NULL,
    title character varying(100) NOT NULL,
    message_en character varying(300) NOT NULL,
    message_sv character varying(300) NOT NULL,
    "linkUrl" character varying(500),
    "linkText_en" character varying(100),
    "linkText_sv" character varying(100),
    "couponCode" character varying(50),
    "showPhone" boolean DEFAULT false NOT NULL,
    "showEmail" boolean DEFAULT false NOT NULL,
    "backgroundColor" character varying(7) DEFAULT '#1e40af'::character varying NOT NULL,
    "textColor" character varying(7) DEFAULT '#ffffff'::character varying NOT NULL,
    "backgroundType" public."enum_NotificationBanners_backgroundType" DEFAULT 'solid'::public."enum_NotificationBanners_backgroundType" NOT NULL,
    "gradientEndColor" character varying(7),
    "gradientDirection" character varying(20) DEFAULT 'to right'::character varying,
    "fontWeight" public."enum_NotificationBanners_fontWeight" DEFAULT 'medium'::public."enum_NotificationBanners_fontWeight" NOT NULL,
    "fontSize" public."enum_NotificationBanners_fontSize" DEFAULT 'sm'::public."enum_NotificationBanners_fontSize" NOT NULL,
    icon character varying(50),
    "isActive" boolean DEFAULT false NOT NULL,
    "showOnAuthPages" boolean DEFAULT false NOT NULL,
    "showOnAdminPanel" boolean DEFAULT false NOT NULL,
    "isDismissible" boolean DEFAULT true NOT NULL,
    "startDate" timestamp with time zone,
    "endDate" timestamp with time zone,
    "showOnPages" jsonb DEFAULT '["all"]'::jsonb NOT NULL,
    priority integer DEFAULT 0 NOT NULL,
    impressions bigint DEFAULT 0 NOT NULL,
    clicks bigint DEFAULT 0 NOT NULL,
    dismissals bigint DEFAULT 0 NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: OrderAdjustments; Type: TABLE; Schema: public; Owner: -
--

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


--
-- Name: OrderItems; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."OrderItems" (
    id uuid NOT NULL,
    "orderId" uuid NOT NULL,
    "serviceId" uuid,
    "pcConfigurationId" uuid,
    quantity integer DEFAULT 1 NOT NULL,
    price numeric(10,2) NOT NULL,
    "serviceName" character varying(255) NOT NULL,
    "serviceDescription" text,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "pcComponentId" uuid
);


--
-- Name: Orders; Type: TABLE; Schema: public; Owner: -
--

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
    "requiresPartialPayment" boolean DEFAULT false NOT NULL,
    "partialPaymentStatus" public."enum_Orders_partialPaymentStatus",
    "readyForFinalPayment" boolean DEFAULT false NOT NULL,
    "readyForFinalPaymentAt" timestamp with time zone,
    "notifiedForFinalPayment" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "couponId" uuid,
    "couponCode" character varying(50),
    "discountAmount" numeric(10,2) DEFAULT 0
);


--
-- Name: PCBuildServiceOptions; Type: TABLE; Schema: public; Owner: -
--

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


--
-- Name: PCCompatibilityRules; Type: TABLE; Schema: public; Owner: -
--

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


--
-- Name: PCComponents; Type: TABLE; Schema: public; Owner: -
--

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


--
-- Name: PCConfigurations; Type: TABLE; Schema: public; Owner: -
--

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


--
-- Name: Payments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Payments" (
    id uuid NOT NULL,
    "orderId" uuid NOT NULL,
    amount numeric(10,2) NOT NULL,
    currency character varying(3) DEFAULT 'SEK'::character varying NOT NULL,
    phase public."enum_Payments_phase" NOT NULL,
    status public."enum_Payments_status" DEFAULT 'pending'::public."enum_Payments_status" NOT NULL,
    "klarnaOrderId" character varying(255),
    "klarnaReference" character varying(255),
    "failureReason" text,
    metadata json,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: PortfolioItems; Type: TABLE; Schema: public; Owner: -
--

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


--
-- Name: ProfitMarginRules; Type: TABLE; Schema: public; Owner: -
--

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


--
-- Name: RefreshTokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."RefreshTokens" (
    id uuid NOT NULL,
    "userId" uuid NOT NULL,
    token character varying(500) NOT NULL,
    "expiresAt" timestamp with time zone NOT NULL,
    "isRevoked" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: SequelizeMeta; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."SequelizeMeta" (
    name character varying(255) NOT NULL
);


--
-- Name: ServiceCategories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ServiceCategories" (
    id uuid NOT NULL,
    name_en character varying(255) NOT NULL,
    name_sv character varying(255) NOT NULL,
    "displayOrder" integer DEFAULT 0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: Services; Type: TABLE; Schema: public; Owner: -
--

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


--
-- Name: SiteSettings; Type: TABLE; Schema: public; Owner: -
--

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
    "featureSectionTitle_en" character varying(255) DEFAULT 'What We Offer'::character varying NOT NULL,
    "featureSectionTitle_sv" character varying(255) DEFAULT 'Vad Vi Erbjuder'::character varying NOT NULL,
    "featureSectionSubtitle_en" character varying(255) DEFAULT 'Our Core Capabilities'::character varying NOT NULL,
    "featureSectionSubtitle_sv" character varying(255) DEFAULT 'Våra Kärnkompetenser'::character varying NOT NULL,
    "featureSectionImageFile" text,
    "cookieConsentEnabled" boolean DEFAULT false NOT NULL,
    "cookieConsentTitle_en" character varying(255) DEFAULT 'We use cookies'::character varying NOT NULL,
    "cookieConsentTitle_sv" character varying(255) DEFAULT 'Vi använder cookies'::character varying NOT NULL,
    "cookieConsentDescription_en" text DEFAULT 'This website uses cookies to ensure you get the best experience. By clicking "I accept", you consent to the use of all cookies in accordance with our cookie policy.'::text NOT NULL,
    "cookieConsentDescription_sv" text DEFAULT 'Denna webbplats använder cookies för att säkerställa att du får den bästa upplevelsen. Genom att klicka på "Jag accepterar" samtycker du till användningen av alla cookies i enlighet med vår cookiepolicy.'::text NOT NULL,
    "cookieConsentAcceptButton_en" character varying(100) DEFAULT 'I accept'::character varying NOT NULL,
    "cookieConsentAcceptButton_sv" character varying(100) DEFAULT 'Jag accepterar'::character varying NOT NULL,
    "cookieConsentReadMoreType" character varying(20) DEFAULT 'internal'::character varying NOT NULL,
    "cookieConsentReadMoreInternal" character varying(500),
    "cookieConsentReadMoreExternal" character varying(500),
    "cookieConsentExpiryDays" integer DEFAULT 365 NOT NULL,
    "featureSectionMobileImageFile" text
);


--
-- Name: TeamMember; Type: TABLE; Schema: public; Owner: -
--

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


--
-- Name: Users; Type: TABLE; Schema: public; Owner: -
--

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


--
-- Name: VatSettings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."VatSettings" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "vatRate" numeric(5,4) DEFAULT 0.25 NOT NULL,
    label_en character varying(100) DEFAULT 'VAT'::character varying NOT NULL,
    label_sv character varying(100) DEFAULT 'Moms'::character varying NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: Addresses Addresses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Addresses"
    ADD CONSTRAINT "Addresses_pkey" PRIMARY KEY (id);


--
-- Name: AuditLogs AuditLogs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AuditLogs"
    ADD CONSTRAINT "AuditLogs_pkey" PRIMARY KEY (id);


--
-- Name: Banner Banner_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Banner"
    ADD CONSTRAINT "Banner_pkey" PRIMARY KEY (id);


--
-- Name: CartItems CartItems_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CartItems"
    ADD CONSTRAINT "CartItems_pkey" PRIMARY KEY (id);


--
-- Name: Carts Carts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Carts"
    ADD CONSTRAINT "Carts_pkey" PRIMARY KEY (id);


--
-- Name: Carts Carts_userId_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Carts"
    ADD CONSTRAINT "Carts_userId_key" UNIQUE ("userId");


--
-- Name: CompanyLegalSettings CompanyLegalSettings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CompanyLegalSettings"
    ADD CONSTRAINT "CompanyLegalSettings_pkey" PRIMARY KEY (id);


--
-- Name: ContactMessages ContactMessages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ContactMessages"
    ADD CONSTRAINT "ContactMessages_pkey" PRIMARY KEY (id);


--
-- Name: Coupons Coupons_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Coupons"
    ADD CONSTRAINT "Coupons_code_key" UNIQUE (code);


--
-- Name: Coupons Coupons_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Coupons"
    ADD CONSTRAINT "Coupons_pkey" PRIMARY KEY (id);


--
-- Name: Currencies Currencies_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Currencies"
    ADD CONSTRAINT "Currencies_code_key" UNIQUE (code);


--
-- Name: Currencies Currencies_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Currencies"
    ADD CONSTRAINT "Currencies_pkey" PRIMARY KEY (id);


--
-- Name: Emails Emails_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Emails"
    ADD CONSTRAINT "Emails_pkey" PRIMARY KEY (id);


--
-- Name: ExchangeRates ExchangeRates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ExchangeRates"
    ADD CONSTRAINT "ExchangeRates_pkey" PRIMARY KEY (id);


--
-- Name: Features Features_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Features"
    ADD CONSTRAINT "Features_pkey" PRIMARY KEY (id);


--
-- Name: FooterCategoryTitles FooterCategoryTitles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."FooterCategoryTitles"
    ADD CONSTRAINT "FooterCategoryTitles_pkey" PRIMARY KEY (id);


--
-- Name: FooterMainPages FooterMainPages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."FooterMainPages"
    ADD CONSTRAINT "FooterMainPages_pkey" PRIMARY KEY (id);


--
-- Name: InternalNotes InternalNotes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."InternalNotes"
    ADD CONSTRAINT "InternalNotes_pkey" PRIMARY KEY (id);


--
-- Name: LoginAttempts LoginAttempts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."LoginAttempts"
    ADD CONSTRAINT "LoginAttempts_pkey" PRIMARY KEY (id);


--
-- Name: NewsletterCampaignStats NewsletterCampaignStats_campaignId_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."NewsletterCampaignStats"
    ADD CONSTRAINT "NewsletterCampaignStats_campaignId_key" UNIQUE ("campaignId");


--
-- Name: NewsletterCampaignStats NewsletterCampaignStats_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."NewsletterCampaignStats"
    ADD CONSTRAINT "NewsletterCampaignStats_pkey" PRIMARY KEY (id);


--
-- Name: NewsletterCampaigns NewsletterCampaigns_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."NewsletterCampaigns"
    ADD CONSTRAINT "NewsletterCampaigns_pkey" PRIMARY KEY (id);


--
-- Name: NewsletterSegmentMembers NewsletterSegmentMembers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."NewsletterSegmentMembers"
    ADD CONSTRAINT "NewsletterSegmentMembers_pkey" PRIMARY KEY (id);


--
-- Name: NewsletterSegments NewsletterSegments_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."NewsletterSegments"
    ADD CONSTRAINT "NewsletterSegments_name_key" UNIQUE (name);


--
-- Name: NewsletterSegments NewsletterSegments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."NewsletterSegments"
    ADD CONSTRAINT "NewsletterSegments_pkey" PRIMARY KEY (id);


--
-- Name: NewsletterSendLogs NewsletterSendLogs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."NewsletterSendLogs"
    ADD CONSTRAINT "NewsletterSendLogs_pkey" PRIMARY KEY (id);


--
-- Name: NewsletterSubscribers NewsletterSubscribers_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."NewsletterSubscribers"
    ADD CONSTRAINT "NewsletterSubscribers_email_key" UNIQUE (email);


--
-- Name: NewsletterSubscribers NewsletterSubscribers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."NewsletterSubscribers"
    ADD CONSTRAINT "NewsletterSubscribers_pkey" PRIMARY KEY (id);


--
-- Name: NewsletterSubscribers NewsletterSubscribers_unsubscribeToken_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."NewsletterSubscribers"
    ADD CONSTRAINT "NewsletterSubscribers_unsubscribeToken_key" UNIQUE ("unsubscribeToken");


--
-- Name: NewsletterTemplates NewsletterTemplates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."NewsletterTemplates"
    ADD CONSTRAINT "NewsletterTemplates_pkey" PRIMARY KEY (id);


--
-- Name: NotificationBanners NotificationBanners_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."NotificationBanners"
    ADD CONSTRAINT "NotificationBanners_pkey" PRIMARY KEY (id);


--
-- Name: OrderAdjustments OrderAdjustments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OrderAdjustments"
    ADD CONSTRAINT "OrderAdjustments_pkey" PRIMARY KEY (id);


--
-- Name: OrderItems OrderItems_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OrderItems"
    ADD CONSTRAINT "OrderItems_pkey" PRIMARY KEY (id);


--
-- Name: Orders Orders_orderNumber_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Orders"
    ADD CONSTRAINT "Orders_orderNumber_key" UNIQUE ("orderNumber");


--
-- Name: Orders Orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Orders"
    ADD CONSTRAINT "Orders_pkey" PRIMARY KEY (id);


--
-- Name: PCBuildServiceOptions PCBuildServiceOptions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PCBuildServiceOptions"
    ADD CONSTRAINT "PCBuildServiceOptions_pkey" PRIMARY KEY (id);


--
-- Name: PCCompatibilityRules PCCompatibilityRules_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PCCompatibilityRules"
    ADD CONSTRAINT "PCCompatibilityRules_pkey" PRIMARY KEY (id);


--
-- Name: PCComponents PCComponents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PCComponents"
    ADD CONSTRAINT "PCComponents_pkey" PRIMARY KEY (id);


--
-- Name: PCConfigurations PCConfigurations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PCConfigurations"
    ADD CONSTRAINT "PCConfigurations_pkey" PRIMARY KEY (id);


--
-- Name: Payments Payments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Payments"
    ADD CONSTRAINT "Payments_pkey" PRIMARY KEY (id);


--
-- Name: PortfolioItems PortfolioItems_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PortfolioItems"
    ADD CONSTRAINT "PortfolioItems_pkey" PRIMARY KEY (id);


--
-- Name: ProfitMarginRules ProfitMarginRules_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ProfitMarginRules"
    ADD CONSTRAINT "ProfitMarginRules_pkey" PRIMARY KEY (id);


--
-- Name: RefreshTokens RefreshTokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."RefreshTokens"
    ADD CONSTRAINT "RefreshTokens_pkey" PRIMARY KEY (id);


--
-- Name: RefreshTokens RefreshTokens_token_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."RefreshTokens"
    ADD CONSTRAINT "RefreshTokens_token_key" UNIQUE (token);


--
-- Name: SequelizeMeta SequelizeMeta_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SequelizeMeta"
    ADD CONSTRAINT "SequelizeMeta_pkey" PRIMARY KEY (name);


--
-- Name: ServiceCategories ServiceCategories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ServiceCategories"
    ADD CONSTRAINT "ServiceCategories_pkey" PRIMARY KEY (id);


--
-- Name: Services Services_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Services"
    ADD CONSTRAINT "Services_pkey" PRIMARY KEY (id);


--
-- Name: SiteSettings SiteSettings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SiteSettings"
    ADD CONSTRAINT "SiteSettings_pkey" PRIMARY KEY (id);


--
-- Name: TeamMember TeamMember_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TeamMember"
    ADD CONSTRAINT "TeamMember_pkey" PRIMARY KEY (id);


--
-- Name: Users Users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key" UNIQUE (email);


--
-- Name: Users Users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_pkey" PRIMARY KEY (id);


--
-- Name: VatSettings VatSettings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."VatSettings"
    ADD CONSTRAINT "VatSettings_pkey" PRIMARY KEY (id);


--
-- Name: addresses_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX addresses_user_id ON public."Addresses" USING btree ("userId");


--
-- Name: addresses_user_id_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX addresses_user_id_type ON public."Addresses" USING btree ("userId", type);


--
-- Name: audit_logs_action; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX audit_logs_action ON public."AuditLogs" USING btree (action);


--
-- Name: audit_logs_admin_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX audit_logs_admin_user_id ON public."AuditLogs" USING btree ("adminUserId");


--
-- Name: audit_logs_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX audit_logs_created_at ON public."AuditLogs" USING btree ("createdAt");


--
-- Name: audit_logs_target_type_target_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX audit_logs_target_type_target_id ON public."AuditLogs" USING btree ("targetType", "targetId");


--
-- Name: banner_is_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX banner_is_active ON public."Banner" USING btree (is_active);


--
-- Name: cart_items_cart_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX cart_items_cart_id ON public."CartItems" USING btree ("cartId");


--
-- Name: cart_items_pc_component_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX cart_items_pc_component_id ON public."CartItems" USING btree ("pcComponentId");


--
-- Name: cart_items_pc_configuration_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX cart_items_pc_configuration_id ON public."CartItems" USING btree ("pcConfigurationId");


--
-- Name: cart_items_service_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX cart_items_service_id ON public."CartItems" USING btree ("serviceId");


--
-- Name: carts_updated_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX carts_updated_at ON public."Carts" USING btree ("updatedAt");


--
-- Name: carts_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX carts_user_id ON public."Carts" USING btree ("userId");


--
-- Name: contact_messages_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX contact_messages_created_at ON public."ContactMessages" USING btree ("createdAt");


--
-- Name: contact_messages_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX contact_messages_email ON public."ContactMessages" USING btree (email);


--
-- Name: contact_messages_is_read; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX contact_messages_is_read ON public."ContactMessages" USING btree ("isRead");


--
-- Name: contact_messages_replied_by; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX contact_messages_replied_by ON public."ContactMessages" USING btree ("repliedBy");


--
-- Name: contact_messages_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX contact_messages_status ON public."ContactMessages" USING btree (status);


--
-- Name: coupons_code; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX coupons_code ON public."Coupons" USING btree (code);


--
-- Name: coupons_is_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX coupons_is_active ON public."Coupons" USING btree ("isActive");


--
-- Name: currencies_code; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX currencies_code ON public."Currencies" USING btree (code);


--
-- Name: currencies_is_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX currencies_is_active ON public."Currencies" USING btree ("isActive");


--
-- Name: emails_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX emails_created_at ON public."Emails" USING btree ("createdAt");


--
-- Name: emails_order_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX emails_order_id ON public."Emails" USING btree ("orderId");


--
-- Name: emails_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX emails_status ON public."Emails" USING btree (status);


--
-- Name: emails_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX emails_user_id ON public."Emails" USING btree ("userId");


--
-- Name: exchange_rates_base_currency_target_currency; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX exchange_rates_base_currency_target_currency ON public."ExchangeRates" USING btree ("baseCurrency", "targetCurrency");


--
-- Name: features_display_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX features_display_order ON public."Features" USING btree ("displayOrder");


--
-- Name: features_is_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX features_is_active ON public."Features" USING btree ("isActive");


--
-- Name: footer_category_titles_display_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX footer_category_titles_display_order ON public."FooterCategoryTitles" USING btree ("displayOrder");


--
-- Name: footer_category_titles_is_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX footer_category_titles_is_active ON public."FooterCategoryTitles" USING btree ("isActive");


--
-- Name: footer_main_pages_display_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX footer_main_pages_display_order ON public."FooterMainPages" USING btree ("displayOrder");


--
-- Name: footer_main_pages_footer_category_title_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX footer_main_pages_footer_category_title_id ON public."FooterMainPages" USING btree ("footerCategoryTitleId");


--
-- Name: footer_main_pages_is_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX footer_main_pages_is_active ON public."FooterMainPages" USING btree ("isActive");


--
-- Name: internal_notes_author_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX internal_notes_author_id ON public."InternalNotes" USING btree ("authorId");


--
-- Name: internal_notes_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX internal_notes_created_at ON public."InternalNotes" USING btree ("createdAt");


--
-- Name: internal_notes_target_type_target_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX internal_notes_target_type_target_id ON public."InternalNotes" USING btree ("targetType", "targetId");


--
-- Name: login_attempts_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX login_attempts_created_at ON public."LoginAttempts" USING btree ("createdAt");


--
-- Name: login_attempts_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX login_attempts_email ON public."LoginAttempts" USING btree (email);


--
-- Name: login_attempts_success; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX login_attempts_success ON public."LoginAttempts" USING btree (success);


--
-- Name: login_attempts_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX login_attempts_user_id ON public."LoginAttempts" USING btree ("userId");


--
-- Name: newsletter_campaign_stats_campaign_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX newsletter_campaign_stats_campaign_id ON public."NewsletterCampaignStats" USING btree ("campaignId");


--
-- Name: newsletter_campaigns_scheduled_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX newsletter_campaigns_scheduled_at ON public."NewsletterCampaigns" USING btree ("scheduledAt");


--
-- Name: newsletter_campaigns_sent_by_admin_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX newsletter_campaigns_sent_by_admin_id ON public."NewsletterCampaigns" USING btree ("sentByAdminId");


--
-- Name: newsletter_campaigns_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX newsletter_campaigns_status ON public."NewsletterCampaigns" USING btree (status);


--
-- Name: newsletter_segment_members_segment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX newsletter_segment_members_segment_id ON public."NewsletterSegmentMembers" USING btree ("segmentId");


--
-- Name: newsletter_segment_members_segment_id_subscriber_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX newsletter_segment_members_segment_id_subscriber_id ON public."NewsletterSegmentMembers" USING btree ("segmentId", "subscriberId");


--
-- Name: newsletter_segment_members_subscriber_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX newsletter_segment_members_subscriber_id ON public."NewsletterSegmentMembers" USING btree ("subscriberId");


--
-- Name: newsletter_segments_name; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX newsletter_segments_name ON public."NewsletterSegments" USING btree (name);


--
-- Name: newsletter_send_logs_campaign_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX newsletter_send_logs_campaign_id ON public."NewsletterSendLogs" USING btree ("campaignId");


--
-- Name: newsletter_send_logs_campaign_id_subscriber_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX newsletter_send_logs_campaign_id_subscriber_id ON public."NewsletterSendLogs" USING btree ("campaignId", "subscriberId");


--
-- Name: newsletter_send_logs_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX newsletter_send_logs_status ON public."NewsletterSendLogs" USING btree (status);


--
-- Name: newsletter_send_logs_subscriber_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX newsletter_send_logs_subscriber_id ON public."NewsletterSendLogs" USING btree ("subscriberId");


--
-- Name: newsletter_subscribers_email; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX newsletter_subscribers_email ON public."NewsletterSubscribers" USING btree (email);


--
-- Name: newsletter_subscribers_is_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX newsletter_subscribers_is_active ON public."NewsletterSubscribers" USING btree ("isActive");


--
-- Name: newsletter_subscribers_source; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX newsletter_subscribers_source ON public."NewsletterSubscribers" USING btree (source);


--
-- Name: newsletter_subscribers_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX newsletter_subscribers_status ON public."NewsletterSubscribers" USING btree (status);


--
-- Name: newsletter_subscribers_unsubscribe_token; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX newsletter_subscribers_unsubscribe_token ON public."NewsletterSubscribers" USING btree ("unsubscribeToken");


--
-- Name: newsletter_subscribers_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX newsletter_subscribers_user_id ON public."NewsletterSubscribers" USING btree ("userId");


--
-- Name: newsletter_subscribers_verification_token; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX newsletter_subscribers_verification_token ON public."NewsletterSubscribers" USING btree ("verificationToken");


--
-- Name: newsletter_templates_is_default; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX newsletter_templates_is_default ON public."NewsletterTemplates" USING btree ("isDefault");


--
-- Name: newsletter_templates_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX newsletter_templates_name ON public."NewsletterTemplates" USING btree (name);


--
-- Name: notification_banners_is_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX notification_banners_is_active ON public."NotificationBanners" USING btree ("isActive");


--
-- Name: notification_banners_priority; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX notification_banners_priority ON public."NotificationBanners" USING btree (priority);


--
-- Name: notification_banners_start_date_end_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX notification_banners_start_date_end_date ON public."NotificationBanners" USING btree ("startDate", "endDate");


--
-- Name: order_adjustments_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX order_adjustments_created_at ON public."OrderAdjustments" USING btree ("createdAt");


--
-- Name: order_adjustments_order_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX order_adjustments_order_id ON public."OrderAdjustments" USING btree ("orderId");


--
-- Name: order_adjustments_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX order_adjustments_type ON public."OrderAdjustments" USING btree (type);


--
-- Name: order_items_order_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX order_items_order_id ON public."OrderItems" USING btree ("orderId");


--
-- Name: order_items_pc_component_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX order_items_pc_component_id ON public."OrderItems" USING btree ("pcComponentId");


--
-- Name: order_items_pc_configuration_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX order_items_pc_configuration_id ON public."OrderItems" USING btree ("pcConfigurationId");


--
-- Name: order_items_service_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX order_items_service_id ON public."OrderItems" USING btree ("serviceId");


--
-- Name: orders_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX orders_created_at ON public."Orders" USING btree ("createdAt");


--
-- Name: orders_order_number; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX orders_order_number ON public."Orders" USING btree ("orderNumber");


--
-- Name: orders_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX orders_status ON public."Orders" USING btree (status);


--
-- Name: orders_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX orders_user_id ON public."Orders" USING btree ("userId");


--
-- Name: p_c_build_service_options_is_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX p_c_build_service_options_is_active ON public."PCBuildServiceOptions" USING btree ("isActive");


--
-- Name: p_c_build_service_options_is_active_is_default; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX p_c_build_service_options_is_active_is_default ON public."PCBuildServiceOptions" USING btree ("isActive", "isDefault");


--
-- Name: p_c_build_service_options_is_default; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX p_c_build_service_options_is_default ON public."PCBuildServiceOptions" USING btree ("isDefault");


--
-- Name: p_c_compatibility_rules_component_type1_component_type2; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX p_c_compatibility_rules_component_type1_component_type2 ON public."PCCompatibilityRules" USING btree ("componentType1", "componentType2");


--
-- Name: p_c_compatibility_rules_is_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX p_c_compatibility_rules_is_active ON public."PCCompatibilityRules" USING btree ("isActive");


--
-- Name: p_c_compatibility_rules_rule_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX p_c_compatibility_rules_rule_type ON public."PCCompatibilityRules" USING btree ("ruleType");


--
-- Name: p_c_compatibility_rules_rule_type_is_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX p_c_compatibility_rules_rule_type_is_active ON public."PCCompatibilityRules" USING btree ("ruleType", "isActive");


--
-- Name: p_c_components_component_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX p_c_components_component_type ON public."PCComponents" USING btree ("componentType");


--
-- Name: p_c_components_component_type_is_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX p_c_components_component_type_is_active ON public."PCComponents" USING btree ("componentType", "isActive");


--
-- Name: p_c_components_is_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX p_c_components_is_active ON public."PCComponents" USING btree ("isActive");


--
-- Name: p_c_components_manufacturer; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX p_c_components_manufacturer ON public."PCComponents" USING btree (manufacturer);


--
-- Name: p_c_components_price; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX p_c_components_price ON public."PCComponents" USING btree (price);


--
-- Name: p_c_configurations_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX p_c_configurations_created_at ON public."PCConfigurations" USING btree ("createdAt");


--
-- Name: p_c_configurations_is_featured; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX p_c_configurations_is_featured ON public."PCConfigurations" USING btree ("isFeatured");


--
-- Name: p_c_configurations_is_pre_configured; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX p_c_configurations_is_pre_configured ON public."PCConfigurations" USING btree ("isPreConfigured");


--
-- Name: p_c_configurations_is_pre_configured_display_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX p_c_configurations_is_pre_configured_display_order ON public."PCConfigurations" USING btree ("isPreConfigured", "displayOrder");


--
-- Name: p_c_configurations_is_pre_configured_is_featured; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX p_c_configurations_is_pre_configured_is_featured ON public."PCConfigurations" USING btree ("isPreConfigured", "isFeatured");


--
-- Name: p_c_configurations_order_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX p_c_configurations_order_id ON public."PCConfigurations" USING btree ("orderId");


--
-- Name: p_c_configurations_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX p_c_configurations_status ON public."PCConfigurations" USING btree (status);


--
-- Name: p_c_configurations_tier; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX p_c_configurations_tier ON public."PCConfigurations" USING btree (tier);


--
-- Name: p_c_configurations_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX p_c_configurations_user_id ON public."PCConfigurations" USING btree ("userId");


--
-- Name: p_c_configurations_user_id_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX p_c_configurations_user_id_status ON public."PCConfigurations" USING btree ("userId", status);


--
-- Name: payments_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payments_created_at ON public."Payments" USING btree ("createdAt");


--
-- Name: payments_klarna_order_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payments_klarna_order_id ON public."Payments" USING btree ("klarnaOrderId");


--
-- Name: payments_order_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payments_order_id ON public."Payments" USING btree ("orderId");


--
-- Name: payments_order_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payments_order_id_idx ON public."Payments" USING btree ("orderId");


--
-- Name: payments_phase; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payments_phase ON public."Payments" USING btree (phase);


--
-- Name: payments_phase_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payments_phase_idx ON public."Payments" USING btree (phase);


--
-- Name: payments_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payments_status ON public."Payments" USING btree (status);


--
-- Name: payments_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payments_status_idx ON public."Payments" USING btree (status);


--
-- Name: portfolio_items_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX portfolio_items_category ON public."PortfolioItems" USING btree (category);


--
-- Name: portfolio_items_featured; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX portfolio_items_featured ON public."PortfolioItems" USING btree (featured);


--
-- Name: portfolio_items_is_published; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX portfolio_items_is_published ON public."PortfolioItems" USING btree ("isPublished");


--
-- Name: portfolio_items_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX portfolio_items_order ON public."PortfolioItems" USING btree ("order");


--
-- Name: profit_margin_rules_component_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX profit_margin_rules_component_type ON public."ProfitMarginRules" USING btree ("componentType");


--
-- Name: profit_margin_rules_is_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX profit_margin_rules_is_active ON public."ProfitMarginRules" USING btree ("isActive");


--
-- Name: profit_margin_rules_pc_component_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX profit_margin_rules_pc_component_id ON public."ProfitMarginRules" USING btree ("pcComponentId");


--
-- Name: profit_margin_rules_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX profit_margin_rules_type ON public."ProfitMarginRules" USING btree (type);


--
-- Name: refresh_tokens_expires_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX refresh_tokens_expires_at ON public."RefreshTokens" USING btree ("expiresAt");


--
-- Name: refresh_tokens_token; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX refresh_tokens_token ON public."RefreshTokens" USING btree (token);


--
-- Name: refresh_tokens_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX refresh_tokens_user_id ON public."RefreshTokens" USING btree ("userId");


--
-- Name: service_categories_display_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX service_categories_display_order ON public."ServiceCategories" USING btree ("displayOrder");


--
-- Name: service_categories_is_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX service_categories_is_active ON public."ServiceCategories" USING btree ("isActive");


--
-- Name: services_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX services_category ON public."Services" USING btree (category);


--
-- Name: services_is_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX services_is_active ON public."Services" USING btree ("isActive");


--
-- Name: services_service_category_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX services_service_category_id ON public."Services" USING btree ("serviceCategoryId");


--
-- Name: team_member_is_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX team_member_is_active ON public."TeamMember" USING btree (is_active);


--
-- Name: team_member_sort_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX team_member_sort_order ON public."TeamMember" USING btree (sort_order);


--
-- Name: users_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX users_email ON public."Users" USING btree (email);


--
-- Name: users_role; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX users_role ON public."Users" USING btree (role);


--
-- Name: Addresses Addresses_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Addresses"
    ADD CONSTRAINT "Addresses_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CartItems CartItems_cartId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CartItems"
    ADD CONSTRAINT "CartItems_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES public."Carts"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CartItems CartItems_pcComponentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CartItems"
    ADD CONSTRAINT "CartItems_pcComponentId_fkey" FOREIGN KEY ("pcComponentId") REFERENCES public."PCComponents"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: CartItems CartItems_pcConfigurationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CartItems"
    ADD CONSTRAINT "CartItems_pcConfigurationId_fkey" FOREIGN KEY ("pcConfigurationId") REFERENCES public."PCConfigurations"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: CartItems CartItems_serviceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CartItems"
    ADD CONSTRAINT "CartItems_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES public."Services"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Carts Carts_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Carts"
    ADD CONSTRAINT "Carts_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ContactMessages ContactMessages_repliedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ContactMessages"
    ADD CONSTRAINT "ContactMessages_repliedBy_fkey" FOREIGN KEY ("repliedBy") REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Emails Emails_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Emails"
    ADD CONSTRAINT "Emails_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Orders"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Emails Emails_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Emails"
    ADD CONSTRAINT "Emails_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: FooterMainPages FooterMainPages_footerCategoryTitleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."FooterMainPages"
    ADD CONSTRAINT "FooterMainPages_footerCategoryTitleId_fkey" FOREIGN KEY ("footerCategoryTitleId") REFERENCES public."FooterCategoryTitles"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: InternalNotes InternalNotes_authorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."InternalNotes"
    ADD CONSTRAINT "InternalNotes_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES public."Users"(id) ON UPDATE CASCADE;


--
-- Name: LoginAttempts LoginAttempts_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."LoginAttempts"
    ADD CONSTRAINT "LoginAttempts_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: NewsletterCampaignStats NewsletterCampaignStats_campaignId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."NewsletterCampaignStats"
    ADD CONSTRAINT "NewsletterCampaignStats_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES public."NewsletterCampaigns"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: NewsletterCampaigns NewsletterCampaigns_sentByAdminId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."NewsletterCampaigns"
    ADD CONSTRAINT "NewsletterCampaigns_sentByAdminId_fkey" FOREIGN KEY ("sentByAdminId") REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: NewsletterCampaigns NewsletterCampaigns_templateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."NewsletterCampaigns"
    ADD CONSTRAINT "NewsletterCampaigns_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES public."NewsletterTemplates"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: NewsletterSegmentMembers NewsletterSegmentMembers_segmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."NewsletterSegmentMembers"
    ADD CONSTRAINT "NewsletterSegmentMembers_segmentId_fkey" FOREIGN KEY ("segmentId") REFERENCES public."NewsletterSegments"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: NewsletterSegmentMembers NewsletterSegmentMembers_subscriberId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."NewsletterSegmentMembers"
    ADD CONSTRAINT "NewsletterSegmentMembers_subscriberId_fkey" FOREIGN KEY ("subscriberId") REFERENCES public."NewsletterSubscribers"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: NewsletterSendLogs NewsletterSendLogs_campaignId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."NewsletterSendLogs"
    ADD CONSTRAINT "NewsletterSendLogs_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES public."NewsletterCampaigns"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: NewsletterSendLogs NewsletterSendLogs_subscriberId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."NewsletterSendLogs"
    ADD CONSTRAINT "NewsletterSendLogs_subscriberId_fkey" FOREIGN KEY ("subscriberId") REFERENCES public."NewsletterSubscribers"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: NewsletterSubscribers NewsletterSubscribers_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."NewsletterSubscribers"
    ADD CONSTRAINT "NewsletterSubscribers_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: OrderAdjustments OrderAdjustments_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OrderAdjustments"
    ADD CONSTRAINT "OrderAdjustments_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Orders"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: OrderItems OrderItems_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OrderItems"
    ADD CONSTRAINT "OrderItems_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Orders"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: OrderItems OrderItems_pcComponentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OrderItems"
    ADD CONSTRAINT "OrderItems_pcComponentId_fkey" FOREIGN KEY ("pcComponentId") REFERENCES public."PCComponents"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: OrderItems OrderItems_pcConfigurationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OrderItems"
    ADD CONSTRAINT "OrderItems_pcConfigurationId_fkey" FOREIGN KEY ("pcConfigurationId") REFERENCES public."PCConfigurations"(id) ON DELETE SET NULL;


--
-- Name: OrderItems OrderItems_serviceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OrderItems"
    ADD CONSTRAINT "OrderItems_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES public."Services"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Orders Orders_couponId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Orders"
    ADD CONSTRAINT "Orders_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES public."Coupons"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Orders Orders_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Orders"
    ADD CONSTRAINT "Orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: PCConfigurations PCConfigurations_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PCConfigurations"
    ADD CONSTRAINT "PCConfigurations_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Orders"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: PCConfigurations PCConfigurations_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PCConfigurations"
    ADD CONSTRAINT "PCConfigurations_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Payments Payments_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Payments"
    ADD CONSTRAINT "Payments_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Orders"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ProfitMarginRules ProfitMarginRules_pcComponentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ProfitMarginRules"
    ADD CONSTRAINT "ProfitMarginRules_pcComponentId_fkey" FOREIGN KEY ("pcComponentId") REFERENCES public."PCComponents"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: RefreshTokens RefreshTokens_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."RefreshTokens"
    ADD CONSTRAINT "RefreshTokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Services Services_serviceCategoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Services"
    ADD CONSTRAINT "Services_serviceCategoryId_fkey" FOREIGN KEY ("serviceCategoryId") REFERENCES public."ServiceCategories"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

\unrestrict yy1IqfgS4SeZ1vtWcUfuIGQAjzcWi6Jnk6iGxrje7WyLTbaPeshNhtchItPWYZJ

