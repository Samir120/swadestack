import { Request, Response, NextFunction } from 'express';
import { ContactService } from '../../services/ContactService';
import { ContactFormDTO } from '../../models/dto/emailDTO';

export class ContactController {
  private contactService: ContactService;

  constructor() {
    this.contactService = new ContactService();
  }

  /**
   * Process contact form submission
   */
  submitContactForm = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const contactData: ContactFormDTO = req.body;

      // Validate required fields
      if (!contactData.name || !contactData.email || !contactData.subject || !contactData.message) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields: name, email, subject, and message are required',
        });
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(contactData.email)) {
        res.status(400).json({
          success: false,
          error: 'Invalid email format',
        });
        return;
      }

      const result = await this.contactService.processContactForm(contactData);

      res.status(200).json({
        success: true,
        message: 'Contact form submitted successfully. We will get back to you soon!',
        data: result,
      });
    } catch (error: any) {
      next(error);
    }
  };

  /**
   * Send custom response to contact form
   */
  sendCustomResponse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { to, subject, message, language } = req.body;

      if (!to || !subject || !message) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields: to, subject, and message are required',
        });
        return;
      }

      await this.contactService.sendCustomResponse(to, subject, message, language || 'en');

      res.status(200).json({
        success: true,
        message: 'Custom response sent successfully',
      });
    } catch (error: any) {
      next(error);
    }
  };

  /**
   * Get all contact messages (Admin only)
   */
  getAllMessages = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { limit, offset, status, isRead } = req.query;

      const options = {
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
        status: status as 'new' | 'read' | 'replied' | 'archived' | undefined,
        isRead: isRead !== undefined ? isRead === 'true' : undefined,
      };

      const result = await this.contactService.getAllMessages(options);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      next(error);
    }
  };

  /**
   * Get contact message by ID (Admin only)
   */
  getMessageById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      const message = await this.contactService.getMessageById(id);

      if (!message) {
        res.status(404).json({
          success: false,
          error: 'Contact message not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: message,
      });
    } catch (error: any) {
      next(error);
    }
  };

  /**
   * Mark message as read (Admin only)
   */
  markAsRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      const message = await this.contactService.markMessageAsRead(id);

      if (!message) {
        res.status(404).json({
          success: false,
          error: 'Contact message not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: message,
      });
    } catch (error: any) {
      next(error);
    }
  };

  /**
   * Update message status (Admin only)
   */
  updateStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status || !['new', 'read', 'replied', 'archived'].includes(status)) {
        res.status(400).json({
          success: false,
          error: 'Invalid status. Must be one of: new, read, replied, archived',
        });
        return;
      }

      const message = await this.contactService.updateMessageStatus(id, status);

      if (!message) {
        res.status(404).json({
          success: false,
          error: 'Contact message not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: message,
      });
    } catch (error: any) {
      next(error);
    }
  };

  /**
   * Add admin notes (Admin only)
   */
  addNotes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { notes } = req.body;

      if (!notes) {
        res.status(400).json({
          success: false,
          error: 'Notes are required',
        });
        return;
      }

      const message = await this.contactService.addAdminNotes(id, notes);

      if (!message) {
        res.status(404).json({
          success: false,
          error: 'Contact message not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: message,
      });
    } catch (error: any) {
      next(error);
    }
  };

  /**
   * Reply to contact message (Admin only)
   */
  replyToMessage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { subject, message } = req.body;
      const adminId = (req as any).user?.id;

      if (!subject || !message) {
        res.status(400).json({
          success: false,
          error: 'Subject and message are required',
        });
        return;
      }

      if (!adminId) {
        res.status(401).json({
          success: false,
          error: 'Admin authentication required',
        });
        return;
      }

      await this.contactService.replyToMessage(id, subject, message, adminId);

      res.status(200).json({
        success: true,
        message: 'Reply sent successfully',
      });
    } catch (error: any) {
      next(error);
    }
  };

  /**
   * Get contact message statistics (Admin only)
   */
  getStatistics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stats = await this.contactService.getStatistics();

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      next(error);
    }
  };

  /**
   * Search contact messages (Admin only)
   */
  searchMessages = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { keyword } = req.query;

      if (!keyword) {
        res.status(400).json({
          success: false,
          error: 'Search keyword is required',
        });
        return;
      }

      const messages = await this.contactService.searchMessages(keyword as string);

      res.status(200).json({
        success: true,
        data: messages,
      });
    } catch (error: any) {
      next(error);
    }
  };

  /**
   * Delete contact message (Admin only)
   */
  deleteMessage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      const deleted = await this.contactService.deleteMessage(id);

      if (!deleted) {
        res.status(404).json({
          success: false,
          error: 'Contact message not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Contact message deleted successfully',
      });
    } catch (error: any) {
      next(error);
    }
  };
}
