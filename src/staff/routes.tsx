import React from 'react';
import { RouteObject, Outlet, Routes, Route } from 'react-router-dom';
import { StaffShell } from './_local/StaffShell';
import { DashboardPage } from './pages/DashboardPage';
import { IssuePage } from './pages/IssuePage';
import { ReturnPage } from './pages/ReturnPage';
import { CataloguePage } from './pages/CataloguePage';
import { ImportPage } from './pages/ImportPage';

/**
 * Layout wrapper that embeds all staff circulation screens inside StaffShell
 */
export const StaffLayout: React.FC = () => {
  return (
    <StaffShell>
      <Outlet />
    </StaffShell>
  );
};

/**
 * Route objects exported for React Router integration.
 * DO NOT EDIT the root router directly; consume this object array in App.tsx or createBrowserRouter.
 */
export const staffRoutes: RouteObject[] = [
  {
    path: 'staff',
    element: <StaffLayout />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'issue',
        element: <IssuePage />,
      },
      {
        path: 'return',
        element: <ReturnPage />,
      },
      {
        path: 'catalogue',
        element: <CataloguePage />,
      },
      {
        path: 'import',
        element: <ImportPage />,
      },
    ],
  },
];

/**
 * Standalone JSX Routes component for direct embedding where RouteObject array is not used
 */
export const StaffRoutesComponent: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<StaffLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="issue" element={<IssuePage />} />
        <Route path="return" element={<ReturnPage />} />
        <Route path="catalogue" element={<CataloguePage />} />
        <Route path="import" element={<ImportPage />} />
      </Route>
    </Routes>
  );
};

export default staffRoutes;
