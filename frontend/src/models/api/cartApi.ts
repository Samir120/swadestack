import apiClient from './apiClient';

interface SyncCartData {
  items: Array<{
    serviceId: string;
    quantity: number;
    itemData: Record<string, any>;
  }>;
  pcItems: Array<{
    pcConfigurationId: string;
    itemData: Record<string, any>;
  }>;
  componentItems?: Array<{
    pcComponentId: string;
    quantity: number;
    itemData: Record<string, any>;
  }>;
}

interface ServerCartItem {
  id: string;
  serviceId: string | null;
  pcConfigurationId: string | null;
  pcComponentId: string | null;
  quantity: number;
  itemData: Record<string, any>;
}

interface ServerCart {
  items: ServerCartItem[];
  updatedAt: string | null;
  forceCleared: boolean;
  adminModified: boolean;
}

export const cartApi = {
  syncCart: async (data: SyncCartData) => {
    return apiClient.put('/cart/sync', data);
  },

  getCart: async () => {
    return apiClient.get<ServerCart>('/cart');
  },
};
