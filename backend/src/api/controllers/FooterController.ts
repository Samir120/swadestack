import { Request, Response, NextFunction } from 'express';
import FooterService from '../../services/FooterService';

/**
 * Footer Controller - API Layer
 * Handles HTTP requests for footer category titles and main pages endpoints
 */
export class FooterController {
  private footerService: FooterService;

  constructor() {
    this.footerService = new FooterService();
  }

  // ===============================
  // Public Footer Structure
  // ===============================

  /**
   * GET /api/footer/structure
   * Get active footer structure with categories and pages (public)
   */
  getFooterStructure = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const structure = await this.footerService.getActiveFooterStructure();

      res.status(200).json({
        success: true,
        data: structure,
      });
    } catch (error) {
      next(error);
    }
  };

  // ===============================
  // Footer Category Title Endpoints
  // ===============================

  /**
   * GET /api/footer/categories
   * Get all footer categories with pages (admin)
   */
  getAllCategories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const categories = await this.footerService.getAllCategories();

      res.status(200).json({
        success: true,
        data: categories,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/footer/categories/:id
   * Get single footer category by ID
   */
  getCategoryById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const category = await this.footerService.getCategoryById(id);

      if (!category) {
        res.status(404).json({
          success: false,
          message: 'Footer category not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: category,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/footer/categories (Admin)
   * Create new footer category
   */
  createCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const category = await this.footerService.createCategory(req.body);

      res.status(201).json({
        success: true,
        message: 'Footer category created successfully',
        data: category,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /api/footer/categories/:id (Admin)
   * Update footer category
   */
  updateCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const category = await this.footerService.updateCategory(id, req.body);

      if (!category) {
        res.status(404).json({
          success: false,
          message: 'Footer category not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Footer category updated successfully',
        data: category,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /api/footer/categories/:id (Admin)
   * Delete footer category
   */
  deleteCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const deleted = await this.footerService.deleteCategory(id);

      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'Footer category not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Footer category deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /api/footer/categories/:id/toggle-active (Admin)
   * Toggle category active status
   */
  toggleCategoryActive = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const category = await this.footerService.toggleCategoryActive(id);

      if (!category) {
        res.status(404).json({
          success: false,
          message: 'Footer category not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Category active status updated',
        data: category,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /api/footer/categories/:id/order (Admin)
   * Update category display order
   */
  updateCategoryOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { displayOrder } = req.body;

      if (displayOrder === undefined) {
        res.status(400).json({
          success: false,
          message: 'Display order is required',
        });
        return;
      }

      await this.footerService.updateCategoryOrder(id, displayOrder);

      res.status(200).json({
        success: true,
        message: 'Category order updated successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  // ===============================
  // Footer Main Page Endpoints
  // ===============================

  /**
   * GET /api/footer/pages
   * Get all active footer pages
   */
  getActivePages = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const pages = await this.footerService.getActivePages();

      res.status(200).json({
        success: true,
        data: pages,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/footer/pages/all (Admin)
   * Get all footer pages including inactive
   */
  getAllPages = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const pages = await this.footerService.getAllPages();

      res.status(200).json({
        success: true,
        data: pages,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/footer/pages/category/:categoryId
   * Get pages by category ID
   */
  getPagesByCategoryId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { categoryId } = req.params;
      const pages = await this.footerService.getPagesByCategoryId(categoryId);

      res.status(200).json({
        success: true,
        data: pages,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/footer/pages/:id
   * Get single footer page by ID
   */
  getPageById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const page = await this.footerService.getPageById(id);

      if (!page) {
        res.status(404).json({
          success: false,
          message: 'Footer page not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: page,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/footer/page-by-url
   * Get page by URL
   */
  getPageByUrl = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { url } = req.query;

      if (!url || typeof url !== 'string') {
        res.status(400).json({
          success: false,
          message: 'URL parameter is required',
        });
        return;
      }

      const page = await this.footerService.getPageByUrl(url);

      if (!page) {
        res.status(404).json({
          success: false,
          message: 'Page not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: page,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/footer/pages (Admin)
   * Create new footer page
   */
  createPage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = await this.footerService.createPage(req.body);

      res.status(201).json({
        success: true,
        message: 'Footer page created successfully',
        data: page,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /api/footer/pages/:id (Admin)
   * Update footer page
   */
  updatePage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const page = await this.footerService.updatePage(id, req.body);

      if (!page) {
        res.status(404).json({
          success: false,
          message: 'Footer page not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Footer page updated successfully',
        data: page,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /api/footer/pages/:id (Admin)
   * Delete footer page
   */
  deletePage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const deleted = await this.footerService.deletePage(id);

      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'Footer page not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Footer page deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /api/footer/pages/:id/toggle-active (Admin)
   * Toggle page active status
   */
  togglePageActive = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const page = await this.footerService.togglePageActive(id);

      if (!page) {
        res.status(404).json({
          success: false,
          message: 'Footer page not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Page active status updated',
        data: page,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /api/footer/pages/:id/order (Admin)
   * Update page display order
   */
  updatePageOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { displayOrder } = req.body;

      if (displayOrder === undefined) {
        res.status(400).json({
          success: false,
          message: 'Display order is required',
        });
        return;
      }

      await this.footerService.updatePageOrder(id, displayOrder);

      res.status(200).json({
        success: true,
        message: 'Page order updated successfully',
      });
    } catch (error) {
      next(error);
    }
  };
}

export default new FooterController();
