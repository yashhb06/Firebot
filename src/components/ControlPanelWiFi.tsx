import React from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Square, Droplet } from 'lucide-react';

interface ControlPanelWiFiProps {
  onCommand: (command: string) => void;
  pumpStatus: boolean;
  manualMode?: boolean;
  disabled: boolean;
}

export const ControlPanelWiFi: React.FC<ControlPanelWiFiProps> = ({
  onCommand,
  pumpStatus,
  manualMode,
  disabled,
}) => {
  const buttonClass = `
    glass-button flex items-center justify-center p-8 rounded-2xl font-bold text-white
    active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed
  `;

  return (
    <div className="glass-panel p-8 rounded-3xl relative overflow-hidden group h-full">
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <h2 className="text-xl font-bold text-white mb-8 tracking-tight flex items-center gap-2">
        <div className="w-2 h-6 bg-orange-500 rounded-full" /> Tactical Commands
      </h2>

      {/* Movement Controls */}
      {/* Movement Controls */}
      <div className="grid grid-cols-3 gap-5 mb-8">
        {/* Row 1 */}
        <div></div>
        <button
          onClick={() => onCommand('F')}
          disabled={disabled}
          className={`${buttonClass} bg-cyan-900/10 hover:bg-cyan-500/20 border-cyan-500/30 hover:border-cyan-400 group/btn shadow-[0_0_15px_rgba(6,182,212,0.1)] hover:shadow-[0_0_25px_rgba(6,182,212,0.3)]`}
          title="Forward"
        >
          <ArrowUp className="w-8 h-8 text-cyan-400 group-hover/btn:text-white drop-shadow-md transition-colors" />
        </button>
        <div></div>

        {/* Row 2 */}
        <button
          onClick={() => onCommand('L')}
          disabled={disabled}
          className={`${buttonClass} bg-cyan-900/10 hover:bg-cyan-500/20 border-cyan-500/30 hover:border-cyan-400 group/btn shadow-[0_0_15px_rgba(6,182,212,0.1)] hover:shadow-[0_0_25px_rgba(6,182,212,0.3)]`}
          title="Left"
        >
          <ArrowLeft className="w-8 h-8 text-cyan-400 group-hover/btn:text-white drop-shadow-md transition-colors" />
        </button>
        <button
          onClick={() => onCommand('S')}
          disabled={disabled}
          className={`flex items-center justify-center p-8 rounded-2xl font-bold text-white
            transition-all duration-300 transform hover:scale-110 active:scale-95 
            disabled:opacity-30 disabled:cursor-not-allowed
            bg-red-600/20 hover:bg-red-500/30 border border-red-500/50 hover:border-red-400
            shadow-[0_0_20px_rgba(239,68,68,0.2)] hover:shadow-[0_0_30px_rgba(239,68,68,0.4)]
            relative overflow-hidden group/btn`}
          title="Stop"
        >
          <Square className="w-8 h-8 text-red-500 group-hover/btn:text-red-300 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)] transition-colors" />
        </button>
        <button
          onClick={() => onCommand('R')}
          disabled={disabled}
          className={`${buttonClass} bg-cyan-900/10 hover:bg-cyan-500/20 border-cyan-500/30 hover:border-cyan-400 group/btn shadow-[0_0_15px_rgba(6,182,212,0.1)] hover:shadow-[0_0_25px_rgba(6,182,212,0.3)]`}
          title="Right"
        >
          <ArrowRight className="w-8 h-8 text-cyan-400 group-hover/btn:text-white drop-shadow-md transition-colors" />
        </button>

        {/* Row 3 */}
        <div></div>
        <button
          onClick={() => onCommand('B')}
          disabled={disabled}
          className={`${buttonClass} bg-cyan-900/10 hover:bg-cyan-500/20 border-cyan-500/30 hover:border-cyan-400 group/btn shadow-[0_0_15px_rgba(6,182,212,0.1)] hover:shadow-[0_0_25px_rgba(6,182,212,0.3)]`}
          title="Backward"
        >
          <ArrowDown className="w-8 h-8 text-cyan-400 group-hover/btn:text-white drop-shadow-md transition-colors" />
        </button>
        <div></div>
      </div>

      {/* Pump Control */}
      {/* Pump Control */}
      <div className="border-t border-white/5 pt-6">
        <button
          onClick={() => onCommand(pumpStatus ? 'P0' : 'P1')}
          disabled={disabled}
          className={`
            w-full flex items-center justify-center gap-4 py-4 rounded-xl font-bold border active:scale-[0.98]
            transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed
            ${pumpStatus 
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)] animate-pulse' 
              : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10 hover:border-cyan-500/50 hover:text-cyan-400'}
          `}
        >
          <Droplet className={`w-5 h-5 ${pumpStatus ? 'drop-shadow-[0_0_8px_rgba(6,182,212,1)]' : ''}`} />
          <span>{pumpStatus ? 'SYSTEM ACTIVE — DEACTIVATE PUMP' : 'INITIATE SUPPRESSION PUMP'}</span>
        </button>
      </div>

      {/* Mode Toggle */}
      {/* Mode Toggle */}
      <div className="pt-4 mt-2">
        <button
          onClick={() => onCommand(manualMode ? 'AUTO' : 'F')}
          disabled={disabled}
          className={`
            w-full flex items-center justify-center gap-3 py-3 rounded-xl font-bold border active:scale-[0.98]
            transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed text-xs tracking-wider uppercase
            ${manualMode
              ? 'bg-purple-500/10 text-purple-400 border-purple-500/30 hover:bg-purple-500/20'
              : 'bg-orange-500/10 text-orange-400 border-orange-500/30 hover:bg-orange-500/20'}
          `}
          title={manualMode ? 'Switch to Autonomous Mode' : 'Currently in AUTO mode'}
        >
          {manualMode ? 'Switch to Autonomous AI' : 'Override to Manual Control'}
        </button>
      </div>
    </div>
  );
};
