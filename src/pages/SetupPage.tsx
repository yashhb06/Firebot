import React, { useState } from 'react';
import { Wifi, Bot, Key, Lock, Flame } from 'lucide-react';

/**
 * SetupPage — shown when user is connected to FireBot-AP (192.168.4.1)
 * and needs to configure Home WiFi + Bot ID for the first time.
 */
export const SetupPage: React.FC = () => {
  const [ssid, setSsid] = useState('');
  const [password, setPassword] = useState('');
  const [botId, setBotId] = useState('FIREBOT_001');
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    setErrorMsg('');

    try {
      const response = await fetch('http://192.168.4.1/api/wifi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ssid, password, botId: botId.toUpperCase() }),
      });

      if (response.ok) {
        setStatus('success');
      } else {
        throw new Error('ESP32 rejected the request. Check connection.');
      }
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err.message || 'Could not reach FireBot. Make sure you are connected to FireBot-AP WiFi.');
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-[#020617]">
      {/* Background Animated Orbs */}
      <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-orange-600/10 rounded-full mix-blend-screen filter blur-[120px] animate-float-complex pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[40rem] h-[40rem] bg-cyan-600/10 rounded-full mix-blend-screen filter blur-[120px] animate-float-complex pointer-events-none" style={{ animationDelay: '2s' }} />

      <div className="w-full max-w-md relative z-10 animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8 relative group">
          <div className="absolute inset-0 bg-gradient-to-tr from-orange-600 via-red-500 to-amber-500 rounded-full opacity-20 blur-2xl group-hover:opacity-40 transition-opacity duration-700 mx-auto w-24 h-24 pointer-events-none" />
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-tr from-orange-500 to-red-600 shadow-2xl shadow-orange-500/30 mb-6 border border-white/20 transform transition-transform group-hover:scale-105">
            <Flame className="w-10 h-10 text-white drop-shadow-md" />
          </div>
          <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight">System Initialization</h1>
          <p className="text-slate-400 text-sm font-medium">
            You are connected to <span className="text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-md border border-orange-500/20 shadow-inner">FireBot-AP</span>.<br />
            Configure your Home WiFi to bring FireBot online.
          </p>
        </div>

        {/* Floating Glass Card */}
        <div className="glass-panel-heavy rounded-[2rem] overflow-hidden relative border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-orange-500/50 to-transparent" />
          
          <div className="p-8 space-y-6">

          {/* Step indicator */}
          <div className="flex items-start gap-3 p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="p-1.5 bg-cyan-500/20 rounded-lg shrink-0">
               <Wifi className="w-4 h-4 text-cyan-400" />
            </div>
            <span className="text-cyan-300 text-xs font-medium leading-relaxed">
               Enter your Home WiFi details. The FireBot will reboot, connect to your router, and register itself on the cloud with its unique Bot ID.
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Bot ID */}
            <div>
              <label className="text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
                <Bot className="w-4 h-4 text-orange-400" /> Target Vehicle Designation
              </label>
              <input
                type="text"
                required
                value={botId}
                onChange={e => setBotId(e.target.value.toUpperCase())}
                placeholder="FIREBOT_001"
                className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white font-mono placeholder-slate-500 focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 outline-none transition-all hover:bg-white/5 backdrop-blur-sm"
              />
              <p className="text-xs text-slate-500 mt-2 font-medium">Unique ID to identify this bot in the app (e.g. FIREBOT_001)</p>
            </div>

            {/* SSID */}
            <div>
              <label className="text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
                <Wifi className="w-4 h-4 text-cyan-400" /> Network SSID
              </label>
              <input
                type="text"
                required
                value={ssid}
                onChange={e => setSsid(e.target.value)}
                placeholder="MyHomeNetwork"
                className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 outline-none transition-all hover:bg-white/5 backdrop-blur-sm"
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
                <Lock className="w-4 h-4 text-slate-400" /> Network Security Key
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Leave blank if open network"
                className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 outline-none transition-all hover:bg-white/5 backdrop-blur-sm"
              />
            </div>

            {/* Status messages */}
            {status === 'success' && (
              <div className="p-5 bg-green-500/10 border border-green-500/30 rounded-2xl animate-fade-in shadow-[inset_0_0_20px_rgba(34,197,94,0.1)]">
                <p className="text-green-400 font-bold text-sm text-center flex justify-center items-center gap-2">
                   <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" /> Uplink Transmitted
                </p>
                <p className="text-green-400/80 text-xs text-center mt-2 leading-relaxed">
                  FireBot is rebooting…<br/>Reconnect your device to your Home WiFi, then log in using Bot ID: <span className="font-mono bg-green-500/20 px-1 py-0.5 rounded text-green-300">{botId.toUpperCase()}</span>
                </p>
              </div>
            )}

            {status === 'error' && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl animate-fade-in flex items-center gap-3">
                 <div className="p-2 bg-red-500/20 rounded-lg">
                    <span className="text-red-400 text-xl leading-none">×</span>
                 </div>
                <p className="text-red-400 text-xs font-semibold">{errorMsg}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'sending' || status === 'success'}
              className="w-full relative group overflow-hidden flex justify-center items-center gap-2 py-4 px-4 rounded-xl text-base font-bold text-white shadow-[0_0_30px_rgba(249,115,22,0.3)] transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-orange-600 via-red-500 to-orange-600 group-hover:bg-[length:200%_auto] animate-aurora transition-all duration-300" />
              <div className="relative z-10 flex items-center gap-2">
                {status === 'sending' ? (
                  <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Provisioning Hardware…</>
                ) : status === 'success' ? (
                  'Connection Established'
                ) : (
                  <><Key className="w-4 h-4" /> Save Configuration & Boot</>
                )}
              </div>
            </button>
          </form>
          </div>
        </div>

        <p className="text-center text-slate-500 text-xs mt-8 font-medium">
          After setup completes, authenticate via the Owner or Emergency portal.
        </p>
      </div>
    </div>
  );
};
