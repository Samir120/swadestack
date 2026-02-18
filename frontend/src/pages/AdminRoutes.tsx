import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthViewModel } from '../viewmodels/authViewModel';
import AdminLayout from '../components/admin/AdminLayout';
import Dashboard from '../components/admin/Dashboard';
import Statistics from '../components/admin/Statistics';
import PortfolioManager from '../components/admin/PortfolioManager';
import ServicesManager from '../components/admin/ServicesManager';
import OrderList from '../components/admin/OrderList';
import SiteSettingsManager from '../components/admin/SiteSettingsManager';
import TeamMembersManager from '../components/admin/TeamMembersManager';
import BannersManager from '../components/admin/BannerManager';
import FooterCategoriesManager from '../components/admin/FooterCategoriesManager';
import FooterPagesManager from '../components/admin/FooterPagesManager';
import ContactMessagesManager from '../components/admin/ContactMessagesManager';
import PCComponentsManager from '../components/admin/PCComponentsManager';
import PCConfigurationsManager from '../components/admin/PCConfigurationsManager';
import PCBuildServicesManager from '../components/admin/PCBuildServicesManager';
import PreConfiguredPCManager from '../components/admin/PreConfiguredPCManager';
import ServiceCategoriesManager from '../components/admin/ServiceCategoriesManager';
import FeaturesManager from '../components/admin/FeaturesManager';
import LegalSettingsManager from '../components/admin/LegalSettingsManager';
import CouponsManager from '../components/admin/CouponsManager';
import NotificationBannerManager from '../components/admin/NotificationBannerManager';
import VatSettingsManager from '../components/admin/VatSettingsManager';

const AdminRoutes: React.FC = () => {
  const { isAuthenticated, isLoading, isAdmin } = useAuthViewModel();

  // Wait for auth check to complete before deciding to redirect
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Check authentication and admin role
  if (!isAuthenticated || !isAdmin()) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="statistics" element={<Statistics />} />
        <Route path="portfolio" element={<PortfolioManager />} />
        <Route path="services" element={<ServicesManager />} />
        <Route path="service-categories" element={<ServiceCategoriesManager />} />
        <Route path="features" element={<FeaturesManager />} />
        <Route path="orders" element={<OrderList />} />
        <Route path="coupons" element={<CouponsManager />} />
        <Route path="contact-messages" element={<ContactMessagesManager />} />
        <Route path="settings" element={<SiteSettingsManager />} />
        <Route path="legal-settings" element={<LegalSettingsManager />} />
        <Route path="vat-settings" element={<VatSettingsManager />} />
        <Route path="banners" element={<BannersManager />} />
        <Route path="team-members" element={<TeamMembersManager />} />
        <Route path="footer-categories" element={<FooterCategoriesManager />} />
        <Route path="footer-pages" element={<FooterPagesManager />} />
        <Route path="pc-components" element={<PCComponentsManager />} />
        <Route path="pc-configurations" element={<PCConfigurationsManager />} />
        <Route path="pc-build-services" element={<PCBuildServicesManager />} />
        <Route path="pre-configured-pcs" element={<PreConfiguredPCManager />} />
        <Route path="notification-banners" element={<NotificationBannerManager />} />
      </Route>
    </Routes>
  );
};

export default AdminRoutes;
