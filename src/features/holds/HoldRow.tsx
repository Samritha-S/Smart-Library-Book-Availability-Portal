import React, { useState, useEffect } from 'react';
import { Button, StatusBadge, toast } from '../_local';
import { Clock, MapPin, XCircle, Bookmark } from 'lucide-react';
import type { HoldItem } from '../mock/types';
import { cancel_hold, undo_cancel_hold } from './api';

interface HoldRowProps {
  hold: HoldItem;
  onUpdate?: () => void;
}

export const HoldRow: React.FC<HoldRowProps> = ({ hold, onUpdate }) => {
  const [isCancelling, setIsCancelling] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>('');

  const isReady = hold.status === 'ready';

  // Calculate live countdown to pickup deadline
  useEffect(() => {
    if (!hold.pickup_deadline) return;

    const updateCountdown = () => {
      const target = new Date(hold.pickup_deadline!).getTime();
      const now = new Date('2026-10-15T14:00:00.000Z').getTime(); // align with demo time
      const diffMs = target - now;

      if (diffMs <= 0) {
        setTimeLeft('Pickup deadline passed');
        return;
      }

      const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
      const days = Math.floor(totalHours / 24);
      const hours = totalHours % 24;

      if (days > 0) {
        setTimeLeft(`${days} working days left (${hours}h)`);
      } else {
        setTimeLeft(`${hours} hours remaining`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, [hold.pickup_deadline]);

  const handleCancel = async () => {
    setIsCancelling(true);
    try {
      const res = await cancel_hold(hold.hold_id);
      if (res.success) {
        if (onUpdate) onUpdate();

        // Undo toast using the sonner action
        toast.info(`Cancelled: Hold on "${hold.title}" cancelled`, {
          action: {
            label: 'Undo',
            onClick: async () => {
              const undoRes = await undo_cancel_hold(hold.hold_id);
              if (undoRes.success) {
                toast.success(`Restored: Hold on "${hold.title}" returned to queue`);
                if (onUpdate) onUpdate();
              }
            },
          },
          duration: 6000,
        });
      }
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div
      className={`p-4 border-b border-rule transition-colors select-none ${
        isReady ? 'bg-[#f0fdfa]/40 hover:bg-[#f0fdfa]/70' : 'bg-white hover:bg-paper'
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Book cover thumbnail */}
        <div className="w-12 h-16 sm:w-14 sm:h-20 rounded-[4px] overflow-hidden bg-paper border border-rule shrink-0 relative">
          {hold.cover_url ? (
            <img
              src={hold.cover_url}
              alt={hold.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-grey">
              <Bookmark className="w-5 h-5 text-grey" />
            </div>
          )}
          {isReady && (
            <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-brand rounded-bl-[4px]" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-serif font-semibold text-ink text-sm sm:text-base leading-snug line-clamp-1">
              {hold.title}
            </h4>
            <div className="shrink-0">
              {isReady ? (
                <StatusBadge status="available" label="Ready for pickup" />
              ) : (
                <StatusBadge
                  status="waiting"
                  label={`Position ${hold.queue_position} in queue`}
                />
              )}
            </div>
          </div>

          <p className="text-xs text-grey truncate mt-0.5">{hold.author}</p>

          {/* Ready status callout vs Waiting status */}
          <div className="mt-2.5">
            {isReady ? (
              <div className="p-2.5 bg-[#f0fdfa] border border-brand/30 rounded-[6px] text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-brand">
                  <MapPin className="w-3.5 h-3.5 text-brand shrink-0" />
                  <span>Held for you at the front desk</span>
                </div>
                <div className="flex items-center gap-1.5 text-grey tabular-nums">
                  <Clock className="w-3 h-3 text-grey shrink-0" />
                  <span>Pickup deadline: {timeLeft || '2 working days left'}</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-grey">
                <span className="font-semibold text-ink tabular-nums">
                  Queue position #{hold.queue_position}
                </span>
                <span>•</span>
                <span>You will be notified once a copy is checked in</span>
              </div>
            )}
          </div>
        </div>

        {/* Cancel button */}
        <div className="shrink-0 self-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            loading={isCancelling}
            leftIcon={<XCircle className="w-3.5 h-3.5 text-grey" />}
            className="text-grey hover:text-alert hover:bg-alert/10"
            title="Cancel this reservation"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};
