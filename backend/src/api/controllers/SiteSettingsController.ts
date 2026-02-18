import { Request, Response, NextFunction } from 'express';
import SiteSettingsService from '../../services/SiteSettingsService';
import fs from 'fs';
import path from 'path';

/**
 * SiteSettings Controller - API Layer
 * Handles HTTP requests for site configuration
 */
export class SiteSettingsController {
  private service: SiteSettingsService;

  constructor() {
    this.service = new SiteSettingsService();
  }

  /**
   * GET /api/settings/public
   * Get public site settings (no auth required)
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
        message: error.message || 'Failed to fetch settings',
      });
    }
  };

  /**
   * GET /api/settings
   * Get all site settings (admin only)
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
        message: error.message || 'Failed to fetch settings',
      });
    }
  };

  /**
   * PUT /api/settings
   * Update site settings (admin only)
   */
  updateSettings = async (req: Request, res: Response) => {
    try {
      const settings = await this.service.updateSettings(req.body);
      res.json({
        success: true,
        data: settings,
        message: 'Settings updated successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to update settings',
      });
    }
  };

  /**
   * POST /api/settings/logo
   * Upload logo file (admin only)
   */
  uploadLogo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({ success: false, message: 'No file uploaded' });
        return;
      }

      const filePath = `/uploads/${req.file.filename}`;

      // Delete old uploaded logo file if it exists
      const current = await this.service.getSettings();
      if (current.logoFile && current.logoFile.startsWith('/uploads/')) {
        const oldPath = path.join(__dirname, '../../../', current.logoFile);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }

      const settings = await this.service.updateSettings({
        logoUrl: filePath,
        logoFile: filePath,
      });

      res.json({
        success: true,
        data: settings,
        message: 'Logo uploaded successfully',
      });
    } catch (error: any) {
      next(error);
    }
  };

  /**
   * POST /api/settings/favicon
   * Upload favicon file (admin only)
   */
  uploadFavicon = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({ success: false, message: 'No file uploaded' });
        return;
      }

      const filePath = `/uploads/${req.file.filename}`;

      // Delete old uploaded favicon file if it exists
      const current = await this.service.getSettings();
      if (current.faviconFile && current.faviconFile.startsWith('/uploads/')) {
        const oldPath = path.join(__dirname, '../../../', current.faviconFile);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }

      const settings = await this.service.updateSettings({
        faviconUrl: filePath,
        faviconFile: filePath,
      });

      res.json({
        success: true,
        data: settings,
        message: 'Favicon uploaded successfully',
      });
    } catch (error: any) {
      next(error);
    }
  };

  /**
   * POST /api/settings/feature-image
   * Upload feature section image (admin only)
   */
  uploadFeatureImage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({ success: false, message: 'No file uploaded' });
        return;
      }

      const filePath = `/uploads/${req.file.filename}`;

      // Delete old uploaded feature image if it exists
      const current = await this.service.getSettings();
      if (current.featureSectionImageFile && current.featureSectionImageFile.startsWith('/uploads/')) {
        const oldPath = path.join(__dirname, '../../../', current.featureSectionImageFile);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }

      const settings = await this.service.updateSettings({
        featureSectionImageFile: filePath,
      });

      res.json({
        success: true,
        data: settings,
        message: 'Feature section image uploaded successfully',
      });
    } catch (error: any) {
      next(error);
    }
  };

  /**
   * POST /api/settings/maintenance/toggle
   * Toggle maintenance mode (admin only)
   */
  toggleMaintenanceMode = async (req: Request, res: Response) => {
    try {
      const settings = await this.service.toggleMaintenanceMode();
      res.json({
        success: true,
        data: settings,
        message: `Maintenance mode ${settings.maintenanceMode ? 'enabled' : 'disabled'}`,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to toggle maintenance mode',
      });
    }
  };
}

export default SiteSettingsController;
