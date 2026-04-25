import React from 'react';
import { Flame, Droplet, Cpu } from 'lucide-react';

interface SensorData {
  fire: boolean;
  pump: boolean;
  manualMode?: boolean;
}

interface StatusPanelWiFiProps {
  sensorData: SensorData;
  isConnected: boolean;
}

export const StatusPanelWiFi: React.FC<StatusPanelWiFiProps> = ({ sensorData, isConnected }) => {
  return (
    <div className="glass-panel p-8 rounded-3xl relative overflow-hidden group h-full">
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <h2 className="text-xl font-bold text-white mb-8 tracking-tight flex items-center gap-2">
        <div className="w-2 h-6 bg-cyan-500 rounded-full" /> System Status
      </h2>

      {/* Sensor Data */}
      <div className="space-y-5">
        {/* Fire Detection */}
        <div className={`p-6 rounded-2xl border transition-all duration-500 relative overflow-hidden group/item ${
          sensorData.fire 
            ? 'bg-gradient-to-br from-red-900/40 to-red-800/20 border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.3)]' 
            : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl transition-all duration-300 ${
                sensorData.fire ? 'bg-red-500/30 animate-pulse' : 'bg-slate-700/50'
              }`}>
                <Flame className={`w-8 h-8 transition-all duration-300 ${
                  sensorData.fire ? 'text-red-400 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]' : 'text-slate-400'
                }`} />
              </div>
              <div>
                <p className="text-base font-semibold text-white">Fire Detection</p>
                <p className="text-sm text-slate-400 mt-1">IR Flame Sensors (L/F/R)</p>
              </div>
            </div>
            <div className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
              sensorData.fire
                ? 'bg-red-500/30 text-red-300 border-2 border-red-400/50 shadow-lg shadow-red-500/30 animate-pulse'
                : 'bg-green-900/30 text-green-400 border-2 border-green-600/50'
            }`}>
              {sensorData.fire ? '🔥 FIRE!' : '✅ Clear'}
            </div>
          </div>
        </div>

        {/* Pump Status */}
        <div className={`p-6 rounded-2xl border transition-all duration-500 relative overflow-hidden group/item ${
          sensorData.pump 
            ? 'bg-gradient-to-br from-cyan-900/40 to-cyan-800/20 border-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.3)] scale-[1.02]' 
            : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl transition-all duration-300 ${
                sensorData.pump ? 'bg-cyan-500/30 animate-pulse' : 'bg-slate-700/50'
              }`}>
                <Droplet className={`w-8 h-8 transition-all duration-300 ${
                  sensorData.pump ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]' : 'text-slate-400'
                }`} />
              </div>
              <div>
                <p className="text-base font-semibold text-white">Water Pump</p>
                <p className="text-sm text-slate-400 mt-1">Extinguisher system</p>
              </div>
            </div>
            <div className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
              sensorData.pump
                ? 'bg-cyan-500/30 text-cyan-300 border-2 border-cyan-400/50 shadow-lg shadow-cyan-500/30'
                : 'bg-slate-700/50 text-slate-300 border-2 border-slate-600'
            }`}>
              {sensorData.pump ? 'Active' : 'Standby'}
            </div>
          </div>
        </div>
      </div>

      {/* Mode Status */}
      <div className={`p-6 rounded-2xl border transition-all duration-500 relative overflow-hidden group/item mt-5 ${
        sensorData.manualMode 
          ? 'bg-gradient-to-br from-amber-600/20 to-orange-600/10 border-orange-500/30 shadow-[0_0_20px_rgba(249,115,22,0.1)]' 
          : 'bg-gradient-to-br from-violet-600/20 to-purple-600/10 border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.1)]'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl transition-all duration-300 ${
              sensorData.manualMode ? 'bg-orange-500/30' : 'bg-purple-500/20'
            }`}>
              <Cpu className={`w-8 h-8 ${
                sensorData.manualMode ? 'text-orange-400' : 'text-purple-400'
              }`} />
            </div>
            <div>
              <p className="text-base font-semibold text-white">Control Mode</p>
              <p className="text-sm text-slate-400 mt-1">{sensorData.manualMode ? 'You are in control' : 'Robot is autonomous'}</p>
            </div>
          </div>
          <div className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all duration-300 ${
            sensorData.manualMode
              ? 'bg-orange-500/20 text-orange-400 border-orange-500/30'
              : 'bg-purple-500/20 text-purple-400 border-purple-500/30'
          }`}>
            {sensorData.manualMode ? '🕹️ Manual' : '🤖 AUTO'}
          </div>
        </div>
      </div>

      {/* Info Box */}
      {!isConnected && (
        <div className="mt-6 p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
          <p className="text-xs text-slate-400">
            Connect your device to <strong className="text-white">FireBot-AP</strong> WiFi first, then click Connect.<br/>
            Default IP: <strong className="text-cyan-400">192.168.4.1</strong>
          </p>
        </div>
      )}
    </div>
  );
};
