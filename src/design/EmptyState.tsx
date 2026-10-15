import React from 'react';
import { BookOpen } from 'lucide-react';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 md:p-12 text-center rounded-[6px] border border-dashed border-rule bg-white ${className}`}
    >
      <div className="w-10 h-10 rounded-full bg-paper border border-rule flex items-center justify-center text-grey mb-3 shrink-0">
        {icon || <BookOpen className="w-5 h-5" strokeWidth={1.75} />}
      </div>
      <h3 className="font-serif text-base font-semibold text-ink mb-1">
        {title}
      </h3>
      {description && (
        <p className="text-xs text-grey max-w-sm leading-normal mb-4">
          {description}
        </p>
      )}
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
};
