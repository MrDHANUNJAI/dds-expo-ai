import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ArrowUpRight, LogOut, Settings, LayoutDashboard, User as UserIcon, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common/Button';
import { Avatar } from '../common/Avatar';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 12);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { label: 'Find Work', href: '/find-work' },
    { label: 'Find Freelancers', href: '/find-freelancers' },
    { label: 'Categories', href: '/categories' },
    { label: 'How It Works', href: '/how-it-works' },
  ];

  const isLinkActive = (href: string) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const dashboardRoute =
    user?.role === 'ADMIN'
      ? '/admin/dashboard'
      : user?.role === 'SELLER'
      ? '/seller/dashboard'
      : '/freelancer/dashboard';

  const settingsRoute =
    user?.role === 'SELLER'
      ? '/seller/settings'
      : '/freelancer/settings';

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-200 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs'
          : 'bg-white border-b border-slate-200'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Single text element Brand wordmark */}
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="flex items-center gap-2 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-2xs group-hover:bg-indigo-700 transition-colors">
                <span className="font-bold text-base tracking-tighter">W</span>
              </div>
              <span className="text-lg font-bold tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
                WorkNova
              </span>
            </Link>
          </div>

          {/* Zone 2: Clean text navigation links */}
          <nav className="hidden md:flex items-center gap-7">
            {navLinks.map((link) => {
              const active = isLinkActive(link.href);
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`text-xs font-semibold tracking-wide transition-colors whitespace-nowrap py-1 border-b-2 ${
                    active
                      ? 'text-indigo-600 border-indigo-600'
                      : 'text-slate-600 hover:text-slate-900 border-transparent'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Zone 3: Actions (Logged in vs Logged out) */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                <Link to={dashboardRoute}>
                  <Button variant="outline" size="sm" leftIcon={<LayoutDashboard className="w-3.5 h-3.5" />}>
                    Dashboard
                  </Button>
                </Link>

                {/* User avatar menu */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <Avatar name={`${user.firstName} ${user.lastName}`} src={user.profileImage} size="sm" isOnline />
                    <span className="text-xs font-bold text-slate-800 max-w-[100px] truncate">
                      {user.firstName}
                    </span>
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50">
                      <div className="px-3.5 py-2 border-b border-slate-100">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                        <span className="inline-block mt-1 text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700">
                          {user.role}
                        </span>
                      </div>

                      <Link
                        to={dashboardRoute}
                        className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        <LayoutDashboard className="w-4 h-4 text-slate-400" />
                        <span>Workspace Dashboard</span>
                      </Link>

                      {user.role !== 'ADMIN' && (
                        <Link
                          to={settingsRoute}
                          className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                        >
                          <Settings className="w-4 h-4 text-slate-400" />
                          <span>Account Settings</span>
                        </Link>
                      )}

                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full text-left flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-red-600 hover:bg-red-50 cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="font-semibold text-slate-700">
                    Log In
                  </Button>
                </Link>
                <Link to="/freelancer/register">
                  <Button variant="outline" size="sm">
                    Join as Freelancer
                  </Button>
                </Link>
                <Link to="/seller/register">
                  <Button variant="primary" size="sm">
                    Post a Project
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger trigger */}
          <div className="flex md:hidden items-center gap-2">
            {isAuthenticated ? (
              <Link to={dashboardRoute}>
                <Button variant="primary" size="sm" className="text-xs px-2.5 py-1">
                  Dashboard
                </Button>
              </Link>
            ) : (
              <Link to="/login">
                <Button variant="primary" size="sm" className="text-xs px-2.5 py-1">
                  Login
                </Button>
              </Link>
            )}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-4 shadow-lg">
          {isAuthenticated && user && (
            <div className="p-3 bg-slate-50 rounded-xl flex items-center gap-3 border border-slate-200">
              <Avatar name={`${user.firstName} ${user.lastName}`} src={user.profileImage} size="sm" isOnline />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 truncate">{user.firstName} {user.lastName}</p>
                <p className="text-[11px] text-slate-500 truncate">{user.email} · {user.role}</p>
              </div>
            </div>
          )}

          <nav className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`px-3 py-2 rounded-lg text-sm font-medium ${
                  isLinkActive(link.href)
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            {isAuthenticated ? (
              <>
                <Link to={dashboardRoute} className="w-full">
                  <Button variant="primary" size="md" className="w-full">
                    Go to {user?.role} Dashboard
                  </Button>
                </Link>
                {user?.role !== 'ADMIN' && (
                  <Link to={settingsRoute} className="w-full">
                    <Button variant="outline" size="md" className="w-full">
                      Account Settings
                    </Button>
                  </Link>
                )}
                <Button variant="outline" size="md" onClick={handleLogout} className="w-full text-red-600">
                  Log Out
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" className="w-full">
                  <Button variant="outline" size="md" className="w-full">
                    Log In
                  </Button>
                </Link>
                <Link to="/freelancer/register" className="w-full">
                  <Button variant="secondary" size="md" className="w-full">
                    Join as Freelancer
                  </Button>
                </Link>
                <Link to="/seller/register" className="w-full">
                  <Button variant="primary" size="md" className="w-full">
                    Post a Project
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
