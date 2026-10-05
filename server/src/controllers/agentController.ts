import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { db } from '../models/db';
import { AIAgentType, AIRiskLevel } from '../types';

export async function runAgentTask(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role || 'FREELANCER';
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const {
      agentType,
      actionName,
      inputPrompt,
      contextPayload,
      riskLevel = 'LOW_RISK',
      allowedTools = ['search', 'marketplace_db', 'calculator'],
      deniedTools = ['direct_fund_transfer', 'system_config_override'],
    } = req.body;

    if (!agentType || !actionName || !inputPrompt) {
      res.status(400).json({ success: false, message: 'agentType, actionName, and inputPrompt are required' });
      return;
    }

    // Determine simulated intelligent output depending on agent type
    let outputResult = '';
    let structuredOutput: Record<string, any> = {};

    switch (agentType as AIAgentType) {
      case 'PROJECT_AGENT': {
        outputResult = `Project Scoping Analysis:
- Recommended Timeline: 3-4 weeks with 3 distinct milestones.
- Optimal Budget Range: $1,800 - $2,600 based on current marketplace supply.
- Key Risk Factors: Third-party API rate limits and mobile responsiveness.
- Milestone Breakdown:
  1. Architecture & Design Wireframes (30% - $700)
  2. Core Engine & Backend Integration (40% - $950)
  3. Quality Assurance, End-to-End Testing & Handover (30% - $750)`;
        structuredOutput = {
          estimatedDurationDays: 24,
          recommendedBudgetMin: 1800,
          recommendedBudgetMax: 2600,
          milestones: [
            { name: 'Architecture & UX Wireframes', percent: 30, amount: 700 },
            { name: 'Core Engine & API Integration', percent: 40, amount: 950 },
            { name: 'QA, Final Testing & Deployment', percent: 30, amount: 750 },
          ],
          keySkills: ['React', 'Node.js', 'PostgreSQL', 'Tailwind CSS'],
        };
        break;
      }

      case 'FREELANCER_AGENT': {
        outputResult = `Optimized Proposal Pitch:
"Dear Client, having successfully delivered 18+ high-performance React & Node applications with 100% on-time completion, I analyzed your technical specifications. I will construct a scalable architecture with strict type safety, sub-50ms query latency, and responsive UI components. I can start immediately and deliver the initial milestone within 5 business days."`;
        structuredOutput = {
          winProbabilityScore: 88,
          competitiveRateBenchmark: '$65 - $80 / hr',
          suggestedBidAmount: 2200,
          recommendedDeliverableDays: 18,
          highlightedCertifications: ['Certified React Specialist', 'Verified Identity Tier 2'],
        };
        break;
      }

      case 'SELLER_AGENT': {
        outputResult = `Candidate Shortlisting & Screening Summary:
- Top Candidate Match: High relevance match (96%) based on verified skills in React & TypeScript.
- Risk Assessment: Low risk. Verified payment history & 5.0 star reputation across 12 contracts.
- Interview Recommendation: Ask about their experience with WebSocket concurrency and escrow milestone handling.`;
        structuredOutput = {
          candidateMatchScore: 96,
          riskScore: 4,
          interviewQuestions: [
            'How do you structure component memoization in complex dashboards?',
            'What caching strategies do you deploy for multi-tenant REST endpoints?',
          ],
        };
        break;
      }

      case 'MATCHING_AGENT': {
        outputResult = `Semantic Compatibility Radar:
- Skill Overlap: 95% (React, TypeScript, Node.js, SQL)
- Timezone Alignment: 85% (+/- 2 hours overlap window)
- Budget Compatibility: 98% (Rate within client specified range)
- Historical Performance Synergy: 94% on-time milestone delivery score`;
        structuredOutput = {
          overallMatchPercent: 94,
          radarMetrics: {
            skills: 95,
            timezone: 85,
            budget: 98,
            reputation: 94,
            availability: 90,
          },
        };
        break;
      }

      case 'SUPPORT_AGENT': {
        outputResult = `Automated Triage & Mediation Guidance:
- Issue Category: Deliverable Revision Request
- Platform Policy: Standard revision window is 14 days following initial delivery.
- Suggested Resolution: Recommend freelancer address the 2 reported UI edge-cases, followed by client escrow release.`;
        structuredOutput = {
          suggestedAction: 'MEDIATION_REVISION_AGREEMENT',
          policyRef: 'TOS_SEC_8_DELIVERY_ACCEPTANCE',
          resolutionConfidence: 93,
        };
        break;
      }

      case 'RISK_AGENT': {
        outputResult = `Financial & Identity Trust Profile:
- Trust Score: 98 / 100
- Velocity Checks: Normal transaction frequency and verified IP geolocation.
- Compliance Status: W-8BEN Tax form verified, Bank account verified.
- Fraud Alert: None.`;
        structuredOutput = {
          trustScore: 98,
          fraudRiskLevel: 'VERY_LOW',
          anomaliesDetected: 0,
          complianceVerified: true,
        };
        break;
      }

      case 'ADMIN_ASSISTANT':
      default: {
        outputResult = `Administrative Platform Policy Audit:
- System Integrity: 100% compliant with Escrow Rules and Anti-Circumvention Policy.
- Recommended Action: Proceed with scheduled milestone release upon client approval.`;
        structuredOutput = {
          complianceScore: 100,
          auditPassed: true,
        };
        break;
      }
    }

    const task = db.createAIAgentTask({
      userId,
      userRole,
      agentType: agentType as AIAgentType,
      actionName,
      riskLevel: riskLevel as AIRiskLevel,
      allowedTools,
      deniedTools,
      inputPrompt,
      contextPayload,
      outputResult,
      structuredOutput,
    });

    res.status(201).json({
      success: true,
      message:
        task.executionStatus === 'AWAITING_APPROVAL'
          ? 'Task submitted and queued for human approval'
          : 'Agent task executed successfully',
      task,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to execute agent task' });
  }
}

export async function listAgentTasks(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.role === 'ADMIN' ? undefined : req.user?.id;
    const agentType = req.query.agentType as AIAgentType | undefined;
    const status = req.query.status as string | undefined;

    const tasks = db.listAIAgentTasks(userId, agentType, status);
    res.json({ success: true, tasks });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to list agent tasks' });
  }
}

export async function getAgentTaskById(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const task = db.getAIAgentTaskById(id);
    if (!task) {
      res.status(404).json({ success: false, message: 'Agent task not found' });
      return;
    }
    res.json({ success: true, task });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to fetch agent task' });
  }
}

export async function approveAgentTask(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const task = db.approveAIAgentTask(id, userId);
    if (!task) {
      res.status(404).json({ success: false, message: 'Task not found' });
      return;
    }

    res.json({ success: true, message: 'Agent action approved and executed', task });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to approve task' });
  }
}

export async function rejectAgentTask(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const { reason = 'Rejected by operator' } = req.body;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const task = db.rejectAIAgentTask(id, userId, reason);
    if (!task) {
      res.status(404).json({ success: false, message: 'Task not found' });
      return;
    }

    res.json({ success: true, message: 'Agent action rejected', task });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to reject task' });
  }
}

export async function getAgentCapabilities(_req: AuthenticatedRequest, res: Response): Promise<void> {
  res.json({
    success: true,
    agents: [
      {
        type: 'PROJECT_AGENT',
        title: 'Project Scope & Architecture Agent',
        description: 'Auto-generates technical scope, milestone breakdowns, budget estimations and deliverables specifications.',
        defaultRisk: 'LOW_RISK',
        tools: ['marketplace_db', 'budget_calculator', 'milestone_planner'],
      },
      {
        type: 'FREELANCER_AGENT',
        title: 'Freelancer Pitch & Win-Rate Agent',
        description: 'Drafts competitive proposals, tunes rate positioning, and matches certified portfolio items to project specs.',
        defaultRisk: 'LOW_RISK',
        tools: ['portfolio_matcher', 'rate_benchmarking', 'pitch_tuner'],
      },
      {
        type: 'SELLER_AGENT',
        title: 'Client Hiring & Candidate Screener Agent',
        description: 'Analyzes applicant proposals, builds comparative scoring matrices, and drafts tailored technical interview questions.',
        defaultRisk: 'LOW_RISK',
        tools: ['applicant_ranker', 'resume_parser', 'interview_assistant'],
      },
      {
        type: 'MATCHING_AGENT',
        title: 'Semantic Marketplace Matcher Agent',
        description: 'Computes deep multi-vector compatibility across verified skillsets, timezone overlap, and historical delivery velocity.',
        defaultRisk: 'LOW_RISK',
        tools: ['vector_skill_matcher', 'reputation_graph', 'availability_index'],
      },
      {
        type: 'SUPPORT_AGENT',
        title: 'Support & Mediation Triage Agent',
        description: 'Synthesizes platform terms, reviews milestone evidence, and guides conflict resolution.',
        defaultRisk: 'MEDIUM_RISK',
        tools: ['dispute_history', 'policy_kb', 'resolution_suggester'],
      },
      {
        type: 'RISK_AGENT',
        title: 'Risk & Fraud Intelligence Agent',
        description: 'Scans for anomalous activity, suspicious velocity, duplicate accounts, and anti-circumvention signals.',
        defaultRisk: 'HIGH_RISK',
        tools: ['velocity_scanner', 'ip_geolocation', 'identity_crosscheck'],
      },
      {
        type: 'ADMIN_ASSISTANT',
        title: 'Executive Platform Governance Assistant',
        description: 'Executes platform-wide compliance audits, generates regulatory tax reports, and summarizes platform dispute metrics.',
        defaultRisk: 'HIGH_RISK',
        tools: ['escrow_auditor', 'tax_compliance_engine', 'incident_dispatcher'],
      },
    ],
  });
}
