import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import { auth } from './firebaseConfig';
import { useAuthState } from 'react-firebase-hooks/auth';

// Simple loading component
const Loading = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-dark">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
  </div>
);

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  // We need to handle auth state here.
  // Since we haven't installed react-firebase-hooks yet, I will implement a basic observer or just rely on the user adding it.
  // Wait, I should probably add react-firebase-hooks to be clean or write a hook.
  // For now, let's write a simple hook in this file or just use standard firebase onAuthStateChanged.

  const [user, loading] = useAuth();

  if (loading) return <Loading />;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Custom Auth Hook
import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';

function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return [user, loading] as const;
}

const App: React.FC = () => {
  return (
    <Router>
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
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
