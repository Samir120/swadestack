import { Request, Response, NextFunction } from 'express';
import FeaturesService from '../../services/FeaturesService';

export class FeaturesController {
  private featuresService: FeaturesService;

  constructor() {
    this.featuresService = new FeaturesService();
  }

  getActive = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const items = await this.featuresService.getActive();
      res.status(200).json({ success: true, data: items });
    } catch (error) {
      next(error);
    }
  };

  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const items = await this.featuresService.getAll();
      res.status(200).json({ success: true, data: items });
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = req.body;
      if (req.file) {
        data.previewImageUrl = `/uploads/${req.file.filename}`;
        data.previewImageFile = `/uploads/${req.file.filename}`;
      }
      if (typeof data.isActive === 'string') {
        data.isActive = data.isActive === 'true';
      }
      if (typeof data.displayOrder === 'string') {
        data.displayOrder = parseInt(data.displayOrder, 10);
      }
      const item = await this.featuresService.create(data);
      res.status(201).json({
        success: true,
        message: 'Feature created successfully',
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
      if (req.file) {
        data.previewImageUrl = `/uploads/${req.file.filename}`;
        data.previewImageFile = `/uploads/${req.file.filename}`;
      }
      if (typeof data.isActive === 'string') {
        data.isActive = data.isActive === 'true';
      }
      if (typeof data.displayOrder === 'string') {
        data.displayOrder = parseInt(data.displayOrder, 10);
      }
      const item = await this.featuresService.update(id, data);

      if (!item) {
        res.status(404).json({ success: false, message: 'Feature not found' });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Feature updated successfully',
        data: item,
      });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const deleted = await this.featuresService.delete(id);

      if (!deleted) {
        res.status(404).json({ success: false, message: 'Feature not found' });
        return;
      }

      res.status(200).json({ success: true, message: 'Feature deleted successfully' });
    } catch (error) {
      next(error);
    }
  };

  toggleActive = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const item = await this.featuresService.toggleActive(id);

      if (!item) {
        res.status(404).json({ success: false, message: 'Feature not found' });
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

  updateOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { displayOrder } = req.body;
      await this.featuresService.updateOrder(id, displayOrder);
      res.status(200).json({ success: true, message: 'Order updated' });
    } catch (error) {
      next(error);
    }
  };
}

export default new FeaturesController();
