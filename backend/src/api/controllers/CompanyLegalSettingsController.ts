import { Request, Response } from 'express';
import CompanyLegalSettingsService from '../../services/CompanyLegalSettingsService';

export class CompanyLegalSettingsController {
  private service: CompanyLegalSettingsService;

  constructor() {
    this.service = new CompanyLegalSettingsService();
  }

  /**
   * GET /api/legal-settings
   * Get public legal settings (no auth required)
   */
  getPublicSettings = async (req: Request, res: Response) => {
    try {
      const settings = await this.service.getPublicSettings();
      res.json({
        success: true,
        data: settings,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch legal settings',
      });
    }
  };

  /**
   * GET /api/legal-settings/admin
   * Get all legal settings (admin only)
   */
  getSettings = async (req: Request, res: Response) => {
    try {
      const settings = await this.service.getSettings();
      res.json({
        success: true,
        data: settings,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch legal settings',
      });
    }
  };

  /**
   * PUT /api/legal-settings/admin
   * Update legal settings (admin only)
   */
  updateSettings = async (req: Request, res: Response) => {
    try {
      const settings = await this.service.updateSettings(req.body);
      res.json({
        success: true,
        data: settings,
        message: 'Legal settings updated successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to update legal settings',
      });
    }
  };
}

export default CompanyLegalSettingsController;
