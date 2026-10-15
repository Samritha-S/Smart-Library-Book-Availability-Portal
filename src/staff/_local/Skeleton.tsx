// TODO-swap with src/design/Skeleton once available from Agent B
import React from 'react';
import { cn } from '@/lib/utils';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Skeleton: React.FC<SkeletonProps> = ({ className, ...props }) => {
  return (
    <div
      className={cn('animate-pulse rounded-[4px] bg-[#d6e2e0]/60', className)}
      {...props}
    />
  );
};
