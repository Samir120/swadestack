import { Router } from 'express';
import footerController from '../controllers/FooterController';
import { authenticate, requireAdmin } from '../../middleware/authMiddleware';

const router = Router();

// ===============================
// Public Routes
// ===============================

// Get active footer structure (public)
router.get('/structure', footerController.getFooterStructure);

// Get active pages (public)
router.get('/pages', footerController.getActivePages);

// Get page by URL (public)
router.get('/page-by-url', footerController.getPageByUrl);

// Get all pages (including inactive) - admin (must be before /:id)
router.get('/pages/all', authenticate, requireAdmin, footerController.getAllPages);

// Get page by ID (public)
router.get('/pages/:id', footerController.getPageById);

// ===============================
// Admin Routes - Footer Categories
// ===============================

// Get all categories with pages (admin)
router.get('/categories', authenticate, requireAdmin, footerController.getAllCategories);

// Get category by ID (admin)
router.get('/categories/:id', authenticate, requireAdmin, footerController.getCategoryById);

// Create new category (admin)
router.post('/categories', authenticate, requireAdmin, footerController.createCategory);

// Update category (admin)
router.put('/categories/:id', authenticate, requireAdmin, footerController.updateCategory);

// Delete category (admin)
router.delete('/categories/:id', authenticate, requireAdmin, footerController.deleteCategory);

// Toggle category active status (admin)
router.patch(
  '/categories/:id/toggle-active',
  authenticate,
  requireAdmin,
  footerController.toggleCategoryActive
);

// Update category order (admin)
router.patch(
  '/categories/:id/order',
  authenticate,
  requireAdmin,
  footerController.updateCategoryOrder
);

// ===============================
// Admin Routes - Footer Pages
// ===============================

// Get pages by category ID (admin)
router.get(
  '/pages/category/:categoryId',
  authenticate,
  requireAdmin,
  footerController.getPagesByCategoryId
);

// Create new page (admin)
router.post('/pages', authenticate, requireAdmin, footerController.createPage);

// Update page (admin)
router.put('/pages/:id', authenticate, requireAdmin, footerController.updatePage);

// Delete page (admin)
router.delete('/pages/:id', authenticate, requireAdmin, footerController.deletePage);

// Toggle page active status (admin)
router.patch(
  '/pages/:id/toggle-active',
  authenticate,
  requireAdmin,
  footerController.togglePageActive
);

// Update page order (admin)
router.patch('/pages/:id/order', authenticate, requireAdmin, footerController.updatePageOrder);

export default router;
