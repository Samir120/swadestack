import { Router } from 'express';
import portfolioRoutes from './portfolioRoutes';
import servicesRoutes from './servicesRoutes';
import ordersRoutes from './ordersRoutes';
import authRoutes from './authRoutes';
import settingsRoutes from './settingsRoutes';
import userDashboardRoutes from './userDashboardRoutes';
import bannersRoutes from './bannersRoutes';
import teamMembersRoutes from './teamMembersRoutes';
import emailRoutes from './emailRoutes';
import newsletterRoutes from './newsletterRoutes';
import contactRoutes from './contactRoutes';
import footerRoutes from './footerRoutes';
import pcComponentRoutes from './pcComponentRoutes';
import pcConfigurationRoutes from './pcConfigurationRoutes';
import pcBuildServiceRoutes from './pcBuildServiceRoutes';
import serviceCategoryRoutes from './serviceCategoryRoutes';
import featuresRoutes from './featuresRoutes';
import legalSettingsRoutes from './legalSettingsRoutes';
import couponsRoutes from './couponsRoutes';
import notificationBannersRoutes from './notificationBannersRoutes';
import vatSettingsRoutes from './vatSettingsRoutes';
import customerRoutes from './customerRoutes';
import cartRoutes from './cartRoutes';
import newsletterAdminRoutes from './newsletterAdminRoutes';
import storeSettingsRoutes from './storeSettingsRoutes';

const router = Router();

// API routes
router.use('/portfolio', portfolioRoutes);
router.use('/services', servicesRoutes);
router.use('/service-categories', serviceCategoryRoutes);
router.use('/orders', ordersRoutes);
router.use('/auth', authRoutes);
router.use('/settings', settingsRoutes);
router.use('/user', userDashboardRoutes);
router.use('/banners', bannersRoutes);
router.use('/team', teamMembersRoutes);
router.use('/email', emailRoutes);
router.use('/newsletter', newsletterRoutes);
router.use('/contact', contactRoutes);
router.use('/footer', footerRoutes);
router.use('/pc-components', pcComponentRoutes);
router.use('/pc-configurations', pcConfigurationRoutes);
router.use('/pc-build-services', pcBuildServiceRoutes);
router.use('/features', featuresRoutes);
router.use('/legal-settings', legalSettingsRoutes);
router.use('/coupons', couponsRoutes);
router.use('/notification-banners', notificationBannersRoutes);
router.use('/vat-settings', vatSettingsRoutes);
router.use('/admin/customers', customerRoutes);
router.use('/admin/newsletters', newsletterAdminRoutes);
router.use('/cart', cartRoutes);
router.use('/store-settings', storeSettingsRoutes);

// Health check
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

export default router;
