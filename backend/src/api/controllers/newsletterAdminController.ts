import { Request, Response, NextFunction } from 'express';
import { NewsletterService } from '../../services/NewsletterService';
import CampaignService from '../../services/CampaignService';
import CampaignSendingService from '../../services/CampaignSendingService';
import SegmentService from '../../services/SegmentService';
import TemplateService from '../../services/TemplateService';
import ProductSearchService from '../../services/ProductSearchService';

export class NewsletterAdminController {
  private newsletterService: NewsletterService;
  private campaignService: CampaignService;
  private campaignSendingService: CampaignSendingService;
  private segmentService: SegmentService;
  private templateService: TemplateService;
  private productSearchService: ProductSearchService;

  constructor() {
    this.newsletterService = new NewsletterService();
    this.campaignService = new CampaignService();
    this.campaignSendingService = new CampaignSendingService();
    this.segmentService = new SegmentService();
    this.templateService = new TemplateService();
    this.productSearchService = new ProductSearchService();
  }

  // ==================== Dashboard ====================

  getDashboard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const [stats, recentCampaigns] = await Promise.all([
        this.newsletterService.getDashboardStats(),
        this.campaignService.getRecentCampaigns(5),
      ]);

      res.status(200).json({
        success: true,
        data: {
          ...stats,
          recentCampaigns,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  // ==================== Campaigns ====================

  getCampaigns = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { status, search, page, pageSize } = req.query;
      const result = await this.campaignService.getCampaigns({
        status: status as any,
        search: search as string,
        page: page ? parseInt(page as string) : undefined,
        pageSize: pageSize ? parseInt(pageSize as string) : undefined,
      });
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  getCampaignById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const campaign = await this.campaignService.getCampaignById(id);
      if (!campaign) {
        res.status(404).json({ success: false, message: 'Campaign not found' });
        return;
      }
      res.status(200).json({ success: true, data: campaign });
    } catch (error) {
      next(error);
    }
  };

  createCampaign = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name, subject, previewText, contentJson, templateId, targetSegmentIds } = req.body;
      if (!name || !subject) {
        res.status(400).json({ success: false, message: 'Name and subject are required' });
        return;
      }
      const campaign = await this.campaignService.createCampaign({
        name,
        subject,
        previewText,
        contentJson,
        templateId,
        targetSegmentIds,
      });
      res.status(201).json({ success: true, data: campaign });
    } catch (error) {
      next(error);
    }
  };

  updateCampaign = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const campaign = await this.campaignService.updateCampaign(id, req.body);
      if (!campaign) {
        res.status(404).json({ success: false, message: 'Campaign not found' });
        return;
      }
      res.status(200).json({ success: true, data: campaign });
    } catch (error: any) {
      if (error.message.includes('Cannot edit')) {
        res.status(400).json({ success: false, message: error.message });
        return;
      }
      next(error);
    }
  };

  deleteCampaign = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const deleted = await this.campaignService.deleteCampaign(id);
      if (!deleted) {
        res.status(404).json({ success: false, message: 'Campaign not found' });
        return;
      }
      res.status(200).json({ success: true, message: 'Campaign deleted' });
    } catch (error: any) {
      if (error.message.includes('Cannot delete')) {
        res.status(400).json({ success: false, message: error.message });
        return;
      }
      next(error);
    }
  };

  duplicateCampaign = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const campaign = await this.campaignService.duplicateCampaign(id);
      if (!campaign) {
        res.status(404).json({ success: false, message: 'Campaign not found' });
        return;
      }
      res.status(201).json({ success: true, data: campaign });
    } catch (error) {
      next(error);
    }
  };

  cancelCampaign = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const campaign = await this.campaignService.cancelCampaign(id);
      if (!campaign) {
        res.status(404).json({ success: false, message: 'Campaign not found' });
        return;
      }
      res.status(200).json({ success: true, data: campaign });
    } catch (error: any) {
      if (error.message.includes('Can only cancel')) {
        res.status(400).json({ success: false, message: error.message });
        return;
      }
      next(error);
    }
  };

  // ==================== Subscribers ====================

  getSubscribers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { search, status, language, sortBy, sortOrder, page, pageSize } = req.query;
      const result = await this.newsletterService.getSubscribersAdmin({
        search: search as string,
        status: status as any,
        language: language as any,
        sortBy: sortBy as any,
        sortOrder: sortOrder as any,
        page: page ? parseInt(page as string) : undefined,
        pageSize: pageSize ? parseInt(pageSize as string) : undefined,
      });
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  getSubscriberById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const subscriber = await this.newsletterService.getSubscriberDetail(id);
      if (!subscriber) {
        res.status(404).json({ success: false, message: 'Subscriber not found' });
        return;
      }
      res.status(200).json({ success: true, data: subscriber });
    } catch (error) {
      next(error);
    }
  };

  createSubscriber = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email } = req.body;
      if (!email) {
        res.status(400).json({ success: false, message: 'Email is required' });
        return;
      }
      const subscriber = await this.newsletterService.createSubscriberAdmin(req.body);
      res.status(201).json({ success: true, data: subscriber });
    } catch (error: any) {
      if (error.message === 'Email is already subscribed') {
        res.status(409).json({ success: false, message: error.message });
        return;
      }
      next(error);
    }
  };

  updateSubscriber = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const subscriber = await this.newsletterService.updateSubscriberAdmin(id, req.body);
      if (!subscriber) {
        res.status(404).json({ success: false, message: 'Subscriber not found' });
        return;
      }
      res.status(200).json({ success: true, data: subscriber });
    } catch (error) {
      next(error);
    }
  };

  deleteSubscriber = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const deleted = await this.newsletterService.deleteSubscriberAdmin(id);
      if (!deleted) {
        res.status(404).json({ success: false, message: 'Subscriber not found' });
        return;
      }
      res.status(200).json({ success: true, message: 'Subscriber deleted' });
    } catch (error) {
      next(error);
    }
  };

  exportSubscribers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { status, language } = req.query;
      const csv = await this.newsletterService.exportSubscribersCSV({
        status: status as string,
        language: language as string,
      });
      const date = new Date().toISOString().split('T')[0];
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="newsletter-subscribers-${date}.csv"`);
      res.status(200).send(csv);
    } catch (error) {
      next(error);
    }
  };

  // ==================== Segments ====================

  getSegments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const segments = await this.segmentService.getSegments();
      res.status(200).json({ success: true, data: segments });
    } catch (error) {
      next(error);
    }
  };

  createSegment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name, type } = req.body;
      if (!name || !type) {
        res.status(400).json({ success: false, message: 'Name and type are required' });
        return;
      }
      const segment = await this.segmentService.createSegment(req.body);
      res.status(201).json({ success: true, data: segment });
    } catch (error: any) {
      if (error.message.includes('already exists')) {
        res.status(409).json({ success: false, message: error.message });
        return;
      }
      next(error);
    }
  };

  updateSegment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const segment = await this.segmentService.updateSegment(id, req.body);
      if (!segment) {
        res.status(404).json({ success: false, message: 'Segment not found' });
        return;
      }
      res.status(200).json({ success: true, data: segment });
    } catch (error: any) {
      if (error.message.includes('already exists')) {
        res.status(409).json({ success: false, message: error.message });
        return;
      }
      next(error);
    }
  };

  deleteSegment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const deleted = await this.segmentService.deleteSegment(id);
      if (!deleted) {
        res.status(404).json({ success: false, message: 'Segment not found' });
        return;
      }
      res.status(200).json({ success: true, message: 'Segment deleted' });
    } catch (error) {
      next(error);
    }
  };

  addSegmentMembers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { subscriberIds } = req.body;
      if (!subscriberIds || !Array.isArray(subscriberIds) || subscriberIds.length === 0) {
        res.status(400).json({ success: false, message: 'subscriberIds array is required' });
        return;
      }
      await this.segmentService.addMembers(id, subscriberIds);
      res.status(200).json({ success: true, message: 'Members added to segment' });
    } catch (error) {
      next(error);
    }
  };

  removeSegmentMembers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { subscriberIds } = req.body;
      if (!subscriberIds || !Array.isArray(subscriberIds) || subscriberIds.length === 0) {
        res.status(400).json({ success: false, message: 'subscriberIds array is required' });
        return;
      }
      await this.segmentService.removeMembers(id, subscriberIds);
      res.status(200).json({ success: true, message: 'Members removed from segment' });
    } catch (error) {
      next(error);
    }
  };
  // ==================== Campaign Sending ====================

  validateCampaign = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.campaignSendingService.validateCampaign(id);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  sendCampaign = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const adminId = (req as any).user?.id;
      if (!adminId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }
      const result = await this.campaignSendingService.sendCampaign({
        campaignId: id,
        adminId,
      });
      res.status(200).json({ success: true, data: result, message: 'Campaign sending initiated' });
    } catch (error: any) {
      if (error.message.includes('cannot be sent')) {
        res.status(400).json({ success: false, message: error.message });
        return;
      }
      next(error);
    }
  };

  scheduleCampaign = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { scheduledAt } = req.body;
      const adminId = (req as any).user?.id;
      if (!adminId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }
      if (!scheduledAt) {
        res.status(400).json({ success: false, message: 'scheduledAt is required' });
        return;
      }
      await this.campaignSendingService.scheduleCampaign(id, new Date(scheduledAt), adminId);
      res.status(200).json({ success: true, message: 'Campaign scheduled' });
    } catch (error: any) {
      if (error.message.includes('Only draft') || error.message.includes('must be in the future')) {
        res.status(400).json({ success: false, message: error.message });
        return;
      }
      next(error);
    }
  };

  sendTestEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { email } = req.body;
      const adminId = (req as any).user?.id;
      if (!email) {
        res.status(400).json({ success: false, message: 'email is required' });
        return;
      }
      await this.campaignSendingService.sendTestEmail({
        campaignId: id,
        adminId,
        testEmail: email,
      });
      res.status(200).json({ success: true, message: 'Test email sent' });
    } catch (error: any) {
      next(error);
    }
  };

  getCampaignReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const report = await this.campaignSendingService.getCampaignReport(id);
      res.status(200).json({ success: true, data: report });
    } catch (error: any) {
      if (error.message === 'Campaign not found') {
        res.status(404).json({ success: false, message: error.message });
        return;
      }
      next(error);
    }
  };

  getCampaignRecipients = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { status, page, pageSize } = req.query;
      const result = await this.campaignSendingService.getRecipientActivity(id, {
        status: status as string,
        page: page ? parseInt(page as string) : undefined,
        pageSize: pageSize ? parseInt(pageSize as string) : undefined,
      });
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  // ==================== Product Search ====================

  searchProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { query, category, page, pageSize } = req.query;
      const result = await this.productSearchService.search({
        query: query as string,
        category: category as string,
        page: page ? parseInt(page as string) : undefined,
        pageSize: pageSize ? parseInt(pageSize as string) : undefined,
      });
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  // ==================== Templates ====================

  getTemplates = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const templates = await this.templateService.getTemplates();
      res.status(200).json({ success: true, data: templates });
    } catch (error) {
      next(error);
    }
  };

  getTemplateById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const template = await this.templateService.getTemplateById(id);
      if (!template) {
        res.status(404).json({ success: false, message: 'Template not found' });
        return;
      }
      res.status(200).json({ success: true, data: template });
    } catch (error) {
      next(error);
    }
  };

  createTemplate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name } = req.body;
      if (!name) {
        res.status(400).json({ success: false, message: 'Name is required' });
        return;
      }
      const template = await this.templateService.createTemplate(req.body);
      res.status(201).json({ success: true, data: template });
    } catch (error) {
      next(error);
    }
  };

  updateTemplate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const template = await this.templateService.updateTemplate(id, req.body);
      if (!template) {
        res.status(404).json({ success: false, message: 'Template not found' });
        return;
      }
      res.status(200).json({ success: true, data: template });
    } catch (error) {
      next(error);
    }
  };

  deleteTemplate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const deleted = await this.templateService.deleteTemplate(id);
      if (!deleted) {
        res.status(404).json({ success: false, message: 'Template not found' });
        return;
      }
      res.status(200).json({ success: true, message: 'Template deleted' });
    } catch (error: any) {
      if (error.message.includes('Cannot delete')) {
        res.status(400).json({ success: false, message: error.message });
        return;
      }
      next(error);
    }
  };

  duplicateTemplate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const template = await this.templateService.duplicateTemplate(id);
      if (!template) {
        res.status(404).json({ success: false, message: 'Template not found' });
        return;
      }
      res.status(201).json({ success: true, data: template });
    } catch (error) {
      next(error);
    }
  };

  setTemplateDefault = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const template = await this.templateService.setDefault(id);
      if (!template) {
        res.status(404).json({ success: false, message: 'Template not found' });
        return;
      }
      res.status(200).json({ success: true, data: template });
    } catch (error) {
      next(error);
    }
  };

  regenerateThumbnail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      // Placeholder — thumbnail generation would use Puppeteer to screenshot the rendered email
      const template = await this.templateService.updateThumbnail(id, `/uploads/template-thumbnails/${id}.png`);
      if (!template) {
        res.status(404).json({ success: false, message: 'Template not found' });
        return;
      }
      res.status(200).json({ success: true, data: template });
    } catch (error) {
      next(error);
    }
  };

  uploadImage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({ success: false, message: 'No image file provided' });
        return;
      }
      const imageUrl = `/uploads/${req.file.filename}`;
      res.status(200).json({ success: true, data: { url: imageUrl } });
    } catch (error) {
      next(error);
    }
  };
}

export default new NewsletterAdminController();
