import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, Clock, AlertTriangle, MapPin } from 'lucide-react';
import { Sheet } from '../_local';
import { mockStorage } from '../mock/storage';
import type { NotificationItem } from '../mock/types';
import { mark_notification_read, mark_all_notifications_read } from './api';

export interface NotificationBellProps {
  onNavigateTab?: (tab: 'borrowed' | 'holds' | 'history') => void;
  className?: string;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({
  onNavigateTab,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const popoverRef = useRef<HTMLDivElement>(null);
  const bellButtonRef = useRef<HTMLButtonElement>(null);

  // Sync notifications from mockStorage
  useEffect(() => {
    const update = () => {
      setNotifications([...mockStorage.getNotifications()]);
    };
    update();
    return mockStorage.subscribe(update);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Mark all read when opening panel
  const handleToggle = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (nextState && unreadCount > 0) {
      mark_all_notifications_read();
    }
  };

  // Close desktop popover on click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        bellButtonRef.current &&
        !bellButtonRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleNotificationClick = (item: NotificationItem) => {
    mark_notification_read(item.id);
    if (item.link_tab && onNavigateTab) {
      onNavigateTab(item.link_tab);
    }
    setIsOpen(false);
  };

  // Notification items renderer
  const renderNotificationList = () => (
    <div className="divide-y divide-rule font-sans">
      {notifications.length === 0 ? (
        <div className="p-8 text-center text-xs text-grey">
          No notifications at this time
        </div>
      ) : (
        notifications.map((item) => {
          let icon = <Clock className="w-4 h-4 text-accent" />;
          let iconBg = 'bg-[#fffbeb] text-accentink border-accent/40';

          if (item.type === 'hold_ready') {
            icon = <MapPin className="w-4 h-4 text-brand" />;
            iconBg = 'bg-[#f0fdfa] text-brand border-brand/30';
          } else if (item.type === 'overdue_notice') {
            icon = <AlertTriangle className="w-4 h-4 text-alert" />;
            iconBg = 'bg-[#fef2f2] text-alert border-alert/30';
          }

          const timeFormatted = new Date(item.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          });

          return (
            <div
              key={item.id}
              onClick={() => handleNotificationClick(item)}
              className={`p-3.5 transition-colors cursor-pointer flex items-start gap-3 select-none ${
                !item.read ? 'bg-[#f0fdfa]/40 hover:bg-[#f0fdfa]' : 'hover:bg-paper'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-[6px] border flex items-center justify-center shrink-0 ${iconBg}`}
              >
                {icon}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1.5">
                  <h5 className="font-semibold text-xs text-ink line-clamp-1 leading-snug">
                    {item.title}
                  </h5>
                  <span className="text-[10px] text-grey font-tabular shrink-0">
                    {timeFormatted}
                  </span>
                </div>
                <p className="text-xs text-grey mt-0.5 leading-relaxed line-clamp-2">
                  {item.message}
                </p>
              </div>

              {!item.read && (
                <span
                  className="w-2 h-2 rounded-full bg-brand shrink-0 self-center"
                  aria-label="Unread notification"
                />
              )}
            </div>
          );
        })
      )}
    </div>
  );

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Bell Button */}
      <button
        ref={bellButtonRef}
        type="button"
        onClick={handleToggle}
        aria-label={`Notifications, ${unreadCount} unread`}
        className="relative p-2 rounded-[6px] text-ink hover:bg-rule/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
      >
        <Bell className="w-5 h-5" strokeWidth={1.75} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-alert text-white text-[10px] font-bold font-tabular flex items-center justify-center ring-2 ring-white">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Desktop Popover (768px and up) */}
      {isOpen && (
        <div
          ref={popoverRef}
          className="hidden md:block absolute right-0 mt-2 w-96 rounded-[12px] bg-white border border-rule shadow-dialog z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="p-3.5 border-b border-rule bg-paper/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-serif font-semibold text-ink text-sm">
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="text-[11px] font-medium bg-brand/10 text-brand px-1.5 py-0.2 rounded">
                  {unreadCount} new
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => mark_all_notifications_read()}
              className="text-[11px] font-medium text-brand hover:underline flex items-center gap-1"
            >
              <Check className="w-3 h-3" />
              <span>Mark all read</span>
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto">{renderNotificationList()}</div>
        </div>
      )}

      {/* Mobile Bottom Sheet (Under 768px) */}
      <div className="md:hidden">
        <Sheet
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Notifications"
          description={
            unreadCount > 0
              ? `${unreadCount} unread notices and hold alerts`
              : 'All notifications caught up'
          }
          className="p-0"
        >
          <div className="-mx-5 -my-5">{renderNotificationList()}</div>
        </Sheet>
      </div>
    </div>
  );
};
