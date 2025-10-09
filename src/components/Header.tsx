import React from 'react';
import { Wifi, WifiOff, Moon, Loader2 } from 'lucide-react';

interface HeaderProps {
  isConnected: boolean;
  isConnecting?: boolean;
  deviceName: string;
  onConnect: () => void;
  onDisconnect: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isConnected,
  isConnecting = false,
  deviceName,
  onConnect,
  onDisconnect,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white shadow-2xl">
      <div className="container mx-auto px-6 py-5">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold text-white">Robot Control Center</h1>
            <p className="text-sm text-slate-400 mt-1">
              {isConnected ? `Connected to ${deviceName}` : 'Not connected'}
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-all duration-200">
              <Moon className="w-5 h-5 text-slate-400" />
            </button>

            <button
              onClick={isConnected ? onDisconnect : onConnect}
              disabled={isConnecting}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed ${
                isConnected
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30'
                  : isConnecting
                  ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                  : 'bg-cyan-500 text-white hover:bg-cyan-600 shadow-lg shadow-cyan-500/50'
              }`}
            >
              {isConnected ? (
                <>
                  <WifiOff className="w-5 h-5" />
                  Disconnect
                </>
              ) : isConnecting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Wifi className="w-5 h-5" />
                  Connect to Robot
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
