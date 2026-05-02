import React, { useState } from 'react';
import { Wifi, X } from 'lucide-react';
import { websocketService } from '../services/wifiService';

interface WiFiSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isConnected: boolean;
}

export const WiFiSettingsModal: React.FC<WiFiSettingsModalProps> = ({
  isOpen,
  onClose,
  isConnected,
}) => {
  const [ssid, setSsid] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected) {
      alert("Please connect to the robot first before updating WiFi settings.");
      return;
    }
    
    setStatus('sending');
    const success = await websocketService.setWiFi(ssid, password);
    if (success) {
      setStatus('success');
      setTimeout(() => {
        onClose();
        setStatus('idle');
      }, 3000);
    } else {
      setStatus('error');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4">
      <div className="bg-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-700">
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="bg-cyan-500/20 p-2 rounded-lg">
              <Wifi className="w-6 h-6 text-cyan-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Home WiFi Setup</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-sm text-slate-400 mb-4">
            Enter your Home Router credentials. The ESP32 will reboot and attempt to connect to it. Make sure your phone/laptop is also on the same network!
          </p>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              WiFi Name (SSID)
            </label>
            <input
              type="text"
              required
              value={ssid}
              onChange={(e) => setSsid(e.target.value)}
              placeholder="MyHomeNetwork"
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              WiFi Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          {status === 'success' && (
            <div className="p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
              <p className="text-sm text-green-400 text-center font-medium">
                Saved! The robot is now rebooting. Please connect your computer back to your Home WiFi.
              </p>
            </div>
          )}

          {status === 'error' && (
            <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
              <p className="text-sm text-red-400 text-center font-medium">
                Failed to send credentials. Check connection.
              </p>
            </div>
          )}

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={status === 'sending' || status === 'success' || !isConnected}
              className="flex-1 py-2.5 px-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === 'sending' ? 'Sending...' : 'Save & Reboot'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
