export const freelancerDashboardData = {
  stats: [
    { label: 'Available Projects', value: '1,420', change: '+12% this week', isPositive: true, helperText: 'Matching your skills' },
    { label: 'Active Projects', value: '3', change: 'On schedule', isPositive: true, helperText: '2 milestone reviews due' },
    { label: 'Total Earnings', value: '$48,320', change: '+$4,250 this month', isPositive: true, helperText: 'All-time gross volume' },
    { label: 'Pending Earnings', value: '$3,800', change: 'In escrow release', isPositive: true, helperText: 'Expected within 48h' },
  ],
  profileCompletion: 92,
  profileCompletionTasks: [
    { text: 'Add video introduction', completed: false, xp: '+5%' },
    { text: 'Verify identity credentials', completed: true, xp: '+10%' },
    { text: 'Add 3 portfolio case studies', completed: true, xp: '+25%' },
    { text: 'Take React proficiency assessment', completed: true, xp: '+10%' },
  ],
  recentProposals: [
    {
      id: 'prop-1',
      projectTitle: 'Build a Modern React & Node.js E-Commerce Platform',
      bidAmount: '$4,200',
      submittedDate: 'Oct 2, 2026',
      status: 'Shortlisted',
      clientName: 'Aura Collective Brands',
    },
    {
      id: 'prop-2',
      projectTitle: 'Enterprise B2B SaaS Design System & Figma Token Audit',
      bidAmount: '$85/hr',
      submittedDate: 'Sep 29, 2026',
      status: 'Accepted',
      clientName: 'LogixFlow Global',
    },
    {
      id: 'prop-3',
      projectTitle: 'RAG Knowledge Assistant & Semantic Search Integration',
      bidAmount: '$5,500',
      submittedDate: 'Sep 24, 2026',
      status: 'Under Review',
      clientName: 'Syntropy Systems',
    },
  ],
  activeProjects: [
    {
      id: 'act-1',
      title: 'Enterprise Fintech Dashboard Migration',
      client: 'LogixFlow Global',
      deadline: 'Oct 18, 2026',
      progress: 68,
      milestone: 'Phase 2: Component Integration',
      budget: '$6,800',
    },
    {
      id: 'act-2',
      title: 'Storefront Optimization & Web Vitals',
      client: 'Aura Collective Brands',
      deadline: 'Nov 02, 2026',
      progress: 35,
      milestone: 'Phase 1: Performance Audit',
      budget: '$3,200',
    },
  ],
};

export const sellerDashboardData = {
  stats: [
    { label: 'Active Projects', value: '4', change: '2 in development', isPositive: true, helperText: 'Milestones on track' },
    { label: 'Total Projects', value: '18', change: '14 successfully finished', isPositive: true, helperText: '98% completion rate' },
    { label: 'Total Spent', value: '$42,000', change: '+$5,800 this quarter', isPositive: true, helperText: 'Escrow backed guarantee' },
    { label: 'Pending Proposals', value: '14', change: '5 shortlisted', isPositive: true, helperText: 'New submissions today' },
  ],
  recentProjects: [
    {
      id: 'proj-1',
      title: 'Build a Modern React & Node.js E-Commerce Platform',
      budget: '$3,500 - $5,000',
      proposals: 14,
      status: 'Receiving Proposals',
      created: '2 hours ago',
    },
    {
      id: 'proj-5',
      title: 'Brand Identity, Logo Suite & Investor Pitch Deck',
      budget: '$2,000 - $3,200',
      proposals: 23,
      status: 'Reviewing Shortlist',
      created: '1 day ago',
    },
  ],
  recentProposals: [
    {
      freelancerName: 'Alex Morgan',
      projectTitle: 'Build a Modern React & Node.js E-Commerce Platform',
      bid: '$4,200',
      rating: 4.95,
      reviews: 142,
      applied: '1 hour ago',
    },
    {
      freelancerName: 'David O\'Connor',
      projectTitle: 'Multi-Region Terraform Infrastructure & CI/CD Pipeline',
      bid: '$90/hr',
      rating: 4.93,
      reviews: 88,
      applied: '4 hours ago',
    },
  ],
};

export const adminDashboardData = {
  stats: [
    { label: 'Total Users', value: '24,850', change: '+8.4% MoM', isPositive: true, helperText: 'Active platform members' },
    { label: 'Verified Freelancers', value: '14,320', change: '+6.1% MoM', isPositive: true, helperText: 'Vetted professionals' },
    { label: 'Active Sellers', value: '10,530', change: '+11.5% MoM', isPositive: true, helperText: 'Hiring organizations' },
    { label: 'Active Projects', value: '1,894', change: '+15.2% MoM', isPositive: true, helperText: 'Contracts in flight' },
    { label: 'Completed Projects', value: '9,410', change: '99.2% satisfaction', isPositive: true, helperText: 'Historical delivery' },
    { label: 'Platform Gross Volume', value: '$3.42M', change: '+24.6% YoY', isPositive: true, helperText: 'Trailing 12 months' },
    { label: 'Pending Disputes', value: '3', change: '-2 from last week', isPositive: true, helperText: '0.03% dispute rate' },
  ],
  growthTrends: [
    { month: 'May', users: 18200, projects: 1210, volume: 220 },
    { month: 'Jun', users: 19500, projects: 1340, volume: 250 },
    { month: 'Jul', users: 21100, projects: 1490, volume: 280 },
    { month: 'Aug', users: 22600, projects: 1620, volume: 305 },
    { month: 'Sep', users: 23800, projects: 1770, volume: 325 },
    { month: 'Oct', users: 24850, projects: 1894, volume: 342 },
  ],
  auditLogs: [
    { id: 'log-1', action: 'Freelancer Vetting Approved', target: 'Alex Morgan (Full Stack)', actor: 'Staff Admin #4', time: '14 mins ago', status: 'Completed' },
    { id: 'log-2', action: 'Escrow Milestone Released', target: 'Project #proj-1 ($1,750)', actor: 'Automated System', time: '42 mins ago', status: 'Completed' },
    { id: 'log-3', action: 'KYC Document Verified', target: 'Elena Rostova', actor: 'Compliance Officer', time: '1 hour ago', status: 'Completed' },
    { id: 'log-4', action: 'New Seller Organization Registered', target: 'Aura Collective Brands', actor: 'Sarah Jenkins', time: '3 hours ago', status: 'Verified' },
    { id: 'log-5', action: 'Support Dispute Mediation Resolved', target: 'Ticket #DSP-891', actor: 'Lead Mediator', time: '5 hours ago', status: 'Resolved' },
  ],
};
