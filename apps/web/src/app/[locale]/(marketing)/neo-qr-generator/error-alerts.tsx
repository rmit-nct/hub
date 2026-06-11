'use client';

import { Button } from '@ncthub/ui/button';
import {
  AlertCircle,
  AlertOctagon,
  Lock,
  Wifi,
  X,
  Zap,
} from '@ncthub/ui/icons';
import { useEffect, useState } from 'react';
import './error-animations.css';

export interface QRError {
  id: string;
  title: string;
  description: string;
  actionLabel?: string;
  severity: 'info' | 'warning' | 'error';
  onAction?: () => void;
  onDismiss?: () => void;
}

// Error type definitions for different scenarios
export const ERROR_TYPES = {
  'dynamic-auth-required': {
    title: 'Sign In to Create Dynamic QR Codes',
    description:
      'Dynamic QR codes with tracking and analytics require authentication. Create a free account to get started.',
    actionLabel: 'Sign In',
    severity: 'warning' as const,
    icon: Lock,
  },
  'dynamic-generation-failed': {
    title: "Couldn't Create Short Link",
    description:
      'We encountered an issue while generating your short link. Please try again.',
    actionLabel: 'Try Again',
    severity: 'error' as const,
    icon: AlertCircle,
  },
  'network-connection-issue': {
    title: 'Connection Lost',
    description: 'Check your internet connection and try again.',
    actionLabel: 'Retry',
    severity: 'warning' as const,
    icon: Wifi,
  },
  'invalid-qr-content': {
    title: 'Invalid Content Format',
    description:
      'Please check your input. URLs should start with http:// or https://, emails should be valid addresses.',
    actionLabel: 'Fix & Retry',
    severity: 'error' as const,
    icon: AlertCircle,
  },
  'qr-limit-reached': {
    title: 'Free Plan Limit Reached',
    description:
      "You've reached your monthly limit of dynamic QR codes. Upgrade your plan for unlimited access.",
    actionLabel: 'Upgrade Plan',
    severity: 'warning' as const,
    icon: Zap,
  },
  'unexpected-application-error': {
    title: 'Something Went Wrong',
    description:
      "We're sorry for the inconvenience. Please try again, or contact support if the problem persists.",
    actionLabel: 'Try Again',
    severity: 'error' as const,
    icon: AlertOctagon,
  },
} as const;

export type ErrorId = keyof typeof ERROR_TYPES;

// Inline Alert Component - For form-level or field-level errors
export interface QRErrorInlineAlertProps {
  error: QRError;
  onDismiss?: () => void;
}

export function QRErrorInlineAlert({
  error,
  onDismiss,
}: QRErrorInlineAlertProps) {
  const errorConfig =
    ERROR_TYPES[error.id as ErrorId] ||
    ERROR_TYPES['unexpected-application-error'];
  const IconComponent = errorConfig.icon;

  const severityClasses = {
    info: 'border-blue-200 bg-blue-50 dark:border-blue-900/30 dark:bg-blue-950/20',
    warning:
      'border-amber-200 bg-amber-50 dark:border-amber-900/30 dark:bg-amber-950/20',
    error: 'border-red-200 bg-red-50 dark:border-red-900/30 dark:bg-red-950/20',
  };

  const iconClasses = {
    info: 'text-blue-600 dark:text-blue-400',
    warning: 'text-amber-600 dark:text-amber-400',
    error: 'text-red-600 dark:text-red-400',
  };

  const titleClasses = {
    info: 'text-blue-900 dark:text-blue-100',
    warning: 'text-amber-900 dark:text-amber-100',
    error: 'text-red-900 dark:text-red-100',
  };

  const descClasses = {
    info: 'text-blue-700 dark:text-blue-200',
    warning: 'text-amber-700 dark:text-amber-200',
    error: 'text-red-700 dark:text-red-200',
  };

  return (
    <div
      className={`${severityClasses[error.severity]} animate-slideUp rounded-lg border p-4 shadow-sm`}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <IconComponent
          className={`${iconClasses[error.severity]} mt-0.5 h-5 w-5 shrink-0 animate-pulse`}
        />
        <div className="flex-1">
          <h3
            className={`${titleClasses[error.severity]} font-semibold text-sm`}
          >
            {error.title}
          </h3>
          <p className={`${descClasses[error.severity]} mt-1 text-sm`}>
            {error.description}
          </p>
          {(error.actionLabel || onDismiss) && (
            <div className="mt-3 flex gap-2">
              {error.actionLabel && error.onAction && (
                <Button
                  size="sm"
                  onClick={error.onAction}
                  className="animate-ripple"
                  variant="default"
                >
                  {error.actionLabel}
                </Button>
              )}
              {onDismiss && (
                <Button size="sm" variant="ghost" onClick={onDismiss}>
                  Dismiss
                </Button>
              )}
            </div>
          )}
        </div>
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="text-foreground transition-colors hover:text-foreground/70"
            aria-label="Close alert"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

// Toast Component - For transient notifications
export interface QRErrorToastProps {
  error: QRError;
  autoDismiss?: boolean;
  duration?: number;
  onDismiss?: () => void;
}

export function QRErrorToast({
  error,
  autoDismiss = true,
  duration = 5000,
  onDismiss,
}: QRErrorToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  const errorConfig =
    ERROR_TYPES[error.id as ErrorId] ||
    ERROR_TYPES['unexpected-application-error'];
  const IconComponent = errorConfig.icon;

  useEffect(() => {
    if (!autoDismiss || !isVisible) return;

    const timer = setTimeout(() => {
      setIsVisible(false);
      onDismiss?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [autoDismiss, duration, isVisible, onDismiss]);

  if (!isVisible) return null;

  const bgClasses = {
    info: 'bg-blue-900 text-blue-50',
    warning: 'bg-amber-900 text-amber-50',
    error: 'bg-red-900 text-red-50',
  };

  return (
    <div
      className={`${bgClasses[error.severity]} fixed right-6 bottom-6 max-w-sm animate-slideFromRight rounded-lg p-4 shadow-lg`}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <IconComponent className="mt-0.5 h-5 w-5 shrink-0 animate-pulse" />
        <div className="flex-1">
          <h3 className="font-semibold text-sm">{error.title}</h3>
          <p className="mt-1 text-sm opacity-90">{error.description}</p>
          {error.actionLabel && error.onAction && (
            <button
              type="button"
              onClick={() => {
                error.onAction?.();
                setIsVisible(false);
              }}
              className="mt-3 inline-block rounded px-3 py-1.5 font-medium text-sm transition-colors hover:bg-white/20"
            >
              {error.actionLabel}
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={() => setIsVisible(false)}
          className="text-white/60 transition-colors hover:text-white"
          aria-label="Close notification"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// Modal Component - For blocking errors requiring user attention
export interface QRErrorModalProps {
  error: QRError;
  isOpen: boolean;
  onClose?: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
}

export function QRErrorModal({
  error,
  isOpen,
  onClose,
  secondaryLabel = 'Cancel',
  onSecondary,
}: QRErrorModalProps) {
  if (!isOpen) return null;

  const errorConfig =
    ERROR_TYPES[error.id as ErrorId] ||
    ERROR_TYPES['unexpected-application-error'];
  const IconComponent = errorConfig.icon;

  const iconBgClasses = {
    info: 'bg-blue-100 dark:bg-blue-950/40',
    warning: 'bg-amber-100 dark:bg-amber-950/40',
    error: 'bg-red-100 dark:bg-red-950/40',
  };

  const iconClasses = {
    info: 'text-blue-600 dark:text-blue-400',
    warning: 'text-amber-600 dark:text-amber-400',
    error: 'text-red-600 dark:text-red-400',
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 animate-fadeIn bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="fixed inset-0 z-50 flex animate-scaleIn items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="error-title"
      >
        <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900">
          {/* Header with Icon Badge */}
          <div className="flex justify-center border-slate-200 border-b p-6 dark:border-slate-700">
            <div
              className={`${iconBgClasses[error.severity]} flex h-12 w-12 items-center justify-center rounded-full`}
            >
              <IconComponent
                className={`${iconClasses[error.severity]} h-6 w-6 animate-glow`}
              />
            </div>
          </div>

          {/* Content */}
          <div className="p-6 text-center">
            <h2
              id="error-title"
              className="font-bold text-lg text-slate-900 dark:text-white"
            >
              {error.title}
            </h2>
            <p className="mt-2 text-slate-600 text-sm dark:text-slate-400">
              {error.description}
            </p>
          </div>

          {/* Actions */}
          <div className="border-slate-200 border-t px-6 py-4 dark:border-slate-700">
            <div className="flex gap-3">
              {onSecondary && (
                <Button
                  variant="outline"
                  onClick={onSecondary}
                  className="flex-1"
                >
                  {secondaryLabel}
                </Button>
              )}
              {error.actionLabel && error.onAction && (
                <Button
                  onClick={() => {
                    error.onAction?.();
                    onClose?.();
                  }}
                  className="flex-1 animate-ripple"
                >
                  {error.actionLabel}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Utility function to create and render errors
export function renderQRError(
  errorId: ErrorId | string,
  config: Partial<QRError> = {}
) {
  const errorConfig =
    ERROR_TYPES[errorId as ErrorId] ||
    ERROR_TYPES['unexpected-application-error'];

  return {
    id: errorId,
    title: config.title || errorConfig.title,
    description: config.description || errorConfig.description,
    actionLabel: config.actionLabel || errorConfig.actionLabel,
    severity: config.severity || errorConfig.severity,
    onAction: config.onAction,
    onDismiss: config.onDismiss,
  } as QRError;
}
