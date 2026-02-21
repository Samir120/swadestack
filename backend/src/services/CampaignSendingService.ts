import { NewsletterCampaignRepository } from '../integration/repositories/NewsletterCampaignRepository';
import { NewsletterSendLogRepository } from '../integration/repositories/NewsletterSendLogRepository';
import NewsletterSubscriber from '../models/sequelize/NewsletterSubscriber';
import NewsletterCampaign from '../models/sequelize/NewsletterCampaign';
import NewsletterCampaignStats from '../models/sequelize/NewsletterCampaignStats';
import NewsletterTemplate from '../models/sequelize/NewsletterTemplate';
import NewsletterSendLog from '../models/sequelize/NewsletterSendLog';
import NewsletterSegmentMember from '../models/sequelize/NewsletterSegmentMember';
import emailRenderingService from './EmailRenderingService';
import { EmailService } from './EmailService';
import { Op } from 'sequelize';

interface SendOptions {
  campaignId: string;
  adminId: string;
  testEmail?: string;
}

interface CampaignReportDTO {
  campaign: {
    id: string;
    name: string;
    subject: string;
    status: string;
    sentAt?: Date;
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

export class CampaignSendingService {
  private campaignRepository: NewsletterCampaignRepository;
  private sendLogRepository: NewsletterSendLogRepository;
  private emailService: EmailService;

  constructor() {
    this.campaignRepository = new NewsletterCampaignRepository();
    this.sendLogRepository = new NewsletterSendLogRepository();
    this.emailService = new EmailService();
  }

  /**
   * Validate campaign is ready to send
   */
  async validateCampaign(campaignId: string): Promise<{ valid: boolean; errors: string[]; recipientCount: number }> {
    const campaign = await this.campaignRepository.findById(campaignId);
    const errors: string[] = [];

    if (!campaign) {
      return { valid: false, errors: ['Campaign not found'], recipientCount: 0 };
    }

    if (!campaign.subject) errors.push('Subject is required');
    if (!campaign.contentJson) errors.push('Email content is required');
    if (campaign.status !== 'draft' && campaign.status !== 'scheduled') {
      errors.push(`Campaign cannot be sent in "${campaign.status}" status`);
    }

    // Count recipients
    const recipientCount = await this.getRecipientCount(campaign);

    if (recipientCount === 0) {
      errors.push('No active subscribers match the target criteria');
    }

    return { valid: errors.length === 0, errors, recipientCount };
  }

  /**
   * Send test email for a campaign
   */
  async sendTestEmail(options: SendOptions): Promise<void> {
    const { campaignId, testEmail } = options;
    if (!testEmail) throw new Error('Test email address is required');

    const campaign = await this.campaignRepository.findById(campaignId);
    if (!campaign) throw new Error('Campaign not found');

    const template = campaign.templateId
      ? await NewsletterTemplate.findByPk(campaign.templateId)
      : await NewsletterTemplate.findOne({ where: { isDefault: true } });

    const globalStyles = template?.globalStyles || {};
    const socialMediaConfig = template?.socialMediaConfig || { platforms: [] };
    const footerConfig = template?.footerConfig || {};
    const contentBlocks = (campaign.contentJson as any)?.blocks || [];
    const trackingBaseUrl = process.env.FRONTEND_URL || 'http://localhost:5000';

    const html = emailRenderingService.render({
      subject: campaign.subject,
      previewText: campaign.previewText,
      contentBlocks,
      globalStyles: globalStyles as any,
      socialMediaConfig: socialMediaConfig as any,
      footerConfig: footerConfig as any,
      subscriberData: {
        email: testEmail,
        firstName: 'Test',
        unsubscribeUrl: '#',
      },
      trackingBaseUrl,
    });

    // Replace personalization variables with test data
    const finalHtml = emailRenderingService.replaceVariables(html, {
      first_name: 'Test',
      email: testEmail,
    });

    await this.emailService.sendRawHtml({
      to: testEmail,
      subject: `[TEST] ${campaign.subject}`,
      html: finalHtml,
    });
  }

  /**
   * Send a campaign to all targeted subscribers
   */
  async sendCampaign(options: SendOptions): Promise<{ queued: number }> {
    const { campaignId, adminId } = options;

    const campaign = await this.campaignRepository.findById(campaignId);
    if (!campaign) throw new Error('Campaign not found');

    if (campaign.status !== 'draft' && campaign.status !== 'scheduled') {
      throw new Error(`Campaign cannot be sent in "${campaign.status}" status`);
    }

    // Mark as sending
    await this.campaignRepository.update(campaignId, {
      status: 'sending',
      sentByAdminId: adminId,
      sentAt: new Date(),
    });

    // Get recipients
    const subscribers = await this.getRecipients(campaign);

    // Create send logs in batch
    const logEntries = subscribers.map(sub => ({
      campaignId,
      subscriberId: sub.id,
      email: sub.email,
      status: 'queued' as const,
    }));

    await this.sendLogRepository.createBatch(logEntries);

    // Update target count
    await this.campaignRepository.update(campaignId, {
      targetSubscriberCount: subscribers.length,
    });

    // Process sending in background (non-blocking)
    this.processSending(campaignId).catch(err =>
      console.error(`Campaign ${campaignId} sending error:`, err)
    );

    return { queued: subscribers.length };
  }

  /**
   * Schedule a campaign for future delivery
   */
  async scheduleCampaign(campaignId: string, scheduledAt: Date, adminId: string): Promise<void> {
    const campaign = await this.campaignRepository.findById(campaignId);
    if (!campaign) throw new Error('Campaign not found');

    if (campaign.status !== 'draft') {
      throw new Error('Only draft campaigns can be scheduled');
    }

    if (scheduledAt <= new Date()) {
      throw new Error('Scheduled time must be in the future');
    }

    await this.campaignRepository.update(campaignId, {
      status: 'scheduled',
      scheduledAt,
      sentByAdminId: adminId,
    });
  }

  /**
   * Get campaign report/analytics
   */
  async getCampaignReport(campaignId: string): Promise<CampaignReportDTO> {
    const campaign = await this.campaignRepository.findByIdWithStats(campaignId);
    if (!campaign) throw new Error('Campaign not found');

    const stats = (campaign as any).stats;
    const totalSent = stats?.totalSent || 0;

    // Get opens over time (last 7 days or since sent)
    const opensOverTime = await this.getOpensOverTime(campaignId);

    return {
      campaign: {
        id: campaign.id,
        name: campaign.name,
        subject: campaign.subject,
        status: campaign.status,
        sentAt: campaign.sentAt,
        targetSubscriberCount: campaign.targetSubscriberCount,
      },
      stats: {
        totalSent,
        totalDelivered: stats?.totalDelivered || 0,
        totalOpened: stats?.totalOpened || 0,
        uniqueOpens: stats?.uniqueOpens || 0,
        totalClicked: stats?.totalClicked || 0,
        uniqueClicks: stats?.uniqueClicks || 0,
        totalBounced: stats?.totalBounced || 0,
        totalFailed: stats?.totalFailed || 0,
        totalUnsubscribed: stats?.totalUnsubscribed || 0,
        openRate: totalSent > 0 ? ((stats?.uniqueOpens || 0) / totalSent) * 100 : 0,
        clickRate: totalSent > 0 ? ((stats?.uniqueClicks || 0) / totalSent) * 100 : 0,
        bounceRate: totalSent > 0 ? ((stats?.totalBounced || 0) / totalSent) * 100 : 0,
      },
      opensOverTime,
    };
  }

  /**
   * Get recipient activity for a campaign (paginated)
   */
  async getRecipientActivity(campaignId: string, options?: {
    status?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{ recipients: any[]; total: number }> {
    const page = options?.page || 1;
    const pageSize = options?.pageSize || 25;
    const offset = (page - 1) * pageSize;

    const result = await this.sendLogRepository.findByCampaign(campaignId, {
      status: options?.status,
      limit: pageSize,
      offset,
    });

    const recipients = result.logs.map(log => ({
      id: log.id,
      email: log.email,
      subscriberId: log.subscriberId,
      subscriberName: (log as any).subscriber
        ? `${(log as any).subscriber.firstName || ''} ${(log as any).subscriber.lastName || ''}`.trim()
        : undefined,
      status: log.status,
      sentAt: log.sentAt,
      openedAt: log.openedAt,
      clickedAt: log.clickedAt,
      bouncedAt: log.bouncedAt,
      failureReason: log.failureReason,
    }));

    return { recipients, total: result.total };
  }

  /**
   * Track email open (called by tracking pixel endpoint)
   */
  async trackOpen(sendLogId: string): Promise<void> {
    const log = await NewsletterSendLog.findByPk(sendLogId);
    if (!log) return;

    // Only track first open
    if (!log.openedAt) {
      await log.update({
        status: 'opened',
        openedAt: new Date(),
      });

      // Update campaign stats
      await this.updateCampaignStats(log.campaignId);
    }
  }

  /**
   * Track link click (called by click redirect endpoint)
   */
  async trackClick(sendLogId: string): Promise<string | null> {
    const log = await NewsletterSendLog.findByPk(sendLogId);
    if (!log) return null;

    // Track open too if not already tracked
    if (!log.openedAt) {
      await log.update({
        status: 'clicked',
        openedAt: new Date(),
        clickedAt: new Date(),
      });
    } else if (!log.clickedAt) {
      await log.update({
        status: 'clicked',
        clickedAt: new Date(),
      });
    }

    await this.updateCampaignStats(log.campaignId);
    return log.campaignId;
  }

  // ==================== Private helpers ====================

  private async getRecipientCount(campaign: NewsletterCampaign): Promise<number> {
    const where: any = { status: 'active', isActive: true };

    if (campaign.targetSubscriberIds && campaign.targetSubscriberIds.length > 0) {
      where.id = { [Op.in]: campaign.targetSubscriberIds };
    } else if (campaign.targetSegmentIds && campaign.targetSegmentIds.length > 0) {
      const memberIds = await NewsletterSegmentMember.findAll({
        where: { segmentId: { [Op.in]: campaign.targetSegmentIds } },
        attributes: ['subscriberId'],
        raw: true,
      });
      const ids = [...new Set(memberIds.map((m: any) => m.subscriberId))];
      if (ids.length === 0) return 0;
      where.id = { [Op.in]: ids };
    }

    return await NewsletterSubscriber.count({ where });
  }

  private async getRecipients(campaign: NewsletterCampaign): Promise<NewsletterSubscriber[]> {
    const where: any = { status: 'active', isActive: true };

    if (campaign.targetSubscriberIds && campaign.targetSubscriberIds.length > 0) {
      where.id = { [Op.in]: campaign.targetSubscriberIds };
    } else if (campaign.targetSegmentIds && campaign.targetSegmentIds.length > 0) {
      const memberIds = await NewsletterSegmentMember.findAll({
        where: { segmentId: { [Op.in]: campaign.targetSegmentIds } },
        attributes: ['subscriberId'],
        raw: true,
      });
      const ids = [...new Set(memberIds.map((m: any) => m.subscriberId))];
      if (ids.length === 0) return [];
      where.id = { [Op.in]: ids };
    }

    return await NewsletterSubscriber.findAll({ where });
  }

  private async processSending(campaignId: string): Promise<void> {
    try {
      const campaign = await this.campaignRepository.findById(campaignId);
      if (!campaign || campaign.status !== 'sending') return;

      const template = campaign.templateId
        ? await NewsletterTemplate.findByPk(campaign.templateId)
        : await NewsletterTemplate.findOne({ where: { isDefault: true } });

      const globalStyles = template?.globalStyles || {};
      const socialMediaConfig = template?.socialMediaConfig || { platforms: [] };
      const footerConfig = template?.footerConfig || {};
      const contentBlocks = (campaign.contentJson as any)?.blocks || [];
      const trackingBaseUrl = process.env.FRONTEND_URL || 'http://localhost:5000';
      const campaignSlug = campaign.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

      // Get queued send logs in batches
      const batchSize = 50;
      let processed = 0;
      let sentCount = 0;
      let failedCount = 0;

      while (true) {
        const logs = await NewsletterSendLog.findAll({
          where: { campaignId, status: 'queued' },
          limit: batchSize,
        });

        if (logs.length === 0) break;

        for (const log of logs) {
          try {
            // Get subscriber for unsubscribe token and personalization
            const subscriber = await NewsletterSubscriber.findByPk(log.subscriberId);
            const unsubscribeUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/newsletter/unsubscribe/${subscriber?.unsubscribeToken || log.subscriberId}`;

            const html = emailRenderingService.render({
              subject: campaign.subject,
              previewText: campaign.previewText,
              contentBlocks,
              globalStyles: globalStyles as any,
              socialMediaConfig: socialMediaConfig as any,
              footerConfig: footerConfig as any,
              subscriberData: {
                email: log.email,
                firstName: subscriber?.firstName,
                unsubscribeUrl,
                sendLogId: log.id,
              },
              campaignSlug,
              trackingBaseUrl,
            });

            const finalHtml = emailRenderingService.replaceVariables(html, {
              first_name: subscriber?.firstName || 'there',
              email: log.email,
            });

            await this.emailService.sendRawHtml({
              to: log.email,
              subject: campaign.subject,
              html: finalHtml,
            });

            await log.update({ status: 'sent', sentAt: new Date() });
            sentCount++;
          } catch (error: any) {
            await log.update({
              status: 'failed',
              failureReason: error.message || 'Unknown error',
            });
            failedCount++;
          }

          processed++;
        }

        // Throttle between batches
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Update campaign stats
      await this.updateCampaignStats(campaignId);

      // Mark campaign as sent
      await this.campaignRepository.update(campaignId, { status: 'sent' });
    } catch (error) {
      console.error(`Campaign ${campaignId} failed:`, error);
      await this.campaignRepository.update(campaignId, { status: 'failed' });
    }
  }

  private async updateCampaignStats(campaignId: string): Promise<void> {
    const stats = await this.sendLogRepository.getStatsForCampaign(campaignId);

    await NewsletterCampaignStats.update(
      {
        totalSent: stats.totalSent,
        totalDelivered: stats.totalDelivered,
        totalOpened: stats.totalOpened,
        uniqueOpens: stats.totalOpened,
        totalClicked: stats.totalClicked,
        uniqueClicks: stats.totalClicked,
        totalBounced: stats.totalBounced,
        totalFailed: stats.totalFailed,
      } as any,
      { where: { campaignId } }
    );
  }

  private async getOpensOverTime(campaignId: string): Promise<Array<{ date: string; opens: number }>> {
    const logs = await NewsletterSendLog.findAll({
      where: {
        campaignId,
        openedAt: { [Op.ne]: null as any },
      } as any,
      attributes: ['openedAt'],
      raw: true,
    });

    // Group opens by date
    const opensByDate: Record<string, number> = {};
    for (const log of logs) {
      if (log.openedAt) {
        const date = new Date(log.openedAt).toISOString().split('T')[0];
        opensByDate[date] = (opensByDate[date] || 0) + 1;
      }
    }

    // Sort by date
    return Object.entries(opensByDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, opens]) => ({ date, opens }));
  }
}

export default CampaignSendingService;
