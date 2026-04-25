import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { OwnerDashboard } from './pages/OwnerDashboard';
import { GuestDashboard } from './pages/GuestDashboard';
import { SetupPage } from './pages/SetupPage';
import { authService, UserProfile } from './services/authService';
import { Flame } from 'lucide-react';

/** Full-screen loading spinner shown while Firebase resolves auth state */
const Splash: React.FC = () => (
  <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4">
    <div className="relative">
      <div className="absolute -inset-6 bg-orange-500/20 rounded-full blur-xl animate-pulse" />
      <Flame className="w-14 h-14 text-orange-500 relative z-10 animate-bounce" />
    </div>
    <p className="text-slate-400 text-sm animate-pulse">Loading FireBot…</p>
  </div>
);

function App() {
  const [user, setUser] = useState<UserProfile | null | undefined>(undefined); // undefined = loading

  useEffect(() => {
    const unsub = authService.onAuthStateChanged((u) => setUser(u));
    return unsub;
  }, []);

  // Still resolving auth state — show splash
  if (user === undefined) return <Splash />;

  const isOwner = user?.role === 'owner';

  return (
    <BrowserRouter>
      <Routes>
        {/* First-time setup page — accessible without login */}
        <Route path="/setup" element={<SetupPage />} />

        {/* Public — redirect away if already logged in */}
        <Route
          path="/login"
          element={
            user
              ? <Navigate to={isOwner ? '/dashboard' : '/guest'} replace />
              : <LoginPage />
          }
        />

        {/* Owner only */}
        <Route
          path="/dashboard"
          element={
            isOwner
              ? <OwnerDashboard />
              : user
                ? <Navigate to="/guest" replace />
                : <Navigate to="/login" replace />
          }
        />

        {/* Guest (bypass auth) */}
        <Route
          path="/guest"
          element={<GuestDashboard />}
        />

        {/* Catch-all */}
        <Route
          path="*"
          element={
            <Navigate to={user ? (isOwner ? '/dashboard' : '/guest') : '/login'} replace />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
