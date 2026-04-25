import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame, Lock, User, AlertCircle, AlertTriangle, ExternalLink } from 'lucide-react';
import { authService } from '../services/authService';
import { isFirebaseConfigured } from '../firebase';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const getFirebaseErrorMessage = (err: any): string => {
    const code = err?.code || '';
    if (code === 'auth/invalid-api-key' || code === 'auth/api-key-not-valid')
      return 'Firebase API key is invalid. Please follow FIREBASE_SETUP.md and add your real Firebase config to src/firebase.ts';
    if (code === 'auth/user-not-found')
      return 'No owner account found. Go to Firebase Console → Authentication → Add user to create one.';
    if (code === 'auth/wrong-password' || code === 'auth/invalid-credential')
      return 'Incorrect password. Try again.';
    if (code === 'auth/invalid-email')
      return 'Invalid email address.';
    if (code === 'auth/too-many-requests')
      return 'Too many failed attempts. Try again later.';
    if (code === 'auth/network-request-failed')
      return 'Network error. Check your internet connection and Firebase config.';
    if (code === 'auth/configuration-not-found' || code === 'auth/project-not-found')
      return 'Firebase project not found. Check your projectId in src/firebase.ts.';
    if (err?.message?.includes('fetch') || err?.message?.includes('network'))
      return 'Cannot reach Firebase. Check your API key and project ID in src/firebase.ts.';
    return `Auth error: ${err?.message || 'Unknown error'}. See FIREBASE_SETUP.md.`;
  };

  const handleOwnerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await authService.loginAsOwner(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(getFirebaseErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestLogin = () => {
    // Guest mode bypasses Firebase Auth entirely.
    // No anonymous sign-in required — just navigate directly to the guest dashboard.
    navigate('/guest');
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
      
      {/* Background Animated Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-600/20 rounded-full mix-blend-screen filter blur-[100px] animate-float-complex pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-cyan-600/20 rounded-full mix-blend-screen filter blur-[120px] animate-float-complex pointer-events-none" style={{ animationDelay: '2s' }} />

      <div className="w-full max-w-md animate-fade-in relative z-10">

        {/* Setup Warning Banner — shown until Firebase is configured */}
        {!isFirebaseConfigured && (
          <div className="mb-6 p-4 glass-card border-amber-500/30 rounded-2xl flex items-start gap-4 transform transition-all hover:scale-[1.02]">
            <div className="p-2 bg-amber-500/20 rounded-xl flex-shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-amber-300 text-sm font-bold tracking-wide">Firebase Missing</p>
              <p className="text-amber-400/80 text-xs mt-1.5 leading-relaxed font-medium">
                Login requires Firebase. Open <span className="font-mono bg-black/40 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/20">src/firebase.ts</span> and enter your real credentials.
              </p>
            </div>
          </div>
        )}

        {/* Floating Glass Card */}
        <div className="glass-panel-heavy rounded-[2rem] overflow-hidden relative">
          
          {/* Subtle top border reflection */}
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          
          <div className="p-8 sm:p-10">
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <div className="relative group perspective-1000">
                <div className="absolute -inset-6 bg-gradient-to-tr from-orange-600 via-red-500 to-amber-500 rounded-full opacity-20 blur-2xl group-hover:opacity-40 transition-opacity duration-700 animate-pulse-glow" />
                <div className="w-20 h-20 bg-gradient-to-tr from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-orange-500/30 ring-1 ring-white/20 transform transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
                  <Flame className="w-10 h-10 text-white drop-shadow-lg" />
                </div>
              </div>
            </div>

            <h1 className="text-4xl font-extrabold text-center mb-2 tracking-tight">
              <span className="text-white">FireBot</span> <span className="text-gradient from-orange-400 to-red-500">Nexus</span>
            </h1>
            <p className="text-slate-400 text-sm text-center font-medium mb-8">Next-Generation Secure Telemetry</p>

            {/* Error */}
            {error && (
              <div className="mb-5 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-300 leading-relaxed">{error}</p>
              </div>
            )}

            {/* Owner Login Form */}
            <form onSubmit={handleOwnerLogin} className="space-y-4 mb-8">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400 group-focus-within:text-orange-400 transition-colors" />
                </div>
                <input
                  type="email" value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-12 pr-4 py-3.5 border border-white/10 rounded-xl bg-black/20 text-white placeholder-slate-500 font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 backdrop-blur-sm transition-all hover:bg-white/5"
                  placeholder="Owner Email"
                  required
                />
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-orange-400 transition-colors" />
                </div>
                <input
                  type="password" value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-12 pr-4 py-3.5 border border-white/10 rounded-xl bg-black/20 text-white placeholder-slate-500 font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 backdrop-blur-sm transition-all hover:bg-white/5"
                  placeholder="Password"
                  required
                />
              </div>
              <button
                type="submit" disabled={isLoading}
                className="w-full relative group overflow-hidden flex justify-center items-center gap-2 py-4 px-4 rounded-xl text-base font-bold text-white shadow-[0_0_40px_rgba(249,115,22,0.3)] transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-orange-600 via-red-500 to-orange-600 group-hover:bg-[length:200%_auto] animate-aurora transition-all duration-300" />
                <div className="relative z-10 flex items-center gap-2">
                  {isLoading
                    ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Authenticating…</>
                    : 'Initialize Uplink'
                  }
                </div>
              </button>
            </form>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs font-semibold uppercase tracking-widest">
                <span className="px-4 bg-slate-950/60 text-slate-500 rounded-full border border-white/5 backdrop-blur-md">Tactical Override</span>
              </div>
            </div>

            {/* Guest Button */}
            <button
              onClick={handleGuestLogin} type="button" disabled={isLoading}
              className="w-full glass-button group flex justify-center items-center gap-3 py-3.5 px-4 rounded-xl text-sm font-bold text-slate-300 active:scale-[0.98]"
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 transition-opacity duration-500" />
              {isLoading
                ? <div className="w-4 h-4 border-2 border-slate-500/30 border-t-slate-400 rounded-full animate-spin" />
                : <AlertTriangle className="w-4 h-4 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
              }
              <span className="relative z-10 group-hover:text-white transition-colors">Emergency Guest Access</span>
            </button>

            {/* Hardware Setup Link */}
            <button
              onClick={() => navigate('/setup')} type="button" disabled={isLoading}
              className="w-full mt-4 glass-button group flex justify-center items-center gap-3 py-3.5 px-4 rounded-xl text-sm font-bold text-slate-400 active:scale-[0.98]"
            >
              <span className="relative z-10 group-hover:text-white transition-colors">Configure Hardware (New Bot)</span>
            </button>
          </div>
        </div>

        {/* Help link */}
        <div className="mt-8 text-center text-slate-500 text-xs font-medium flex items-center justify-center gap-2">
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Documentation available in <span className="text-slate-300 font-mono bg-black/30 px-2 py-1 rounded-md border border-white/5 shadow-inner">FIREBASE_SETUP.md</span></span>
        </div>
      </div>
    </div>
  );
};
