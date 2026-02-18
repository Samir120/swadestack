import { Request, Response, NextFunction } from 'express';
import AuthService from '../services/AuthService';

const authService = new AuthService();

/**
 * Verify JWT token and attach user info to request
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractToken(req);

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'No token provided',
      });
      return;
    }

    const decoded = authService.verifyToken(token);
    (req as any).user = {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }
};

/**
 * Optionally verify JWT token - attaches user if present, continues regardless
 */
export const optionalAuthenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractToken(req);
    if (token) {
      const decoded = authService.verifyToken(token);
      (req as any).user = {
        id: decoded.userId,
        email: decoded.email,
        role: decoded.role,
      };
    }
  } catch {
    // Token invalid or expired - continue as guest
  }
  next();
};

/**
 * Verify user has admin role
 */
export const requireAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const user = (req as any).user;

  if (!user || user.role !== 'admin') {
    res.status(403).json({
      success: false,
      message: 'Admin access required',
    });
    return;
  }

  next();
};

/**
 * Extract token from Authorization header or cookies
 */
function extractToken(req: Request): string | null {
  // Check Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Check cookies
  if (req.cookies && req.cookies.token) {
    return req.cookies.token;
  }

  return null;
}
