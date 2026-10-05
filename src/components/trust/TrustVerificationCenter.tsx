import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Smartphone,
  Mail,
  FileText,
  Building2,
  Lock,
  Globe,
  Trash2,
  RefreshCw,
  Clock,
  Shield,
  Award,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { trustSecurityApi } from '../../services/trustSecurityApi';
import { VerificationItem, SessionItem, SecurityActivityItem } from '../../types';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Alert } from '../common/Alert';

export const TrustVerificationCenter: React.FC = () => {
  const { user } = useAuth();

  const [verifications, setVerifications] = useState<VerificationItem[]>([]);
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [activities, setActivities] = useState<SecurityActivityItem[]>([]);
  const [completeness, setCompleteness] = useState<{ score: number; missingFields: string[]; isVerified: boolean }>({
    score: 65,
    missingFields: [],
    isVerified: false,
  });

  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Email verification state
  const [emailCode, setEmailCode] = useState('');
  const [requestingEmail, setRequestingEmail] = useState(false);
  const [verifyingEmail, setVerifyingEmail] = useState(false);

  // Phone verification state
  const [phoneInput, setPhoneInput] = useState('+91 98765 43210');
  const [phoneOTP, setPhoneOTP] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOTP, setSendingOTP] = useState(false);
  const [verifyingOTP, setVerifyingOTP] = useState(false);

  // Identity verification state
  const [idDocType, setIdDocType] = useState('Aadhaar / National ID');
  const [idDocNumber, setIdDocNumber] = useState('XXXX-XXXX-4921');
  const [submittingID, setSubmittingID] = useState(false);

  // Business verification state
  const [businessName, setBusinessName] = useState('Aura Dynamics Pvt Ltd');
  const [businessReg, setBusinessReg] = useState('U72200KA2023PTC123456');
  const [businessTaxId, setBusinessTaxId] = useState('29AABCU9603R1ZM');
  const [submittingBusiness, setSubmittingBusiness] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [verifRes, sessList, actList, compData] = await Promise.all([
        trustSecurityApi.getMyVerifications(),
        trustSecurityApi.getActiveSessions(),
        trustSecurityApi.getSecurityActivity(),
        trustSecurityApi.getProfileCompleteness(),
      ]);

      setVerifications(verifRes.verifications);
      setSessions(sessList);
      setActivities(actList);
      setCompleteness(compData);
    } catch (err: any) {
      console.warn('Failed to load trust & security center data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRequestEmailCode = async () => {
    try {
      setRequestingEmail(true);
      setErrorMessage(null);
      const res = await trustSecurityApi.requestEmailVerification();
      setStatusMessage(res.message || 'Verification token sent! Check your inbox or copy from simulation alert.');
      if (res.debugToken) setEmailCode(res.debugToken);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to request code');
    } finally {
      setRequestingEmail(false);
    }
  };

  const handleVerifyEmail = async () => {
    if (!emailCode.trim()) return;
    try {
      setVerifyingEmail(true);
      setErrorMessage(null);
      await trustSecurityApi.verifyEmail(emailCode.trim());
      setStatusMessage('Email verified successfully! Your account badge has updated.');
      loadData();
    } catch (err: any) {
      setErrorMessage(err.message || 'Email verification failed');
    } finally {
      setVerifyingEmail(false);
    }
  };

  const handleSendPhoneOTP = async () => {
    try {
      setSendingOTP(true);
      setErrorMessage(null);
      const res = await trustSecurityApi.sendPhoneOTP(phoneInput);
      setOtpSent(true);
      setStatusMessage(res.message || 'OTP sent! Test OTP: ' + (res.otp || '123456'));
      if (res.otp) setPhoneOTP(res.otp);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to send OTP');
    } finally {
      setSendingOTP(false);
    }
  };

  const handleVerifyPhoneOTP = async () => {
    if (!phoneOTP.trim()) return;
    try {
      setVerifyingOTP(true);
      setErrorMessage(null);
      await trustSecurityApi.verifyPhoneOTP(phoneOTP.trim());
      setStatusMessage('Phone verified! Two-factor recovery is now active.');
      loadData();
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid OTP');
    } finally {
      setVerifyingOTP(false);
    }
  };

  const handleSubmitIdentity = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmittingID(true);
      setErrorMessage(null);
      await trustSecurityApi.submitIdentityVerification({
        documentType: idDocType,
        documentNumber: idDocNumber,
      });
      setStatusMessage('Identity credentials verified! Your Verified Specialist badge is active.');
      loadData();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit identity');
    } finally {
      setSubmittingID(false);
    }
  };

  const handleSubmitBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmittingBusiness(true);
      setErrorMessage(null);
      await trustSecurityApi.submitBusinessVerification({
        businessName,
        registrationNumber: businessReg,
        taxId: businessTaxId,
      });
      setStatusMessage('Enterprise Business Registration verified! Verified Buyer badge issued.');
      loadData();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit business registration');
    } finally {
      setSubmittingBusiness(false);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    try {
      await trustSecurityApi.revokeSession(sessionId);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      setStatusMessage('Session revoked.');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to revoke session');
    }
  };

  const handleRevokeOtherSessions = async () => {
    try {
      await trustSecurityApi.revokeOtherSessions();
      setSessions((prev) => prev.filter((s) => s.isCurrent));
      setStatusMessage('All other active sessions have been terminated.');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to revoke sessions');
    }
  };

  const getVerifStatus = (type: string): string => {
    const v = verifications.find((item) => item.type === type);
    return v ? v.status : 'NOT_STARTED';
  };

  return (
    <div className="space-y-6">
      {statusMessage && (
        <Alert variant="success" onClose={() => setStatusMessage(null)}>
          {statusMessage}
        </Alert>
      )}

      {errorMessage && (
        <Alert variant="error" onClose={() => setErrorMessage(null)}>
          {errorMessage}
        </Alert>
      )}

      {/* Trust Score Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-xl p-6 shadow-sm border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-8 h-8 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight">Trust & Verification Center</h2>
                {completeness.isVerified && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    VERIFIED TIER 1
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Verified members receive priority placement in marketplace search results and higher client trust.
              </p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 flex items-center gap-4 min-w-[200px]">
            <div className="relative flex items-center justify-center">
              <svg className="w-14 h-14 transform -rotate-90">
                <circle cx="28" cy="28" r="22" stroke="currentColor" strokeWidth="4" className="text-slate-700" fill="transparent" />
                <circle
                  cx="28"
                  cy="28"
                  r="22"
                  stroke="currentColor"
                  strokeWidth="4"
                  className="text-indigo-400 transition-all duration-500"
                  fill="transparent"
                  strokeDasharray="138.2"
                  strokeDashoffset={138.2 - (138.2 * completeness.score) / 100}
                />
              </svg>
              <span className="absolute text-xs font-bold text-white">{completeness.score}%</span>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-200">Trust Score</p>
              <p className="text-[11px] text-indigo-300 font-medium">
                {completeness.score >= 80 ? 'Elite Standing' : 'Standard Tier'}
              </p>
            </div>
          </div>
        </div>

        {completeness.missingFields.length > 0 && (
          <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-indigo-300 font-semibold">Recommended next steps:</span>
            {completeness.missingFields.map((item, idx) => (
              <span key={idx} className="bg-white/5 border border-white/10 px-2 py-0.5 rounded-md text-slate-300 text-[11px]">
                • {item}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Verification Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Email Verification */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 text-xs">Email Authentication</h3>
                <p className="text-[11px] text-slate-500">{user?.email}</p>
              </div>
            </div>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                getVerifStatus('EMAIL') === 'VERIFIED'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
            >
              {getVerifStatus('EMAIL')}
            </span>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
            <input
              type="text"
              placeholder="Enter 6-digit verification code"
              value={emailCode}
              onChange={(e) => setEmailCode(e.target.value)}
              className="flex-1 text-xs py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            />
            {getVerifStatus('EMAIL') !== 'VERIFIED' ? (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleRequestEmailCode}
                  disabled={requestingEmail}
                >
                  {requestingEmail ? 'Sending...' : 'Get Code'}
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleVerifyEmail}
                  disabled={verifyingEmail || !emailCode}
                >
                  Verify
                </Button>
              </>
            ) : (
              <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Confirmed
              </span>
            )}
          </div>
        </div>

        {/* Phone Verification */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 text-xs">Phone & 2FA OTP</h3>
                <p className="text-[11px] text-slate-500">Fast 6-digit SMS authentication</p>
              </div>
            </div>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                getVerifStatus('PHONE') === 'VERIFIED'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
            >
              {getVerifStatus('PHONE')}
            </span>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
            {!otpSent ? (
              <>
                <input
                  type="text"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  className="flex-1 text-xs py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
                />
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSendPhoneOTP}
                  disabled={sendingOTP}
                >
                  Send OTP
                </Button>
              </>
            ) : (
              <>
                <input
                  type="text"
                  placeholder="Enter OTP"
                  value={phoneOTP}
                  onChange={(e) => setPhoneOTP(e.target.value)}
                  className="flex-1 text-xs py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
                />
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleVerifyPhoneOTP}
                  disabled={verifyingOTP}
                >
                  Confirm OTP
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Identity Verification (Freelancer & Seller) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 text-xs">Official Identity Verification</h3>
                <p className="text-[11px] text-slate-500">
                  Government photo ID verification (Aadhaar, Passport, Driver's License)
                </p>
              </div>
            </div>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                getVerifStatus('IDENTITY') === 'VERIFIED'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {getVerifStatus('IDENTITY')}
            </span>
          </div>

          <form onSubmit={handleSubmitIdentity} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <select
              value={idDocType}
              onChange={(e) => setIdDocType(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-hidden"
            >
              <option>Aadhaar / National ID</option>
              <option>Passport</option>
              <option>Driving License</option>
              <option>PAN Card</option>
            </select>
            <input
              type="text"
              placeholder="Document ID number"
              value={idDocNumber}
              onChange={(e) => setIdDocNumber(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-hidden"
            />
            <Button
              type="submit"
              variant="secondary"
              size="sm"
              disabled={submittingID}
              className="w-full"
            >
              {submittingID ? 'Validating...' : 'Submit Credentials'}
            </Button>
          </form>
        </div>

        {/* Business Verification (Specifically for Enterprise/Client sellers) */}
        {user?.role === 'SELLER' && (
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs md:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 text-xs">Corporate & GSTIN Verification</h3>
                  <p className="text-[11px] text-slate-500">
                    Verify company registration, tax credentials, and business legitimacy
                  </p>
                </div>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  getVerifStatus('BUSINESS') === 'VERIFIED'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {getVerifStatus('BUSINESS')}
              </span>
            </div>

            <form onSubmit={handleSubmitBusiness} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <input
                type="text"
                placeholder="Business Name"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-hidden"
              />
              <input
                type="text"
                placeholder="Registration CIN / Number"
                value={businessReg}
                onChange={(e) => setBusinessReg(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-hidden"
              />
              <input
                type="text"
                placeholder="GSTIN / Tax ID"
                value={businessTaxId}
                onChange={(e) => setBusinessTaxId(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-hidden"
              />
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={submittingBusiness}
                className="w-full"
              >
                {submittingBusiness ? 'Verifying...' : 'Verify Entity'}
              </Button>
            </form>
          </div>
        )}
      </div>

      {/* Active Sessions & Security Log */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-slate-700" />
            <h3 className="font-semibold text-slate-900 text-xs">Active Login Sessions</h3>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRevokeOtherSessions}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 text-xs"
          >
            Log Out Other Devices
          </Button>
        </div>

        <div className="divide-y divide-slate-100">
          {sessions.map((s) => (
            <div key={s.id} className="p-3.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800">
                      {s.browser} on {s.os}
                    </span>
                    {s.isCurrent && (
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.2 rounded-full font-bold">
                        CURRENT DEVICE
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {s.ip} • {s.location} • Last active {new Date(s.lastActiveAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>

              {!s.isCurrent && (
                <button
                  type="button"
                  onClick={() => handleRevokeSession(s.id)}
                  className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100 cursor-pointer"
                  title="Revoke session"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
