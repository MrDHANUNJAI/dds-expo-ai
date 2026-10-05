import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { config } from '../config';
import {
  UserDocument,
  FreelancerProfileDocument,
  SellerProfileDocument,
  SessionDocument,
  AuditLogDocument,
  PasswordResetTokenDocument,
  UserRole,
  ProjectDocument,
  ProposalDocument,
  CategoryDocument,
  SkillDocument,
  SavedProjectDocument,
  ProjectStatus,
  BudgetType,
  ProposalStatus,
  ContractDocument,
  MilestoneDocument,
  PaymentDocument,
  TransactionDocument,
  WalletDocument,
  WalletLedgerDocument,
  PayoutDocument,
  InvoiceDocument,
  RefundDocument,
  PlatformSettingsDocument,
  FinancialAuditLogDocument,
  ProcessedWebhookDocument,
  PaymentStatus,
  MilestonePaymentStatus,
  MilestoneWorkflowStatus,
  ContractStatus,
  PayoutStatus,
  RefundStatus,
  InvoiceStatus,
  TransactionType,
  LedgerType,
  ConversationDocument,
  ConversationStatus,
  MessageDocument,
  MessageType,
  MessageStatus,
  MessageAttachment,
  NotificationDocument,
  NotificationType,
  NotificationPreferencesDocument,
  ReviewDocument,
  ReviewStatus,
  ReportDocument,
  ReportType,
  ReportStatus,
  DisputeDocument,
  DisputeStatus,
  DisputePriority,
  DisputeEvidence,
  DisputeTimelineEvent,
  DisputeResolutionDetails,
  SupportTicketDocument,
  SupportCategory,
  SupportStatus,
  SupportMessage,
  ModerationActionDocument,
  ModerationActionType,
  UserBlockDocument,
  FAQItemDocument,
  VerificationDocument,
  VerificationType,
  VerificationStatus,
  TwoFactorAuthDocument,
  SecurityActivityDocument,
  RiskEventDocument,
  RiskSeverity,
  RiskEventStatus,
  AnalyticsEventDocument,
  FeatureFlagDocument,
  PlatformConfigDocument,
  AIUsageDocument,
  ScheduledJobDocument,
  OrganizationType,
  OrganizationMemberRole,
  OrganizationMemberStatus,
  OrganizationDocument,
  OrganizationMemberDocument,
  OrganizationInvitationDocument,
  TaskStatus,
  TaskPriority,
  ProjectTaskDocument,
  ProjectActivityDocument,
  ProjectFileDocument,
  BadgeType,
  BadgeDocument,
  ReputationBreakdown,
  SubscriptionPlanType,
  SubscriptionPlanDocument,
  UserSubscriptionDocument,
  ReferralDocument,
  RewardTransactionDocument,
  ArticleCMSDocument,
  SavedSearchDocument,
  FavoriteDocument,
  ConsultationSlotDocument,
  ApiScope,
  ApiKeyDocument,
  WebhookEvent,
  WebhookSubscriptionDocument,
  WebhookDeliveryLogDocument,
  MarketplaceAppDocument,
  AppInstallationDocument,
  AIAgentType,
  AIRiskLevel,
  AIApprovalStatus,
  AIAgentTaskDocument,
  SkillGraphNode,
  SkillAssessmentQuestion,
  SkillAssessmentDocument,
  UserAssessmentSubmissionDocument,
  IncidentSeverity,
  IncidentStatus,
  IncidentDocument,
  MarketplaceHealthReport,
  CustomReportConfigDocument,
} from '../types';
import { hashPassword } from '../utils/passwordUtils';

interface DatabaseSchema {
  users: UserDocument[];
  freelancerProfiles: FreelancerProfileDocument[];
  sellerProfiles: SellerProfileDocument[];
  sessions: SessionDocument[];
  auditLogs: AuditLogDocument[];
  passwordResetTokens: PasswordResetTokenDocument[];
  projects: ProjectDocument[];
  proposals: ProposalDocument[];
  categories: CategoryDocument[];
  skills: SkillDocument[];
  savedProjects: SavedProjectDocument[];
  contracts: ContractDocument[];
  milestones: MilestoneDocument[];
  payments: PaymentDocument[];
  transactions: TransactionDocument[];
  wallets: WalletDocument[];
  walletLedgers: WalletLedgerDocument[];
  payouts: PayoutDocument[];
  invoices: InvoiceDocument[];
  refunds: RefundDocument[];
  platformSettings: PlatformSettingsDocument;
  financialAuditLogs: FinancialAuditLogDocument[];
  processedWebhooks: ProcessedWebhookDocument[];
  conversations: ConversationDocument[];
  messages: MessageDocument[];
  notifications: NotificationDocument[];
  notificationPreferences: NotificationPreferencesDocument[];
  reviews: ReviewDocument[];
  reports: ReportDocument[];
  disputes: DisputeDocument[];
  supportTickets: SupportTicketDocument[];
  moderationActions: ModerationActionDocument[];
  userBlocks: UserBlockDocument[];
  faqs: FAQItemDocument[];
  verifications: VerificationDocument[];
  securityActivities: SecurityActivityDocument[];
  riskEvents: RiskEventDocument[];
  analyticsEvents: AnalyticsEventDocument[];
  featureFlags: FeatureFlagDocument[];
  platformConfig: PlatformConfigDocument;
  aiUsages: AIUsageDocument[];
  scheduledJobs: ScheduledJobDocument[];
  organizations: OrganizationDocument[];
  organizationMembers: OrganizationMemberDocument[];
  organizationInvitations: OrganizationInvitationDocument[];
  projectTasks: ProjectTaskDocument[];
  projectActivities: ProjectActivityDocument[];
  projectFiles: ProjectFileDocument[];
  badges: BadgeDocument[];
  subscriptionPlans: SubscriptionPlanDocument[];
  userSubscriptions: UserSubscriptionDocument[];
  referrals: ReferralDocument[];
  rewardTransactions: RewardTransactionDocument[];
  articles: ArticleCMSDocument[];
  savedSearches: SavedSearchDocument[];
  favorites: FavoriteDocument[];
  consultationSlots: ConsultationSlotDocument[];
  apiKeys: ApiKeyDocument[];
  webhooks: WebhookSubscriptionDocument[];
  webhookLogs: WebhookDeliveryLogDocument[];
  marketplaceApps: MarketplaceAppDocument[];
  appInstallations: AppInstallationDocument[];
  aiAgentTasks: AIAgentTaskDocument[];
  skillGraphNodes: SkillGraphNode[];
  skillAssessments: SkillAssessmentDocument[];
  assessmentSubmissions: UserAssessmentSubmissionDocument[];
  incidents: IncidentDocument[];
  customReports: CustomReportConfigDocument[];
}

const DB_FILE = path.join(config.dataDir, 'db.json');

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const defaultPlatformSettings: PlatformSettingsDocument = {
  defaultPlatformFeeRate: 0.10, // 10%
  sellerFeeRate: 0.0,
  freelancerFeeRate: 0.10,
  minWithdrawalAmount: 500, // ₹500 or $50
  maxWithdrawalAmount: 500000,
  defaultCurrency: 'INR',
  taxRate: 0.18, // 18% GST standard on platform service fees
  paymentProvider: 'RAZORPAY',
  testMode: true,
  updatedAt: new Date().toISOString(),
};

const defaultPlatformConfig: PlatformConfigDocument = {
  id: 'platform-config-default',
  allowNewRegistrations: true,
  requireIdentityVerificationForPayout: false,
  requireEmailVerificationForBidding: false,
  enableRecommendations: true,
  maxProposalsPerDay: 20,
  maintenanceMode: false,
  updatedAt: new Date().toISOString(),
};

const defaultSubscriptionPlans: SubscriptionPlanDocument[] = [
  {
    id: 'plan-free',
    name: 'Free Starter',
    type: 'FREE',
    description: 'Essential toolkit for starting out and submitting introductory proposals.',
    priceMonthly: 0,
    priceYearly: 0,
    currency: 'USD',
    features: [
      '10 free proposal submits / month',
      'Standard marketplace profile',
      'Escrow payment security',
      'Basic AI project assist',
      'Community support',
    ],
    limits: {
      proposalsPerMonth: 10,
      aiTokensPerMonth: 500,
      teamMembers: 1,
      storageGb: 1,
      platformFeeDiscountPercent: 0,
    },
  },
  {
    id: 'plan-pro',
    name: 'Pro Freelancer',
    type: 'PRO',
    description: 'For active specialists who want higher visibility, lower platform fees, and advanced AI tooling.',
    priceMonthly: 19,
    priceYearly: 190,
    currency: 'USD',
    isPopular: true,
    features: [
      '80 proposal submits / month',
      'Reduced platform fee (7% vs 10%)',
      'Top Rated & Rising Talent priority',
      'AI Proposal Generator & Cover Letter tuner',
      'Competitor bid range analytics',
      'Up to 3 team collaborators',
      '10 GB project file storage',
    ],
    limits: {
      proposalsPerMonth: 80,
      aiTokensPerMonth: 5000,
      teamMembers: 3,
      storageGb: 10,
      platformFeeDiscountPercent: 30, // 30% reduction on platform fee
    },
  },
  {
    id: 'plan-business',
    name: 'Business Client',
    type: 'BUSINESS',
    description: 'For growing businesses and companies hiring contractors regularly.',
    priceMonthly: 49,
    priceYearly: 490,
    currency: 'USD',
    features: [
      'Unlimited job postings',
      'Featured project listing badge',
      'Up to 10 company team seats',
      'Pre-vetted talent matching assistance',
      'Consolidated monthly billing',
      'Custom milestone contract templates',
      'Priority 24/7 customer support',
    ],
    limits: {
      proposalsPerMonth: 9999,
      aiTokensPerMonth: 10000,
      teamMembers: 10,
      storageGb: 50,
      platformFeeDiscountPercent: 20,
    },
  },
  {
    id: 'plan-agency',
    name: 'Agency Scale',
    type: 'AGENCY',
    description: 'For design studios, dev agencies, and contractor teams scaling deliverables.',
    priceMonthly: 99,
    priceYearly: 990,
    currency: 'USD',
    features: [
      'Unlimited proposal submissions',
      'Verified Agency badge & custom profile URL',
      '25 member seats with role-based access',
      'Agency shared earnings & client routing',
      'White-label workspace & invoice reports',
      'Lowest 5% platform fee tier',
      'Dedicated partner manager',
    ],
    limits: {
      proposalsPerMonth: 9999,
      aiTokensPerMonth: 25000,
      teamMembers: 25,
      storageGb: 100,
      platformFeeDiscountPercent: 50,
    },
  },
  {
    id: 'plan-enterprise',
    name: 'Enterprise Pro',
    type: 'ENTERPRISE',
    description: 'Custom compliance, dedicated SLAs, SSO/SAML, and tailored hiring pipelines.',
    priceMonthly: 299,
    priceYearly: 2990,
    currency: 'USD',
    features: [
      'Unlimited team members & organizations',
      'Single Sign-On (SSO / SAML)',
      'Dedicated Account Director & 1-hour SLA',
      'Net-30 & Net-60 consolidated invoicing',
      'Custom Master Service Agreements (MSA)',
      'Background check integrations',
      'Zero payment processing fee surcharge',
    ],
    limits: {
      proposalsPerMonth: 99999,
      aiTokensPerMonth: 100000,
      teamMembers: 999,
      storageGb: 500,
      platformFeeDiscountPercent: 70,
    },
  },
];

const defaultSkillGraphNodes: SkillGraphNode[] = [
  { id: 'sg-1', name: 'React', category: 'Frontend Development', relatedSkills: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Redux', 'GraphQL'], demandScore: 98, averageHourlyRate: 75 },
  { id: 'sg-2', name: 'Node.js', category: 'Backend Development', relatedSkills: ['Express', 'PostgreSQL', 'Docker', 'TypeScript', 'Redis'], demandScore: 95, averageHourlyRate: 80 },
  { id: 'sg-3', name: 'TypeScript', category: 'Programming Languages', relatedSkills: ['React', 'Node.js', 'Next.js', 'NestJS', 'GraphQL'], demandScore: 97, averageHourlyRate: 85 },
  { id: 'sg-4', name: 'Python', category: 'Data & AI', relatedSkills: ['FastAPI', 'Django', 'PyTorch', 'Pandas', 'OpenAI'], demandScore: 96, averageHourlyRate: 90 },
  { id: 'sg-5', name: 'UI/UX Design', category: 'Design & Creative', relatedSkills: ['Figma', 'Design Systems', 'User Research', 'Prototyping', 'Tailwind CSS'], demandScore: 92, averageHourlyRate: 70 },
  { id: 'sg-6', name: 'PostgreSQL', category: 'Databases & Infrastructure', relatedSkills: ['Prisma', 'SQL', 'Database Optimization', 'Redis', 'Node.js'], demandScore: 91, averageHourlyRate: 85 },
  { id: 'sg-7', name: 'Mobile App Development', category: 'Mobile & Devices', relatedSkills: ['React Native', 'Flutter', 'iOS', 'Android', 'Swift'], demandScore: 93, averageHourlyRate: 80 },
  { id: 'sg-8', name: 'DevOps & Cloud', category: 'Infrastructure', relatedSkills: ['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Terraform'], demandScore: 94, averageHourlyRate: 95 },
];

const defaultSkillAssessments: SkillAssessmentDocument[] = [
  {
    id: 'assess-react',
    skillName: 'React',
    title: 'React.js & Modern Component Architecture',
    description: 'Verify advanced knowledge in React Hooks, state management, memoization, and server rendering concepts.',
    durationMinutes: 15,
    passScorePercent: 80,
    questionsCount: 4,
    level: 'INTERMEDIATE',
    badgeName: 'Certified React Specialist',
    questions: [
      {
        id: 'q1',
        question: 'Which hook should be used to avoid unnecessary recalculations of an expensive value between re-renders?',
        options: ['useMemo', 'useCallback', 'useEffect', 'useRef'],
        correctOptionIndex: 0,
        explanation: 'useMemo caches the computed result of an expensive calculation across render cycles.',
        difficulty: 'BEGINNER',
      },
      {
        id: 'q2',
        question: 'What is the primary benefit of React Server Components (RSC)?',
        options: ['Zero bundle-size overhead for server-only dependencies', 'Automatic client-side hydration for all components', 'Replacement for WebSockets', 'Elimination of CSS stylesheets'],
        correctOptionIndex: 0,
        explanation: 'RSC allows rendering on the server with zero client bundle impact for server-exclusive libraries.',
        difficulty: 'INTERMEDIATE',
      },
      {
        id: 'q3',
        question: 'When should you choose useCallback over inline function declarations?',
        options: ['When passing callback props to memoized child components (React.memo)', 'Every time you write an event listener', 'Only when working with Promises', 'To make state mutations faster'],
        correctOptionIndex: 0,
        explanation: 'useCallback preserves the function instance reference to prevent breaking React.memo shallow comparisons.',
        difficulty: 'INTERMEDIATE',
      },
      {
        id: 'q4',
        question: 'How does React 19 / Modern Concurrent mode prioritize state updates?',
        options: ['Using useTransition to mark non-urgent transitions', 'By blocking the main thread until layout completes', 'By executing all updates synchronously in queue order', 'Through Web Worker offloading only'],
        correctOptionIndex: 0,
        explanation: 'useTransition enables marking low-priority transitions that can be interrupted by urgent user inputs.',
        difficulty: 'ADVANCED',
      },
    ],
  },
  {
    id: 'assess-node',
    skillName: 'Node.js',
    title: 'Node.js & Scalable Backend Systems',
    description: 'Verify competence in asynchronous event loops, stream processing, security best practices, and concurrency.',
    durationMinutes: 15,
    passScorePercent: 75,
    questionsCount: 3,
    level: 'INTERMEDIATE',
    badgeName: 'Certified Node.js Engineer',
    questions: [
      {
        id: 'nq1',
        question: 'Which phase of the Node.js event loop executes timers scheduled by setTimeout() and setInterval()?',
        options: ['Timers phase', 'Poll phase', 'Check phase', 'Close callbacks phase'],
        correctOptionIndex: 0,
        explanation: 'The Timers phase executes timer callbacks whose threshold has elapsed.',
        difficulty: 'INTERMEDIATE',
      },
      {
        id: 'nq2',
        question: 'What is the most memory-efficient way to process large multi-gigabyte file uploads in Express/Node.js?',
        options: ['Streaming via Node.js Transform/Readable Streams', 'Buffering the entire payload into fs.readFileSync', 'Base64 encoding the payload into JSON strings', 'Storing chunks in global arrays'],
        correctOptionIndex: 0,
        explanation: 'Streams pipe chunks incrementally without allocating memory for the complete file at once.',
        difficulty: 'INTERMEDIATE',
      },
      {
        id: 'nq3',
        question: 'How can you protect a Node.js API against Prototype Pollution attacks?',
        options: ['Use Object.create(null), Map, or validate input schema with Zod', 'Set NODE_ENV=production only', 'Always use eval() on incoming JSON', 'Disable TypeScript strict mode'],
        correctOptionIndex: 0,
        explanation: 'Prototype pollution is prevented by avoiding raw object property assignments and using validation schemas.',
        difficulty: 'ADVANCED',
      },
    ],
  },
];

const defaultMarketplaceApps: MarketplaceAppDocument[] = [
  {
    id: 'app-slack',
    developerId: 'dev-worknova',
    developerName: 'WorkNova Ecosystem Team',
    name: 'Slack Workspace Sync',
    slug: 'slack-sync',
    tagline: 'Real-time proposal alerts and contract milestone updates in your Slack channels.',
    description: 'Receive instant notifications when a freelancer submits a bid, client funds escrow, or delivery milestones are ready for review.',
    iconUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80',
    category: 'COMMUNICATION',
    requestedScopes: ['projects:read', 'proposals:read', 'contracts:read', 'messages:read'],
    webhookEvents: ['project.created', 'proposal.created', 'milestone.funded', 'delivery.submitted'],
    status: 'FEATURED',
    installsCount: 842,
    rating: 4.9,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'app-github',
    developerId: 'dev-worknova',
    developerName: 'WorkNova Ecosystem Team',
    name: 'GitHub Repository Sync',
    slug: 'github-workspace',
    tagline: 'Link GitHub pull requests and commit hashes directly to milestone deliverables.',
    description: 'Automate milestone delivery verification by verifying branch merges and repository releases directly in the escrow workspace.',
    iconUrl: 'https://images.unsplash.com/photo-1618401471353-b98aedd04e11?w=100&auto=format&fit=crop&q=80',
    category: 'PRODUCTIVITY',
    requestedScopes: ['contracts:read', 'contracts:write'],
    webhookEvents: ['contract.created', 'delivery.submitted'],
    status: 'FEATURED',
    installsCount: 1240,
    rating: 4.8,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'app-quickbooks',
    developerId: 'dev-worknova',
    developerName: 'Fintech Partners Inc.',
    name: 'QuickBooks & Xero Accounting',
    slug: 'quickbooks-accounting',
    tagline: 'Auto-sync invoices, milestone disbursements, and tax receipts with your ledger.',
    description: 'Streamline bookkeeping by pushing completed platform payouts, 1099 compliance statements, and client invoices into your accounting software.',
    iconUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=100&auto=format&fit=crop&q=80',
    category: 'ACCOUNTING',
    requestedScopes: ['contracts:read', 'analytics:read'],
    webhookEvents: ['payment.completed', 'milestone.released'],
    status: 'APPROVED',
    installsCount: 410,
    rating: 4.7,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const defaultIncidents: IncidentDocument[] = [
  {
    id: 'inc-001',
    title: 'All Global Systems Operational',
    service: 'Core Platform & Escrow Services',
    severity: 'SEV_4_MINOR',
    status: 'RESOLVED',
    summary: 'Routine database index optimization completed successfully across all edge availability zones.',
    impactDescription: 'Zero user disruption. Latencies remained below 20ms throughout the maintenance window.',
    startedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    resolvedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 15 * 60 * 1000).toISOString(),
    timeline: [
      {
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        message: 'Scheduled maintenance started for global cache instances.',
        status: 'MONITORING',
      },
      {
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 15 * 60 * 1000).toISOString(),
        message: 'Optimization verified. All API health probes returning 200 OK.',
        status: 'RESOLVED',
      },
    ],
  },
];

class Database {
  private data: DatabaseSchema = {
    users: [],
    freelancerProfiles: [],
    sellerProfiles: [],
    sessions: [],
    auditLogs: [],
    passwordResetTokens: [],
    projects: [],
    proposals: [],
    categories: [],
    skills: [],
    savedProjects: [],
    contracts: [],
    milestones: [],
    payments: [],
    transactions: [],
    wallets: [],
    walletLedgers: [],
    payouts: [],
    invoices: [],
    refunds: [],
    platformSettings: { ...defaultPlatformSettings },
    financialAuditLogs: [],
    processedWebhooks: [],
    conversations: [],
    messages: [],
    notifications: [],
    notificationPreferences: [],
    reviews: [],
    reports: [],
    disputes: [],
    supportTickets: [],
    moderationActions: [],
    userBlocks: [],
    faqs: [],
    verifications: [],
    securityActivities: [],
    riskEvents: [],
    analyticsEvents: [],
    featureFlags: [
      { id: 'flag-001', key: 'ENABLE_RECOMMENDATIONS', enabled: true, description: 'Smart candidate and job matching engine', targetRole: 'ALL', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'flag-002', key: 'ENABLE_2FA', enabled: true, description: 'Two-Factor Authentication with TOTP and Recovery Codes', targetRole: 'ALL', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'flag-003', key: 'ENABLE_ESCROW_SAFETY', enabled: true, description: 'Automated milestone escrow protection', targetRole: 'ALL', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'flag-004', key: 'ENABLE_ORGANIZATIONS', enabled: true, description: 'Agency & multi-user seller organizations', targetRole: 'ALL', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'flag-005', key: 'ENABLE_SUBSCRIPTIONS', enabled: true, description: 'Tiered subscription membership plans', targetRole: 'ALL', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'flag-006', key: 'ENABLE_AI_ORCHESTRATOR', enabled: true, description: 'Multi-agent AI Orchestrator with permission matrix', targetRole: 'ALL', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'flag-007', key: 'ENABLE_DEVELOPER_PLATFORM', enabled: true, description: 'Public API v1 & Webhooks Developer Suite', targetRole: 'ALL', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    ],
    platformConfig: { ...defaultPlatformConfig },
    aiUsages: [],
    scheduledJobs: [],
    organizations: [],
    organizationMembers: [],
    organizationInvitations: [],
    projectTasks: [],
    projectActivities: [],
    projectFiles: [],
    badges: [],
    subscriptionPlans: [...defaultSubscriptionPlans],
    userSubscriptions: [],
    referrals: [],
    rewardTransactions: [],
    articles: [],
    savedSearches: [],
    favorites: [],
    consultationSlots: [],
    apiKeys: [],
    webhooks: [],
    webhookLogs: [],
    marketplaceApps: [...defaultMarketplaceApps],
    appInstallations: [],
    aiAgentTasks: [],
    skillGraphNodes: [...defaultSkillGraphNodes],
    skillAssessments: [...defaultSkillAssessments],
    assessmentSubmissions: [],
    incidents: [...defaultIncidents],
    customReports: [],
  };

  private isInitialized = false;

  constructor() {
    this.init();
  }

  private init() {
    if (this.isInitialized) return;

    if (!fs.existsSync(config.dataDir)) {
      fs.mkdirSync(config.dataDir, { recursive: true });
    }

    if (!fs.existsSync(config.uploadsDir)) {
      fs.mkdirSync(config.uploadsDir, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        this.data = {
          users: parsed.users || [],
          freelancerProfiles: parsed.freelancerProfiles || [],
          sellerProfiles: parsed.sellerProfiles || [],
          sessions: parsed.sessions || [],
          auditLogs: parsed.auditLogs || [],
          passwordResetTokens: parsed.passwordResetTokens || [],
          projects: parsed.projects || [],
          proposals: parsed.proposals || [],
          categories: parsed.categories || [],
          skills: parsed.skills || [],
          savedProjects: parsed.savedProjects || [],
          contracts: parsed.contracts || [],
          milestones: parsed.milestones || [],
          payments: parsed.payments || [],
          transactions: parsed.transactions || [],
          wallets: parsed.wallets || [],
          walletLedgers: parsed.walletLedgers || [],
          payouts: parsed.payouts || [],
          invoices: parsed.invoices || [],
          refunds: parsed.refunds || [],
          platformSettings: parsed.platformSettings || { ...defaultPlatformSettings },
          financialAuditLogs: parsed.financialAuditLogs || [],
          processedWebhooks: parsed.processedWebhooks || [],
          conversations: parsed.conversations || [],
          messages: parsed.messages || [],
          notifications: parsed.notifications || [],
          notificationPreferences: parsed.notificationPreferences || [],
          reviews: parsed.reviews || [],
          reports: parsed.reports || [],
          disputes: parsed.disputes || [],
          supportTickets: parsed.supportTickets || [],
          moderationActions: parsed.moderationActions || [],
          userBlocks: parsed.userBlocks || [],
          faqs: parsed.faqs || [],
          verifications: parsed.verifications || [],
          securityActivities: parsed.securityActivities || [],
          riskEvents: parsed.riskEvents || [],
          analyticsEvents: parsed.analyticsEvents || [],
          featureFlags: parsed.featureFlags && parsed.featureFlags.length > 0 ? parsed.featureFlags : [
            { id: 'flag-001', key: 'ENABLE_RECOMMENDATIONS', enabled: true, description: 'Smart candidate and job matching engine', targetRole: 'ALL', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
            { id: 'flag-002', key: 'ENABLE_2FA', enabled: true, description: 'Two-Factor Authentication with TOTP and Recovery Codes', targetRole: 'ALL', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
            { id: 'flag-003', key: 'ENABLE_ESCROW_SAFETY', enabled: true, description: 'Automated milestone escrow protection', targetRole: 'ALL', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
            { id: 'flag-004', key: 'ENABLE_ORGANIZATIONS', enabled: true, description: 'Agency & multi-user seller organizations', targetRole: 'ALL', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
            { id: 'flag-005', key: 'ENABLE_SUBSCRIPTIONS', enabled: true, description: 'Tiered subscription membership plans', targetRole: 'ALL', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          ],
          platformConfig: parsed.platformConfig || { ...defaultPlatformConfig },
          aiUsages: parsed.aiUsages || [],
          scheduledJobs: parsed.scheduledJobs || [],
          organizations: parsed.organizations || [],
          organizationMembers: parsed.organizationMembers || [],
          organizationInvitations: parsed.organizationInvitations || [],
          projectTasks: parsed.projectTasks || [],
          projectActivities: parsed.projectActivities || [],
          projectFiles: parsed.projectFiles || [],
          badges: parsed.badges || [],
          subscriptionPlans: parsed.subscriptionPlans && parsed.subscriptionPlans.length > 0 ? parsed.subscriptionPlans : [...defaultSubscriptionPlans],
          userSubscriptions: parsed.userSubscriptions || [],
          referrals: parsed.referrals || [],
          rewardTransactions: parsed.rewardTransactions || [],
          articles: parsed.articles || [],
          savedSearches: parsed.savedSearches || [],
          favorites: parsed.favorites || [],
          consultationSlots: parsed.consultationSlots || [],
          apiKeys: parsed.apiKeys || [],
          webhooks: parsed.webhooks || [],
          webhookLogs: parsed.webhookLogs || [],
          marketplaceApps: parsed.marketplaceApps && parsed.marketplaceApps.length > 0 ? parsed.marketplaceApps : [...defaultMarketplaceApps],
          appInstallations: parsed.appInstallations || [],
          aiAgentTasks: parsed.aiAgentTasks || [],
          skillGraphNodes: parsed.skillGraphNodes && parsed.skillGraphNodes.length > 0 ? parsed.skillGraphNodes : [...defaultSkillGraphNodes],
          skillAssessments: parsed.skillAssessments && parsed.skillAssessments.length > 0 ? parsed.skillAssessments : [...defaultSkillAssessments],
          assessmentSubmissions: parsed.assessmentSubmissions || [],
          incidents: parsed.incidents && parsed.incidents.length > 0 ? parsed.incidents : [...defaultIncidents],
          customReports: parsed.customReports || [],
        };
      } catch (err) {
        console.error('Failed to parse database file, resetting', err);
        this.persist();
      }
    } else {
      this.persist();
    }

    this.isInitialized = true;
  }

  private persist() {
    try {
      const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
      fs.writeFileSync(tempFile, JSON.stringify(this.data, null, 2), 'utf-8');
      fs.renameSync(tempFile, DB_FILE);
    } catch (err) {
      console.error('Failed to persist database:', err);
    }
  }

  public async seedDefaultUsersIfEmpty() {
    // 1. Seed users if empty
    if (this.data.users.length === 0) {
      console.log('Seeding initial development users for WorkNova...');

      const flHash = await hashPassword('Password123!');
      const flUserId = 'user-fl-alex-001';
      const flUser: UserDocument = {
        id: flUserId,
        firstName: 'Alex',
        lastName: 'Morgan',
        email: 'alex.morgan@worknova.io',
        phone: '+91 98765 43210',
        passwordHash: flHash,
        role: 'FREELANCER',
        isVerified: true,
        isActive: true,
        isSuspended: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const flProfile: FreelancerProfileDocument = {
        id: 'profile-fl-001',
        userId: flUserId,
        professionalTitle: 'Senior Full Stack & Cloud Architect',
        bio: 'Experienced full stack developer with 9+ years building high-throughput web applications, microservices, and reactive SPAs. Specialized in React, TypeScript, Node.js, and cloud infrastructure.',
        skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'AWS', 'GraphQL', 'Docker'],
        experienceLevel: 'Expert',
        yearsOfExperience: 9,
        hourlyRate: 85,
        location: 'Bengaluru, KA, India',
        languages: [
          { language: 'English', proficiency: 'Native' },
          { language: 'Hindi', proficiency: 'Fluent' },
        ],
        education: [
          { degree: 'B.Tech in Computer Science', institution: 'IIT Delhi', year: '2016' },
        ],
        certifications: [
          { title: 'AWS Certified Solutions Architect', issuer: 'Amazon Web Services', year: '2023' },
        ],
        portfolio: [
          {
            id: 'pf-1',
            title: 'Enterprise Fintech Dashboard',
            description: 'Real-time liquidity and automated asset reconciliation platform.',
            category: 'Web Development',
            skills: ['React', 'TypeScript', 'Tailwind CSS'],
          },
        ],
        availability: 'Available Now',
        profileCompletion: 92,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const sellerHash = await hashPassword('Password123!');
      const sellerUserId = 'user-sel-sarah-001';
      const sellerUser: UserDocument = {
        id: sellerUserId,
        firstName: 'Sarah',
        lastName: 'Jenkins',
        email: 'sarah.jenkins@aurabrands.com',
        phone: '+1 (212) 555-0144',
        passwordHash: sellerHash,
        role: 'SELLER',
        isVerified: true,
        isActive: true,
        isSuspended: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const sellerProfile: SellerProfileDocument = {
        id: 'profile-sel-001',
        userId: sellerUserId,
        accountType: 'COMPANY',
        businessName: 'Aura Collective Brands',
        industry: 'Consumer Goods & Retail Tech',
        description: 'Overseeing modern e-commerce experiences and omnichannel brand extensions. We hire world-class freelance talent for mission-critical software initiatives.',
        website: 'https://aurabrands.example.com',
        location: 'New York, NY, USA',
        companySize: '50-200 employees',
        profileCompletion: 95,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const adminHash = await hashPassword('AdminSecret2026!');
      const adminUserId = 'user-admin-001';
      const adminUser: UserDocument = {
        id: adminUserId,
        firstName: 'System',
        lastName: 'Administrator',
        email: 'admin@worknova.internal',
        phone: '+1 (800) 555-ADMIN',
        passwordHash: adminHash,
        role: 'ADMIN',
        isVerified: true,
        isActive: true,
        isSuspended: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      this.data.users.push(flUser, sellerUser, adminUser);
      this.data.freelancerProfiles.push(flProfile);
      this.data.sellerProfiles.push(sellerProfile);
    }

    // 2. Seed categories if empty
    if (this.data.categories.length === 0) {
      this.data.categories = [
        {
          id: 'cat-1',
          slug: 'web-development',
          name: 'Web Development',
          description: 'Build modern responsive websites, single-page apps, and full-stack systems.',
          icon: 'Code',
          projectCount: 420,
          subcategories: [
            { id: 'sub-1', name: 'React & Next.js Frontends', slug: 'react-nextjs' },
            { id: 'sub-2', name: 'Full Stack Node / Python', slug: 'fullstack-node-python' },
            { id: 'sub-3', name: 'E-Commerce Solutions', slug: 'ecommerce-solutions' },
            { id: 'sub-4', name: 'API & Microservices Architecture', slug: 'api-microservices' },
          ],
        },
        {
          id: 'cat-2',
          slug: 'design-creative',
          name: 'Design & Creative',
          description: 'UI/UX design, brand systems, typography, design systems, and illustration.',
          icon: 'Palette',
          projectCount: 310,
          subcategories: [
            { id: 'sub-5', name: 'UI/UX Product Design', slug: 'ui-ux-design' },
            { id: 'sub-6', name: 'Brand Identity & Visual Guidelines', slug: 'brand-identity' },
            { id: 'sub-7', name: 'Design Systems in Figma', slug: 'design-systems' },
            { id: 'sub-8', name: 'Motion & Interactive Graphics', slug: 'motion-graphics' },
          ],
        },
        {
          id: 'cat-3',
          slug: 'ai-machine-learning',
          name: 'AI & Machine Learning',
          description: 'LLM agents, vector embeddings, fine-tuning, ML pipelines, and computer vision.',
          icon: 'Cpu',
          projectCount: 195,
          subcategories: [
            { id: 'sub-9', name: 'LLM Integration & RAG Systems', slug: 'llm-rag' },
            { id: 'sub-10', name: 'Custom Model Fine-tuning', slug: 'fine-tuning' },
            { id: 'sub-11', name: 'AI Voice & Speech Agents', slug: 'ai-voice-agents' },
            { id: 'sub-12', name: 'Data Pipeline Engineering', slug: 'data-engineering' },
          ],
        },
        {
          id: 'cat-4',
          slug: 'mobile-development',
          name: 'Mobile Development',
          description: 'Native iOS & Android engineering, React Native, and cross-platform apps.',
          icon: 'Smartphone',
          projectCount: 160,
          subcategories: [
            { id: 'sub-13', name: 'React Native Cross-Platform', slug: 'react-native' },
            { id: 'sub-14', name: 'iOS Swift / SwiftUI', slug: 'ios-swift' },
            { id: 'sub-15', name: 'Android Kotlin & Jetpack', slug: 'android-kotlin' },
          ],
        },
      ];
    }

    // 3. Seed projects if empty
    if (this.data.projects.length === 0) {
      const sellerId = 'user-sel-sarah-001';
      this.data.projects = [
        {
          id: 'proj-1',
          sellerId,
          sellerName: 'Sarah Jenkins',
          sellerCompany: 'Aura Collective Brands',
          sellerAvatar: '',
          sellerLocation: 'New York, NY, USA',
          title: 'Build a Modern React & Node.js E-Commerce Platform',
          slug: 'build-a-modern-react-nodejs-ecommerce-platform',
          description: `We are seeking an experienced Full Stack Developer to build a high-performance e-commerce platform for our flagship lifestyle and consumer goods brand.
Headless CMS connectivity, real-time inventory synchronization, and custom checkout flow with multi-currency support.`,
          categoryId: 'cat-1',
          categoryName: 'Web Development',
          subcategoryId: 'sub-3',
          subcategoryName: 'E-Commerce Solutions',
          skills: ['React', 'TypeScript', 'Node.js', 'Tailwind CSS', 'Next.js', 'PostgreSQL'],
          budgetType: 'fixed',
          budgetMin: 45000,
          budgetMax: 70000,
          fixedAmount: 60000,
          experienceLevel: 'Expert',
          scope: 'Large',
          deadline: '4–6 weeks',
          duration: '6 weeks',
          deliverables: [
            'Storefront architecture & design tokens',
            'Full checkout and payment reconciliation pipeline',
            'Comprehensive testing and production launch',
          ],
          attachments: ['System_Architecture_Specs.pdf'],
          status: 'IN_PROGRESS',
          proposalCount: 2,
          isRemote: true,
          createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
          updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
          publishedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
        },
        {
          id: 'proj-2',
          sellerId,
          sellerName: 'Sarah Jenkins',
          sellerCompany: 'Aura Collective Brands',
          sellerAvatar: '',
          sellerLocation: 'New York, NY, USA',
          title: 'Design System & Component Library in Figma for SaaS Suite',
          slug: 'design-system-component-library-figma-saas-suite',
          description: `Senior Product Designer needed to establish an end-to-end design token architecture and scalable UI component library in Figma for our B2B analytics platform.`,
          categoryId: 'cat-2',
          categoryName: 'Design & Creative',
          subcategoryId: 'sub-7',
          subcategoryName: 'Design Systems in Figma',
          skills: ['Figma', 'Design Systems', 'UI/UX Design', 'Design Tokens'],
          budgetType: 'fixed',
          budgetMin: 30000,
          budgetMax: 45000,
          fixedAmount: 38000,
          experienceLevel: 'Intermediate',
          scope: 'Medium',
          deadline: '3–4 weeks',
          duration: '3 weeks',
          deliverables: ['Complete Figma token library', '50+ interactive components'],
          attachments: [],
          status: 'PUBLISHED',
          proposalCount: 1,
          isRemote: true,
          createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
          updatedAt: new Date(Date.now() - 6 * 86400000).toISOString(),
          publishedAt: new Date(Date.now() - 6 * 86400000).toISOString(),
        },
      ];
    }

    // 4. Seed contracts & milestones if empty (Connecting Phase 4 & Phase 5)
    if (this.data.contracts.length === 0) {
      const contractId = 'cnt-001';
      const sellerId = 'user-sel-sarah-001';
      const flUserId = 'user-fl-alex-001';

      const contract: ContractDocument = {
        id: contractId,
        projectId: 'proj-1',
        projectTitle: 'Build a Modern React & Node.js E-Commerce Platform',
        proposalId: 'prop-1',
        sellerId,
        sellerName: 'Sarah Jenkins',
        sellerCompany: 'Aura Collective Brands',
        freelancerId: 'profile-fl-001',
        freelancerUserId: flUserId,
        freelancerName: 'Alex Morgan',
        freelancerTitle: 'Senior Full Stack & Cloud Architect',
        totalAmount: 60000,
        totalMinorUnits: 6000000, // paise
        currency: 'INR',
        status: 'ACTIVE',
        createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Milestone 1: RELEASED (Alex completed, Sarah approved, funds released to Alex's wallet)
      const ms1: MilestoneDocument = {
        id: 'ms-001',
        contractId,
        projectId: 'proj-1',
        title: 'Milestone 1: Storefront Shell & Design System',
        description: 'Responsive layout architecture, Next.js routing, and typography design tokens.',
        amount: 20000,
        minorUnits: 2000000,
        currency: 'INR',
        paymentStatus: 'RELEASED',
        workflowStatus: 'APPROVED',
        deliveryNotes: 'All components, responsive viewport layouts, and unit tests delivered.',
        deliveredAt: new Date(Date.now() - 2 * 86400000).toISOString(),
        approvedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
        fundedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
        releasedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
        dueDate: '1 week',
        createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
      };

      // Milestone 2: FUNDED (Funds held securely in escrow, work in progress)
      const ms2: MilestoneDocument = {
        id: 'ms-002',
        contractId,
        projectId: 'proj-1',
        title: 'Milestone 2: Cart, Inventory API & Checkout Integration',
        description: 'Real-time inventory synchronization and headless payment processing.',
        amount: 25000,
        minorUnits: 2500000,
        currency: 'INR',
        paymentStatus: 'FUNDED',
        workflowStatus: 'IN_PROGRESS',
        fundedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
        dueDate: '2 weeks',
        createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
      };

      // Milestone 3: UNFUNDED (Pending funding from Sarah)
      const ms3: MilestoneDocument = {
        id: 'ms-003',
        contractId,
        projectId: 'proj-1',
        title: 'Milestone 3: Production Testing & Launch Handover',
        description: 'End-to-end testing, automated CI/CD pipeline, and technical documentation.',
        amount: 15000,
        minorUnits: 1500000,
        currency: 'INR',
        paymentStatus: 'UNFUNDED',
        workflowStatus: 'PENDING',
        dueDate: '3 weeks',
        createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      };

      this.data.contracts.push(contract);
      this.data.milestones.push(ms1, ms2, ms3);

      // 5. Seed Payments & Invoices for Milestone 1 & 2
      const feeRate = 0.10;
      const taxRate = 0.18;

      // Payment for MS1 (Paid & Released)
      const p1Fee = Math.round(20000 * feeRate);
      const p1Tax = Math.round(p1Fee * taxRate);
      const pay1: PaymentDocument = {
        id: 'pay-001',
        projectId: 'proj-1',
        contractId,
        milestoneId: 'ms-001',
        sellerId,
        freelancerId: flUserId,
        amount: 20000,
        minorUnits: 2000000,
        currency: 'INR',
        platformFee: p1Fee,
        platformFeeMinorUnits: p1Fee * 100,
        platformFeeRate: feeRate,
        taxAmount: p1Tax,
        taxRate,
        totalAmount: 20000 + p1Tax,
        totalAmountMinorUnits: (20000 + p1Tax) * 100,
        provider: 'RAZORPAY',
        providerOrderId: 'order_rzp_mock_001',
        providerPaymentId: 'pay_rzp_mock_001',
        status: 'PAID',
        paymentType: 'MILESTONE_FUNDING',
        metadata: { gateway: 'Razorpay UPI' },
        createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
        paidAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      };

      // Payment for MS2 (Paid & Held in Escrow)
      const p2Fee = Math.round(25000 * feeRate);
      const p2Tax = Math.round(p2Fee * taxRate);
      const pay2: PaymentDocument = {
        id: 'pay-002',
        projectId: 'proj-1',
        contractId,
        milestoneId: 'ms-002',
        sellerId,
        freelancerId: flUserId,
        amount: 25000,
        minorUnits: 2500000,
        currency: 'INR',
        platformFee: p2Fee,
        platformFeeMinorUnits: p2Fee * 100,
        platformFeeRate: feeRate,
        taxAmount: p2Tax,
        taxRate,
        totalAmount: 25000 + p2Tax,
        totalAmountMinorUnits: (25000 + p2Tax) * 100,
        provider: 'RAZORPAY',
        providerOrderId: 'order_rzp_mock_002',
        providerPaymentId: 'pay_rzp_mock_002',
        status: 'PAID',
        paymentType: 'MILESTONE_FUNDING',
        metadata: { gateway: 'Razorpay NetBanking' },
        createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
        paidAt: new Date(Date.now() - 1 * 86400000).toISOString(),
      };

      this.data.payments.push(pay1, pay2);

      // Invoices
      const inv1: InvoiceDocument = {
        id: 'inv-001',
        invoiceNumber: 'INV-2026-000001',
        paymentId: 'pay-001',
        sellerId,
        sellerName: 'Sarah Jenkins',
        sellerCompany: 'Aura Collective Brands',
        freelancerId: flUserId,
        freelancerName: 'Alex Morgan',
        projectId: 'proj-1',
        projectTitle: 'Build a Modern React & Node.js E-Commerce Platform',
        milestoneId: 'ms-001',
        milestoneTitle: 'Milestone 1: Storefront Shell & Design System',
        subtotal: 20000,
        platformFee: p1Fee,
        tax: p1Tax,
        total: 20000 + p1Tax,
        currency: 'INR',
        status: 'PAID',
        issuedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
        dueAt: new Date(Date.now() - 3 * 86400000).toISOString(),
        paidAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      };

      const inv2: InvoiceDocument = {
        id: 'inv-002',
        invoiceNumber: 'INV-2026-000002',
        paymentId: 'pay-002',
        sellerId,
        sellerName: 'Sarah Jenkins',
        sellerCompany: 'Aura Collective Brands',
        freelancerId: flUserId,
        freelancerName: 'Alex Morgan',
        projectId: 'proj-1',
        projectTitle: 'Build a Modern React & Node.js E-Commerce Platform',
        milestoneId: 'ms-002',
        milestoneTitle: 'Milestone 2: Cart, Inventory API & Checkout Integration',
        subtotal: 25000,
        platformFee: p2Fee,
        tax: p2Tax,
        total: 25000 + p2Tax,
        currency: 'INR',
        status: 'PAID',
        issuedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
        dueAt: new Date(Date.now() - 1 * 86400000).toISOString(),
        paidAt: new Date(Date.now() - 1 * 86400000).toISOString(),
      };

      this.data.invoices.push(inv1, inv2);

      // Transactions
      this.data.transactions.push(
        {
          id: 'tx-001',
          userId: sellerId,
          projectId: 'proj-1',
          contractId,
          milestoneId: 'ms-001',
          paymentId: 'pay-001',
          type: 'ESCROW_FUND',
          direction: 'DEBIT',
          amount: 20000 + p1Tax,
          minorUnits: (20000 + p1Tax) * 100,
          currency: 'INR',
          status: 'COMPLETED',
          reference: 'pay_rzp_mock_001',
          description: 'Milestone 1 Escrow Funding via Razorpay',
          createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
        },
        {
          id: 'tx-002',
          userId: flUserId,
          projectId: 'proj-1',
          contractId,
          milestoneId: 'ms-001',
          paymentId: 'pay-001',
          type: 'ESCROW_RELEASE',
          direction: 'CREDIT',
          amount: 18000, // 20000 - 2000 platform fee
          minorUnits: 1800000,
          currency: 'INR',
          status: 'COMPLETED',
          reference: 'ms-001',
          description: 'Milestone 1 Payment Released to Freelancer Wallet',
          createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
        },
        {
          id: 'tx-003',
          userId: 'platform',
          projectId: 'proj-1',
          contractId,
          milestoneId: 'ms-001',
          paymentId: 'pay-001',
          type: 'PLATFORM_FEE',
          direction: 'CREDIT',
          amount: 2000,
          minorUnits: 200000,
          currency: 'INR',
          status: 'COMPLETED',
          reference: 'ms-001',
          description: 'WorkNova Platform Service Fee (10%)',
          createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
        },
        {
          id: 'tx-004',
          userId: sellerId,
          projectId: 'proj-1',
          contractId,
          milestoneId: 'ms-002',
          paymentId: 'pay-002',
          type: 'ESCROW_FUND',
          direction: 'DEBIT',
          amount: 25000 + p2Tax,
          minorUnits: (25000 + p2Tax) * 100,
          currency: 'INR',
          status: 'COMPLETED',
          reference: 'pay_rzp_mock_002',
          description: 'Milestone 2 Escrow Funding via Razorpay',
          createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
        }
      );

      // Freelancer Wallet for Alex Morgan
      const wallet: WalletDocument = {
        id: 'wal-fl-001',
        userId: flUserId,
        currency: 'INR',
        availableBalance: 18000,
        availableMinorUnits: 1800000,
        pendingBalance: 22500, // MS2 net (25000 - 2500 fee)
        pendingMinorUnits: 2250000,
        totalEarned: 18000,
        totalEarnedMinorUnits: 1800000,
        totalWithdrawn: 0,
        totalWithdrawnMinorUnits: 0,
        createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
      };

      const ledger1: WalletLedgerDocument = {
        id: 'led-001',
        walletId: 'wal-fl-001',
        userId: flUserId,
        type: 'EARNING',
        direction: 'CREDIT',
        amount: 20000,
        minorUnits: 2000000,
        currency: 'INR',
        referenceType: 'MILESTONE',
        referenceId: 'ms-001',
        balanceBefore: 0,
        balanceAfter: 20000,
        description: 'Milestone 1 Payment Released',
        createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
      };

      const ledger2: WalletLedgerDocument = {
        id: 'led-002',
        walletId: 'wal-fl-001',
        userId: flUserId,
        type: 'PLATFORM_FEE',
        direction: 'DEBIT',
        amount: 2000,
        minorUnits: 200000,
        currency: 'INR',
        referenceType: 'MILESTONE',
        referenceId: 'ms-001',
        balanceBefore: 20000,
        balanceAfter: 18000,
        description: 'Platform Service Fee (10%)',
        createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
      };

      this.data.wallets.push(wallet);
      this.data.walletLedgers.push(ledger1, ledger2);

      this.data.financialAuditLogs.push({
        id: 'faudit-001',
        action: 'SYSTEM_FINANCIALS_INITIALIZED',
        details: { seededContracts: 1, seededMilestones: 3, seededPayments: 2 },
        createdAt: new Date().toISOString(),
      });

      // --- PHASE 6 SEEDING: CONVERSATIONS, MESSAGES, NOTIFICATIONS, REVIEWS, DISPUTES, SUPPORT, FAQS ---
      if (!this.data.conversations || this.data.conversations.length === 0) {
        const conv1: ConversationDocument = {
          id: 'conv-001',
          projectId: 'proj-1',
          contractId,
          sellerId,
          freelancerId: flUserId,
          status: 'ACTIVE',
          lastMessageSnippet: 'Milestone 2 (Cart & Checkout Flow) is 80% complete and ready for testing tomorrow.',
          lastMessageAt: new Date(Date.now() - 25 * 60000).toISOString(),
          lastSenderId: flUserId,
          unreadCountSeller: 1,
          unreadCountFreelancer: 0,
          createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
          updatedAt: new Date(Date.now() - 25 * 60000).toISOString(),
        };
        this.data.conversations = [conv1];

        this.data.messages = [
          {
            id: 'msg-001',
            conversationId: 'conv-001',
            senderId: 'system',
            senderRole: 'ADMIN',
            messageType: 'SYSTEM',
            content: 'Contract established between Sarah Jenkins and Alex Morgan for React & Tailwind E-commerce Web Application.',
            attachments: [],
            status: 'READ',
            createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
            updatedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
          },
          {
            id: 'msg-002',
            conversationId: 'conv-001',
            senderId: sellerId,
            senderRole: 'SELLER',
            messageType: 'TEXT',
            content: 'Hi Alex! Excited to kick off this project. Let me know if you need anything regarding the Figma brand guidelines or design tokens.',
            attachments: [],
            status: 'READ',
            createdAt: new Date(Date.now() - 3 * 86400000 + 10 * 60000).toISOString(),
            updatedAt: new Date(Date.now() - 3 * 86400000 + 10 * 60000).toISOString(),
          },
          {
            id: 'msg-003',
            conversationId: 'conv-001',
            senderId: flUserId,
            senderRole: 'FREELANCER',
            messageType: 'TEXT',
            content: "Hey Sarah! Delighted to work with you. I've reviewed the project requirements and set up the repository architecture with TypeScript and Tailwind CSS. Starting on Milestone 1 today!",
            attachments: [],
            status: 'READ',
            createdAt: new Date(Date.now() - 3 * 86400000 + 35 * 60000).toISOString(),
            updatedAt: new Date(Date.now() - 3 * 86400000 + 35 * 60000).toISOString(),
          },
          {
            id: 'msg-004',
            conversationId: 'conv-001',
            senderId: 'system',
            senderRole: 'ADMIN',
            messageType: 'SYSTEM',
            content: 'Milestone 1 funded into escrow: ₹20,000.',
            attachments: [],
            status: 'READ',
            createdAt: new Date(Date.now() - 3 * 86400000 + 50 * 60000).toISOString(),
            updatedAt: new Date(Date.now() - 3 * 86400000 + 50 * 60000).toISOString(),
          },
          {
            id: 'msg-005',
            conversationId: 'conv-001',
            senderId: flUserId,
            senderRole: 'FREELANCER',
            messageType: 'FILE',
            content: 'Milestone 1 delivered! Architecture and responsive landing layout completed with comprehensive tests.',
            attachments: [
              {
                id: 'att-001',
                name: 'architecture-diagram-v1.png',
                url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80',
                size: 245000,
                mimeType: 'image/png',
              },
            ],
            status: 'READ',
            createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
            updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
          },
          {
            id: 'msg-006',
            conversationId: 'conv-001',
            senderId: sellerId,
            senderRole: 'SELLER',
            messageType: 'TEXT',
            content: 'Approved Milestone 1 and payment released! Code quality is outstanding.',
            attachments: [],
            status: 'READ',
            createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
            updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
          },
          {
            id: 'msg-007',
            conversationId: 'conv-001',
            senderId: flUserId,
            senderRole: 'FREELANCER',
            messageType: 'TEXT',
            content: 'Milestone 2 (Cart & Checkout Flow) is 80% complete and ready for testing tomorrow.',
            attachments: [],
            status: 'DELIVERED',
            createdAt: new Date(Date.now() - 25 * 60000).toISOString(),
            updatedAt: new Date(Date.now() - 25 * 60000).toISOString(),
          },
        ];

        this.data.notifications = [
          {
            id: 'notif-001',
            userId: flUserId,
            type: 'PAYMENT_SUCCESS',
            title: 'Payment Released',
            message: 'Milestone 1 payment of ₹20,000 has been credited to your available wallet balance.',
            entityType: 'milestone',
            entityId: 'ms-001',
            read: true,
            createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
          },
          {
            id: 'notif-002',
            userId: flUserId,
            type: 'NEW_MESSAGE',
            title: 'New message from Sarah Jenkins',
            message: 'Approved Milestone 1 and payment released! Code quality is outstanding.',
            entityType: 'message',
            entityId: 'conv-001',
            read: true,
            createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
          },
          {
            id: 'notif-003',
            userId: sellerId,
            type: 'NEW_MESSAGE',
            title: 'New message from Alex Morgan',
            message: 'Milestone 2 (Cart & Checkout Flow) is 80% complete and ready for testing tomorrow.',
            entityType: 'message',
            entityId: 'conv-001',
            read: false,
            createdAt: new Date(Date.now() - 25 * 60000).toISOString(),
          },
          {
            id: 'notif-004',
            userId: sellerId,
            type: 'DELIVERY_SUBMITTED',
            title: 'Delivery submitted for review',
            message: 'Alex Morgan submitted deliverables for Milestone 1: Core Setup & Catalog.',
            entityType: 'milestone',
            entityId: 'ms-001',
            read: true,
            createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
          },
        ];

        this.data.reviews = [
          {
            id: 'rev-001',
            projectId: 'proj-1',
            contractId,
            reviewerId: sellerId,
            reviewerRole: 'SELLER',
            revieweeId: flUserId,
            rating: 5,
            title: 'Exceptional craftsmanship and deep domain expertise',
            comment: 'Alex built clean, robust TypeScript components with remarkable attention to detail and delivered ahead of schedule. Outstanding communication throughout.',
            communicationRating: 5,
            qualityRating: 5,
            professionalismRating: 5,
            timelinessRating: 5,
            status: 'PUBLISHED',
            createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
            updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
          },
          {
            id: 'rev-002',
            projectId: 'proj-1',
            contractId,
            reviewerId: flUserId,
            reviewerRole: 'FREELANCER',
            revieweeId: sellerId,
            rating: 5,
            title: 'Dream client to collaborate with',
            comment: 'Sarah provided crystalline specifications, rapid feedback on deliveries, and funded milestones immediately. Looking forward to long-term collaboration!',
            communicationRating: 5,
            qualityRating: 5,
            professionalismRating: 5,
            timelinessRating: 5,
            status: 'PUBLISHED',
            createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
            updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
          },
        ];

        this.data.disputes = [
          {
            id: 'disp-001',
            projectId: 'proj-1',
            contractId,
            milestoneId: 'ms-003',
            openedBy: sellerId,
            againstUserId: flUserId,
            reason: 'Specification alignment inquiry',
            description: 'Clarifying third-party payment gateway webhook test credentials and sandboxing deliverables.',
            amount: 15000,
            currency: 'INR',
            priority: 'LOW',
            status: 'UNDER_REVIEW',
            evidence: [
              {
                id: 'ev-001',
                uploadedBy: sellerId,
                title: 'Gateway Specification Document.pdf',
                fileUrl: '/uploads/sample-spec.pdf',
                fileType: 'application/pdf',
                description: 'Gateway specification notes shared during onboarding.',
                createdAt: new Date(Date.now() - 12 * 3600000).toISOString(),
              },
            ],
            timeline: [
              {
                id: 'tl-001',
                actorId: sellerId,
                actorRole: 'SELLER',
                event: 'Dispute opened for administrative mediation',
                note: 'Clarification requested regarding sandbox credentials.',
                createdAt: new Date(Date.now() - 12 * 3600000).toISOString(),
              },
              {
                id: 'tl-002',
                actorRole: 'ADMIN',
                event: 'Admin assigned to case',
                note: 'Case reviewer inspecting milestone deliverables and chat logs.',
                createdAt: new Date(Date.now() - 6 * 3600000).toISOString(),
              },
            ],
            createdAt: new Date(Date.now() - 12 * 3600000).toISOString(),
            updatedAt: new Date(Date.now() - 6 * 3600000).toISOString(),
          },
        ];

        this.data.supportTickets = [
          {
            id: 'sup-001',
            userId: flUserId,
            userEmail: 'dev-alex@worknova.com',
            userName: 'Alex Morgan',
            category: 'Payments',
            subject: 'Question regarding automated GST invoice generation for overseas clients',
            description: 'Can WorkNova provide a breakdown of international withholding or export documentation for USD milestones?',
            priority: 'MEDIUM',
            status: 'OPEN',
            messages: [
              {
                id: 'supmsg-001',
                senderId: flUserId,
                senderRole: 'FREELANCER',
                senderName: 'Alex Morgan',
                content: 'Hi support team, I would like to clarify how invoices are generated when working on USD contracts while holding an Indian GSTIN number.',
                isInternalNote: false,
                createdAt: new Date(Date.now() - 18 * 3600000).toISOString(),
              },
              {
                id: 'supmsg-002',
                senderId: 'user-admin-001',
                senderRole: 'ADMIN',
                senderName: 'WorkNova Support Officer',
                content: 'Hello Alex, all invoices generated automatically comply with export of services rules under zero-rated IGST with LUT declaration. You can download official PDF invoices directly from your Invoices tab.',
                isInternalNote: false,
                createdAt: new Date(Date.now() - 8 * 3600000).toISOString(),
              },
            ],
            createdAt: new Date(Date.now() - 18 * 3600000).toISOString(),
            updatedAt: new Date(Date.now() - 8 * 3600000).toISOString(),
          },
        ];

        this.data.faqs = [
          {
            id: 'faq-001',
            question: 'How does WorkNova Escrow protect buyers and freelancers?',
            answer: 'When a contract milestone is created, the client funds the payment into WorkNova secure escrow before work begins. The funds remain held safely in escrow and are only released to the freelancer once the client reviews and approves the submitted deliverables.',
            category: 'Payments',
            order: 1,
            published: true,
            createdAt: new Date().toISOString(),
          },
          {
            id: 'faq-002',
            question: 'What are the platform service fees?',
            answer: 'Clients pay 0% processing fee on funded projects. Freelancers pay a flat 10% platform service fee upon release of milestone earnings. This covers real-time messaging, dispute arbitration, payment processing, and escrow security.',
            category: 'Payments',
            order: 2,
            published: true,
            createdAt: new Date().toISOString(),
          },
          {
            id: 'faq-003',
            question: 'How do milestone submissions and approvals work?',
            answer: 'Freelancers submit completed deliverables along with files and documentation. Clients have a 14-day review window to test the work, request revisions, or release escrow funds.',
            category: 'Projects',
            order: 3,
            published: true,
            createdAt: new Date().toISOString(),
          },
          {
            id: 'faq-004',
            question: 'What happens if there is a disagreement or dispute?',
            answer: 'Both parties can open a dispute from the contract room. WorkNova mediation officers review contract terms, delivery files, and message history to resolve disputes fairly or issue escrow refunds/releases.',
            category: 'Disputes',
            order: 4,
            published: true,
            createdAt: new Date().toISOString(),
          },
          {
            id: 'faq-005',
            question: 'How fast are wallet withdrawals processed?',
            answer: 'Withdrawals via UPI and IMPS direct bank transfer are typically processed within 2 to 24 business hours following automated compliance verification.',
            category: 'Withdrawals',
            order: 5,
            published: true,
            createdAt: new Date().toISOString(),
          },
          {
            id: 'faq-006',
            question: 'Can I communicate with my client or freelancer off-platform?',
            answer: 'For your safety and payment protection, all project communications, deliverables, and financial agreements must remain within WorkNova. Off-platform transactions void escrow guarantees.',
            category: 'Account',
            order: 6,
            published: true,
            createdAt: new Date().toISOString(),
          },
        ];
      }

      // --- PHASE 7 SEEDING: VERIFICATIONS, SESSIONS, SECURITY ACTIVITIES & RISK EVENTS ---
      if (!this.data.verifications || this.data.verifications.length === 0) {
        this.data.verifications = [
          {
            id: 'ver-001',
            userId: flUserId,
            type: 'EMAIL',
            status: 'VERIFIED',
            verifiedAt: new Date(Date.now() - 7 * 86400000).toISOString(),
            createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
            updatedAt: new Date(Date.now() - 7 * 86400000).toISOString(),
          },
          {
            id: 'ver-002',
            userId: flUserId,
            type: 'PHONE',
            status: 'VERIFIED',
            verifiedAt: new Date(Date.now() - 6 * 86400000).toISOString(),
            createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
            updatedAt: new Date(Date.now() - 6 * 86400000).toISOString(),
          },
          {
            id: 'ver-003',
            userId: flUserId,
            type: 'IDENTITY',
            status: 'VERIFIED',
            provider: 'GovID DigiLocker / Aadhaar Verification',
            providerReference: 'dl-in-84920412',
            verifiedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
            createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
            updatedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
          },
          {
            id: 'ver-004',
            userId: sellerId,
            type: 'EMAIL',
            status: 'VERIFIED',
            verifiedAt: new Date(Date.now() - 8 * 86400000).toISOString(),
            createdAt: new Date(Date.now() - 8 * 86400000).toISOString(),
            updatedAt: new Date(Date.now() - 8 * 86400000).toISOString(),
          },
          {
            id: 'ver-005',
            userId: sellerId,
            type: 'PHONE',
            status: 'VERIFIED',
            verifiedAt: new Date(Date.now() - 8 * 86400000).toISOString(),
            createdAt: new Date(Date.now() - 8 * 86400000).toISOString(),
            updatedAt: new Date(Date.now() - 8 * 86400000).toISOString(),
          },
          {
            id: 'ver-006',
            userId: sellerId,
            type: 'BUSINESS',
            status: 'VERIFIED',
            provider: 'MCA Corporate Registry & GSTIN',
            providerReference: 'gst-29AAACA1234B1Z5',
            verifiedAt: new Date(Date.now() - 6 * 86400000).toISOString(),
            createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
            updatedAt: new Date(Date.now() - 6 * 86400000).toISOString(),
          },
          {
            id: 'ver-007',
            userId: sellerId,
            type: 'PAYMENT',
            status: 'VERIFIED',
            verifiedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
            createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
            updatedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
          },
        ];

        // Update user verification flags
        const flUser = this.findUserById(flUserId);
        if (flUser) {
          flUser.isEmailVerified = true;
          flUser.isPhoneVerified = true;
          flUser.isIdentityVerified = true;
          flUser.availability = 'Available Now';
          flUser.responseRate = 98;
          flUser.averageResponseTimeHours = 1.2;
        }

        const selUser = this.findUserById(sellerId);
        if (selUser) {
          selUser.isEmailVerified = true;
          selUser.isPhoneVerified = true;
          selUser.isBusinessVerified = true;
          selUser.isPaymentVerified = true;
          selUser.responseRate = 100;
          selUser.averageResponseTimeHours = 0.8;
        }

        this.data.securityActivities = [
          {
            id: 'sec-001',
            userId: flUserId,
            action: 'LOGIN',
            ipAddress: '152.58.112.45',
            device: 'Chrome on macOS',
            location: 'Bengaluru, India',
            createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
          },
          {
            id: 'sec-002',
            userId: sellerId,
            action: 'LOGIN',
            ipAddress: '103.21.244.18',
            device: 'Safari on macOS',
            location: 'Mumbai, India',
            createdAt: new Date(Date.now() - 4 * 3600000).toISOString(),
          },
        ];

        this.data.riskEvents = [
          {
            id: 'risk-001',
            userId: 'user-009-sample',
            eventType: 'MULTIPLE_FAILED_LOGIN',
            riskScore: 35,
            severity: 'LOW',
            status: 'NEW',
            metadata: { attempts: 4, ip: '194.26.29.112' },
            createdAt: new Date(Date.now() - 8 * 3600000).toISOString(),
          },
        ];

        this.data.analyticsEvents = [
          {
            id: 'ae-001',
            userId: flUserId,
            eventType: 'PROJECT_VIEW',
            entityType: 'project',
            entityId: 'proj-1',
            createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
          },
          {
            id: 'ae-002',
            userId: flUserId,
            eventType: 'PROPOSAL_SUBMITTED',
            entityType: 'proposal',
            entityId: 'prop-1',
            createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
          },
          {
            id: 'ae-003',
            userId: sellerId,
            eventType: 'CONTRACT_CREATED',
            entityType: 'contract',
            entityId: contractId,
            createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
          },
        ];
      }
    }

    this.persist();
  }

  // --- USER METHODS ---
  public findUserByEmail(email: string): UserDocument | undefined {
    const normalized = email.trim().toLowerCase();
    return this.data.users.find((u) => u.email.trim().toLowerCase() === normalized);
  }

  public findUserById(id: string): UserDocument | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  public createUser(userData: Omit<UserDocument, 'id' | 'createdAt' | 'updatedAt'>): UserDocument {
    const normalizedEmail = userData.email.trim().toLowerCase();
    if (this.findUserByEmail(normalizedEmail)) {
      throw new Error('EMAIL_EXISTS');
    }

    const newUser: UserDocument = {
      ...userData,
      email: normalizedEmail,
      id: `user-${crypto.randomUUID()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.data.users.push(newUser);
    this.persist();
    return newUser;
  }

  public updateUser(id: string, partial: Partial<UserDocument>): UserDocument {
    const index = this.data.users.findIndex((u) => u.id === id);
    if (index === -1) throw new Error('USER_NOT_FOUND');

    if (partial.email) {
      const normalizedEmail = partial.email.trim().toLowerCase();
      const existing = this.findUserByEmail(normalizedEmail);
      if (existing && existing.id !== id) {
        throw new Error('EMAIL_EXISTS');
      }
      partial.email = normalizedEmail;
    }

    const updated: UserDocument = {
      ...this.data.users[index],
      ...partial,
      updatedAt: new Date().toISOString(),
    };

    this.data.users[index] = updated;
    this.persist();
    return updated;
  }

  public listUsers(role?: UserRole): UserDocument[] {
    if (role) {
      return this.data.users.filter((u) => u.role === role);
    }
    return [...this.data.users];
  }

  // --- FREELANCER PROFILE METHODS ---
  public findFreelancerProfileByUserId(userId: string): FreelancerProfileDocument | undefined {
    return this.data.freelancerProfiles.find((p) => p.userId === userId);
  }

  public createFreelancerProfile(
    profileData: Omit<FreelancerProfileDocument, 'id' | 'createdAt' | 'updatedAt'>
  ): FreelancerProfileDocument {
    const existing = this.findFreelancerProfileByUserId(profileData.userId);
    if (existing) return existing;

    const newProfile: FreelancerProfileDocument = {
      ...profileData,
      id: `flp-${crypto.randomUUID()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.data.freelancerProfiles.push(newProfile);
    this.persist();
    return newProfile;
  }

  public updateFreelancerProfile(
    userId: string,
    partial: Partial<FreelancerProfileDocument>
  ): FreelancerProfileDocument {
    let index = this.data.freelancerProfiles.findIndex((p) => p.userId === userId);

    if (index === -1) {
      const created = this.createFreelancerProfile({
        userId,
        professionalTitle: '',
        bio: '',
        skills: [],
        experienceLevel: 'Intermediate',
        yearsOfExperience: 0,
        hourlyRate: 50,
        location: '',
        languages: [{ language: 'English', proficiency: 'Fluent' }],
        education: [],
        certifications: [],
        portfolio: [],
        availability: 'Available Now',
        profileCompletion: 20,
      });
      index = this.data.freelancerProfiles.findIndex((p) => p.id === created.id);
    }

    const updated: FreelancerProfileDocument = {
      ...this.data.freelancerProfiles[index],
      ...partial,
      updatedAt: new Date().toISOString(),
    };

    this.data.freelancerProfiles[index] = updated;
    this.persist();
    return updated;
  }

  // --- SELLER PROFILE METHODS ---
  public findSellerProfileByUserId(userId: string): SellerProfileDocument | undefined {
    return this.data.sellerProfiles.find((p) => p.userId === userId);
  }

  public createSellerProfile(
    profileData: Omit<SellerProfileDocument, 'id' | 'createdAt' | 'updatedAt'>
  ): SellerProfileDocument {
    const existing = this.findSellerProfileByUserId(profileData.userId);
    if (existing) return existing;

    const newProfile: SellerProfileDocument = {
      ...profileData,
      id: `selp-${crypto.randomUUID()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.data.sellerProfiles.push(newProfile);
    this.persist();
    return newProfile;
  }

  public updateSellerProfile(
    userId: string,
    partial: Partial<SellerProfileDocument>
  ): SellerProfileDocument {
    let index = this.data.sellerProfiles.findIndex((p) => p.userId === userId);

    if (index === -1) {
      const created = this.createSellerProfile({
        userId,
        accountType: 'COMPANY',
        businessName: '',
        industry: '',
        description: '',
        website: '',
        location: '',
        companySize: '1-10',
        profileCompletion: 20,
      });
      index = this.data.sellerProfiles.findIndex((p) => p.id === created.id);
    }

    const updated: SellerProfileDocument = {
      ...this.data.sellerProfiles[index],
      ...partial,
      updatedAt: new Date().toISOString(),
    };

    this.data.sellerProfiles[index] = updated;
    this.persist();
    return updated;
  }

  // --- SESSION METHODS ---
  public createSession(userId: string, refreshToken: string, expiresInDays = 7): SessionDocument {
    const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString();
    const session: SessionDocument = {
      id: `sess-${crypto.randomUUID()}`,
      userId,
      refreshToken,
      expiresAt,
      createdAt: new Date().toISOString(),
    };

    const now = new Date().toISOString();
    this.data.sessions = this.data.sessions.filter((s) => s.expiresAt > now);

    this.data.sessions.push(session);
    this.persist();
    return session;
  }

  public findSession(refreshToken: string): SessionDocument | undefined {
    const now = new Date().toISOString();
    return this.data.sessions.find(
      (s) => s.refreshToken === refreshToken && s.expiresAt > now
    );
  }

  public removeSession(refreshToken: string): void {
    this.data.sessions = this.data.sessions.filter((s) => s.refreshToken !== refreshToken);
    this.persist();
  }

  public removeUserSessions(userId: string): void {
    this.data.sessions = this.data.sessions.filter((s) => s.userId !== userId);
    this.persist();
  }

  // --- PASSWORD RESET TOKEN METHODS ---
  public createPasswordResetToken(userId: string): PasswordResetTokenDocument {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    const tokenRecord: PasswordResetTokenDocument = {
      id: `prt-${crypto.randomUUID()}`,
      userId,
      token,
      expiresAt,
      used: false,
      createdAt: new Date().toISOString(),
    };
    this.data.passwordResetTokens.push(tokenRecord);
    this.persist();
    return tokenRecord;
  }

  public findValidPasswordResetToken(token: string): PasswordResetTokenDocument | undefined {
    const now = new Date().toISOString();
    return this.data.passwordResetTokens.find(
      (t) => t.token === token && !t.used && t.expiresAt > now
    );
  }

  public markPasswordResetTokenUsed(token: string): void {
    const record = this.data.passwordResetTokens.find((t) => t.token === token);
    if (record) {
      record.used = true;
      this.persist();
    }
  }

  // --- AUDIT LOGS ---
  public createAuditLog(logData: Omit<AuditLogDocument, 'id' | 'createdAt'>): AuditLogDocument {
    const entry: AuditLogDocument = {
      ...logData,
      id: `audit-${crypto.randomUUID()}`,
      createdAt: new Date().toISOString(),
    };

    this.data.auditLogs.unshift(entry);
    if (this.data.auditLogs.length > 500) {
      this.data.auditLogs = this.data.auditLogs.slice(0, 500);
    }
    this.persist();
    return entry;
  }

  public listAuditLogs(limit = 50): AuditLogDocument[] {
    return this.data.auditLogs.slice(0, limit);
  }

  // --- PROJECT METHODS ---
  public listProjects(filter?: {
    status?: ProjectStatus | 'ALL';
    categoryId?: string;
    subcategoryId?: string;
    budgetType?: BudgetType;
    experienceLevel?: string;
    minBudget?: number;
    maxBudget?: number;
    search?: string;
    sellerId?: string;
  }): ProjectDocument[] {
    let result = [...this.data.projects];

    if (filter) {
      if (filter.status && filter.status !== 'ALL') {
        result = result.filter((p) => p.status === filter.status);
      } else if (!filter.sellerId && (!filter.status || filter.status !== 'ALL')) {
        result = result.filter((p) => p.status === 'PUBLISHED' || p.status === 'IN_PROGRESS');
      }

      if (filter.sellerId) {
        result = result.filter((p) => p.sellerId === filter.sellerId);
      }

      if (filter.categoryId) {
        result = result.filter((p) => p.categoryId === filter.categoryId);
      }

      if (filter.subcategoryId) {
        result = result.filter((p) => p.subcategoryId === filter.subcategoryId);
      }

      if (filter.budgetType) {
        result = result.filter((p) => p.budgetType === filter.budgetType);
      }

      if (filter.experienceLevel) {
        result = result.filter(
          (p) => p.experienceLevel.toLowerCase() === filter.experienceLevel?.toLowerCase()
        );
      }

      if (filter.minBudget !== undefined) {
        result = result.filter((p) => p.budgetMax >= (filter.minBudget || 0));
      }

      if (filter.maxBudget !== undefined && filter.maxBudget > 0) {
        result = result.filter((p) => p.budgetMin <= (filter.maxBudget || Infinity));
      }

      if (filter.search) {
        const query = filter.search.toLowerCase().trim();
        result = result.filter(
          (p) =>
            p.title.toLowerCase().includes(query) ||
            p.description.toLowerCase().includes(query) ||
            p.categoryName.toLowerCase().includes(query) ||
            p.skills.some((s) => s.toLowerCase().includes(query))
        );
      }
    }

    return result.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public findProjectById(id: string): ProjectDocument | undefined {
    return this.data.projects.find((p) => p.id === id);
  }

  public findProjectBySlug(slug: string): ProjectDocument | undefined {
    return this.data.projects.find((p) => p.slug === slug);
  }

  public createProject(
    projectData: Omit<ProjectDocument, 'id' | 'createdAt' | 'updatedAt' | 'slug' | 'proposalCount'>
  ): ProjectDocument {
    const baseSlug = slugify(projectData.title);
    const uniqueSlug = `${baseSlug}-${Date.now().toString(36)}`;

    const newProject: ProjectDocument = {
      ...projectData,
      id: `proj-${crypto.randomUUID()}`,
      slug: uniqueSlug,
      proposalCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishedAt: projectData.status === 'PUBLISHED' ? new Date().toISOString() : undefined,
    };

    this.data.projects.unshift(newProject);
    const cat = this.data.categories.find((c) => c.id === projectData.categoryId);
    if (cat) cat.projectCount = (cat.projectCount || 0) + 1;

    this.persist();
    return newProject;
  }

  public updateProject(id: string, partial: Partial<ProjectDocument>): ProjectDocument {
    const index = this.data.projects.findIndex((p) => p.id === id);
    if (index === -1) throw new Error('PROJECT_NOT_FOUND');

    const current = this.data.projects[index];
    const willBePublished = partial.status === 'PUBLISHED' && current.status !== 'PUBLISHED';

    const updated: ProjectDocument = {
      ...current,
      ...partial,
      publishedAt: willBePublished ? new Date().toISOString() : current.publishedAt,
      updatedAt: new Date().toISOString(),
    };

    this.data.projects[index] = updated;
    this.persist();
    return updated;
  }

  public deleteProject(id: string): void {
    const index = this.data.projects.findIndex((p) => p.id === id);
    if (index === -1) throw new Error('PROJECT_NOT_FOUND');
    this.data.projects.splice(index, 1);
    this.persist();
  }

  // --- PROPOSALS METHODS ---
  public listProposals(filter?: {
    projectId?: string;
    freelancerId?: string;
    freelancerUserId?: string;
    status?: ProposalStatus;
  }): ProposalDocument[] {
    let result = [...this.data.proposals];

    if (filter) {
      if (filter.projectId) result = result.filter((pr) => pr.projectId === filter.projectId);
      if (filter.freelancerId) result = result.filter((pr) => pr.freelancerId === filter.freelancerId);
      if (filter.freelancerUserId) result = result.filter((pr) => pr.freelancerUserId === filter.freelancerUserId);
      if (filter.status) result = result.filter((pr) => pr.status === filter.status);
    }

    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public findProposalById(id: string): ProposalDocument | undefined {
    return this.data.proposals.find((p) => p.id === id);
  }

  public findProposalByProjectAndFreelancer(projectId: string, freelancerUserId: string): ProposalDocument | undefined {
    return this.data.proposals.find((p) => p.projectId === projectId && p.freelancerUserId === freelancerUserId);
  }

  public createProposal(data: Omit<ProposalDocument, 'id' | 'createdAt' | 'updatedAt' | 'status'>): ProposalDocument {
    const newProposal: ProposalDocument = {
      ...data,
      id: `prop-${crypto.randomUUID()}`,
      status: 'SUBMITTED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.data.proposals.unshift(newProposal);
    const project = this.findProjectById(data.projectId);
    if (project) {
      project.proposalCount = (project.proposalCount || 0) + 1;
      project.updatedAt = new Date().toISOString();
    }

    this.persist();
    return newProposal;
  }

  public updateProposal(id: string, partial: Partial<ProposalDocument>): ProposalDocument {
    const index = this.data.proposals.findIndex((p) => p.id === id);
    if (index === -1) throw new Error('PROPOSAL_NOT_FOUND');

    const updated: ProposalDocument = {
      ...this.data.proposals[index],
      ...partial,
      updatedAt: new Date().toISOString(),
    };

    this.data.proposals[index] = updated;
    this.persist();
    return updated;
  }

  public withdrawProposal(id: string, freelancerUserId: string): ProposalDocument {
    const index = this.data.proposals.findIndex((p) => p.id === id && p.freelancerUserId === freelancerUserId);
    if (index === -1) throw new Error('PROPOSAL_NOT_FOUND');

    const proposal = this.data.proposals[index];
    proposal.status = 'WITHDRAWN';
    proposal.updatedAt = new Date().toISOString();

    const project = this.findProjectById(proposal.projectId);
    if (project && project.proposalCount > 0) {
      project.proposalCount -= 1;
    }

    this.persist();
    return proposal;
  }

  public updateProposalStatus(id: string, status: ProposalStatus, clientNotes?: string): ProposalDocument {
    const index = this.data.proposals.findIndex((p) => p.id === id);
    if (index === -1) throw new Error('PROPOSAL_NOT_FOUND');

    const proposal = this.data.proposals[index];
    proposal.status = status;
    if (clientNotes !== undefined) proposal.clientNotes = clientNotes;
    proposal.updatedAt = new Date().toISOString();

    this.persist();
    return proposal;
  }

  // --- SAVED PROJECTS METHODS ---
  public listSavedProjects(freelancerUserId: string): SavedProjectDocument[] {
    return this.data.savedProjects.filter((sp) => sp.freelancerId === freelancerUserId);
  }

  public toggleSaveProject(freelancerUserId: string, projectId: string): boolean {
    const index = this.data.savedProjects.findIndex(
      (sp) => sp.freelancerId === freelancerUserId && sp.projectId === projectId
    );

    if (index !== -1) {
      this.data.savedProjects.splice(index, 1);
      this.persist();
      return false;
    } else {
      this.data.savedProjects.push({
        id: `sp-${crypto.randomUUID()}`,
        freelancerId: freelancerUserId,
        projectId,
        createdAt: new Date().toISOString(),
      });
      this.persist();
      return true;
    }
  }

  // --- CATEGORIES & SKILLS METHODS ---
  public listCategories(): CategoryDocument[] {
    return [...this.data.categories];
  }

  public findCategoryByIdOrSlug(idOrSlug: string): CategoryDocument | undefined {
    return this.data.categories.find((c) => c.id === idOrSlug || c.slug === idOrSlug);
  }

  public createCategory(data: Omit<CategoryDocument, 'id' | 'projectCount'>): CategoryDocument {
    const newCat: CategoryDocument = {
      ...data,
      id: `cat-${crypto.randomUUID()}`,
      projectCount: 0,
    };
    this.data.categories.push(newCat);
    this.persist();
    return newCat;
  }

  public updateCategory(id: string, partial: Partial<CategoryDocument>): CategoryDocument {
    const index = this.data.categories.findIndex((c) => c.id === id);
    if (index === -1) throw new Error('CATEGORY_NOT_FOUND');

    const updated = { ...this.data.categories[index], ...partial };
    this.data.categories[index] = updated;
    this.persist();
    return updated;
  }

  public listSkills(): SkillDocument[] {
    return [...this.data.skills];
  }

  // ==========================================
  // --- PHASE 5: CONTRACTS & MILESTONES ---
  // ==========================================

  public listContracts(filter?: {
    sellerId?: string;
    freelancerUserId?: string;
    projectId?: string;
    status?: ContractStatus;
  }): ContractDocument[] {
    let result = [...this.data.contracts];
    if (filter) {
      if (filter.sellerId) result = result.filter((c) => c.sellerId === filter.sellerId);
      if (filter.freelancerUserId) result = result.filter((c) => c.freelancerUserId === filter.freelancerUserId);
      if (filter.projectId) result = result.filter((c) => c.projectId === filter.projectId);
      if (filter.status) result = result.filter((c) => c.status === filter.status);
    }
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public findContractById(id: string): ContractDocument | undefined {
    return this.data.contracts.find((c) => c.id === id);
  }

  public createContract(data: Omit<ContractDocument, 'id' | 'createdAt' | 'updatedAt' | 'totalMinorUnits'>): ContractDocument {
    const newContract: ContractDocument = {
      ...data,
      id: `cnt-${crypto.randomUUID().slice(0, 8)}`,
      totalMinorUnits: Math.round(data.totalAmount * 100),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.contracts.unshift(newContract);
    this.persist();
    return newContract;
  }

  public updateContract(id: string, partial: Partial<ContractDocument>): ContractDocument {
    const index = this.data.contracts.findIndex((c) => c.id === id);
    if (index === -1) throw new Error('CONTRACT_NOT_FOUND');

    const updated = {
      ...this.data.contracts[index],
      ...partial,
      updatedAt: new Date().toISOString(),
    };
    this.data.contracts[index] = updated;
    this.persist();
    return updated;
  }

  public listMilestones(contractId?: string, projectId?: string): MilestoneDocument[] {
    let result = [...this.data.milestones];
    if (contractId) result = result.filter((m) => m.contractId === contractId);
    if (projectId) result = result.filter((m) => m.projectId === projectId);
    return result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  public findMilestoneById(id: string): MilestoneDocument | undefined {
    return this.data.milestones.find((m) => m.id === id);
  }

  public createMilestone(data: Omit<MilestoneDocument, 'id' | 'createdAt' | 'updatedAt' | 'minorUnits'>): MilestoneDocument {
    const newMilestone: MilestoneDocument = {
      ...data,
      id: `ms-${crypto.randomUUID().slice(0, 8)}`,
      minorUnits: Math.round(data.amount * 100),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.milestones.push(newMilestone);
    this.persist();
    return newMilestone;
  }

  public updateMilestone(id: string, partial: Partial<MilestoneDocument>): MilestoneDocument {
    const index = this.data.milestones.findIndex((m) => m.id === id);
    if (index === -1) throw new Error('MILESTONE_NOT_FOUND');

    const updated = {
      ...this.data.milestones[index],
      ...partial,
      updatedAt: new Date().toISOString(),
    };
    this.data.milestones[index] = updated;
    this.persist();
    return updated;
  }

  // ==========================================
  // --- PHASE 5: PLATFORM SETTINGS ---
  // ==========================================

  public getPlatformSettings(): PlatformSettingsDocument {
    return { ...this.data.platformSettings };
  }

  public updatePlatformSettings(partial: Partial<PlatformSettingsDocument>): PlatformSettingsDocument {
    this.data.platformSettings = {
      ...this.data.platformSettings,
      ...partial,
      updatedAt: new Date().toISOString(),
    };
    this.persist();
    return this.data.platformSettings;
  }

  // ==========================================
  // --- PHASE 5: PAYMENTS & FINANCIALS ---
  // ==========================================

  public createPayment(data: Omit<PaymentDocument, 'id' | 'createdAt' | 'updatedAt'>): PaymentDocument {
    const newPayment: PaymentDocument = {
      ...data,
      id: `pay-${crypto.randomUUID().slice(0, 8)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.payments.unshift(newPayment);
    this.persist();
    return newPayment;
  }

  public findPaymentById(id: string): PaymentDocument | undefined {
    return this.data.payments.find((p) => p.id === id);
  }

  public findPaymentByOrderId(orderId: string): PaymentDocument | undefined {
    return this.data.payments.find((p) => p.providerOrderId === orderId);
  }

  public findPaymentByMilestoneId(milestoneId: string): PaymentDocument | undefined {
    return this.data.payments.find((p) => p.milestoneId === milestoneId && p.status === 'PAID');
  }

  public updatePayment(id: string, partial: Partial<PaymentDocument>): PaymentDocument {
    const index = this.data.payments.findIndex((p) => p.id === id);
    if (index === -1) throw new Error('PAYMENT_NOT_FOUND');

    const updated = {
      ...this.data.payments[index],
      ...partial,
      updatedAt: new Date().toISOString(),
    };
    this.data.payments[index] = updated;
    this.persist();
    return updated;
  }

  public listPayments(filter?: { sellerId?: string; freelancerId?: string; status?: PaymentStatus }): PaymentDocument[] {
    let result = [...this.data.payments];
    if (filter) {
      if (filter.sellerId) result = result.filter((p) => p.sellerId === filter.sellerId);
      if (filter.freelancerId) result = result.filter((p) => p.freelancerId === filter.freelancerId);
      if (filter.status) result = result.filter((p) => p.status === filter.status);
    }
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // --- TRANSACTIONS (IMMUTABLE) ---
  public createTransaction(data: Omit<TransactionDocument, 'id' | 'createdAt'>): TransactionDocument {
    const tx: TransactionDocument = {
      ...data,
      id: `tx-${crypto.randomUUID().slice(0, 8)}`,
      createdAt: new Date().toISOString(),
    };
    this.data.transactions.unshift(tx);
    this.persist();
    return tx;
  }

  public listTransactions(filter?: {
    userId?: string;
    type?: TransactionType;
    status?: string;
  }): TransactionDocument[] {
    let result = [...this.data.transactions];
    if (filter) {
      if (filter.userId) result = result.filter((t) => t.userId === filter.userId || t.userId === 'platform');
      if (filter.type) result = result.filter((t) => t.type === filter.type);
      if (filter.status) result = result.filter((t) => t.status === filter.status);
    }
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // --- WALLET & LEDGER ---
  public getOrCreateWallet(userId: string, currency: 'INR' | 'USD' = 'INR'): WalletDocument {
    let wallet = this.data.wallets.find((w) => w.userId === userId);
    if (!wallet) {
      wallet = {
        id: `wal-${crypto.randomUUID().slice(0, 8)}`,
        userId,
        currency,
        availableBalance: 0,
        availableMinorUnits: 0,
        pendingBalance: 0,
        pendingMinorUnits: 0,
        totalEarned: 0,
        totalEarnedMinorUnits: 0,
        totalWithdrawn: 0,
        totalWithdrawnMinorUnits: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.data.wallets.push(wallet);
      this.persist();
    }
    return wallet;
  }

  public getWalletLedger(userId: string): WalletLedgerDocument[] {
    return this.data.walletLedgers
      .filter((l) => l.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Atomic ledger credit with safe integer arithmetic
  public recordLedgerCredit(
    userId: string,
    amount: number,
    type: LedgerType,
    referenceType: 'MILESTONE' | 'PAYOUT' | 'REFUND' | 'ADMIN',
    referenceId: string,
    description: string,
    isAvailable = true
  ): { wallet: WalletDocument; ledger: WalletLedgerDocument } {
    const wallet = this.getOrCreateWallet(userId);
    const balanceBefore = isAvailable ? wallet.availableBalance : wallet.pendingBalance;
    const balanceAfter = balanceBefore + amount;

    if (isAvailable) {
      wallet.availableBalance = balanceAfter;
      wallet.availableMinorUnits = Math.round(balanceAfter * 100);
      wallet.totalEarned += amount;
      wallet.totalEarnedMinorUnits = Math.round(wallet.totalEarned * 100);
    } else {
      wallet.pendingBalance = balanceAfter;
      wallet.pendingMinorUnits = Math.round(balanceAfter * 100);
    }
    wallet.updatedAt = new Date().toISOString();

    const ledger: WalletLedgerDocument = {
      id: `led-${crypto.randomUUID().slice(0, 8)}`,
      walletId: wallet.id,
      userId,
      type,
      direction: 'CREDIT',
      amount,
      minorUnits: Math.round(amount * 100),
      currency: wallet.currency,
      referenceType,
      referenceId,
      balanceBefore,
      balanceAfter,
      description,
      createdAt: new Date().toISOString(),
    };

    this.data.walletLedgers.unshift(ledger);
    this.persist();
    return { wallet, ledger };
  }

  // Atomic ledger debit with safe balance verification
  public recordLedgerDebit(
    userId: string,
    amount: number,
    type: LedgerType,
    referenceType: 'MILESTONE' | 'PAYOUT' | 'REFUND' | 'ADMIN',
    referenceId: string,
    description: string
  ): { wallet: WalletDocument; ledger: WalletLedgerDocument } {
    const wallet = this.getOrCreateWallet(userId);
    if (wallet.availableBalance < amount) {
      throw new Error('INSUFFICIENT_WALLET_BALANCE');
    }

    const balanceBefore = wallet.availableBalance;
    const balanceAfter = balanceBefore - amount;

    wallet.availableBalance = balanceAfter;
    wallet.availableMinorUnits = Math.round(balanceAfter * 100);
    if (type === 'WITHDRAWAL') {
      wallet.totalWithdrawn += amount;
      wallet.totalWithdrawnMinorUnits = Math.round(wallet.totalWithdrawn * 100);
    }
    wallet.updatedAt = new Date().toISOString();

    const ledger: WalletLedgerDocument = {
      id: `led-${crypto.randomUUID().slice(0, 8)}`,
      walletId: wallet.id,
      userId,
      type,
      direction: 'DEBIT',
      amount,
      minorUnits: Math.round(amount * 100),
      currency: wallet.currency,
      referenceType,
      referenceId,
      balanceBefore,
      balanceAfter,
      description,
      createdAt: new Date().toISOString(),
    };

    this.data.walletLedgers.unshift(ledger);
    this.persist();
    return { wallet, ledger };
  }

  // --- MILESTONE FUNDING & RELEASE (ATOMIC & IDEMPOTENT) ---
  public completeMilestoneFunding(
    milestoneId: string,
    paymentId: string
  ): { milestone: MilestoneDocument; payment: PaymentDocument; invoice: InvoiceDocument } {
    const milestone = this.findMilestoneById(milestoneId);
    if (!milestone) throw new Error('MILESTONE_NOT_FOUND');

    const payment = this.findPaymentById(paymentId);
    if (!payment) throw new Error('PAYMENT_NOT_FOUND');

    if (milestone.paymentStatus === 'FUNDED') {
      const inv = this.findInvoiceByPaymentId(paymentId);
      return { milestone, payment, invoice: inv! };
    }

    milestone.paymentStatus = 'FUNDED';
    milestone.workflowStatus = 'IN_PROGRESS';
    milestone.fundedAt = new Date().toISOString();
    milestone.updatedAt = new Date().toISOString();

    payment.status = 'PAID';
    payment.paidAt = new Date().toISOString();
    payment.updatedAt = new Date().toISOString();

    // Create immutable transaction for seller escrow funding
    this.createTransaction({
      userId: payment.sellerId,
      projectId: milestone.projectId,
      contractId: milestone.contractId,
      milestoneId: milestone.id,
      paymentId: payment.id,
      type: 'ESCROW_FUND',
      direction: 'DEBIT',
      amount: payment.totalAmount,
      minorUnits: payment.totalAmountMinorUnits,
      currency: payment.currency,
      status: 'COMPLETED',
      reference: payment.providerPaymentId || payment.providerOrderId || payment.id,
      description: `Funded Milestone: "${milestone.title}" secured in escrow`,
    });

    // Generate unique sequential invoice
    const invCount = this.data.invoices.length + 1;
    const invoiceNumber = `INV-2026-${String(invCount).padStart(6, '0')}`;
    const seller = this.findUserById(payment.sellerId);
    const sellerProfile = this.findSellerProfileByUserId(payment.sellerId);
    const flUser = this.findUserById(payment.freelancerId);
    const project = this.findProjectById(milestone.projectId);

    const invoice: InvoiceDocument = {
      id: `inv-${crypto.randomUUID().slice(0, 8)}`,
      invoiceNumber,
      paymentId: payment.id,
      sellerId: payment.sellerId,
      sellerName: seller ? `${seller.firstName} ${seller.lastName}` : 'WorkNova Employer',
      sellerCompany: sellerProfile?.businessName || 'Client Organization',
      freelancerId: payment.freelancerId,
      freelancerName: flUser ? `${flUser.firstName} ${flUser.lastName}` : 'Verified Specialist',
      projectId: milestone.projectId,
      projectTitle: project?.title || 'Marketplace Project',
      milestoneId: milestone.id,
      milestoneTitle: milestone.title,
      subtotal: payment.amount,
      platformFee: payment.platformFee,
      tax: payment.taxAmount,
      total: payment.totalAmount,
      currency: payment.currency,
      status: 'PAID',
      issuedAt: new Date().toISOString(),
      dueAt: new Date().toISOString(),
      paidAt: new Date().toISOString(),
    };
    this.data.invoices.unshift(invoice);

    // Update pending balance in freelancer wallet
    const feeRate = payment.platformFeeRate || this.data.platformSettings.defaultPlatformFeeRate;
    const netEarnings = Math.round(payment.amount * (1 - feeRate));
    const flWallet = this.getOrCreateWallet(payment.freelancerId, payment.currency);
    flWallet.pendingBalance += netEarnings;
    flWallet.pendingMinorUnits = Math.round(flWallet.pendingBalance * 100);
    flWallet.updatedAt = new Date().toISOString();

    this.recordFinancialAudit('MILESTONE_FUNDED', {
      milestoneId,
      paymentId,
      totalAmount: payment.totalAmount,
      invoiceNumber,
    }, payment.sellerId);

    this.persist();
    return { milestone, payment, invoice };
  }

  public releaseMilestonePayment(
    milestoneId: string,
    approvedByUserId: string
  ): { milestone: MilestoneDocument; payment: PaymentDocument; netAmount: number; feeAmount: number } {
    const milestone = this.findMilestoneById(milestoneId);
    if (!milestone) throw new Error('MILESTONE_NOT_FOUND');

    if (milestone.paymentStatus === 'RELEASED') {
      throw new Error('MILESTONE_ALREADY_RELEASED');
    }
    if (milestone.paymentStatus !== 'FUNDED' && milestone.paymentStatus !== 'RELEASE_PENDING') {
      throw new Error('MILESTONE_NOT_FUNDED');
    }

    const payment = this.findPaymentByMilestoneId(milestoneId);
    if (!payment) throw new Error('NO_CONFIRMED_PAYMENT_FOUND');

    // Historical platform fee protection
    const feeRate = payment.platformFeeRate || this.data.platformSettings.defaultPlatformFeeRate;
    const feeAmount = Math.round(milestone.amount * feeRate);
    const netAmount = milestone.amount - feeAmount;

    // Concurrency protection: update status first
    milestone.paymentStatus = 'RELEASED';
    milestone.workflowStatus = 'APPROVED';
    milestone.approvedAt = new Date().toISOString();
    milestone.releasedAt = new Date().toISOString();
    milestone.updatedAt = new Date().toISOString();

    // Adjust pending balance and credit available balance in freelancer wallet
    const wallet = this.getOrCreateWallet(payment.freelancerId, payment.currency);
    wallet.pendingBalance = Math.max(0, wallet.pendingBalance - netAmount);
    wallet.pendingMinorUnits = Math.round(wallet.pendingBalance * 100);

    // Record wallet ledger credit for net earnings
    this.recordLedgerCredit(
      payment.freelancerId,
      netAmount,
      'EARNING',
      'MILESTONE',
      milestone.id,
      `Milestone Released: ${milestone.title} (Net after ${Math.round(feeRate * 100)}% platform fee)`
    );

    // Create immutable transaction records
    this.createTransaction({
      userId: payment.freelancerId,
      projectId: milestone.projectId,
      contractId: milestone.contractId,
      milestoneId: milestone.id,
      paymentId: payment.id,
      type: 'ESCROW_RELEASE',
      direction: 'CREDIT',
      amount: netAmount,
      minorUnits: netAmount * 100,
      currency: payment.currency,
      status: 'COMPLETED',
      reference: milestone.id,
      description: `Payment released for milestone: ${milestone.title}`,
    });

    this.createTransaction({
      userId: 'platform',
      projectId: milestone.projectId,
      contractId: milestone.contractId,
      milestoneId: milestone.id,
      paymentId: payment.id,
      type: 'PLATFORM_FEE',
      direction: 'CREDIT',
      amount: feeAmount,
      minorUnits: feeAmount * 100,
      currency: payment.currency,
      status: 'COMPLETED',
      reference: milestone.id,
      description: `Platform fee (${Math.round(feeRate * 100)}%) for milestone: ${milestone.title}`,
    });

    this.recordFinancialAudit('MILESTONE_RELEASED', {
      milestoneId,
      paymentId: payment.id,
      grossAmount: milestone.amount,
      feeAmount,
      netAmount,
      approvedBy: approvedByUserId,
    }, payment.freelancerId);

    this.persist();
    return { milestone, payment, netAmount, feeAmount };
  }

  // --- INVOICES METHODS ---
  public listInvoices(filter?: { sellerId?: string; freelancerId?: string }): InvoiceDocument[] {
    let result = [...this.data.invoices];
    if (filter) {
      if (filter.sellerId) result = result.filter((i) => i.sellerId === filter.sellerId);
      if (filter.freelancerId) result = result.filter((i) => i.freelancerId === filter.freelancerId);
    }
    return result.sort((a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime());
  }

  public findInvoiceById(id: string): InvoiceDocument | undefined {
    return this.data.invoices.find((i) => i.id === id || i.invoiceNumber === id);
  }

  public findInvoiceByPaymentId(paymentId: string): InvoiceDocument | undefined {
    return this.data.invoices.find((i) => i.paymentId === paymentId);
  }

  // --- PAYOUTS (WITHDRAWALS) METHODS ---
  public createPayoutRequest(
    userId: string,
    amount: number,
    method: 'BANK_TRANSFER' | 'UPI' | 'PAYPAL',
    accountDetailsReference: string
  ): { payout: PayoutDocument; wallet: WalletDocument } {
    const settings = this.data.platformSettings;
    if (amount < settings.minWithdrawalAmount) {
      throw new Error(`MINIMUM_WITHDRAWAL_IS_${settings.minWithdrawalAmount}`);
    }
    if (amount > settings.maxWithdrawalAmount) {
      throw new Error(`MAXIMUM_WITHDRAWAL_IS_${settings.maxWithdrawalAmount}`);
    }

    // Debit wallet atomically
    const { wallet } = this.recordLedgerDebit(
      userId,
      amount,
      'WITHDRAWAL',
      'PAYOUT',
      `pout-${Date.now()}`,
      `Withdrawal request via ${method} (${accountDetailsReference})`
    );

    const payout: PayoutDocument = {
      id: `pout-${crypto.randomUUID().slice(0, 8)}`,
      userId,
      walletId: wallet.id,
      amount,
      minorUnits: Math.round(amount * 100),
      currency: wallet.currency,
      method,
      accountDetailsReference,
      provider: 'RAZORPAY_X',
      status: 'PROCESSING',
      requestedAt: new Date().toISOString(),
    };
    this.data.payouts.unshift(payout);

    this.createTransaction({
      userId,
      type: 'PAYOUT',
      direction: 'DEBIT',
      amount,
      minorUnits: Math.round(amount * 100),
      currency: wallet.currency,
      status: 'PENDING',
      reference: payout.id,
      description: `Payout withdrawal request to ${accountDetailsReference}`,
    });

    this.recordFinancialAudit('PAYOUT_REQUESTED', {
      poutId: payout.id,
      amount,
      method,
      accountReference: accountDetailsReference,
    }, userId);

    this.persist();
    return { payout, wallet };
  }

  public listPayouts(userId?: string): PayoutDocument[] {
    let result = [...this.data.payouts];
    if (userId) result = result.filter((p) => p.userId === userId);
    return result.sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());
  }

  public findPayoutById(id: string): PayoutDocument | undefined {
    return this.data.payouts.find((p) => p.id === id);
  }

  public updatePayoutStatus(id: string, status: PayoutStatus, failureReason?: string): PayoutDocument {
    const index = this.data.payouts.findIndex((p) => p.id === id);
    if (index === -1) throw new Error('PAYOUT_NOT_FOUND');

    const current = this.data.payouts[index];
    current.status = status;
    if (failureReason) current.failureReason = failureReason;
    if (status === 'COMPLETED') current.processedAt = new Date().toISOString();

    // If payout failed, restore balance safely via REVERSAL ledger entry
    if (status === 'FAILED') {
      this.recordLedgerCredit(
        current.userId,
        current.amount,
        'REVERSAL',
        'PAYOUT',
        current.id,
        `Reversal for failed payout ${current.id}: ${failureReason || 'Provider declined'}`
      );
      const wal = this.getOrCreateWallet(current.userId);
      wal.totalWithdrawn = Math.max(0, wal.totalWithdrawn - current.amount);
    }

    this.recordFinancialAudit('PAYOUT_STATUS_UPDATED', { payoutId: id, status, failureReason }, current.userId);
    this.persist();
    return current;
  }

  // --- REFUNDS METHODS ---
  public requestRefund(
    paymentId: string,
    requestedBy: string,
    amount: number,
    reason: string
  ): RefundDocument {
    const payment = this.findPaymentById(paymentId);
    if (!payment) throw new Error('PAYMENT_NOT_FOUND');
    if (payment.status !== 'PAID') throw new Error('PAYMENT_NOT_ELIGIBLE_FOR_REFUND');

    const milestone = this.findMilestoneById(payment.milestoneId);
    if (milestone && milestone.paymentStatus === 'RELEASED') {
      throw new Error('CANNOT_REFUND_RELEASED_MILESTONE');
    }

    // Validate refund <= original amount
    const existingRefunds = this.data.refunds.filter(
      (r) => r.paymentId === paymentId && (r.status === 'COMPLETED' || r.status === 'PROCESSING')
    );
    const alreadyRefunded = existingRefunds.reduce((sum, r) => sum + r.amount, 0);
    if (alreadyRefunded + amount > payment.amount) {
      throw new Error('REFUND_EXCEEDS_PAYMENT_AMOUNT');
    }

    const refund: RefundDocument = {
      id: `rfnd-${crypto.randomUUID().slice(0, 8)}`,
      paymentId,
      projectId: payment.projectId,
      milestoneId: payment.milestoneId,
      requestedBy,
      amount,
      minorUnits: Math.round(amount * 100),
      currency: payment.currency,
      reason,
      status: 'PROCESSING',
      createdAt: new Date().toISOString(),
    };
    this.data.refunds.unshift(refund);

    this.recordFinancialAudit('REFUND_REQUESTED', { refundId: refund.id, paymentId, amount, reason }, requestedBy);
    this.persist();
    return refund;
  }

  public listRefunds(): RefundDocument[] {
    return [...this.data.refunds].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public findRefundById(id: string): RefundDocument | undefined {
    return this.data.refunds.find((r) => r.id === id);
  }

  public updateRefundStatus(id: string, status: RefundStatus): RefundDocument {
    const index = this.data.refunds.findIndex((r) => r.id === id);
    if (index === -1) throw new Error('REFUND_NOT_FOUND');

    const refund = this.data.refunds[index];
    refund.status = status;
    if (status === 'COMPLETED') {
      refund.processedAt = new Date().toISOString();

      const milestone = this.findMilestoneById(refund.milestoneId);
      if (milestone) {
        milestone.paymentStatus = 'REFUNDED';
        milestone.workflowStatus = 'CANCELLED';
      }

      const payment = this.findPaymentById(refund.paymentId);
      if (payment) {
        payment.status = refund.amount >= payment.amount ? 'REFUNDED' : 'PARTIALLY_REFUNDED';
      }

      this.createTransaction({
        userId: refund.requestedBy,
        projectId: refund.projectId,
        milestoneId: refund.milestoneId,
        paymentId: refund.paymentId,
        type: 'REFUND',
        direction: 'CREDIT',
        amount: refund.amount,
        minorUnits: refund.minorUnits,
        currency: refund.currency,
        status: 'COMPLETED',
        reference: refund.id,
        description: `Refund processed: ${refund.reason}`,
      });
    }

    this.recordFinancialAudit('REFUND_STATUS_UPDATED', { refundId: id, status }, refund.requestedBy);
    this.persist();
    return refund;
  }

  // --- FINANCIAL AUDIT & WEBHOOK IDEMPOTENCY ---
  public recordFinancialAudit(
    action: string,
    details: Record<string, unknown>,
    userId?: string,
    userEmail?: string
  ): FinancialAuditLogDocument {
    const entry: FinancialAuditLogDocument = {
      id: `faudit-${crypto.randomUUID().slice(0, 8)}`,
      action,
      userId,
      userEmail,
      details,
      createdAt: new Date().toISOString(),
    };
    this.data.financialAuditLogs.unshift(entry);
    if (this.data.financialAuditLogs.length > 1000) {
      this.data.financialAuditLogs = this.data.financialAuditLogs.slice(0, 1000);
    }
    this.persist();
    return entry;
  }

  public listFinancialAuditLogs(limit = 100): FinancialAuditLogDocument[] {
    return this.data.financialAuditLogs.slice(0, limit);
  }

  public hasWebhookBeenProcessed(providerEventId: string): boolean {
    return this.data.processedWebhooks.some((w) => w.providerEventId === providerEventId);
  }

  public recordProcessedWebhook(providerEventId: string, provider: string, eventType: string): void {
    this.data.processedWebhooks.unshift({
      id: `pwh-${crypto.randomUUID().slice(0, 8)}`,
      providerEventId,
      provider,
      eventType,
      createdAt: new Date().toISOString(),
    });
    this.persist();
  }

  // ==========================================
  // PHASE 6: MESSAGING & CONVERSATIONS
  // ==========================================

  public findConversationById(id: string): ConversationDocument | undefined {
    return this.data.conversations.find((c) => c.id === id);
  }

  public findConversationByProject(projectId: string, sellerId: string, freelancerId: string): ConversationDocument | undefined {
    return this.data.conversations.find(
      (c) =>
        c.projectId === projectId &&
        ((c.sellerId === sellerId && c.freelancerId === freelancerId) ||
          (c.sellerId === freelancerId && c.freelancerId === sellerId))
    );
  }

  public listUserConversations(userId: string): Array<
    ConversationDocument & {
      otherUser: {
        id: string;
        name: string;
        role: UserRole;
        avatarUrl?: string;
        companyName?: string;
      };
      projectTitle: string;
    }
  > {
    const list = this.data.conversations
      .filter((c) => c.sellerId === userId || c.freelancerId === userId)
      .sort((a, b) => new Date(b.lastMessageAt || b.updatedAt).getTime() - new Date(a.lastMessageAt || a.updatedAt).getTime());

    return list.map((c) => {
      const otherUserId = c.sellerId === userId ? c.freelancerId : c.sellerId;
      const otherUser = this.findUserById(otherUserId);
      const project = this.findProjectById(c.projectId);

      let companyName: string | undefined;
      let avatarUrl: string | undefined = otherUser?.avatarUrl;
      if (otherUser?.role === 'SELLER') {
        const selProf = this.findSellerProfileByUserId(otherUser.id);
        companyName = selProf?.companyName || selProf?.businessName;
      }

      return {
        ...c,
        otherUser: {
          id: otherUserId,
          name: otherUser ? `${otherUser.firstName} ${otherUser.lastName}` : 'WorkNova User',
          role: otherUser?.role || 'FREELANCER',
          avatarUrl,
          companyName,
        },
        projectTitle: project?.title || 'Marketplace Project',
      };
    });
  }

  public createConversation(
    data: Omit<ConversationDocument, 'id' | 'createdAt' | 'updatedAt' | 'unreadCountSeller' | 'unreadCountFreelancer'>
  ): ConversationDocument {
    const existing = this.findConversationByProject(data.projectId, data.sellerId, data.freelancerId);
    if (existing) return existing;

    const conv: ConversationDocument = {
      ...data,
      id: `conv-${crypto.randomUUID().slice(0, 8)}`,
      unreadCountSeller: 0,
      unreadCountFreelancer: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.data.conversations.unshift(conv);
    this.persist();
    return conv;
  }

  public updateConversation(id: string, partial: Partial<ConversationDocument>): ConversationDocument {
    const index = this.data.conversations.findIndex((c) => c.id === id);
    if (index === -1) throw new Error('CONVERSATION_NOT_FOUND');

    const updated = {
      ...this.data.conversations[index],
      ...partial,
      updatedAt: new Date().toISOString(),
    };

    this.data.conversations[index] = updated;
    this.persist();
    return updated;
  }

  public findMessageById(id: string): MessageDocument | undefined {
    return this.data.messages.find((m) => m.id === id);
  }

  public getConversationMessages(
    conversationId: string,
    options?: { limit?: number; before?: string; search?: string }
  ): MessageDocument[] {
    let list = this.data.messages.filter((m) => m.conversationId === conversationId);

    if (options?.search) {
      const q = options.search.toLowerCase();
      list = list.filter((m) => m.content.toLowerCase().includes(q) && m.status !== 'DELETED');
    }

    if (options?.before) {
      const beforeDate = new Date(options.before).getTime();
      list = list.filter((m) => new Date(m.createdAt).getTime() < beforeDate);
    }

    list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    const limit = options?.limit || 50;
    if (list.length > limit) {
      list = list.slice(list.length - limit);
    }

    return list;
  }

  public createMessage(
    data: Omit<MessageDocument, 'id' | 'createdAt' | 'updatedAt' | 'status'> & { status?: MessageStatus }
  ): MessageDocument {
    const msg: MessageDocument = {
      ...data,
      id: `msg-${crypto.randomUUID().slice(0, 8)}`,
      status: data.status || 'SENT',
      attachments: data.attachments || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.data.messages.push(msg);

    // Update conversation lastMessageAt & snippet & unread
    const conv = this.findConversationById(data.conversationId);
    if (conv) {
      conv.lastMessageSnippet = data.messageType === 'FILE' ? `[File] ${data.attachments[0]?.name || 'Attachment'}` : data.content.slice(0, 100);
      conv.lastMessageAt = msg.createdAt;
      conv.lastSenderId = data.senderId;
      if (data.senderId === conv.sellerId) {
        conv.unreadCountFreelancer = (conv.unreadCountFreelancer || 0) + 1;
      } else if (data.senderId === conv.freelancerId) {
        conv.unreadCountSeller = (conv.unreadCountSeller || 0) + 1;
      }
      conv.updatedAt = new Date().toISOString();
    }

    this.persist();
    return msg;
  }

  public updateMessage(id: string, partial: Partial<MessageDocument>): MessageDocument {
    const index = this.data.messages.findIndex((m) => m.id === id);
    if (index === -1) throw new Error('MESSAGE_NOT_FOUND');

    const updated = {
      ...this.data.messages[index],
      ...partial,
      updatedAt: new Date().toISOString(),
    };

    this.data.messages[index] = updated;
    this.persist();
    return updated;
  }

  public softDeleteMessage(id: string, userId: string): MessageDocument {
    const msg = this.findMessageById(id);
    if (!msg) throw new Error('MESSAGE_NOT_FOUND');
    if (msg.senderId !== userId) throw new Error('FORBIDDEN_DELETE');

    msg.status = 'DELETED';
    msg.content = 'This message was deleted.';
    msg.deletedAt = new Date().toISOString();
    msg.updatedAt = new Date().toISOString();
    msg.attachments = [];
    this.persist();
    return msg;
  }

  public markConversationMessagesRead(conversationId: string, readerUserId: string): number {
    let count = 0;
    const now = new Date().toISOString();
    for (const msg of this.data.messages) {
      if (msg.conversationId === conversationId && msg.senderId !== readerUserId && msg.status !== 'READ' && msg.status !== 'DELETED') {
        msg.status = 'READ';
        msg.updatedAt = now;
        count++;
      }
    }

    const conv = this.findConversationById(conversationId);
    if (conv) {
      if (readerUserId === conv.sellerId) {
        conv.unreadCountSeller = 0;
      } else if (readerUserId === conv.freelancerId) {
        conv.unreadCountFreelancer = 0;
      }
    }

    if (count > 0 || conv) {
      this.persist();
    }
    return count;
  }

  // ==========================================
  // PHASE 6: NOTIFICATIONS
  // ==========================================

  public createNotification(data: Omit<NotificationDocument, 'id' | 'createdAt' | 'read'>): NotificationDocument {
    const notif: NotificationDocument = {
      ...data,
      id: `notif-${crypto.randomUUID().slice(0, 8)}`,
      read: false,
      createdAt: new Date().toISOString(),
    };

    this.data.notifications.unshift(notif);
    if (this.data.notifications.length > 2000) {
      this.data.notifications = this.data.notifications.slice(0, 2000);
    }
    this.persist();
    return notif;
  }

  public listUserNotifications(
    userId: string,
    filter?: { unreadOnly?: boolean; type?: string; limit?: number }
  ): NotificationDocument[] {
    let list = this.data.notifications.filter((n) => n.userId === userId);

    if (filter?.unreadOnly) {
      list = list.filter((n) => !n.read);
    }

    if (filter?.type && filter.type !== 'ALL') {
      const t = filter.type.toUpperCase();
      if (t === 'MESSAGES') {
        list = list.filter((n) => n.type === 'NEW_MESSAGE');
      } else if (t === 'PROJECTS') {
        list = list.filter((n) =>
          ['PROPOSAL_SUBMITTED', 'PROPOSAL_VIEWED', 'PROPOSAL_SHORTLISTED', 'CONTRACT_RECEIVED', 'CONTRACT_ACCEPTED', 'DELIVERY_SUBMITTED', 'REVISION_REQUESTED', 'DELIVERY_APPROVED', 'PROJECT_COMPLETED'].includes(n.type)
        );
      } else if (t === 'PAYMENTS') {
        list = list.filter((n) =>
          ['PAYMENT_SUCCESS', 'PAYMENT_FAILED', 'PAYOUT_COMPLETED', 'PAYOUT_FAILED', 'MILESTONE_FUNDED'].includes(n.type)
        );
      } else if (t === 'SUPPORT') {
        list = list.filter((n) => ['SUPPORT_REPLY', 'DISPUTE_CREATED', 'DISPUTE_UPDATED', 'ACCOUNT_WARNING'].includes(n.type));
      } else {
        list = list.filter((n) => n.type === t);
      }
    }

    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return list.slice(0, filter?.limit || 50);
  }

  public markNotificationRead(id: string, userId: string): NotificationDocument | undefined {
    const notif = this.data.notifications.find((n) => n.id === id && n.userId === userId);
    if (notif) {
      notif.read = true;
      this.persist();
    }
    return notif;
  }

  public markAllNotificationsRead(userId: string): number {
    let count = 0;
    for (const n of this.data.notifications) {
      if (n.userId === userId && !n.read) {
        n.read = true;
        count++;
      }
    }
    if (count > 0) this.persist();
    return count;
  }

  public getUnreadNotificationCount(userId: string): number {
    return this.data.notifications.filter((n) => n.userId === userId && !n.read).length;
  }

  public getUserNotificationPreferences(userId: string): NotificationPreferencesDocument {
    const found = this.data.notificationPreferences.find((p) => p.userId === userId);
    if (found) return found;

    const defaultPrefs: NotificationPreferencesDocument = {
      userId,
      inApp: true,
      email: true,
      push: false,
      categories: {
        messages: true,
        projectUpdates: true,
        payments: true,
        reviews: true,
        support: true,
        marketing: false,
      },
    };
    this.data.notificationPreferences.push(defaultPrefs);
    this.persist();
    return defaultPrefs;
  }

  public updateUserNotificationPreferences(
    userId: string,
    prefs: Partial<NotificationPreferencesDocument>
  ): NotificationPreferencesDocument {
    let existing = this.getUserNotificationPreferences(userId);
    existing = {
      ...existing,
      ...prefs,
      categories: {
        ...existing.categories,
        ...(prefs.categories || {}),
      },
    };

    const idx = this.data.notificationPreferences.findIndex((p) => p.userId === userId);
    if (idx !== -1) {
      this.data.notificationPreferences[idx] = existing;
    } else {
      this.data.notificationPreferences.push(existing);
    }
    this.persist();
    return existing;
  }

  // ==========================================
  // PHASE 6: REVIEWS & RATINGS
  // ==========================================

  public findReviewById(id: string): ReviewDocument | undefined {
    return this.data.reviews.find((r) => r.id === id);
  }

  public listReviewsForUser(userId: string): ReviewDocument[] {
    return this.data.reviews
      .filter((r) => r.revieweeId === userId && r.status === 'PUBLISHED')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public listReviewsForProject(projectId: string): ReviewDocument[] {
    return this.data.reviews.filter((r) => r.projectId === projectId);
  }

  public createReview(
    data: Omit<ReviewDocument, 'id' | 'createdAt' | 'updatedAt' | 'status'> & { status?: ReviewStatus }
  ): ReviewDocument {
    // Validate bounds 1-5
    const cleanRating = Math.max(1, Math.min(5, Math.round(data.rating)));
    const cleanComm = Math.max(1, Math.min(5, Math.round(data.communicationRating)));
    const cleanQual = Math.max(1, Math.min(5, Math.round(data.qualityRating)));
    const cleanProf = Math.max(1, Math.min(5, Math.round(data.professionalismRating)));
    const cleanTime = Math.max(1, Math.min(5, Math.round(data.timelinessRating)));

    // Prevent duplicate reviews in same direction for same project
    const existing = this.data.reviews.find(
      (r) => r.projectId === data.projectId && r.reviewerId === data.reviewerId
    );
    if (existing) {
      throw new Error('DUPLICATE_REVIEW');
    }

    const review: ReviewDocument = {
      ...data,
      id: `rev-${crypto.randomUUID().slice(0, 8)}`,
      rating: cleanRating,
      communicationRating: cleanComm,
      qualityRating: cleanQual,
      professionalismRating: cleanProf,
      timelinessRating: cleanTime,
      status: data.status || 'PUBLISHED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.data.reviews.unshift(review);

    // Notify reviewee
    this.createNotification({
      userId: data.revieweeId,
      type: 'NEW_REVIEW',
      title: 'New review received',
      message: `You received a ${cleanRating}-star review for your completed project!`,
      entityType: 'review',
      entityId: review.id,
    });

    this.persist();
    return review;
  }

  public updateReview(id: string, partial: Partial<ReviewDocument>): ReviewDocument {
    const idx = this.data.reviews.findIndex((r) => r.id === id);
    if (idx === -1) throw new Error('REVIEW_NOT_FOUND');

    const current = this.data.reviews[idx];
    const updated: ReviewDocument = {
      ...current,
      ...partial,
      updatedAt: new Date().toISOString(),
    };

    this.data.reviews[idx] = updated;
    this.persist();
    return updated;
  }

  public getReviewAggregation(userId: string): {
    averageRating: number;
    totalReviews: number;
    distribution: { 1: number; 2: number; 3: number; 4: number; 5: number };
    categoryAverages: {
      communication: number;
      quality: number;
      professionalism: number;
      timeliness: number;
    };
  } {
    const published = this.data.reviews.filter((r) => r.revieweeId === userId && r.status === 'PUBLISHED');
    if (published.length === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        categoryAverages: { communication: 0, quality: 0, professionalism: 0, timeliness: 0 },
      };
    }

    const dist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let sumRating = 0;
    let sumComm = 0;
    let sumQual = 0;
    let sumProf = 0;
    let sumTime = 0;

    for (const r of published) {
      const rounded = Math.max(1, Math.min(5, Math.round(r.rating))) as 1 | 2 | 3 | 4 | 5;
      dist[rounded]++;
      sumRating += r.rating;
      sumComm += r.communicationRating;
      sumQual += r.qualityRating;
      sumProf += r.professionalismRating;
      sumTime += r.timelinessRating;
    }

    const n = published.length;
    return {
      averageRating: Number((sumRating / n).toFixed(1)),
      totalReviews: n,
      distribution: dist,
      categoryAverages: {
        communication: Number((sumComm / n).toFixed(1)),
        quality: Number((sumQual / n).toFixed(1)),
        professionalism: Number((sumProf / n).toFixed(1)),
        timeliness: Number((sumTime / n).toFixed(1)),
      },
    };
  }

  public listAllReviewsAdmin(): Array<ReviewDocument & { reviewerName: string; revieweeName: string; projectTitle: string }> {
    return this.data.reviews.map((r) => {
      const reviewer = this.findUserById(r.reviewerId);
      const reviewee = this.findUserById(r.revieweeId);
      const project = this.findProjectById(r.projectId);
      return {
        ...r,
        reviewerName: reviewer ? `${reviewer.firstName} ${reviewer.lastName}` : 'User',
        revieweeName: reviewee ? `${reviewee.firstName} ${reviewee.lastName}` : 'User',
        projectTitle: project?.title || 'Project',
      };
    });
  }

  public updateReviewStatusAdmin(id: string, status: ReviewStatus): ReviewDocument {
    const rev = this.findReviewById(id);
    if (!rev) throw new Error('REVIEW_NOT_FOUND');
    rev.status = status;
    rev.updatedAt = new Date().toISOString();
    this.persist();
    return rev;
  }

  // ==========================================
  // PHASE 6: REPORTS
  // ==========================================

  public createReport(data: Omit<ReportDocument, 'id' | 'createdAt' | 'updatedAt' | 'status'>): ReportDocument {
    const report: ReportDocument = {
      ...data,
      id: `rep-${crypto.randomUUID().slice(0, 8)}`,
      status: 'OPEN',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.data.reports.unshift(report);
    this.persist();
    return report;
  }

  public listReports(filter?: { status?: ReportStatus; type?: ReportType }): Array<
    ReportDocument & {
      reporterName: string;
      reporterEmail?: string;
      reportedUserName?: string;
    }
  > {
    let list = [...this.data.reports];
    if (filter?.status) {
      list = list.filter((r) => r.status === filter.status);
    }
    if (filter?.type) {
      list = list.filter((r) => r.type === filter.type);
    }

    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return list.map((r) => {
      const reporter = this.findUserById(r.reporterId);
      const reported = r.reportedUserId ? this.findUserById(r.reportedUserId) : undefined;
      return {
        ...r,
        reporterName: reporter ? `${reporter.firstName} ${reporter.lastName}` : 'User',
        reporterEmail: reporter?.email,
        reportedUserName: reported ? `${reported.firstName} ${reported.lastName}` : undefined,
      };
    });
  }

  public findReportById(id: string): ReportDocument | undefined {
    return this.data.reports.find((r) => r.id === id);
  }

  public updateReportStatus(id: string, status: ReportStatus, resolutionNotes?: string, adminId?: string): ReportDocument {
    const report = this.findReportById(id);
    if (!report) throw new Error('REPORT_NOT_FOUND');

    report.status = status;
    if (resolutionNotes) report.resolutionNotes = resolutionNotes;
    if (adminId) report.resolvedBy = adminId;
    report.updatedAt = new Date().toISOString();
    this.persist();
    return report;
  }

  // ==========================================
  // PHASE 6: DISPUTES
  // ==========================================

  public findDisputeById(id: string): DisputeDocument | undefined {
    return this.data.disputes.find((d) => d.id === id);
  }

  public listDisputes(filter?: { userId?: string; status?: DisputeStatus; priority?: DisputePriority }): Array<
    DisputeDocument & {
      openedByName: string;
      againstUserName: string;
      projectTitle: string;
    }
  > {
    let list = [...this.data.disputes];

    if (filter?.userId) {
      list = list.filter((d) => d.openedBy === filter.userId || d.againstUserId === filter.userId);
    }
    if (filter?.status) {
      list = list.filter((d) => d.status === filter.status);
    }
    if (filter?.priority) {
      list = list.filter((d) => d.priority === filter.priority);
    }

    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return list.map((d) => {
      const opener = this.findUserById(d.openedBy);
      const against = this.findUserById(d.againstUserId);
      const project = this.findProjectById(d.projectId);
      return {
        ...d,
        openedByName: opener ? `${opener.firstName} ${opener.lastName}` : 'User',
        againstUserName: against ? `${against.firstName} ${against.lastName}` : 'User',
        projectTitle: project?.title || 'Contract Project',
      };
    });
  }

  public createDispute(
    data: Omit<DisputeDocument, 'id' | 'createdAt' | 'updatedAt' | 'timeline' | 'evidence' | 'status'>
  ): DisputeDocument {
    const disputeId = `disp-${crypto.randomUUID().slice(0, 8)}`;
    const opener = this.findUserById(data.openedBy);

    const dispute: DisputeDocument = {
      ...data,
      id: disputeId,
      status: 'OPEN',
      evidence: [],
      timeline: [
        {
          id: `tl-${crypto.randomUUID().slice(0, 8)}`,
          actorId: data.openedBy,
          actorRole: opener?.role,
          event: 'Dispute opened for arbitration',
          note: data.description,
          createdAt: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.data.disputes.unshift(dispute);

    // Notify opposing party & admins
    this.createNotification({
      userId: data.againstUserId,
      type: 'DISPUTE_CREATED',
      title: 'Dispute opened on contract',
      message: `A dispute has been opened for arbitration: "${data.reason}". Please review the case and submit your response.`,
      entityType: 'dispute',
      entityId: dispute.id,
    });

    this.persist();
    return dispute;
  }

  public addDisputeEvidence(disputeId: string, evidence: Omit<DisputeEvidence, 'id' | 'createdAt'>): DisputeDocument {
    const dispute = this.findDisputeById(disputeId);
    if (!dispute) throw new Error('DISPUTE_NOT_FOUND');

    const ev: DisputeEvidence = {
      ...evidence,
      id: `ev-${crypto.randomUUID().slice(0, 8)}`,
      createdAt: new Date().toISOString(),
    };
    dispute.evidence.push(ev);
    dispute.timeline.push({
      id: `tl-${crypto.randomUUID().slice(0, 8)}`,
      actorId: evidence.uploadedBy,
      event: 'Evidence uploaded',
      note: evidence.title,
      createdAt: new Date().toISOString(),
    });
    dispute.updatedAt = new Date().toISOString();
    this.persist();
    return dispute;
  }

  public addDisputeTimelineEvent(disputeId: string, event: Omit<DisputeTimelineEvent, 'id' | 'createdAt'>): DisputeDocument {
    const dispute = this.findDisputeById(disputeId);
    if (!dispute) throw new Error('DISPUTE_NOT_FOUND');

    dispute.timeline.push({
      ...event,
      id: `tl-${crypto.randomUUID().slice(0, 8)}`,
      createdAt: new Date().toISOString(),
    });
    dispute.updatedAt = new Date().toISOString();
    this.persist();
    return dispute;
  }

  public resolveDispute(
    disputeId: string,
    resolutionData: {
      resolution: string;
      resolutionDetails: DisputeResolutionDetails;
      adminId: string;
    }
  ): DisputeDocument {
    const dispute = this.findDisputeById(disputeId);
    if (!dispute) throw new Error('DISPUTE_NOT_FOUND');

    const favored = resolutionData.resolutionDetails.favoredParty;
    let nextStatus: DisputeStatus = 'CLOSED';
    if (favored === 'SELLER') nextStatus = 'RESOLVED_SELLER';
    else if (favored === 'FREELANCER') nextStatus = 'RESOLVED_FREELANCER';
    else if (favored === 'SPLIT') nextStatus = 'PARTIALLY_RESOLVED';

    dispute.status = nextStatus;
    dispute.resolution = resolutionData.resolution;
    dispute.resolutionDetails = resolutionData.resolutionDetails;
    dispute.resolvedAt = new Date().toISOString();
    dispute.updatedAt = new Date().toISOString();

    dispute.timeline.push({
      id: `tl-${crypto.randomUUID().slice(0, 8)}`,
      actorId: resolutionData.adminId,
      actorRole: 'ADMIN',
      event: `Dispute resolved in favor of ${favored}`,
      note: resolutionData.resolution,
      createdAt: new Date().toISOString(),
    });

    // Notify both parties
    this.createNotification({
      userId: dispute.openedBy,
      type: 'DISPUTE_UPDATED',
      title: 'Dispute Resolved',
      message: `Dispute ${dispute.id} has been arbitrated and resolved.`,
      entityType: 'dispute',
      entityId: dispute.id,
    });
    this.createNotification({
      userId: dispute.againstUserId,
      type: 'DISPUTE_UPDATED',
      title: 'Dispute Resolved',
      message: `Dispute ${dispute.id} has been arbitrated and resolved.`,
      entityType: 'dispute',
      entityId: dispute.id,
    });

    this.persist();
    return dispute;
  }

  // ==========================================
  // PHASE 6: SUPPORT TICKETS
  // ==========================================

  public findSupportTicketById(id: string): SupportTicketDocument | undefined {
    return this.data.supportTickets.find((t) => t.id === id);
  }

  public listSupportTickets(filter?: { userId?: string; status?: SupportStatus; category?: SupportCategory }): SupportTicketDocument[] {
    let list = [...this.data.supportTickets];
    if (filter?.userId) {
      list = list.filter((t) => t.userId === filter.userId);
    }
    if (filter?.status) {
      list = list.filter((t) => t.status === filter.status);
    }
    if (filter?.category) {
      list = list.filter((t) => t.category === filter.category);
    }
    list.sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime());
    return list;
  }

  public createSupportTicket(
    data: Omit<SupportTicketDocument, 'id' | 'createdAt' | 'updatedAt' | 'messages' | 'status'>
  ): SupportTicketDocument {
    const user = this.findUserById(data.userId);
    const ticketId = `sup-${crypto.randomUUID().slice(0, 8)}`;

    const firstMsg: SupportMessage = {
      id: `supmsg-${crypto.randomUUID().slice(0, 8)}`,
      senderId: data.userId,
      senderRole: user?.role || 'FREELANCER',
      senderName: user ? `${user.firstName} ${user.lastName}` : 'User',
      content: data.description,
      isInternalNote: false,
      createdAt: new Date().toISOString(),
    };

    const ticket: SupportTicketDocument = {
      ...data,
      id: ticketId,
      userEmail: user?.email,
      userName: user ? `${user.firstName} ${user.lastName}` : undefined,
      status: 'OPEN',
      messages: [firstMsg],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.data.supportTickets.unshift(ticket);
    this.persist();
    return ticket;
  }

  public addSupportMessage(ticketId: string, message: Omit<SupportMessage, 'id' | 'createdAt'>): SupportTicketDocument {
    const ticket = this.findSupportTicketById(ticketId);
    if (!ticket) throw new Error('TICKET_NOT_FOUND');

    const msg: SupportMessage = {
      ...message,
      id: `supmsg-${crypto.randomUUID().slice(0, 8)}`,
      createdAt: new Date().toISOString(),
    };

    ticket.messages.push(msg);
    ticket.updatedAt = new Date().toISOString();

    if (message.senderRole === 'ADMIN' && !message.isInternalNote) {
      ticket.status = 'WAITING_FOR_USER';
      this.createNotification({
        userId: ticket.userId,
        type: 'SUPPORT_REPLY',
        title: 'Support agent replied',
        message: `Response received on ticket: "${ticket.subject}"`,
        entityType: 'support',
        entityId: ticket.id,
      });
    } else if (message.senderRole !== 'ADMIN') {
      ticket.status = 'IN_PROGRESS';
    }

    this.persist();
    return ticket;
  }

  public updateSupportTicket(id: string, partial: Partial<SupportTicketDocument>): SupportTicketDocument {
    const ticket = this.findSupportTicketById(id);
    if (!ticket) throw new Error('TICKET_NOT_FOUND');

    const updated = {
      ...ticket,
      ...partial,
      updatedAt: new Date().toISOString(),
    };
    if (partial.status === 'CLOSED' || partial.status === 'RESOLVED') {
      updated.closedAt = new Date().toISOString();
    }

    const idx = this.data.supportTickets.findIndex((t) => t.id === id);
    this.data.supportTickets[idx] = updated;
    this.persist();
    return updated;
  }

  // ==========================================
  // PHASE 6: MODERATION & RESTRICTIONS
  // ==========================================

  public applyModerationAction(action: Omit<ModerationActionDocument, 'id' | 'createdAt'>): ModerationActionDocument {
    const doc: ModerationActionDocument = {
      ...action,
      id: `mod-${crypto.randomUUID().slice(0, 8)}`,
      createdAt: new Date().toISOString(),
    };

    this.data.moderationActions.unshift(doc);

    // Apply immediate user effects
    if (action.action === 'SUSPENDED') {
      const user = this.findUserById(action.userId);
      if (user) user.status = 'SUSPENDED';
    } else if (action.action === 'UNSUSPENDED') {
      const user = this.findUserById(action.userId);
      if (user) user.status = 'ACTIVE';
    }

    // Send warning notification if warning/restriction
    this.createNotification({
      userId: action.userId,
      type: 'ACCOUNT_WARNING',
      title: 'Account Moderation Notice',
      message: `An administrative action (${action.action.replace('_', ' ')}) has been recorded: ${action.reason}`,
      entityType: 'system',
    });

    this.recordFinancialAudit('MODERATION_ACTION_APPLIED', { ...action }, action.adminId);
    this.persist();
    return doc;
  }

  public getUserActiveRestrictions(userId: string): ModerationActionType[] {
    const now = new Date().toISOString();
    return this.data.moderationActions
      .filter((a) => a.userId === userId && (!a.expiresAt || a.expiresAt > now))
      .map((a) => a.action);
  }

  public isUserSuspended(userId: string): boolean {
    const user = this.findUserById(userId);
    return user?.status === 'SUSPENDED';
  }

  public isMessagingRestricted(userId: string): boolean {
    const actions = this.getUserActiveRestrictions(userId);
    return actions.includes('MESSAGING_RESTRICTED') || actions.includes('SUSPENDED');
  }

  public listModerationActions(userId?: string): ModerationActionDocument[] {
    if (userId) {
      return this.data.moderationActions.filter((a) => a.userId === userId);
    }
    return [...this.data.moderationActions];
  }

  public blockUser(blockerId: string, blockedUserId: string, reason?: string): UserBlockDocument {
    const existing = this.data.userBlocks.find(
      (b) => b.blockerId === blockerId && b.blockedUserId === blockedUserId
    );
    if (existing) return existing;

    const block: UserBlockDocument = {
      id: `blk-${crypto.randomUUID().slice(0, 8)}`,
      blockerId,
      blockedUserId,
      reason,
      createdAt: new Date().toISOString(),
    };
    this.data.userBlocks.push(block);
    this.persist();
    return block;
  }

  public unblockUser(blockerId: string, blockedUserId: string): void {
    this.data.userBlocks = this.data.userBlocks.filter(
      (b) => !(b.blockerId === blockerId && b.blockedUserId === blockedUserId)
    );
    this.persist();
  }

  public isUserBlocked(userA: string, userB: string): boolean {
    return this.data.userBlocks.some(
      (b) =>
        (b.blockerId === userA && b.blockedUserId === userB) ||
        (b.blockerId === userB && b.blockedUserId === userA)
    );
  }

  // ==========================================
  // PHASE 6: FAQS
  // ==========================================

  public listFAQs(publishedOnly = true): FAQItemDocument[] {
    let list = [...this.data.faqs];
    if (publishedOnly) {
      list = list.filter((f) => f.published);
    }
    return list.sort((a, b) => a.order - b.order);
  }

  public createFAQ(data: Omit<FAQItemDocument, 'id' | 'createdAt'>): FAQItemDocument {
    const faq: FAQItemDocument = {
      ...data,
      id: `faq-${crypto.randomUUID().slice(0, 8)}`,
      createdAt: new Date().toISOString(),
    };
    this.data.faqs.push(faq);
    this.persist();
    return faq;
  }

  public updateFAQ(id: string, partial: Partial<FAQItemDocument>): FAQItemDocument {
    const idx = this.data.faqs.findIndex((f) => f.id === id);
    if (idx === -1) throw new Error('FAQ_NOT_FOUND');
    const updated = {
      ...this.data.faqs[idx],
      ...partial,
    };
    this.data.faqs[idx] = updated;
    this.persist();
    return updated;
  }

  public deleteFAQ(id: string): void {
    this.data.faqs = this.data.faqs.filter((f) => f.id !== id);
    this.persist();
  }

  // ==========================================
  // PHASE 7: VERIFICATION SYSTEM
  // ==========================================

  public getUserVerifications(userId: string): VerificationDocument[] {
    return this.data.verifications.filter((v) => v.userId === userId);
  }

  public requestVerification(userId: string, type: VerificationType, metadata?: any): VerificationDocument {
    const existing = this.data.verifications.find((v) => v.userId === userId && v.type === type);

    const doc: VerificationDocument = existing
      ? {
          ...existing,
          status: 'PENDING',
          submittedAt: new Date().toISOString(),
          metadata: metadata || existing.metadata,
          updatedAt: new Date().toISOString(),
        }
      : {
          id: `ver-${crypto.randomUUID().slice(0, 8)}`,
          userId,
          type,
          status: 'PENDING',
          submittedAt: new Date().toISOString(),
          metadata,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

    if (existing) {
      const idx = this.data.verifications.findIndex((v) => v.id === existing.id);
      this.data.verifications[idx] = doc;
    } else {
      this.data.verifications.push(doc);
    }

    this.persist();
    return doc;
  }

  public verifyEmail(userId: string): boolean {
    const user = this.findUserById(userId);
    if (!user) return false;

    user.isEmailVerified = true;
    user.isVerified = true;
    user.updatedAt = new Date().toISOString();

    let ver = this.data.verifications.find((v) => v.userId === userId && v.type === 'EMAIL');
    if (!ver) {
      ver = {
        id: `ver-${crypto.randomUUID().slice(0, 8)}`,
        userId,
        type: 'EMAIL',
        status: 'VERIFIED',
        verifiedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.data.verifications.push(ver);
    } else {
      ver.status = 'VERIFIED';
      ver.verifiedAt = new Date().toISOString();
      ver.updatedAt = new Date().toISOString();
    }

    this.recordSecurityActivity(userId, 'EMAIL_VERIFIED');
    this.persist();
    return true;
  }

  public verifyPhoneOTP(userId: string, code: string): boolean {
    const user = this.findUserById(userId);
    if (!user) return false;

    // Validate 6-digit code or test code '123456'
    if (code !== '123456' && !/^\d{6}$/.test(code)) {
      return false;
    }

    user.isPhoneVerified = true;
    user.updatedAt = new Date().toISOString();

    let ver = this.data.verifications.find((v) => v.userId === userId && v.type === 'PHONE');
    if (!ver) {
      ver = {
        id: `ver-${crypto.randomUUID().slice(0, 8)}`,
        userId,
        type: 'PHONE',
        status: 'VERIFIED',
        verifiedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.data.verifications.push(ver);
    } else {
      ver.status = 'VERIFIED';
      ver.verifiedAt = new Date().toISOString();
      ver.updatedAt = new Date().toISOString();
    }

    this.recordSecurityActivity(userId, 'PHONE_VERIFIED');
    this.persist();
    return true;
  }

  public listVerifications(status?: VerificationStatus): Array<
    VerificationDocument & {
      userName: string;
      userEmail?: string;
      role?: UserRole;
    }
  > {
    let list = [...this.data.verifications];
    if (status) {
      list = list.filter((v) => v.status === status);
    }
    list.sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime());

    return list.map((v) => {
      const u = this.findUserById(v.userId);
      return {
        ...v,
        userName: u ? `${u.firstName} ${u.lastName}` : 'User',
        userEmail: u?.email,
        role: u?.role,
      };
    });
  }

  public updateVerificationStatus(
    id: string,
    status: VerificationStatus,
    failureReason?: string,
    adminId?: string
  ): VerificationDocument {
    const ver = this.data.verifications.find((v) => v.id === id);
    if (!ver) throw new Error('VERIFICATION_NOT_FOUND');

    ver.status = status;
    ver.updatedAt = new Date().toISOString();
    if (status === 'VERIFIED') {
      ver.verifiedAt = new Date().toISOString();
      // Update User document flag
      const u = this.findUserById(ver.userId);
      if (u) {
        if (ver.type === 'IDENTITY') u.isIdentityVerified = true;
        if (ver.type === 'BUSINESS') u.isBusinessVerified = true;
        if (ver.type === 'PAYMENT') u.isPaymentVerified = true;
        if (ver.type === 'EMAIL') u.isEmailVerified = true;
        if (ver.type === 'PHONE') u.isPhoneVerified = true;
      }
    } else if (status === 'REJECTED' || status === 'FAILED') {
      ver.failureReason = failureReason || 'Document could not be verified.';
    }

    this.recordFinancialAudit('VERIFICATION_STATUS_UPDATED', { verificationId: id, status, failureReason }, adminId);
    this.persist();
    return ver;
  }

  // ==========================================
  // PHASE 7: SECURITY & SESSIONS & 2FA
  // ==========================================

  public recordSecurityActivity(
    userId: string,
    action: SecurityActivityDocument['action'],
    meta?: { ipAddress?: string; userAgent?: string; device?: string; location?: string }
  ): SecurityActivityDocument {
    const act: SecurityActivityDocument = {
      id: `sec-${crypto.randomUUID().slice(0, 8)}`,
      userId,
      action,
      ipAddress: meta?.ipAddress || '127.0.0.1',
      userAgent: meta?.userAgent || 'WorkNova Web Client',
      device: meta?.device || 'Desktop Browser',
      location: meta?.location || 'Local Workspace',
      createdAt: new Date().toISOString(),
    };

    this.data.securityActivities.unshift(act);
    if (this.data.securityActivities.length > 1000) {
      this.data.securityActivities = this.data.securityActivities.slice(0, 1000);
    }
    this.persist();
    return act;
  }

  public listSecurityActivities(userId: string, limit = 20): SecurityActivityDocument[] {
    return this.data.securityActivities
      .filter((s) => s.userId === userId)
      .slice(0, limit);
  }

  public listUserActiveSessions(userId: string, currentToken?: string): Array<SessionDocument & { isCurrent: boolean; device: string; browser: string }> {
    const now = new Date().toISOString();
    const userSessions = this.data.sessions.filter((s) => s.userId === userId && s.expiresAt > now);

    return userSessions.map((s) => ({
      ...s,
      isCurrent: Boolean(currentToken && s.refreshToken === currentToken),
      device: 'MacBook Pro / Desktop',
      browser: 'Chrome 124 (macOS)',
    }));
  }

  public revokeSession(userId: string, sessionId: string): void {
    this.data.sessions = this.data.sessions.filter((s) => !(s.userId === userId && s.id === sessionId));
    this.recordSecurityActivity(userId, 'SESSION_REVOKED');
    this.persist();
  }

  public revokeOtherSessions(userId: string, currentRefreshToken: string): number {
    const beforeCount = this.data.sessions.length;
    this.data.sessions = this.data.sessions.filter(
      (s) => s.userId !== userId || s.refreshToken === currentRefreshToken
    );
    const removed = beforeCount - this.data.sessions.length;
    this.recordSecurityActivity(userId, 'SESSION_REVOKED', { location: `Revoked ${removed} other sessions` });
    this.persist();
    return removed;
  }

  public setupTwoFactor(userId: string): { secret: string; qrCodeUrl: string; recoveryCodes: string[] } {
    const user = this.findUserById(userId);
    if (!user) throw new Error('USER_NOT_FOUND');

    const secret = crypto.randomBytes(20).toString('hex').toUpperCase().slice(0, 16);
    const recoveryCodes = Array.from({ length: 8 }, () =>
      `${crypto.randomBytes(3).toString('hex').toUpperCase()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`
    );

    user.twoFactorSecret = secret;
    user.recoveryCodes = recoveryCodes;
    this.persist();

    const otpAuthUrl = `otpauth://totp/WorkNova:${user.email}?secret=${secret}&issuer=WorkNova`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpAuthUrl)}`;

    return { secret, qrCodeUrl, recoveryCodes };
  }

  public verifyAndEnableTwoFactor(userId: string, code: string): boolean {
    const user = this.findUserById(userId);
    if (!user || !user.twoFactorSecret) return false;

    // Accept standard 6 digits or test 123456
    if (!/^\d{6}$/.test(code) && code !== '123456') {
      return false;
    }

    user.twoFactorEnabled = true;
    this.recordSecurityActivity(userId, '2FA_ENABLED');
    this.persist();
    return true;
  }

  public disableTwoFactor(userId: string): boolean {
    const user = this.findUserById(userId);
    if (!user) return false;

    user.twoFactorEnabled = false;
    user.twoFactorSecret = undefined;
    user.recoveryCodes = undefined;
    this.recordSecurityActivity(userId, '2FA_DISABLED');
    this.persist();
    return true;
  }

  // ==========================================
  // PHASE 7: FRAUD & RISK EVENTS
  // ==========================================

  public createRiskEvent(data: Omit<RiskEventDocument, 'id' | 'createdAt'>): RiskEventDocument {
    const ev: RiskEventDocument = {
      ...data,
      id: `risk-${crypto.randomUUID().slice(0, 8)}`,
      createdAt: new Date().toISOString(),
    };

    this.data.riskEvents.unshift(ev);
    this.persist();
    return ev;
  }

  public listRiskEvents(status?: RiskEventStatus): Array<RiskEventDocument & { userName?: string; userEmail?: string }> {
    let list = [...this.data.riskEvents];
    if (status) {
      list = list.filter((r) => r.status === status);
    }
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return list.map((r) => {
      const u = r.userId ? this.findUserById(r.userId) : undefined;
      return {
        ...r,
        userName: u ? `${u.firstName} ${u.lastName}` : 'Unauthenticated / Guest',
        userEmail: u?.email,
      };
    });
  }

  public updateRiskEventStatus(id: string, status: RiskEventStatus, adminId?: string): RiskEventDocument {
    const ev = this.data.riskEvents.find((r) => r.id === id);
    if (!ev) throw new Error('RISK_EVENT_NOT_FOUND');

    ev.status = status;
    this.recordFinancialAudit('RISK_EVENT_UPDATED', { riskEventId: id, status }, adminId);
    this.persist();
    return ev;
  }

  // ==========================================
  // PHASE 7: ANALYTICS & METRICS
  // ==========================================

  public recordAnalyticsEvent(data: Omit<AnalyticsEventDocument, 'id' | 'createdAt'>): AnalyticsEventDocument {
    const doc: AnalyticsEventDocument = {
      ...data,
      id: `ae-${crypto.randomUUID().slice(0, 8)}`,
      createdAt: new Date().toISOString(),
    };
    this.data.analyticsEvents.push(doc);
    if (this.data.analyticsEvents.length > 5000) {
      this.data.analyticsEvents = this.data.analyticsEvents.slice(this.data.analyticsEvents.length - 5000);
    }
    this.persist();
    return doc;
  }

  public getSellerAnalytics(sellerId: string): any {
    const projects = this.data.projects.filter((p) => p.sellerId === sellerId);
    const contracts = this.data.contracts.filter((c) => c.sellerId === sellerId);
    const payments = this.data.payments.filter((p) => p.sellerId === sellerId && p.status === 'PAID');
    const reviews = this.data.reviews.filter((r) => r.revieweeId === sellerId && r.status === 'PUBLISHED');

    const totalSpent = payments.reduce((sum, p) => sum + p.amount, 0);
    const totalProposals = projects.reduce((sum, p) => sum + (p.proposalCount || 0), 0);
    const completedProjects = projects.filter((p) => p.status === 'COMPLETED').length;

    const conversionRate = totalProposals > 0 ? Math.round((contracts.length / totalProposals) * 100) : 0;
    const avgRating = reviews.length > 0 ? Number((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)) : 5.0;

    return {
      projectsPosted: projects.length,
      activeProjects: projects.filter((p) => p.status === 'PUBLISHED' || p.status === 'IN_PROGRESS').length,
      completedProjects,
      totalProposalsReceived: totalProposals,
      contractsAwarded: contracts.length,
      hiringConversionRate: conversionRate,
      totalSpent,
      averageProjectSpend: contracts.length > 0 ? Math.round(totalSpent / contracts.length) : 0,
      averageRating: avgRating,
      totalReviews: reviews.length,
      monthlySpendingTrend: [
        { month: 'Jun', amount: 15000 },
        { month: 'Jul', amount: 28000 },
        { month: 'Aug', amount: 35000 },
        { month: 'Sep', amount: 45000 },
        { month: 'Oct', amount: totalSpent > 50000 ? totalSpent : 50000 },
      ],
    };
  }

  public getFreelancerAnalytics(freelancerId: string): any {
    const proposals = this.data.proposals.filter((p) => p.freelancerId === freelancerId);
    const contracts = this.data.contracts.filter((c) => c.freelancerUserId === freelancerId);
    const wallet = this.getOrCreateWallet(freelancerId);
    const reviews = this.data.reviews.filter((r) => r.revieweeId === freelancerId && r.status === 'PUBLISHED');

    const acceptedProposals = proposals.filter((p) => p.status === 'ACCEPTED').length;
    const winRate = proposals.length > 0 ? Math.round((acceptedProposals / proposals.length) * 100) : 0;
    const avgRating = reviews.length > 0 ? Number((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)) : 5.0;

    return {
      proposalsSubmitted: proposals.length,
      proposalsWon: acceptedProposals,
      winRate,
      activeContracts: contracts.filter((c) => c.status === 'ACTIVE').length,
      completedContracts: contracts.filter((c) => c.status === 'COMPLETED').length,
      grossEarnings: wallet.totalEarned,
      netAvailableBalance: wallet.availableBalance,
      pendingBalance: wallet.pendingBalance,
      totalWithdrawn: wallet.totalWithdrawn,
      averageRating: avgRating,
      reviewsCount: reviews.length,
      profileViewsMonthly: [
        { week: 'Week 1', views: 42 },
        { week: 'Week 2', views: 68 },
        { week: 'Week 3', views: 95 },
        { week: 'Week 4', views: 124 },
      ],
    };
  }

  public getAdminPlatformAnalytics(_dateRange = '30d'): any {
    const users = this.data.users;
    const projects = this.data.projects;
    const proposals = this.data.proposals;
    const contracts = this.data.contracts;
    const payments = this.data.payments.filter((p) => p.status === 'PAID');
    const refunds = this.data.refunds.filter((r) => r.status === 'COMPLETED');
    const disputes = this.data.disputes;
    const verifications = this.data.verifications;

    const totalGMV = payments.reduce((sum, p) => sum + p.amount, 0);
    const settings = this.getPlatformSettings();
    const platformRevenue = Math.round(totalGMV * settings.defaultPlatformFeeRate);
    const totalRefunded = refunds.reduce((sum, r) => sum + r.amount, 0);

    return {
      overview: {
        totalUsers: users.length,
        freelancersCount: users.filter((u) => u.role === 'FREELANCER').length,
        sellersCount: users.filter((u) => u.role === 'SELLER').length,
        verifiedUsersCount: verifications.filter((v) => v.status === 'VERIFIED').length,
        activeProjects: projects.filter((p) => p.status === 'PUBLISHED' || p.status === 'IN_PROGRESS').length,
        totalProjects: projects.length,
        totalProposals: proposals.length,
        activeContracts: contracts.filter((c) => c.status === 'ACTIVE').length,
        completedContracts: contracts.filter((c) => c.status === 'COMPLETED').length,
        totalGMV,
        platformRevenue,
        totalRefunded,
        openDisputes: disputes.filter((d) => d.status === 'OPEN' || d.status === 'UNDER_REVIEW').length,
      },
      categoryDistribution: [
        { category: 'Web & App Development', percentage: 42, count: 18 },
        { category: 'Design & Creative', percentage: 26, count: 11 },
        { category: 'AI & Data Engineering', percentage: 18, count: 8 },
        { category: 'Digital Marketing & Content', percentage: 14, count: 6 },
      ],
      userGrowth: [
        { date: '01 Oct', freelancers: 120, sellers: 45 },
        { date: '02 Oct', freelancers: 135, sellers: 52 },
        { date: '03 Oct', freelancers: 148, sellers: 60 },
        { date: '04 Oct', freelancers: 162, sellers: 68 },
      ],
    };
  }

  // ==========================================
  // PHASE 7: ADVANCED SEARCH & RECOMMENDATIONS
  // ==========================================

  public searchMarketplace(params: {
    query?: string;
    tab?: 'ALL' | 'PROJECTS' | 'FREELANCERS' | 'SELLERS';
    category?: string;
    subcategory?: string;
    minBudget?: number;
    maxBudget?: number;
    experienceLevel?: string;
    ratingMin?: number;
    verifiedOnly?: boolean;
    sortBy?: 'RELEVANT' | 'NEWEST' | 'BUDGET_HIGH' | 'BUDGET_LOW' | 'TOP_RATED';
  }): {
    projects: any[];
    freelancers: any[];
    sellers: any[];
    totalResults: number;
  } {
    const q = (params.query || '').trim().toLowerCase();

    // 1. Projects Search
    let matchedProjects = this.data.projects.filter(
      (p) => p.status === 'PUBLISHED' || p.status === 'IN_PROGRESS'
    );

    if (q) {
      matchedProjects = matchedProjects.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          (p.categoryName && p.categoryName.toLowerCase().includes(q)) ||
          (p.subcategoryName && p.subcategoryName.toLowerCase().includes(q)) ||
          (p.skills && p.skills.some((s) => s.toLowerCase().includes(q)))
      );
    }

    if (params.category && params.category !== 'all') {
      matchedProjects = matchedProjects.filter(
        (p) => (p.categoryName || p.categoryId || '').toLowerCase() === params.category!.toLowerCase()
      );
    }
    if (params.minBudget) {
      matchedProjects = matchedProjects.filter((p) => p.budgetMax >= Number(params.minBudget));
    }
    if (params.maxBudget) {
      matchedProjects = matchedProjects.filter((p) => p.budgetMin <= Number(params.maxBudget));
    }
    if (params.experienceLevel && params.experienceLevel !== 'all') {
      matchedProjects = matchedProjects.filter(
        (p) => p.experienceLevel.toLowerCase() === params.experienceLevel!.toLowerCase()
      );
    }

    // 2. Freelancers Search
    const flUsers = this.data.users.filter((u) => u.role === 'FREELANCER' && !u.isSuspended);
    let matchedFreelancers = flUsers.map((u) => {
      const profile = this.findFreelancerProfileByUserId(u.id);
      const agg = this.getReviewAggregation(u.id);
      return {
        id: u.id,
        name: `${u.firstName} ${u.lastName}`,
        email: u.email,
        avatarUrl: u.avatarUrl,
        professionalTitle: profile?.professionalTitle || 'Software Professional',
        bio: profile?.bio || '',
        skills: profile?.skills || [],
        hourlyRate: profile?.hourlyRate || 40,
        experienceLevel: profile?.experienceLevel || 'Intermediate',
        location: profile?.location || 'Remote',
        availability: u.availability || 'Available Now',
        averageRating: agg.averageRating,
        totalReviews: agg.totalReviews,
        isVerified: Boolean(u.isIdentityVerified || u.isEmailVerified),
        isIdentityVerified: Boolean(u.isIdentityVerified),
      };
    });

    if (q) {
      matchedFreelancers = matchedFreelancers.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.professionalTitle.toLowerCase().includes(q) ||
          f.bio.toLowerCase().includes(q) ||
          f.skills.some((s) => s.toLowerCase().includes(q))
      );
    }

    if (params.ratingMin) {
      matchedFreelancers = matchedFreelancers.filter((f) => f.averageRating >= Number(params.ratingMin));
    }
    if (params.verifiedOnly) {
      matchedFreelancers = matchedFreelancers.filter((f) => f.isIdentityVerified || f.isVerified);
    }

    // 3. Sellers Search
    const selUsers = this.data.users.filter((u) => u.role === 'SELLER' && !u.isSuspended);
    let matchedSellers = selUsers.map((u) => {
      const profile = this.findSellerProfileByUserId(u.id);
      const agg = this.getReviewAggregation(u.id);
      const userProjects = this.data.projects.filter((p) => p.sellerId === u.id);
      return {
        id: u.id,
        name: `${u.firstName} ${u.lastName}`,
        companyName: profile?.companyName || profile?.businessName || 'Enterprise Buyer',
        industry: profile?.industry || 'Technology',
        avatarUrl: u.avatarUrl,
        location: profile?.location || 'India',
        averageRating: agg.averageRating,
        totalReviews: agg.totalReviews,
        projectsCount: userProjects.length,
        isVerified: Boolean(u.isBusinessVerified || u.isPaymentVerified),
        isBusinessVerified: Boolean(u.isBusinessVerified),
      };
    });

    if (q) {
      matchedSellers = matchedSellers.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.companyName.toLowerCase().includes(q) ||
          s.industry.toLowerCase().includes(q)
      );
    }

    // Sort projects
    if (params.sortBy === 'BUDGET_HIGH') {
      matchedProjects.sort((a, b) => b.budgetMax - a.budgetMax);
    } else if (params.sortBy === 'BUDGET_LOW') {
      matchedProjects.sort((a, b) => a.budgetMin - b.budgetMin);
    } else {
      matchedProjects.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return {
      projects: matchedProjects,
      freelancers: matchedFreelancers,
      sellers: matchedSellers,
      totalResults: matchedProjects.length + matchedFreelancers.length + matchedSellers.length,
    };
  }

  public getRecommendedFreelancersForProject(projectId: string, limit = 5): any[] {
    const project = this.findProjectById(projectId);
    if (!project) return [];

    const projectSkills = (project.skills || []).map((s) => s.toLowerCase());
    const candidates = this.data.users.filter((u) => u.role === 'FREELANCER' && !u.isSuspended);

    const scored = candidates.map((c) => {
      const profile = this.findFreelancerProfileByUserId(c.id);
      const candidateSkills = (profile?.skills || []).map((s) => s.toLowerCase());
      const agg = this.getReviewAggregation(c.id);

      // Match scoring logic
      const matchedSkills = candidateSkills.filter((s) => projectSkills.includes(s));
      const skillScore = projectSkills.length > 0 ? (matchedSkills.length / projectSkills.length) * 50 : 25;
      const ratingScore = (agg.averageRating / 5) * 25;
      const verifiedScore = c.isIdentityVerified ? 15 : c.isEmailVerified ? 10 : 5;
      const availabilityScore = c.availability === 'Available Now' ? 10 : c.availability === 'Busy' ? 5 : 0;

      const totalScore = Math.min(99, Math.round(skillScore + ratingScore + verifiedScore + availabilityScore));

      const matchReasons: string[] = [];
      if (matchedSkills.length > 0) matchReasons.push(`Skills matched: ${matchedSkills.slice(0, 3).join(', ')}`);
      if (agg.averageRating >= 4.5) matchReasons.push(`Top-rated (${agg.averageRating}★ average across ${agg.totalReviews} reviews)`);
      if (c.isIdentityVerified) matchReasons.push('Verified Government Identity');
      if (c.availability === 'Available Now') matchReasons.push('Immediately available for new projects');

      return {
        id: c.id,
        name: `${c.firstName} ${c.lastName}`,
        avatarUrl: c.avatarUrl,
        professionalTitle: profile?.professionalTitle || 'Software Engineer',
        hourlyRate: profile?.hourlyRate || 45,
        skills: profile?.skills || [],
        matchScore: totalScore,
        matchReasons,
        averageRating: agg.averageRating,
        totalReviews: agg.totalReviews,
        availability: c.availability || 'Available Now',
        isIdentityVerified: Boolean(c.isIdentityVerified),
      };
    });

    scored.sort((a, b) => b.matchScore - a.matchScore);
    return scored.slice(0, limit);
  }

  public getRecommendedProjectsForFreelancer(freelancerId: string, limit = 5): any[] {
    const profile = this.findFreelancerProfileByUserId(freelancerId);
    const user = this.findUserById(freelancerId);
    const mySkills = (profile?.skills || []).map((s) => s.toLowerCase());

    const activeProjects = this.data.projects.filter(
      (p) => p.status === 'PUBLISHED'
    );

    const scored = activeProjects.map((p) => {
      const pSkills = (p.skills || []).map((s) => s.toLowerCase());
      const common = pSkills.filter((s) => mySkills.includes(s));
      const score = pSkills.length > 0 ? Math.round((common.length / pSkills.length) * 60) + 35 : 50;

      const matchReasons: string[] = [];
      if (common.length > 0) matchReasons.push(`Matches your skills: ${common.slice(0, 3).join(', ')}`);
      if (p.experienceLevel === (profile?.experienceLevel || 'Intermediate')) matchReasons.push('Matches your experience level');
      matchReasons.push('Verified Escrow Funding Guarantee');

      return {
        ...p,
        matchScore: Math.min(98, score),
        matchReasons,
      };
    });

    scored.sort((a, b) => b.matchScore - a.matchScore);
    return scored.slice(0, limit);
  }

  public calculateProfileCompleteness(userId: string): { score: number; missing: string[] } {
    const user = this.findUserById(userId);
    if (!user) return { score: 0, missing: [] };

    const missing: string[] = [];
    let score = 20; // Signup base

    if (user.avatarUrl || user.profileImage) score += 15;
    else missing.push('Upload a profile photo');

    if (user.isEmailVerified) score += 15;
    else missing.push('Verify your email address');

    if (user.isPhoneVerified) score += 15;
    else missing.push('Verify your phone number');

    if (user.role === 'FREELANCER') {
      const prof = this.findFreelancerProfileByUserId(userId);
      if (prof?.skills && prof.skills.length >= 3) score += 15;
      else missing.push('Add at least 3 professional skills');

      if (prof?.bio && prof.bio.length >= 50) score += 10;
      else missing.push('Write an informative professional bio (50+ characters)');

      if (user.isIdentityVerified) score += 10;
      else missing.push('Complete Government Identity verification');
    } else {
      const prof = this.findSellerProfileByUserId(userId);
      if (prof?.companyName || prof?.businessName) score += 15;
      else missing.push('Add company or organisation name');

      if (prof?.description) score += 10;
      else missing.push('Add company background description');

      if (user.isBusinessVerified) score += 10;
      else missing.push('Complete Business Registry / GSTIN verification');
    }

    return {
      score: Math.min(100, score),
      missing,
    };
  }

  // ==========================================
  // PHASE 7: FEATURE FLAGS & CONFIGURATION & HEALTH
  // ==========================================

  public listFeatureFlags(): FeatureFlagDocument[] {
    return [...this.data.featureFlags];
  }

  public updateFeatureFlag(key: string, enabled: boolean): FeatureFlagDocument {
    let flag = this.data.featureFlags.find((f) => f.key === key);
    if (!flag) {
      flag = {
        id: `flag-${crypto.randomUUID().slice(0, 8)}`,
        key,
        enabled,
        description: 'Dynamically configured feature flag',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.data.featureFlags.push(flag);
    } else {
      flag.enabled = enabled;
      flag.updatedAt = new Date().toISOString();
    }
    this.persist();
    return flag;
  }

  public getPlatformConfig(): PlatformConfigDocument {
    return { ...this.data.platformConfig };
  }

  public updatePlatformConfig(partial: Partial<PlatformConfigDocument>): PlatformConfigDocument {
    this.data.platformConfig = {
      ...this.data.platformConfig,
      ...partial,
      updatedAt: new Date().toISOString(),
    };
    this.persist();
    return this.data.platformConfig;
  }

  public getSystemHealth(): any {
    return {
      overallStatus: 'OPERATIONAL',
      services: {
        apiGateway: { status: 'OPERATIONAL', latencyMs: 14, uptime: '99.99%' },
        database: { status: 'OPERATIONAL', recordsCount: this.data.users.length + this.data.projects.length + this.data.messages.length, latencyMs: 3 },
        webSocketService: { status: 'OPERATIONAL', connectedClients: 1, transport: 'websocket' },
        fileStorage: { status: 'OPERATIONAL', engine: 'Local Secure Storage', availableSpaceGb: 48.2 },
        paymentGateway: { status: 'OPERATIONAL', provider: this.data.platformSettings.paymentProvider, mode: this.data.platformSettings.testMode ? 'SANDBOX_READY' : 'PRODUCTION' },
        emailDispatcher: { status: 'OPERATIONAL', provider: 'ConsoleMockEmailProvider', queueLatencyMs: 8 },
        searchEngine: { status: 'OPERATIONAL', indexedEntities: this.data.projects.length + this.data.users.length, latencyMs: 6 },
        aiService: { status: 'OPERATIONAL', provider: config.aiProvider, model: config.aiModel, activeWorkers: 2 },
        automationEngine: { status: 'OPERATIONAL', queuedJobs: this.data.scheduledJobs.filter((j) => j.status === 'PENDING').length, runnerState: 'ACTIVE' },
      },
      systemTime: new Date().toISOString(),
      nodeMemoryUsageMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
    };
  }

  // --- PHASE 8: AI USAGE & METRICS ---
  public logAIUsage(record: Omit<AIUsageDocument, 'id' | 'createdAt'>): AIUsageDocument {
    const doc: AIUsageDocument = {
      id: `ai-use-${crypto.randomUUID().slice(0, 10)}`,
      ...record,
      createdAt: new Date().toISOString(),
    };
    this.data.aiUsages.unshift(doc);
    // Keep max 5000 records in storage
    if (this.data.aiUsages.length > 5000) {
      this.data.aiUsages = this.data.aiUsages.slice(0, 5000);
    }
    this.persist();
    return doc;
  }

  public listAIUsages(limit: number = 50): AIUsageDocument[] {
    return this.data.aiUsages.slice(0, limit);
  }

  public getAIUsageSummary(): {
    totalRequests: number;
    totalTokens: number;
    estimatedCostUsd: number;
    avgLatencyMs: number;
    topFeatures: { feature: string; count: number; tokens: number }[];
    recentLogs: AIUsageDocument[];
  } {
    const totalRequests = this.data.aiUsages.length;
    let totalTokens = 0;
    let estimatedCostUsd = 0;
    let totalLatency = 0;
    const featureMap: Record<string, { count: number; tokens: number }> = {};

    for (const u of this.data.aiUsages) {
      const tokens = (u.inputTokens || 0) + (u.outputTokens || 0);
      totalTokens += tokens;
      estimatedCostUsd += u.estimatedCost || 0;
      totalLatency += u.durationMs || 0;

      if (!featureMap[u.feature]) {
        featureMap[u.feature] = { count: 0, tokens: 0 };
      }
      featureMap[u.feature].count++;
      featureMap[u.feature].tokens += tokens;
    }

    const topFeatures = Object.entries(featureMap)
      .map(([feature, stats]) => ({ feature, count: stats.count, tokens: stats.tokens }))
      .sort((a, b) => b.count - a.count);

    return {
      totalRequests,
      totalTokens,
      estimatedCostUsd: Math.round(estimatedCostUsd * 1000) / 1000,
      avgLatencyMs: totalRequests > 0 ? Math.round(totalLatency / totalRequests) : 0,
      topFeatures,
      recentLogs: this.data.aiUsages.slice(0, 20),
    };
  }

  // --- PHASE 8: AUTOMATION & SCHEDULED JOBS ---
  public createScheduledJob(data: Omit<ScheduledJobDocument, 'id' | 'status' | 'attempts' | 'createdAt'>): ScheduledJobDocument {
    const job: ScheduledJobDocument = {
      id: `job-${crypto.randomUUID().slice(0, 8)}`,
      ...data,
      status: 'PENDING',
      attempts: 0,
      createdAt: new Date().toISOString(),
    };
    this.data.scheduledJobs.push(job);
    this.persist();
    return job;
  }

  public listScheduledJobs(status?: string): ScheduledJobDocument[] {
    let list = [...this.data.scheduledJobs];
    if (status && status !== 'ALL') {
      list = list.filter((j) => j.status === status);
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public updateScheduledJob(id: string, partial: Partial<ScheduledJobDocument>): ScheduledJobDocument | null {
    const job = this.data.scheduledJobs.find((j) => j.id === id);
    if (!job) return null;
    Object.assign(job, partial);
    this.persist();
    return job;
  }

  public getNextPendingJob(): ScheduledJobDocument | null {
    const now = new Date().toISOString();
    return (
      this.data.scheduledJobs.find(
        (j) => (j.status === 'PENDING' || j.status === 'RETRYING') && j.nextRunAt <= now
      ) || null
    );
  }

  // ==========================================
  // PHASE 9: TEAMS, AGENCIES & ORGANIZATIONS
  // ==========================================

  public createOrganization(
    data: Omit<OrganizationDocument, 'id' | 'createdAt' | 'updatedAt' | 'stats'>,
    ownerUser: UserDocument
  ): { organization: OrganizationDocument; membership: OrganizationMemberDocument } {
    const orgId = `org-${crypto.randomUUID().slice(0, 8)}`;
    const now = new Date().toISOString();
    const slug = data.slug || slugify(data.name) + '-' + Math.floor(1000 + Math.random() * 9000);

    const organization: OrganizationDocument = {
      ...data,
      id: orgId,
      slug,
      ownerId: ownerUser.id,
      verified: false,
      status: 'ACTIVE',
      stats: {
        totalSpend: 0,
        totalEarned: 0,
        projectsCount: 0,
        membersCount: 1,
        averageRating: 5.0,
      },
      createdAt: now,
      updatedAt: now,
    };

    const membership: OrganizationMemberDocument = {
      id: `member-${crypto.randomUUID().slice(0, 8)}`,
      organizationId: orgId,
      userId: ownerUser.id,
      userName: `${ownerUser.firstName} ${ownerUser.lastName}`,
      userEmail: ownerUser.email,
      userAvatar: ownerUser.avatarUrl || ownerUser.profileImage,
      role: 'OWNER',
      status: 'ACTIVE',
      joinedAt: now,
    };

    this.data.organizations.push(organization);
    this.data.organizationMembers.push(membership);
    this.persist();

    return { organization, membership };
  }

  public getOrganizationById(id: string): OrganizationDocument | null {
    return this.data.organizations.find((o) => o.id === id) || null;
  }

  public getOrganizationBySlug(slug: string): OrganizationDocument | null {
    return this.data.organizations.find((o) => o.slug === slug) || null;
  }

  public listOrganizations(filter?: { type?: OrganizationType; ownerId?: string }): OrganizationDocument[] {
    let list = [...this.data.organizations];
    if (filter?.type) {
      list = list.filter((o) => o.type === filter.type);
    }
    if (filter?.ownerId) {
      list = list.filter((o) => o.ownerId === filter.ownerId);
    }
    return list;
  }

  public listUserOrganizations(userId: string): { organization: OrganizationDocument; role: OrganizationMemberRole }[] {
    const memberships = this.data.organizationMembers.filter((m) => m.userId === userId && m.status === 'ACTIVE');
    const result: { organization: OrganizationDocument; role: OrganizationMemberRole }[] = [];

    for (const m of memberships) {
      const org = this.getOrganizationById(m.organizationId);
      if (org) {
        result.push({ organization: org, role: m.role });
      }
    }
    return result;
  }

  public updateOrganization(id: string, partial: Partial<OrganizationDocument>): OrganizationDocument | null {
    const org = this.data.organizations.find((o) => o.id === id);
    if (!org) return null;
    Object.assign(org, partial, { updatedAt: new Date().toISOString() });
    this.persist();
    return org;
  }

  public getOrganizationMembers(organizationId: string): OrganizationMemberDocument[] {
    return this.data.organizationMembers.filter((m) => m.organizationId === organizationId);
  }

  public addOrganizationMember(
    organizationId: string,
    user: UserDocument,
    role: OrganizationMemberRole = 'MEMBER'
  ): OrganizationMemberDocument {
    const existing = this.data.organizationMembers.find(
      (m) => m.organizationId === organizationId && m.userId === user.id
    );
    if (existing) {
      existing.role = role;
      existing.status = 'ACTIVE';
      this.persist();
      return existing;
    }

    const member: OrganizationMemberDocument = {
      id: `member-${crypto.randomUUID().slice(0, 8)}`,
      organizationId,
      userId: user.id,
      userName: `${user.firstName} ${user.lastName}`,
      userEmail: user.email,
      userAvatar: user.avatarUrl || user.profileImage,
      role,
      status: 'ACTIVE',
      joinedAt: new Date().toISOString(),
    };

    this.data.organizationMembers.push(member);
    const org = this.getOrganizationById(organizationId);
    if (org) {
      org.stats.membersCount = this.getOrganizationMembers(organizationId).length;
    }
    this.persist();
    return member;
  }

  public removeOrganizationMember(organizationId: string, memberId: string): boolean {
    const idx = this.data.organizationMembers.findIndex(
      (m) => m.organizationId === organizationId && (m.id === memberId || m.userId === memberId)
    );
    if (idx === -1) return false;
    this.data.organizationMembers.splice(idx, 1);
    const org = this.getOrganizationById(organizationId);
    if (org) {
      org.stats.membersCount = this.getOrganizationMembers(organizationId).length;
    }
    this.persist();
    return true;
  }

  public updateOrganizationMemberRole(
    organizationId: string,
    memberId: string,
    newRole: OrganizationMemberRole
  ): OrganizationMemberDocument | null {
    const member = this.data.organizationMembers.find(
      (m) => m.organizationId === organizationId && (m.id === memberId || m.userId === memberId)
    );
    if (!member) return null;
    member.role = newRole;
    this.persist();
    return member;
  }

  public createOrganizationInvitation(data: {
    organizationId: string;
    organizationName: string;
    inviterId: string;
    email: string;
    role: OrganizationMemberRole;
  }): OrganizationInvitationDocument {
    const token = crypto.randomBytes(24).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

    const inv: OrganizationInvitationDocument = {
      id: `inv-${crypto.randomUUID().slice(0, 8)}`,
      ...data,
      status: 'PENDING',
      token,
      expiresAt,
      createdAt: new Date().toISOString(),
    };
    this.data.organizationInvitations.push(inv);
    this.persist();
    return inv;
  }

  public listOrganizationInvitations(organizationId: string): OrganizationInvitationDocument[] {
    return this.data.organizationInvitations.filter((i) => i.organizationId === organizationId && i.status === 'PENDING');
  }

  public acceptOrganizationInvitation(token: string, user: UserDocument): OrganizationMemberDocument | null {
    const inv = this.data.organizationInvitations.find((i) => i.token === token && i.status === 'PENDING');
    if (!inv) return null;

    inv.status = 'ACCEPTED';
    const member = this.addOrganizationMember(inv.organizationId, user, inv.role);
    this.persist();
    return member;
  }

  // ==========================================
  // PHASE 9: WORKSPACE COLLABORATION (TASKS, ACTIVITIES, FILES)
  // ==========================================

  public createProjectTask(data: Omit<ProjectTaskDocument, 'id' | 'commentsCount' | 'createdAt' | 'updatedAt'>): ProjectTaskDocument {
    const task: ProjectTaskDocument = {
      id: `task-${crypto.randomUUID().slice(0, 8)}`,
      ...data,
      commentsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.projectTasks.push(task);

    this.logProjectActivity({
      projectId: data.projectId,
      contractId: data.contractId,
      actorId: data.createdBy,
      actorName: data.assigneeName || 'Team Member',
      actorRole: 'MEMBER',
      action: 'TASK_CREATED',
      details: `Created task: "${data.title}" (${data.priority} priority)`,
    });

    this.persist();
    return task;
  }

  public listProjectTasks(projectId: string, contractId?: string): ProjectTaskDocument[] {
    return this.data.projectTasks.filter(
      (t) => t.projectId === projectId || (contractId && t.contractId === contractId)
    );
  }

  public updateProjectTask(id: string, partial: Partial<ProjectTaskDocument>, actorName: string = 'User'): ProjectTaskDocument | null {
    const task = this.data.projectTasks.find((t) => t.id === id);
    if (!task) return null;
    const oldStatus = task.status;
    Object.assign(task, partial, { updatedAt: new Date().toISOString() });

    if (partial.status && partial.status !== oldStatus) {
      this.logProjectActivity({
        projectId: task.projectId,
        contractId: task.contractId,
        actorId: partial.assigneeId || task.createdBy,
        actorName,
        actorRole: 'MEMBER',
        action: 'STATUS_CHANGED',
        details: `Moved task "${task.title}" to ${partial.status}`,
      });
    }

    this.persist();
    return task;
  }

  public deleteProjectTask(id: string): boolean {
    const idx = this.data.projectTasks.findIndex((t) => t.id === id);
    if (idx === -1) return false;
    this.data.projectTasks.splice(idx, 1);
    this.persist();
    return true;
  }

  public logProjectActivity(data: Omit<ProjectActivityDocument, 'id' | 'createdAt'>): ProjectActivityDocument {
    const activity: ProjectActivityDocument = {
      id: `act-${crypto.randomUUID().slice(0, 8)}`,
      ...data,
      createdAt: new Date().toISOString(),
    };
    this.data.projectActivities.unshift(activity);
    if (this.data.projectActivities.length > 2000) {
      this.data.projectActivities = this.data.projectActivities.slice(0, 2000);
    }
    this.persist();
    return activity;
  }

  public listProjectActivities(projectId: string, contractId?: string, limit: number = 50): ProjectActivityDocument[] {
    return this.data.projectActivities
      .filter((a) => a.projectId === projectId || (contractId && a.contractId === contractId))
      .slice(0, limit);
  }

  public uploadProjectFile(data: Omit<ProjectFileDocument, 'id' | 'createdAt'>): ProjectFileDocument {
    const file: ProjectFileDocument = {
      id: `file-${crypto.randomUUID().slice(0, 8)}`,
      ...data,
      createdAt: new Date().toISOString(),
    };
    this.data.projectFiles.push(file);

    this.logProjectActivity({
      projectId: data.projectId,
      contractId: '',
      actorId: data.uploadedBy,
      actorName: data.uploadedByName,
      actorRole: 'MEMBER',
      action: 'FILE_UPLOADED',
      details: `Shared file "${data.name}" (${(data.size / 1024 / 1024).toFixed(1)} MB)`,
    });

    this.persist();
    return file;
  }

  public listProjectFiles(projectId: string): ProjectFileDocument[] {
    return this.data.projectFiles.filter((f) => f.projectId === projectId);
  }

  public deleteProjectFile(id: string): boolean {
    const idx = this.data.projectFiles.findIndex((f) => f.id === id);
    if (idx === -1) return false;
    this.data.projectFiles.splice(idx, 1);
    this.persist();
    return true;
  }

  // ==========================================
  // PHASE 9: ADVANCED REPUTATION & BADGES
  // ==========================================

  public getUserBadges(userId: string): BadgeDocument[] {
    return this.data.badges.filter((b) => b.userId === userId);
  }

  public awardBadge(data: Omit<BadgeDocument, 'id' | 'awardedAt'>): BadgeDocument {
    const existing = this.data.badges.find((b) => b.userId === data.userId && b.badgeType === data.badgeType);
    if (existing) return existing;

    const badge: BadgeDocument = {
      id: `badge-${crypto.randomUUID().slice(0, 8)}`,
      ...data,
      awardedAt: new Date().toISOString(),
    };
    this.data.badges.push(badge);
    this.persist();
    return badge;
  }

  public getReputationBreakdown(userId: string): ReputationBreakdown {
    const user = this.findUserById(userId);
    const reviews = this.data.reviews.filter((r) => r.revieweeId === userId && r.status === 'PUBLISHED');
    const contracts = this.data.contracts.filter(
      (c) => (c.freelancerId === userId || c.sellerId === userId) && c.status === 'COMPLETED'
    );

    let averageRating = 5.0;
    if (reviews.length > 0) {
      const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
      averageRating = Math.round((sum / reviews.length) * 10) / 10;
    }

    const onTimeDeliveryRate = contracts.length > 0 ? 96 : 100;
    const repeatClientRate = contracts.length >= 2 ? 38 : 0;
    const badges = this.getUserBadges(userId);

    // Auto-award badges if qualified
    if (averageRating >= 4.8 && contracts.length >= 3 && !badges.find((b) => b.badgeType === 'TOP_RATED')) {
      this.awardBadge({
        userId,
        badgeType: 'TOP_RATED',
        name: 'Top Rated Talent',
        description: 'Maintained 4.8+ rating across multiple completed milestones',
        icon: 'Crown',
      });
    }

    if (user?.isIdentityVerified && !badges.find((b) => b.badgeType === 'VERIFIED_PRO')) {
      this.awardBadge({
        userId,
        badgeType: 'VERIFIED_PRO',
        name: 'Verified Professional',
        description: 'Identity and credentials verified by platform compliance team',
        icon: 'ShieldCheck',
      });
    }

    const freelancerProfile = this.findFreelancerProfileByUserId(userId);
    const skillRep: Record<string, 'EXCELLENT' | 'STRONG' | 'PROFICIENT' | 'GROWING'> = {};
    if (freelancerProfile?.skills) {
      freelancerProfile.skills.forEach((skill, idx) => {
        skillRep[skill] = idx === 0 ? 'EXCELLENT' : idx === 1 ? 'STRONG' : 'PROFICIENT';
      });
    }

    let overallScore = 75;
    if (averageRating >= 4.9) overallScore += 15;
    else if (averageRating >= 4.5) overallScore += 10;
    if (user?.isIdentityVerified) overallScore += 5;
    if (contracts.length >= 5) overallScore += 5;

    return {
      score: Math.min(100, overallScore),
      onTimeDeliveryRate,
      repeatClientRate,
      averageRating,
      totalCompletedProjects: contracts.length,
      verifiedWorkHistoryCount: contracts.length,
      skillReputation: skillRep,
      badges: this.getUserBadges(userId),
    };
  }

  // ==========================================
  // PHASE 9: SUBSCRIPTIONS & MONETIZATION
  // ==========================================

  public listSubscriptionPlans(): SubscriptionPlanDocument[] {
    return [...this.data.subscriptionPlans];
  }

  public getSubscriptionPlanById(planId: string): SubscriptionPlanDocument | null {
    return this.data.subscriptionPlans.find((p) => p.id === planId) || null;
  }

  public getUserSubscription(userId: string, organizationId?: string): {
    subscription: UserSubscriptionDocument | null;
    plan: SubscriptionPlanDocument;
    proposalsUsedThisMonth: number;
    proposalsRemaining: number;
  } {
    const sub = this.data.userSubscriptions.find(
      (s) => (s.userId === userId || (organizationId && s.organizationId === organizationId)) && s.status === 'ACTIVE'
    ) || null;

    const planId = sub ? sub.planId : 'plan-free';
    const plan = this.getSubscriptionPlanById(planId) || this.data.subscriptionPlans[0];

    // Calculate proposals used this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const proposalsThisMonth = this.data.proposals.filter(
      (p) => p.freelancerId === userId && new Date(p.createdAt) >= startOfMonth
    ).length;

    const limit = plan.limits.proposalsPerMonth;
    const remaining = Math.max(0, limit - proposalsThisMonth);

    return {
      subscription: sub,
      plan,
      proposalsUsedThisMonth: proposalsThisMonth,
      proposalsRemaining: remaining,
    };
  }

  public createOrUpdateUserSubscription(
    userId: string,
    planId: string,
    billingCycle: 'MONTHLY' | 'YEARLY' = 'MONTHLY',
    organizationId?: string
  ): UserSubscriptionDocument {
    const plan = this.getSubscriptionPlanById(planId);
    if (!plan) throw new Error('Invalid subscription plan ID');

    // Cancel existing
    const existing = this.data.userSubscriptions.find(
      (s) => s.userId === userId && s.status === 'ACTIVE'
    );
    if (existing) {
      existing.status = 'CANCELLED';
    }

    const periodMonths = billingCycle === 'YEARLY' ? 12 : 1;
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + periodMonths);

    const newSub: UserSubscriptionDocument = {
      id: `sub-${crypto.randomUUID().slice(0, 8)}`,
      userId,
      organizationId,
      planId,
      planType: plan.type,
      billingCycle,
      status: 'ACTIVE',
      currentPeriodStart: startDate.toISOString(),
      currentPeriodEnd: endDate.toISOString(),
      cancelAtPeriodEnd: false,
      createdAt: startDate.toISOString(),
    };

    this.data.userSubscriptions.push(newSub);
    this.persist();
    return newSub;
  }

  public cancelUserSubscription(subscriptionId: string): boolean {
    const sub = this.data.userSubscriptions.find((s) => s.id === subscriptionId);
    if (!sub) return false;
    sub.cancelAtPeriodEnd = true;
    this.persist();
    return true;
  }

  // ==========================================
  // PHASE 9: REFERRALS & REWARDS
  // ==========================================

  public getOrCreateReferralCode(userId: string): string {
    const user = this.findUserById(userId);
    if (!user) return 'WORKNOVA';
    const cleanName = (user.firstName || 'USER').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4);
    return `${cleanName}${userId.slice(-4).toUpperCase()}`;
  }

  public processReferralRegistration(referredUserId: string, referredEmail: string, referralCode: string): ReferralDocument | null {
    const users = this.data.users;
    const referrer = users.find((u) => this.getOrCreateReferralCode(u.id) === referralCode.toUpperCase());
    if (!referrer || referrer.id === referredUserId) return null;

    const ref: ReferralDocument = {
      id: `ref-${crypto.randomUUID().slice(0, 8)}`,
      referrerId: referrer.id,
      referredUserId,
      referredEmail,
      code: referralCode.toUpperCase(),
      status: 'QUALIFIED',
      rewardAmount: 25, // $25 platform credit
      currency: 'USD',
      createdAt: new Date().toISOString(),
      rewardedAt: new Date().toISOString(),
    };

    this.data.referrals.push(ref);
    this.addPlatformReward(
      referrer.id,
      'PLATFORM_CREDIT',
      25,
      `Referral bonus for welcoming ${referredEmail}`
    );
    this.persist();
    return ref;
  }

  public listUserReferrals(userId: string): ReferralDocument[] {
    return this.data.referrals.filter((r) => r.referrerId === userId);
  }

  public addPlatformReward(
    userId: string,
    type: 'PLATFORM_CREDIT' | 'FEE_DISCOUNT' | 'PROMOTION_CREDIT',
    amount: number,
    description: string
  ): RewardTransactionDocument {
    const reward: RewardTransactionDocument = {
      id: `rew-${crypto.randomUUID().slice(0, 8)}`,
      userId,
      type,
      amount,
      currency: 'USD',
      description,
      createdAt: new Date().toISOString(),
    };
    this.data.rewardTransactions.unshift(reward);
    this.persist();
    return reward;
  }

  public listUserRewards(userId: string): {
    totalCredits: number;
    rewards: RewardTransactionDocument[];
  } {
    const rewards = this.data.rewardTransactions.filter((r) => r.userId === userId);
    const totalCredits = rewards.reduce((acc, r) => acc + r.amount, 0);
    return { totalCredits, rewards };
  }

  // ==========================================
  // PHASE 9: SAVED SEARCHES & FAVORITES
  // ==========================================

  public saveSearch(userId: string, data: { title: string; query: string; filters: Record<string, any>; alertFrequency?: 'INSTANT' | 'DAILY' | 'WEEKLY' }): SavedSearchDocument {
    const item: SavedSearchDocument = {
      id: `search-${crypto.randomUUID().slice(0, 8)}`,
      userId,
      title: data.title,
      query: data.query,
      filters: data.filters || {},
      alertFrequency: data.alertFrequency || 'DAILY',
      createdAt: new Date().toISOString(),
    };
    this.data.savedSearches.push(item);
    this.persist();
    return item;
  }

  public listSavedSearches(userId: string): SavedSearchDocument[] {
    return this.data.savedSearches.filter((s) => s.userId === userId);
  }

  public deleteSavedSearch(id: string, userId: string): boolean {
    const idx = this.data.savedSearches.findIndex((s) => s.id === id && s.userId === userId);
    if (idx === -1) return false;
    this.data.savedSearches.splice(idx, 1);
    this.persist();
    return true;
  }

  public toggleFavorite(userId: string, targetType: 'FREELANCER' | 'PROJECT' | 'AGENCY', targetId: string, notes?: string): { favorited: boolean; item?: FavoriteDocument } {
    const idx = this.data.favorites.findIndex(
      (f) => f.userId === userId && f.targetType === targetType && f.targetId === targetId
    );

    if (idx !== -1) {
      this.data.favorites.splice(idx, 1);
      this.persist();
      return { favorited: false };
    }

    const item: FavoriteDocument = {
      id: `fav-${crypto.randomUUID().slice(0, 8)}`,
      userId,
      targetType,
      targetId,
      notes,
      createdAt: new Date().toISOString(),
    };
    this.data.favorites.push(item);
    this.persist();
    return { favorited: true, item };
  }

  public listFavorites(userId: string, targetType?: 'FREELANCER' | 'PROJECT' | 'AGENCY'): FavoriteDocument[] {
    let list = this.data.favorites.filter((f) => f.userId === userId);
    if (targetType) {
      list = list.filter((f) => f.targetType === targetType);
    }
    return list;
  }

  // ==========================================
  // PHASE 10: DEVELOPER PLATFORM & API KEYS
  // ==========================================

  public createApiKey(
    userId: string,
    data: { name: string; scopes: ApiScope[]; organizationId?: string }
  ): { fullKey: string; keyDoc: ApiKeyDocument } {
    const rawSecret = crypto.randomBytes(24).toString('hex');
    const fullKey = `wn_live_${rawSecret}`;
    const keyHash = crypto.createHash('sha256').update(fullKey).digest('hex');
    const keyPrefix = `wn_live_${rawSecret.slice(0, 6)}...${rawSecret.slice(-4)}`;

    const keyDoc: ApiKeyDocument = {
      id: `key-${crypto.randomUUID().slice(0, 8)}`,
      userId,
      organizationId: data.organizationId,
      name: data.name,
      keyPrefix,
      keyHash,
      scopes: data.scopes,
      rateLimitPerMin: 120,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    };

    this.data.apiKeys.push(keyDoc);
    this.persist();
    return { fullKey, keyDoc };
  }

  public listApiKeys(userId: string, organizationId?: string): ApiKeyDocument[] {
    return this.data.apiKeys.filter((k) => {
      if (organizationId && k.organizationId === organizationId) return true;
      return k.userId === userId;
    });
  }

  public revokeApiKey(id: string, userId: string): boolean {
    const key = this.data.apiKeys.find((k) => k.id === id && k.userId === userId);
    if (!key) return false;
    key.status = 'REVOKED';
    this.persist();
    return true;
  }

  public verifyApiKey(apiKeyString: string): { valid: boolean; doc?: ApiKeyDocument; user?: UserDocument } {
    const keyHash = crypto.createHash('sha256').update(apiKeyString).digest('hex');
    const keyDoc = this.data.apiKeys.find((k) => k.keyHash === keyHash && k.status === 'ACTIVE');
    if (!keyDoc) return { valid: false };

    keyDoc.lastUsedAt = new Date().toISOString();
    this.persist();

    const user = this.findUserById(keyDoc.userId) || undefined;
    return { valid: true, doc: keyDoc, user };
  }

  // ==========================================
  // PHASE 10: WEBHOOK SUBSCRIPTIONS & EVENT DELIVERY
  // ==========================================

  public createWebhookSubscription(
    userId: string,
    data: { targetUrl: string; events: WebhookEvent[]; organizationId?: string }
  ): WebhookSubscriptionDocument {
    const secret = `whsec_${crypto.randomBytes(16).toString('hex')}`;
    const sub: WebhookSubscriptionDocument = {
      id: `whk-${crypto.randomUUID().slice(0, 8)}`,
      userId,
      organizationId: data.organizationId,
      targetUrl: data.targetUrl,
      events: data.events,
      secret,
      status: 'ACTIVE',
      failureCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.data.webhooks.push(sub);
    this.persist();
    return sub;
  }

  public listWebhookSubscriptions(userId: string, organizationId?: string): WebhookSubscriptionDocument[] {
    return this.data.webhooks.filter((w) => {
      if (organizationId && w.organizationId === organizationId) return true;
      return w.userId === userId;
    });
  }

  public updateWebhookSubscription(
    id: string,
    userId: string,
    partial: Partial<WebhookSubscriptionDocument>
  ): WebhookSubscriptionDocument | null {
    const sub = this.data.webhooks.find((w) => w.id === id && w.userId === userId);
    if (!sub) return null;
    Object.assign(sub, partial, { updatedAt: new Date().toISOString() });
    this.persist();
    return sub;
  }

  public deleteWebhookSubscription(id: string, userId: string): boolean {
    const idx = this.data.webhooks.findIndex((w) => w.id === id && w.userId === userId);
    if (idx === -1) return false;
    this.data.webhooks.splice(idx, 1);
    this.persist();
    return true;
  }

  public recordWebhookDelivery(
    subscriptionId: string,
    event: WebhookEvent,
    payload: Record<string, any>,
    statusCode: number,
    responseBody: string,
    durationMs: number,
    status: 'DELIVERED' | 'FAILED' | 'RETRYING'
  ): WebhookDeliveryLogDocument {
    const log: WebhookDeliveryLogDocument = {
      id: `whl-${crypto.randomUUID().slice(0, 8)}`,
      subscriptionId,
      event,
      payload,
      statusCode,
      responseBody,
      durationMs,
      status,
      attempt: 1,
      maxAttempts: 3,
      createdAt: new Date().toISOString(),
    };

    this.data.webhookLogs.unshift(log);
    if (this.data.webhookLogs.length > 500) {
      this.data.webhookLogs.pop();
    }
    this.persist();
    return log;
  }

  public listWebhookLogs(subscriptionId?: string): WebhookDeliveryLogDocument[] {
    if (subscriptionId) {
      return this.data.webhookLogs.filter((l) => l.subscriptionId === subscriptionId);
    }
    return this.data.webhookLogs.slice(0, 50);
  }

  public async dispatchWebhookEvent(event: WebhookEvent, payload: Record<string, any>): Promise<number> {
    const matchingSubs = this.data.webhooks.filter(
      (w) => w.status === 'ACTIVE' && w.events.includes(event)
    );

    for (const sub of matchingSubs) {
      this.recordWebhookDelivery(
        sub.id,
        event,
        payload,
        200,
        '{"status":"ok","received":true}',
        Math.floor(Math.random() * 45) + 15,
        'DELIVERED'
      );
    }

    return matchingSubs.length;
  }

  // ==========================================
  // PHASE 10: MARKETPLACE APPS & INTEGRATIONS
  // ==========================================

  public listMarketplaceApps(category?: string, status?: string): MarketplaceAppDocument[] {
    let list = this.data.marketplaceApps;
    if (category && category !== 'ALL') {
      list = list.filter((a) => a.category === category);
    }
    if (status) {
      list = list.filter((a) => a.status === status);
    }
    return list;
  }

  public getMarketplaceAppById(id: string): MarketplaceAppDocument | null {
    return this.data.marketplaceApps.find((a) => a.id === id || a.slug === id) || null;
  }

  public installMarketplaceApp(appId: string, userId: string, organizationId?: string): AppInstallationDocument {
    const app = this.getMarketplaceAppById(appId);
    const existing = this.data.appInstallations.find(
      (i) => i.appId === (app ? app.id : appId) && i.userId === userId && i.status === 'ACTIVE'
    );
    if (existing) return existing;

    const installDoc: AppInstallationDocument = {
      id: `inst-${crypto.randomUUID().slice(0, 8)}`,
      appId: app ? app.id : appId,
      userId,
      organizationId,
      installedAt: new Date().toISOString(),
      status: 'ACTIVE',
    };

    if (app) {
      app.installsCount += 1;
    }

    this.data.appInstallations.push(installDoc);
    this.persist();
    return installDoc;
  }

  public uninstallMarketplaceApp(appId: string, userId: string): boolean {
    const idx = this.data.appInstallations.findIndex(
      (i) => i.appId === appId && i.userId === userId && i.status === 'ACTIVE'
    );
    if (idx === -1) return false;
    this.data.appInstallations[idx].status = 'REVOKED';
    this.persist();
    return true;
  }

  public listInstalledApps(userId: string): (AppInstallationDocument & { app?: MarketplaceAppDocument })[] {
    const userInstalls = this.data.appInstallations.filter(
      (i) => i.userId === userId && i.status === 'ACTIVE'
    );
    return userInstalls.map((inst) => {
      const app = this.getMarketplaceAppById(inst.appId) || undefined;
      return { ...inst, app };
    });
  }

  // ==========================================
  // PHASE 10: AI AGENT ORCHESTRATOR & GOVERNANCE
  // ==========================================

  public createAIAgentTask(
    data: Omit<AIAgentTaskDocument, 'id' | 'createdAt' | 'approvalStatus' | 'executionStatus'>
  ): AIAgentTaskDocument {
    const requiresApproval = data.riskLevel === 'HIGH_RISK' || data.riskLevel === 'CRITICAL';
    const task: AIAgentTaskDocument = {
      id: `task-${crypto.randomUUID().slice(0, 8)}`,
      userId: data.userId,
      userRole: data.userRole,
      agentType: data.agentType,
      actionName: data.actionName,
      riskLevel: data.riskLevel,
      approvalStatus: requiresApproval ? 'PENDING_APPROVAL' : 'NOT_REQUIRED',
      allowedTools: data.allowedTools,
      deniedTools: data.deniedTools,
      inputPrompt: data.inputPrompt,
      contextPayload: data.contextPayload,
      outputResult: data.outputResult,
      structuredOutput: data.structuredOutput,
      executionStatus: requiresApproval ? 'AWAITING_APPROVAL' : 'COMPLETED',
      durationMs: data.durationMs || Math.floor(Math.random() * 400) + 120,
      createdAt: new Date().toISOString(),
      completedAt: requiresApproval ? undefined : new Date().toISOString(),
    };

    this.data.aiAgentTasks.unshift(task);
    this.persist();
    return task;
  }

  public listAIAgentTasks(userId?: string, agentType?: AIAgentType, status?: string): AIAgentTaskDocument[] {
    let list = this.data.aiAgentTasks;
    if (userId) {
      list = list.filter((t) => t.userId === userId);
    }
    if (agentType) {
      list = list.filter((t) => t.agentType === agentType);
    }
    if (status && status !== 'ALL') {
      list = list.filter((t) => t.executionStatus === status || t.approvalStatus === status);
    }
    return list;
  }

  public getAIAgentTaskById(id: string): AIAgentTaskDocument | null {
    return this.data.aiAgentTasks.find((t) => t.id === id) || null;
  }

  public approveAIAgentTask(id: string, approverUserId: string): AIAgentTaskDocument | null {
    const task = this.getAIAgentTaskById(id);
    if (!task) return null;
    task.approvalStatus = 'APPROVED';
    task.executionStatus = 'COMPLETED';
    task.approvedByUserId = approverUserId;
    task.approvedAt = new Date().toISOString();
    task.completedAt = new Date().toISOString();
    this.persist();
    return task;
  }

  public rejectAIAgentTask(id: string, approverUserId: string, reason: string): AIAgentTaskDocument | null {
    const task = this.getAIAgentTaskById(id);
    if (!task) return null;
    task.approvalStatus = 'REJECTED';
    task.executionStatus = 'FAILED';
    task.rejectionReason = reason;
    task.approvedByUserId = approverUserId;
    task.completedAt = new Date().toISOString();
    this.persist();
    return task;
  }

  // ==========================================
  // PHASE 10: SKILL GRAPH & ASSESSMENTS
  // ==========================================

  public getSkillGraph(): SkillGraphNode[] {
    return this.data.skillGraphNodes;
  }

  public listSkillAssessments(skillName?: string): SkillAssessmentDocument[] {
    if (skillName) {
      return this.data.skillAssessments.filter(
        (a) => a.skillName.toLowerCase() === skillName.toLowerCase()
      );
    }
    return this.data.skillAssessments;
  }

  public getSkillAssessmentById(id: string): SkillAssessmentDocument | null {
    return this.data.skillAssessments.find((a) => a.id === id) || null;
  }

  public submitSkillAssessment(
    userId: string,
    assessmentId: string,
    answers: Record<string, number>
  ): {
    submission: UserAssessmentSubmissionDocument;
    scorePercent: number;
    passed: boolean;
    badgeAwarded?: BadgeDocument;
  } {
    const assessment = this.getSkillAssessmentById(assessmentId);
    if (!assessment) {
      throw new Error('Assessment not found');
    }

    let correctCount = 0;
    assessment.questions.forEach((q) => {
      if (answers[q.id] === q.correctOptionIndex) {
        correctCount += 1;
      }
    });

    const scorePercent = Math.round((correctCount / assessment.questions.length) * 100);
    const passed = scorePercent >= assessment.passScorePercent;

    let badgeAwarded: BadgeDocument | undefined;
    if (passed) {
      badgeAwarded = this.awardBadge({
        userId,
        badgeType: 'SKILL_VERIFIED',
        name: assessment.badgeName,
        description: `Passed skill assessment with score of ${scorePercent}%`,
        icon: 'Award',
      });
    }

    const submission: UserAssessmentSubmissionDocument = {
      id: `subm-${crypto.randomUUID().slice(0, 8)}`,
      userId,
      assessmentId,
      skillName: assessment.skillName,
      scorePercent,
      passed,
      awardedBadgeId: badgeAwarded ? badgeAwarded.id : undefined,
      completedAt: new Date().toISOString(),
    };

    this.data.assessmentSubmissions.unshift(submission);
    this.persist();

    return { submission, scorePercent, passed, badgeAwarded };
  }

  public getUserAssessmentSubmissions(userId: string): UserAssessmentSubmissionDocument[] {
    return this.data.assessmentSubmissions.filter((s) => s.userId === userId);
  }

  // ==========================================
  // PHASE 10: PLATFORM HEALTH & INCIDENTS
  // ==========================================

  public listIncidents(status?: IncidentStatus): IncidentDocument[] {
    if (status) {
      return this.data.incidents.filter((i) => i.status === status);
    }
    return this.data.incidents;
  }

  public createIncident(data: Omit<IncidentDocument, 'id' | 'startedAt' | 'timeline'>): IncidentDocument {
    const incident: IncidentDocument = {
      id: `inc-${crypto.randomUUID().slice(0, 8)}`,
      title: data.title,
      service: data.service,
      severity: data.severity,
      status: data.status,
      summary: data.summary,
      impactDescription: data.impactDescription,
      startedAt: new Date().toISOString(),
      timeline: [
        {
          timestamp: new Date().toISOString(),
          message: data.summary,
          status: data.status,
        },
      ],
    };

    this.data.incidents.unshift(incident);
    this.persist();
    return incident;
  }

  public updateIncident(id: string, partial: Partial<IncidentDocument>): IncidentDocument | null {
    const inc = this.data.incidents.find((i) => i.id === id);
    if (!inc) return null;
    Object.assign(inc, partial);
    if (partial.status === 'RESOLVED' && !inc.resolvedAt) {
      inc.resolvedAt = new Date().toISOString();
    }
    this.persist();
    return inc;
  }

  public getMarketplaceHealthReport(): MarketplaceHealthReport {
    const activeProjects = this.data.projects.filter((p) => p.status === 'PUBLISHED').length;
    const freelancers = this.data.freelancerProfiles.length || 1;
    const ratio = Number((freelancers / (activeProjects || 1)).toFixed(2));

    return {
      overallHealthScore: 98.4,
      timestamp: new Date().toISOString(),
      supplyDemandRatio: ratio,
      activeProjectsCount: activeProjects,
      availableFreelancersCount: freelancers,
      medianTimeToHireHours: 4.2,
      disputeRatePercent: 0.28,
      liquidityAlerts: [
        {
          category: 'Frontend Development',
          status: 'BALANCED',
          message: 'Healthy equilibrium. Median proposal response time: 14 mins.',
          demandChangePercent: 12.4,
          supplyChangePercent: 9.8,
        },
        {
          category: 'Data & AI Engineering',
          status: 'SHORTAGE',
          message: 'High client surge: AI specialists experiencing +34% bid win rates.',
          demandChangePercent: 44.2,
          supplyChangePercent: 18.0,
        },
        {
          category: 'UI/UX Design',
          status: 'SURPLUS',
          message: 'Competitive category. Fast hiring cycles under 6 hours average.',
          demandChangePercent: 8.1,
          supplyChangePercent: 15.3,
        },
      ],
    };
  }

  // ==========================================
  // PHASE 10: CUSTOM ENTERPRISE REPORTS
  // ==========================================

  public createCustomReport(
    userId: string,
    data: Omit<CustomReportConfigDocument, 'id' | 'createdAt'>
  ): CustomReportConfigDocument {
    const report: CustomReportConfigDocument = {
      id: `rep-${crypto.randomUUID().slice(0, 8)}`,
      userId,
      organizationId: data.organizationId,
      name: data.name,
      type: data.type,
      filters: data.filters,
      format: data.format,
      schedule: data.schedule,
      createdAt: new Date().toISOString(),
    };

    this.data.customReports.push(report);
    this.persist();
    return report;
  }

  public listCustomReports(userId: string): CustomReportConfigDocument[] {
    return this.data.customReports.filter((r) => r.userId === userId);
  }

  public deleteCustomReport(id: string, userId: string): boolean {
    const idx = this.data.customReports.findIndex((r) => r.id === id && r.userId === userId);
    if (idx === -1) return false;
    this.data.customReports.splice(idx, 1);
    this.persist();
    return true;
  }
}

export const db = new Database();
