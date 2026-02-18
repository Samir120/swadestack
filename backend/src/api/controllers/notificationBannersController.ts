import { Request, Response, NextFunction } from 'express';
import NotificationBannersService from '../../services/NotificationBannersService';

export class NotificationBannersController {
  private service: NotificationBannersService;

  constructor() {
    this.service = new NotificationBannersService();
  }

  getActive = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const banner = await this.service.getActiveBanner();
      res.status(200).json({ success: true, data: banner });
    } catch (error) {
      next(error);
    }
  };

  track = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { type } = req.body;
      if (type && ['impression', 'click', 'dismiss'].includes(type)) {
        this.service.trackStat(id, type);
      }
      res.status(200).json({ success: true });
    } catch {
      res.status(200).json({ success: true });
    }
  };

  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const items = await this.service.getAll();
      res.status(200).json({ success: true, data: items });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const item = await this.service.getById(id);
      if (!item) {
        res.status(404).json({ success: false, message: 'Notification banner not found' });
        return;
      }
      res.status(200).json({ success: true, data: item });
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = req.body;
      // Coerce string booleans from JSON
      const booleanFields = ['showPhone', 'showEmail', 'isActive', 'showOnAuthPages', 'showOnAdminPanel', 'isDismissible'];
      for (const field of booleanFields) {
        if (typeof data[field] === 'string') {
          data[field] = data[field] === 'true';
        }
      }
      if (typeof data.priority === 'string') {
        data.priority = parseInt(data.priority, 10);
      }
      // Parse showOnPages if it's a string
      if (typeof data.showOnPages === 'string') {
        try {
          data.showOnPages = JSON.parse(data.showOnPages);
        } catch {
          data.showOnPages = ['all'];
        }
      }

      const item = await this.service.create(data);
      res.status(201).json({
        success: true,
        message: 'Notification banner created successfully',
        data: item,
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const data = req.body;
      // Coerce string booleans
      const booleanFields = ['showPhone', 'showEmail', 'isActive', 'showOnAuthPages', 'showOnAdminPanel', 'isDismissible'];
      for (const field of booleanFields) {
        if (typeof data[field] === 'string') {
          data[field] = data[field] === 'true';
        }
      }
      if (typeof data.priority === 'string') {
        data.priority = parseInt(data.priority, 10);
      }
      if (typeof data.showOnPages === 'string') {
        try {
          data.showOnPages = JSON.parse(data.showOnPages);
        } catch {
          data.showOnPages = ['all'];
        }
      }

      const item = await this.service.update(id, data);
      if (!item) {
        res.status(404).json({ success: false, message: 'Notification banner not found' });
        return;
      }
      res.status(200).json({
        success: true,
        message: 'Notification banner updated successfully',
        data: item,
      });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const deleted = await this.service.delete(id);
      if (!deleted) {
        res.status(404).json({ success: false, message: 'Notification banner not found' });
        return;
      }
      res.status(200).json({ success: true, message: 'Notification banner deleted successfully' });
    } catch (error) {
      next(error);
    }
  };

  toggleActive = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const item = await this.service.toggleActive(id);
      if (!item) {
        res.status(404).json({ success: false, message: 'Notification banner not found' });
        return;
      }
      res.status(200).json({
        success: true,
        message: 'Active status updated',
        data: item,
      });
    } catch (error) {
      next(error);
    }
  };
}

export default new NotificationBannersController();
