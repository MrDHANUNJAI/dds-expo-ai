import { Router } from 'express';
import {
  getAdminOverview,
  listAdminUsers,
  toggleUserSuspension,
  getAdminAuditLogs,
} from '../controllers/adminController';
import {
  getFinanceOverview,
  getAdminTransactions,
  getAdminPayouts,
  updateAdminPayout,
  getAdminRefunds,
  updateAdminRefund,
  getAdminReconciliation,
  getFinanceSettings,
  updateFinanceSettings,
} from '../controllers/adminFinanceController';
import {
  getAdminReports,
  resolveAdminReport,
  getAdminDisputes,
  resolveAdminDispute,
  getAdminReviews,
  updateAdminReviewStatus,
  getAdminSupportTickets,
  assignAdminSupportTicket,
  getModerationOverview,
  restrictUser,
  getAdminFAQs,
  createAdminFAQ,
  updateAdminFAQ,
  deleteAdminFAQ,
} from '../controllers/adminModerationController';
import { authenticate, requireRole } from '../middleware/authMiddleware';

const router = Router();

// Protect all admin routes: Authentication + ADMIN role
router.use(authenticate);
router.use(requireRole('ADMIN'));

// Core Admin
router.get('/overview', getAdminOverview);
router.get('/users', listAdminUsers);
router.put('/users/:userId/suspend', toggleUserSuspension);
router.get('/audit-logs', getAdminAuditLogs);

// Finance Desk
router.get('/finance/overview', getFinanceOverview);
router.get('/finance/transactions', getAdminTransactions);
router.get('/finance/payouts', getAdminPayouts);
router.put('/finance/payouts/:id', updateAdminPayout);
router.get('/finance/refunds', getAdminRefunds);
router.put('/finance/refunds/:id', updateAdminRefund);
router.get('/finance/reconciliation', getAdminReconciliation);
router.get('/finance/settings', getFinanceSettings);
router.put('/finance/settings', updateFinanceSettings);

// Trust, Moderation, Disputes & Support
router.get('/moderation', getModerationOverview);
router.post('/users/:userId/restrict', restrictUser);
router.get('/reports', getAdminReports);
router.post('/reports/:id/resolve', resolveAdminReport);
router.get('/disputes', getAdminDisputes);
router.post('/disputes/:id/resolve', resolveAdminDispute);
router.get('/reviews', getAdminReviews);
router.post('/reviews/:id/status', updateAdminReviewStatus);
router.get('/support', getAdminSupportTickets);
router.post('/support/:id/assign', assignAdminSupportTicket);

// FAQ Management
router.get('/faq', getAdminFAQs);
router.post('/faq', createAdminFAQ);
router.put('/faq/:id', updateAdminFAQ);
router.delete('/faq/:id', deleteAdminFAQ);

export default router;
