export type BackgroundType = 'solid' | 'gradient';
export type FontWeight = 'normal' | 'medium' | 'semibold' | 'bold';
export type FontSize = 'xs' | 'sm' | 'base' | 'lg';

export interface NotificationBanner {
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
  backgroundType: BackgroundType;
  gradientEndColor: string | null;
  gradientDirection: string | null;
  fontWeight: FontWeight;
  fontSize: FontSize;
  icon: string | null;
  isActive: boolean;
  showOnAuthPages: boolean;
  showOnAdminPanel: boolean;
  isDismissible: boolean;
  startDate: string | null;
  endDate: string | null;
  showOnPages: string[];
  priority: number;
  impressions: number;
  clicks: number;
  dismissals: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ActiveNotificationBanner {
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
  contactPhone: string | null;
  contactEmail: string | null;
  backgroundColor: string;
  textColor: string;
  backgroundType: BackgroundType;
  gradientEndColor: string | null;
  gradientDirection: string | null;
  fontWeight: FontWeight;
  fontSize: FontSize;
  icon: string | null;
  isActive: boolean;
  showOnAuthPages: boolean;
  showOnAdminPanel: boolean;
  isDismissible: boolean;
  startDate: string | null;
  endDate: string | null;
  showOnPages: string[];
  priority: number;
}
