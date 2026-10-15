// TODO-swap with src/design/Skeleton when available
import React from 'react';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', ...props }) => {
  return (
    <div
      className={`animate-pulse bg-rule/60 rounded-[4px] motion-reduce:animate-none ${className}`}
      {...props}
    />
  );
};
