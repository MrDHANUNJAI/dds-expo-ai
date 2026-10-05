import React, { useState, useEffect } from 'react';
import {
  Code,
  Key,
  Webhook,
  Layers,
  Plus,
  Trash2,
  Copy,
  Check,
  Send,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Clock,
  Sparkles,
  Terminal,
} from 'lucide-react';
import {
  ecosystemApi,
  ApiKeyItem,
  WebhookItem,
  WebhookLogItem,
  MarketplaceAppItem,
  ApiScope,
  WebhookEvent,
} from '../../services/ecosystemApi';

const AVAILABLE_SCOPES: { id: ApiScope; label: string; desc: string }[] = [
  { id: 'projects:read', label: 'projects:read', desc: 'Read marketplace projects and requirements' },
  { id: 'projects:write', label: 'projects:write', desc: 'Create and update project postings' },
  { id: 'proposals:read', label: 'proposals:read', desc: 'View submitted proposals and bids' },
  { id: 'proposals:write', label: 'proposals:write', desc: 'Submit and withdraw proposals' },
  { id: 'contracts:read', label: 'contracts:read', desc: 'View active contracts and milestone state' },
  { id: 'contracts:write', label: 'contracts:write', desc: 'Manage milestone submissions and releases' },
  { id: 'messages:read', label: 'messages:read', desc: 'Read conversation transcripts and notifications' },
  { id: 'messages:write', label: 'messages:write', desc: 'Send direct messages and workspace updates' },
  { id: 'analytics:read', label: 'analytics:read', desc: 'Access financial and performance metrics' },
  { id: 'webhooks:manage', label: 'webhooks:manage', desc: 'Manage webhook endpoints and subscriptions' },
];

const AVAILABLE_EVENTS: { id: WebhookEvent; label: string }[] = [
  { id: 'project.created', label: 'project.created' },
  { id: 'project.updated', label: 'project.updated' },
  { id: 'proposal.created', label: 'proposal.created' },
  { id: 'proposal.accepted', label: 'proposal.accepted' },
  { id: 'contract.created', label: 'contract.created' },
  { id: 'milestone.funded', label: 'milestone.funded' },
  { id: 'milestone.released', label: 'milestone.released' },
  { id: 'delivery.submitted', label: 'delivery.submitted' },
  { id: 'payment.completed', label: 'payment.completed' },
  { id: 'review.created', label: 'review.created' },
  { id: 'dispute.opened', label: 'dispute.opened' },
];

export const DeveloperPortal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'keys' | 'webhooks' | 'apps' | 'docs'>('keys');

  // State
  const [keys, setKeys] = useState<ApiKeyItem[]>([]);
  const [webhooks, setWebhooks] = useState<WebhookItem[]>([]);
  const [apps, setApps] = useState<MarketplaceAppItem[]>([]);
  const [installedApps, setInstalledApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals & Forms
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [selectedScopes, setSelectedScopes] = useState<ApiScope[]>(['projects:read', 'proposals:read']);
  const [createdSecret, setCreatedSecret] = useState<string | null>(null);

  const [showWebhookModal, setShowWebhookModal] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<WebhookEvent[]>([
    'project.created',
    'proposal.created',
    'contract.created',
  ]);

  const [inspectingWebhookId, setInspectingWebhookId] = useState<string | null>(null);
  const [webhookLogs, setWebhookLogs] = useState<WebhookLogItem[]>([]);
  const [testingWebhook, setTestingWebhook] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [kRes, wRes, aRes, instRes] = await Promise.all([
        ecosystemApi.getMyApiKeys(),
        ecosystemApi.getMyWebhooks(),
        ecosystemApi.getMarketplaceApps(),
        ecosystemApi.getInstalledApps(),
      ]);

      if (kRes.success) setKeys(kRes.keys || []);
      if (wRes.success) setWebhooks(wRes.webhooks || []);
      if (aRes.success) setApps(aRes.apps || []);
      if (instRes.success) setInstalledApps(instRes.installations || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName || selectedScopes.length === 0) return;

    try {
      const res = await ecosystemApi.createApiKey({
        name: newKeyName,
        scopes: selectedScopes,
      });

      if (res.success && res.apiKey) {
        setCreatedSecret(res.apiKey);
        setKeys((prev) => [res.keyDoc, ...prev]);
        setNewKeyName('');
        setSelectedScopes(['projects:read', 'proposals:read']);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRevokeKey = async (id: string) => {
    if (!confirm('Are you sure you want to revoke this API key? This cannot be undone.')) return;
    try {
      const res = await ecosystemApi.revokeApiKey(id);
      if (res.success) {
        setKeys((prev) => prev.map((k) => (k.id === id ? { ...k, status: 'REVOKED' } : k)));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!webhookUrl || selectedEvents.length === 0) return;

    try {
      const res = await ecosystemApi.createWebhook({
        targetUrl: webhookUrl,
        events: selectedEvents,
      });

      if (res.success && res.webhook) {
        setWebhooks((prev) => [res.webhook, ...prev]);
        setShowWebhookModal(false);
        setWebhookUrl('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteWebhook = async (id: string) => {
    if (!confirm('Delete this webhook endpoint?')) return;
    try {
      const res = await ecosystemApi.deleteWebhook(id);
      if (res.success) {
        setWebhooks((prev) => prev.filter((w) => w.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleInspectLogs = async (id: string) => {
    setInspectingWebhookId(id);
    try {
      const res = await ecosystemApi.getWebhookLogs(id);
      if (res.success) {
        setWebhookLogs(res.logs || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTestPing = async (id: string) => {
    setTestingWebhook(true);
    try {
      const res = await ecosystemApi.testWebhook(id, 'project.created');
      if (res.success && res.deliveryLog) {
        setWebhookLogs((prev) => [res.deliveryLog, ...prev]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTestingWebhook(false);
    }
  };

  const handleToggleApp = async (appId: string) => {
    const isInstalled = installedApps.some((i) => i.appId === appId && i.status === 'ACTIVE');
    try {
      if (isInstalled) {
        await ecosystemApi.uninstallApp(appId);
        setInstalledApps((prev) => prev.filter((i) => i.appId !== appId));
      } else {
        const res = await ecosystemApi.installApp(appId);
        if (res.success && res.message) {
          setInstalledApps((prev) => [...prev, { appId, status: 'ACTIVE', installedAt: new Date().toISOString() }]);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-gray-900 via-indigo-950 to-slate-900 rounded-2xl p-6 lg:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-xs font-semibold uppercase tracking-wider mb-4 border border-indigo-500/30">
            <Code className="w-3.5 h-3.5" />
            Developer Platform v1
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-white mb-2">
            API Keys, Webhooks & Ecosystem Apps
          </h1>
          <p className="text-gray-300 text-sm lg:text-base leading-relaxed">
            Build customized integrations, automate candidate sourcing, sync milestone deliverables with GitHub/Jira, and stream real-time marketplace webhooks to your enterprise stack.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab('keys')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'keys'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <Key className="w-4 h-4" />
          API Keys ({keys.filter((k) => k.status === 'ACTIVE').length})
        </button>

        <button
          onClick={() => setActiveTab('webhooks')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'webhooks'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <Webhook className="w-4 h-4" />
          Webhooks & Endpoints ({webhooks.length})
        </button>

        <button
          onClick={() => setActiveTab('apps')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'apps'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          Marketplace Integrations ({apps.length})
        </button>

        <button
          onClick={() => setActiveTab('docs')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'docs'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <Terminal className="w-4 h-4" />
          API Explorer & Docs
        </button>
      </div>

      {/* TAB 1: API KEYS */}
      {activeTab === 'keys' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Personal & Organization API Keys</h2>
              <p className="text-sm text-gray-500">
                Use Bearer tokens to access WorkNova REST API endpoints securely.
              </p>
            </div>
            <button
              onClick={() => {
                setShowKeyModal(true);
                setCreatedSecret(null);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              Generate New API Key
            </button>
          </div>

          {loading ? (
            <div className="p-12 text-center text-gray-500 bg-white rounded-2xl border border-gray-100">
              Loading API keys...
            </div>
          ) : keys.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-gray-300">
              <Key className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-gray-900">No active API keys yet</h3>
              <p className="text-sm text-gray-500 max-w-sm mx-auto mb-4">
                Generate your first API key to connect your automated scripts, CI/CD pipelines, or external apps.
              </p>
              <button
                onClick={() => setShowKeyModal(true)}
                className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700"
              >
                Create API Key
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600">
                  <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-500 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3.5">Name</th>
                      <th className="px-6 py-3.5">Key Prefix</th>
                      <th className="px-6 py-3.5">Scopes</th>
                      <th className="px-6 py-3.5">Rate Limit</th>
                      <th className="px-6 py-3.5">Status</th>
                      <th className="px-6 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {keys.map((k) => (
                      <tr key={k.id} className="hover:bg-gray-50/50">
                        <td className="px-6 py-4 font-semibold text-gray-900">{k.name}</td>
                        <td className="px-6 py-4 font-mono text-xs text-gray-700 bg-gray-50 rounded px-2 py-1 inline-block my-2">
                          {k.keyPrefix}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {k.scopes.map((s) => (
                              <span
                                key={s}
                                className="px-2 py-0.5 text-xs bg-indigo-50 text-indigo-700 rounded-md font-medium"
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs text-gray-500">{k.rateLimitPerMin} req / min</td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              k.status === 'ACTIVE'
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-red-50 text-red-700'
                            }`}
                          >
                            {k.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {k.status === 'ACTIVE' && (
                            <button
                              onClick={() => handleRevokeKey(k.id)}
                              className="text-red-600 hover:text-red-800 text-xs font-medium hover:underline inline-flex items-center gap-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Revoke
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: WEBHOOKS */}
      {activeTab === 'webhooks' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Webhook Subscriptions</h2>
              <p className="text-sm text-gray-500">
                Receive instant HTTPS POST payloads when marketplace lifecycle events occur.
              </p>
            </div>
            <button
              onClick={() => setShowWebhookModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Webhook Endpoint
            </button>
          </div>

          {webhooks.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-gray-300">
              <Webhook className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-gray-900">No webhooks configured</h3>
              <p className="text-sm text-gray-500 max-w-sm mx-auto mb-4">
                Configure an HTTPS endpoint to automatically receive milestone updates, proposal alerts, and payment confirmations.
              </p>
              <button
                onClick={() => setShowWebhookModal(true)}
                className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700"
              >
                Add Endpoint
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Webhooks list */}
              <div className="lg:col-span-2 space-y-4">
                {webhooks.map((w) => (
                  <div
                    key={w.id}
                    className={`bg-white rounded-2xl p-5 border transition-all ${
                      inspectingWebhookId === w.id
                        ? 'border-indigo-500 ring-2 ring-indigo-100 shadow-md'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-semibold text-gray-900 break-all">
                            {w.targetUrl}
                          </span>
                          <span className="px-2 py-0.5 text-xs bg-emerald-50 text-emerald-700 font-semibold rounded-full">
                            {w.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 font-mono mt-1">Secret: {w.secret.slice(0, 10)}••••••••</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleTestPing(w.id)}
                          disabled={testingWebhook}
                          className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-lg inline-flex items-center gap-1.5 transition-colors"
                        >
                          <Send className="w-3.5 h-3.5" />
                          {testingWebhook ? 'Sending...' : 'Test Ping'}
                        </button>
                        <button
                          onClick={() => handleInspectLogs(w.id)}
                          className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-medium rounded-lg inline-flex items-center gap-1.5 transition-colors"
                        >
                          <Clock className="w-3.5 h-3.5" />
                          Logs
                        </button>
                        <button
                          onClick={() => handleDeleteWebhook(w.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-2 border-t border-gray-100">
                      {w.events.map((e) => (
                        <span
                          key={e}
                          className="px-2.5 py-0.5 text-xs bg-slate-100 text-slate-700 font-medium rounded-md font-mono"
                        >
                          {e}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Delivery Logs Panel */}
              <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm flex flex-col h-full min-h-[350px]">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                  <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                    <Clock className="w-4 h-4 text-indigo-600" />
                    Delivery Activity Logs
                  </h3>
                  <span className="text-xs text-gray-400">{webhookLogs.length} events logged</span>
                </div>

                {webhookLogs.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-gray-400 text-xs">
                    <Terminal className="w-8 h-8 mb-2 opacity-50" />
                    Select a webhook and click "Test Ping" or "Logs" to inspect delivery headers and response payloads.
                  </div>
                ) : (
                  <div className="space-y-3 overflow-y-auto max-h-[480px] pr-1">
                    {webhookLogs.map((log) => (
                      <div key={log.id} className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-semibold text-gray-800">{log.event}</span>
                          <span
                            className={`px-2 py-0.5 font-bold rounded ${
                              log.statusCode === 200 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                            }`}
                          >
                            HTTP {log.statusCode || 200} ({log.durationMs || 35}ms)
                          </span>
                        </div>
                        <p className="text-gray-400 text-[11px]">{new Date(log.createdAt).toLocaleTimeString()}</p>
                        <pre className="bg-gray-900 text-emerald-400 p-2 rounded text-[11px] overflow-x-auto font-mono">
                          {JSON.stringify(log.payload, null, 2)}
                        </pre>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: MARKETPLACE APPS */}
      {activeTab === 'apps' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Ecosystem Integrations & Marketplace Apps</h2>
            <p className="text-sm text-gray-500">
              One-click connectors to streamline proposal management, continuous delivery verification, and financial accounting.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {apps.map((app) => {
              const isInstalled = installedApps.some((i) => i.appId === app.id && i.status === 'ACTIVE');
              return (
                <div
                  key={app.id}
                  className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col justify-between hover:shadow-lg transition-all"
                >
                  <div>
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <img
                        src={app.iconUrl}
                        alt={app.name}
                        className="w-12 h-12 rounded-xl object-cover border border-gray-100 shadow-sm"
                      />
                      <span className="px-2.5 py-1 text-xs bg-indigo-50 text-indigo-700 font-semibold rounded-full uppercase tracking-wider">
                        {app.category}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-gray-900 mb-1">{app.name}</h3>
                    <p className="text-xs text-indigo-600 font-medium mb-3">{app.tagline}</p>
                    <p className="text-sm text-gray-600 line-clamp-3 mb-4">{app.description}</p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs text-gray-400 pt-4 border-t border-gray-100 mb-4">
                      <span>★ {app.rating} rating</span>
                      <span>{app.installsCount.toLocaleString()} installs</span>
                    </div>

                    <button
                      onClick={() => handleToggleApp(app.id)}
                      className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all ${
                        isInstalled
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-red-50 hover:text-red-700 hover:border-red-200'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
                      }`}
                    >
                      {isInstalled ? 'Connected (Click to Disconnect)' : 'Install & Connect'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: API EXPLORER & DOCS */}
      {activeTab === 'docs' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-2">WorkNova Core REST API v1 Specification</h2>
            <p className="text-sm text-gray-600 mb-6">
              All requests must include the header: <code className="bg-gray-100 px-2 py-0.5 rounded font-mono text-indigo-600">Authorization: Bearer wn_live_...</code>
            </p>

            <div className="space-y-4">
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 flex items-center gap-3 border-b border-gray-200">
                  <span className="px-2 py-0.5 bg-blue-600 text-white font-mono text-xs font-bold rounded">GET</span>
                  <span className="font-mono text-sm font-semibold text-gray-900">/api/projects</span>
                  <span className="text-xs text-gray-500 ml-auto">Scope: projects:read</span>
                </div>
                <div className="p-4 bg-gray-950 text-gray-200 font-mono text-xs overflow-x-auto">
                  <p className="text-gray-400"># Example cURL Request</p>
                  <p className="text-emerald-400">curl -X GET "https://api.worknova.dev/v1/projects?category=Web%20Development&limit=10" \</p>
                  <p className="text-emerald-400">  -H "Authorization: Bearer wn_live_a1b2c3d4e5f6..."</p>
                </div>
              </div>

              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 flex items-center gap-3 border-b border-gray-200">
                  <span className="px-2 py-0.5 bg-emerald-600 text-white font-mono text-xs font-bold rounded">POST</span>
                  <span className="font-mono text-sm font-semibold text-gray-900">/api/projects</span>
                  <span className="text-xs text-gray-500 ml-auto">Scope: projects:write</span>
                </div>
                <div className="p-4 bg-gray-950 text-gray-200 font-mono text-xs overflow-x-auto">
                  <p className="text-gray-400"># Create Project Request Body</p>
                  <p className="text-emerald-400">curl -X POST "https://api.worknova.dev/v1/projects" \</p>
                  <p className="text-emerald-400">  -H "Authorization: Bearer wn_live_a1b2c3d4e5f6..." \</p>
                  <p className="text-emerald-400">  -H "Content-Type: application/json" \</p>
                  <p className="text-emerald-400">  -d '&#123;"title": "React Mobile App", "budget": 3500, "category": "Mobile & Devices"&#125;'</p>
                </div>
              </div>

              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 flex items-center gap-3 border-b border-gray-200">
                  <span className="px-2 py-0.5 bg-purple-600 text-white font-mono text-xs font-bold rounded">POST</span>
                  <span className="font-mono text-sm font-semibold text-gray-900">/api/agents/tasks/run</span>
                  <span className="text-xs text-gray-500 ml-auto">AI Orchestrator API</span>
                </div>
                <div className="p-4 bg-gray-950 text-gray-200 font-mono text-xs overflow-x-auto">
                  <p className="text-gray-400"># Execute AI Agent Action</p>
                  <p className="text-emerald-400">curl -X POST "https://api.worknova.dev/v1/agents/tasks/run" \</p>
                  <p className="text-emerald-400">  -H "Authorization: Bearer wn_live_a1b2c3d4e5f6..." \</p>
                  <p className="text-emerald-400">  -H "Content-Type: application/json" \</p>
                  <p className="text-emerald-400">  -d '&#123;"agentType": "PROJECT_AGENT", "actionName": "auto_scope", "inputPrompt": "Build an escrow fintech MVP"&#125;'</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CREATE API KEY */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Create API Key</h3>
            <p className="text-sm text-gray-500 mb-4">
              Select key permissions and give it an identifiable name.
            </p>

            {createdSecret ? (
              <div className="space-y-4">
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <div className="flex items-center gap-2 text-emerald-800 font-semibold text-sm mb-1">
                    <Check className="w-4 h-4" />
                    Key Generated Successfully
                  </div>
                  <p className="text-xs text-emerald-700">
                    Copy your API key now. For your security, it will never be displayed again.
                  </p>
                </div>

                <div className="p-3 bg-gray-900 rounded-xl flex items-center justify-between gap-2">
                  <code className="font-mono text-xs text-emerald-400 break-all">{createdSecret}</code>
                  <button
                    onClick={() => copyToClipboard(createdSecret)}
                    className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shrink-0"
                  >
                    {copiedKey ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedKey ? 'Copied' : 'Copy'}
                  </button>
                </div>

                <button
                  onClick={() => {
                    setShowKeyModal(false);
                    setCreatedSecret(null);
                  }}
                  className="w-full py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreateKey} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Key Identifier Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="e.g., Production CI/CD Runner or Zapier Bot"
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Access Scopes
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
                    {AVAILABLE_SCOPES.map((sc) => {
                      const checked = selectedScopes.includes(sc.id);
                      return (
                        <label
                          key={sc.id}
                          className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                            checked
                              ? 'border-indigo-500 bg-indigo-50/50 text-indigo-900 font-semibold'
                              : 'border-gray-200 text-gray-600 hover:border-gray-300'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => {
                              setSelectedScopes((prev) =>
                                checked ? prev.filter((s) => s !== sc.id) : [...prev, sc.id]
                              );
                            }}
                            className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                          />
                          <div>
                            <p className="font-mono">{sc.label}</p>
                            <p className="text-[11px] text-gray-500 font-normal">{sc.desc}</p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowKeyModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-sm"
                  >
                    Generate Key
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL: ADD WEBHOOK */}
      {showWebhookModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Add Webhook Endpoint</h3>
            <p className="text-sm text-gray-500 mb-4">
              Enter your HTTPS callback URL to receive real-time JSON event notifications.
            </p>

            <form onSubmit={handleCreateWebhook} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Destination URL
                </label>
                <input
                  type="url"
                  required
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://yourserver.com/api/webhooks/worknova"
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Subscribed Events
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
                  {AVAILABLE_EVENTS.map((ev) => {
                    const checked = selectedEvents.includes(ev.id);
                    return (
                      <label
                        key={ev.id}
                        className={`flex items-center gap-2 p-2 rounded-xl border text-xs cursor-pointer font-mono ${
                          checked
                            ? 'border-indigo-500 bg-indigo-50/50 text-indigo-900 font-semibold'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {
                            setSelectedEvents((prev) =>
                              checked ? prev.filter((e) => e !== ev.id) : [...prev, ev.id]
                            );
                          }}
                          className="rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        {ev.label}
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowWebhookModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-sm"
                >
                  Save Webhook
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
