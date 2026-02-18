import { Request, Response, NextFunction } from 'express';
import ServicesService from '../../services/ServicesService';

export class ServicesController {
  private servicesService: ServicesService;

  constructor() {
    this.servicesService = new ServicesService();
  }

  getActive = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const category = req.query.category as string;

      const result = await this.servicesService.getActiveServices(page, limit, category);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const category = req.query.category as string;

      const result = await this.servicesService.getAllServices(page, limit, category);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const service = await this.servicesService.getServiceById(id);

      if (!service) {
        res.status(404).json({
          success: false,
          message: 'Service not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: service,
      });
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = req.body;
      if (req.file) {
        data.imageUrl = `/uploads/${req.file.filename}`;
        data.imageFile = `/uploads/${req.file.filename}`;
      }
      if (typeof data.features_en === 'string') data.features_en = JSON.parse(data.features_en);
      if (typeof data.features_sv === 'string') data.features_sv = JSON.parse(data.features_sv);
      if (typeof data.excludedFeatures_en === 'string') data.excludedFeatures_en = JSON.parse(data.excludedFeatures_en);
      if (typeof data.excludedFeatures_sv === 'string') data.excludedFeatures_sv = JSON.parse(data.excludedFeatures_sv);
      if (typeof data.price === 'string') data.price = parseFloat(data.price);
      if (typeof data.discountPrice === 'string') data.discountPrice = data.discountPrice === '' ? null : parseFloat(data.discountPrice);
      if (typeof data.isActive === 'string') data.isActive = data.isActive === 'true';
      if (typeof data.isPopular === 'string') data.isPopular = data.isPopular === 'true';
      const service = await this.servicesService.createService(data);

      res.status(201).json({
        success: true,
        message: 'Service created successfully',
        data: service,
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
        data.imageUrl = `/uploads/${req.file.filename}`;
        data.imageFile = `/uploads/${req.file.filename}`;
      }
      if (typeof data.features_en === 'string') data.features_en = JSON.parse(data.features_en);
      if (typeof data.features_sv === 'string') data.features_sv = JSON.parse(data.features_sv);
      if (typeof data.excludedFeatures_en === 'string') data.excludedFeatures_en = JSON.parse(data.excludedFeatures_en);
      if (typeof data.excludedFeatures_sv === 'string') data.excludedFeatures_sv = JSON.parse(data.excludedFeatures_sv);
      if (typeof data.price === 'string') data.price = parseFloat(data.price);
      if (typeof data.discountPrice === 'string') data.discountPrice = data.discountPrice === '' ? null : parseFloat(data.discountPrice);
      if (typeof data.isActive === 'string') data.isActive = data.isActive === 'true';
      if (typeof data.isPopular === 'string') data.isPopular = data.isPopular === 'true';
      const service = await this.servicesService.updateService(id, data);

      if (!service) {
        res.status(404).json({
          success: false,
          message: 'Service not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Service updated successfully',
        data: service,
      });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const deleted = await this.servicesService.deleteService(id);

      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'Service not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Service deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  toggleActive = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const service = await this.servicesService.toggleActive(id);

      if (!service) {
        res.status(404).json({
          success: false,
          message: 'Service not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Service status updated',
        data: service,
      });
    } catch (error) {
      next(error);
    }
  };
}

export default new ServicesController();
