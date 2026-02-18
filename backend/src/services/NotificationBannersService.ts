import NotificationBannersRepository from '../integration/repositories/NotificationBannersRepository';
import CompanyLegalSettings from '../models/sequelize/CompanyLegalSettings';
import {
  NotificationBannerDTO,
  CreateNotificationBannerDTO,
  UpdateNotificationBannerDTO,
  ActiveNotificationBannerDTO,
} from '../models/dto/NotificationBannerDTO';

export class NotificationBannersService {
  private repository: NotificationBannersRepository;

  constructor() {
    this.repository = new NotificationBannersRepository();
  }

  async getActiveBanner(): Promise<ActiveNotificationBannerDTO | null> {
    const banner = await this.repository.findActiveBanner();
    if (!banner) return null;

    let contactPhone: string | null = null;
    let contactEmail: string | null = null;

    if (banner.showPhone || banner.showEmail) {
      const settings = await CompanyLegalSettings.findOne();
      if (settings) {
        if (banner.showPhone) contactPhone = settings.phoneNumber || null;
        if (banner.showEmail) contactEmail = settings.email || null;
      }
    }

    return this.mapToActiveDTO(banner, contactPhone, contactEmail);
  }

  async getAll(): Promise<NotificationBannerDTO[]> {
    const items = await this.repository.findAllBanners();
    return items.map(this.mapToDTO);
  }

  async getById(id: string): Promise<NotificationBannerDTO | null> {
    const item = await this.repository.findById(id);
    return item ? this.mapToDTO(item) : null;
  }

  async create(data: CreateNotificationBannerDTO): Promise<NotificationBannerDTO> {
    this.validate(data);
    const item = await this.repository.create(data);
    return this.mapToDTO(item);
  }

  async update(id: string, data: UpdateNotificationBannerDTO): Promise<NotificationBannerDTO | null> {
    const existing = await this.repository.findById(id);
    if (!existing) return null;

    this.validate(data as any);
    const [, updatedItems] = await this.repository.update(id, data);
    return updatedItems[0] ? this.mapToDTO(updatedItems[0]) : null;
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await this.repository.delete(id);
    return deleted > 0;
  }

  async toggleActive(id: string): Promise<NotificationBannerDTO | null> {
    const item = await this.repository.toggleActive(id);
    return item ? this.mapToDTO(item) : null;
  }

  async trackStat(id: string, type: 'impression' | 'click' | 'dismiss'): Promise<void> {
    const fieldMap: Record<string, 'impressions' | 'clicks' | 'dismissals'> = {
      impression: 'impressions',
      click: 'clicks',
      dismiss: 'dismissals',
    };
    const field = fieldMap[type];
    if (field) {
      await this.repository.incrementStat(id, field);
    }
  }

  private mapToDTO(item: any): NotificationBannerDTO {
    return {
      id: item.id,
      title: item.title,
      message_en: item.message_en,
      message_sv: item.message_sv,
      linkUrl: item.linkUrl,
      linkText_en: item.linkText_en,
      linkText_sv: item.linkText_sv,
      couponCode: item.couponCode,
      showPhone: item.showPhone,
      showEmail: item.showEmail,
      backgroundColor: item.backgroundColor,
      textColor: item.textColor,
      backgroundType: item.backgroundType,
      gradientEndColor: item.gradientEndColor,
      gradientDirection: item.gradientDirection,
      fontWeight: item.fontWeight,
      fontSize: item.fontSize,
      icon: item.icon,
      isActive: item.isActive,
      showOnAuthPages: item.showOnAuthPages,
      showOnAdminPanel: item.showOnAdminPanel,
      isDismissible: item.isDismissible,
      startDate: item.startDate,
      endDate: item.endDate,
      showOnPages: item.showOnPages,
      priority: item.priority,
      impressions: Number(item.impressions),
      clicks: Number(item.clicks),
      dismissals: Number(item.dismissals),
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  }

  private mapToActiveDTO(
    item: any,
    contactPhone: string | null,
    contactEmail: string | null
  ): ActiveNotificationBannerDTO {
    return {
      id: item.id,
      title: item.title,
      message_en: item.message_en,
      message_sv: item.message_sv,
      linkUrl: item.linkUrl,
      linkText_en: item.linkText_en,
      linkText_sv: item.linkText_sv,
      couponCode: item.couponCode,
      showPhone: item.showPhone,
      showEmail: item.showEmail,
      contactPhone,
      contactEmail,
      backgroundColor: item.backgroundColor,
      textColor: item.textColor,
      backgroundType: item.backgroundType,
      gradientEndColor: item.gradientEndColor,
      gradientDirection: item.gradientDirection,
      fontWeight: item.fontWeight,
      fontSize: item.fontSize,
      icon: item.icon,
      isActive: item.isActive,
      showOnAuthPages: item.showOnAuthPages,
      showOnAdminPanel: item.showOnAdminPanel,
      isDismissible: item.isDismissible,
      startDate: item.startDate,
      endDate: item.endDate,
      showOnPages: item.showOnPages,
      priority: item.priority,
    };
  }

  private validate(data: Partial<CreateNotificationBannerDTO>): void {
    if (data.message_en && data.message_en.length > 300) {
      throw new Error('English message must not exceed 300 characters');
    }
    if (data.message_sv && data.message_sv.length > 300) {
      throw new Error('Swedish message must not exceed 300 characters');
    }
    if (data.backgroundColor && !/^#[0-9A-Fa-f]{6}$/.test(data.backgroundColor)) {
      throw new Error('Invalid background color format. Use hex format like #1e40af');
    }
    if (data.textColor && !/^#[0-9A-Fa-f]{6}$/.test(data.textColor)) {
      throw new Error('Invalid text color format. Use hex format like #ffffff');
    }
    if (data.gradientEndColor && !/^#[0-9A-Fa-f]{6}$/.test(data.gradientEndColor)) {
      throw new Error('Invalid gradient end color format. Use hex format like #7c3aed');
    }
    if (data.backgroundType && !['solid', 'gradient'].includes(data.backgroundType)) {
      throw new Error('backgroundType must be "solid" or "gradient"');
    }
    if (data.fontWeight && !['normal', 'medium', 'semibold', 'bold'].includes(data.fontWeight)) {
      throw new Error('fontWeight must be "normal", "medium", "semibold", or "bold"');
    }
    if (data.fontSize && !['xs', 'sm', 'base', 'lg'].includes(data.fontSize)) {
      throw new Error('fontSize must be "xs", "sm", "base", or "lg"');
    }
    if (data.startDate && data.endDate && new Date(data.startDate) >= new Date(data.endDate)) {
      throw new Error('Start date must be before end date');
    }
  }
}

export default NotificationBannersService;
