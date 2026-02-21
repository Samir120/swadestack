export interface NewsletterSubscribeData {
  email: string;
  language?: 'en' | 'sv';
}

export interface NewsletterCheckStatusResponse {
  isSubscribed: boolean;
}

export interface NewsletterUnsubscribeResponse {
  message: string;
}
