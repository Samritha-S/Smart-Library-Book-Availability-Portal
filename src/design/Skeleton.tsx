import React from 'react';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string | number;
  height?: string | number;
  radius?: 'control' | 'sheet' | 'full';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width,
  height,
  radius = 'control',
  className = '',
  style,
  ...props
}) => {
  const radiusClass =
    radius === 'full'
      ? 'rounded-full'
      : radius === 'sheet'
      ? 'rounded-[12px]'
      : 'rounded-[6px]';

  return (
    <div
      aria-hidden="true"
      className={`animate-pulse bg-[#e8eeed] motion-reduce:animate-none ${radiusClass} ${className}`}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        ...style,
      }}
      {...props}
    />
  );
};
