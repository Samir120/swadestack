// ==================== Dashboard ====================

export interface NewsletterDashboardData {
  totalSubscribers: number;
  activeSubscribers: number;
  unsubscribedCount: number;
  newThisMonth: number;
  avgOpenRate: number;
  avgClickRate: number;
  subscriberGrowth: Array<{
    date: string;
    count: number;
  }>;
  recentCampaigns: CampaignListItem[];
}

// ==================== Campaigns ====================

export type CampaignStatus = 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed' | 'cancelled';

export interface CampaignListItem {
  id: string;
  name: string;
  subject: string;
  previewText?: string;
  status: CampaignStatus;
  templateId?: string;
  targetSubscriberCount?: number;
  targetSegmentIds?: string[];
  targetSubscriberIds?: string[];
  scheduledAt?: string;
  sentAt?: string;
  sentByAdmin?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  stats?: CampaignStatsData;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignStatsData {
  totalSent: number;
  totalDelivered: number;
  totalOpened: number;
  uniqueOpens: number;
  totalClicked: number;
  uniqueClicks: number;
  totalUnsubscribed: number;
  totalBounced: number;
  totalFailed: number;
  openRate: number;
  clickRate: number;
}

export interface CreateCampaignData {
  name: string;
  subject: string;
  previewText?: string;
  contentJson?: object;
  templateId?: string;
  targetSegmentIds?: string[];
}

export interface UpdateCampaignData {
  name?: string;
  subject?: string;
  previewText?: string;
  contentJson?: object;
  templateId?: string;
  status?: CampaignStatus;
  targetSegmentIds?: string[];
  targetSubscriberIds?: string[];
  scheduledAt?: string;
}

export interface CampaignListQuery {
  status?: CampaignStatus;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface CampaignListResponse {
  campaigns: CampaignListItem[];
  total: number;
}

// ==================== Segments ====================

export type SegmentType = 'auto' | 'manual';

export interface SegmentListItem {
  id: string;
  name: string;
  description?: string;
  type: SegmentType;
  rules?: object;
  subscriberCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSegmentData {
  name: string;
  description?: string;
  type: SegmentType;
  rules?: object;
}

export interface UpdateSegmentData {
  name?: string;
  description?: string;
  rules?: object;
}

// ==================== Subscribers ====================

export type SubscriberStatus = 'active' | 'unsubscribed' | 'bounced' | 'pending_confirmation';
export type SubscriberSource = 'registration' | 'website_signup' | 'checkout' | 'admin_manual' | 'csv_import';

export interface AdminSubscriberListItem {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  status: SubscriberStatus;
  source?: SubscriberSource;
  language: 'en' | 'sv';
  isActive: boolean;
  verifiedAt?: string;
  unsubscribedAt?: string;
  createdAt: string;
}

export interface AdminSubscriberDetail extends AdminSubscriberListItem {
  userId?: string;
  preferences?: object;
  segments: Array<{
    id: string;
    name: string;
  }>;
  updatedAt: string;
}

export interface CreateSubscriberData {
  email: string;
  firstName?: string;
  lastName?: string;
  language?: 'en' | 'sv';
  status?: SubscriberStatus;
  source?: SubscriberSource;
}

export interface UpdateSubscriberData {
  firstName?: string;
  lastName?: string;
  language?: 'en' | 'sv';
  status?: SubscriberStatus;
}

export interface SubscriberListQuery {
  search?: string;
  status?: SubscriberStatus;
  language?: 'en' | 'sv';
  sortBy?: 'createdAt' | 'email' | 'status';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface SubscriberListResponse {
  subscribers: AdminSubscriberListItem[];
  total: number;
}

// ==================== Templates ====================

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
  type: BlockType;
  order: number;
  settings: Record<string, any>;
}

export type BlockType =
  | 'text'
  | 'image'
  | 'button'
  | 'divider'
  | 'spacer'
  | 'productCard'
  | 'productGrid'
  | 'coupon'
  | 'hero'
  | 'personalization'
  | 'socialMedia'
  | 'columns';

// ==================== Product Search ====================

export interface ProductSearchItem {
  id: string;
  type: 'service' | 'gaming-pc';
  name: string;
  description: string;
  price: string;
  priceRaw: number;
  imageUrl: string;
  category: string;
  pageUrl: string;
  buttonText: string;
}

export interface ProductSearchResult {
  products: ProductSearchItem[];
  total: number;
  categories: string[];
}

export interface ProductSearchQuery {
  query?: string;
  category?: string;
  page?: number;
  pageSize?: number;
}

export interface TemplateListItem {
  id: string;
  name: string;
  isDefault: boolean;
  previewThumbnailUrl?: string;
  globalStyles?: GlobalStylesConfig;
  socialMediaConfig?: SocialMediaConfig;
  footerConfig?: FooterConfig;
  contentBlocks?: ContentBlock[];
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTemplateData {
  name: string;
  globalStyles?: GlobalStylesConfig;
  socialMediaConfig?: SocialMediaConfig;
  footerConfig?: FooterConfig;
  contentBlocks?: ContentBlock[];
}

export interface UpdateTemplateData {
  name?: string;
  globalStyles?: GlobalStylesConfig;
  socialMediaConfig?: SocialMediaConfig;
  footerConfig?: FooterConfig;
  contentBlocks?: ContentBlock[];
}

// ==================== Campaign Sending ====================

export interface CampaignValidation {
  valid: boolean;
  errors: string[];
  recipientCount: number;
}

export interface CampaignReportData {
  campaign: {
    id: string;
    name: string;
    subject: string;
    status: string;
    sentAt?: string;
    targetSubscriberCount?: number;
  };
  stats: {
    totalSent: number;
    totalDelivered: number;
    totalOpened: number;
    uniqueOpens: number;
    totalClicked: number;
    uniqueClicks: number;
    totalBounced: number;
    totalFailed: number;
    totalUnsubscribed: number;
    openRate: number;
    clickRate: number;
    bounceRate: number;
  };
  opensOverTime: Array<{ date: string; opens: number }>;
}

export interface RecipientActivity {
  id: string;
  email: string;
  subscriberId: string;
  subscriberName?: string;
  status: string;
  sentAt?: string;
  openedAt?: string;
  clickedAt?: string;
  bouncedAt?: string;
  failureReason?: string;
}

export interface RecipientActivityResponse {
  recipients: RecipientActivity[];
  total: number;
}
