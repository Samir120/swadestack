import { Request, Response, NextFunction } from 'express';
import { NewsletterService } from '../../services/NewsletterService';
import { NewsletterSubscriptionDTO, NewsletterBroadcastDTO } from '../../models/dto/emailDTO';

export class NewsletterController {
  private newsletterService: NewsletterService;

  constructor() {
    this.newsletterService = new NewsletterService();
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
