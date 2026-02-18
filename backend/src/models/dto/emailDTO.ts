import { EmailTemplateType, EmailPriority } from '../../config/emailConfig';

export interface EmailAttachment {
  filename: string;
  content: Buffer;
  contentType?: string;
}

export interface SendEmailDTO {
  to: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  subject: string;
  templateType: EmailTemplateType;
  templateData: object;
  priority?: EmailPriority;
  userId?: string;
  orderId?: string;
  language?: 'en' | 'sv';
  attachments?: EmailAttachment[];
}

export interface EmailQueueDTO {
  id: string;
  to: string;
  subject: string;
  templateType: EmailTemplateType;
  templateData: object;
  priority: EmailPriority;
  retryCount: number;
}

export interface NewsletterSubscriptionDTO {
  email: string;
  firstName?: string;
  lastName?: string;
  language?: 'en' | 'sv';
  preferences?: object;
}

export interface NewsletterBroadcastDTO {
  subject: {
    en: string;
    sv: string;
  };
  templateType: EmailTemplateType;
  templateData: {
    en: object;
    sv: object;
  };
  priority?: EmailPriority;
  segmentFilter?: {
    language?: 'en' | 'sv';
    verifiedOnly?: boolean;
  };
}

export interface ContactFormDTO {
  name: string;
  email: string;
  subject: string;
  message: string;
  phone?: string;
  language: 'en' | 'sv';
}

export interface EmailVerificationDTO {
  userId: string;
  email: string;
  verificationToken: string;
  language: 'en' | 'sv';
}

export interface OrderConfirmationDTO {
  orderId: string;
  email: string;
  customerName: string;
  orderItems: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  vatAmount: number;
  discountAmount?: number;
  couponCode?: string;
  orderDate: Date;
  language: 'en' | 'sv';
  vatRatePercent?: number;
}

export interface PartialPaymentConfirmationDTO {
  orderId: string;
  email: string;
  customerName: string;
  orderItems: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  vatAmount: number;
  discountAmount?: number;
  couponCode?: string;
  initialAmount: number;
  remainingAmount: number;
  paidDate: Date;
  orderDate: Date;
  language: 'en' | 'sv';
  vatRatePercent?: number;
}

export interface FinalPaymentConfirmationDTO {
  orderId: string;
  email: string;
  customerName: string;
  orderItems: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  vatAmount: number;
  discountAmount?: number;
  couponCode?: string;
  initialAmount: number;
  finalAmount: number;
  initialPaidDate: Date;
  finalPaidDate: Date;
  orderDate: Date;
  language: 'en' | 'sv';
  vatRatePercent?: number;
}

export interface PasswordResetDTO {
  email: string;
  resetToken: string;
  userName: string;
  language: 'en' | 'sv';
}
