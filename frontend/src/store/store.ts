import { configureStore, Middleware } from '@reduxjs/toolkit';
import portfolioReducer from './slices/portfolioSlice';
import servicesReducer from './slices/servicesSlice';
import cartReducer, { syncCartToServer } from './slices/cartSlice';
import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';
import siteSettingsReducer from './slices/siteSettingsSlice';
import bannersReducer from './slices/bannerSlice';
import teamReducer from './slices/teamSlice';
import footerReducer from './slices/footerSlice';
import contactReducer from './slices/contactSlice';
import pcComponentsReducer from './slices/pcComponentsSlice';
import pcBuilderReducer from './slices/pcBuilderSlice';
import savedConfigurationsReducer from './slices/savedConfigurationsSlice';
import pcBuildServicesReducer from './slices/pcBuildServicesSlice';
import preConfiguredPCReducer from './slices/preConfiguredPCSlice';
import featuresReducer from './slices/featuresSlice';
import legalSettingsReducer from './slices/legalSettingsSlice';
import vatSettingsReducer from './slices/vatSettingsSlice';
import newsletterReducer from './slices/newsletterSlice';

// Cart sync middleware — automatically syncs to server after any cart mutation
const cartActions = ['cart/addToCart', 'cart/removeFromCart', 'cart/updateQuantity', 'cart/addPCToCart', 'cart/removePCFromCart', 'cart/addComponentToCart', 'cart/removeComponentFromCart', 'cart/updateComponentQuantity', 'cart/clearCart', 'cart/mergeServerCart', 'cart/replaceWithServerCart'];
let cartSyncTimer: ReturnType<typeof setTimeout> | null = null;

const cartSyncMiddleware: Middleware = (storeApi) => (next) => (action: any) => {
  const result = next(action);
  if (cartActions.includes(action.type)) {
    const state = storeApi.getState() as RootState;
    if (state.auth.isAuthenticated) {
      if (cartSyncTimer) clearTimeout(cartSyncTimer);
      cartSyncTimer = setTimeout(() => {
        storeApi.dispatch(syncCartToServer() as any);
      }, 500);
    }
  }
  return result;
};

/**
 * Redux Store Configuration
 * Central state management for the application
 */
export const store = configureStore({
  reducer: {
    portfolio: portfolioReducer,
    services: servicesReducer,
    cart: cartReducer,
    auth: authReducer,
    ui: uiReducer,
    siteSettings: siteSettingsReducer,
    banners: bannersReducer,
    team: teamReducer,
    footer: footerReducer,
    contact: contactReducer,
    pcComponents: pcComponentsReducer,
    pcBuilder: pcBuilderReducer,
    savedConfigurations: savedConfigurationsReducer,
    pcBuildServices: pcBuildServicesReducer,
    preConfiguredPC: preConfiguredPCReducer,
    features: featuresReducer,
    legalSettings: legalSettingsReducer,
    vatSettings: vatSettingsReducer,
    newsletter: newsletterReducer,
  },
  devTools: !import.meta.env.PROD,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(cartSyncMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
