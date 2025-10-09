import React, { useState } from 'react';
import { Wifi, WifiOff, Moon } from 'lucide-react';

interface HeaderWiFiProps {
  isConnected: boolean;
  esp32Ip: string;
  onConnect: (ip: string) => void;
  onDisconnect: () => void;
}

export const HeaderWiFi: React.FC<HeaderWiFiProps> = ({
  isConnected,
  esp32Ip,
  onConnect,
  onDisconnect,
}) => {
  const [ipInput, setIpInput] = useState(esp32Ip);
  const [showIpInput, setShowIpInput] = useState(false);

  const handleConnect = () => {
    if (ipInput.trim()) {
      onConnect(ipInput.trim());
      setShowIpInput(false);
    }
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white shadow-2xl">
      <div className="container mx-auto px-6 py-5">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold text-white">Robot Control Center</h1>
            <p className="text-sm text-slate-400 mt-1">
              {isConnected ? 'Connected' : 'Not connected'}
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-all duration-200">
              <Moon className="w-5 h-5 text-slate-400" />
            </button>

            {!isConnected && showIpInput && (
              <div className="flex items-center gap-2 animate-fade-in">
                <input
                  type="text"
                  value={ipInput}
                  onChange={(e) => setIpInput(e.target.value)}
                  placeholder="192.168.4.1"
                  className="px-4 py-2 rounded-lg bg-slate-800 text-white text-sm w-40 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200"
                  onKeyPress={(e) => e.key === 'Enter' && handleConnect()}
                />
              </div>
            )}

            <button
              onClick={
                isConnected
                  ? onDisconnect
                  : showIpInput
                  ? handleConnect
                  : () => setShowIpInput(true)
              }
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 ${
                isConnected
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30'
                  : 'bg-cyan-500 text-white hover:bg-cyan-600 shadow-lg shadow-cyan-500/50'
              }`}
            >
              {isConnected ? (
                <>
                  <WifiOff className="w-5 h-5" />
                  Disconnect
                </>
              ) : (
                <>
                  <Wifi className="w-5 h-5" />
                  {showIpInput ? 'Connect' : 'Connect to Robot'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
