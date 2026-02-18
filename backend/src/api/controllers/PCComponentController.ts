import { Request, Response, NextFunction } from 'express';
import PCComponentService from '../../services/PCComponentService';
import { mapPCComponentToDTO } from '../../models/dto/PCComponentDTO';

export class PCComponentController {
  private componentService: PCComponentService;

  constructor() {
    this.componentService = new PCComponentService();
  }

  /**
   * GET /api/pc-components?type=cpu&manufacturer=AMD&page=1&limit=50
   * Get components by type with optional filters and pagination
   */
  getComponentsByType = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const componentType = req.query.type as any;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;

      const filters = {
        manufacturer: req.query.manufacturer as string,
        minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
        maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
      };

      if (!componentType) {
        res.status(400).json({
          success: false,
          message: 'Component type is required',
        });
        return;
      }

      const result = await this.componentService.getComponentsByType(
        componentType,
        page,
        limit,
        filters
      );

      res.status(200).json({
        success: true,
        data: {
          components: result.components.map(mapPCComponentToDTO),
          total: result.total,
          page: result.page,
          limit: result.limit,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/pc-components/:id
   * Get component by ID
   */
  getComponentById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const component = await this.componentService.getComponentById(id);

      if (!component) {
        res.status(404).json({
          success: false,
          message: 'Component not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: mapPCComponentToDTO(component),
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/pc-components/search?q=Ryzen&type=cpu&limit=50
   * Search components by query string
   */
  searchComponents = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = req.query.q as string;
      const componentType = req.query.type as any;
      const limit = parseInt(req.query.limit as string) || 50;

      if (!query || query.trim().length < 2) {
        res.status(400).json({
          success: false,
          message: 'Search query must be at least 2 characters long',
        });
        return;
      }

      const components = await this.componentService.searchComponents(query, componentType, limit);

      res.status(200).json({
        success: true,
        data: components.map(mapPCComponentToDTO),
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/pc-components/manufacturers?type=cpu
   * Get all manufacturers for a component type
   */
  getManufacturers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const componentType = req.query.type as any;
      const manufacturers = await this.componentService.getManufacturers(componentType);

      res.status(200).json({
        success: true,
        data: manufacturers,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/pc-components/admin/all?type=cpu&page=1&limit=50
   * Get all components including inactive (Admin)
   */
  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const componentType = req.query.type as any;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 200;

      const result = await this.componentService.getAllComponentsAdmin(
        page,
        limit,
        componentType
      );

      res.status(200).json({
        success: true,
        data: {
          components: result.components.map(mapPCComponentToDTO),
          total: result.total,
          page: result.page,
          limit: result.limit,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/pc-components
   * Create new component (Admin)
   */
  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const component = await this.componentService.createComponent(req.body);

      res.status(201).json({
        success: true,
        message: 'Component created successfully',
        data: mapPCComponentToDTO(component),
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /api/pc-components/:id
   * Update component (Admin)
   */
  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const component = await this.componentService.updateComponent(id, req.body);

      res.status(200).json({
        success: true,
        message: 'Component updated successfully',
        data: mapPCComponentToDTO(component),
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /api/pc-components/:id
   * Delete component (Admin)
   */
  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.componentService.deleteComponent(id);

      res.status(200).json({
        success: true,
        message: 'Component deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /api/pc-components/:id/stock
   * Update component stock (Admin)
   */
  updateStock = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { quantity } = req.body;

      if (quantity === undefined || quantity < 0) {
        res.status(400).json({
          success: false,
          message: 'Valid quantity is required',
        });
        return;
      }

      await this.componentService.updateStock(id, quantity);

      res.status(200).json({
        success: true,
        message: 'Stock updated successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /api/pc-components/:id/toggle-active
   * Toggle component active status (Admin)
   */
  toggleActive = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const component = await this.componentService.toggleActive(id);

      res.status(200).json({
        success: true,
        message: 'Component status toggled successfully',
        data: mapPCComponentToDTO(component),
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/pc-components/stats/low-stock?threshold=5
   * Get components with low stock (Admin)
   */
  getLowStockComponents = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const threshold = parseInt(req.query.threshold as string) || 5;
      const components = await this.componentService.getLowStockComponents(threshold);

      res.status(200).json({
        success: true,
        data: components.map(mapPCComponentToDTO),
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/pc-components/stats/counts
   * Get component counts by type (Admin)
   */
  getComponentTypeCounts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const counts = await this.componentService.getComponentTypeCounts();

      res.status(200).json({
        success: true,
        data: counts,
      });
    } catch (error) {
      next(error);
    }
  };
}

export default new PCComponentController();
