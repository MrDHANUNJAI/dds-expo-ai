import React, { useState } from 'react';
import {
  User,
  Lock,
  Bell,
  Shield,
  Trash2,
  CheckCircle2,
  DollarSign,
  Upload,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Alert } from '../../components/common/Alert';
import { FreelancerProfile } from '../../types/auth';

export const FreelancerSettingsPage: React.FC = () => {
  const { user, profile, updateFreelancerProfile, uploadAvatar, deactivateAccount } = useAuth();
  const flProfile = profile as FreelancerProfile;

  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications' | 'account'>('profile');

  // Profile Form State
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [professionalTitle, setProfessionalTitle] = useState(flProfile?.professionalTitle || '');
  const [hourlyRate, setHourlyRate] = useState(flProfile?.hourlyRate || 50);
  const [bio, setBio] = useState(flProfile?.bio || '');
  const [location, setLocation] = useState(flProfile?.location || '');
  const [availability, setAvailability] = useState(flProfile?.availability || 'Available Now');

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
      await updateFreelancerProfile({
        firstName,
        lastName,
        phone,
        professionalTitle,
        hourlyRate: Number(hourlyRate),
        bio,
        location,
        availability: availability as any,
      });
      setStatusMessage({ type: 'success', text: 'Profile information updated successfully.' });
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
        setStatusMessage({ type: 'success', text: 'Avatar uploaded and profile recalculated.' });
      } catch (err: unknown) {
        const e = err as Error;
        setStatusMessage({ type: 'error', text: e.message || 'Avatar upload failed.' });
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
    <DashboardLayout role="freelancer">
      <div className="max-w-4xl space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Account & Profile Settings
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your personal profile, credentials, and notification preferences.
          </p>
        </div>

        {statusMessage && (
          <Alert
            type={statusMessage.type}
            message={statusMessage.text}
            onDismiss={() => setStatusMessage(null)}
          />
        )}

        {/* Settings Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1">
          {[
            { id: 'profile', label: 'Profile & Expertise', icon: User },
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
            {/* Avatar Row */}
            <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
              <div className="w-16 h-16 rounded-full bg-indigo-600 text-white font-bold text-xl flex items-center justify-center overflow-hidden border border-slate-200">
                {user?.profileImage ? (
                  <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span>{user?.firstName?.[0]}{user?.lastName?.[0]}</span>
                )}
              </div>
              <div className="space-y-1">
                <label className="cursor-pointer">
                  <span className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-slate-50 border border-slate-300 px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Change Profile Photo</span>
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
                label="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
              <Input
                label="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <Input
                label="Location"
                placeholder="e.g. Austin, TX, USA"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Professional Title"
                value={professionalTitle}
                onChange={(e) => setProfessionalTitle(e.target.value)}
              />
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Hourly Rate ($/hr)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">$</span>
                  <input
                    type="number"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(Number(e.target.value))}
                    className="w-full pl-7 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Availability Status</label>
              <select
                value={availability}
                onChange={(e) => setAvailability(e.target.value as any)}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-600 bg-white"
              >
                <option value="Available Now">Available Now (Full-time)</option>
                <option value="Part-time">Part-time (Under 20 hrs/week)</option>
                <option value="Busy">Busy (Not taking new projects)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Professional Bio</label>
              <textarea
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full text-xs p-3 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-600 bg-white"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <Button type="submit" variant="primary" size="md" isLoading={isSaving}>
                Save Profile Changes
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
                { title: 'Project Proposals & Messages', desc: 'Receive instant notifications when clients message you or accept proposals.' },
                { title: 'Escrow Milestone Releases', desc: 'Get notified immediately when milestone funds are deposited or released.' },
                { title: 'Matching Project Alerts', desc: 'Daily digest of newly posted contracts matching your skills.' },
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

        {/* Tab 4: Account Actions / Deactivation */}
        {activeTab === 'account' && (
          <div className="bg-white p-6 sm:p-8 rounded-xl border border-red-200 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-red-700">
              Deactivate Account
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Deactivating your account prevents public profile discovery and blocks future logins. Historical project milestones, escrow receipts, and review records are preserved in accordance with platform compliance rules.
            </p>

            {confirmDeactivate ? (
              <div className="p-4 bg-red-50 rounded-lg space-y-3 border border-red-200">
                <p className="text-xs font-bold text-red-900">
                  Are you absolutely sure you want to deactivate your account?
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
                Deactivate My Account
              </Button>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
