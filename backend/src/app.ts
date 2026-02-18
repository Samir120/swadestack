import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import path from 'path';
import { config } from './config/environment';
import routes from './api/routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { publicRouteMaintenanceCheck } from './middleware/maintenanceMode';

/**
 * Create and configure Express application
 */
export const createApp = (): Application => {
  const app = express();

  // Trust first proxy (Nginx) — required for rate limiting behind reverse proxy
  app.set('trust proxy', 1);

  // Security middleware
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          connectSrc: ["'self'", config.cors.origin],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "blob:", "https:"],
          fontSrc: ["'self'", "data:"],
        },
      },
    })
  );
  app.use(
    cors({
      origin: config.cors.origin,
      credentials: true,
    })
  );

  // Body parser middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser());

  // Logging middleware
  if (config.env === 'development') {
    app.use(morgan('dev'));
  }

  // Serve uploaded files
  app.use('/uploads', (req, res, next) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    next();
  }, express.static(path.join(__dirname, '../uploads')));

  // Maintenance mode check (applies to all /api routes)
  app.use('/api', publicRouteMaintenanceCheck);

  // API routes
  app.use('/api', routes);

  // In development, show API info at root
  // In production, Nginx serves the frontend and proxies only /api to this server
  if (config.env !== 'production') {
    app.get('/', (req, res) => {
      res.json({
        message: 'M24 Design API',
        version: '1.0.0',
        endpoints: {
          health: '/api/health',
          portfolio: '/api/portfolio',
          services: '/api/services',
          orders: '/api/orders',
          auth: '/api/auth',
          contact: '/api/contact',
        },
      });
    });
  }

  // Error handling
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

export default createApp;
