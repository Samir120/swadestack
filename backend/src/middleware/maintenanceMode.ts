import { Request, Response, NextFunction } from 'express';
import SiteSettingsService from '../services/SiteSettingsService';

/**
 * Maintenance Mode Middleware
 * Blocks all non-admin users when maintenance mode is enabled
 */
export const checkMaintenanceMode = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const settingsService = new SiteSettingsService();
    const isMaintenanceMode = await settingsService.isMaintenanceMode();

    // If maintenance mode is OFF, allow everyone
    if (!isMaintenanceMode) {
      return next();
    }

    // If maintenance mode is ON, check if user is admin
    const user = (req as any).user;
    
    // Allow admins to access
    if (user && user.role === 'admin') {
      return next();
    }

    // Block everyone else with maintenance page
    return res.status(503).json({
      success: false,
      message: 'Site is currently under maintenance',
      maintenanceMode: true,
    });
  } catch (error) {
    // If error checking maintenance mode, allow access
    console.error('Error checking maintenance mode:', error);
    next();
  }
};

/**
 * Apply maintenance mode check to specific routes
 * Exclude auth routes (login/register) so users can still authenticate
 */
export const publicRouteMaintenanceCheck = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Always allow these paths even in maintenance mode
  const allowedPaths = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/profile',
    '/api/settings/public', // Need to get maintenance status
  ];

  // Check if current path is allowed
  if (allowedPaths.some(path => req.path.startsWith(path))) {
    return next();
  }

  // Otherwise, check maintenance mode
  return checkMaintenanceMode(req, res, next);
};
