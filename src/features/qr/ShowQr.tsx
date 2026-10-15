import React, { useState, useEffect, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { RefreshCw, ShieldCheck, Clock } from 'lucide-react';
import { Sheet } from '@/staff/_local/Sheet';
import { Button } from '@/staff/_local/Button';
import { create_qr_token } from '@/staff/api';

export interface ShowQrProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId?: string;
  regNo?: string;
  studentName?: string;
}

export const ShowQr: React.FC<ShowQrProps> = ({
  open,
  onOpenChange,
  userId = 'usr-001',
  regNo = 'AIT2023CS001',
  studentName = 'Aarav Sharma',
}) => {
  const [token, setToken] = useState<string>('');
  const [secondsLeft, setSecondsLeft] = useState<number>(60);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Fetch or refresh token
  const fetchNewToken = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await create_qr_token(userId);
      setToken(res.token);
      setSecondsLeft(res.valid_seconds || 60);
    } catch (err) {
      console.error('Failed to generate student QR token:', err);
      // Fallback secure format for offline resilience
      setToken(`QR-${regNo}-${Date.now().toString(36).toUpperCase()}`);
      setSecondsLeft(60);
    } finally {
      setIsLoading(false);
    }
  }, [userId, regNo]);

  // Initial load when opened
  useEffect(() => {
    if (open) {
      fetchNewToken();
    }
  }, [open, fetchNewToken]);

  // 60-second countdown and auto-refresh
  useEffect(() => {
    if (!open) return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          // Time expired, auto-refresh fresh token
          fetchNewToken();
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [open, fetchNewToken]);

  const progressPercent = ((60 - secondsLeft) / 60) * 100;
  const isExpiringSoon = secondsLeft <= 10;

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title="Contactless student pass"
      description="Present this dynamic QR code at the circulation desk scanner."
    >
      <div className="flex flex-col items-center justify-center p-4 space-y-5 font-staff-ui">
        {/* Patron Info Header */}
        <div className="text-center space-y-1">
          <div className="font-serif font-bold text-base text-[#042f2e]">{studentName}</div>
          <div className="font-mono text-xs text-[#042f2e]/70">{regNo}</div>
        </div>

        {/* QR Code Container */}
        <div className="relative p-5 bg-white rounded-[12px] border border-[#d6e2e0] shadow-sm flex flex-col items-center justify-center">
          {isLoading && !token ? (
            <div className="w-52 h-52 flex items-center justify-center">
              <RefreshCw className="h-8 w-8 text-[#0f766e] animate-spin" />
            </div>
          ) : (
            <div className="transition-opacity duration-300">
              <QRCodeSVG
                value={token || `QR-${regNo}`}
                size={208}
                level="H"
                fgColor="#042f2e" // ink color
                bgColor="#ffffff"
                includeMargin={false}
              />
            </div>
          )}

          {/* Micro Token Value */}
          <div className="mt-3 text-[10px] font-mono text-[#042f2e]/50 max-w-[210px] truncate text-center">
            {token}
          </div>
        </div>

        {/* 60s Dynamic Countdown Display */}
        <div className="w-full max-w-[240px] space-y-2 text-center">
          <div className="flex items-center justify-between text-xs num-tabular">
            <span className="flex items-center gap-1.5 text-[#042f2e]/70">
              <Clock className="h-3.5 w-3.5 text-[#0f766e]" />
              <span>Valid for</span>
            </span>
            <span
              className={`font-semibold ${
                isExpiringSoon ? 'text-[#b91c1c] animate-pulse' : 'text-[#042f2e]'
              }`}
            >
              {secondsLeft} seconds
            </span>
          </div>

          {/* Hairline countdown bar */}
          <div className="w-full h-1.5 bg-[#d6e2e0] rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 ${
                isExpiringSoon ? 'bg-[#b91c1c]' : 'bg-[#0f766e]'
              }`}
              style={{ width: `${100 - progressPercent}%` }}
            />
          </div>

          <div className="text-[11px] text-[#042f2e]/60 flex items-center justify-center gap-1 pt-1">
            <ShieldCheck className="h-3 w-3 text-[#0f766e]" />
            <span>Auto-refreshes every 60 seconds</span>
          </div>
        </div>

        {/* Manual Refresh Action */}
        <Button
          size="sm"
          variant="secondary"
          onClick={fetchNewToken}
          isLoading={isLoading}
          className="w-full max-w-[240px] text-xs h-8"
        >
          <RefreshCw className="h-3 w-3 mr-1.5" />
          Refresh code now
        </Button>
      </div>
    </Sheet>
  );
};

export default ShowQr;
