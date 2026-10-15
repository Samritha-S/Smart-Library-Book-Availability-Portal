// TODO-swap with src/design/StatusBadge once available from Agent B
import React from 'react';
import { cn } from '@/lib/utils';

export type StatusVariant =
  | 'available'
  | 'issued'
  | 'waiting'
  | 'due_soon'
  | 'overdue'
  | 'unavailable'
  | 'reference'
  | 'on_hold_shelf'
  | 'withdrawn'
  | 'damaged_repair'
  | 'neutral';

export interface StatusBadgeProps {
  status: StatusVariant | string;
  label?: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label, className }) => {
  const normalized = status.toLowerCase().replace(/[\s-]/g, '_');

  let variantStyles = 'bg-[#f8fafc] text-[#475569] border-[#d6e2e0]'; // default neutral
  let defaultLabel = label || status;

  switch (normalized) {
    case 'available':
      variantStyles = 'bg-[#f0fdfa] text-[#0f766e] border-[#99f6e4]';
      defaultLabel = label || 'Available';
      break;

    case 'issued':
    case 'borrowed':
      variantStyles = 'bg-[#f8fafc] text-[#475569] border-[#cbd5e1]';
      defaultLabel = label || 'Issued';
      break;

    case 'waiting':
    case 'due_soon':
    case 'on_hold_shelf':
    case 'reserved':
      variantStyles = 'bg-[#fffbeb] text-[#b45309] border-[#fde68a]';
      defaultLabel = label || (normalized === 'on_hold_shelf' ? 'On hold shelf' : 'Due soon');
      break;

    case 'overdue':
    case 'blocked':
      variantStyles = 'bg-[#fef2f2] text-[#b91c1c] border-[#fecaca]';
      defaultLabel = label || 'Overdue';
      break;

    case 'withdrawn':
    case 'damaged_repair':
    case 'lost':
    case 'missing':
      variantStyles = 'bg-[#fef2f2] text-[#991b1b] border-[#fecaca]';
      defaultLabel = label || (normalized === 'withdrawn' ? 'Withdrawn' : 'Damaged / Repair');
      break;

    case 'reference':
    case 'reference_only':
      variantStyles = 'bg-[#f1f5f9] text-[#334155] border-[#cbd5e1]';
      defaultLabel = label || 'Reference only';
      break;
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-[6px] text-xs font-medium border font-staff-ui select-none',
        variantStyles,
        className
      )}
    >
      {defaultLabel}
    </span>
  );
};
