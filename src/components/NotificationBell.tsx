import React, { useState } from 'react';
import { Bell, X, Flame, CheckCircle, BellOff } from 'lucide-react';
import { FireEvent, markAllRead } from '../services/firestoreService';

interface NotificationBellProps {
  events: FireEvent[];
  unreadCount: number;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ events, unreadCount }) => {
  const [open, setOpen] = useState(false);

  const handleMarkAllRead = async () => {
    const unreadIds = events.filter(e => !e.read && e.id).map(e => e.id!);
    if (unreadIds.length > 0) await markAllRead(unreadIds);
  };

  const formatTime = (date: Date) => {
    const diff = Math.floor((Date.now() - date.getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-all duration-200"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-12 z-50 w-80 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-orange-400" />
                <span className="text-sm font-semibold text-white">Fire Event Log</span>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full font-bold border border-red-500/30">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs text-slate-400 hover:text-white transition-colors"
                  >
                    Mark all read
                  </button>
                )}
                <button onClick={() => setOpen(false)}>
                  <X className="w-4 h-4 text-slate-500 hover:text-white" />
                </button>
              </div>
            </div>

            {/* Events */}
            <div className="max-h-72 overflow-y-auto">
              {events.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center px-4">
                  <BellOff className="w-8 h-8 text-slate-700 mb-2" />
                  <p className="text-slate-500 text-sm">No fire events yet</p>
                </div>
              ) : (
                events.map((evt) => (
                  <div
                    key={evt.id}
                    className={`flex items-start gap-3 px-4 py-3 border-b border-slate-800/60 transition-colors hover:bg-slate-800/40 ${!evt.read ? 'bg-slate-800/30' : ''}`}
                  >
                    <div className={`mt-0.5 p-1.5 rounded-lg flex-shrink-0 ${evt.type === 'detected' ? 'bg-red-500/20' : 'bg-green-500/20'}`}>
                      {evt.type === 'detected'
                        ? <Flame className="w-4 h-4 text-red-400" />
                        : <CheckCircle className="w-4 h-4 text-green-400" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${evt.type === 'detected' ? 'text-red-300' : 'text-green-300'}`}>
                        {evt.type === 'detected' ? '🔥 Fire Detected' : '✅ Fire Suppressed'}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">{formatTime(evt.timestamp)}</p>
                    </div>
                    {!evt.read && <div className="w-2 h-2 rounded-full bg-orange-500 mt-1 flex-shrink-0" />}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
