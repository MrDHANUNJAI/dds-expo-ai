export type UserRole = 'FREELANCER' | 'SELLER' | 'ADMIN';

export type AccountType = 'INDIVIDUAL' | 'STARTUP' | 'BUSINESS' | 'COMPANY';

export type ExperienceLevel = 'Beginner' | 'Intermediate' | 'Expert';

export interface UserDocument {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: UserRole;
  profileImage?: string;
  avatarUrl?: string;
  isVerified: boolean;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  isIdentityVerified?: boolean;
  isBusinessVerified?: boolean;
  isPaymentVerified?: boolean;
  twoFactorEnabled?: boolean;
  twoFactorSecret?: string;
  recoveryCodes?: string[];
  status?: 'ACTIVE' | 'SUSPENDED' | 'RESTRICTED';
  availability?: 'Available Now' | 'Busy' | 'Not Available';
  responseRate?: number;
  averageResponseTimeHours?: number;
  isActive: boolean;
  isSuspended: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export interface FreelancerProfileDocument {
  id: string;
  userId: string;
  professionalTitle: string;
  bio: string;
  skills: string[];
  experienceLevel: ExperienceLevel;
  yearsOfExperience: number;
  hourlyRate: number;
  location: string;
  languages: { language: string; proficiency: string }[];
  education: { degree: string; institution: string; year: string }[];
  certifications: { title: string; issuer: string; year: string }[];
  portfolio: {
    id: string;
    title: string;
    description: string;
    category?: string;
    skills?: string[];
    link?: string;
  }[];
  resumeUrl?: string;
  availability: 'Available Now' | 'Part-time' | 'Busy';
  profileCompletion: number;
  createdAt: string;
  updatedAt: string;
}

export interface SellerProfileDocument {
  id: string;
  userId: string;
  accountType: AccountType;
  businessName: string;
  companyName?: string;
  industry: string;
  description: string;
  website: string;
  location: string;
  companySize: string;
  profileImage?: string;
  profileCompletion: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLogDocument {
  id: string;
  userId?: string;
  userEmail?: string;
  action: string;
  details: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface PasswordResetTokenDocument {
  id: string;
  userId: string;
  token: string;
  expiresAt: string;
  used?: boolean;
  usedAt?: string;
  createdAt: string;
}

export interface SessionDocument {
  id: string;
  userId: string;
  refreshToken: string;
  expiresAt: string;
  createdAt: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  code?: string;
}

export interface JWTPayload {
  userId: string;
  role: UserRole;
  email: string;
}

export type ProjectStatus =
  | 'DRAFT'
  | 'PUBLISHED'
  | 'UNDER_REVIEW'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'ARCHIVED';

export type BudgetType = 'fixed' | 'hourly';

export type ProjectScope = 'Small' | 'Medium' | 'Large';

export type ProposalStatus =
  | 'SUBMITTED'
  | 'SHORTLISTED'
  | 'REJECTED'
  | 'ACCEPTED'
  | 'WITHDRAWN';

export interface ProjectDocument {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerCompany: string;
  sellerAvatar?: string;
  sellerLocation?: string;
  title: string;
  slug: string;
  description: string;
  categoryId: string;
  categoryName: string;
  category?: string;
  subcategoryId?: string;
  subcategoryName?: string;
  subcategory?: string;
  skills: string[];
  budgetType: BudgetType;
  budgetMin: number;
  budgetMax: number;
  fixedAmount?: number;
  experienceLevel: ExperienceLevel;
  scope: ProjectScope;
  deadline: string;
  duration?: string;
  deliverables: string[];
  attachments: string[];
  status: ProjectStatus;
  proposalCount: number;
  isRemote: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface ProposalMilestone {
  description: string;
  amount: number;
  durationDays: number;
}

export interface ProposalDocument {
  id: string;
  projectId: string;
  projectTitle: string;
  freelancerId: string;
  freelancerUserId: string;
  freelancerName: string;
  freelancerTitle: string;
  freelancerAvatar?: string;
  freelancerHourlyRate?: number;
  freelancerRating?: number;
  coverLetter: string;
  bidAmount: number;
  estimatedDays: number;
  milestones?: ProposalMilestone[];
  attachments?: string[];
  status: ProposalStatus;
  clientNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CategorySubcategory {
  id: string;
  name: string;
  slug: string;
}

export interface CategoryDocument {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  subcategories: CategorySubcategory[];
  projectCount: number;
}

export interface SkillDocument {
  id: string;
  name: string;
  category: string;
}

export interface SavedProjectDocument {
  id: string;
  freelancerId: string;
  projectId: string;
  createdAt: string;
}

// ==========================================
// --- PHASE 5: CONTRACTS & MILESTONES ---
// ==========================================

export type ContractStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'DISPUTED';

export interface ContractDocument {
  id: string;
  projectId: string;
  projectTitle: string;
  proposalId: string;
  sellerId: string;
  sellerName: string;
  sellerCompany: string;
  freelancerId: string;
  freelancerUserId: string;
  freelancerName: string;
  freelancerTitle: string;
  totalAmount: number;
  totalBudget?: number;
  totalMinorUnits: number;
  currency: 'INR' | 'USD';
  status: ContractStatus;
  milestones?: MilestoneDocument[];
  createdAt: string;
  updatedAt: string;
}

export type MilestonePaymentStatus =
  | 'UNFUNDED'
  | 'PAYMENT_PENDING'
  | 'FUNDED'
  | 'RELEASE_PENDING'
  | 'RELEASED'
  | 'REFUND_PENDING'
  | 'REFUNDED'
  | 'FAILED';

export type MilestoneWorkflowStatus =
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'SUBMITTED'
  | 'APPROVED'
  | 'CANCELLED';

export interface MilestoneDocument {
  id: string;
  contractId: string;
  projectId: string;
  title: string;
  description: string;
  amount: number;
  minorUnits: number;
  currency: 'INR' | 'USD';
  paymentStatus: MilestonePaymentStatus;
  workflowStatus: MilestoneWorkflowStatus;
  deliveryNotes?: string;
  deliveryFiles?: string[];
  deliveredAt?: string;
  approvedAt?: string;
  fundedAt?: string;
  releasedAt?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// --- PHASE 5: PAYMENTS & FINANCIALS ---
// ==========================================

export type PaymentStatus =
  | 'CREATED'
  | 'CHECKOUT_PENDING'
  | 'PROCESSING'
  | 'PAID'
  | 'FAILED'
  | 'CANCELLED'
  | 'REFUNDED'
  | 'PARTIALLY_REFUNDED'
  | 'DISPUTED';

export type PaymentType =
  | 'MILESTONE_FUNDING'
  | 'MILESTONE_RELEASE'
  | 'REFUND'
  | 'PAYOUT'
  | 'PLATFORM_FEE';

export interface PaymentDocument {
  id: string;
  projectId: string;
  contractId: string;
  milestoneId: string;
  sellerId: string;
  freelancerId: string;
  amount: number;
  minorUnits: number;
  currency: 'INR' | 'USD';
  platformFee: number;
  platformFeeMinorUnits: number;
  platformFeeRate: number;
  taxAmount: number;
  taxRate: number;
  totalAmount: number;
  totalAmountMinorUnits: number;
  provider: 'RAZORPAY' | 'STRIPE' | 'MOCK_SANDBOX';
  providerPaymentId?: string;
  providerOrderId?: string;
  providerSignature?: string;
  status: PaymentStatus;
  paymentType: PaymentType;
  metadata: Record<string, unknown>;
  idempotencyKey?: string;
  createdAt: string;
  updatedAt: string;
  paidAt?: string;
  failedAt?: string;
}

export type TransactionType =
  | 'PAYMENT'
  | 'ESCROW_FUND'
  | 'ESCROW_RELEASE'
  | 'PLATFORM_FEE'
  | 'REFUND'
  | 'PAYOUT'
  | 'ADJUSTMENT'
  | 'TAX';

export type TransactionDirection = 'CREDIT' | 'DEBIT';

export interface TransactionDocument {
  id: string;
  userId: string;
  projectId?: string;
  contractId?: string;
  milestoneId?: string;
  paymentId?: string;
  type: TransactionType;
  direction: TransactionDirection;
  amount: number;
  minorUnits: number;
  currency: 'INR' | 'USD';
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
  reference: string;
  description: string;
  createdAt: string;
}

export interface WalletDocument {
  id: string;
  userId: string;
  currency: 'INR' | 'USD';
  availableBalance: number;
  availableMinorUnits: number;
  pendingBalance: number;
  pendingMinorUnits: number;
  totalEarned: number;
  totalEarnedMinorUnits: number;
  totalWithdrawn: number;
  totalWithdrawnMinorUnits: number;
  createdAt: string;
  updatedAt: string;
}

export type LedgerType =
  | 'EARNING'
  | 'PLATFORM_FEE'
  | 'WITHDRAWAL'
  | 'REFUND'
  | 'ADJUSTMENT'
  | 'BONUS'
  | 'REVERSAL';

export interface WalletLedgerDocument {
  id: string;
  walletId: string;
  userId: string;
  type: LedgerType;
  direction: TransactionDirection;
  amount: number;
  minorUnits: number;
  currency: 'INR' | 'USD';
  referenceType: 'MILESTONE' | 'PAYOUT' | 'REFUND' | 'ADMIN';
  referenceId: string;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  createdAt: string;
}

export type PayoutStatus = 'REQUESTED' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export interface PayoutDocument {
  id: string;
  userId: string;
  walletId: string;
  amount: number;
  minorUnits: number;
  currency: 'INR' | 'USD';
  method: 'BANK_TRANSFER' | 'UPI' | 'PAYPAL';
  accountDetailsReference: string;
  provider: string;
  providerPayoutId?: string;
  status: PayoutStatus;
  failureReason?: string;
  requestedAt: string;
  processedAt?: string;
}

export type InvoiceStatus = 'ISSUED' | 'PAID' | 'REFUNDED' | 'CANCELLED';

export interface InvoiceDocument {
  id: string;
  invoiceNumber: string;
  paymentId: string;
  sellerId: string;
  sellerName: string;
  sellerCompany: string;
  freelancerId: string;
  freelancerName: string;
  projectId: string;
  projectTitle: string;
  milestoneId: string;
  milestoneTitle: string;
  subtotal: number;
  platformFee: number;
  tax: number;
  total: number;
  currency: 'INR' | 'USD';
  status: InvoiceStatus;
  issuedAt: string;
  dueAt: string;
  paidAt?: string;
}

export type RefundStatus = 'REQUESTED' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REJECTED';

export interface RefundDocument {
  id: string;
  paymentId: string;
  transactionId?: string;
  projectId: string;
  milestoneId: string;
  requestedBy: string;
  amount: number;
  minorUnits: number;
  currency: 'INR' | 'USD';
  reason: string;
  status: RefundStatus;
  providerRefundId?: string;
  createdAt: string;
  processedAt?: string;
}

export interface PlatformSettingsDocument {
  defaultPlatformFeeRate: number; // e.g. 0.10
  sellerFeeRate: number; // 0
  freelancerFeeRate: number; // 0.10
  minWithdrawalAmount: number; // e.g. 500
  maxWithdrawalAmount: number; // e.g. 500000
  defaultCurrency: 'INR' | 'USD';
  taxRate: number; // e.g. 0.18 for 18% GST, or 0
  paymentProvider: 'RAZORPAY' | 'STRIPE' | 'MOCK_SANDBOX';
  testMode: boolean;
  updatedAt: string;
}

export interface FinancialAuditLogDocument {
  id: string;
  action: string;
  userId?: string;
  userEmail?: string;
  details: Record<string, unknown>;
  createdAt: string;
}

export interface ProcessedWebhookDocument {
  id: string;
  providerEventId: string;
  provider: string;
  eventType: string;
  createdAt: string;
}

// ==========================================
// PHASE 6: MESSAGING, NOTIFICATIONS, REVIEWS,
// DISPUTES, SUPPORT & MODERATION
// ==========================================

export type ConversationStatus = 'ACTIVE' | 'ARCHIVED' | 'BLOCKED' | 'CLOSED';

export interface ConversationDocument {
  id: string;
  projectId: string;
  contractId?: string;
  sellerId: string;
  freelancerId: string;
  status: ConversationStatus;
  lastMessageSnippet?: string;
  lastMessageAt?: string;
  lastSenderId?: string;
  unreadCountSeller: number;
  unreadCountFreelancer: number;
  createdAt: string;
  updatedAt: string;
}

export type MessageType = 'TEXT' | 'FILE' | 'IMAGE' | 'SYSTEM' | 'LINK' | 'VOICE' | 'VIDEO';
export type MessageStatus = 'SENT' | 'DELIVERED' | 'READ' | 'FAILED' | 'DELETED';

export interface MessageAttachment {
  id: string;
  name: string;
  url: string;
  size: number;
  mimeType: string;
}

export interface MessageDocument {
  id: string;
  conversationId: string;
  senderId: string;
  senderRole?: UserRole;
  messageType: MessageType;
  content: string;
  attachments: MessageAttachment[];
  replyToMessageId?: string;
  status: MessageStatus;
  editedAt?: string;
  deletedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type NotificationType =
  | 'NEW_MESSAGE'
  | 'PROPOSAL_SUBMITTED'
  | 'PROPOSAL_VIEWED'
  | 'PROPOSAL_SHORTLISTED'
  | 'PROPOSAL_REJECTED'
  | 'CONTRACT_RECEIVED'
  | 'CONTRACT_ACCEPTED'
  | 'CONTRACT_DECLINED'
  | 'MILESTONE_CREATED'
  | 'MILESTONE_FUNDED'
  | 'DELIVERY_SUBMITTED'
  | 'REVISION_REQUESTED'
  | 'DELIVERY_APPROVED'
  | 'PAYMENT_SUCCESS'
  | 'PAYMENT_FAILED'
  | 'PAYOUT_COMPLETED'
  | 'PAYOUT_FAILED'
  | 'PROJECT_COMPLETED'
  | 'NEW_REVIEW'
  | 'DISPUTE_CREATED'
  | 'DISPUTE_UPDATED'
  | 'SUPPORT_REPLY'
  | 'ACCOUNT_WARNING'
  | 'MILESTONE_REMINDER'
  | 'DELIVERY_PENDING_APPROVAL'
  | 'AUTOMATION_REMINDER'
  | 'REVIEW_REMINDER';

export interface NotificationDocument {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  entityType: 'project' | 'proposal' | 'contract' | 'milestone' | 'payment' | 'payout' | 'review' | 'dispute' | 'support' | 'message' | 'system';
  entityId?: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

export interface NotificationPreferencesDocument {
  userId: string;
  inApp: boolean;
  email: boolean;
  push: boolean;
  categories: {
    messages: boolean;
    projectUpdates: boolean;
    payments: boolean;
    reviews: boolean;
    support: boolean;
    marketing: boolean;
  };
}

export type ReviewStatus = 'PUBLISHED' | 'HIDDEN' | 'FLAGGED' | 'REMOVED' | 'PENDING_MODERATION';

export interface ReviewDocument {
  id: string;
  projectId: string;
  contractId?: string;
  reviewerId: string;
  reviewerRole: UserRole;
  revieweeId: string;
  rating: number; // 1-5
  title?: string;
  comment: string;
  communicationRating: number;
  qualityRating: number;
  professionalismRating: number;
  timelinessRating: number;
  status: ReviewStatus;
  createdAt: string;
  updatedAt: string;
}

export type ReportType = 'USER' | 'MESSAGE' | 'REVIEW' | 'PROJECT' | 'FILE' | 'PAYMENT' | 'OTHER';
export type ReportStatus = 'OPEN' | 'UNDER_REVIEW' | 'ACTION_REQUIRED' | 'RESOLVED' | 'DISMISSED';

export interface ReportDocument {
  id: string;
  reporterId: string;
  reportedUserId?: string;
  projectId?: string;
  messageId?: string;
  reviewId?: string;
  type: ReportType;
  reason: string;
  description: string;
  evidence?: string[];
  status: ReportStatus;
  resolutionNotes?: string;
  resolvedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export type DisputeStatus =
  | 'OPEN'
  | 'UNDER_REVIEW'
  | 'WAITING_FOR_SELLER'
  | 'WAITING_FOR_FREELANCER'
  | 'RESOLVED_SELLER'
  | 'RESOLVED_FREELANCER'
  | 'PARTIALLY_RESOLVED'
  | 'CLOSED';

export type DisputePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface DisputeEvidence {
  id: string;
  uploadedBy: string;
  title: string;
  fileUrl: string;
  fileType: string;
  description?: string;
  createdAt: string;
}

export interface DisputeTimelineEvent {
  id: string;
  actorId?: string;
  actorRole?: string;
  event: string;
  note?: string;
  createdAt: string;
}

export interface DisputeResolutionDetails {
  favoredParty: 'SELLER' | 'FREELANCER' | 'SPLIT';
  refundAmount?: number;
  releaseAmount?: number;
  adminNote?: string;
  transactionId?: string;
}

export interface DisputeDocument {
  id: string;
  projectId: string;
  contractId: string;
  milestoneId?: string;
  openedBy: string;
  againstUserId: string;
  reason: string;
  description: string;
  amount: number;
  disputedAmount?: number;
  currency: 'INR' | 'USD';
  priority: DisputePriority;
  status: DisputeStatus;
  resolution?: string;
  resolutionDetails?: DisputeResolutionDetails;
  evidence: DisputeEvidence[];
  timeline: DisputeTimelineEvent[];
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export type SupportCategory =
  | 'Account'
  | 'Payments'
  | 'Projects'
  | 'Proposals'
  | 'Contracts'
  | 'Technical Issue'
  | 'Withdrawal'
  | 'Dispute'
  | 'Report'
  | 'Other';

export type SupportStatus = 'OPEN' | 'IN_PROGRESS' | 'WAITING_FOR_USER' | 'RESOLVED' | 'CLOSED';

export interface SupportMessage {
  id: string;
  senderId: string;
  senderRole: UserRole;
  senderName: string;
  content: string;
  attachments?: string[];
  isInternalNote: boolean;
  createdAt: string;
}

export interface SupportTicketDocument {
  id: string;
  userId: string;
  userEmail?: string;
  userName?: string;
  category: SupportCategory;
  subject: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: SupportStatus;
  assignedAdminId?: string;
  messages: SupportMessage[];
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
}

export type ModerationActionType =
  | 'WARNING'
  | 'MESSAGING_RESTRICTED'
  | 'BIDDING_RESTRICTED'
  | 'POSTING_RESTRICTED'
  | 'WITHDRAWAL_RESTRICTED'
  | 'SUSPENDED'
  | 'UNSUSPENDED';

export interface ModerationActionDocument {
  id: string;
  adminId: string;
  userId: string;
  action: ModerationActionType;
  reason: string;
  expiresAt?: string;
  createdAt: string;
}

export interface UserBlockDocument {
  id: string;
  blockerId: string;
  blockedUserId: string;
  reason?: string;
  createdAt: string;
}

export interface FAQItemDocument {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
  published: boolean;
  createdAt: string;
}

// ==========================================
// PHASE 7: VERIFICATION, SECURITY, SEARCH &
// ANALYTICS & INTELLIGENCE
// ==========================================

export type VerificationType = 'EMAIL' | 'PHONE' | 'IDENTITY' | 'BUSINESS' | 'PAYMENT' | 'PROFILE';
export type VerificationStatus =
  | 'NOT_STARTED'
  | 'PENDING'
  | 'VERIFIED'
  | 'FAILED'
  | 'EXPIRED'
  | 'REQUIRES_REVIEW'
  | 'REJECTED';

export interface VerificationDocument {
  id: string;
  userId: string;
  type: VerificationType;
  status: VerificationStatus;
  provider?: string;
  providerReference?: string;
  submittedAt?: string;
  verifiedAt?: string;
  expiresAt?: string;
  failureReason?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface TwoFactorAuthDocument {
  userId: string;
  enabled: boolean;
  secret?: string;
  recoveryCodes?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SecurityActivityDocument {
  id: string;
  userId: string;
  action: 'LOGIN' | 'LOGOUT' | 'PASSWORD_CHANGE' | 'EMAIL_VERIFIED' | 'PHONE_VERIFIED' | '2FA_ENABLED' | '2FA_DISABLED' | 'SESSION_REVOKED';
  ipAddress?: string;
  userAgent?: string;
  device?: string;
  location?: string;
  createdAt: string;
}

export type RiskSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type RiskEventStatus = 'NEW' | 'REVIEWED' | 'DISMISSED' | 'ACTION_TAKEN';

export interface RiskEventDocument {
  id: string;
  userId?: string;
  eventType:
    | 'MULTIPLE_FAILED_LOGIN'
    | 'PAYMENT_ANOMALY'
    | 'MASS_BIDDING'
    | 'MESSAGE_SPAM'
    | 'MULTIPLE_ACCOUNTS_SIGNAL'
    | 'SUSPICIOUS_WITHDRAWAL'
    | 'RAPID_ACCOUNT_ACTIVITY'
    | 'UNUSUAL_DEVICE';
  riskScore: number; // 0-100
  severity: RiskSeverity;
  metadata?: Record<string, any>;
  status: RiskEventStatus;
  createdAt: string;
}

export interface AnalyticsEventDocument {
  id: string;
  userId?: string;
  eventType: string;
  entityType?: string;
  entityId?: string;
  sessionId?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface FeatureFlagDocument {
  id: string;
  key: string;
  enabled: boolean;
  description: string;
  targetRole?: UserRole | 'ALL';
  createdAt: string;
  updatedAt: string;
}

export interface PlatformConfigDocument {
  id: string;
  allowNewRegistrations: boolean;
  requireIdentityVerificationForPayout: boolean;
  requireEmailVerificationForBidding: boolean;
  enableRecommendations: boolean;
  maxProposalsPerDay: number;
  maintenanceMode: boolean;
  updatedAt: string;
}

// ==========================================
// PHASE 8: AI & AUTOMATION ENGINE
// ==========================================
export interface AIUsageDocument {
  id: string;
  userId?: string;
  feature: string;
  provider: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  estimatedCost: number;
  durationMs: number;
  success: boolean;
  createdAt: string;
}

export type JobStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'RETRYING';
export type JobType =
  | 'PROJECT_REMINDER'
  | 'MILESTONE_REMINDER'
  | 'PAYMENT_REMINDER'
  | 'REVIEW_REMINDER'
  | 'SEARCH_INDEX_UPDATE'
  | 'AI_TASK'
  | 'CLEANUP_TASK';

export interface ScheduledJobDocument {
  id: string;
  type: JobType;
  payload: Record<string, any>;
  status: JobStatus;
  attempts: number;
  maxAttempts: number;
  nextRunAt: string;
  lastError?: string;
  completedAt?: string;
  createdAt: string;
}

// ==========================================
// PHASE 9: TEAMS, ORGANIZATIONS & NEXT-GEN
// ==========================================
export type OrganizationType = 'SELLER_COMPANY' | 'FREELANCER_AGENCY' | 'STUDIO' | 'TEAM' | 'ENTERPRISE';
export type OrganizationMemberRole = 'OWNER' | 'ADMIN' | 'MANAGER' | 'MEMBER' | 'FINANCE' | 'VIEWER';
export type OrganizationMemberStatus = 'ACTIVE' | 'INVITED' | 'SUSPENDED';

export interface OrganizationDocument {
  id: string;
  name: string;
  slug: string;
  type: OrganizationType;
  logoUrl?: string;
  description: string;
  website?: string;
  industry: string;
  country: string;
  timezone: string;
  currency: 'INR' | 'USD' | 'EUR' | 'GBP';
  ownerId: string;
  verified: boolean;
  status: 'ACTIVE' | 'PENDING' | 'SUSPENDED';
  stats: {
    totalSpend?: number;
    totalEarned?: number;
    projectsCount: number;
    membersCount: number;
    averageRating: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationMemberDocument {
  id: string;
  organizationId: string;
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar?: string;
  role: OrganizationMemberRole;
  status: OrganizationMemberStatus;
  joinedAt: string;
}

export interface OrganizationInvitationDocument {
  id: string;
  organizationId: string;
  organizationName: string;
  inviterId: string;
  email: string;
  role: OrganizationMemberRole;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  token: string;
  expiresAt: string;
  createdAt: string;
}

// Workspace Collaboration: Tasks, Activity, Files
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'BLOCKED' | 'COMPLETED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface ProjectTaskDocument {
  id: string;
  projectId: string;
  contractId: string;
  title: string;
  description: string;
  assigneeId?: string;
  assigneeName?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  milestoneId?: string;
  commentsCount: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectActivityDocument {
  id: string;
  projectId: string;
  contractId: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  action:
    | 'TASK_CREATED'
    | 'TASK_UPDATED'
    | 'STATUS_CHANGED'
    | 'FILE_UPLOADED'
    | 'MILESTONE_UPDATED'
    | 'DELIVERY_SUBMITTED'
    | 'PAYMENT_RELEASED'
    | 'COMMENT_ADDED';
  details: string;
  createdAt: string;
}

export interface ProjectFileDocument {
  id: string;
  projectId: string;
  name: string;
  size: number;
  type: string;
  version: number;
  url: string;
  uploadedBy: string;
  uploadedByName: string;
  folder: string;
  createdAt: string;
}

// Reputation & Professional Badges
export type BadgeType =
  | 'TOP_RATED'
  | 'VERIFIED_PRO'
  | 'SKILL_VERIFIED'
  | 'FAST_RESPONDER'
  | 'RELIABLE_DELIVERY'
  | 'RISING_TALENT'
  | 'TRUSTED_SELLER'
  | 'VERIFIED_AGENCY';

export interface BadgeDocument {
  id: string;
  userId: string;
  badgeType: BadgeType;
  name: string;
  description: string;
  icon: string;
  awardedAt: string;
}

export interface ReputationBreakdown {
  score: number; // 0-100
  onTimeDeliveryRate: number; // %
  repeatClientRate: number; // %
  averageRating: number;
  totalCompletedProjects: number;
  verifiedWorkHistoryCount: number;
  skillReputation: Record<string, 'EXCELLENT' | 'STRONG' | 'PROFICIENT' | 'GROWING'>;
  badges: BadgeDocument[];
}

// Subscription & Monetization
export type SubscriptionPlanType = 'FREE' | 'PRO' | 'BUSINESS' | 'AGENCY' | 'ENTERPRISE';

export interface SubscriptionPlanDocument {
  id: string;
  name: string;
  type: SubscriptionPlanType;
  description: string;
  priceMonthly: number;
  priceYearly: number;
  currency: string;
  features: string[];
  limits: {
    proposalsPerMonth: number;
    aiTokensPerMonth: number;
    teamMembers: number;
    storageGb: number;
    platformFeeDiscountPercent: number;
  };
  isPopular?: boolean;
}

export interface UserSubscriptionDocument {
  id: string;
  userId: string;
  organizationId?: string;
  planId: string;
  planType: SubscriptionPlanType;
  billingCycle: 'MONTHLY' | 'YEARLY';
  status: 'ACTIVE' | 'PAST_DUE' | 'CANCELLED' | 'TRIALING';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
}

// Referrals & Rewards
export interface ReferralDocument {
  id: string;
  referrerId: string;
  referredUserId: string;
  referredEmail: string;
  code: string;
  status: 'PENDING' | 'QUALIFIED' | 'REWARDED';
  rewardAmount: number;
  currency: string;
  createdAt: string;
  rewardedAt?: string;
}

export interface RewardTransactionDocument {
  id: string;
  userId: string;
  type: 'PLATFORM_CREDIT' | 'FEE_DISCOUNT' | 'PROMOTION_CREDIT';
  amount: number;
  currency: string;
  description: string;
  createdAt: string;
}

// Content CMS & Announcements
export interface ArticleCMSDocument {
  id: string;
  title: string;
  slug: string;
  description: string;
  body: string;
  coverImage?: string;
  author: string;
  category: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  seoTitle?: string;
  seoDescription?: string;
  publishedAt?: string;
  createdAt: string;
}

// Saved Searches & Favorites
export interface SavedSearchDocument {
  id: string;
  userId: string;
  title: string;
  query: string;
  filters: Record<string, any>;
  alertFrequency: 'INSTANT' | 'DAILY' | 'WEEKLY';
  lastAlertSentAt?: string;
  createdAt: string;
}

export interface FavoriteDocument {
  id: string;
  userId: string;
  targetType: 'FREELANCER' | 'PROJECT' | 'AGENCY';
  targetId: string;
  notes?: string;
  createdAt: string;
}

// Consultation / Calendars
export interface ConsultationSlotDocument {
  id: string;
  freelancerId: string;
  date: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  rate: number;
  currency: string;
  isBooked: boolean;
  bookedByUserId?: string;
}

// ==========================================
// PHASE 10: MARKETPLACE OS, AI AGENTS & ECOSYSTEM
// ==========================================

// Developer Platform & API Keys
export type ApiScope =
  | 'projects:read'
  | 'projects:write'
  | 'proposals:read'
  | 'proposals:write'
  | 'contracts:read'
  | 'contracts:write'
  | 'profiles:read'
  | 'messages:read'
  | 'messages:write'
  | 'analytics:read'
  | 'webhooks:manage';

export interface ApiKeyDocument {
  id: string;
  userId: string;
  organizationId?: string;
  name: string;
  keyPrefix: string; // e.g. "wn_live_a1b2..."
  keyHash: string;
  scopes: ApiScope[];
  rateLimitPerMin: number;
  lastUsedAt?: string;
  expiresAt?: string;
  status: 'ACTIVE' | 'REVOKED' | 'EXPIRED';
  createdAt: string;
}

export type WebhookEvent =
  | 'project.created'
  | 'project.updated'
  | 'proposal.created'
  | 'proposal.accepted'
  | 'contract.created'
  | 'milestone.funded'
  | 'milestone.released'
  | 'delivery.submitted'
  | 'payment.completed'
  | 'review.created'
  | 'dispute.opened';

export interface WebhookSubscriptionDocument {
  id: string;
  userId: string;
  organizationId?: string;
  targetUrl: string;
  events: WebhookEvent[];
  secret: string;
  status: 'ACTIVE' | 'PAUSED' | 'FAILED';
  failureCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface WebhookDeliveryLogDocument {
  id: string;
  subscriptionId: string;
  event: WebhookEvent;
  payload: Record<string, any>;
  statusCode?: number;
  responseBody?: string;
  durationMs?: number;
  status: 'DELIVERED' | 'FAILED' | 'RETRYING';
  attempt: number;
  maxAttempts: number;
  createdAt: string;
}

export interface MarketplaceAppDocument {
  id: string;
  developerId: string;
  developerName: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  iconUrl: string;
  category: 'PRODUCTIVITY' | 'ANALYTICS' | 'COMMUNICATION' | 'ACCOUNTING' | 'AI_TOOLS';
  requestedScopes: ApiScope[];
  webhookEvents?: WebhookEvent[];
  installUrl?: string;
  status: 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | 'FEATURED';
  installsCount: number;
  rating: number;
  createdAt: string;
  updatedAt: string;
}

export interface AppInstallationDocument {
  id: string;
  appId: string;
  userId: string;
  organizationId?: string;
  installedAt: string;
  status: 'ACTIVE' | 'REVOKED';
}

// AI Agent Orchestrator & Task Permissions
export type AIAgentType =
  | 'PROJECT_AGENT'
  | 'FREELANCER_AGENT'
  | 'SELLER_AGENT'
  | 'MATCHING_AGENT'
  | 'SUPPORT_AGENT'
  | 'RISK_AGENT'
  | 'ADMIN_ASSISTANT';

export type AIRiskLevel = 'LOW_RISK' | 'MEDIUM_RISK' | 'HIGH_RISK' | 'CRITICAL';
export type AIApprovalStatus = 'NOT_REQUIRED' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';

export interface AIAgentTaskDocument {
  id: string;
  userId: string;
  userRole: UserRole;
  agentType: AIAgentType;
  actionName: string;
  riskLevel: AIRiskLevel;
  approvalStatus: AIApprovalStatus;
  allowedTools: string[];
  deniedTools: string[];
  inputPrompt: string;
  contextPayload?: Record<string, any>;
  outputResult?: string;
  structuredOutput?: Record<string, any>;
  approvedByUserId?: string;
  approvedAt?: string;
  rejectionReason?: string;
  executionStatus: 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'AWAITING_APPROVAL';
  durationMs?: number;
  createdAt: string;
  completedAt?: string;
}

// Skill Graph & Assessments
export interface SkillGraphNode {
  id: string;
  name: string;
  category: string;
  parentSkill?: string;
  relatedSkills: string[];
  demandScore: number; // 0-100
  averageHourlyRate: number;
}

export interface SkillAssessmentQuestion {
  id: string;
  question: string;
  codeSnippet?: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
}

export interface SkillAssessmentDocument {
  id: string;
  skillName: string;
  title: string;
  description: string;
  durationMinutes: number;
  passScorePercent: number;
  questionsCount: number;
  questions: SkillAssessmentQuestion[];
  badgeName: string;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
}

export interface UserAssessmentSubmissionDocument {
  id: string;
  userId: string;
  assessmentId: string;
  skillName: string;
  scorePercent: number;
  passed: boolean;
  awardedBadgeId?: string;
  completedAt: string;
}

// Platform Health, Incidents & Enterprise Reporting
export type IncidentSeverity = 'SEV_1_CRITICAL' | 'SEV_2_MAJOR' | 'SEV_3_MODERATE' | 'SEV_4_MINOR';
export type IncidentStatus = 'INVESTIGATING' | 'IDENTIFIED' | 'MONITORING' | 'RESOLVED';

export interface IncidentDocument {
  id: string;
  title: string;
  service: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  summary: string;
  impactDescription: string;
  startedAt: string;
  resolvedAt?: string;
  timeline: {
    timestamp: string;
    message: string;
    status: IncidentStatus;
  }[];
}

export interface MarketplaceHealthReport {
  overallHealthScore: number;
  timestamp: string;
  supplyDemandRatio: number;
  activeProjectsCount: number;
  availableFreelancersCount: number;
  medianTimeToHireHours: number;
  disputeRatePercent: number;
  liquidityAlerts: {
    category: string;
    status: 'SURPLUS' | 'SHORTAGE' | 'BALANCED';
    message: string;
    demandChangePercent: number;
    supplyChangePercent: number;
  }[];
}

export interface CustomReportConfigDocument {
  id: string;
  userId: string;
  organizationId?: string;
  name: string;
  type: 'FINANCIAL' | 'PROJECT_PERFORMANCE' | 'TEAM_UTILIZATION' | 'COMPLIANCE';
  filters: Record<string, any>;
  format: 'JSON' | 'CSV' | 'PDF';
  schedule?: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  lastGeneratedAt?: string;
  createdAt: string;
}







