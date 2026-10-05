import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Globe,
  MapPin,
  Upload,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Alert } from '../../components/common/Alert';

const INDUSTRIES = [
  'Technology & Software (SaaS)',
  'E-Commerce & Retail',
  'Healthcare & Life Sciences',
  'Financial Services & Fintech',
  'Media, Entertainment & Gaming',
  'Consulting & Professional Services',
  'Education & EdTech',
  'Manufacturing & Logistics',
];

export const SellerOnboardingPage: React.FC = () => {
  const { user, completeSellerOnboarding, uploadAvatar } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [businessName, setBusinessName] = useState(`${user?.firstName || 'My'} Ventures`);
  const [industry, setIndustry] = useState('Technology & Software (SaaS)');
  const [description, setDescription] = useState(
    'We are building high-quality technology solutions and seeking experienced freelance specialists to accelerate our milestone roadmaps.'
  );
  const [website, setWebsite] = useState('https://company.example.com');
  const [location, setLocation] = useState('New York, NY, USA');
  const [companySize, setCompanySize] = useState('11-50');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateCompletion = () => {
    let score = 20; // user basic info
    if (businessName.trim().length > 1) score += 20;
    if (industry.trim().length > 1) score += 15;
    if (description.trim().length >= 20) score += 20;
    if (website.trim().length > 3) score += 10;
    if (location.trim().length > 1) score += 10;
    if (avatarPreview || user?.profileImage) score += 5;
    return Math.min(100, score);
  };

  const currentScore = calculateCompletion();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleFinish = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      if (avatarFile) {
        await uploadAvatar(avatarFile);
      }

      await completeSellerOnboarding({
        businessName: businessName || `${user?.firstName}'s Team`,
        industry,
        description,
        website,
        location,
        companySize,
      });

      navigate('/seller/dashboard');
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || 'Failed to complete client onboarding.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    navigate('/seller/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between py-12 px-4 sm:px-6">
      <div className="max-w-xl mx-auto w-full space-y-6">
        {/* Top Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
              W
            </div>
            <span className="font-bold text-slate-900 text-lg">WorkNova Employer Profile</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Complete your employer profile
          </h1>
          <p className="text-xs text-slate-500">
            Welcome, <strong>{user?.firstName}</strong>. A detailed organization profile attracts the top 1% of independent specialists.
          </p>
        </div>

        {/* Progress & Completion Meter */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2 shadow-2xs">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-600">
              Step {step} of 5
            </span>
            <span className="font-bold text-indigo-600 tabular-nums">
              Profile {currentScore}% complete
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 5) * 100}%` }}
            />
          </div>
        </div>

        {error && <Alert type="error" message={error} onDismiss={() => setError(null)} />}

        {/* Step Container Card */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 space-y-6 shadow-xs min-h-[380px] flex flex-col justify-between">
          {/* STEP 1: Business / Personal Name */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                  Step 1
                </span>
                <h2 className="text-lg font-bold text-slate-900">
                  What is your business or entity name?
                </h2>
                <p className="text-xs text-slate-500">
                  This will be displayed on all project postings and contracts.
                </p>
              </div>

              <Input
                label="Organization or Business Name"
                placeholder="e.g. Apex Dynamics, Sarah's Studio..."
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                autoFocus
              />

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">Company Size</label>
                <div className="grid grid-cols-4 gap-2">
                  {['1-10', '11-50', '51-200', '200+'].map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setCompanySize(sz)}
                      className={`py-2 text-xs font-medium rounded-lg border text-center transition-colors ${
                        companySize === sz
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Industry */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                  Step 2
                </span>
                <h2 className="text-lg font-bold text-slate-900">
                  What industry describes your operations?
                </h2>
                <p className="text-xs text-slate-500">
                  Matches your listings with specialists having relevant domain context.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {INDUSTRIES.map((ind) => (
                  <button
                    key={ind}
                    type="button"
                    onClick={() => setIndustry(ind)}
                    className={`p-3 text-left text-xs font-medium rounded-xl border transition-all cursor-pointer ${
                      industry === ind
                        ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 font-bold shadow-2xs'
                        : 'border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {ind}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: Description */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                  Step 3
                </span>
                <h2 className="text-lg font-bold text-slate-900">
                  Describe what your organization builds
                </h2>
                <p className="text-xs text-slate-500">
                  Briefly explain your mission, products, and collaboration culture.
                </p>
              </div>

              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="We build enterprise solutions and collaborate with specialized freelance talent on critical software delivery..."
                className="w-full text-xs p-3 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-600 bg-white text-slate-900"
              />
            </div>
          )}

          {/* STEP 4: Website */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                  Step 4
                </span>
                <h2 className="text-lg font-bold text-slate-900">
                  Company website or online presence
                </h2>
                <p className="text-xs text-slate-500">
                  Freelancers review company websites to verify legitimacy before submitting bids.
                </p>
              </div>

              <Input
                label="Website URL"
                placeholder="https://yourcompany.com"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                leftIcon={<Globe className="w-4 h-4" />}
                autoFocus
              />
            </div>
          )}

          {/* STEP 5: Location & Brand Logo */}
          {step === 5 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                  Step 5
                </span>
                <h2 className="text-lg font-bold text-slate-900">
                  Location & organization emblem
                </h2>
                <p className="text-xs text-slate-500">
                  Set headquarters location and upload a logo.
                </p>
              </div>

              <Input
                label="Headquarters / Primary City"
                placeholder="e.g. San Francisco, CA, USA"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                leftIcon={<MapPin className="w-4 h-4" />}
              />

              <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="w-14 h-14 rounded-xl bg-slate-200 border border-slate-300 overflow-hidden flex items-center justify-center shrink-0">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <Building className="w-6 h-6 text-slate-400" />
                  )}
                </div>
                <div className="space-y-1">
                  <label className="cursor-pointer">
                    <span className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-white border border-slate-300 px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5 shadow-2xs">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Logo</span>
                    </span>
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/webp"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                  <p className="text-[11px] text-slate-400">JPG, PNG or WebP under 5MB</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            {step > 1 ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStep(step - 1)}
                leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
              >
                Back
              </Button>
            ) : (
              <button
                type="button"
                onClick={handleSkip}
                className="text-xs text-slate-400 hover:text-slate-600 font-medium"
              >
                Skip for now
              </button>
            )}

            {step < 5 ? (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setStep(step + 1)}
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                Continue
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={handleFinish}
                isLoading={isSubmitting}
                rightIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
              >
                Complete Onboarding
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
