import { Request, Response } from 'express';
import VatSettingsService from '../../services/VatSettingsService';

export class VatSettingsController {
  private service: VatSettingsService;

  constructor() {
    this.service = new VatSettingsService();
  }

  /**
   * GET /api/vat-settings
   * Get public VAT settings (no auth required)
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
        message: error.message || 'Failed to fetch VAT settings',
      });
    }
  };

  /**
   * GET /api/vat-settings/admin
   * Get all VAT settings (admin only)
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
        message: error.message || 'Failed to fetch VAT settings',
      });
    }
  };

  /**
   * PUT /api/vat-settings/admin
   * Update VAT settings (admin only)
   */
  updateSettings = async (req: Request, res: Response) => {
    try {
      const settings = await this.service.updateSettings(req.body);
      res.json({
        success: true,
        data: settings,
        message: 'VAT settings updated successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to update VAT settings',
      });
    }
  };
}

export default VatSettingsController;
