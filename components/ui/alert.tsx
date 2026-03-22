/**
 * Alert Component
 * Displays contextual feedback messages for user actions
 */
import React from 'react';

export type AlertVariant = 'default' | 'destructive' | 'success' | 'warning' | 'info';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
}

const variantStyles: Record<AlertVariant, string> = {
  default: 'bg-background text-foreground border-border',
  destructive: 'bg-destructive/10 text-destructive border-destructive',
  success: 'bg-green-50 text-green-800 border-green-200 dark:bg-green-900/10 dark:text-green-400 dark:border-green-900',
  warning: 'bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-900/10 dark:text-yellow-400 dark:border-yellow-900',
  info: 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-900/10 dark:text-blue-400 dark:border-blue-900',
};

const variantIcons: Record<AlertVariant, string> = {
  default: 'ℹ️',
  destructive: '❌',
  success: '✅',
  warning: '⚠️',
  info: 'ℹ️',
};

export function Alert({
  variant = 'default',
  title,
  children,
  onClose,
  className = '',
  ...props
}: AlertProps) {
  return (
    <div
      role="alert"
      className={`relative rounded-lg border p-4 ${variantStyles[variant]} ${className}`}
      {...props}
    >
      <div className="flex items-start gap-3">
        <span className="text-xl" aria-hidden="true">
          {variantIcons[variant]}
        </span>
        <div className="flex-1">
          {title && (
            <h5 className="mb-1 font-medium leading-none tracking-tight">
              {title}
            </h5>
          )}
          <div className="text-sm [&_p]:leading-relaxed">{children}</div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-auto -mr-1 -mt-1 rounded p-1 hover:bg-black/10 dark:hover:bg-white/10"
            aria-label="Close alert"
          >
            <span aria-hidden="true">×</span>
          </button>
        )}
      </div>
    </div>
  );
}

export function AlertTitle({ children, className = '', ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h5
      className={`mb-1 font-medium leading-none tracking-tight ${className}`}
      {...props}
    >
      {children}
    </h5>
  );
}

export function AlertDescription({ children, className = '', ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <div className={`text-sm [&_p]:leading-relaxed ${className}`} {...props}>
      {children}
    </div>
  );
}
