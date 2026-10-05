import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  CheckCircle2,
  Code,
  DollarSign,
  User,
  ArrowRight,
  ArrowLeft,
  Upload,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Alert } from '../../components/common/Alert';

const SKILL_SUGGESTIONS = [
  'React',
  'TypeScript',
  'Node.js',
  'Python',
  'PostgreSQL',
  'UI/UX Design',
  'Figma',
  'Next.js',
  'AWS',
  'Docker',
  'Flutter',
  'Swift',
  'GraphQL',
  'Tailwind CSS',
  'AI / LLMs',
];

export const FreelancerOnboardingPage: React.FC = () => {
  const { user, completeFreelancerOnboarding, uploadAvatar } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [professionalTitle, setProfessionalTitle] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>(['React', 'TypeScript']);
  const [customSkill, setCustomSkill] = useState('');
  const [experienceLevel, setExperienceLevel] = useState<'Beginner' | 'Intermediate' | 'Expert'>('Intermediate');
  const [yearsOfExperience, setYearsOfExperience] = useState(4);
  const [hourlyRate, setHourlyRate] = useState(55);
  const [bio, setBio] = useState(
    'Experienced specialist dedicated to shipping performant, clean, and accessible solutions for modern technology projects.'
  );
  const [location, setLocation] = useState('Remote');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Profile completion calculation:
  // Step 1: +10%
  // Step 2: +15%
  // Step 3: +15%
  // Step 4: +10%
  // Step 5: +15%
  // Basic info: +20%
  const calculateCurrentCompletion = () => {
    let score = 20; // user basic info is already present
    if (professionalTitle.trim().length > 3) score += 10;
    if (selectedSkills.length >= 2) score += 15;
    else if (selectedSkills.length >= 1) score += 8;
    if (yearsOfExperience >= 0) score += 15;
    if (hourlyRate > 0) score += 10;
    if (bio.trim().length >= 20) score += 15;
    if (avatarPreview || user?.profileImage) score += 5;
    return Math.min(100, score);
  };

  const currentScore = calculateCurrentCompletion();

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleAddCustomSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (customSkill.trim() && !selectedSkills.includes(customSkill.trim())) {
      setSelectedSkills([...selectedSkills, customSkill.trim()]);
      setCustomSkill('');
    }
  };

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

      await completeFreelancerOnboarding({
        professionalTitle: professionalTitle || 'Full Stack Developer',
        skills: selectedSkills.length ? selectedSkills : ['React', 'JavaScript'],
        experienceLevel,
        yearsOfExperience: Number(yearsOfExperience),
        hourlyRate: Number(hourlyRate),
        bio: bio.trim() || 'Experienced independent specialist ready for new challenges.',
        location,
      });

      navigate('/freelancer/dashboard');
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || 'Failed to complete profile onboarding.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    navigate('/freelancer/dashboard');
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
            <span className="font-bold text-slate-900 text-lg">WorkNova Onboarding</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Complete your freelancer profile
          </h1>
          <p className="text-xs text-slate-500">
            Welcome, <strong>{user?.firstName}</strong>. A strong profile earns 4x more proposal responses.
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
          {/* STEP 1: Professional Title */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                  Step 1
                </span>
                <h2 className="text-lg font-bold text-slate-900">
                  What is your professional title?
                </h2>
                <p className="text-xs text-slate-500">
                  Clients search by title. Keep it clear, recognizable, and specific.
                </p>
              </div>

              <Input
                label="Professional Title"
                placeholder="e.g. Senior Full Stack Developer, Lead UI/UX Designer..."
                value={professionalTitle}
                onChange={(e) => setProfessionalTitle(e.target.value)}
                autoFocus
              />

              <div className="pt-2">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Suggestions
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Full Stack Developer',
                    'Senior React & Node Engineer',
                    'UI/UX Product Designer',
                    'AI & Machine Learning Engineer',
                    'Mobile App Developer (Flutter/iOS)',
                  ].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setProfessionalTitle(s)}
                      className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 rounded-md transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Skills */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                  Step 2
                </span>
                <h2 className="text-lg font-bold text-slate-900">
                  Select your primary technical skills
                </h2>
                <p className="text-xs text-slate-500">
                  Select at least 2 skills to help clients discover your proposals.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-1">
                {SKILL_SUGGESTIONS.map((skill) => {
                  const isSelected = selectedSkills.includes(skill);
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-600 text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {isSelected ? `✓ ${skill}` : `+ ${skill}`}
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <input
                  type="text"
                  placeholder="Add custom skill..."
                  value={customSkill}
                  onChange={(e) => setCustomSkill(e.target.value)}
                  className="flex-1 text-xs border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-600"
                />
                <Button variant="outline" size="sm" onClick={handleAddCustomSkill}>
                  Add
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: Experience Level */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                  Step 3
                </span>
                <h2 className="text-lg font-bold text-slate-900">
                  What is your experience level?
                </h2>
                <p className="text-xs text-slate-500">
                  Set client expectations for project complexity.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { level: 'Beginner', desc: '1-2 years' },
                  { level: 'Intermediate', desc: '3-6 years' },
                  { level: 'Expert', desc: '7+ years' },
                ].map((item) => (
                  <button
                    key={item.level}
                    type="button"
                    onClick={() => setExperienceLevel(item.level as any)}
                    className={`p-4 rounded-xl border text-center transition-all cursor-pointer ${
                      experienceLevel === item.level
                        ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 font-bold shadow-2xs'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <p className="text-sm font-bold">{item.level}</p>
                    <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
                  </button>
                ))}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">
                  Exact Years of Experience: <strong className="text-indigo-600">{yearsOfExperience} years</strong>
                </label>
                <input
                  type="range"
                  min="0"
                  max="25"
                  value={yearsOfExperience}
                  onChange={(e) => setYearsOfExperience(Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>
            </div>
          )}

          {/* STEP 4: Hourly Rate */}
          {step === 4 && (
            <div className="space-y-5">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                  Step 4
                </span>
                <h2 className="text-lg font-bold text-slate-900">
                  Set your target hourly rate
                </h2>
                <p className="text-xs text-slate-500">
                  Clients will see this rate on your profile. You can still submit customized fixed bids for projects.
                </p>
              </div>

              <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 text-center space-y-3">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Hourly Rate
                </span>
                <div className="flex items-center justify-center gap-1">
                  <span className="text-3xl font-black text-slate-900">$</span>
                  <input
                    type="number"
                    min="10"
                    max="500"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(Number(e.target.value))}
                    className="text-4xl font-black text-indigo-600 w-32 text-center bg-white border border-slate-300 rounded-lg py-1 focus:outline-none focus:border-indigo-600"
                  />
                  <span className="text-base font-semibold text-slate-500">/hr</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  You keep 100% of milestone funds with 0% hidden freelancer fees.
                </p>
              </div>
            </div>
          )}

          {/* STEP 5: Bio & Profile Image */}
          {step === 5 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                  Step 5
                </span>
                <h2 className="text-lg font-bold text-slate-900">
                  Add your bio and profile photo
                </h2>
                <p className="text-xs text-slate-500">
                  A professional summary helps establish instant trust.
                </p>
              </div>

              {/* Avatar Upload */}
              <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="w-14 h-14 rounded-full bg-slate-200 border border-slate-300 overflow-hidden flex items-center justify-center shrink-0">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-6 h-6 text-slate-400" />
                  )}
                </div>
                <div className="space-y-1">
                  <label className="cursor-pointer">
                    <span className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-white border border-slate-300 px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5 shadow-2xs">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Avatar</span>
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

              {/* Bio */}
              <div className="text-left space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">
                  Professional Bio
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Describe your background, technical focus, and client results..."
                  className="w-full text-xs p-3 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-600 bg-white text-slate-900"
                />
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
