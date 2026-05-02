import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame, Wifi, WifiOff, LogOut, AlertTriangle, Bot, Settings } from 'lucide-react';
import { StatusPanelWiFi } from '../components/StatusPanelWiFi';
import { ControlPanelWiFi } from '../components/ControlPanelWiFi';
import { rtdbService, type SensorData } from '../services/rtdbService';
import { apiService } from '../services/apiService';
import { websocketService } from '../services/wifiService';
import { authService } from '../services/authService';

export const GuestDashboard: React.FC = () => {
  const navigate = useNavigate();

  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [sensorData, setSensorData] = useState<SensorData>({ fireDetected: false, pumpStatus: false });

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      websocketService.setEsp32Ip('192.168.4.1');
      await websocketService.connect();
      setIsConnected(true);
    } catch (err: any) {
      alert('Could not reach FireBot. Make sure you are connected to "FireBot-AP"');
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    websocketService.disconnect();
    setIsConnected(false);
  };

  const handleCommand = async (command: string) => {
    if (!isConnected) { alert('Please connect to a FireBot first!'); return; }
    try {
      await websocketService.sendCommand(command);
      if (command === 'P1') setSensorData(p => ({ ...p, pumpStatus: true }));
      else if (command === 'P0') setSensorData(p => ({ ...p, pumpStatus: false }));
    } catch { alert('Failed to send command.'); }
  };

  const handleLogout = async () => {
    websocketService.disconnect();
    await authService.logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#020617]">
      {/* Background Animated Orbs */}
      <div className="absolute -top-40 left-0 w-[40rem] h-[40rem] bg-indigo-600/10 rounded-full mix-blend-screen filter blur-[120px] animate-float-complex pointer-events-none" />
      <div className="absolute top-1/2 -right-20 w-[30rem] h-[30rem] bg-amber-600/10 rounded-full mix-blend-screen filter blur-[100px] animate-float-complex pointer-events-none" style={{ animationDelay: '2s' }} />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#020617]/70 backdrop-blur-xl border-b border-white/5 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20 ring-1 ring-white/20 transform transition-transform hover:scale-105">
              <Flame className="w-6 h-6 text-white drop-shadow-md" />
            </div>
            <div>
              <h1 className="text-base font-extrabold text-white leading-tight tracking-tight">FireBot Nexus</h1>
              <p className="text-xs text-amber-400 leading-tight font-semibold">Guest Override (AP Mode)</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border backdrop-blur-md ${isConnected ? 'bg-green-500/10 text-green-400 border-green-500/30 shadow-[0_0_10px_rgba(34,197,94,0.2)]' : 'bg-white/5 text-slate-400 border-white/10'}`}>
              {isConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
              {isConnected ? 'Connected' : 'Disconnected'}
            </div>
            <button onClick={handleLogout} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-semibold transition-all shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Exit</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8 relative z-10">
        {/* Guest warning banner */}
        <div className="flex items-start gap-3 p-5 glass-card border border-amber-500/20 rounded-2xl">
          <div className="p-2 bg-amber-500/20 rounded-xl flex-shrink-0 mt-0.5">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <p className="text-amber-300 font-bold text-sm tracking-wide">Emergency Protocol Activated</p>
            <p className="text-amber-400/80 text-xs mt-1.5 leading-relaxed font-medium">Connect to "FireBot-AP" to begin operation.</p>
          </div>
        </div>

        {/* Connection bar */}
        <div className="glass-panel p-5 flex flex-col sm:flex-row items-start sm:items-center gap-5 rounded-3xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          
          <div className="flex items-center gap-4 flex-1">
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
              <Bot className="w-6 h-6 text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
            </div>
            <div>
              <p className="text-sm font-bold text-white tracking-wide">Local Access Mode</p>
              <p className="text-xs text-slate-400 font-mono mt-0.5">WiFi: FireBot-AP</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            {!isConnected ? (
                <button
                  onClick={handleConnect}
                  disabled={isConnecting}
                  className="px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold text-sm rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(245,158,11,0.3)] flex items-center justify-center gap-2"
                >
                  <span className="relative z-10 flex items-center gap-2">{isConnecting ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Connecting…</> : 'Connect to Bot'}</span>
                </button>
            ) : (
              <button 
                onClick={handleDisconnect} 
                className="px-8 py-3 bg-red-900/50 text-red-400 border border-red-500/50 hover:bg-red-900/80 shadow-[0_0_15px_rgba(239,68,68,0.2)] font-bold text-sm rounded-xl transition-all"
              >
                Disconnect
              </button>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ControlPanelWiFi onCommand={handleCommand} pumpStatus={sensorData.pumpStatus} disabled={!isConnected} />
          <StatusPanelWiFi sensorData={{ fire: sensorData.fireDetected, pump: sensorData.pumpStatus }} isConnected={isConnected} />
        </div>
      </main>
    </div>
  );
};
