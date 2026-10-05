import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Send, ArrowRight, ExternalLink } from 'lucide-react';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Alert } from '../../components/common/Alert';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [devResetLink, setDevResetLink] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please provide your registered account email.');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Failed to request reset link');
      }
      setSubmitted(true);
      if (json.data && json.data.devResetLink) {
        setDevResetLink(json.data.devResetLink);
      }
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || 'Failed to request password reset.');
    } finally {
      setIsLoading(false);
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
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Reset your password
          </h1>
          <p className="text-xs text-slate-500">
            Enter your email and we'll send a time-limited password recovery link.
          </p>
        </div>

        {error && <Alert type="error" message={error} onDismiss={() => setError('')} />}

        {submitted ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-5 text-center shadow-xs">
            <Alert
              type="success"
              title="Reset Link Dispatched"
              message={`If an account is associated with ${email}, password reset instructions have been generated.`}
            />

            {devResetLink && (
              <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-xl text-left space-y-2 text-xs">
                <p className="font-bold text-indigo-950 flex items-center gap-1.5">
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Development Reset Token</span>
                </p>
                <p className="text-indigo-900/80">
                  Click below to test the reset password flow directly:
                </p>
                <Link
                  to={devResetLink}
                  className="inline-flex items-center gap-1 text-xs font-bold text-indigo-700 bg-white border border-indigo-200 px-3 py-1.5 rounded-lg hover:bg-indigo-50"
                >
                  <span>Open Reset Password Form</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            )}

            <Link to="/login" className="block pt-2">
              <Button variant="outline" size="md" className="w-full" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                Back to Sign In
              </Button>
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-5 shadow-xs">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Registered Email Address"
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="w-4 h-4" />}
                required
              />

              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full font-semibold"
                isLoading={isLoading}
                rightIcon={<Send className="w-4 h-4" />}
              >
                Send Password Reset Link
              </Button>
            </form>

            <div className="pt-2 text-center text-xs">
              <Link to="/login" className="text-slate-600 hover:text-slate-900 inline-flex items-center gap-1 font-medium">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Login</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
