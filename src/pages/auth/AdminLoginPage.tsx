import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Lock, Mail, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Alert } from '../../components/common/Alert';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { adminLogin, error, clearError, isLoading } = useAuth();
  const [email, setEmail] = useState('admin@worknova.internal');
  const [password, setPassword] = useState('AdminSecret2026!');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLocalError(null);
    try {
      await adminLogin(email, password);
      navigate('/admin/dashboard');
    } catch (err: unknown) {
      // error handled
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 sm:px-6 py-12 bg-slate-900/5">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-slate-900 text-white mb-2 shadow-xs">
            <Shield className="w-6 h-6 text-indigo-400" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            WorkNova Operations Portal
          </h1>
          <p className="text-xs text-slate-500">
            Internal Staff Administration & Dispute Resolution Console
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

        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-5 shadow-sm">
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <Input
              label="Staff Directory Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
              required
            />

            <Input
              label="Staff Security Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
              required
            />

            <Button
              type="submit"
              variant="secondary"
              size="md"
              className="w-full font-semibold"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Authenticate to Admin Console
            </Button>
          </form>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <Link to="/login" className="hover:text-slate-800 transition-colors">
              User Login
            </Link>
            <Link to="/" className="hover:text-slate-800 transition-colors">
              Marketplace Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
