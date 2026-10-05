export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'freelancer' | 'seller' | 'admin';
  createdAt: string;
}

export interface Freelancer {
  id: string;
  name: string;
  title: string;
  bio: string;
  avatar: string;
  rating: number;
  reviewCount: number;
  hourlyRate: number;
  completedProjects: number;
  successRate: number; // percentage
  location: string;
  timezone: string;
  isVerified: boolean;
  isTopRated: boolean;
  skills: string[];
  category: string;
  availability: 'Available Now' | 'Part-time' | 'Busy';
  languages: { language: string; proficiency: string }[];
  education: { degree: string; institution: string; year: string }[];
  certifications: { title: string; issuer: string; year: string }[];
  portfolio: {
    id: string;
    title: string;
    description: string;
    category: string;
    skills: string[];
    link?: string;
  }[];
  memberSince: string;
}

export interface Seller {
  id: string;
  name: string;
  company: string;
  title: string;
  bio: string;
  avatar: string;
  location: string;
  memberSince: string;
  projectsPosted: number;
  projectsCompleted: number;
  totalSpent: number;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  industry: string;
}

export type ProjectStatus =
  | 'DRAFT'
  | 'PUBLISHED'
  | 'UNDER_REVIEW'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'ARCHIVED'
  | 'Open';

export interface Project {
  id: string;
  slug?: string;
  title: string;
  description: string;
  category: string;
  categoryId?: string;
  categoryName?: string;
  subcategory?: string;
  subcategoryId?: string;
  subcategoryName?: string;
  budgetType: 'fixed' | 'hourly';
  budgetMin: number;
  budgetMax: number;
  fixedAmount?: number;
  experienceLevel: 'Entry' | 'Intermediate' | 'Expert';
  scope?: 'Small' | 'Medium' | 'Large';
  deadline: string;
  duration?: string;
  postedTime?: string;
  skills: string[];
  proposalCount: number;
  sellerId: string;
  sellerName: string;
  sellerCompany: string;
  sellerLocation?: string;
  sellerRating?: number;
  sellerSpent?: number;
  isVerifiedClient?: boolean;
  status: ProjectStatus;
  isRemote?: boolean;
  deliverables?: string[];
  attachments?: string[];
  attachmentsCount?: number;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  iconName?: string;
  icon?: string;
  projectCount: number;
  freelancerCount?: number;
  subcategories: (string | { id: string; name: string; slug: string })[];
}

export interface Review {
  id: string;
  authorName: string;
  authorCompany?: string;
  authorAvatar?: string;
  rating: number;
  date: string;
  comment: string;
  projectTitle: string;
  role: 'client' | 'freelancer';
}

export type ProposalStatus =
  | 'SUBMITTED'
  | 'SHORTLISTED'
  | 'REJECTED'
  | 'ACCEPTED'
  | 'WITHDRAWN'
  | 'Under Review'
  | 'Declined';

export interface ProposalMilestone {
  description: string;
  amount: number;
  durationDays: number;
}

export interface Proposal {
  id: string;
  projectId: string;
  projectTitle?: string;
  freelancerId: string;
  freelancerUserId?: string;
  freelancerName: string;
  freelancerTitle?: string;
  freelancerAvatar?: string;
  freelancerHourlyRate?: number;
  freelancerRating?: number;
  bidAmount: number;
  estimatedDays?: number;
  deliveryTime?: string;
  submittedDate?: string;
  createdAt?: string;
  updatedAt?: string;
  status: ProposalStatus;
  coverLetter: string;
  clientNotes?: string;
  milestones?: ProposalMilestone[];
  attachments?: string[];
  project?: Partial<Project> | null;
  freelancer?: {
    id: string;
    name: string;
    title: string;
    avatar?: string;
    skills: string[];
    experienceLevel: string;
    hourlyRate?: number;
    rating: number;
    location: string;
    completedProjects: number;
  };
}


export interface DashboardStat {
  label: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  helperText?: string;
}

// ==========================================
// PHASE 4 & 5: CONTRACTS, MILESTONES & FINANCE
// ==========================================
export type ContractStatus = 'PENDING_FUNDING' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED' | 'DISPUTED';
export type MilestoneWorkflowStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'SUBMITTED' | 'REVISION_REQUESTED' | 'APPROVED' | 'CANCELLED';
export type MilestonePaymentStatus = 'UNFUNDED' | 'HELD_IN_ESCROW' | 'FUNDED' | 'RELEASED' | 'REFUNDED';

export interface MilestoneItem {
  id: string;
  contractId: string;
  title: string;
  description: string;
  amount: number;
  currency: string;
  dueDate: string;
  workflowStatus: MilestoneWorkflowStatus;
  paymentStatus: MilestonePaymentStatus;
  fundedAt?: string;
  releasedAt?: string;
  order: number;
}

export interface ContractItem {
  id: string;
  projectId: string;
  projectTitle: string;
  proposalId: string;
  sellerId: string;
  sellerName?: string;
  sellerCompany?: string;
  sellerAvatar?: string;
  freelancerId: string;
  freelancerName?: string;
  freelancerAvatar?: string;
  status: ContractStatus;
  totalBudget: number;
  currency: string;
  milestones: MilestoneItem[];
  deliverables?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface WalletData {
  id: string;
  userId: string;
  currency: string;
  availableBalance: number;
  pendingBalance: number;
  totalEarned: number;
  totalWithdrawn: number;
}

export interface LedgerEntry {
  id: string;
  walletId: string;
  type: string;
  direction: 'CREDIT' | 'DEBIT';
  amount: number;
  currency: string;
  description: string;
  createdAt: string;
}

export interface WithdrawalRecord {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  method: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'REJECTED';
  destinationAccount: string;
  createdAt: string;
}

export interface InvoiceRecord {
  id: string;
  invoiceNumber: string;
  sellerName: string;
  freelancerName: string;
  projectTitle: string;
  subtotal: number;
  platformFee: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  status: string;
  issuedAt: string;
  paidAt?: string;
}

// ==========================================
// PHASE 6: MESSAGING, NOTIFICATIONS & TRUST
// ==========================================
export type ConversationStatus = 'ACTIVE' | 'ARCHIVED' | 'BLOCKED' | 'CLOSED';
export type MessageType = 'TEXT' | 'FILE' | 'IMAGE' | 'SYSTEM' | 'DELIVERY' | 'PAYMENT_ALERT';

export interface MessageAttachmentItem {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
}

export interface MessageItem {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  type: MessageType;
  content: string;
  attachments?: MessageAttachmentItem[];
  status: 'SENT' | 'DELIVERED' | 'READ';
  readBy?: { userId: string; readAt: string }[];
  isFlagged?: boolean;
  createdAt: string;
}

export interface ConversationItem {
  id: string;
  projectId: string;
  projectTitle?: string;
  contractId?: string;
  sellerId: string;
  freelancerId: string;
  otherUser: {
    id: string;
    name: string;
    role: string;
    avatarUrl?: string;
    companyName?: string;
  };
  lastMessage?: {
    content: string;
    senderId: string;
    senderName: string;
    createdAt: string;
  };
  unreadCount?: number;
  status: ConversationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface ReviewItem {
  id: string;
  projectId: string;
  contractId: string;
  reviewerId: string;
  reviewerName: string;
  reviewerRole: string;
  reviewerAvatar?: string;
  targetUserId: string;
  overallRating: number;
  skillsRating?: number;
  communicationRating?: number;
  adherenceRating?: number;
  qualityRating?: number;
  feedback: string;
  createdAt: string;
}

export interface DisputeItem {
  id: string;
  projectId: string;
  contractId: string;
  milestoneId?: string;
  openedBy: string;
  openedByName?: string;
  respondentId: string;
  reason: string;
  description: string;
  disputedAmount: number;
  currency: string;
  status: 'OPEN' | 'UNDER_REVIEW' | 'EVIDENCE_COLLECTION' | 'RESOLVED' | 'CLOSED';
  resolution?: string;
  createdAt: string;
}

export interface SupportTicketItem {
  id: string;
  userId: string;
  ticketNumber: string;
  category: string;
  subject: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'WAITING_ON_USER' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  messages: {
    id: string;
    senderId: string;
    senderName: string;
    senderRole: string;
    message: string;
    createdAt: string;
  }[];
  createdAt: string;
}

// ==========================================
// PHASE 7: VERIFICATION, SECURITY & DISCOVERY
// ==========================================
export type VerificationType = 'EMAIL' | 'PHONE' | 'IDENTITY' | 'BUSINESS' | 'PAYMENT' | 'PROFILE';
export type VerificationStatus = 'NOT_STARTED' | 'PENDING' | 'VERIFIED' | 'FAILED' | 'EXPIRED' | 'REQUIRES_REVIEW' | 'REJECTED';

export interface VerificationItem {
  id: string;
  userId: string;
  type: VerificationType;
  status: VerificationStatus;
  submittedAt?: string;
  verifiedAt?: string;
  failureReason?: string;
}

export interface SessionItem {
  id: string;
  browser: string;
  os: string;
  device: string;
  ip: string;
  location: string;
  lastActiveAt: string;
  createdAt: string;
  isCurrent: boolean;
}

export interface SecurityActivityItem {
  id: string;
  action: string;
  details?: Record<string, any>;
  ipAddress?: string;
  timestamp: string;
}

