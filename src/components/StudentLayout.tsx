import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { StudentShell } from '@/design/StudentShell';
import { useAuth } from '@/context/AuthContext';
import { ShowQr } from '@/features/qr/ShowQr';
import { NotificationBell } from '@/features/notifications/NotificationBell';
import { Button } from '@/design/Button';
import { QrCode } from 'lucide-react';
import { SEED_LIBRARY } from '@/lib/supabase';

export const StudentLayout: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [qrOpen, setQrOpen] = useState(false);

  // Map route to active nav tab id
  const getActiveTab = () => {
    const path = location.pathname;
    if (path === '/') return 'home';
    if (path.startsWith('/search')) return 'search';
    if (path.startsWith('/my-books') || path.startsWith('/student/my-books')) return 'loans';
    if (path.startsWith('/profile')) return 'profile';
    return 'home';
  };

  const handleTabChange = (tabId: string) => {
    switch (tabId) {
      case 'home':
        navigate('/');
        break;
      case 'search':
        navigate('/search');
        break;
      case 'loans':
        navigate('/my-books');
        break;
      case 'profile':
        navigate('/profile');
        break;
      default:
        navigate('/');
    }
  };

  const headerActions = (
    <div className="flex items-center gap-2">
      <Button
        variant="secondary"
        size="sm"
        onClick={() => setQrOpen(true)}
        className="h-8 text-xs font-medium"
        leftIcon={<QrCode className="w-3.5 h-3.5" />}
      >
        Pass
      </Button>
      <NotificationBell onNavigateTab={() => navigate('/my-books')} />
    </div>
  );

  return (
    <>
      <StudentShell
        activeTab={getActiveTab()}
        onTabChange={handleTabChange}
        userName={user?.name || 'Student'}
        userRegNo={user?.reg_no || undefined}
        libraryName={SEED_LIBRARY.name}
        actions={headerActions}
      >
        <Outlet />
      </StudentShell>

      {/* Global Contactless Pass QR Sheet */}
      <ShowQr
        open={qrOpen}
        onOpenChange={setQrOpen}
        userId={user?.id || 'usr-001'}
        regNo={user?.reg_no || 'AIT2023CS001'}
        studentName={user?.name || 'Aarav Sharma'}
      />
    </>
  );
};

export default StudentLayout;
