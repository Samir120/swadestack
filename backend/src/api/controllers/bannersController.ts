import { Request, Response, NextFunction } from 'express';
import BannersService from '../../services/BannersService';

export class BannersController {
  private bannersService: BannersService;

  constructor() {
    this.bannersService = new BannersService();
  }

  getActive = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await this.bannersService.getActiveBanners(page, limit);

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

      const result = await this.bannersService.getAllBanners(page, limit);

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
      const banner = await this.bannersService.getBannerById(id);

      if (!banner) {
        res.status(404).json({
          success: false,
          message: 'Banner not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: banner,
      });
    } catch (error) {
      next(error);
    }
  };


  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = req.body;
      if (req.file) {
        data.image_url = `/uploads/${req.file.filename}`;
        data.image_file = `/uploads/${req.file.filename}`;
      }
      if (typeof data.is_active === 'string') data.is_active = data.is_active === 'true';
      const banner = await this.bannersService.createBanner(data);

      res.status(201).json({
        success: true,
        message: 'Banner created successfully',
        data: banner,
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
        data.image_url = `/uploads/${req.file.filename}`;
        data.image_file = `/uploads/${req.file.filename}`;
      }
      if (typeof data.is_active === 'string') data.is_active = data.is_active === 'true';
      const banner = await this.bannersService.updateBanner(id, data);

      if (!banner) {
        res.status(404).json({
          success: false,
          message: 'Banner not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Banner updated successfully',
        data: banner,
      });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const deleted = await this.bannersService.deleteBanner(id);

      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'Banner not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Banner deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  toggleActive = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const banner = await this.bannersService.toggleActive(id);

      if (!banner) {
        res.status(404).json({
          success: false,
          message: 'Banner not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Banner status updated',
        data: banner,
      });
    } catch (error) {
      next(error);
    }
  };
}

export default new BannersController();