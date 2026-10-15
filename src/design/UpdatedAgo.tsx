import React, { useState, useEffect } from 'react';
import { Clock, RefreshCw, AlertCircle } from 'lucide-react';

export interface UpdatedAgoProps {
  timestamp: Date | number | string;
  staleThresholdSeconds?: number;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  showBannerWhenStale?: boolean;
  className?: string;
}

function formatRelativeTime(secondsDiff: number): string {
  if (secondsDiff < 5) return 'Just now';
  if (secondsDiff < 60) return `Updated ${secondsDiff}s ago`;
  const minutes = Math.floor(secondsDiff / 60);
  if (minutes < 60) return `Updated ${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Updated ${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `Updated ${days}d ago`;
}

export const UpdatedAgo: React.FC<UpdatedAgoProps> = ({
  timestamp,
  staleThresholdSeconds = 60,
  onRefresh,
  isRefreshing = false,
  showBannerWhenStale = true,
  className = '',
}) => {
  const [secondsAgo, setSecondsAgo] = useState<number>(0);

  useEffect(() => {
    const calculateSeconds = () => {
      const date = typeof timestamp === 'object' ? timestamp : new Date(timestamp);
      const diff = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
      setSecondsAgo(diff);
    };

    calculateSeconds();
    const interval = setInterval(calculateSeconds, 1000);
    return () => clearInterval(interval);
  }, [timestamp]);

  const isStale = secondsAgo >= staleThresholdSeconds;

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Stale Banner */}
      {isStale && showBannerWhenStale && (
        <div
          role="status"
          className="flex items-center justify-between px-3 py-2 rounded-[6px] bg-[#fffbeb] border border-accent/40 text-accentink text-xs"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 text-accent" strokeWidth={1.75} />
            <span>Information may be outdated. Last synced {formatRelativeTime(secondsAgo).toLowerCase()}.</span>
          </div>
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1 font-semibold text-accentink hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent ml-2 shrink-0 cursor-pointer"
            >
              <RefreshCw
                className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`}
                strokeWidth={2}
              />
              <span>Refresh now</span>
            </button>
          )}
        </div>
      )}

      {/* Timestamp inline badge */}
      <div className="inline-flex items-center gap-1.5 text-xs text-grey tabular-nums">
        <Clock className="w-3.5 h-3.5 text-grey shrink-0" strokeWidth={1.75} />
        <span>{formatRelativeTime(secondsAgo)}</span>
        {onRefresh && !isStale && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-0.5 rounded text-grey hover:text-ink hover:bg-rule/40 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand ml-1 cursor-pointer"
            aria-label="Refresh data"
            title="Refresh data"
          >
            <RefreshCw
              className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`}
              strokeWidth={1.75}
            />
          </button>
        )}
      </div>
    </div>
  );
};
