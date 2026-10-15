// TODO-swap with src/design/AnimatedNumber when available
import React, { useEffect, useState, useRef } from 'react';

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
  className = '',
}) => {
  const [displayValue, setDisplayValue] = useState(value);
  const [isHighlighting, setIsHighlighting] = useState(false);
  const prevValueRef = useRef(value);

  useEffect(() => {
    if (prevValueRef.current !== value) {
      setIsHighlighting(true);
      const start = prevValueRef.current;
      const end = value;
      const duration = 300;
      const startTime = performance.now();

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const currentVal = Math.round(start + (end - start) * progress);
        setDisplayValue(currentVal);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setDisplayValue(end);
          prevValueRef.current = end;
          setTimeout(() => setIsHighlighting(false), 250);
        }
      };

      requestAnimationFrame(animate);
    }
  }, [value]);

  return (
    <span
      className={`tabular-nums font-tabular transition-colors duration-300 ${
        isHighlighting ? 'text-brand font-semibold' : ''
      } ${className}`}
    >
      {prefix}
      {displayValue}
      {suffix}
    </span>
  );
};
