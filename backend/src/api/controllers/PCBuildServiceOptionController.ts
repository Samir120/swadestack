import { Request, Response, NextFunction } from 'express';
import PCBuildServiceOptionService from '../../services/PCBuildServiceOptionService';
import { mapBuildServiceOptionToDTO } from '../../models/dto/PCBuildServiceOptionDTO';

export class PCBuildServiceOptionController {
  private buildServiceService: PCBuildServiceOptionService;

  constructor() {
    this.buildServiceService = new PCBuildServiceOptionService();
  }

  /**
   * GET /api/pc-build-services
   * Get all active build service options
   */
  getActiveOptions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const options = await this.buildServiceService.getActiveOptions();

      res.status(200).json({
        success: true,
        data: {
          options: options.map(mapBuildServiceOptionToDTO),
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/pc-build-services/all
   * Get all build service options (including inactive) - Admin
   */
  getAllOptions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const options = await this.buildServiceService.getAllOptions();

      res.status(200).json({
        success: true,
        data: {
          options: options.map(mapBuildServiceOptionToDTO),
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/pc-build-services/default
   * Get default build service option
   */
  getDefaultOption = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const option = await this.buildServiceService.getDefaultOption();

      if (!option) {
        res.status(404).json({
          success: false,
          message: 'No default build service option found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: mapBuildServiceOptionToDTO(option),
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/pc-build-services/:id
   * Get build service option by ID
   */
  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const option = await this.buildServiceService.getOptionById(id);

      if (!option) {
        res.status(404).json({
          success: false,
          message: 'Build service option not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: mapBuildServiceOptionToDTO(option),
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/pc-build-services/calculate
   * Calculate service charge
   */
  calculateCharge = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { componentTotal, optionId } = req.body;

      if (componentTotal === undefined || !optionId) {
        res.status(400).json({
          success: false,
          message: 'Component total and option ID are required',
        });
        return;
      }

      const result = await this.buildServiceService.calculateServiceCharge(componentTotal, optionId);

      res.status(200).json({
        success: true,
        data: {
          charge: result.charge,
          option: mapBuildServiceOptionToDTO(result.option),
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/pc-build-services/calculate-examples?componentTotal=25000
   * Get charge examples for all active options
   */
  getChargeExamples = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const componentTotal = parseFloat(req.query.componentTotal as string) || 0;

      if (componentTotal < 0) {
        res.status(400).json({
          success: false,
          message: 'Component total must be non-negative',
        });
        return;
      }

      const examples = await this.buildServiceService.calculateChargeExamples(componentTotal);

      res.status(200).json({
        success: true,
        data: examples.map((ex) => ({
          option: mapBuildServiceOptionToDTO(ex.option),
          charge: ex.charge,
        })),
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/pc-build-services
   * Create new build service option (Admin)
   */
  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const option = await this.buildServiceService.createOption(req.body);

      res.status(201).json({
        success: true,
        message: 'Build service option created successfully',
        data: mapBuildServiceOptionToDTO(option),
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /api/pc-build-services/:id
   * Update build service option (Admin)
   */
  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const option = await this.buildServiceService.updateOption(id, req.body);

      res.status(200).json({
        success: true,
        message: 'Build service option updated successfully',
        data: mapBuildServiceOptionToDTO(option),
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /api/pc-build-services/:id
   * Delete build service option (Admin)
   */
  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.buildServiceService.deleteOption(id);

      res.status(200).json({
        success: true,
        message: 'Build service option deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /api/pc-build-services/:id/set-default
   * Set default build service option (Admin)
   */
  setDefault = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const option = await this.buildServiceService.setDefaultOption(id);

      res.status(200).json({
        success: true,
        message: 'Default build service option set successfully',
        data: mapBuildServiceOptionToDTO(option),
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /api/pc-build-services/:id/toggle-active
   * Toggle option active status (Admin)
   */
  toggleActive = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const option = await this.buildServiceService.toggleActive(id);

      res.status(200).json({
        success: true,
        message: 'Build service option status toggled successfully',
        data: mapBuildServiceOptionToDTO(option),
      });
    } catch (error) {
      next(error);
    }
  };
}

export default new PCBuildServiceOptionController();
