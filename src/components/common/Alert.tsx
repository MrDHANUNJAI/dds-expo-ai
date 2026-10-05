import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export interface AlertProps {
  type?: 'success' | 'warning' | 'error' | 'info';
  variant?: 'success' | 'warning' | 'error' | 'info';
  title?: string;
  message?: string;
  children?: React.ReactNode;
  onDismiss?: () => void;
  onClose?: () => void;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  type,
  variant,
  title,
  message,
  children,
  onDismiss,
  onClose,
  className = '',
}) => {
  const finalType = variant || type || 'info';
  const handleClose = onClose || onDismiss;
  const content = children || message;
  const styles = {
    info: {
      container: 'bg-indigo-50/70 border-indigo-200 text-indigo-900',
      icon: <Info className="w-4 h-4 text-indigo-600 shrink-0" />,
    },
    success: {
      container: 'bg-emerald-50/70 border-emerald-200 text-emerald-900',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />,
    },
    warning: {
      container: 'bg-amber-50/70 border-amber-200 text-amber-900',
      icon: <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />,
    },
    error: {
      container: 'bg-red-50/70 border-red-200 text-red-900',
      icon: <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />,
    },
  };

  const current = styles[finalType] || styles.info;

  return (
    <div
      role="alert"
      className={`flex items-start gap-3 p-3.5 rounded-lg border text-xs sm:text-sm ${current.container} ${className}`}
    >
      <div className="mt-0.5">{current.icon}</div>
      <div className="flex-1">
        {title && <p className="font-semibold mb-0.5">{title}</p>}
        {typeof content === 'string' ? (
          <p className="opacity-90 leading-relaxed">{content}</p>
        ) : (
          content
        )}
      </div>
      {handleClose && (
        <button
          onClick={handleClose}
          className="text-slate-400 hover:text-slate-600 p-0.5 rounded transition-colors"
          aria-label="Dismiss alert"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
