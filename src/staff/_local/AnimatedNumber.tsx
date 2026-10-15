// TODO-swap with src/design/AnimatedNumber once available from Agent B
import React, { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';

export interface AnimatedNumberProps {
  value: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  prefix = '',
  suffix = '',
  className,
}) => {
  const [displayValue, setDisplayValue] = useState(value);
  const [isFlashing, setIsFlashing] = useState(false);
  const prevValueRef = useRef(value);

  useEffect(() => {
    if (prevValueRef.current !== value) {
      setIsFlashing(true);
      setDisplayValue(value);
      prevValueRef.current = value;
      const timer = setTimeout(() => setIsFlashing(false), 900);
      return () => clearTimeout(timer);
    }
  }, [value]);

  return (
    <span
      className={cn(
        'num-tabular font-medium transition-colors duration-300 rounded px-1 -mx-1',
        isFlashing && 'bg-[#f0fdfa] text-[#0f766e] ring-1 ring-[#0f766e]/30',
        className
      )}
    >
      {prefix}
      {displayValue.toLocaleString()}
      {suffix}
    </span>
  );
};
