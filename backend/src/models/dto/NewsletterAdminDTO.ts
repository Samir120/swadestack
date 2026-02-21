import { SubscriberStatus, SubscriberSource } from '../sequelize/NewsletterSubscriber';
import { CampaignStatus } from '../sequelize/NewsletterCampaign';
import { SegmentType } from '../sequelize/NewsletterSegment';

// ==================== Dashboard ====================

export interface NewsletterDashboardDTO {
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
  recentCampaigns: CampaignListDTO[];
}

// ==================== Campaigns ====================

export interface CampaignListDTO {
  id: string;
  name: string;
  subject: string;
  previewText?: string;
  status: CampaignStatus;
  templateId?: string;
  targetSubscriberCount?: number;
  targetSegmentIds?: string[];
  targetSubscriberIds?: string[];
  scheduledAt?: Date;
  sentAt?: Date;
  sentByAdmin?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  stats?: CampaignStatsDTO;
  createdAt: Date;
  updatedAt: Date;
}

export interface CampaignStatsDTO {
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

export interface CreateCampaignDTO {
  name: string;
  subject: string;
  previewText?: string;
  contentJson?: object;
  templateId?: string;
  targetSegmentIds?: string[];
  targetSubscriberIds?: string[];
}

export interface UpdateCampaignDTO {
  name?: string;
  subject?: string;
  previewText?: string;
  contentJson?: object;
  templateId?: string;
  status?: CampaignStatus;
  targetSegmentIds?: string[];
  targetSubscriberIds?: string[];
  scheduledAt?: Date;
}

// ==================== Segments ====================

export interface SegmentListDTO {
  id: string;
  name: string;
  description?: string;
  type: SegmentType;
  rules?: object;
  subscriberCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSegmentDTO {
  name: string;
  description?: string;
  type: SegmentType;
  rules?: object;
}

export interface UpdateSegmentDTO {
  name?: string;
  description?: string;
  rules?: object;
}

// ==================== Subscribers ====================

export interface AdminSubscriberListDTO {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  status: SubscriberStatus;
  source?: SubscriberSource;
  language: 'en' | 'sv';
  isActive: boolean;
  verifiedAt?: Date;
  unsubscribedAt?: Date;
  createdAt: Date;
}

export interface AdminSubscriberDetailDTO extends AdminSubscriberListDTO {
  userId?: string;
  preferences?: object;
  segments: Array<{
    id: string;
    name: string;
  }>;
  updatedAt: Date;
}

export interface CreateSubscriberDTO {
  email: string;
  firstName?: string;
  lastName?: string;
  language?: 'en' | 'sv';
  status?: SubscriberStatus;
  source?: SubscriberSource;
}

export interface UpdateSubscriberDTO {
  firstName?: string;
  lastName?: string;
  language?: 'en' | 'sv';
  status?: SubscriberStatus;
}

export interface AdminSubscriberListQueryDTO {
  search?: string;
  status?: SubscriberStatus;
  language?: 'en' | 'sv';
  sortBy?: 'createdAt' | 'email' | 'status';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}
