import React from 'react';

export type BadgeStatus =
  | 'available'
  | 'waiting'
  | 'due_soon'
  | 'overdue'
  | 'unavailable'
  | 'reference';

export interface StatusBadgeProps {
  status: BadgeStatus;
  label?: string;
  dot?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

const DEFAULT_LABELS: Record<BadgeStatus, string> = {
  available: 'Available',
  waiting: 'Waiting',
  due_soon: 'Due soon',
  overdue: 'Overdue',
  unavailable: 'Unavailable',
  reference: 'Reference only',
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  dot = true,
  size = 'sm',
  className = '',
}) => {
  const displayLabel = label || DEFAULT_LABELS[status] || status;

  // Strict semantic mapping across entire system
  const statusStyles: Record<BadgeStatus, { container: string; dot: string }> = {
    available: {
      container: 'bg-[#f0fdfa] text-brand border-brand/30',
      dot: 'bg-brand',
    },
    waiting: {
      container: 'bg-[#fffbeb] text-accentink border-accent/40',
      dot: 'bg-accent',
    },
    due_soon: {
      container: 'bg-[#fffbeb] text-accentink border-accent/40',
      dot: 'bg-accent',
    },
    overdue: {
      container: 'bg-[#fef2f2] text-alert border-alert/30',
      dot: 'bg-alert',
    },
    unavailable: {
      container: 'bg-[#f1f5f9] text-grey border-rule',
      dot: 'bg-grey',
    },
    reference: {
      container: 'bg-[#f8fafc] text-grey border-rule',
      dot: 'bg-grey',
    },
  };

  const current = statusStyles[status] || statusStyles.unavailable;

  const sizeClasses =
    size === 'sm'
      ? 'h-5 px-2 text-[11px] gap-1.5'
      : 'h-6 px-2.5 text-xs gap-2';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-[6px] border select-none tabular-nums ${current.container} ${sizeClasses} ${className}`}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${current.dot}`}
          aria-hidden="true"
        />
      )}
      <span>{displayLabel}</span>
    </span>
  );
};
