import React, { useState, useEffect } from 'react';
import { Button, toast } from '../_local';
import { Bookmark, Check, AlertCircle } from 'lucide-react';
import { mockStorage } from '../mock/storage';
import { place_hold } from './api';

export interface PlaceHoldButtonProps {
  workId?: string;
  title: string;
  author?: string;
  coverUrl?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  onHoldPlaced?: (queuePosition: number) => void;
}

export const PlaceHoldButton: React.FC<PlaceHoldButtonProps> = ({
  workId,
  title,
  author,
  coverUrl,
  className = '',
  size = 'md',
  onHoldPlaced,
}) => {
  const [isPlacing, setIsPlacing] = useState(false);
  const [placedPosition, setPlacedPosition] = useState<number | null>(null);
  const [blockedReason, setBlockedReason] = useState<string | null>(null);

  // Check student blockage status on mount and storage updates
  useEffect(() => {
    const checkBlocked = () => {
      const loans = mockStorage.getLoans();
      const overdueLoan = loans.find(
        (l) => l.status === 'overdue' || l.working_days_overdue > 0
      );
      if (overdueLoan) {
        setBlockedReason(
          `Holds blocked: "${overdueLoan.title}" is ${overdueLoan.working_days_overdue} working days overdue (Fine: ₹${overdueLoan.fine_amount})`
        );
      } else {
        setBlockedReason(null);
      }

      // Check if already holding this book
      const holds = mockStorage.getHolds();
      const existing = holds.find((h) => h.title.toLowerCase() === title.toLowerCase());
      if (existing) {
        setPlacedPosition(existing.queue_position);
      }
    };

    checkBlocked();
    return mockStorage.subscribe(checkBlocked);
  }, [title]);

  const handlePlaceHold = async () => {
    if (placedPosition !== null || blockedReason) return;

    setIsPlacing(true);
    try {
      const res = await place_hold({
        work_id: workId,
        title,
        author,
        cover_url: coverUrl,
      });

      if (res.success && res.hold) {
        setPlacedPosition(res.hold.queue_position);
        toast.success(
          `Hold placed: You are #${res.hold.queue_position} in line for "${title}"`
        );
        if (onHoldPlaced) onHoldPlaced(res.hold.queue_position);
      } else {
        toast.error(`Could not place hold: ${res.reason || 'Account limit reached'}`);
      }
    } catch {
      toast.error('Could not connect to library hold service');
    } finally {
      setIsPlacing(false);
    }
  };

  if (placedPosition !== null) {
    return (
      <div className="inline-flex flex-col items-start gap-1">
        <Button
          variant="secondary"
          size={size}
          disabled
          leftIcon={<Check className="w-4 h-4 text-brand" />}
          className={`border-brand/40 text-brand bg-[#f0fdfa] ${className}`}
        >
          Hold placed • Position #{placedPosition}
        </Button>
        <span className="text-[10px] text-grey">
          You will be notified once a copy is available
        </span>
      </div>
    );
  }

  return (
    <div className="inline-flex flex-col items-start gap-1">
      <Button
        variant="primary"
        size={size}
        onClick={handlePlaceHold}
        loading={isPlacing}
        disabled={Boolean(blockedReason)}
        leftIcon={<Bookmark className="w-4 h-4" />}
        className={className}
        title={blockedReason || `Place a hold on "${title}"`}
      >
        Place hold
      </Button>

      {blockedReason && (
        <span className="flex items-center gap-1 text-[11px] text-alert max-w-xs leading-tight">
          <AlertCircle className="w-3 h-3 shrink-0" />
          <span>{blockedReason}</span>
        </span>
      )}
    </div>
  );
};
