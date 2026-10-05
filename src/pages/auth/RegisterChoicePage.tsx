import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Briefcase, UserCheck, ArrowRight } from 'lucide-react';
import { Button } from '../../components/common/Button';

export const RegisterChoicePage: React.FC = () => {
  const [selectedType, setSelectedType] = useState<'seller' | 'freelancer'>('seller');
  const navigate = useNavigate();

  const handleProceed = () => {
    if (selectedType === 'freelancer') {
      navigate('/freelancer/register');
    } else {
      navigate('/seller/register');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 sm:px-6 py-12">
      <div className="w-full max-w-xl space-y-8 text-center">
        <div className="space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-base shadow-2xs">
              W
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">WorkNova</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Join as a client or freelancer
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Select how you plan to use the WorkNova marketplace platform.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
          {/* Client / Seller Box */}
          <div
            onClick={() => setSelectedType('seller')}
            className={`p-6 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
              selectedType === 'seller'
                ? 'border-indigo-600 bg-white shadow-xs'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Briefcase className="w-5 h-5" />
              </div>
              <div
                className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                  selectedType === 'seller'
                    ? 'border-indigo-600 bg-indigo-600'
                    : 'border-slate-300'
                }`}
              >
                {selectedType === 'seller' && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">
                I'm a client, hiring for a project
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Post contracts, review proposals from verified engineers and designers, and release escrow upon milestone approval.
              </p>
            </div>
          </div>

          {/* Freelancer Box */}
          <div
            onClick={() => setSelectedType('freelancer')}
            className={`p-6 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
              selectedType === 'freelancer'
                ? 'border-indigo-600 bg-white shadow-xs'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <UserCheck className="w-5 h-5" />
              </div>
              <div
                className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                  selectedType === 'freelancer'
                    ? 'border-indigo-600 bg-indigo-600'
                    : 'border-slate-300'
                }`}
              >
                {selectedType === 'freelancer' && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">
                I'm a freelancer, looking for work
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Build your verified technical profile, apply to top-budget client opportunities, and get paid with milestone security.
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-xs mx-auto space-y-3">
          <Button
            variant="primary"
            size="lg"
            className="w-full font-semibold"
            onClick={handleProceed}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            {selectedType === 'seller' ? 'Join as Client / Seller' : 'Apply as Freelancer'}
          </Button>

          <p className="text-xs text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-600 font-semibold hover:text-indigo-800">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
