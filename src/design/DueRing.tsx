import React, { useEffect, useState } from 'react';

export interface DueRingProps {
  daysLeft: number;
  totalDays?: number;
  overdue?: boolean;
  isOverdue?: boolean;
  size?: number;
  strokeWidth?: number;
  label?: string;
  className?: string;
}

export const DueRing: React.FC<DueRingProps> = ({
  daysLeft,
  totalDays = 14,
  overdue: overdueProp = false,
  isOverdue: isOverdueProp = false,
  size = 140,
  strokeWidth = 10,
  label,
  className = '',
}) => {
  const overdue = overdueProp || isOverdueProp;
  const [animatedOffset, setAnimatedOffset] = useState<number | null>(null);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Status mapping
  // brand: > 3 days left
  // accent: 0-3 days left
  // alert: overdue only
  let strokeColor = '#0f766e'; // brand
  let trackColor = '#e8eeed'; // rule light
  let textColor = 'text-brand';
  let defaultLabel = 'Days left';

  if (overdue || daysLeft < 0) {
    strokeColor = '#b91c1c'; // alert
    textColor = 'text-alert';
    defaultLabel = 'Days overdue';
  } else if (daysLeft <= 3) {
    strokeColor = '#f59e0b'; // accent
    textColor = 'text-accentink';
    defaultLabel = 'Due soon';
  }

  // Calculate target progress
  // If overdue: 100% alert stroke
  // Otherwise: daysLeft / totalDays ratio
  const ratio = overdue
    ? 1.0
    : Math.max(0.05, Math.min(1.0, daysLeft / (totalDays || 14)));
  const targetOffset = circumference * (1 - ratio);

  // Animate stroke draw once on mount
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      setAnimatedOffset(targetOffset);
      return;
    }

    // Start with empty circle
    setAnimatedOffset(circumference);

    // Trigger stroke draw
    const timer = setTimeout(() => {
      setAnimatedOffset(targetOffset);
    }, 50);

    return () => clearTimeout(timer);
  }, [circumference, targetOffset]);

  const displayDays = Math.abs(daysLeft);
  const displayLabel = label || defaultLabel;

  return (
    <div
      className={`relative inline-flex flex-col items-center justify-center rounded-full select-none ${className}`}
      style={{ width: size, height: size }}
      role="progressbar"
      aria-valuenow={daysLeft}
      aria-valuemin={0}
      aria-valuemax={totalDays}
      aria-label={`${displayDays} ${displayLabel}`}
    >
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
        style={{ overflow: 'visible' }}
      >
        {/* Track circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Dynamic progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={animatedOffset !== null ? animatedOffset : targetOffset}
          strokeLinecap="round"
          fill="none"
          style={{
            transition: 'stroke-dashoffset 900ms cubic-bezier(0.16, 1, 0.3, 1)',
          }}
          className="motion-reduce:transition-none"
        />
      </svg>

      {/* Central label stamp */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
        <span
          className={`font-serif text-3xl font-bold tracking-tight tabular-nums ${textColor} leading-none`}
        >
          {displayDays}
        </span>
        <span className="text-[11px] text-grey font-medium mt-1 leading-tight max-w-[85px]">
          {displayLabel}
        </span>
      </div>
    </div>
  );
};
