import React, { useState, useEffect } from 'react';
import { Globe, DollarSign, ChevronDown, Check } from 'lucide-react';
import { growthApi } from '../../services/growthApi';

export const SUPPORTED_CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'USD ($)', rate: 1.0 },
  { code: 'INR', symbol: '₹', name: 'INR (₹)', rate: 84.5 },
  { code: 'EUR', symbol: '€', name: 'EUR (€)', rate: 0.92 },
  { code: 'GBP', symbol: '£', name: 'GBP (£)', rate: 0.78 },
  { code: 'CAD', symbol: 'C$', name: 'CAD (C$)', rate: 1.36 },
  { code: 'AUD', symbol: 'A$', name: 'AUD (A$)', rate: 1.52 },
  { code: 'JPY', symbol: '¥', name: 'JPY (¥)', rate: 154.0 },
];

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English (US)' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'hi', name: 'हिन्दी (Hindi)' },
  { code: 'zh', name: '中文 (Chinese)' },
  { code: 'ja', name: '日本語 (Japanese)' },
  { code: 'ar', name: 'العربية (Arabic)' },
];

export const CurrencyLanguageSwitcher: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [openCurrencyMenu, setOpenCurrencyMenu] = useState(false);
  const [openLanguageMenu, setOpenLanguageMenu] = useState(false);

  useEffect(() => {
    const savedCurrency = localStorage.getItem('worknova_currency') || 'USD';
    const savedLang = localStorage.getItem('worknova_lang') || 'en';
    setSelectedCurrency(savedCurrency);
    setSelectedLanguage(savedLang);
  }, []);

  const handleCurrencyChange = (code: string) => {
    setSelectedCurrency(code);
    localStorage.setItem('worknova_currency', code);
    setOpenCurrencyMenu(false);
    window.dispatchEvent(new Event('currency_changed'));
  };

  const handleLanguageChange = (code: string) => {
    setSelectedLanguage(code);
    localStorage.setItem('worknova_lang', code);
    setOpenLanguageMenu(false);
  };

  const currentCurrencyObj = SUPPORTED_CURRENCIES.find((c) => c.code === selectedCurrency) || SUPPORTED_CURRENCIES[0];
  const currentLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === selectedLanguage) || SUPPORTED_LANGUAGES[0];

  return (
    <div className="flex items-center gap-2 text-xs">
      {/* Currency Switcher */}
      <div className="relative">
        <button
          onClick={() => {
            setOpenCurrencyMenu(!openCurrencyMenu);
            setOpenLanguageMenu(false);
          }}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100/80 hover:bg-slate-200/70 text-slate-700 font-semibold transition-all border border-slate-200/60 shadow-2xs"
          title="Switch currency"
        >
          <span className="font-bold text-indigo-600">{currentCurrencyObj.symbol}</span>
          <span>{currentCurrencyObj.code}</span>
          <ChevronDown className="w-3 h-3 text-slate-400" />
        </button>

        {openCurrencyMenu && (
          <div className="absolute right-0 mt-1.5 w-44 rounded-xl bg-white border border-slate-200 shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95">
            <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
              Select Currency
            </div>
            {SUPPORTED_CURRENCIES.map((c) => (
              <button
                key={c.code}
                onClick={() => handleCurrencyChange(c.code)}
                className={`w-full px-3 py-1.5 text-left text-xs font-medium flex items-center justify-between hover:bg-slate-50 transition-colors ${
                  selectedCurrency === c.code ? 'text-indigo-600 font-bold bg-indigo-50/50' : 'text-slate-700'
                }`}
              >
                <span>{c.name}</span>
                {selectedCurrency === c.code && <Check className="w-3.5 h-3.5 text-indigo-600" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Language Switcher */}
      {!compact && (
        <div className="relative">
          <button
            onClick={() => {
              setOpenLanguageMenu(!openLanguageMenu);
              setOpenCurrencyMenu(false);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100/80 hover:bg-slate-200/70 text-slate-700 font-semibold transition-all border border-slate-200/60 shadow-2xs"
            title="Switch language"
          >
            <Globe className="w-3.5 h-3.5 text-slate-500" />
            <span className="truncate max-w-[70px]">{currentLangObj.name}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {openLanguageMenu && (
            <div className="absolute right-0 mt-1.5 w-44 rounded-xl bg-white border border-slate-200 shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95">
              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                Select Language
              </div>
              {SUPPORTED_LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  onClick={() => handleLanguageChange(l.code)}
                  className={`w-full px-3 py-1.5 text-left text-xs font-medium flex items-center justify-between hover:bg-slate-50 transition-colors ${
                    selectedLanguage === l.code ? 'text-indigo-600 font-bold bg-indigo-50/50' : 'text-slate-700'
                  }`}
                >
                  <span>{l.name}</span>
                  {selectedLanguage === l.code && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
