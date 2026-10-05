import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, ArrowRight, ShieldCheck, Info } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Alert } from '../../components/common/Alert';
import { UserRole } from '../../types/auth';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, error, clearError, isLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('FREELANCER');
  const [localError, setLocalError] = useState<string | null>(null);

  const from = (location.state as any)?.from?.pathname;

  const handleRoleTabChange = (role: UserRole) => {
    setSelectedRole(role);
    clearError();
    setLocalError(null);
  };

  const handleFillDemo = (demoEmail: string, demoPass: string, role: UserRole) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setSelectedRole(role);
    clearError();
    setLocalError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLocalError(null);

    if (!email.trim()) {
      setLocalError('Please enter your account email.');
      return;
    }
    if (!password) {
      setLocalError('Please enter your password.');
      return;
    }

    try {
      const user = await login(email, password, selectedRole);

      // Redirect based on role or original destination
      if (from) {
        navigate(from, { replace: true });
      } else if (user.role === 'ADMIN') {
        navigate('/admin/dashboard', { replace: true });
      } else if (user.role === 'SELLER') {
        navigate('/seller/dashboard', { replace: true });
      } else {
        navigate('/freelancer/dashboard', { replace: true });
      }
    } catch (err: unknown) {
      // Error is set in AuthContext and displayed below
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 sm:px-6 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-base shadow-2xs">
              W
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">WorkNova</span>
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Sign in to WorkNova
          </h1>
          <p className="text-xs text-slate-500">
            Select your account portal and enter your credentials.
          </p>
        </div>

        {(error || localError) && (
          <Alert
            type="error"
            message={error || localError || ''}
            onDismiss={() => {
              clearError();
              setLocalError(null);
            }}
          />
        )}

        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-5 shadow-xs">
          {/* Role Segmented Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 block">Workspace Portal</label>
            <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-lg">
              {(['FREELANCER', 'SELLER', 'ADMIN'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => handleRoleTabChange(r)}
                  className={`py-1.5 text-xs font-medium rounded-md capitalize transition-colors cursor-pointer ${
                    selectedRole === r
                      ? 'bg-white text-indigo-700 font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {r.toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
              required
            />

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded text-indigo-600 focus:ring-indigo-500" />
                <span>Keep me signed in</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-indigo-600 hover:text-indigo-800 font-medium"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full font-semibold"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In to {selectedRole.charAt(0) + selectedRole.slice(1).toLowerCase()} Portal
            </Button>
          </form>

          {selectedRole !== 'ADMIN' && (
            <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
              New to WorkNova?{' '}
              <Link
                to={selectedRole === 'SELLER' ? '/seller/register' : '/freelancer/register'}
                className="text-indigo-600 font-semibold hover:text-indigo-800"
              >
                Create a {selectedRole.toLowerCase()} account
              </Link>
            </div>
          )}
        </div>

        {/* Demo Fast Fill Pill Buttons */}
        <div className="p-4 bg-slate-100/80 rounded-xl border border-slate-200 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <Info className="w-3.5 h-3.5 text-indigo-600" />
            <span>Development Quick-Login</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
            <button
              type="button"
              onClick={() => handleFillDemo('alex.morgan@worknova.io', 'Password123!', 'FREELANCER')}
              className="px-2.5 py-1.5 text-left bg-white hover:bg-indigo-50 border border-slate-200 rounded-lg text-xs transition-colors cursor-pointer"
            >
              <p className="font-semibold text-slate-900">Freelancer</p>
              <p className="text-[10px] text-slate-500">Alex Morgan</p>
            </button>
            <button
              type="button"
              onClick={() => handleFillDemo('sarah.jenkins@aurabrands.com', 'Password123!', 'SELLER')}
              className="px-2.5 py-1.5 text-left bg-white hover:bg-indigo-50 border border-slate-200 rounded-lg text-xs transition-colors cursor-pointer"
            >
              <p className="font-semibold text-slate-900">Seller</p>
              <p className="text-[10px] text-slate-500">Sarah Jenkins</p>
            </button>
            <button
              type="button"
              onClick={() => handleFillDemo('admin@worknova.internal', 'AdminSecret2026!', 'ADMIN')}
              className="px-2.5 py-1.5 text-left bg-white hover:bg-indigo-50 border border-slate-200 rounded-lg text-xs transition-colors cursor-pointer"
            >
              <p className="font-semibold text-slate-900">Super Admin</p>
              <p className="text-[10px] text-slate-500">Staff Portal</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
