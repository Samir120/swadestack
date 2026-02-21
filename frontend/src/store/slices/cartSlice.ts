import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Service, CartItem, PCCartItem, ComponentCartItem } from '../../models/types/service.types';
import { cartApi } from '../../models/api/cartApi';
import type { RootState } from '../store';

/**
 * Cart Slice - ViewModel Layer
 * Manages shopping cart state with server sync
 */

interface CartState {
  items: CartItem[];
  pcItems: PCCartItem[];
  componentItems: ComponentCartItem[];
  totalAmount: number;
  totalItems: number;
  isSyncing: boolean;
}

const CART_STORAGE_KEY = 'cart';

function loadCartFromStorage(): CartState | null {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    if (parsed && Array.isArray(parsed.items) && Array.isArray(parsed.pcItems)) {
      return { ...parsed, componentItems: parsed.componentItems || [], isSyncing: false } as CartState;
    }
    return null;
  } catch {
    return null;
  }
}

function saveCartToStorage(state: CartState): void {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify({
      items: state.items,
      pcItems: state.pcItems,
      componentItems: state.componentItems,
      totalAmount: state.totalAmount,
      totalItems: state.totalItems,
    }));
  } catch {
    // Storage full or unavailable — fail silently
  }
}

const storedCart = loadCartFromStorage();

const initialState: CartState = storedCart ?? {
  items: [],
  pcItems: [],
  componentItems: [],
  totalAmount: 0,
  totalItems: 0,
  isSyncing: false,
};

// Helper function to calculate totals
const calculateTotals = (items: CartItem[], pcItems: PCCartItem[], componentItems: ComponentCartItem[] = []) => {
  const serviceItemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const componentItemCount = componentItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalItems = serviceItemCount + pcItems.length + componentItemCount;
  const serviceAmount = items.reduce(
    (sum, item) => {
      const effectivePrice = item.service.discountPrice ?? item.service.price;
      return sum + effectivePrice * item.quantity;
    },
    0
  );
  const pcAmount = pcItems.reduce((sum, item) => {
    const pc = item.preConfiguredPC;
    const componentPrice = Number(pc.discountedPrice ?? pc.totalPrice) || 0;
    const buildCharge = pc.includesBuildService ? (Number(pc.buildServiceCharge) || 0) : 0;
    return sum + componentPrice + buildCharge;
  }, 0);
  const componentAmount = componentItems.reduce((sum, item) => {
    return sum + item.component.price * item.quantity;
  }, 0);
  return { totalItems, totalAmount: serviceAmount + pcAmount + componentAmount };
};

// Debounce timer for sync
let syncTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Sync cart to server (debounced dispatch helper)
 */
export const syncCartToServer = createAsyncThunk(
  'cart/syncToServer',
  async (_, { getState }) => {
    const state = getState() as RootState;
    const { items, pcItems, componentItems } = state.cart;

    const syncItems = items.map((item) => ({
      serviceId: item.service.id,
      quantity: item.quantity,
      itemData: {
        name_en: item.service.name_en,
        name_sv: item.service.name_sv,
        price: item.service.price,
        discountPrice: item.service.discountPrice,
        currency: item.service.currency,
        category: item.service.category,
        serviceCategoryId: item.service.serviceCategoryId,
        imageUrl: item.service.imageUrl,
      },
    }));

    const syncPCItems = pcItems.map((item) => ({
      pcConfigurationId: item.preConfiguredPC.id,
      itemData: {
        name_en: item.preConfiguredPC.name_en,
        name_sv: item.preConfiguredPC.name_sv,
        totalPrice: item.preConfiguredPC.totalPrice,
        discountedPrice: item.preConfiguredPC.discountedPrice,
        currency: item.preConfiguredPC.currency,
        imageUrl: item.preConfiguredPC.imageUrl,
        tier: item.preConfiguredPC.tier,
        includesBuildService: item.preConfiguredPC.includesBuildService,
        buildServiceCharge: item.preConfiguredPC.buildServiceCharge,
      },
    }));

    const syncComponentItems = componentItems.map((item) => ({
      pcComponentId: item.component.id,
      quantity: item.quantity,
      itemData: {
        componentType: item.component.componentType,
        name_en: item.component.name_en,
        name_sv: item.component.name_sv,
        manufacturer: item.component.manufacturer,
        modelNumber: item.component.modelNumber,
        price: item.component.price,
        currency: item.component.currency,
        imageUrl: item.component.imageUrl,
        stock: item.component.stock,
      },
    }));

    await cartApi.syncCart({ items: syncItems, pcItems: syncPCItems, componentItems: syncComponentItems });
  }
);

/**
 * Fetch server-side cart (on login / rehydrate)
 * Also detects admin force-clear and dispatches clearCart
 */
export const fetchServerCart = createAsyncThunk(
  'cart/fetchServerCart',
  async (_, { dispatch }) => {
    const response = await cartApi.getCart();
    if (!response.success || !response.data) {
      return { items: [], updatedAt: null, forceCleared: false };
    }

    // If admin force-cleared the cart, clear local cart
    // The clearCart action will trigger cartSyncMiddleware to sync empty cart back,
    // which resets the forceCleared flag on the server
    if (response.data.forceCleared) {
      dispatch(clearCart());
    }

    // If admin removed individual items, replace local cart with server state
    // The replaceWithServerCart action will trigger cartSyncMiddleware to sync back,
    // which resets the adminModified flag on the server
    if (response.data.adminModified) {
      dispatch(replaceWithServerCart(response.data.items));
    }

    return response.data;
  }
);

/**
 * Schedule a debounced sync to server
 */
export function scheduleSyncToServer(dispatch: any, getState: () => RootState) {
  const state = getState();
  if (!state.auth.isAuthenticated) return;

  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(() => {
    dispatch(syncCartToServer());
  }, 500);
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<Service>) => {
      const existingItem = state.items.find(
        (item) => item.service.id === action.payload.id
      );

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.items.push({
          service: action.payload,
          quantity: 1,
        });
      }

      const totals = calculateTotals(state.items, state.pcItems, state.componentItems);
      state.totalAmount = totals.totalAmount;
      state.totalItems = totals.totalItems;
      saveCartToStorage(state as CartState);
    },

    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(
        (item) => item.service.id !== action.payload
      );

      const totals = calculateTotals(state.items, state.pcItems, state.componentItems);
      state.totalAmount = totals.totalAmount;
      state.totalItems = totals.totalItems;
      saveCartToStorage(state as CartState);
    },

    updateQuantity: (
      state,
      action: PayloadAction<{ serviceId: string; quantity: number }>
    ) => {
      const item = state.items.find(
        (item) => item.service.id === action.payload.serviceId
      );

      if (item) {
        item.quantity = Math.max(1, action.payload.quantity);
      }

      const totals = calculateTotals(state.items, state.pcItems, state.componentItems);
      state.totalAmount = totals.totalAmount;
      state.totalItems = totals.totalItems;
      saveCartToStorage(state as CartState);
    },

    addPCToCart: (state, action: PayloadAction<PCCartItem>) => {
      const alreadyInCart = state.pcItems.some(
        (item) => item.preConfiguredPC.id === action.payload.preConfiguredPC.id
      );
      if (!alreadyInCart) {
        state.pcItems.push(action.payload);
        const totals = calculateTotals(state.items, state.pcItems, state.componentItems);
        state.totalAmount = totals.totalAmount;
        state.totalItems = totals.totalItems;
        saveCartToStorage(state as CartState);
      }
    },

    removePCFromCart: (state, action: PayloadAction<string>) => {
      state.pcItems = state.pcItems.filter(
        (item) => item.preConfiguredPC.id !== action.payload
      );

      const totals = calculateTotals(state.items, state.pcItems, state.componentItems);
      state.totalAmount = totals.totalAmount;
      state.totalItems = totals.totalItems;
      saveCartToStorage(state as CartState);
    },

    addComponentToCart: (state, action: PayloadAction<ComponentCartItem>) => {
      const existing = state.componentItems.find(
        (item) => item.component.id === action.payload.component.id
      );
      if (existing) {
        existing.quantity += action.payload.quantity;
      } else {
        state.componentItems.push(action.payload);
      }
      const totals = calculateTotals(state.items, state.pcItems, state.componentItems);
      state.totalAmount = totals.totalAmount;
      state.totalItems = totals.totalItems;
      saveCartToStorage(state as CartState);
    },

    removeComponentFromCart: (state, action: PayloadAction<string>) => {
      state.componentItems = state.componentItems.filter(
        (item) => item.component.id !== action.payload
      );
      const totals = calculateTotals(state.items, state.pcItems, state.componentItems);
      state.totalAmount = totals.totalAmount;
      state.totalItems = totals.totalItems;
      saveCartToStorage(state as CartState);
    },

    updateComponentQuantity: (
      state,
      action: PayloadAction<{ componentId: string; quantity: number }>
    ) => {
      const item = state.componentItems.find(
        (item) => item.component.id === action.payload.componentId
      );
      if (item) {
        if (action.payload.quantity < 1) {
          state.componentItems = state.componentItems.filter(
            (i) => i.component.id !== action.payload.componentId
          );
        } else {
          item.quantity = action.payload.quantity;
        }
      }
      const totals = calculateTotals(state.items, state.pcItems, state.componentItems);
      state.totalAmount = totals.totalAmount;
      state.totalItems = totals.totalItems;
      saveCartToStorage(state as CartState);
    },

    clearCart: (state) => {
      state.items = [];
      state.pcItems = [];
      state.componentItems = [];
      state.totalAmount = 0;
      state.totalItems = 0;
      saveCartToStorage(state as CartState);
    },

    mergeServerCart: (state, action: PayloadAction<any[]>) => {
      const serverItems = action.payload;
      for (const sItem of serverItems) {
        if (sItem.serviceId && sItem.itemData) {
          const exists = state.items.some(
            (item) => item.service.id === sItem.serviceId
          );
          if (!exists) {
            state.items.push({
              service: {
                id: sItem.serviceId,
                name_en: sItem.itemData.name_en || '',
                name_sv: sItem.itemData.name_sv || '',
                desc_en: '',
                desc_sv: '',
                price: sItem.itemData.price || 0,
                discountPrice: sItem.itemData.discountPrice || null,
                currency: sItem.itemData.currency || 'SEK',
                category: sItem.itemData.category || '',
                serviceCategoryId: sItem.itemData.serviceCategoryId || null,
                imageUrl: sItem.itemData.imageUrl,
                isActive: true,
              },
              quantity: sItem.quantity || 1,
            });
          }
        } else if (sItem.pcConfigurationId && sItem.itemData) {
          const exists = state.pcItems.some(
            (item) => item.preConfiguredPC.id === sItem.pcConfigurationId
          );
          if (!exists) {
            state.pcItems.push({
              preConfiguredPC: {
                id: sItem.pcConfigurationId,
                name_en: sItem.itemData.name_en,
                name_sv: sItem.itemData.name_sv,
                totalPrice: sItem.itemData.totalPrice || 0,
                discountedPrice: sItem.itemData.discountedPrice,
                currency: sItem.itemData.currency || 'SEK',
                imageUrl: sItem.itemData.imageUrl,
                tier: sItem.itemData.tier,
                components: sItem.itemData.components || [],
                includesBuildService: sItem.itemData.includesBuildService || false,
                buildServiceCharge: sItem.itemData.buildServiceCharge || 0,
              },
              quantity: 1,
            });
          }
        } else if (sItem.pcComponentId && sItem.itemData) {
          const exists = state.componentItems.some(
            (item) => item.component.id === sItem.pcComponentId
          );
          if (!exists) {
            state.componentItems.push({
              component: {
                id: sItem.pcComponentId,
                componentType: sItem.itemData.componentType || '',
                name_en: sItem.itemData.name_en || '',
                name_sv: sItem.itemData.name_sv || '',
                manufacturer: sItem.itemData.manufacturer || '',
                modelNumber: sItem.itemData.modelNumber,
                price: sItem.itemData.price || 0,
                currency: sItem.itemData.currency || 'SEK',
                imageUrl: sItem.itemData.imageUrl,
                stock: sItem.itemData.stock || 0,
              },
              quantity: sItem.quantity || 1,
            });
          }
        }
      }

      const totals = calculateTotals(state.items, state.pcItems, state.componentItems);
      state.totalAmount = totals.totalAmount;
      state.totalItems = totals.totalItems;
      saveCartToStorage(state as CartState);
    },

    replaceWithServerCart: (state, action: PayloadAction<any[]>) => {
      const serverItems = action.payload;
      state.items = [];
      state.pcItems = [];
      state.componentItems = [];

      for (const sItem of serverItems) {
        if (sItem.serviceId && sItem.itemData) {
          state.items.push({
            service: {
              id: sItem.serviceId,
              name_en: sItem.itemData.name_en || '',
              name_sv: sItem.itemData.name_sv || '',
              desc_en: '',
              desc_sv: '',
              price: sItem.itemData.price || 0,
              discountPrice: sItem.itemData.discountPrice || null,
              currency: sItem.itemData.currency || 'SEK',
              category: sItem.itemData.category || '',
              serviceCategoryId: sItem.itemData.serviceCategoryId || null,
              imageUrl: sItem.itemData.imageUrl,
              isActive: true,
            },
            quantity: sItem.quantity || 1,
          });
        } else if (sItem.pcConfigurationId && sItem.itemData) {
          state.pcItems.push({
            preConfiguredPC: {
              id: sItem.pcConfigurationId,
              name_en: sItem.itemData.name_en,
              name_sv: sItem.itemData.name_sv,
              totalPrice: sItem.itemData.totalPrice || 0,
              discountedPrice: sItem.itemData.discountedPrice,
              currency: sItem.itemData.currency || 'SEK',
              imageUrl: sItem.itemData.imageUrl,
              tier: sItem.itemData.tier,
              components: sItem.itemData.components || [],
              includesBuildService: sItem.itemData.includesBuildService || false,
              buildServiceCharge: sItem.itemData.buildServiceCharge || 0,
            },
            quantity: 1,
          });
        } else if (sItem.pcComponentId && sItem.itemData) {
          state.componentItems.push({
            component: {
              id: sItem.pcComponentId,
              componentType: sItem.itemData.componentType || '',
              name_en: sItem.itemData.name_en || '',
              name_sv: sItem.itemData.name_sv || '',
              manufacturer: sItem.itemData.manufacturer || '',
              modelNumber: sItem.itemData.modelNumber,
              price: sItem.itemData.price || 0,
              currency: sItem.itemData.currency || 'SEK',
              imageUrl: sItem.itemData.imageUrl,
              stock: sItem.itemData.stock || 0,
            },
            quantity: sItem.quantity || 1,
          });
        }
      }

      const totals = calculateTotals(state.items, state.pcItems, state.componentItems);
      state.totalAmount = totals.totalAmount;
      state.totalItems = totals.totalItems;
      saveCartToStorage(state as CartState);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(syncCartToServer.pending, (state) => {
        state.isSyncing = true;
      })
      .addCase(syncCartToServer.fulfilled, (state) => {
        state.isSyncing = false;
      })
      .addCase(syncCartToServer.rejected, (state) => {
        state.isSyncing = false;
      });
  },
});

export const { addToCart, removeFromCart, updateQuantity, addPCToCart, removePCFromCart, addComponentToCart, removeComponentFromCart, updateComponentQuantity, clearCart, mergeServerCart, replaceWithServerCart } =
  cartSlice.actions;
export default cartSlice.reducer;
