import React, { useState, useEffect } from 'react';
import {
  Bot,
  Sparkles,
  Shield,
  CheckCircle2,
  XCircle,
  Clock,
  Play,
  Layers,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  Zap,
} from 'lucide-react';
import {
  ecosystemApi,
  AIAgentType,
  AIAgentTaskItem,
} from '../../services/ecosystemApi';

interface AgentDef {
  type: AIAgentType;
  name: string;
  roleTag: string;
  description: string;
  icon: string;
  color: string;
  presetPrompts: string[];
}

const AGENTS: AgentDef[] = [
  {
    type: 'PROJECT_AGENT',
    name: 'Project Architect Agent',
    roleTag: 'Seller / Client',
    description: 'Auto-scopes project requirements, generates structured milestones, and recommends optimal budget ranges.',
    icon: '🏗️',
    color: 'from-blue-600 to-indigo-600',
    presetPrompts: [
      'Scope a Next.js 15 & Supabase SaaS MVP with subscription billing',
      'Break down a React Native iOS & Android fitness tracking application into 4 milestone deliverables',
      'Estimate optimal budget and timeline for a high-traffic AI chat application',
    ],
  },
  {
    type: 'FREELANCER_AGENT',
    name: 'Freelancer Win-Rate Agent',
    roleTag: 'Freelancer / Agency',
    description: 'Generates high-converting proposal pitches, analyzes competitor bid pricing, and selects best portfolio proofs.',
    icon: '🚀',
    color: 'from-emerald-600 to-teal-600',
    presetPrompts: [
      'Write a high-converting technical pitch for a Fintech React project',
      'Optimize my hourly rate benchmark for a 3-month Senior Full-Stack role',
      'Highlight my verified skill badges in an enterprise proposal cover letter',
    ],
  },
  {
    type: 'SELLER_AGENT',
    name: 'Client Hiring Screener Agent',
    roleTag: 'Seller / Enterprise',
    description: 'Ranks incoming proposal bids, identifies talent risk signals, and drafts customized technical interview questions.',
    icon: '🎯',
    color: 'from-purple-600 to-pink-600',
    presetPrompts: [
      'Analyze 5 candidate proposals and generate a shortlisting matrix',
      'Draft 4 in-depth technical screening questions for a backend Node.js contractor',
      'Review milestone deliverable against scope specifications before escrow release',
    ],
  },
  {
    type: 'MATCHING_AGENT',
    name: 'Semantic Matcher Agent',
    roleTag: 'Platform Ecosystem',
    description: 'Calculates multi-vector compatibility across skill sets, timezone overlap, and historical delivery velocity.',
    icon: '⚡',
    color: 'from-amber-500 to-orange-600',
    presetPrompts: [
      'Compute compatibility score between my freelancer profile and Project #102',
      'Analyze talent market supply for full-stack TypeScript engineers in GMT-5',
    ],
  },
  {
    type: 'SUPPORT_AGENT',
    name: 'Dispute & Policy Triage Agent',
    roleTag: 'Trust & Safety',
    description: 'Reviews contract terms, analyzes evidence files, and suggests fair dispute resolution agreements.',
    icon: '⚖️',
    color: 'from-cyan-600 to-blue-700',
    presetPrompts: [
      'Triage a milestone delivery revision dispute under platform TOS Section 8',
      'Synthesize escrow fund release guidelines for completed deliverables',
    ],
  },
  {
    type: 'RISK_AGENT',
    name: 'Risk & Fraud Intelligence Agent',
    roleTag: 'Enterprise / Admin',
    description: 'Scans for anomalous transaction velocity, IP geolocation mismatches, and anti-circumvention indicators.',
    icon: '🛡️',
    color: 'from-rose-600 to-red-700',
    presetPrompts: [
      'Run comprehensive trust & compliance audit on new contractor account',
      'Verify contractor tax residency and international payment compliance',
    ],
  },
];

export const AIAgentOrchestrator: React.FC = () => {
  const [selectedAgent, setSelectedAgent] = useState<AgentDef>(AGENTS[0]);
  const [promptText, setPromptText] = useState(AGENTS[0].presetPrompts[0]);
  const [riskLevel, setRiskLevel] = useState<'LOW_RISK' | 'MEDIUM_RISK' | 'HIGH_RISK'>('LOW_RISK');

  const [running, setRunning] = useState(false);
  const [activeTask, setActiveTask] = useState<AIAgentTaskItem | null>(null);
  const [allTasks, setAllTasks] = useState<AIAgentTaskItem[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [filterTab, setFilterTab] = useState<'all' | 'pending' | 'completed'>('all');

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    setLoadingTasks(true);
    try {
      const res = await ecosystemApi.listAgentTasks();
      if (res.success) {
        setAllTasks(res.tasks || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingTasks(false);
    }
  };

  const handleRunAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptText.trim()) return;

    setRunning(true);
    try {
      const res = await ecosystemApi.runAgentTask({
        agentType: selectedAgent.type,
        actionName: `execute_${selectedAgent.type.toLowerCase()}`,
        inputPrompt: promptText,
        riskLevel,
      });

      if (res.success && res.task) {
        setActiveTask(res.task);
        setAllTasks((prev) => [res.task, ...prev]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRunning(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const res = await ecosystemApi.approveAgentTask(id);
      if (res.success && res.task) {
        setAllTasks((prev) => prev.map((t) => (t.id === id ? res.task : t)));
        if (activeTask?.id === id) setActiveTask(res.task);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt('Please specify a rejection reason:', 'Requires manual review');
    if (!reason) return;

    try {
      const res = await ecosystemApi.rejectAgentTask(id, reason);
      if (res.success && res.task) {
        setAllTasks((prev) => prev.map((t) => (t.id === id ? res.task : t)));
        if (activeTask?.id === id) setActiveTask(res.task);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredTasks = allTasks.filter((t) => {
    if (filterTab === 'pending') return t.approvalStatus === 'PENDING_APPROVAL';
    if (filterTab === 'completed') return t.executionStatus === 'COMPLETED';
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-indigo-950 rounded-2xl p-6 lg:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs font-semibold uppercase tracking-wider mb-4 border border-purple-500/30">
            <Bot className="w-3.5 h-3.5" />
            Controlled Agent Orchestration Engine
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-white mb-2">
            AI Agents & Human-Approved Automations
          </h1>
          <p className="text-gray-300 text-sm lg:text-base leading-relaxed">
            Deploy specialized task-bounded AI agents to accelerate candidate sourcing, scope milestones, optimize pitch win-rates, and enforce governance rules with strict human approval gates.
          </p>
        </div>
      </div>

      {/* Agents Selector Grid */}
      <div>
        <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-600" />
          Select AI Agent Capability
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {AGENTS.map((agent) => {
            const isSelected = selectedAgent.type === agent.type;
            return (
              <button
                key={agent.type}
                onClick={() => {
                  setSelectedAgent(agent);
                  setPromptText(agent.presetPrompts[0]);
                  setRiskLevel(agent.type === 'RISK_AGENT' ? 'HIGH_RISK' : 'LOW_RISK');
                }}
                className={`p-5 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? 'border-purple-500 ring-2 ring-purple-100 shadow-md bg-white'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-2xl">{agent.icon}</span>
                    <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {agent.roleTag}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm mb-1">{agent.name}</h3>
                  <p className="text-xs text-gray-500 line-clamp-2">{agent.description}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-purple-600">
                  <span>{isSelected ? 'Active Agent' : 'Select Agent'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Execution Console & Live Output */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Prompt Console */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">{selectedAgent.icon}</span>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">{selectedAgent.name}</h3>
                  <p className="text-xs text-gray-500">Configured with Role Scopes & Permission Bounds</p>
                </div>
              </div>
              <span className="px-2.5 py-0.5 text-xs bg-purple-50 text-purple-700 font-semibold rounded-md">
                Active
              </span>
            </div>

            {/* Presets */}
            <div className="mb-4">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Preset Scenarios
              </label>
              <div className="space-y-1.5">
                {selectedAgent.presetPrompts.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPromptText(preset)}
                    className={`w-full text-left p-2 rounded-xl text-xs transition-all border ${
                      promptText === preset
                        ? 'border-purple-500 bg-purple-50 text-purple-900 font-medium'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    "{preset}"
                  </button>
                ))}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleRunAgent} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Input Directives / Context
                </label>
                <textarea
                  rows={4}
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  placeholder="Enter task requirements or parameters for the agent..."
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Governance Risk Level Gate
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setRiskLevel('LOW_RISK')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 ${
                      riskLevel === 'LOW_RISK'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                        : 'border-gray-200 text-gray-600'
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5" />
                    Low Risk (Auto)
                  </button>

                  <button
                    type="button"
                    onClick={() => setRiskLevel('MEDIUM_RISK')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 ${
                      riskLevel === 'MEDIUM_RISK'
                        ? 'border-amber-500 bg-amber-50 text-amber-800'
                        : 'border-gray-200 text-gray-600'
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5" />
                    Medium Risk
                  </button>

                  <button
                    type="button"
                    onClick={() => setRiskLevel('HIGH_RISK')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 ${
                      riskLevel === 'HIGH_RISK'
                        ? 'border-rose-500 bg-rose-50 text-rose-800'
                        : 'border-gray-200 text-gray-600'
                    }`}
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    High Risk (Approval)
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={running}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-sm font-bold shadow-sm transition-all flex items-center justify-center gap-2"
              >
                {running ? (
                  <>
                    <Clock className="w-4 h-4 animate-spin" />
                    Orchestrating Agent Reasoning...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    Execute Agent Task
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right: Live Output Display */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                <Bot className="w-4 h-4 text-purple-600" />
                Live Agent Task Output
              </h3>
              {activeTask && (
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    activeTask.approvalStatus === 'PENDING_APPROVAL'
                      ? 'bg-amber-50 text-amber-700'
                      : 'bg-emerald-50 text-emerald-700'
                  }`}
                >
                  {activeTask.executionStatus}
                </span>
              )}
            </div>

            {!activeTask ? (
              <div className="py-16 text-center text-gray-400 text-xs flex flex-col items-center">
                <Bot className="w-12 h-12 mb-2 opacity-30 text-purple-600" />
                Select an agent scenario and execute to review verified outputs and recommendations.
              </div>
            ) : (
              <div className="space-y-4">
                {activeTask.approvalStatus === 'PENDING_APPROVAL' && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
                    <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      Human-in-the-Loop Approval Required
                    </div>
                    <p className="text-xs text-amber-800">
                      This action has been classified as High Risk. An authorized operator must approve this action before final execution.
                    </p>
                    <div className="flex items-center gap-2 pt-2">
                      <button
                        onClick={() => handleApprove(activeTask.id)}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Approve & Execute
                      </button>
                      <button
                        onClick={() => handleReject(activeTask.id)}
                        className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Reject Action
                      </button>
                    </div>
                  </div>
                )}

                <div className="p-4 bg-slate-900 text-slate-100 rounded-xl text-xs font-mono whitespace-pre-line leading-relaxed max-h-64 overflow-y-auto">
                  {activeTask.outputResult}
                </div>

                {activeTask.structuredOutput && (
                  <div>
                    <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                      Structured Payload & Metrics
                    </h4>
                    <pre className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-indigo-900 font-mono overflow-x-auto max-h-40">
                      {JSON.stringify(activeTask.structuredOutput, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Human Approval Queue & Task History */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 mb-4">
          <div>
            <h3 className="font-bold text-gray-900 text-base">Agent Orchestration Audit Trail</h3>
            <p className="text-xs text-gray-500">
              Immutable execution history with permission records and human approval signatures.
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-xl text-xs">
            <button
              onClick={() => setFilterTab('all')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                filterTab === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
              }`}
            >
              All Tasks ({allTasks.length})
            </button>
            <button
              onClick={() => setFilterTab('pending')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                filterTab === 'pending' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
              }`}
            >
              Pending Approval ({allTasks.filter((t) => t.approvalStatus === 'PENDING_APPROVAL').length})
            </button>
            <button
              onClick={() => setFilterTab('completed')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                filterTab === 'completed' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
              }`}
            >
              Completed ({allTasks.filter((t) => t.executionStatus === 'COMPLETED').length})
            </button>
          </div>
        </div>

        {filteredTasks.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-xs">No agent tasks match this filter.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredTasks.map((t) => (
              <div key={t.id} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-50 text-purple-700 rounded-xl">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900 text-xs">{t.agentType}</span>
                      <span className="text-[11px] text-gray-400 font-mono">({t.actionName})</span>
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-1 max-w-lg">{t.inputPrompt}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      t.executionStatus === 'COMPLETED'
                        ? 'bg-emerald-50 text-emerald-700'
                        : t.executionStatus === 'AWAITING_APPROVAL'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-red-50 text-red-700'
                    }`}
                  >
                    {t.approvalStatus === 'PENDING_APPROVAL' ? 'Awaiting Human Approval' : t.executionStatus}
                  </span>

                  {t.approvalStatus === 'PENDING_APPROVAL' && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleApprove(t.id)}
                        className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                        title="Approve"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleReject(t.id)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                        title="Reject"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  <button
                    onClick={() => setActiveTask(t)}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
