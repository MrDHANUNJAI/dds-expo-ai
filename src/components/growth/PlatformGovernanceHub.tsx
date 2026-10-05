import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Activity,
  BarChart3,
  FileText,
  Download,
  CheckCircle2,
  AlertTriangle,
  Clock,
  TrendingUp,
  RefreshCw,
  Plus,
} from 'lucide-react';
import {
  ecosystemApi,
  IncidentItem,
  HealthReportItem,
} from '../../services/ecosystemApi';

export const PlatformGovernanceHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'health' | 'incidents' | 'reports'>('health');

  const [healthReport, setHealthReport] = useState<HealthReportItem | null>(null);
  const [incidents, setIncidents] = useState<IncidentItem[]>([]);
  const [customReports, setCustomReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New Custom Report Modal
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportName, setReportName] = useState('');
  const [reportType, setReportType] = useState('FINANCIAL');
  const [reportFormat, setReportFormat] = useState('CSV');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [hRes, iRes, rRes] = await Promise.all([
        ecosystemApi.getMarketplaceHealth(),
        ecosystemApi.getIncidents(),
        ecosystemApi.getCustomReports(),
      ]);

      if (hRes.success) setHealthReport(hRes.report);
      if (iRes.success) setIncidents(iRes.incidents || []);
      if (rRes.success) setCustomReports(rRes.reports || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportName) return;

    try {
      const res = await ecosystemApi.createCustomReport({
        name: reportName,
        type: reportType,
        format: reportFormat,
        filters: { dateRange: 'LAST_30_DAYS' },
      });

      if (res.success && res.report) {
        setCustomReports((prev) => [res.report, ...prev]);
        setShowReportModal(false);
        setReportName('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportAudit = async () => {
    try {
      const res = await ecosystemApi.exportAuditArchive();
      if (res.success && res.archive) {
        const blob = new Blob([JSON.stringify(res.archive, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `worknova_compliance_audit_${Date.now()}.json`;
        a.click();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-950 rounded-2xl p-6 lg:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs font-semibold uppercase tracking-wider mb-4 border border-blue-500/30">
            <Activity className="w-3.5 h-3.5" />
            Marketplace OS & Governance Center
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-white mb-2">
            Platform Health, Incidents & Enterprise Intelligence
          </h1>
          <p className="text-gray-300 text-sm lg:text-base leading-relaxed">
            Monitor real-time platform liquidity, category supply-demand balance, system uptime status, and generate compliance audit trails.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab('health')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'health'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Marketplace Health & Liquidity
        </button>

        <button
          onClick={() => setActiveTab('incidents')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'incidents'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          Service Status & Incidents ({incidents.length})
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'reports'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          Custom Enterprise Reports ({customReports.length})
        </button>
      </div>

      {/* TAB 1: MARKETPLACE HEALTH & LIQUIDITY */}
      {activeTab === 'health' && healthReport && (
        <div className="space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm space-y-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Overall Health Score</span>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-gray-900">{healthReport.overallHealthScore}%</span>
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-md">Optimal</span>
              </div>
              <p className="text-xs text-gray-500">99.98% platform API availability</p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm space-y-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Supply / Demand Ratio</span>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-indigo-600">{healthReport.supplyDemandRatio}x</span>
                <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-md">Healthy</span>
              </div>
              <p className="text-xs text-gray-500">Balanced contractor availability</p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm space-y-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Median Time to Hire</span>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-emerald-600">{healthReport.medianTimeToHireHours} hrs</span>
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-md">-18% vs avg</span>
              </div>
              <p className="text-xs text-gray-500">From project post to contract signature</p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm space-y-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Dispute Rate</span>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-gray-900">{healthReport.disputeRatePercent}%</span>
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-md">Ultra Low</span>
              </div>
              <p className="text-xs text-gray-500">Milestones protected by escrow</p>
            </div>
          </div>

          {/* Category Liquidity Signals */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-base font-bold text-gray-900 mb-1">Category Liquidity & Demand Surge Signals</h3>
            <p className="text-xs text-gray-500 mb-4">
              Algorithmic supply checks to identify specialized talent shortages and surge pricing trends.
            </p>

            <div className="space-y-3">
              {healthReport.liquidityAlerts.map((alert, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-gray-100 bg-gray-50/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-gray-900 text-sm">{alert.category}</span>
                      <span
                        className={`px-2 py-0.5 text-xs font-bold rounded-md ${
                          alert.status === 'SHORTAGE'
                            ? 'bg-amber-100 text-amber-800'
                            : alert.status === 'SURPLUS'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {alert.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">{alert.message}</p>
                  </div>

                  <div className="flex items-center gap-4 text-xs shrink-0">
                    <span className="text-emerald-700 font-semibold">Demand: +{alert.demandChangePercent}%</span>
                    <span className="text-indigo-700 font-semibold">Supply: +{alert.supplyChangePercent}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INCIDENTS & UPTIME */}
      {activeTab === 'incidents' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                Global System Status Timeline
              </h3>
              <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-3 py-1 rounded-full">
                99.98% 30-Day Uptime
              </span>
            </div>

            <div className="space-y-4">
              {incidents.map((inc) => (
                <div key={inc.id} className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 text-sm">{inc.title}</span>
                        <span className="px-2 py-0.5 text-xs bg-emerald-100 text-emerald-800 font-semibold rounded">
                          {inc.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{inc.service}</p>
                    </div>
                    <span className="text-xs text-gray-400 font-mono">
                      {new Date(inc.startedAt).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-xs text-gray-700 leading-relaxed">{inc.summary}</p>

                  {inc.timeline && inc.timeline.length > 0 && (
                    <div className="pt-2 border-t border-gray-200 space-y-1">
                      {inc.timeline.map((t, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-[11px] text-gray-500 font-mono">
                          <Clock className="w-3 h-3 text-gray-400" />
                          <span>{t.message}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CUSTOM ENTERPRISE REPORTS */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-gray-900 text-base">Custom Enterprise Reports & Export Center</h3>
              <p className="text-xs text-gray-500">
                Generate consolidated financial ledger extracts, contractor 1099 compliance summaries, and team utilization reports.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportAudit}
                className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                Export SOC2 / ISO Audit
              </button>
              <button
                onClick={() => setShowReportModal(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                New Report
              </button>
            </div>
          </div>

          {customReports.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-gray-300">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h4 className="font-bold text-gray-900 text-sm">No custom reports configured</h4>
              <p className="text-xs text-gray-500 max-w-sm mx-auto mb-4">
                Schedule recurring financial extracts or on-demand contractor compliance archives.
              </p>
              <button
                onClick={() => setShowReportModal(true)}
                className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl"
              >
                Configure First Report
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="divide-y divide-gray-100">
                {customReports.map((rep) => (
                  <div key={rep.id} className="p-4 flex items-center justify-between gap-4 hover:bg-gray-50/50">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-blue-50 text-blue-700 rounded-xl">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm">{rep.name}</h4>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span className="font-semibold">{rep.type}</span>
                          <span>•</span>
                          <span className="font-mono uppercase">{rep.format}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => alert(`Report downloaded in ${rep.format} format.`)}
                      className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL: CREATE REPORT */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <h3 className="text-base font-bold text-gray-900 mb-1">Create Custom Report</h3>
            <p className="text-xs text-gray-500 mb-4">
              Configure parameters for periodic or immediate dataset export.
            </p>

            <form onSubmit={handleCreateReport} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Report Title
                </label>
                <input
                  type="text"
                  required
                  value={reportName}
                  onChange={(e) => setReportName(e.target.value)}
                  placeholder="e.g., Q4 2026 Contractor Disbursements & Tax Invoices"
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Dataset Category
                </label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="FINANCIAL">Financial Ledger & Escrow Disbursements</option>
                  <option value="PROJECT_PERFORMANCE">Project Delivery Velocities & Milestones</option>
                  <option value="TEAM_UTILIZATION">Organization & Agency Seat Utilization</option>
                  <option value="COMPLIANCE">Tax Compliance (1099 / W-8BEN Records)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Format
                </label>
                <select
                  value={reportFormat}
                  onChange={(e) => setReportFormat(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="CSV">CSV (Comma-Separated Spreadsheet)</option>
                  <option value="JSON">JSON (Machine-Readable Stream)</option>
                  <option value="PDF">PDF (Executive Summary)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="px-4 py-2 text-xs font-medium text-gray-600 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm"
                >
                  Generate Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
