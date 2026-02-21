import dotenv from 'dotenv';

dotenv.config();

export const emailConfig = {
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  },
  from: {
    name: process.env.EMAIL_FROM_NAME || 'Portfolio Agency',
    address: process.env.EMAIL_FROM_ADDRESS || process.env.SMTP_USER,
  },
  templates: {
    path: process.env.EMAIL_TEMPLATES_PATH || 'src/templates/emails',
  },
  // Email limits and retry configuration
  limits: {
    maxRetries: 3,
    retryDelay: 5000, // 5 seconds
    maxRecipients: 50, // For newsletter
  },
};

// Template types enum
export enum EmailTemplateType {
  WELCOME = 'welcome',
  EMAIL_VERIFICATION = 'email-verification',
  ORDER_CONFIRMATION = 'order-confirmation',
  PARTIAL_PAYMENT_CONFIRMATION = 'partial-payment-confirmation',
  FINAL_PAYMENT_CONFIRMATION = 'final-payment-confirmation',
  ORDER_STATUS_UPDATE = 'order-status-update',
  CONTACT_FORM = 'contact-form',
  CONTACT_FORM_ADMIN = 'contact-form-admin',
  NEWSLETTER = 'newsletter',
  PASSWORD_RESET = 'password-reset',
  NEWSLETTER_SUBSCRIPTION = 'newsletter-subscription',
  CART_REMINDER = 'cart-reminder',
  ADMIN_CUSTOM = 'admin-custom',
  ORDER_BALANCE_DUE = 'order-balance-due',
}

// Email priority levels
export enum EmailPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
}
