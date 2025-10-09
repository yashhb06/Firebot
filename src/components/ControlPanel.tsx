import React, { useState } from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Square, Droplet, Zap, Hand } from 'lucide-react';
import { COMMANDS } from '../constants/bluetooth';

interface ControlPanelProps {
  onCommand: (command: string) => void;
  pumpStatus: boolean;
  disabled: boolean;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  onCommand,
  pumpStatus,
  disabled,
}) => {
  const [isAutoMode, setIsAutoMode] = useState(false);

  const handleModeToggle = () => {
    const newMode = !isAutoMode;
    setIsAutoMode(newMode);
    
    // Send EXTINGUISH command when switching to auto mode
    if (newMode) {
      onCommand(COMMANDS.EXTINGUISH);
    } else {
      // Send STOP command when switching back to manual mode
      onCommand(COMMANDS.STOP);
    }
  };
  const buttonClass = `
    flex items-center justify-center p-8 rounded-2xl font-bold text-white
    transition-all duration-300 transform hover:scale-110 active:scale-95 
    disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100
    shadow-2xl hover:shadow-cyan-500/50 backdrop-blur-sm
    relative overflow-hidden group
  `;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Movement Controls</h2>
        
        {/* Mode Toggle Switch */}
        <div className="flex items-center gap-3">
          <span className={`text-sm font-medium transition-colors ${!isAutoMode ? 'text-cyan-400' : 'text-slate-500'}`}>
            <Hand className="w-4 h-4 inline mr-1" />
            Manual
          </span>
          <button
            onClick={handleModeToggle}
            disabled={disabled}
            className={`relative w-16 h-8 rounded-full transition-all duration-300 disabled:opacity-30 ${
              isAutoMode ? 'bg-orange-500' : 'bg-cyan-500'
            }`}
          >
            <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-lg transition-transform duration-300 ${
              isAutoMode ? 'translate-x-8' : 'translate-x-0'
            }`}></div>
          </button>
          <span className={`text-sm font-medium transition-colors ${isAutoMode ? 'text-orange-400' : 'text-slate-500'}`}>
            <Zap className="w-4 h-4 inline mr-1" />
            Auto
          </span>
        </div>
      </div>

      {/* Auto Mode Indicator */}
      {isAutoMode && (
        <div className="mb-4 p-4 bg-orange-500/20 border-2 border-orange-500/50 rounded-xl animate-pulse">
          <div className="flex items-center justify-center gap-2 text-orange-400">
            <Zap className="w-5 h-5" />
            <span className="font-bold">AUTO MODE ACTIVE - Robot is autonomous</span>
          </div>
        </div>
      )}

      {/* Movement Controls */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {/* Row 1 */}
        <div></div>
        <button
          onClick={() => onCommand(COMMANDS.FORWARD)}
          disabled={disabled || isAutoMode}
          className={`${buttonClass} bg-gradient-to-br from-slate-700 to-slate-800 hover:from-cyan-600 hover:to-cyan-700 border-2 border-slate-600 hover:border-cyan-400`}
          title="Forward"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
          <ArrowUp className="w-10 h-10 text-slate-200 group-hover:text-white relative z-10" />
        </button>
        <div></div>

        {/* Row 2 */}
        <button
          onClick={() => onCommand(COMMANDS.LEFT)}
          disabled={disabled || isAutoMode}
          className={`${buttonClass} bg-gradient-to-br from-slate-700 to-slate-800 hover:from-cyan-600 hover:to-cyan-700 border-2 border-slate-600 hover:border-cyan-400`}
          title="Left"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
          <ArrowLeft className="w-10 h-10 text-slate-200 group-hover:text-white relative z-10" />
        </button>
        <button
          onClick={() => onCommand(COMMANDS.STOP)}
          disabled={disabled || isAutoMode}
          className={`${buttonClass} bg-gradient-to-br from-red-900/60 to-red-800/40 hover:from-red-600 hover:to-red-700 border-2 border-red-500/50 hover:border-red-400`}
          title="Stop"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-400/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
          <Square className="w-10 h-10 text-red-300 group-hover:text-white relative z-10" />
        </button>
        <button
          onClick={() => onCommand(COMMANDS.RIGHT)}
          disabled={disabled || isAutoMode}
          className={`${buttonClass} bg-gradient-to-br from-slate-700 to-slate-800 hover:from-cyan-600 hover:to-cyan-700 border-2 border-slate-600 hover:border-cyan-400`}
          title="Right"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
          <ArrowRight className="w-10 h-10 text-slate-200 group-hover:text-white relative z-10" />
        </button>

        {/* Row 3 */}
        <div></div>
        <button
          onClick={() => onCommand(COMMANDS.BACKWARD)}
          disabled={disabled || isAutoMode}
          className={`${buttonClass} bg-gradient-to-br from-slate-700 to-slate-800 hover:from-cyan-600 hover:to-cyan-700 border-2 border-slate-600 hover:border-cyan-400`}
          title="Backward"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
          <ArrowDown className="w-10 h-10 text-slate-200 group-hover:text-white relative z-10" />
        </button>
        <div></div>
      </div>

      {/* Pump Control */}
      <div className="border-t border-slate-700 pt-6">
        <h3 className="text-xl font-bold text-white mb-4">Pump Control</h3>
        <button
          onClick={() => onCommand(pumpStatus ? COMMANDS.PUMP_OFF : COMMANDS.PUMP_ON)}
          disabled={disabled || isAutoMode}
          className={`
            w-full flex items-center justify-center gap-3 p-4 rounded-xl font-bold text-white
            transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed
            shadow-lg hover:shadow-xl border-2
            ${pumpStatus ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 border-green-400' : 'bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 border-slate-500'}
          `}
        >
          <Droplet className="w-6 h-6" />
          <span>{pumpStatus ? 'Pump OFF' : 'Pump ON'}</span>
        </button>
      </div>




    </div>
  );
};
