import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Alert } from '../../components/common/Alert';

export const FreelancerLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, error, clearError, isLoading } = useAuth();
  const [email, setEmail] = useState('alex.morgan@worknova.io');
  const [password, setPassword] = useState('Password123!');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLocalError(null);
    try {
      // Passes expectedRole 'FREELANCER' to enforce role security
      await login(email, password, 'FREELANCER');
      navigate('/freelancer/dashboard');
    } catch (err: unknown) {
      // handled
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 sm:px-6 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-base shadow-2xs">
              W
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">WorkNova</span>
          </Link>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Freelancer Portal</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Sign in as Freelancer
          </h1>
          <p className="text-xs text-slate-500">
            Access your proposals, contracts, and milestone earnings.
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
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Freelancer Email"
              type="email"
              placeholder="alex@example.com"
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
                <input type="checkbox" defaultChecked className="rounded text-indigo-600" />
                <span>Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-indigo-600 font-medium">
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
              Sign In to Freelancer Workspace
            </Button>
          </form>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>New freelancer? <Link to="/freelancer/register" className="text-indigo-600 font-semibold">Join now</Link></span>
            <Link to="/seller/login" className="text-slate-500 hover:text-slate-800">Employer sign in →</Link>
          </div>
        </div>
      </div>
    </div>
  );
};
