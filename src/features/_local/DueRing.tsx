// TODO-swap with src/design/DueRing when available
import React, { useEffect, useState } from 'react';

export interface DueRingProps {
  daysLeft: number;
  totalDays?: number;
  isOverdue?: boolean;
  overdueDays?: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export const DueRing: React.FC<DueRingProps> = ({
  daysLeft,
  totalDays = 14,
  isOverdue = false,
  overdueDays = 0,
  size = 48,
  strokeWidth = 4,
  className = '',
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const center = size / 2;
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;

  // Percentage of loan time remaining (0 to 1)
  const ratio = isOverdue
    ? 0
    : Math.max(0, Math.min(1, daysLeft / Math.max(1, totalDays)));

  // Target stroke offset
  const strokeDashoffset = mounted ? circumference * (1 - ratio) : circumference;

  // Color semantic: brand (available/normal), accent (≤ 3 days left), alert (overdue)
  let ringColor = 'stroke-brand';
  let textColor = 'text-brand';
  let bgColor = 'stroke-rule/50';

  if (isOverdue) {
    ringColor = 'stroke-alert';
    textColor = 'text-alert font-bold';
    bgColor = 'stroke-alert/20';
  } else if (daysLeft <= 3) {
    ringColor = 'stroke-accent';
    textColor = 'text-accentink font-bold';
    bgColor = 'stroke-accent/20';
  }

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
      role="img"
      aria-label={
        isOverdue
          ? `${overdueDays} working days overdue`
          : `${daysLeft} days remaining`
      }
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="rotate-[-90deg] transform"
      >
        {/* Track circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          className={`${bgColor} fill-none`}
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          className={`${ringColor} fill-none transition-[stroke-dashoffset] duration-700 ease-out motion-reduce:transition-none`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </svg>

      {/* Center Label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center leading-none select-none">
        <span
          className={`text-[11px] tabular-nums font-tabular ${textColor}`}
          style={{ fontSize: size < 44 ? '10px' : '11px' }}
        >
          {isOverdue ? `+${overdueDays}` : daysLeft}
        </span>
        <span className="text-[8px] text-grey font-sans uppercase tracking-tight scale-90">
          {isOverdue ? 'over' : 'days'}
        </span>
      </div>
    </div>
  );
};
