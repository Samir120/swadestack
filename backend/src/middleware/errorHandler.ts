import { Request, Response, NextFunction } from 'express';

const isProduction = process.env.NODE_ENV === 'production';

/**
 * Global error handler middleware
 */
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Only log full error details in development
  if (isProduction) {
    console.error('Error:', err.message);
  } else {
    console.error('Error:', err);
  }

  // Sequelize validation error
  if (err.name === 'SequelizeValidationError') {
    res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: err.errors.map((e: any) => ({
        field: e.path,
        message: e.message,
      })),
    });
    return;
  }

  // Sequelize unique constraint error
  if (err.name === 'SequelizeUniqueConstraintError') {
    res.status(409).json({
      success: false,
      message: 'Resource already exists',
      errors: err.errors.map((e: any) => ({
        field: e.path,
        message: e.message,
      })),
    });
    return;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    res.status(401).json({
      success: false,
      message: 'Invalid token',
    });
    return;
  }

  if (err.name === 'TokenExpiredError') {
    res.status(401).json({
      success: false,
      message: 'Token expired',
    });
    return;
  }

  // Custom application errors
  if (err.statusCode) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message || 'An error occurred',
    });
    return;
  }

  // Default error — hide internal details in production
  res.status(500).json({
    success: false,
    message: isProduction ? 'Internal server error' : (err.message || 'Internal server error'),
  });
};

/**
 * 404 handler
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: isProduction ? 'Not found' : `Route ${req.originalUrl} not found`,
  });
};
