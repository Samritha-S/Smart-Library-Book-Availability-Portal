// TODO-swap with src/design/EmptyState once available from Agent B
import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon, Inbox } from 'lucide-react';
import { Button } from './Button';

export interface EmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon: Icon = Inbox,
  actionLabel,
  onAction,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center bg-white rounded-[6px] border border-[#d6e2e0] font-staff-ui',
        className
      )}
    >
      <div className="w-10 h-10 rounded-full bg-[#f7faf9] flex items-center justify-center text-[#042f2e]/50 mb-3 border border-[#d6e2e0]">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="text-sm font-semibold text-[#042f2e]">{title}</h3>
      <p className="text-xs text-[#042f2e]/60 max-w-sm mt-1">{description}</p>
      {actionLabel && onAction && (
        <Button size="sm" variant="secondary" onClick={onAction} className="mt-4">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
