import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  addToCart,
  removeFromCart,
  updateQuantity,
  addPCToCart,
  removePCFromCart,
  addComponentToCart,
  removeComponentFromCart,
  updateComponentQuantity,
  clearCart,
} from '../store/slices/cartSlice';
import { Service, PCCartItem, ComponentCartItem } from '../models/types/service.types';
import { PCConfiguration } from '../models/types/pcConfiguration.types';
import { useVatRate } from '../hooks/useVatRate';
import { netToGross } from '../utils/vat';

/**
 * Cart ViewModel - Business Logic Layer
 * Handles shopping cart business logic and state management
 * Connects View (Components) to Model (API)
 * Note: Server sync is handled automatically by cartSyncMiddleware in store.ts
 */

export const useCartViewModel = () => {
  const dispatch = useAppDispatch();
  const { items, pcItems, componentItems, totalAmount, totalItems } = useAppSelector(
    (state) => state.cart
  );
  const vatRate = useVatRate();

  /**
   * Add service to cart
   */
  const addServiceToCart = (service: Service) => {
    dispatch(addToCart(service));
  };

  /**
   * Remove service from cart
   */
  const removeServiceFromCart = (serviceId: string) => {
    dispatch(removeFromCart(serviceId));
  };

  /**
   * Update item quantity
   */
  const changeQuantity = (serviceId: string, quantity: number) => {
    if (quantity < 1) {
      removeServiceFromCart(serviceId);
    } else {
      dispatch(updateQuantity({ serviceId, quantity }));
    }
  };

  /**
   * Increment item quantity
   */
  const incrementQuantity = (serviceId: string) => {
    const item = items.find((i) => i.service.id === serviceId);
    if (item) {
      changeQuantity(serviceId, item.quantity + 1);
    }
  };

  /**
   * Decrement item quantity
   */
  const decrementQuantity = (serviceId: string) => {
    const item = items.find((i) => i.service.id === serviceId);
    if (item) {
      changeQuantity(serviceId, item.quantity - 1);
    }
  };

  /**
   * Clear all items from cart
   */
  const emptyCart = () => {
    dispatch(clearCart());
  };

  /**
   * Add pre-configured PC to cart
   */
  const addPCToCartAction = (pc: PCConfiguration) => {
    const pcCartItem: PCCartItem = {
      preConfiguredPC: {
        id: pc.id,
        name_en: pc.name_en,
        name_sv: pc.name_sv,
        totalPrice: Number(pc.totalPrice) || 0,
        discountedPrice: pc.discountedPrice != null ? Number(pc.discountedPrice) : undefined,
        currency: pc.currency,
        imageUrl: pc.imageUrl,
        tier: pc.tier,
        components: pc.components,
        includesBuildService: pc.includesBuildService,
        buildServiceCharge: Number(pc.buildServiceCharge) || 0,
      },
      quantity: 1,
    };
    dispatch(addPCToCart(pcCartItem));
  };

  /**
   * Remove pre-configured PC from cart
   */
  const removePCFromCartAction = (pcId: string) => {
    dispatch(removePCFromCart(pcId));
  };

  /**
   * Check if pre-configured PC is in cart
   */
  const isPCInCart = (pcId: string): boolean => {
    return pcItems.some((item) => item.preConfiguredPC.id === pcId);
  };

  /**
   * Add PC component to cart
   */
  const addComponentToCartAction = (component: ComponentCartItem['component'], quantity = 1) => {
    if (component.stock <= 0) return;
    const existing = componentItems.find((i) => i.component.id === component.id);
    if (existing && existing.quantity + quantity > component.stock) return;
    dispatch(addComponentToCart({ component, quantity }));
  };

  /**
   * Remove PC component from cart
   */
  const removeComponentFromCartAction = (componentId: string) => {
    dispatch(removeComponentFromCart(componentId));
  };

  /**
   * Update PC component quantity
   */
  const changeComponentQuantity = (componentId: string, quantity: number) => {
    if (quantity < 1) {
      removeComponentFromCartAction(componentId);
    } else {
      dispatch(updateComponentQuantity({ componentId, quantity }));
    }
  };

  /**
   * Increment component quantity
   */
  const incrementComponentQuantity = (componentId: string) => {
    const item = componentItems.find((i) => i.component.id === componentId);
    if (item && item.quantity < item.component.stock) {
      changeComponentQuantity(componentId, item.quantity + 1);
    }
  };

  /**
   * Decrement component quantity
   */
  const decrementComponentQuantity = (componentId: string) => {
    const item = componentItems.find((i) => i.component.id === componentId);
    if (item) {
      changeComponentQuantity(componentId, item.quantity - 1);
    }
  };

  /**
   * Check if component is in cart
   */
  const isComponentInCart = (componentId: string): boolean => {
    return componentItems.some((item) => item.component.id === componentId);
  };

  /**
   * Get component quantity in cart
   */
  const getComponentQuantity = (componentId: string): number => {
    const item = componentItems.find((i) => i.component.id === componentId);
    return item ? item.quantity : 0;
  };

  /**
   * Check if service is in cart
   */
  const isInCart = (serviceId: string): boolean => {
    return items.some((item) => item.service.id === serviceId);
  };

  /**
   * Get quantity of a service in cart
   */
  const getQuantity = (serviceId: string): number => {
    const item = items.find((i) => i.service.id === serviceId);
    return item ? item.quantity : 0;
  };

  /**
   * Format total amount with currency
   */
  const formatTotal = (currency = 'SEK'): string => {
    const formatter = new Intl.NumberFormat('sv-SE', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    return formatter.format(netToGross(totalAmount, vatRate));
  };

  /**
   * Calculate item subtotal
   */
  const getItemSubtotal = (serviceId: string): number => {
    const item = items.find((i) => i.service.id === serviceId);
    if (!item) return 0;
    const effectivePrice = item.service.discountPrice ?? item.service.price;
    return effectivePrice * item.quantity;
  };

  /**
   * Format item subtotal with currency
   */
  const formatItemSubtotal = (serviceId: string, currency = 'SEK'): string => {
    const subtotal = getItemSubtotal(serviceId);
    const formatter = new Intl.NumberFormat('sv-SE', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    return formatter.format(netToGross(subtotal, vatRate));
  };

  /**
   * Check if cart is empty
   */
  const isEmpty = (): boolean => {
    return items.length === 0 && pcItems.length === 0 && componentItems.length === 0;
  };

  /**
   * Get cart summary for checkout
   */
  const getCheckoutSummary = () => {
    return {
      items: items.map((item) => {
        const effectivePrice = item.service.discountPrice ?? item.service.price;
        return {
          serviceId: item.service.id,
          serviceName: item.service.name_en,
          quantity: item.quantity,
          price: effectivePrice,
          subtotal: effectivePrice * item.quantity,
        };
      }),
      totalItems,
      totalAmount,
      currency: items[0]?.service.currency || 'SEK',
    };
  };

  /**
   * Prepare order data for API
   */
  const prepareOrderData = (customerInfo: {
    email: string;
    firstName: string;
    lastName: string;
    address?: string;
    city?: string;
    postalCode?: string;
    country?: string;
  }) => {
    const data: any = {
      ...customerInfo,
      items: items.map((item) => ({
        serviceId: item.service.id,
        quantity: item.quantity,
      })),
    };
    if (componentItems.length > 0) {
      data.componentItems = componentItems.map((ci) => ({
        pcComponentId: ci.component.id,
        quantity: ci.quantity,
      }));
    }
    return data;
  };

  return {
    // State
    items,
    pcItems,
    componentItems,
    totalAmount,
    totalItems,

    // Actions
    addServiceToCart,
    removeServiceFromCart,
    changeQuantity,
    incrementQuantity,
    decrementQuantity,
    emptyCart,
    addPCToCart: addPCToCartAction,
    removePCFromCart: removePCFromCartAction,
    addComponentToCart: addComponentToCartAction,
    removeComponentFromCart: removeComponentFromCartAction,
    changeComponentQuantity,
    incrementComponentQuantity,
    decrementComponentQuantity,

    // Business Logic
    isInCart,
    isPCInCart,
    isComponentInCart,
    getQuantity,
    getComponentQuantity,
    formatTotal,
    getItemSubtotal,
    formatItemSubtotal,
    isEmpty,
    getCheckoutSummary,
    prepareOrderData,
  };
};

export default useCartViewModel;
