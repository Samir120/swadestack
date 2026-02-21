import apiClient from './apiClient';
import {
  NewsletterDashboardData,
  CampaignListItem,
  CampaignListQuery,
  CampaignListResponse,
  CreateCampaignData,
  UpdateCampaignData,
  CampaignValidation,
  CampaignReportData,
  RecipientActivityResponse,
  SegmentListItem,
  CreateSegmentData,
  UpdateSegmentData,
  AdminSubscriberListItem,
  AdminSubscriberDetail,
  SubscriberListQuery,
  SubscriberListResponse,
  CreateSubscriberData,
  UpdateSubscriberData,
  TemplateListItem,
  CreateTemplateData,
  UpdateTemplateData,
  ProductSearchResult,
  ProductSearchQuery,
} from '../types/newsletterAdmin.types';

export const newsletterAdminApi = {
  // Dashboard
  getDashboard: async () => {
    return apiClient.get<NewsletterDashboardData>('/admin/newsletters/dashboard');
  },

  // Campaigns
  getCampaigns: async (query: CampaignListQuery = {}) => {
    return apiClient.get<CampaignListResponse>('/admin/newsletters/campaigns', query);
  },

  getCampaignById: async (id: string) => {
    return apiClient.get<CampaignListItem>(`/admin/newsletters/campaigns/${id}`);
  },

  createCampaign: async (data: CreateCampaignData) => {
    return apiClient.post<CampaignListItem>('/admin/newsletters/campaigns', data);
  },

  updateCampaign: async (id: string, data: UpdateCampaignData) => {
    return apiClient.put<CampaignListItem>(`/admin/newsletters/campaigns/${id}`, data);
  },

  deleteCampaign: async (id: string) => {
    return apiClient.delete(`/admin/newsletters/campaigns/${id}`);
  },

  duplicateCampaign: async (id: string) => {
    return apiClient.post<CampaignListItem>(`/admin/newsletters/campaigns/${id}/duplicate`);
  },

  cancelCampaign: async (id: string) => {
    return apiClient.post<CampaignListItem>(`/admin/newsletters/campaigns/${id}/cancel`);
  },

  validateCampaign: async (id: string) => {
    return apiClient.get<CampaignValidation>(`/admin/newsletters/campaigns/${id}/validate`);
  },

  sendCampaign: async (id: string) => {
    return apiClient.post<{ queued: number }>(`/admin/newsletters/campaigns/${id}/send`);
  },

  scheduleCampaign: async (id: string, scheduledAt: string) => {
    return apiClient.post(`/admin/newsletters/campaigns/${id}/schedule`, { scheduledAt });
  },

  sendTestEmail: async (id: string, email: string) => {
    return apiClient.post(`/admin/newsletters/campaigns/${id}/send-test`, { email });
  },

  getCampaignReport: async (id: string) => {
    return apiClient.get<CampaignReportData>(`/admin/newsletters/campaigns/${id}/report`);
  },

  getCampaignRecipients: async (id: string, query: { status?: string; page?: number; pageSize?: number } = {}) => {
    return apiClient.get<RecipientActivityResponse>(`/admin/newsletters/campaigns/${id}/recipients`, query);
  },

  // Subscribers
  getSubscribers: async (query: SubscriberListQuery = {}) => {
    return apiClient.get<SubscriberListResponse>('/admin/newsletters/subscribers', query);
  },

  getSubscriberById: async (id: string) => {
    return apiClient.get<AdminSubscriberDetail>(`/admin/newsletters/subscribers/${id}`);
  },

  createSubscriber: async (data: CreateSubscriberData) => {
    return apiClient.post<AdminSubscriberListItem>('/admin/newsletters/subscribers', data);
  },

  updateSubscriber: async (id: string, data: UpdateSubscriberData) => {
    return apiClient.put<AdminSubscriberListItem>(`/admin/newsletters/subscribers/${id}`, data);
  },

  deleteSubscriber: async (id: string) => {
    return apiClient.delete(`/admin/newsletters/subscribers/${id}`);
  },

  exportSubscribers: async (query: { status?: string; language?: string } = {}) => {
    return apiClient.getBlob('/admin/newsletters/subscribers/export', query);
  },

  // Segments
  getSegments: async () => {
    return apiClient.get<SegmentListItem[]>('/admin/newsletters/segments');
  },

  createSegment: async (data: CreateSegmentData) => {
    return apiClient.post<SegmentListItem>('/admin/newsletters/segments', data);
  },

  updateSegment: async (id: string, data: UpdateSegmentData) => {
    return apiClient.put<SegmentListItem>(`/admin/newsletters/segments/${id}`, data);
  },

  deleteSegment: async (id: string) => {
    return apiClient.delete(`/admin/newsletters/segments/${id}`);
  },

  addSegmentMembers: async (id: string, subscriberIds: string[]) => {
    return apiClient.post(`/admin/newsletters/segments/${id}/members`, { subscriberIds });
  },

  removeSegmentMembers: async (id: string, subscriberIds: string[]) => {
    return apiClient.post(`/admin/newsletters/segments/${id}/members/remove`, { subscriberIds });
  },

  // Templates
  getTemplates: async () => {
    return apiClient.get<TemplateListItem[]>('/admin/newsletters/templates');
  },

  getTemplateById: async (id: string) => {
    return apiClient.get<TemplateListItem>(`/admin/newsletters/templates/${id}`);
  },

  createTemplate: async (data: CreateTemplateData) => {
    return apiClient.post<TemplateListItem>('/admin/newsletters/templates', data);
  },

  updateTemplate: async (id: string, data: UpdateTemplateData) => {
    return apiClient.put<TemplateListItem>(`/admin/newsletters/templates/${id}`, data);
  },

  deleteTemplate: async (id: string) => {
    return apiClient.delete(`/admin/newsletters/templates/${id}`);
  },

  duplicateTemplate: async (id: string) => {
    return apiClient.post<TemplateListItem>(`/admin/newsletters/templates/${id}/duplicate`);
  },

  setTemplateDefault: async (id: string) => {
    return apiClient.patch<TemplateListItem>(`/admin/newsletters/templates/${id}/set-default`);
  },

  regenerateThumbnail: async (id: string) => {
    return apiClient.post<TemplateListItem>(`/admin/newsletters/templates/${id}/thumbnail`);
  },

  uploadImage: async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return apiClient.post<{ url: string }>('/admin/newsletters/upload-image', formData);
  },

  // Product Search
  searchProducts: async (query: ProductSearchQuery = {}) => {
    return apiClient.get<ProductSearchResult>('/admin/newsletters/products/search', query);
  },
};
