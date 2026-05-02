import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame, Wifi, WifiOff, LogOut, Settings, Bot } from 'lucide-react';
import { ControlPanelWiFi } from '../components/ControlPanelWiFi';
import { StatusPanelWiFi } from '../components/StatusPanelWiFi';
import { FireAlert } from '../components/FireAlert';
import { rtdbService, type SensorData } from '../services/rtdbService';
import { websocketService } from '../services/wifiService';
import { authService } from '../services/authService';
import { showFireNotification, requestNotificationPermission } from '../services/notificationService';

export const OwnerDashboard: React.FC = () => {
  const navigate = useNavigate();

  // Connection state
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectError, setConnectError] = useState('');
  
  // Local operation log
  const [commandLogs, setCommandLogs] = useState<{ id: string; command: string; timestamp: Date }[]>([]);

  // Sensor & fire state
  const [sensorData, setSensorData] = useState<SensorData & { manualMode?: boolean }>({ fireDetected: false, pumpStatus: false });
  const [showFireAlert, setShowFireAlert] = useState(false);
  const prevFireRef = useRef(false);

  // Session Log (Fire events)
  const [fireEvents, setFireEvents] = useState<{ id: string; type: 'detected' | 'suppressed'; timestamp: Date }[]>([]);

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

  // Subscribe to local sensor stream (already handled in websocketService effect)
  // No longer using Firestore for logs in simple AP mode

  // Watch sensor data and push events when fire state changes
  useEffect(() => {
    const currentFire = sensorData.fireDetected;
    if (currentFire && !prevFireRef.current) {
      // Fire just detected
      setShowFireAlert(true);
      showFireNotification('detected');
      
      setFireEvents(prev => [{
        id: Math.random().toString(36).substr(2, 9),
        type: 'detected',
        timestamp: new Date()
      }, ...prev]);
    } else if (!currentFire && prevFireRef.current) {
      // Fire just suppressed
      setShowFireAlert(false);
      showFireNotification('suppressed');
      
      setFireEvents(prev => [{
        id: Math.random().toString(36).substr(2, 9),
        type: 'suppressed',
        timestamp: new Date()
      }, ...prev]);
    }
    prevFireRef.current = currentFire;
  }, [sensorData.fireDetected]);

  /**
   * Connect: Directly connect to the ESP32 Access Point at 192.168.4.1
   */
  const handleConnect = async () => {
    setIsConnecting(true);
    setConnectError('');
    try {
      // Default ESP32 AP IP
      const ip = '192.168.4.1';
      websocketService.setEsp32Ip(ip);
      await websocketService.connect();
      
      setCommandLogs(prev => [{
        id: Math.random().toString(36).substr(2, 9),
        command: 'Connected to FireBot AP',
        timestamp: new Date()
      }, ...prev]);
    } catch (err: any) {
      setConnectError('Could not find FireBot. Make sure you are connected to "FireBot-AP"');
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
      
      // Add to local operation log
      setCommandLogs(prev => [{
        id: Math.random().toString(36).substr(2, 9),
        command: `Remote Command: ${command}`,
        timestamp: new Date()
      }, ...prev]);

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



  return (
    <div className="min-h-screen relative overflow-hidden bg-[#020617]">
      {/* Background Animated Orbs */}
      <div className="absolute -top-40 right-0 w-[40rem] h-[40rem] bg-orange-600/10 rounded-full mix-blend-screen filter blur-[120px] animate-float-complex pointer-events-none" />
      <div className="absolute top-1/2 -left-20 w-[30rem] h-[30rem] bg-cyan-600/10 rounded-full mix-blend-screen filter blur-[100px] animate-float-complex pointer-events-none" style={{ animationDelay: '3s' }} />

      {/* Fire Alert Overlay */}
      {showFireAlert && <FireAlert onDismiss={() => setShowFireAlert(false)} />}

      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#020617]/70 backdrop-blur-xl border-b border-white/5 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/20 ring-1 ring-white/20 transform transition-transform hover:scale-105">
              <Flame className="w-6 h-6 text-white drop-shadow-md" />
            </div>
            <div>
              <h1 className="text-base font-extrabold text-white leading-tight tracking-tight">FireBot Nexus</h1>
              <p className="text-xs text-orange-400 font-medium leading-tight">Simple AP Controller</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${isConnected ? 'bg-green-500/10 text-green-400 border-green-500/30' : 'bg-slate-800 text-slate-500 border-slate-700'}`}>
              {isConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
              {isConnected ? 'Connected Locally' : 'Ready to Connect'}
            </div>
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
              <p className="text-sm font-bold text-white tracking-wide">Local Access Mode</p>
              <p className="text-xs text-slate-400 font-mono mt-0.5">WiFi: <span className="text-cyan-400">FireBot-AP</span></p>
            </div>
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
                {isConnecting ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Connecting…</> : 'Connect to FireBot'}
              </div>
            </button>
          ) : (
            <button onClick={handleDisconnect} className="w-full sm:w-auto px-8 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold text-sm rounded-xl border border-red-500/30 transition-all hover:shadow-[0_0_15px_rgba(239,68,68,0.2)]">
              Disconnect
            </button>
          )}
        </div>

        {/* Controls Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ControlPanelWiFi onCommand={handleCommand} pumpStatus={sensorData.pumpStatus} manualMode={(sensorData as any).manualMode} disabled={!isConnected} />
          <StatusPanelWiFi sensorData={{ fire: sensorData.fireDetected, pump: sensorData.pumpStatus, manualMode: (sensorData as any).manualMode }} isConnected={isConnected} />
        </div>

        {/* Log Windows Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Historical Fire Log */}
          <div className="glass-panel p-6 rounded-3xl relative overflow-hidden group">
            <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-400 drop-shadow-[0_0_5px_rgba(249,115,22,0.5)]" /> Fire Event Log
            </h2>
            {fireEvents.length === 0 ? (
              <div className="py-8 flex flex-col items-center justify-center bg-white/5 border border-white/5 rounded-2xl border-dashed">
                <p className="text-slate-400 text-sm text-center font-medium">Telemetry log is clear.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {fireEvents.map(evt => (
                  <div key={evt.id} className={`flex items-center gap-4 px-4 py-3 rounded-xl border ${evt.type === 'detected' ? 'bg-red-500/10 border-red-500/20' : 'bg-green-500/10 border-green-500/20'}`}>
                    <div className={`w-2.5 h-2.5 rounded-full ${evt.type === 'detected' ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
                    <div className="flex-1">
                      <p className={`text-xs font-bold ${evt.type === 'detected' ? 'text-red-400' : 'text-green-400'}`}>
                        {evt.type === 'detected' ? 'FIRE DETECTED' : 'FIRE SUPPRESSED'}
                      </p>
                      <p className="text-[10px] text-slate-500 font-mono">{evt.timestamp.toLocaleTimeString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Remote Operation Log */}
          <div className="glass-panel p-6 rounded-3xl relative overflow-hidden group">
            <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Bot className="w-5 h-5 text-cyan-400" /> Remote Operation Log
            </h2>
            {commandLogs.length === 0 ? (
              <div className="py-8 flex flex-col items-center justify-center bg-white/5 border border-white/5 rounded-2xl border-dashed">
                <p className="text-slate-400 text-sm text-center font-medium">No commands sent yet.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {commandLogs.map(log => (
                  <div key={log.id} className="flex items-center gap-4 px-4 py-3 rounded-xl border bg-cyan-500/5 border-cyan-500/10">
                    <div className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
                    <div className="flex-1">
                      <p className="text-xs font-bold text-cyan-400">{log.command}</p>
                      <p className="text-[10px] text-slate-500 font-mono">{log.timestamp.toLocaleTimeString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
