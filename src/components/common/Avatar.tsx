import React, { useState } from 'react';

export interface AvatarProps {
  name: string;
  src?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isOnline?: boolean;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  name,
  src,
  size = 'md',
  isOnline,
  className = '',
}) => {
  const [hasError, setHasError] = useState(false);

  // Generate deterministic gradient background based on name
  const getInitials = (str: string) => {
    if (!str) return 'U';
    const parts = str.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const getGradient = (str: string) => {
    const hues = [
      'from-indigo-600 to-blue-700 text-white',
      'from-slate-700 to-slate-900 text-white',
      'from-teal-600 to-emerald-700 text-white',
      'from-blue-600 to-cyan-700 text-white',
      'from-violet-600 to-indigo-800 text-white',
      'from-amber-600 to-orange-700 text-white',
    ];
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % hues.length;
    return hues[index];
  };

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm font-semibold',
    lg: 'w-14 h-14 text-base font-semibold',
    xl: 'w-20 h-20 text-xl font-bold',
  };

  const dotSizes = {
    sm: 'w-2 h-2 ring-1',
    md: 'w-2.5 h-2.5 ring-2',
    lg: 'w-3.5 h-3.5 ring-2',
    xl: 'w-4 h-4 ring-2',
  };

  const initials = getInitials(name);
  const gradientClass = getGradient(name);

  return (
    <div className={`relative inline-flex shrink-0 ${className}`}>
      {src && !hasError ? (
        <img
          src={src}
          alt={name}
          referrerPolicy="no-referrer"
          onError={() => setHasError(true)}
          className={`${sizeClasses[size]} rounded-full object-cover border border-slate-200 shadow-2xs`}
        />
      ) : (
        <div
          className={`${sizeClasses[size]} rounded-full bg-gradient-to-br ${gradientClass} flex items-center justify-center tracking-tight shadow-2xs border border-white/20 select-none`}
        >
          {initials}
        </div>
      )}

      {isOnline !== undefined && (
        <span
          className={`absolute bottom-0 right-0 rounded-full ring-white ${dotSizes[size]} ${
            isOnline ? 'bg-emerald-500' : 'bg-slate-300'
          }`}
          title={isOnline ? 'Active' : 'Offline'}
        />
      )}
    </div>
  );
};
