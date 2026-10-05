import React, { useState } from 'react';
import {
  Building,
  Lock,
  Bell,
  Shield,
  Trash2,
  Globe,
  MapPin,
  Upload,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Alert } from '../../components/common/Alert';
import { SellerProfile } from '../../types/auth';

export const SellerSettingsPage: React.FC = () => {
  const { user, profile, updateSellerProfile, uploadAvatar, deactivateAccount } = useAuth();
  const sellerProfile = profile as SellerProfile;

  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications' | 'account'>('profile');

  // Form State
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [businessName, setBusinessName] = useState(sellerProfile?.businessName || '');
  const [industry, setIndustry] = useState(sellerProfile?.industry || 'Technology');
  const [description, setDescription] = useState(sellerProfile?.description || '');
  const [website, setWebsite] = useState(sellerProfile?.website || '');
  const [location, setLocation] = useState(sellerProfile?.location || '');
  const [companySize, setCompanySize] = useState(sellerProfile?.companySize || '1-10');

  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // Status Feedback
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [confirmDeactivate, setConfirmDeactivate] = useState(false);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMessage(null);
    try {
      await updateSellerProfile({
        firstName,
        lastName,
        phone,
        businessName,
        industry,
        description,
        website,
        location,
        companySize,
      });
      setStatusMessage({ type: 'success', text: 'Employer profile updated successfully.' });
    } catch (err: unknown) {
      const e = err as Error;
      setStatusMessage({ type: 'error', text: e.message || 'Failed to update profile.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      setStatusMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    setIsSaving(true);
    setStatusMessage(null);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('worknova_token')}`,
        },
        credentials: 'include',
        body: JSON.stringify({ currentPassword, newPassword, confirmNewPassword }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Failed to update password');
      }
      setStatusMessage({ type: 'success', text: 'Password updated successfully.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err: unknown) {
      const e = err as Error;
      setStatusMessage({ type: 'error', text: e.message || 'Error updating password.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        await uploadAvatar(e.target.files[0]);
        setStatusMessage({ type: 'success', text: 'Logo uploaded and profile completion updated.' });
      } catch (err: unknown) {
        const e = err as Error;
        setStatusMessage({ type: 'error', text: e.message || 'Upload failed.' });
      }
    }
  };

  const handleDeactivate = async () => {
    try {
      await deactivateAccount();
    } catch (err: unknown) {
      const e = err as Error;
      setStatusMessage({ type: 'error', text: e.message || 'Failed to deactivate account.' });
    }
  };

  return (
    <DashboardLayout role="seller">
      <div className="max-w-4xl space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Employer Organization Settings
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage organization credentials, billing contact details, and account security.
          </p>
        </div>

        {statusMessage && (
          <Alert
            type={statusMessage.type}
            message={statusMessage.text}
            onDismiss={() => setStatusMessage(null)}
          />
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1">
          {[
            { id: 'profile', label: 'Company Profile', icon: Building },
            { id: 'security', label: 'Password & Security', icon: Lock },
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'account', label: 'Account Actions', icon: Shield },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setStatusMessage(null);
                }}
                className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Profile */}
        {activeTab === 'profile' && (
          <form onSubmit={handleProfileSave} className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 space-y-6">
            <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
              <div className="w-16 h-16 rounded-xl bg-slate-900 text-white font-bold text-xl flex items-center justify-center overflow-hidden border border-slate-200">
                {user?.profileImage ? (
                  <img src={user.profileImage} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <span>{businessName?.[0] || 'C'}</span>
                )}
              </div>
              <div className="space-y-1">
                <label className="cursor-pointer">
                  <span className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-slate-50 border border-slate-300 px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Organization Logo</span>
                  </span>
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    onChange={handleAvatarFile}
                    className="hidden"
                  />
                </label>
                <p className="text-[11px] text-slate-400">Accepted formats: JPG, PNG, WebP (Max 5MB)</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Organization / Business Name"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
              />
              <Input
                label="Industry"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Primary Contact First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
              <Input
                label="Primary Contact Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Direct Phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <Input
                label="Headquarters Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Company Website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Company Size</label>
                <select
                  value={companySize}
                  onChange={(e) => setCompanySize(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-600 bg-white"
                >
                  <option value="1-10">1-10 Employees</option>
                  <option value="11-50">11-50 Employees</option>
                  <option value="51-200">51-200 Employees</option>
                  <option value="200+">200+ Employees</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Company Description</label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full text-xs p-3 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-600 bg-white"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <Button type="submit" variant="primary" size="md" isLoading={isSaving}>
                Save Organization Settings
              </Button>
            </div>
          </form>
        )}

        {/* Tab 2: Security */}
        {activeTab === 'security' && (
          <form onSubmit={handlePasswordChange} className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 space-y-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Update Password
            </h3>

            <Input
              label="Current Password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />

            <Input
              label="New Password"
              type="password"
              placeholder="Minimum 8 characters with letters & numbers"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />

            <Input
              label="Confirm New Password"
              type="password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              required
            />

            <div className="pt-2 flex justify-end">
              <Button type="submit" variant="primary" size="md" isLoading={isSaving}>
                Update Password
              </Button>
            </div>
          </form>
        )}

        {/* Tab 3: Notifications */}
        {activeTab === 'notifications' && (
          <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Notification Preferences
            </h3>
            <div className="space-y-3 text-xs">
              {[
                { title: 'New Proposals Received', desc: 'Instant email alert whenever a freelancer applies to your active project.' },
                { title: 'Milestone Delivery Submissions', desc: 'Notified when work drafts or deliverables are submitted for review.' },
                { title: 'Escrow Receipts & Billing Statements', desc: 'Monthly summary invoices and milestone release receipts.' },
              ].map((item, idx) => (
                <label key={idx} className="flex items-start gap-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded text-indigo-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-900">{item.title}</p>
                    <p className="text-slate-500">{item.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Account Deactivation */}
        {activeTab === 'account' && (
          <div className="bg-white p-6 sm:p-8 rounded-xl border border-red-200 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-red-700">
              Deactivate Employer Account
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Deactivating closes all open listings and revokes future sign-ins. Contracts with funded in-progress milestones must be completed or resolved before deactivation.
            </p>

            {confirmDeactivate ? (
              <div className="p-4 bg-red-50 rounded-lg space-y-3 border border-red-200">
                <p className="text-xs font-bold text-red-900">
                  Are you sure you want to deactivate your employer account?
                </p>
                <div className="flex gap-2">
                  <Button variant="danger" size="sm" onClick={handleDeactivate}>
                    Yes, Deactivate Account
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setConfirmDeactivate(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 border-red-200 hover:bg-red-50"
                onClick={() => setConfirmDeactivate(true)}
                leftIcon={<Trash2 className="w-4 h-4" />}
              >
                Deactivate Employer Account
              </Button>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
