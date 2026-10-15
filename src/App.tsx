import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { LoginPage } from '@/pages/LoginPage';
import { StudentLayout } from '@/components/StudentLayout';
import { HomePage } from '@/pages/HomePage';
import { SearchPage } from '@/pages/SearchPage';
import { WorkDetailPage } from '@/pages/WorkDetailPage';
import { MyBooksPage } from '@/pages/MyBooksPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { StaffRoutesComponent } from '@/staff/routes';
import { Preview } from '@/design/Preview';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 10,
      retry: 1,
    },
  },
});

const StudentProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect staff to staff portal
  if (user.role !== 'student') {
    return <Navigate to="/staff" replace />;
  }

  return <>{children}</>;
};

const StaffProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect students to student portal
  if (user.role === 'student') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const AuthRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (user) {
    if (user.role === 'student') {
      return <Navigate to="/" replace />;
    }
    return <Navigate to="/staff" replace />;
  }

  return <>{children}</>;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Login Route */}
      <Route
        path="/login"
        element={
          <AuthRoute>
            <LoginPage />
          </AuthRoute>
        }
      />

      {/* Protected Student Layout Routes (StudentShell) */}
      <Route
        path="/"
        element={
          <StudentProtectedRoute>
            <StudentLayout />
          </StudentProtectedRoute>
        }
      >
        <Route index element={<HomePage />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="work/:id" element={<WorkDetailPage />} />
        <Route path="my-books" element={<MyBooksPage />} />
        <Route path="student/my-books" element={<MyBooksPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* Protected Staff Circulation Routes (StaffShell) */}
      <Route
        path="/staff/*"
        element={
          <StaffProtectedRoute>
            <StaffRoutesComponent />
          </StaffProtectedRoute>
        }
      />

      {/* Dev-only component preview showcase */}
      {import.meta.env.DEV && (
        <Route path="/_preview" element={<Preview />} />
      )}

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
