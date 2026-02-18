import { Request, Response, NextFunction } from 'express';
import PortfolioService from '../../services/PortfolioService';

/**
 * Portfolio Controller - API Layer
 * Handles HTTP requests for portfolio endpoints
 */
export class PortfolioController {
  private portfolioService: PortfolioService;

  constructor() {
    this.portfolioService = new PortfolioService();
  }

  /**
   * GET /api/portfolio
   * Get all published portfolio items
   */
  getPublished = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const category = req.query.category as string;

      const result = await this.portfolioService.getPublishedItems(page, limit, category);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/portfolio/admin/all
   * Get ALL portfolio items (admin only - includes unpublished)
   */
  getAllItems = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 100;
      const category = req.query.category as string;

      const result = await this.portfolioService.getAllItems(page, limit, category);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/portfolio/featured
   * Get featured portfolio items
   */
  getFeatured = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const limit = parseInt(req.query.limit as string) || 6;
      const items = await this.portfolioService.getFeaturedItems(limit);

      res.status(200).json({
        success: true,
        data: items,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/portfolio/:id
   * Get single portfolio item by ID
   */
  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const item = await this.portfolioService.getItemById(id);

      if (!item) {
        res.status(404).json({
          success: false,
          message: 'Portfolio item not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: item,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/portfolio/categories
   * Get all portfolio categories
   */
  getCategories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const categories = await this.portfolioService.getCategories();

      res.status(200).json({
        success: true,
        data: categories,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/portfolio (Admin)
   * Create new portfolio item
   */
  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = req.body;
      if (req.file) {
        data.imageUrl = `/uploads/${req.file.filename}`;
        data.imageFile = `/uploads/${req.file.filename}`;
      }
      if (typeof data.techStack === 'string') {
        data.techStack = JSON.parse(data.techStack);
      }
      if (typeof data.featured === 'string') {
        data.featured = data.featured === 'true';
      }
      if (typeof data.isPublished === 'string') {
        data.isPublished = data.isPublished === 'true';
      }
      const item = await this.portfolioService.createItem(data);

      res.status(201).json({
        success: true,
        message: 'Portfolio item created successfully',
        data: item,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /api/portfolio/:id (Admin)
   * Update portfolio item
   */
  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const data = req.body;
      if (req.file) {
        data.imageUrl = `/uploads/${req.file.filename}`;
        data.imageFile = `/uploads/${req.file.filename}`;
      }
      if (typeof data.techStack === 'string') {
        data.techStack = JSON.parse(data.techStack);
      }
      if (typeof data.featured === 'string') {
        data.featured = data.featured === 'true';
      }
      if (typeof data.isPublished === 'string') {
        data.isPublished = data.isPublished === 'true';
      }
      const item = await this.portfolioService.updateItem(id, data);

      if (!item) {
        res.status(404).json({
          success: false,
          message: 'Portfolio item not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Portfolio item updated successfully',
        data: item,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /api/portfolio/:id (Admin)
   * Delete portfolio item
   */
  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const deleted = await this.portfolioService.deleteItem(id);

      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'Portfolio item not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Portfolio item deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /api/portfolio/:id/toggle-featured (Admin)
   * Toggle featured status
   */
  toggleFeatured = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const item = await this.portfolioService.toggleFeatured(id);

      if (!item) {
        res.status(404).json({
          success: false,
          message: 'Portfolio item not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Featured status updated',
        data: item,
      });
    } catch (error) {
      next(error);
    }
  };
}

export default new PortfolioController();
