// TODO-swap with src/design/EmptyState once Agent B merges
import React from 'react';
import { BookOpen } from 'lucide-react';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = <BookOpen className="w-8 h-8 text-grey" />,
  title,
  description,
  action,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 md:p-12 border border-dashed border-rule rounded-[12px] bg-white/60 ${className}`}
    >
      <div className="w-12 h-12 rounded-[6px] bg-paper border border-rule flex items-center justify-center mb-3 text-grey">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-ink font-heading mb-1">
        {title}
      </h3>
      <p className="text-xs text-grey max-w-sm mb-4 leading-normal">
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
};
