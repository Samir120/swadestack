import { Request, Response, NextFunction } from 'express';
import { NewsletterService } from '../../services/NewsletterService';
import { CampaignSendingService } from '../../services/CampaignSendingService';
import { NewsletterSubscriptionDTO, NewsletterBroadcastDTO } from '../../models/dto/emailDTO';

// 1x1 transparent PNG pixel
const TRANSPARENT_PIXEL = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
  'base64'
);

export class NewsletterController {
  private newsletterService: NewsletterService;
  private campaignSendingService: CampaignSendingService;

  constructor() {
    this.newsletterService = new NewsletterService();
    this.campaignSendingService = new CampaignSendingService();
  }

  /**
   * Subscribe to newsletter
   */
  subscribe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const subscriptionData: NewsletterSubscriptionDTO = req.body;

      const subscriber = await this.newsletterService.subscribe(subscriptionData);

      res.status(201).json({
        success: true,
        message: 'Successfully subscribed to newsletter. Please check your email to verify.',
        data: {
          id: subscriber.id,
          email: subscriber.email,
        },
      });
    } catch (error: any) {
      if (error.message.includes('already subscribed')) {
        res.status(400).json({
          success: false,
          error: error.message,
        });
        return;
      }
      next(error);
    }
  };

  /**
   * Verify email subscription
   */
  verify = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { token } = req.params;

      const subscriber = await this.newsletterService.verifySubscription(token);

      res.status(200).json({
        success: true,
        message: 'Email verified successfully',
        data: {
          email: subscriber.email,
          verifiedAt: subscriber.verifiedAt,
        },
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  };

  /**
   * Unsubscribe from newsletter
   */
  unsubscribe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { token } = req.params;

      const subscriber = await this.newsletterService.unsubscribe(token);

      res.status(200).json({
        success: true,
        message: 'Successfully unsubscribed from newsletter',
        data: {
          email: subscriber.email,
          unsubscribedAt: subscriber.unsubscribedAt,
        },
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  };

  /**
   * Check subscription status by email
   */
  checkStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email } = req.body;

      if (!email) {
        res.status(400).json({
          success: false,
          error: 'Email is required',
        });
        return;
      }

      const result = await this.newsletterService.checkStatus(email);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      next(error);
    }
  };

  /**
   * Unsubscribe by email (public)
   */
  unsubscribeByEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email } = req.body;

      if (!email) {
        res.status(400).json({
          success: false,
          error: 'Email is required',
        });
        return;
      }

      await this.newsletterService.unsubscribeByEmail(email);

      res.status(200).json({
        success: true,
        message: 'Successfully unsubscribed from newsletter',
      });
    } catch (error: any) {
      if (error.message.includes('not found') || error.message.includes('already unsubscribed')) {
        res.status(400).json({
          success: false,
          error: error.message,
        });
        return;
      }
      next(error);
    }
  };

  /**
   * Track email open via tracking pixel
   */
  trackOpen = async (req: Request, res: Response): Promise<void> => {
    try {
      const sendLogId = req.params.sendLogId.replace('.png', '');
      await this.campaignSendingService.trackOpen(sendLogId);
    } catch {
      // Silently fail — tracking should never break
    }
    res.set({
      'Content-Type': 'image/png',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    });
    res.end(TRANSPARENT_PIXEL);
  };

  /**
   * Track link click via redirect
   */
  trackClick = async (req: Request, res: Response): Promise<void> => {
    try {
      const { sendLogId } = req.params;
      const { url } = req.query;
      await this.campaignSendingService.trackClick(sendLogId);
      if (url && typeof url === 'string') {
        res.redirect(302, url);
        return;
      }
    } catch {
      // Silently fail
    }
    res.redirect(302, process.env.FRONTEND_URL || '/');
  };

  /**
   * Broadcast newsletter
   */
  broadcast = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const broadcastData: NewsletterBroadcastDTO = req.body;

      const result = await this.newsletterService.broadcast(broadcastData);

      res.status(200).json({
        success: true,
        message: 'Newsletter broadcast initiated',
        data: result,
      });
    } catch (error: any) {
      next(error);
    }
  };

  /**
   * Send targeted newsletter
   */
  sendTargeted = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { language, subject, templateType, templateData } = req.body;

      const result = await this.newsletterService.sendTargeted(
        language,
        subject,
        templateType,
        templateData
      );

      res.status(200).json({
        success: true,
        message: 'Targeted newsletter sent',
        data: result,
      });
    } catch (error: any) {
      next(error);
    }
  };

  /**
   * Get newsletter statistics
   */
  getStatistics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stats = await this.newsletterService.getStatistics();

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      next(error);
    }
  };

  /**
   * Get active subscribers
   */
  getSubscribers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { language, verifiedOnly, limit, offset } = req.query;

      const subscribers = await this.newsletterService.getActiveSubscribers({
        language: language as 'en' | 'sv' | undefined,
        verifiedOnly: verifiedOnly === 'true',
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
      });

      res.status(200).json({
        success: true,
        data: subscribers,
      });
    } catch (error: any) {
      next(error);
    }
  };

  /**
   * Update subscriber preferences
   */
  updatePreferences = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { preferences } = req.body;

      const subscriber = await this.newsletterService.updatePreferences(
        parseInt(id),
        preferences
      );

      res.status(200).json({
        success: true,
        message: 'Preferences updated successfully',
        data: subscriber,
      });
    } catch (error: any) {
      next(error);
    }
  };

  /**
   * Update subscriber language
   */
  updateLanguage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { language } = req.body;

      const subscriber = await this.newsletterService.updateLanguage(parseInt(id), language);

      res.status(200).json({
        success: true,
        message: 'Language updated successfully',
        data: subscriber,
      });
    } catch (error: any) {
      next(error);
    }
  };

  /**
   * Delete subscriber
   */
  deleteSubscriber = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      const deleted = await this.newsletterService.deleteSubscriber(parseInt(id));

      if (!deleted) {
        res.status(404).json({
          success: false,
          error: 'Subscriber not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Subscriber deleted successfully',
      });
    } catch (error: any) {
      next(error);
    }
  };
}
