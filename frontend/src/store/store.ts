import { configureStore } from '@reduxjs/toolkit';
import portfolioReducer from './slices/portfolioSlice';
import servicesReducer from './slices/servicesSlice';
import cartReducer from './slices/cartSlice';
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
  },
  devTools: !import.meta.env.PROD,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
