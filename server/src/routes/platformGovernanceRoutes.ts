import { Router } from 'express';
import {
  getIncidents,
  createIncident,
  updateIncident,
  getMarketplaceHealthReport,
  getCustomReports,
  createCustomReport,
  deleteCustomReport,
  exportPlatformAuditArchive,
} from '../controllers/platformGovernanceController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

// Public status page & health
router.get('/incidents', getIncidents);
router.get('/health', getMarketplaceHealthReport);

// Authenticated reporting
router.get('/reports', authenticate, getCustomReports);
router.post('/reports', authenticate, createCustomReport);
router.delete('/reports/:id', authenticate, deleteCustomReport);

// Admin-only Governance
router.post('/incidents', authenticate, createIncident);
router.patch('/incidents/:id', authenticate, updateIncident);
router.get('/audit-archive', authenticate, exportPlatformAuditArchive);

export default router;
