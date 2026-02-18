import { Request, Response, NextFunction } from 'express';
import ServiceCategoryService from '../../services/ServiceCategoryService';

export class ServiceCategoryController {
  private service: ServiceCategoryService;

  constructor() {
    this.service = new ServiceCategoryService();
  }

  getActive = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const categories = await this.service.getActive();
      res.status(200).json({ success: true, data: categories });
    } catch (error) {
      next(error);
    }
  };

  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const categories = await this.service.getAll();
      res.status(200).json({ success: true, data: categories });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const category = await this.service.getById(id);

      if (!category) {
        res.status(404).json({ success: false, message: 'Service category not found' });
        return;
      }

      res.status(200).json({ success: true, data: category });
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const category = await this.service.create(req.body);
      res.status(201).json({ success: true, message: 'Service category created successfully', data: category });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const category = await this.service.update(id, req.body);

      if (!category) {
        res.status(404).json({ success: false, message: 'Service category not found' });
        return;
      }

      res.status(200).json({ success: true, message: 'Service category updated successfully', data: category });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const deleted = await this.service.delete(id);

      if (!deleted) {
        res.status(404).json({ success: false, message: 'Service category not found' });
        return;
      }

      res.status(200).json({ success: true, message: 'Service category deleted successfully' });
    } catch (error) {
      next(error);
    }
  };

  toggleActive = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const category = await this.service.toggleActive(id);

      if (!category) {
        res.status(404).json({ success: false, message: 'Service category not found' });
        return;
      }

      res.status(200).json({ success: true, message: 'Service category status updated', data: category });
    } catch (error) {
      next(error);
    }
  };

  updateOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { displayOrder } = req.body;

      await this.service.updateDisplayOrder(id, displayOrder);
      res.status(200).json({ success: true, message: 'Display order updated' });
    } catch (error) {
      next(error);
    }
  };
}

export default new ServiceCategoryController();
