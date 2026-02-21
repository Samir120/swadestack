import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { NewsletterCampaignRepository } from '../integration/repositories/NewsletterCampaignRepository';
import NewsletterCampaignStats from '../models/sequelize/NewsletterCampaignStats';
import { CampaignStatus } from '../models/sequelize/NewsletterCampaign';
import {
  CampaignListDTO,
  CampaignStatsDTO,
  CreateCampaignDTO,
  UpdateCampaignDTO,
} from '../models/dto/NewsletterAdminDTO';

export class CampaignService {
  private campaignRepository: NewsletterCampaignRepository;

  constructor() {
    this.campaignRepository = new NewsletterCampaignRepository();
  }

  async getCampaigns(options?: {
    status?: CampaignStatus;
    search?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{ campaigns: CampaignListDTO[]; total: number }> {
    const page = options?.page || 1;
    const pageSize = options?.pageSize || 20;
    const offset = (page - 1) * pageSize;

    const result = await this.campaignRepository.findAllWithStats({
      status: options?.status,
      search: options?.search,
      limit: pageSize,
      offset,
    });

    const campaigns = result.campaigns.map(c => this.mapToCampaignListDTO(c));
    return { campaigns, total: result.total };
  }

  async getCampaignById(id: string): Promise<CampaignListDTO | null> {
    const campaign = await this.campaignRepository.findByIdWithStats(id);
    if (!campaign) return null;
    return this.mapToCampaignListDTO(campaign);
  }

  async createCampaign(data: CreateCampaignDTO): Promise<CampaignListDTO> {
    const campaign = await this.campaignRepository.create({
      name: data.name,
      subject: data.subject,
      previewText: data.previewText,
      contentJson: this.processContentJsonImages(data.contentJson),
      templateId: data.templateId,
      targetSegmentIds: data.targetSegmentIds,
      targetSubscriberIds: data.targetSubscriberIds,
      status: 'draft',
    });

    // Create empty stats record
    await NewsletterCampaignStats.create({
      campaignId: campaign.id,
    } as any);

    const full = await this.campaignRepository.findByIdWithStats(campaign.id);
    return this.mapToCampaignListDTO(full!);
  }

  async updateCampaign(id: string, data: UpdateCampaignDTO): Promise<CampaignListDTO | null> {
    const campaign = await this.campaignRepository.findById(id);
    if (!campaign) return null;

    if (campaign.status === 'sent' || campaign.status === 'sending') {
      throw new Error('Cannot edit a campaign that has been sent or is sending');
    }

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.subject !== undefined) updateData.subject = data.subject;
    if (data.previewText !== undefined) updateData.previewText = data.previewText;
    if (data.contentJson !== undefined) updateData.contentJson = this.processContentJsonImages(data.contentJson);
    if (data.templateId !== undefined) updateData.templateId = data.templateId;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.targetSegmentIds !== undefined) updateData.targetSegmentIds = data.targetSegmentIds;
    if (data.targetSubscriberIds !== undefined) updateData.targetSubscriberIds = data.targetSubscriberIds;
    if (data.scheduledAt !== undefined) updateData.scheduledAt = data.scheduledAt;

    await this.campaignRepository.update(id, updateData);
    const updated = await this.campaignRepository.findByIdWithStats(id);
    return this.mapToCampaignListDTO(updated!);
  }

  async deleteCampaign(id: string): Promise<boolean> {
    const campaign = await this.campaignRepository.findById(id);
    if (!campaign) return false;

    if (campaign.status === 'sending') {
      throw new Error('Cannot delete a campaign that is currently sending');
    }

    const result = await this.campaignRepository.delete(id);
    return result > 0;
  }

  async duplicateCampaign(id: string): Promise<CampaignListDTO | null> {
    const campaign = await this.campaignRepository.findById(id);
    if (!campaign) return null;

    const duplicate = await this.campaignRepository.create({
      name: `${campaign.name} (Copy)`,
      subject: campaign.subject,
      previewText: campaign.previewText,
      contentJson: this.processContentJsonImages(campaign.contentJson),
      targetSegmentIds: campaign.targetSegmentIds,
      targetSubscriberIds: campaign.targetSubscriberIds,
      status: 'draft',
    });

    await NewsletterCampaignStats.create({
      campaignId: duplicate.id,
    } as any);

    const full = await this.campaignRepository.findByIdWithStats(duplicate.id);
    return this.mapToCampaignListDTO(full!);
  }

  async cancelCampaign(id: string): Promise<CampaignListDTO | null> {
    const campaign = await this.campaignRepository.findById(id);
    if (!campaign) return null;

    if (campaign.status !== 'scheduled' && campaign.status !== 'sending') {
      throw new Error('Can only cancel scheduled or sending campaigns');
    }

    await this.campaignRepository.update(id, { status: 'cancelled' });
    const updated = await this.campaignRepository.findByIdWithStats(id);
    return this.mapToCampaignListDTO(updated!);
  }

  async getRecentCampaigns(limit: number = 5): Promise<CampaignListDTO[]> {
    const campaigns = await this.campaignRepository.getRecentCampaigns(limit);
    return campaigns.map(c => this.mapToCampaignListDTO(c));
  }

  /**
   * Walk contentJson and convert any data:image/...;base64 strings to hosted file URLs.
   * This runs at save time so the send pipeline never sees base64 data.
   */
  private processContentJsonImages(contentJson: any): any {
    if (!contentJson) return contentJson;
    const json = JSON.stringify(contentJson);
    // Quick check — skip processing if there are no data URIs at all
    if (!json.includes('data:image/')) return contentJson;

    const baseUrl = (process.env.FRONTEND_URL || 'https://swadestack.com').replace(/\/$/, '');
    let converted = 0;

    const processed = JSON.parse(json.replace(
      /data:image\/(\w+);base64,[A-Za-z0-9+/=]+/g,
      (dataUri: string) => {
        const url = this.dataUriToHostedFile(dataUri, baseUrl);
        if (url) {
          converted++;
          return url;
        }
        return dataUri; // keep original if conversion failed
      }
    ));

    if (converted > 0) {
      console.log(`[CampaignService] Converted ${converted} base64 image(s) to hosted files`);
    }
    return processed;
  }

  private dataUriToHostedFile(dataUri: string, baseUrl: string): string {
    try {
      const match = dataUri.match(/^data:image\/(\w+);base64,(.+)$/);
      if (!match) return '';
      const ext = match[1] === 'jpeg' ? 'jpg' : match[1];
      const base64Data = match[2];
      const hash = crypto.createHash('md5').update(base64Data).digest('hex').substring(0, 12);
      const filename = `newsletter-img-${hash}.${ext}`;
      const uploadsDir = path.join(__dirname, '../../uploads');
      const filePath = path.join(uploadsDir, filename);

      if (!fs.existsSync(filePath)) {
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
        fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
        console.log(`[CampaignService] Saved data URI to ${filePath} (${(base64Data.length * 0.75 / 1024).toFixed(0)}KB)`);
      }

      return `${baseUrl}/uploads/${filename}`;
    } catch (err) {
      console.warn('[CampaignService] Failed to convert data URI to file:', err);
      return '';
    }
  }

  private mapToCampaignListDTO(campaign: any): CampaignListDTO {
    const stats = campaign.stats;
    let mappedStats: CampaignStatsDTO | undefined;

    if (stats) {
      const totalSent = stats.totalSent || 0;
      mappedStats = {
        totalSent,
        totalDelivered: stats.totalDelivered || 0,
        totalOpened: stats.totalOpened || 0,
        uniqueOpens: stats.uniqueOpens || 0,
        totalClicked: stats.totalClicked || 0,
        uniqueClicks: stats.uniqueClicks || 0,
        totalUnsubscribed: stats.totalUnsubscribed || 0,
        totalBounced: stats.totalBounced || 0,
        totalFailed: stats.totalFailed || 0,
        openRate: totalSent > 0 ? ((stats.uniqueOpens || 0) / totalSent) * 100 : 0,
        clickRate: totalSent > 0 ? ((stats.uniqueClicks || 0) / totalSent) * 100 : 0,
      };
    }

    return {
      id: campaign.id,
      name: campaign.name,
      subject: campaign.subject,
      previewText: campaign.previewText,
      templateId: campaign.templateId,
      status: campaign.status,
      targetSubscriberCount: campaign.targetSubscriberCount,
      targetSegmentIds: campaign.targetSegmentIds,
      targetSubscriberIds: campaign.targetSubscriberIds,
      scheduledAt: campaign.scheduledAt,
      sentAt: campaign.sentAt,
      sentByAdmin: campaign.sentByAdmin ? {
        id: campaign.sentByAdmin.id,
        email: campaign.sentByAdmin.email,
        firstName: campaign.sentByAdmin.firstName,
        lastName: campaign.sentByAdmin.lastName,
      } : undefined,
      stats: mappedStats,
      createdAt: campaign.createdAt,
      updatedAt: campaign.updatedAt,
    };
  }
}

export default CampaignService;
