import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';

// Contact form: 5 req / 15 min
export const rateLimitMiddleware = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req: Request) => {
    // @ts-expect-error -- req.user is added by authentication middleware
    return req.user?.role === 'admin';
  },
});

// Newsletter subscribe: 3 req / hour
export const newsletterRateLimitMiddleware = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: {
    success: false,
    error: 'Too many subscription attempts, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Email verification: 10 req / hour
export const verificationRateLimitMiddleware = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    error: 'Too many verification attempts, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Login: 10 req / 15 min
export const loginRateLimitMiddleware = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    error: 'Too many login attempts, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Registration: 5 req / hour
export const registerRateLimitMiddleware = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    error: 'Too many registration attempts, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Password reset: 5 req / 15 min
export const passwordResetRateLimitMiddleware = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    error: 'Too many password reset requests, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Order creation: 10 req / 15 min
export const orderCreationRateLimitMiddleware = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    error: 'Too many order requests, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Newsletter status check: 30 req / 15 min
export const newsletterStatusCheckRateLimitMiddleware = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: {
    success: false,
    error: 'Too many status check requests, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Newsletter unsubscribe: 5 req / hour
export const newsletterUnsubscribeRateLimitMiddleware = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    error: 'Too many unsubscribe attempts, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
