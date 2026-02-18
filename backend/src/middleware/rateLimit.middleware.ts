import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';

/**
 * Rate limiter for contact form submissions
 * Limits to 5 requests per 15 minutes per IP
 */
export const rateLimitMiddleware = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Skip rate limiting for authenticated admin users
  skip: (req: Request) => {
    // @ts-ignore
    return req.user?.role === 'admin';
  },
});

/**
 * Strict rate limiter for newsletter subscriptions
 * Limits to 3 requests per hour per IP
 */
export const newsletterRateLimitMiddleware = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 requests per windowMs
  message: {
    success: false,
    error: 'Too many subscription attempts, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter for email verification
 * Limits to 10 requests per hour per IP
 */
export const verificationRateLimitMiddleware = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: {
    success: false,
    error: 'Too many verification attempts, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter for login attempts
 * Limits to 10 requests per 15 minutes per IP
 */
export const loginRateLimitMiddleware = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: {
    success: false,
    error: 'Too many login attempts, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter for registration
 * Limits to 5 requests per hour per IP
 */
export const registerRateLimitMiddleware = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: {
    success: false,
    error: 'Too many registration attempts, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter for password reset requests
 * Limits to 5 requests per 15 minutes per IP
 */
export const passwordResetRateLimitMiddleware = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: {
    success: false,
    error: 'Too many password reset requests, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter for order creation
 * Limits to 10 requests per 15 minutes per IP
 */
export const orderCreationRateLimitMiddleware = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: {
    success: false,
    error: 'Too many order requests, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
