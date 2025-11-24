import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';

// Lazy load pages
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

// Simple loading component
const Loading = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#06060C]">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
  </div>
);

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) return <Loading />;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Layout>{children}</Layout>;
};

const AppRoutes = () => {
    return (
        <Suspense fallback={<Loading />}>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                    <Dashboard />
                    </ProtectedRoute>
                }
                />
                <Route
                path="/admin"
                element={
                    <ProtectedRoute>
                    <AdminDashboard />
                    </ProtectedRoute>
                }
                />
                {/* Placeholder routes for other sidebar items to prevent 404s if clicked */}
                <Route path="/membership" element={<ProtectedRoute><div className="text-white p-8">Membership Page Coming Soon</div></ProtectedRoute>} />
                <Route path="/developers" element={<ProtectedRoute><div className="text-white p-8">Developers Page Coming Soon</div></ProtectedRoute>} />
                <Route path="/outreach" element={<ProtectedRoute><div className="text-white p-8">Smart Outreach Page Coming Soon</div></ProtectedRoute>} />
                <Route path="/finance" element={<ProtectedRoute><div className="text-white p-8">Finance Page Coming Soon</div></ProtectedRoute>} />
                <Route path="/reporting" element={<ProtectedRoute><div className="text-white p-8">Reporting Page Coming Soon</div></ProtectedRoute>} />
                <Route path="/events" element={<ProtectedRoute><div className="text-white p-8">Event Management Page Coming Soon</div></ProtectedRoute>} />

                <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Routes>
        </Suspense>
    );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
        <Router>
            <AppRoutes />
        </Router>
    </AuthProvider>
  );
};

export default App;
