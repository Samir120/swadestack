import dotenv from 'dotenv';

dotenv.config();

// Ensure critical secrets are set in production
if (process.env.NODE_ENV === 'production') {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error('FATAL: JWT_SECRET must be set and at least 32 characters in production');
  }
  if (!process.env.DB_PASSWORD || process.env.DB_PASSWORD === 'postgres') {
    throw new Error('FATAL: DB_PASSWORD must be set to a strong value in production');
  }
}

interface Config {
  env: string;
  port: number;
  database: {
    name: string;
    user: string;
    password: string;
    host: string;
    port: number;
  };
  jwt: {
    secret: string;
    expiresIn: string;
    refreshExpiresInDays: number;
  };
  klarna: {
    baseUrl: string;
    username: string;
    password: string;
    termsUrl: string;
    checkoutUrl: string;
    confirmationUrl: string;
    pushUrl: string;
  };
  frontendUrl: string;
  cors: {
    origin: string;
  };
}

export const config: Config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  database: {
    name: process.env.DB_NAME || 'portfolio_ecommerce',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshExpiresInDays: parseInt(process.env.JWT_REFRESH_EXPIRES_DAYS || '7', 10),
  },
  klarna: {
    baseUrl: process.env.KLARNA_API_URL || 'https://api.playground.klarna.com',
    username: process.env.KLARNA_USERNAME || '',
    password: process.env.KLARNA_PASSWORD || '',
    termsUrl: process.env.KLARNA_TERMS_URL || 'http://localhost:5173/terms',
    checkoutUrl: process.env.KLARNA_CHECKOUT_URL || 'http://localhost:5173/klarna-checkout/{checkout.order.id}',
    confirmationUrl: process.env.KLARNA_CONFIRMATION_URL || 'http://localhost:5173/order-confirmation/{checkout.order.id}',
    pushUrl: process.env.KLARNA_PUSH_URL || 'http://localhost:5000/api/orders/klarna/push',
  },
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  },
};
