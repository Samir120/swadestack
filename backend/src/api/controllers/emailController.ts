import { Request, Response, NextFunction } from 'express';
import { EmailService } from '../../services/EmailService';
import { SendEmailDTO } from '../../models/dto/emailDTO';

export class EmailController {
  private emailService: EmailService;

  constructor() {
    this.emailService = new EmailService();
  }

  /**
   * Send test email
   */
  sendTestEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { to } = req.body;

      if (!to) {
        res.status(400).json({ error: 'Recipient email is required' });
        return;
      }

      await this.emailService.sendTestEmail(to);

      res.status(200).json({
        success: true,
        message: 'Test email sent successfully',
      });
    } catch (error: any) {
      next(error);
    }
  };

  /**
   * Queue email
   */
  queueEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const emailData: SendEmailDTO = req.body;

      const email = await this.emailService.queueEmail(emailData);

      res.status(201).json({
        success: true,
        message: 'Email queued successfully',
        data: email,
      });
    } catch (error: any) {
      next(error);
    }
  };

  /**
   * Process email queue
   */
  processQueue = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { batchSize } = req.query;

      await this.emailService.processQueue(
        batchSize ? parseInt(batchSize as string) : undefined
      );

      res.status(200).json({
        success: true,
        message: 'Email queue processed successfully',
      });
    } catch (error: any) {
      next(error);
    }
  };

  /**
   * Retry failed emails
   */
  retryFailedEmails = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.emailService.retryFailedEmails();

      res.status(200).json({
        success: true,
        message: 'Failed emails retry initiated',
      });
    } catch (error: any) {
      next(error);
    }
  };

  /**
   * Get email statistics
   */
  getStatistics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { startDate, endDate } = req.query;

      const start = startDate ? new Date(startDate as string) : undefined;
      const end = endDate ? new Date(endDate as string) : undefined;

      const stats = await this.emailService.getStatistics(start, end);

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      next(error);
    }
  };

  /**
   * Cleanup old emails
   */
  cleanupOldEmails = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { days } = req.query;

      const deleted = await this.emailService.cleanupOldEmails(
        days ? parseInt(days as string) : undefined
      );

      res.status(200).json({
        success: true,
        message: `Deleted ${deleted} old email records`,
        data: { deleted },
      });
    } catch (error: any) {
      next(error);
    }
  };
}
