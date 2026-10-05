import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Globe, Twitter, Github, Linkedin, Disc as Discord } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 text-xs border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 mb-12">
          {/* Column 1: Platform */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">
              Platform
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link to="/find-work" className="hover:text-white transition-colors">
                  Find Work
                </Link>
              </li>
              <li>
                <Link to="/find-freelancers" className="hover:text-white transition-colors">
                  Find Freelancers
                </Link>
              </li>
              <li>
                <Link to="/seller/register" className="hover:text-white transition-colors">
                  Post a Project
                </Link>
              </li>
              <li>
                <Link to="/categories" className="hover:text-white transition-colors">
                  Categories
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="hover:text-white transition-colors">
                  How It Works
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: For Freelancers */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">
              For Freelancers
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link to="/freelancer/register" className="hover:text-white transition-colors">
                  Create Profile
                </Link>
              </li>
              <li>
                <Link to="/find-work" className="hover:text-white transition-colors">
                  Browse Projects
                </Link>
              </li>
              <li>
                <Link to="/freelancer/dashboard" className="hover:text-white transition-colors">
                  My Proposals
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="hover:text-white transition-colors">
                  Success Tips
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: For Sellers */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">
              For Sellers
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link to="/seller/register" className="hover:text-white transition-colors">
                  Post Project
                </Link>
              </li>
              <li>
                <Link to="/find-freelancers" className="hover:text-white transition-colors">
                  Find Talent
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="hover:text-white transition-colors">
                  How Hiring Works
                </Link>
              </li>
              <li>
                <Link to="/seller/dashboard" className="hover:text-white transition-colors">
                  Seller Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Company */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">
              Company
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <span className="text-slate-500 cursor-not-allowed">
                  Careers (Hiring)
                </span>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Help Center
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 5: Legal & Trust */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">
              Legal
            </h4>
            <ul className="space-y-2.5">
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">
                  Terms of Service
                </span>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">
                  Privacy Policy
                </span>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">
                  Community Guidelines
                </span>
              </li>
              <li>
                <Link to="/admin/login" className="text-slate-500 hover:text-slate-300 transition-colors">
                  Staff Admin Portal
                </Link>
              </li>
            </ul>

            <div className="mt-6 flex items-center gap-2 text-[11px] text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Escrow Protected & Verified</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">
              W
            </div>
            <p className="text-slate-500 text-xs">
              © {new Date().getFullYear()} WorkNova Inc. All rights reserved. Built for professional global freelance commerce.
            </p>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span className="hover:text-white transition-colors cursor-pointer" aria-label="Twitter">
              <Twitter className="w-4 h-4" />
            </span>
            <span className="hover:text-white transition-colors cursor-pointer" aria-label="GitHub">
              <Github className="w-4 h-4" />
            </span>
            <span className="hover:text-white transition-colors cursor-pointer" aria-label="LinkedIn">
              <Linkedin className="w-4 h-4" />
            </span>
            <span className="hover:text-white transition-colors cursor-pointer" aria-label="Discord">
              <Discord className="w-4 h-4" />
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
