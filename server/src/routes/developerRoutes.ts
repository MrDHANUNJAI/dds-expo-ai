import { Router } from 'express';
import {
  getMyApiKeys,
  createApiKey,
  revokeApiKey,
  getMyWebhooks,
  createWebhook,
  updateWebhook,
  deleteWebhook,
  getWebhookLogs,
  testWebhookDelivery,
  getMarketplaceApps,
  getInstalledApps,
  installMarketplaceApp,
  uninstallMarketplaceApp,
  getApiDocs,
} from '../controllers/developerController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

// Public docs
router.get('/docs', getApiDocs);

router.use(authenticate);

// API Keys
router.get('/keys', getMyApiKeys);
router.post('/keys', createApiKey);
router.delete('/keys/:id', revokeApiKey);

// Webhooks
router.get('/webhooks', getMyWebhooks);
router.post('/webhooks', createWebhook);
router.patch('/webhooks/:id', updateWebhook);
router.delete('/webhooks/:id', deleteWebhook);
router.get('/webhooks/:id/logs', getWebhookLogs);
router.post('/webhooks/:id/test', testWebhookDelivery);

// Marketplace Apps & Integrations
router.get('/apps', getMarketplaceApps);
router.get('/apps/installed', getInstalledApps);
router.post('/apps/:appId/install', installMarketplaceApp);
router.delete('/apps/:appId/uninstall', uninstallMarketplaceApp);

export default router;
