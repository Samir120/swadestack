import { createApp } from './app';
import { config } from './config/environment';
import { connectDatabase } from './config/database';
// Import models to initialize associations
import './models/sequelize';
import { migrateServiceCategories } from './utils/migrateServiceCategories';

/**
 * Start the server
 */
const startServer = async (): Promise<void> => {
  try {
    // Connect to database
    await connectDatabase();

    // Migrate existing category strings to ServiceCategory entities
    await migrateServiceCategories();

    // Create Express app
    const app = createApp();

    // Start listening
    const server = app.listen(config.port, () => {
      console.log(`
╔═══════════════════════════════════════════╗
║  Portfolio E-Commerce API                 ║
║  Environment: ${config.env.padEnd(29)}║
║  Server: http://localhost:${config.port}${' '.repeat(17)}║
║  Status: ✅ Running                        ║
╚═══════════════════════════════════════════╝
      `);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM signal received: closing HTTP server');
      server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('SIGINT signal received: closing HTTP server');
      server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
      });
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();
