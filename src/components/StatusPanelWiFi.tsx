import React from 'react';
import { Flame, Droplet } from 'lucide-react';

interface SensorData {
  fire: boolean;
  pump: boolean;
}

interface StatusPanelWiFiProps {
  sensorData: SensorData;
  isConnected: boolean;
}

export const StatusPanelWiFi: React.FC<StatusPanelWiFiProps> = ({ sensorData, isConnected }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-white mb-6">System Status</h2>

      {/* Sensor Data */}
      <div className="space-y-4">
        {/* Fire Detection */}
        <div className={`p-6 rounded-2xl border-2 transition-all duration-300 hover:scale-105 animate-fade-in ${
          sensorData.fire 
            ? 'bg-gradient-to-br from-green-900/40 to-green-800/20 border-green-500/50 shadow-lg shadow-green-500/30' 
            : 'bg-gradient-to-br from-slate-800/80 to-slate-900/60 border-slate-700 hover:border-green-500/30'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl transition-all duration-300 ${
                sensorData.fire ? 'bg-green-500/30 animate-pulse' : 'bg-slate-700/50'
              }`}>
                <Flame className={`w-8 h-8 transition-all duration-300 ${
                  sensorData.fire ? 'text-green-400 drop-shadow-[0_0_8px_rgba(34,197,94,0.8)]' : 'text-slate-400'
                }`} />
              </div>
              <div>
                <p className="text-base font-semibold text-white">Fire Detection</p>
                <p className="text-sm text-slate-400 mt-1">Environmental sensor</p>
              </div>
            </div>
            <div className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
              sensorData.fire
                ? 'bg-green-500/30 text-green-300 border-2 border-green-400/50 shadow-lg shadow-green-500/30'
                : 'bg-slate-700/50 text-slate-300 border-2 border-slate-600'
            }`}>
              {sensorData.fire ? 'Safe' : 'Safe'}
            </div>
          </div>
        </div>

        {/* Pump Status */}
        <div className={`p-6 rounded-2xl border-2 transition-all duration-300 hover:scale-105 animate-fade-in ${
          sensorData.pump 
            ? 'bg-gradient-to-br from-cyan-900/40 to-cyan-800/20 border-cyan-500/50 shadow-lg shadow-cyan-500/30' 
            : 'bg-gradient-to-br from-slate-800/80 to-slate-900/60 border-slate-700 hover:border-cyan-500/30'
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

      {/* Info Box */}
      {!isConnected && (
        <div className="mt-6 p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
          <p className="text-xs text-slate-400">
            Connect to your FireBot to enable controls. Sensor data is simulated when not connected.
          </p>
        </div>
      )}
    </div>
  );
};
