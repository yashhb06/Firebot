import React from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Square, Droplet } from 'lucide-react';

interface ControlPanelWiFiProps {
  onCommand: (command: string) => void;
  pumpStatus: boolean;
  disabled: boolean;
}

export const ControlPanelWiFi: React.FC<ControlPanelWiFiProps> = ({
  onCommand,
  pumpStatus,
  disabled,
}) => {
  const buttonClass = `
    flex items-center justify-center p-8 rounded-2xl font-bold text-white
    transition-all duration-300 transform hover:scale-110 active:scale-95 
    disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100
    shadow-2xl hover:shadow-cyan-500/50 backdrop-blur-sm
    relative overflow-hidden group
  `;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-white mb-6">Movement Controls</h2>

      {/* Movement Controls */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {/* Row 1 */}
        <div></div>
        <button
          onClick={() => onCommand('F')}
          disabled={disabled}
          className={`${buttonClass} bg-gradient-to-br from-slate-700 to-slate-800 hover:from-cyan-600 hover:to-cyan-700 border-2 border-slate-600 hover:border-cyan-400`}
          title="Forward"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
          <ArrowUp className="w-10 h-10 text-slate-200 group-hover:text-white relative z-10" />
        </button>
        <div></div>

        {/* Row 2 */}
        <button
          onClick={() => onCommand('L')}
          disabled={disabled}
          className={`${buttonClass} bg-gradient-to-br from-slate-700 to-slate-800 hover:from-cyan-600 hover:to-cyan-700 border-2 border-slate-600 hover:border-cyan-400`}
          title="Left"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
          <ArrowLeft className="w-10 h-10 text-slate-200 group-hover:text-white relative z-10" />
        </button>
        <button
          onClick={() => onCommand('S')}
          disabled={disabled}
          className={`${buttonClass} bg-gradient-to-br from-red-900/60 to-red-800/40 hover:from-red-600 hover:to-red-700 border-2 border-red-500/50 hover:border-red-400 animate-pulse-glow`}
          title="Stop"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-400/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
          <Square className="w-10 h-10 text-red-300 group-hover:text-white relative z-10" />
        </button>
        <button
          onClick={() => onCommand('R')}
          disabled={disabled}
          className={`${buttonClass} bg-gradient-to-br from-slate-700 to-slate-800 hover:from-cyan-600 hover:to-cyan-700 border-2 border-slate-600 hover:border-cyan-400`}
          title="Right"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
          <ArrowRight className="w-10 h-10 text-slate-200 group-hover:text-white relative z-10" />
        </button>

        {/* Row 3 */}
        <div></div>
        <button
          onClick={() => onCommand('B')}
          disabled={disabled}
          className={`${buttonClass} bg-gradient-to-br from-slate-700 to-slate-800 hover:from-cyan-600 hover:to-cyan-700 border-2 border-slate-600 hover:border-cyan-400`}
          title="Backward"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
          <ArrowDown className="w-10 h-10 text-slate-200 group-hover:text-white relative z-10" />
        </button>
        <div></div>
      </div>

      {/* Pump Control */}
      <div className="border-t border-slate-800 pt-6">
        <button
          onClick={() => onCommand(pumpStatus ? 'P0' : 'P1')}
          disabled={disabled}
          className={`
            w-full flex items-center justify-center gap-4 p-5 rounded-2xl font-bold
            transition-all duration-300 transform hover:scale-105 active:scale-95 
            disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100
            shadow-2xl relative overflow-hidden group
            ${pumpStatus 
              ? 'bg-gradient-to-r from-cyan-600 to-cyan-700 border-2 border-cyan-400 hover:from-cyan-500 hover:to-cyan-600 shadow-cyan-500/50' 
              : 'bg-gradient-to-r from-slate-700 to-slate-800 border-2 border-slate-600 hover:border-cyan-400 hover:from-slate-600 hover:to-slate-700'}
          `}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
          <Droplet className={`w-7 h-7 relative z-10 ${pumpStatus ? 'text-white animate-pulse' : 'text-slate-300 group-hover:text-cyan-400'}`} />
          <span className={`text-base relative z-10 ${pumpStatus ? 'text-white' : 'text-slate-200 group-hover:text-white'}`}>
            Pump {pumpStatus ? 'OFF' : 'ON'}
          </span>
        </button>
      </div>


    </div>
  );
};
