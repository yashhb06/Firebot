import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame, Wifi, WifiOff, LogOut, Settings, Bot } from 'lucide-react';
import { ControlPanelWiFi } from '../components/ControlPanelWiFi';
import { StatusPanelWiFi } from '../components/StatusPanelWiFi';
import { WiFiSettingsModal } from '../components/WiFiSettingsModal';
import { NotificationBell } from '../components/NotificationBell';
import { FireAlert } from '../components/FireAlert';
import { rtdbService, type SensorData } from '../services/rtdbService';
import { websocketService } from '../services/wifiService';
import { authService } from '../services/authService';
import { subscribeToFireEvents, addFireEvent, FireEvent, subscribeToUnreadCount } from '../services/firestoreService';
import { requestNotificationPermission, showFireNotification } from '../services/notificationService';

export const OwnerDashboard: React.FC = () => {
  const navigate = useNavigate();

  // Connection state
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [botId, setBotId] = useState('FIREBOT_001');
  const [showBotModal, setShowBotModal] = useState(false);
  const [tempBotId, setTempBotId] = useState('FIREBOT_001');
  const [showWiFiSettings, setShowWiFiSettings] = useState(false);
  const [connectError, setConnectError] = useState('');

  // Sensor & fire state
  const [sensorData, setSensorData] = useState<SensorData & { manualMode?: boolean }>({ fireDetected: false, pumpStatus: false });
  const [showFireAlert, setShowFireAlert] = useState(false);
  const prevFireRef = useRef(false);

  // Firestore
  const [fireEvents, setFireEvents] = useState<FireEvent[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Request notification permission on mount
  useEffect(() => { requestNotificationPermission(); }, []);

  // Register wifiService callbacks for real-time local HTTP status
  useEffect(() => {
    websocketService.onSensorData((data: any) => {
      setSensorData(prev => ({
        ...prev,
        fireDetected: data.fire,
        pumpStatus: data.pump,
        manualMode: data.manualMode,
      }));
    });
    websocketService.onConnectionChange((connected: boolean) => {
      setIsConnected(connected);
      if (!connected) setSensorData({ fireDetected: false, pumpStatus: false });
    });
  }, []);

  // Subscribe to Firestore
  useEffect(() => {
    const unsub1 = subscribeToFireEvents(setFireEvents);
    const unsub2 = subscribeToUnreadCount(setUnreadCount);
    return () => { unsub1(); unsub2(); };
  }, []);

  // Watch sensor data and push events when fire state changes
  useEffect(() => {
    const currentFire = sensorData.fireDetected;
    if (currentFire && !prevFireRef.current) {
      // Fire just detected
      setShowFireAlert(true);
      showFireNotification('detected');
      addFireEvent('detected');
    } else if (!currentFire && prevFireRef.current) {
      // Fire just suppressed
      setShowFireAlert(false);
      showFireNotification('suppressed');
      addFireEvent('suppressed');
    }
    prevFireRef.current = currentFire;
  }, [sensorData.fireDetected]);

  /**
   * Connect: look up ESP32 IP from Firebase, then connect directly via HTTP.
   */
  const handleConnect = async () => {
    setIsConnecting(true);
    setConnectError('');
    try {
      const ip = await rtdbService.getBotIp(botId);
      websocketService.setEsp32Ip(ip);
      await websocketService.connect();
      // isConnected handled by onConnectionChange callback
    } catch (err: any) {
      setConnectError(err.message);
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    websocketService.disconnect();
    rtdbService.disconnect();
    setIsConnected(false);
    prevFireRef.current = false;
    setShowFireAlert(false);
  };

  const handleCommand = async (command: string) => {
    if (!isConnected) { alert('Please connect to a FireBot first!'); return; }
    try {
      await websocketService.sendCommand(command);
      if (command === 'P1') setSensorData(p => ({ ...p, pumpStatus: true }));
      else if (command === 'P0') setSensorData(p => ({ ...p, pumpStatus: false }));
      else if (command === 'AUTO') setSensorData(p => ({ ...p, manualMode: false }));
      else if (['F','B','L','R','S'].includes(command)) setSensorData(p => ({ ...p, manualMode: true }));
    } catch (err) { alert('Failed to send command. Check connection.'); }
  };

  const handleLogout = async () => {
    rtdbService.disconnect();
    await authService.logout();
    navigate('/login');
  };

  const applyBotId = () => {
    setBotId(tempBotId);
    setShowBotModal(false);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#020617]">
      {/* Background Animated Orbs */}
      <div className="absolute -top-40 right-0 w-[40rem] h-[40rem] bg-orange-600/10 rounded-full mix-blend-screen filter blur-[120px] animate-float-complex pointer-events-none" />
      <div className="absolute top-1/2 -left-20 w-[30rem] h-[30rem] bg-cyan-600/10 rounded-full mix-blend-screen filter blur-[100px] animate-float-complex pointer-events-none" style={{ animationDelay: '3s' }} />

      {/* Fire Alert Overlay */}
      {showFireAlert && <FireAlert onDismiss={() => setShowFireAlert(false)} />}

      {/* WiFi Settings Modal */}
      {showWiFiSettings && (
        <WiFiSettingsModal
          isOpen={showWiFiSettings}
          onClose={() => setShowWiFiSettings(false)}
          isConnected={isConnected}
        />
      )}
      {/* Bot ID Modal */}
      {showBotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md px-4">
          <div className="glass-panel-heavy rounded-[2rem] p-8 w-full max-w-sm shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10 relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-orange-500/50 to-transparent" />
            <h3 className="text-white font-bold text-xl mb-1 tracking-tight">Target Bot ID</h3>
            <p className="text-slate-400 text-xs mb-4">Enter the unique identifier painted on the FireBot.</p>
            <input
              type="text"
              value={tempBotId}
              onChange={e => setTempBotId(e.target.value.toUpperCase())}
              placeholder="FIREBOT_001"
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 font-mono text-sm focus:outline-none focus:border-orange-500 mb-4"
            />
            <div className="flex gap-3">
              <button onClick={() => setShowBotModal(false)} className="flex-1 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl text-sm font-medium transition-colors">Cancel</button>
              <button onClick={applyBotId} className="flex-1 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-sm font-bold transition-colors">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#020617]/70 backdrop-blur-xl border-b border-white/5 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/20 ring-1 ring-white/20 transform transition-transform hover:scale-105">
              <Flame className="w-6 h-6 text-white drop-shadow-md" />
            </div>
            <div>
              <h1 className="text-base font-extrabold text-white leading-tight tracking-tight">FireBot Nexus</h1>
              <p className="text-xs text-orange-400 font-medium leading-tight">Command Center</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* WiFi update button — only show when connected */}
            {isConnected && (
              <button onClick={() => setShowWiFiSettings(true)} title="Update FireBot WiFi" className="p-1.5 rounded-lg text-slate-500 hover:text-cyan-400 hover:bg-slate-800 transition-all">
                <Settings className="w-4 h-4" />
              </button>
            )}
            <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${isConnected ? 'bg-green-500/10 text-green-400 border-green-500/30' : 'bg-slate-800 text-slate-500 border-slate-700'}`}>
              {isConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
              {isConnected ? 'Bot Online' : 'Disconnected'}
            </div>
            <NotificationBell events={fireEvents} unreadCount={unreadCount} />
            <button onClick={handleLogout} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-white text-xs font-medium transition-all">
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8 relative z-10">
        {/* Connection bar */}
        <div className="glass-panel p-5 flex flex-col sm:flex-row items-start sm:items-center gap-5 rounded-3xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          
          <div className="flex items-center gap-4 flex-1">
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
              <Bot className="w-6 h-6 text-orange-400 drop-shadow-[0_0_8px_rgba(249,115,22,0.5)]" />
            </div>
            <div>
              <p className="text-sm font-bold text-white tracking-wide">Target Vehicle</p>
              <p className="text-xs text-slate-400 font-mono mt-0.5">ID: <span className="text-cyan-400">{botId}</span></p>
            </div>
            <button onClick={() => { setTempBotId(botId); setShowBotModal(true); }} className="ml-2 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all border border-transparent hover:border-white/10">
              <Settings className="w-4 h-4" />
            </button>
          </div>

          {connectError && (
            <p className="text-red-400 text-xs w-full sm:w-auto">❌ {connectError}</p>
          )}

          {!isConnected ? (
            <button
              onClick={handleConnect}
              disabled={isConnecting}
              className="w-full sm:w-auto relative group overflow-hidden px-8 py-3 rounded-xl text-sm font-bold text-white shadow-[0_0_20px_rgba(249,115,22,0.2)] transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-orange-600 via-red-500 to-orange-600 group-hover:bg-[length:200%_auto] animate-aurora transition-all duration-300" />
              <div className="relative z-10 flex flex-row items-center gap-2">
                {isConnecting ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Uplink Initiating…</> : 'Establish Secure Uplink'}
              </div>
            </button>
          ) : (
            <button onClick={handleDisconnect} className="w-full sm:w-auto px-8 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold text-sm rounded-xl border border-red-500/30 transition-all hover:shadow-[0_0_15px_rgba(239,68,68,0.2)]">
              Terminate Uplink
            </button>
          )}

          {!isConnected && (
            <button
              onClick={() => navigate('/setup')}
              className="w-full sm:w-auto px-6 py-3 border border-white/10 text-cyan-400 bg-white/5 hover:bg-white/10 font-semibold text-sm rounded-xl transition-all shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] hover:shadow-[0_0_15px_rgba(6,182,212,0.2)]"
            >
              Configure Setup (WiFi)
            </button>
          )}
        </div>

        {/* Controls Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ControlPanelWiFi onCommand={handleCommand} pumpStatus={sensorData.pumpStatus} manualMode={(sensorData as any).manualMode} disabled={!isConnected} />
          <StatusPanelWiFi sensorData={{ fire: sensorData.fireDetected, pump: sensorData.pumpStatus, manualMode: (sensorData as any).manualMode }} isConnected={isConnected} />
        </div>

        {/* Fire Event Log */}
        <div className="glass-panel p-6 rounded-3xl relative overflow-hidden group">
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          
          <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-400 drop-shadow-[0_0_5px_rgba(249,115,22,0.5)]" /> Historical Data Log
          </h2>
          {fireEvents.length === 0 ? (
            <div className="py-8 flex flex-col items-center justify-center bg-white/5 border border-white/5 rounded-2xl border-dashed">
              <p className="text-slate-400 text-sm text-center font-medium">Telemetry log is clear. Awaiting environmental data.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {fireEvents.map(evt => (
                <div key={evt.id} className={`flex items-center gap-4 px-5 py-4 rounded-2xl border ${evt.type === 'detected' ? 'bg-red-500/10 border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : 'bg-green-500/10 border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.1)]'} ${!evt.read ? 'ring-1 ring-orange-500/50' : ''} transition-all hover:scale-[1.01]`}>
                  <div className={`w-3 h-3 rounded-full flex-shrink-0 shadow-lg ${evt.type === 'detected' ? 'bg-red-500 shadow-red-500/50 animate-pulse' : 'bg-green-500 shadow-green-500/50'}`} />
                  <div className="flex-1">
                    <p className={`text-sm font-bold tracking-wide ${evt.type === 'detected' ? 'text-red-400' : 'text-green-400'}`}>
                      {evt.type === 'detected' ? '🔥 CRITICAL: FIRE DETECTED' : '✅ FIRE SUPPRESSED'}
                    </p>
                    <p className="text-xs text-slate-400 mt-1 font-mono">{evt.timestamp.toLocaleString()}</p>
                  </div>
                  {!evt.read && <span className="text-[10px] uppercase text-orange-400 font-extrabold bg-orange-500/20 px-3 py-1 rounded-full border border-orange-500/30 tracking-widest">New</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
