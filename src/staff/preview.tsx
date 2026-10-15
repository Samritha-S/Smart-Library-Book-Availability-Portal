import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { StaffLayout } from './routes';
import { DashboardPage } from './pages/DashboardPage';
import { IssuePage } from './pages/IssuePage';
import { ReturnPage } from './pages/ReturnPage';
import { CataloguePage } from './pages/CataloguePage';
import { ImportPage } from './pages/ImportPage';
import '@/index.css';
import './staff.css';

// Force mock mode in preview harness
(window as any).__STAFF_MOCK__ = true;

import { ShowQr } from '@/features/qr/ShowQr';

const StaffPreviewApp: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<StaffLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="issue" element={<IssuePage />} />
          <Route path="return" element={<ReturnPage />} />
          <Route path="catalogue" element={<CataloguePage />} />
          <Route path="import" element={<ImportPage />} />
          <Route
            path="qr"
            element={
              <div className="p-8 flex items-center justify-center">
                <ShowQr open={true} onOpenChange={() => {}} />
              </div>
            }
          />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
};

const root = document.getElementById('staff-preview-root');
if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <StaffPreviewApp />
    </React.StrictMode>
  );
}
