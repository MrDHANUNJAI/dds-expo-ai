import http from 'http';
import express from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

// Route handlers
import authRoutes from './server/src/routes/authRoutes';
import freelancerRoutes from './server/src/routes/freelancerRoutes';
import sellerRoutes from './server/src/routes/sellerRoutes';
import adminRoutes from './server/src/routes/adminRoutes';
import projectRoutes from './server/src/routes/projectRoutes';
import proposalRoutes from './server/src/routes/proposalRoutes';
import categoryRoutes from './server/src/routes/categoryRoutes';
import savedProjectRoutes from './server/src/routes/savedProjectRoutes';
import paymentRoutes from './server/src/routes/paymentRoutes';
import contractRoutes from './server/src/routes/contractRoutes';
import milestoneRoutes from './server/src/routes/milestoneRoutes';
import walletRoutes from './server/src/routes/walletRoutes';
import withdrawalRoutes from './server/src/routes/withdrawalRoutes';
import invoiceRoutes from './server/src/routes/invoiceRoutes';
import refundRoutes from './server/src/routes/refundRoutes';
import conversationRoutes from './server/src/routes/conversationRoutes';
import notificationRoutes from './server/src/routes/notificationRoutes';
import reviewRoutes from './server/src/routes/reviewRoutes';
import reportRoutes from './server/src/routes/reportRoutes';
import disputeRoutes from './server/src/routes/disputeRoutes';
import supportRoutes from './server/src/routes/supportRoutes';
import searchRoutes from './server/src/routes/searchRoutes';
import securityRoutes from './server/src/routes/securityRoutes';
import verificationRoutes from './server/src/routes/verificationRoutes';
import aiRoutes from './server/src/routes/aiRoutes';
import automationRoutes from './server/src/routes/automationRoutes';
import organizationRoutes from './server/src/routes/organizationRoutes';
import subscriptionRoutes from './server/src/routes/subscriptionRoutes';
import collaborationRoutes from './server/src/routes/collaborationRoutes';
import reputationRoutes from './server/src/routes/reputationRoutes';
import referralRoutes from './server/src/routes/referralRoutes';
import i18nRoutes from './server/src/routes/i18nRoutes';
import developerRoutes from './server/src/routes/developerRoutes';
import agentRoutes from './server/src/routes/agentRoutes';
import assessmentRoutes from './server/src/routes/assessmentRoutes';
import platformGovernanceRoutes from './server/src/routes/platformGovernanceRoutes';

import { db } from './server/src/models/db';
import { config } from './server/src/config';
import { initSocketService } from './server/src/services/socketService';

async function startServer() {
  const app = express();
  const PORT = config.port;

  // Create HTTP Server for Socket.IO integration
  const httpServer = http.createServer(app);

  // Initialize Realtime WebSocket Service
  initSocketService(httpServer);

  // Body parsing and cookies
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // Uploads directory static serving
  if (!fs.existsSync(config.uploadsDir)) {
    fs.mkdirSync(config.uploadsDir, { recursive: true });
  }
  app.use('/uploads', express.static(config.uploadsDir));

  // Ensure default development users and marketplace data are seeded
  await db.seedDefaultUsersIfEmpty();

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/freelancers', freelancerRoutes);
  app.use('/api/sellers', sellerRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/projects', projectRoutes);
  app.use('/api/proposals', proposalRoutes);
  app.use('/api/categories', categoryRoutes);
  app.use('/api/saved-projects', savedProjectRoutes);

  // Phase 5 Financial Routes
  app.use('/api/payments', paymentRoutes);
  app.use('/api/contracts', contractRoutes);
  app.use('/api/milestones', milestoneRoutes);
  app.use('/api/wallet', walletRoutes);
  app.use('/api/withdrawals', withdrawalRoutes);
  app.use('/api/invoices', invoiceRoutes);
  app.use('/api/refunds', refundRoutes);

  // Phase 6 Communication & Trust Routes
  app.use('/api/conversations', conversationRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/reviews', reviewRoutes);
  app.use('/api/reports', reportRoutes);
  app.use('/api/disputes', disputeRoutes);
  app.use('/api/support', supportRoutes);

  // Phase 7 Verification, Security & Intelligence Routes
  app.use('/api/search', searchRoutes);
  app.use('/api/security', securityRoutes);
  app.use('/api/verification', verificationRoutes);

  // Phase 8 AI, Automation & Production Layer
  app.use('/api/ai', aiRoutes);
  app.use('/api/automation', automationRoutes);

  // Phase 9 Teams, Subscriptions, Enterprise & Monetization
  app.use('/api/organizations', organizationRoutes);
  app.use('/api/subscriptions', subscriptionRoutes);
  app.use('/api/collaboration', collaborationRoutes);
  app.use('/api/reputation', reputationRoutes);
  app.use('/api/referrals', referralRoutes);
  app.use('/api/i18n', i18nRoutes);

  // Phase 10 Marketplace OS, AI Orchestrator & Ecosystem
  app.use('/api/developer', developerRoutes);
  app.use('/api/agents', agentRoutes);
  app.use('/api/assessments', assessmentRoutes);
  app.use('/api/governance', platformGovernanceRoutes);

  // Health and readiness endpoints
  app.get(['/health', '/ready', '/api/health'], (_req, res) => {
    res.json({
      status: 'ok',
      service: 'worknova-core',
      uptime: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    });
  });

  // Global API error handler
  app.use('/api', (err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('Unhandled API error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Internal server error',
      code: 'INTERNAL_ERROR',
    });
  });

  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`WorkNova full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
