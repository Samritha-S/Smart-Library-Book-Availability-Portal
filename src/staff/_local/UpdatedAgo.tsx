// TODO-swap with src/design/UpdatedAgo once available from Agent B
import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Clock, AlertTriangle } from 'lucide-react';

export interface UpdatedAgoProps {
  timestamp: Date | string | number;
  onRefresh?: () => void;
  className?: string;
}

export const UpdatedAgo: React.FC<UpdatedAgoProps> = ({
  timestamp,
  onRefresh,
  className,
}) => {
  const [secondsAgo, setSecondsAgo] = useState(0);

  useEffect(() => {
    const calc = () => {
      const now = Date.now();
      const past = new Date(timestamp).getTime();
      setSecondsAgo(Math.max(0, Math.floor((now - past) / 1000)));
    };

    calc();
    const interval = setInterval(calc, 2000);
    return () => clearInterval(interval);
  }, [timestamp]);

  const isStale = secondsAgo > 60;

  const formatText = () => {
    if (secondsAgo < 5) return 'Updated just now';
    if (secondsAgo < 60) return `Updated ${secondsAgo}s ago`;
    const mins = Math.floor(secondsAgo / 60);
    if (mins < 60) return `Updated ${mins}m ago`;
    const hours = Math.floor(mins / 60);
    return `Updated ${hours}h ago`;
  };

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 text-xs num-tabular font-staff-ui transition-colors',
        isStale ? 'text-[#b45309]' : 'text-[#042f2e]/60',
        className
      )}
    >
      {isStale ? (
        <AlertTriangle className="h-3 w-3 text-[#f59e0b] shrink-0" />
      ) : (
        <Clock className="h-3 w-3 text-[#042f2e]/40 shrink-0" />
      )}
      <span>{formatText()}</span>
      {isStale && onRefresh && (
        <button
          onClick={onRefresh}
          className="ml-1 text-[11px] underline font-medium text-[#0f766e] hover:text-[#115e59]"
        >
          Refresh now
        </button>
      )}
    </div>
  );
};
