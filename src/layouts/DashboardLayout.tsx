import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Search,
  FileText,
  Briefcase,
  CheckCircle,
  MessageSquare,
  DollarSign,
  FolderKanban,
  Star,
  User,
  Settings,
  PlusCircle,
  Users,
  CreditCard,
  Layers,
  AlertTriangle,
  FileCheck,
  Shield,
  Menu,
  X,
  Bell,
  ArrowLeft,
  ChevronRight,
  LogOut,
  Building2,
  Crown,
  Gift,
  Bot,
  Code,
  Award,
  Activity,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Avatar } from '../components/common/Avatar';
import { Button } from '../components/common/Button';
import { UserRole } from '../types/auth';
import { CurrencyLanguageSwitcher } from '../components/common/CurrencyLanguageSwitcher';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

export interface DashboardLayoutProps {
  role: 'freelancer' | 'seller' | 'admin';
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ role, children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const freelancerNav: NavItem[] = [
    { label: 'Dashboard', href: '/freelancer/dashboard', icon: LayoutDashboard },
    { label: 'Find Projects', href: '/find-work', icon: Search },
    { label: 'My Proposals', href: '/freelancer/dashboard?tab=proposals', icon: FileText },
    { label: 'Contracts & Workspace', href: '/freelancer/dashboard?tab=contracts', icon: Briefcase },
    { label: 'AI Agent Assistant', href: '/freelancer/dashboard?tab=ai-agents', icon: Bot },
    { label: 'Skill Tests & Badges', href: '/freelancer/dashboard?tab=skills', icon: Award },
    { label: 'Developer & API', href: '/freelancer/dashboard?tab=developer', icon: Code },
    { label: 'Teams & Agencies', href: '/freelancer/dashboard?tab=teams', icon: Building2 },
    { label: 'Plans & Membership', href: '/freelancer/dashboard?tab=membership', icon: Crown },
    { label: 'Refer & Earn $25', href: '/freelancer/dashboard?tab=rewards', icon: Gift },
    { label: 'Messages', href: '/freelancer/dashboard?tab=messages', icon: MessageSquare },
    { label: 'Wallet & Earnings', href: '/freelancer/dashboard?tab=earnings', icon: DollarSign },
    { label: 'Trust & Reputation', href: '/freelancer/dashboard?tab=trust', icon: Shield },
    { label: 'Settings', href: '/freelancer/settings', icon: Settings },
  ];

  const sellerNav: NavItem[] = [
    { label: 'Dashboard', href: '/seller/dashboard', icon: LayoutDashboard },
    { label: 'My Projects', href: '/seller/dashboard?tab=projects', icon: Briefcase },
    { label: 'Find Freelancers', href: '/find-freelancers', icon: Users },
    { label: 'Review Proposals', href: '/seller/dashboard?tab=proposals', icon: FileText },
    { label: 'AI Agents & Screener', href: '/seller/dashboard?tab=ai-agents', icon: Bot },
    { label: 'Contracts & Escrow', href: '/seller/dashboard?tab=contracts', icon: CreditCard },
    { label: 'Developer & Webhooks', href: '/seller/dashboard?tab=developer', icon: Code },
    { label: 'Governance & Health', href: '/seller/dashboard?tab=governance', icon: Activity },
    { label: 'Organization & Teams', href: '/seller/dashboard?tab=teams', icon: Building2 },
    { label: 'Plans & Subscriptions', href: '/seller/dashboard?tab=membership', icon: Crown },
    { label: 'Referral Rewards', href: '/seller/dashboard?tab=rewards', icon: Gift },
    { label: 'Messages', href: '/seller/dashboard?tab=messages', icon: MessageSquare },
    { label: 'Financial Records', href: '/seller/dashboard?tab=finance', icon: DollarSign },
    { label: 'Business Verification', href: '/seller/dashboard?tab=verification', icon: Shield },
    { label: 'Settings', href: '/seller/settings', icon: Settings },
  ];

  const adminNav: NavItem[] = [
    { label: 'Overview', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'AI Orchestrator', href: '/admin/dashboard?tab=ai-agents', icon: Bot },
    { label: 'Developer Ecosystem', href: '/admin/dashboard?tab=developer', icon: Code },
    { label: 'Platform Health & Incidents', href: '/admin/dashboard?tab=governance', icon: Activity },
    { label: 'Users & Trust', href: '/admin/dashboard?tab=users', icon: Users },
    { label: 'Projects & Proposals', href: '/admin/dashboard?tab=projects', icon: FolderKanban },
    { label: 'Disputes & Arbitration', href: '/admin/dashboard?tab=disputes', icon: AlertTriangle },
    { label: 'Finance & Treasury', href: '/admin/dashboard?tab=finance', icon: CreditCard },
    { label: 'Support Desk', href: '/admin/dashboard?tab=support', icon: FileCheck },
    { label: 'System & Flags', href: '/admin/dashboard?tab=system', icon: Shield },
    { label: 'Categories', href: '/categories', icon: Layers },
  ];

  const currentNav = role === 'admin' ? adminNav : role === 'seller' ? sellerNav : freelancerNav;

  const displayName = user ? `${user.firstName} ${user.lastName}` : 'WorkNova User';
  const displayEmail = user?.email || 'user@worknova.io';
  const roleBadge = user?.role || role.toUpperCase();

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand */}
        <div className="h-16 px-5 border-b border-slate-800 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
              W
            </div>
            <span className="font-bold text-white text-base tracking-tight">WorkNova</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Real User Card */}
        <div className="p-4 border-b border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <Avatar name={displayName} src={user?.profileImage} size="sm" isOnline />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate">{displayName}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-indigo-400 bg-indigo-950/80 px-1.5 py-0.2 rounded border border-indigo-800/50">
                  {roleBadge}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {currentNav.map((item) => {
            const currentUrl = location.pathname + location.search;
            const isMatch = currentUrl === item.href || (location.pathname === item.href && !location.search && !item.href.includes('?'));
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors group ${
                  isMatch
                    ? 'bg-indigo-600 text-white font-semibold shadow-2xs'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className={`w-4 h-4 shrink-0 ${isMatch ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full tabular-nums ${
                      isMatch ? 'bg-indigo-800 text-white' : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer shortcuts */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60 space-y-1">
          <Link
            to="/"
            className="flex items-center gap-2 px-3 py-2 text-xs text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Marketplace</span>
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:text-red-300 rounded-lg hover:bg-red-950/30 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="capitalize font-semibold text-slate-800">{role} Workspace</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              <span className="text-slate-500">Overview</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <CurrencyLanguageSwitcher />

            <span className="text-xs text-slate-600 font-medium hidden sm:inline">
              Signed in as <strong>{displayName}</strong>
            </span>

            <button
              type="button"
              onClick={handleLogout}
              className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Viewport Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
