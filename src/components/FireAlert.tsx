import React, { useEffect, useState } from 'react';
import { Flame, X, AlertTriangle } from 'lucide-react';

interface FireAlertProps {
  onDismiss: () => void;
}

export const FireAlert: React.FC<FireAlertProps> = ({ onDismiss }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Trigger animation
    setTimeout(() => setVisible(true), 10);
  }, []);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-700 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Intense pulsing red overlay */}
      <div className="absolute inset-0 bg-red-950/80 backdrop-blur-xl animate-fire-pulse" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.2)_0,transparent_100%)] pointer-events-none" />

      {/* Alert card */}
      <div className={`relative z-10 w-full max-w-sm mx-4 glass-panel-heavy !bg-red-950/70 border border-red-500/50 rounded-[2rem] p-8 shadow-[0_0_100px_rgba(239,68,68,0.5)] text-center transition-all duration-700 overflow-hidden ${visible ? 'scale-100 translate-y-0' : 'scale-90 translate-y-10'}`}>
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-red-500 to-transparent animate-pulse" />

        {/* Dismiss */}
        <button
          onClick={onDismiss}
          className="absolute top-4 right-4 p-2 rounded-xl text-red-500/50 hover:text-red-300 hover:bg-red-500/10 transition-all active:scale-90"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative group perspective-1000">
            <div className="absolute -inset-8 bg-red-600 rounded-full blur-2xl opacity-50 animate-pulse-glow" />
            <div className="relative w-24 h-24 rounded-3xl bg-red-500/10 border border-red-500/50 flex items-center justify-center shadow-[inset_0_0_20px_rgba(239,68,68,0.3)]">
              <Flame className="w-12 h-12 text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,1)] animate-bounce-slow" />
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-1 mb-4">
          <div className="flex items-center gap-2 text-red-500 mb-1">
             <AlertTriangle className="w-5 h-5 animate-pulse" />
             <span className="text-xs font-black tracking-[0.3em] uppercase opacity-80">Emergency</span>
             <AlertTriangle className="w-5 h-5 animate-pulse" />
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]">FIRE DETECTED</h2>
        </div>

        <p className="text-red-200/80 text-sm mb-8 font-medium">
          FireBot has confirmed a fire event and is autonomously responding.<br />
          <span className="text-white font-bold bg-red-500/20 px-2 py-1 rounded inline-block mt-2 border border-red-500/30">Extinguishing in progress…</span>
        </p>

        <button
          onClick={onDismiss}
          className="w-full relative group overflow-hidden py-4 px-6 rounded-xl font-bold text-white shadow-[0_0_30px_rgba(239,68,68,0.4)] transition-all transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-red-700 via-red-500 to-red-700 group-hover:bg-[length:200%_auto] animate-border-beam transition-all duration-300" />
          <span className="relative z-10 flex items-center justify-center gap-2 tracking-wide text-sm">
             Acknowledge & Monitor
          </span>
        </button>
      </div>
    </div>
  );
};
