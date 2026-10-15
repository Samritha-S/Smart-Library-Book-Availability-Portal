import React, { useState, useEffect, useRef } from 'react';

export interface AnimatedNumberProps {
  value: number;
  prefix?: string;
  suffix?: string;
  formatFn?: (val: number) => string;
  durationMs?: number;
  className?: string;
}

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  prefix = '',
  suffix = '',
  formatFn,
  durationMs = 600,
  className = '',
}) => {
  const [displayValue, setDisplayValue] = useState(value);
  const [isHighlighted, setIsHighlighted] = useState(false);
  const prevValueRef = useRef(value);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    // If value didn't change, do nothing
    if (prevValueRef.current === value) return;

    // Check for prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      setDisplayValue(value);
      prevValueRef.current = value;
      return;
    }

    // Trigger brief highlight
    setIsHighlighted(true);
    const highlightTimer = setTimeout(() => {
      setIsHighlighted(false);
    }, durationMs + 200);

    const startValue = prevValueRef.current;
    const endValue = value;
    const startTime = performance.now();

    const updateCounter = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / durationMs, 1);

      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startValue + (endValue - startValue) * easeProgress);

      setDisplayValue(current);

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(updateCounter);
      } else {
        setDisplayValue(endValue);
        prevValueRef.current = endValue;
      }
    };

    animFrameRef.current = requestAnimationFrame(updateCounter);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      clearTimeout(highlightTimer);
    };
  }, [value, durationMs]);

  const formatted = formatFn ? formatFn(displayValue) : displayValue.toLocaleString();

  return (
    <span
      className={`inline-block font-mono tabular-nums transition-colors duration-500 rounded px-1 -mx-1 motion-reduce:transition-none ${
        isHighlighted ? 'bg-brand/10 text-brand font-semibold' : 'text-current'
      } ${className}`}
      aria-live="polite"
    >
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
};
