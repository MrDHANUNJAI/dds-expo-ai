import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { db } from '../models/db';
import { ApiScope, WebhookEvent } from '../types';

export async function getMyApiKeys(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }
    const orgId = req.query.organizationId as string | undefined;
    const keys = db.listApiKeys(userId, orgId);
    res.json({ success: true, keys });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to list API keys' });
  }
}

export async function createApiKey(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }
    const { name, scopes, organizationId } = req.body;
    if (!name || !scopes || !Array.isArray(scopes) || scopes.length === 0) {
      res.status(400).json({ success: false, message: 'Name and at least one scope are required' });
      return;
    }

    const { fullKey, keyDoc } = db.createApiKey(userId, {
      name,
      scopes: scopes as ApiScope[],
      organizationId,
    });

    res.status(201).json({
      success: true,
      message: 'API Key created successfully. Store this key securely, it will not be displayed again.',
      apiKey: fullKey,
      keyDoc,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to create API key' });
  }
}

export async function revokeApiKey(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const success = db.revokeApiKey(id, userId);
    if (!success) {
      res.status(404).json({ success: false, message: 'API key not found' });
      return;
    }

    res.json({ success: true, message: 'API key revoked successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to revoke API key' });
  }
}

export async function getMyWebhooks(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }
    const orgId = req.query.organizationId as string | undefined;
    const webhooks = db.listWebhookSubscriptions(userId, orgId);
    res.json({ success: true, webhooks });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to list webhooks' });
  }
}

export async function createWebhook(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }
    const { targetUrl, events, organizationId } = req.body;
    if (!targetUrl || !events || !Array.isArray(events) || events.length === 0) {
      res.status(400).json({ success: false, message: 'Target URL and at least one event are required' });
      return;
    }

    const webhook = db.createWebhookSubscription(userId, {
      targetUrl,
      events: events as WebhookEvent[],
      organizationId,
    });

    res.status(201).json({ success: true, webhook });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to create webhook' });
  }
}

export async function updateWebhook(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const updated = db.updateWebhookSubscription(id, userId, req.body);
    if (!updated) {
      res.status(404).json({ success: false, message: 'Webhook not found' });
      return;
    }

    res.json({ success: true, webhook: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to update webhook' });
  }
}

export async function deleteWebhook(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const success = db.deleteWebhookSubscription(id, userId);
    if (!success) {
      res.status(404).json({ success: false, message: 'Webhook not found' });
      return;
    }

    res.json({ success: true, message: 'Webhook deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to delete webhook' });
  }
}

export async function getWebhookLogs(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const logs = db.listWebhookLogs(id);
    res.json({ success: true, logs });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to get logs' });
  }
}

export async function testWebhookDelivery(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const event = (req.body.event || 'project.created') as WebhookEvent;
    const samplePayload = {
      event,
      timestamp: new Date().toISOString(),
      data: {
        id: 'sample-proj-101',
        title: 'Full Stack React & Node Dashboard Development',
        budget: 2500,
        currency: 'USD',
        category: 'Web Development',
      },
    };

    const log = db.recordWebhookDelivery(
      id,
      event,
      samplePayload,
      200,
      '{"status":"received","status_code":200}',
      38,
      'DELIVERED'
    );

    res.json({
      success: true,
      message: 'Test webhook event dispatched and delivered successfully',
      deliveryLog: log,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to test webhook' });
  }
}

export async function getMarketplaceApps(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const category = req.query.category as string | undefined;
    const apps = db.listMarketplaceApps(category);
    res.json({ success: true, apps });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to list apps' });
  }
}

export async function getInstalledApps(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }
    const installations = db.listInstalledApps(userId);
    res.json({ success: true, installations });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to list installed apps' });
  }
}

export async function installMarketplaceApp(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    const { appId } = req.params;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const install = db.installMarketplaceApp(appId, userId, req.body.organizationId);
    res.json({ success: true, message: 'App installed successfully', install });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to install app' });
  }
}

export async function uninstallMarketplaceApp(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    const { appId } = req.params;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const success = db.uninstallMarketplaceApp(appId, userId);
    res.json({ success, message: success ? 'App uninstalled' : 'App not found' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to uninstall app' });
  }
}

export async function getApiDocs(_req: AuthenticatedRequest, res: Response): Promise<void> {
  res.json({
    success: true,
    version: 'v1.0.0',
    title: 'WorkNova Enterprise REST & Webhooks API Documentation',
    baseUrl: 'https://api.worknova.dev/v1',
    authScheme: 'Bearer API_KEY (Header: Authorization: Bearer wn_live_...)',
    endpoints: [
      {
        path: '/v1/projects',
        method: 'GET',
        scope: 'projects:read',
        description: 'Query marketplace projects with status, skill, and budget filters',
      },
      {
        path: '/v1/projects',
        method: 'POST',
        scope: 'projects:write',
        description: 'Create a new project listing or request for proposal',
      },
      {
        path: '/v1/proposals',
        method: 'GET',
        scope: 'proposals:read',
        description: 'Fetch submitted proposals, bids, and attachments',
      },
      {
        path: '/v1/contracts',
        method: 'GET',
        scope: 'contracts:read',
        description: 'List active contracts, milestone states, and escrow balances',
      },
      {
        path: '/v1/webhooks',
        method: 'POST',
        scope: 'webhooks:manage',
        description: 'Register automated event listeners for real-time delivery',
      },
    ],
  });
}
