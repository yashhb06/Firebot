import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame, Wifi, WifiOff, LogOut, AlertTriangle, Bot, Settings } from 'lucide-react';
import { StatusPanelWiFi } from '../components/StatusPanelWiFi';
import { ControlPanelWiFi } from '../components/ControlPanelWiFi';
import { rtdbService, type SensorData } from '../services/rtdbService';
import { apiService } from '../services/apiService';
import { authService } from '../services/authService';

export const GuestDashboard: React.FC = () => {
  const navigate = useNavigate();

  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [botId, setBotId] = useState(''); 
  const [showBotModal, setShowBotModal] = useState(false);
  const [tempBotId, setTempBotId] = useState('');
  const [sensorData, setSensorData] = useState<SensorData>({ fireDetected: false, pumpStatus: false });
  const [isLocalOverride, setIsLocalOverride] = useState(false);

  useEffect(() => {
    rtdbService.onSensorData((data: SensorData) => setSensorData(data));
    rtdbService.onConnectionChange((connected: boolean) => setIsConnected(connected));
  }, []);

  const handleConnect = async () => {
    if (!botId) {
       setShowBotModal(true);
       return;
    }
    setIsConnecting(true);
    try {
      await rtdbService.connectToBot(botId);
    } catch (err: any) {
      alert(`Connection failed: ${err.message}`);
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    if (isLocalOverride) {
      setIsLocalOverride(false);
      setIsConnected(false);
      return;
    }
    rtdbService.disconnect();
    setIsConnected(false);
  };

  const handleCommand = async (command: string) => {
    if (isLocalOverride) {
      const success = await apiService.sendCommand(command);
      if (!success) alert('Local override failed. Are you connected to the FIREBOT_... WiFi network?');
      if (command === 'P1') setSensorData(p => ({ ...p, pumpStatus: true }));
      else if (command === 'P0') setSensorData(p => ({ ...p, pumpStatus: false }));
      return;
    }

    if (!isConnected) { alert('Please connect to a FireBot first!'); return; }
    try {
      await rtdbService.sendCommand(command);
      if (command === 'P1') setSensorData(p => ({ ...p, pumpStatus: true }));
      else if (command === 'P0') setSensorData(p => ({ ...p, pumpStatus: false }));
    } catch { alert('Failed to send command to the cloud.'); }
  };

  const enableLocalOverride = async () => {
    setIsConnecting(true);
    const reachable = await apiService.checkConnection();
    setIsConnecting(false);

    if (reachable) {
      setIsLocalOverride(true);
      setIsConnected(true);
      alert('Local Override Activated! Commands will be sent directly to the bot bypassing the internet.');
    } else {
      alert('Could not reach the bot locally. You MUST connect your phone to the "FIREBOT_..." WiFi network in your system settings first!');
    }
  };

  const handleLogout = async () => {
    rtdbService.disconnect();
    await authService.logout();
    navigate('/login');
  };

  const applyBotId = () => {
    setBotId(tempBotId);
    setShowBotModal(false);
    // Auto-connect after applying if they entered an ID
    if (tempBotId) {
       handleConnect();
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#020617]">
      {/* Background Animated Orbs */}
      <div className="absolute -top-40 left-0 w-[40rem] h-[40rem] bg-indigo-600/10 rounded-full mix-blend-screen filter blur-[120px] animate-float-complex pointer-events-none" />
      <div className="absolute top-1/2 -right-20 w-[30rem] h-[30rem] bg-amber-600/10 rounded-full mix-blend-screen filter blur-[100px] animate-float-complex pointer-events-none" style={{ animationDelay: '2s' }} />

      {/* Bot ID Modal */}
      {showBotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md px-4">
          <div className="glass-panel-heavy rounded-[2rem] p-8 w-full max-w-sm shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10 relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
            <h3 className="text-white font-bold text-xl mb-1 tracking-tight">Enter Bot ID</h3>
            <p className="text-slate-400 text-xs mb-4">You can find this on the sticker attached to the robot.</p>
            <input
              type="text" value={tempBotId} onChange={e => setTempBotId(e.target.value.toUpperCase())}
              placeholder="e.g. FIREBOT_001"
              className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white placeholder-slate-500 font-mono text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 mb-4 uppercase backdrop-blur-sm transition-all"
            />
            <div className="flex gap-3">
              <button onClick={() => setShowBotModal(false)} className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 rounded-xl text-sm font-medium transition-all">Cancel</button>
              <button onClick={applyBotId} className="flex-1 py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.4)] rounded-xl text-sm font-bold transition-all transform hover:scale-[1.02] active:scale-[0.98]">Connect</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#020617]/70 backdrop-blur-xl border-b border-white/5 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20 ring-1 ring-white/20 transform transition-transform hover:scale-105">
              <Flame className="w-6 h-6 text-white drop-shadow-md" />
            </div>
            <div>
              <h1 className="text-base font-extrabold text-white leading-tight tracking-tight">FireBot Nexus</h1>
              <p className="text-xs text-amber-400 leading-tight font-semibold">Guest Override</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border backdrop-blur-md ${isConnected ? 'bg-green-500/10 text-green-400 border-green-500/30 shadow-[0_0_10px_rgba(34,197,94,0.2)]' : 'bg-white/5 text-slate-400 border-white/10'}`}>
              {isConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
              {isConnected ? 'Bot Online' : 'Disconnected'}
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
        <div className="flex items-start gap-3 p-5 glass-card border border-amber-500/20 rounded-2xl transform transition-all hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(245,158,11,0.1)]">
          <div className="p-2 bg-amber-500/20 rounded-xl flex-shrink-0 mt-0.5 shadow-[0_0_10px_rgba(245,158,11,0.3)]">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <p className="text-amber-300 font-bold text-sm tracking-wide">Emergency Protocol Activated</p>
            <p className="text-amber-400/80 text-xs mt-1.5 leading-relaxed font-medium">You have temporary tactical override access to FireBot. Notification feeds are disabled in guest mode.</p>
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
              <p className="text-sm font-bold text-white tracking-wide">Target Vehicle</p>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                {isLocalOverride ? 'NO CLOUD LINK (LOCAL)' : (botId ? `ID: ${botId}` : 'No bot provisioned')}
              </p>
            </div>
            {!isLocalOverride && (
              <button onClick={() => { setTempBotId(botId); setShowBotModal(true); }} className="ml-2 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all border border-transparent hover:border-white/10">
                <Settings className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            {!isConnected ? (
              <>
                <button
                  onClick={handleConnect}
                  disabled={isConnecting}
                  className="px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold text-sm rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(245,158,11,0.3)] flex items-center justify-center gap-2 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 group-hover:bg-[length:200%_auto] animate-aurora transition-all duration-300 opacity-0 group-hover:opacity-100" />
                  <span className="relative z-10 flex items-center gap-2">{isConnecting ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Establishing…</> : 'Establish Cloud Uplink'}</span>
                </button>
                <button
                  onClick={enableLocalOverride}
                  title="Use if internet is down and you're connected to the bot's WiFi directly"
                  className="px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold border border-red-500/30 rounded-xl text-xs transition-all flex items-center justify-center gap-2 hover:shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                >
                  <AlertTriangle className="w-4 h-4 text-red-400 animate-pulse" /> NO INTERNET PROTOCOL
                </button>
              </>
            ) : (
              <button 
                onClick={handleDisconnect} 
                className={`px-8 py-3 font-bold text-sm rounded-xl border transition-all ${
                  isLocalOverride ? 'bg-red-900/50 text-red-400 border-red-500/50 hover:bg-red-900/80 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'bg-white/5 hover:bg-white/10 text-slate-200 border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]'
                }`}
              >
                {isLocalOverride ? 'Terminate Override' : 'Disconnect'}
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
