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
  app.use('/api', helmet({
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
  }));
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

  // Serve uploaded files. Filenames are unique per upload (timestamp + random),
  // so contents never change under a given name — caching them avoids
  // re-fetching every image on each navigation, which made images visibly
  // re-paint. Kept at 30d rather than immutable so a manual file swap recovers.
  app.use('/uploads', (req, res, next) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    next();
  }, express.static(path.join(__dirname, '../uploads'), { maxAge: '30d' }));

  // Maintenance mode check (applies to all /api routes)
  app.use('/api', publicRouteMaintenanceCheck);

  // API routes
  app.use('/api', routes);

  // In development, show API info at root
  // In production, Nginx serves the frontend and proxies only /api to this server
  if (config.env === 'production') {
    // Serve frontend static files in production
    const frontendPath = path.join(__dirname, '../../frontend/dist');

    // Vite emits content-hashed filenames into /assets, so those are safe to
    // cache permanently. Without this every chunk revalidated on each load
    // (max-age=0 => a 304 round-trip per chunk), delaying paint on navigation.
    app.use(
      '/assets',
      express.static(path.join(frontendPath, 'assets'), {
        immutable: true,
        maxAge: '1y',
      })
    );

    // Everything else (index.html, robots.txt, sitemap.xml, /images) is not
    // hashed, so it must stay revalidated to avoid serving a stale shell.
    // This also serves index.html for "/" before the SPA fallback below runs.
    app.use(
      express.static(frontendPath, {
        etag: true,
        maxAge: 0,
        setHeaders: (res, filePath) => {
          if (filePath.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-cache');
          }
        },
      })
    );

    // SPA fallback - serve index.html for all non-API/non-upload routes
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
        return next();
      }
      // index.html points at the hashed bundles; it must never be cached or
      // clients keep booting a stale build after a deploy.
      res.setHeader('Cache-Control', 'no-cache');
      res.sendFile(path.join(frontendPath, 'index.html'));
    });
  } else {
    app.get('/', (req, res) => {
      res.json({
        message: 'Swade Stack API',
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
