import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Building, Phone, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Alert } from '../../components/common/Alert';
import { AccountType } from '../../types/auth';

export const SellerRegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { registerSeller, error, clearError, isLoading } = useAuth();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [accountType, setAccountType] = useState<AccountType>('COMPANY');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!firstName.trim()) errs.firstName = 'First name is required';
    if (!lastName.trim()) errs.lastName = 'Last name is required';
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = 'Valid work email is required';
    }
    if (!phone.trim() || phone.trim().length < 7) {
      errs.phone = 'Valid phone number is required';
    }
    if (!password || password.length < 8) {
      errs.password = 'Password must be at least 8 characters';
    } else if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
      errs.password = 'Password must contain both letters and numbers';
    }
    if (password !== confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }
    if (!agreeTerms) {
      errs.terms = 'You must agree to the Terms of Service';
    }
    setValidationErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    if (!validate()) return;

    try {
      await registerSeller({
        firstName,
        lastName,
        businessName: businessName || `${firstName}'s Team`,
        email,
        phone,
        password,
        confirmPassword,
        accountType,
        termsAccepted: agreeTerms,
      });

      // Redirect to seller onboarding per Section 12
      navigate('/seller/onboarding');
    } catch (err) {
      // Error handled by AuthContext
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
            Sign up to hire top talent
          </h1>
          <p className="text-xs text-slate-500">
            Create your employer account and post your first project in minutes.
          </p>
        </div>

        {error && <Alert type="error" message={error} onDismiss={clearError} />}

        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-5 shadow-xs">
          {/* Account Type Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 block">Account Classification</label>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { type: 'INDIVIDUAL', label: 'Individual Client' },
                { type: 'STARTUP', label: 'Funded Startup' },
                { type: 'BUSINESS', label: 'Growing Business' },
                { type: 'COMPANY', label: 'Enterprise / Corp' },
              ].map((item) => (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => setAccountType(item.type as AccountType)}
                  className={`py-2 px-2.5 text-xs font-medium rounded-lg border text-center transition-colors cursor-pointer ${
                    accountType === item.type
                      ? 'border-indigo-600 bg-indigo-50/70 text-indigo-700 font-bold'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="First Name"
                placeholder="e.g. Sarah"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                error={validationErrors.firstName}
                leftIcon={<User className="w-4 h-4" />}
                required
              />
              <Input
                label="Last Name"
                placeholder="e.g. Jenkins"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                error={validationErrors.lastName}
                required
              />
            </div>

            <Input
              label="Company or Business Name"
              placeholder="e.g. Aura Collective Brands"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              leftIcon={<Building className="w-4 h-4" />}
            />

            <Input
              label="Work Email Address"
              type="email"
              placeholder="sarah@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={validationErrors.email}
              leftIcon={<Mail className="w-4 h-4" />}
              required
            />

            <Input
              label="Phone Number"
              type="tel"
              placeholder="+1 (555) 000-0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              error={validationErrors.phone}
              leftIcon={<Phone className="w-4 h-4" />}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="At least 8 chars with letters & numbers"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={validationErrors.password}
              leftIcon={<Lock className="w-4 h-4" />}
              required
            />

            <Input
              label="Confirm Password"
              type="password"
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={validationErrors.confirmPassword}
              leftIcon={<Lock className="w-4 h-4" />}
              required
            />

            <div className="pt-1">
              <label className="flex items-start gap-2 text-xs text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 mt-0.5"
                />
                <span>
                  Yes, I understand and agree to the WorkNova Terms of Service and Escrow Rules.
                </span>
              </label>
              {validationErrors.terms && (
                <p className="mt-1 text-xs text-red-600 font-medium">{validationErrors.terms}</p>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full font-semibold"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Create Client Account
            </Button>
          </form>

          <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-600 font-semibold hover:text-indigo-800">
              Log in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
