export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  language?: 'en' | 'sv';
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  language: 'en' | 'sv';
  status: 'new' | 'read' | 'replied' | 'archived';
  isRead: boolean;
  adminNotes?: string;
  repliedAt?: string;
  repliedBy?: string;
  admin?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ContactMessageStatistics {
  total: number;
  new: number;
  read: number;
  replied: number;
  archived: number;
  unread: number;
}

export interface ContactMessagesResponse {
  messages: ContactMessage[];
  total: number;
}

export interface ReplyData {
  subject: string;
  message: string;
}

export interface UpdateStatusData {
  status: 'new' | 'read' | 'replied' | 'archived';
}

export interface AddNotesData {
  notes: string;
}
