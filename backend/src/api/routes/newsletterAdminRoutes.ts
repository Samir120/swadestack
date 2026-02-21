import { Router } from 'express';
import newsletterAdminController from '../controllers/newsletterAdminController';
import { authenticate, requireAdmin } from '../../middleware/authMiddleware';
import { upload } from '../../middleware/upload';

const router = Router();
const auth = [authenticate, requireAdmin];

// Dashboard
router.get('/dashboard', ...auth, newsletterAdminController.getDashboard);

// Campaigns
router.get('/campaigns', ...auth, newsletterAdminController.getCampaigns);
router.post('/campaigns', ...auth, newsletterAdminController.createCampaign);
router.get('/campaigns/:id', ...auth, newsletterAdminController.getCampaignById);
router.put('/campaigns/:id', ...auth, newsletterAdminController.updateCampaign);
router.delete('/campaigns/:id', ...auth, newsletterAdminController.deleteCampaign);
router.post('/campaigns/:id/duplicate', ...auth, newsletterAdminController.duplicateCampaign);
router.post('/campaigns/:id/cancel', ...auth, newsletterAdminController.cancelCampaign);
router.get('/campaigns/:id/validate', ...auth, newsletterAdminController.validateCampaign);
router.post('/campaigns/:id/send', ...auth, newsletterAdminController.sendCampaign);
router.post('/campaigns/:id/schedule', ...auth, newsletterAdminController.scheduleCampaign);
router.post('/campaigns/:id/send-test', ...auth, newsletterAdminController.sendTestEmail);
router.get('/campaigns/:id/report', ...auth, newsletterAdminController.getCampaignReport);
router.get('/campaigns/:id/recipients', ...auth, newsletterAdminController.getCampaignRecipients);

// Subscribers
router.get('/subscribers', ...auth, newsletterAdminController.getSubscribers);
router.get('/subscribers/export', ...auth, newsletterAdminController.exportSubscribers);
router.post('/subscribers', ...auth, newsletterAdminController.createSubscriber);
router.get('/subscribers/:id', ...auth, newsletterAdminController.getSubscriberById);
router.put('/subscribers/:id', ...auth, newsletterAdminController.updateSubscriber);
router.delete('/subscribers/:id', ...auth, newsletterAdminController.deleteSubscriber);

// Segments
router.get('/segments', ...auth, newsletterAdminController.getSegments);
router.post('/segments', ...auth, newsletterAdminController.createSegment);
router.put('/segments/:id', ...auth, newsletterAdminController.updateSegment);
router.delete('/segments/:id', ...auth, newsletterAdminController.deleteSegment);
router.post('/segments/:id/members', ...auth, newsletterAdminController.addSegmentMembers);
router.post('/segments/:id/members/remove', ...auth, newsletterAdminController.removeSegmentMembers);

// Product Search
router.get('/products/search', ...auth, newsletterAdminController.searchProducts);

// Templates
router.get('/templates', ...auth, newsletterAdminController.getTemplates);
router.post('/templates', ...auth, newsletterAdminController.createTemplate);
router.get('/templates/:id', ...auth, newsletterAdminController.getTemplateById);
router.put('/templates/:id', ...auth, newsletterAdminController.updateTemplate);
router.delete('/templates/:id', ...auth, newsletterAdminController.deleteTemplate);
router.post('/templates/:id/duplicate', ...auth, newsletterAdminController.duplicateTemplate);
router.patch('/templates/:id/set-default', ...auth, newsletterAdminController.setTemplateDefault);
router.post('/templates/:id/thumbnail', ...auth, newsletterAdminController.regenerateThumbnail);

// Image upload
router.post('/upload-image', ...auth, upload.single('image'), newsletterAdminController.uploadImage);

export default router;
