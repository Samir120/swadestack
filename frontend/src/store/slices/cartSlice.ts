import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Service, CartItem, PCCartItem } from '../../models/types/service.types';

/**
 * Cart Slice - ViewModel Layer
 * Manages shopping cart state
 */

interface CartState {
  items: CartItem[];
  pcItems: PCCartItem[];
  totalAmount: number;
  totalItems: number;
}

const initialState: CartState = {
  items: [],
  pcItems: [],
  totalAmount: 0,
  totalItems: 0,
};

// Helper function to calculate totals
const calculateTotals = (items: CartItem[], pcItems: PCCartItem[]) => {
  const serviceItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalItems = serviceItems + pcItems.length;
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
  return { totalItems, totalAmount: serviceAmount + pcAmount };
};

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

      const totals = calculateTotals(state.items, state.pcItems);
      state.totalAmount = totals.totalAmount;
      state.totalItems = totals.totalItems;
    },

    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(
        (item) => item.service.id !== action.payload
      );

      const totals = calculateTotals(state.items, state.pcItems);
      state.totalAmount = totals.totalAmount;
      state.totalItems = totals.totalItems;
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

      const totals = calculateTotals(state.items, state.pcItems);
      state.totalAmount = totals.totalAmount;
      state.totalItems = totals.totalItems;
    },

    addPCToCart: (state, action: PayloadAction<PCCartItem>) => {
      const alreadyInCart = state.pcItems.some(
        (item) => item.preConfiguredPC.id === action.payload.preConfiguredPC.id
      );
      if (!alreadyInCart) {
        state.pcItems.push(action.payload);
        const totals = calculateTotals(state.items, state.pcItems);
        state.totalAmount = totals.totalAmount;
        state.totalItems = totals.totalItems;
      }
    },

    removePCFromCart: (state, action: PayloadAction<string>) => {
      state.pcItems = state.pcItems.filter(
        (item) => item.preConfiguredPC.id !== action.payload
      );

      const totals = calculateTotals(state.items, state.pcItems);
      state.totalAmount = totals.totalAmount;
      state.totalItems = totals.totalItems;
    },

    clearCart: (state) => {
      state.items = [];
      state.pcItems = [];
      state.totalAmount = 0;
      state.totalItems = 0;
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, addPCToCart, removePCFromCart, clearCart } =
  cartSlice.actions;
export default cartSlice.reducer;
