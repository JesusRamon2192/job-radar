import React from 'react';
import { Radar, Activity } from 'lucide-react';

interface HeaderProps {
  lastUpdated: string | null;
  onAnalyzeScore?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ lastUpdated, onAnalyzeScore }) => {
  return (
    <header className="dev-radar-header sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-900/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between header-content">
        <div className="flex items-center gap-2 logo-container cursor-pointer" onClick={() => onAnalyzeScore && onAnalyzeScore()}>
          <div className="bg-indigo-500/20 p-2 rounded-xl text-indigo-400 logo-icon">
            <Radar className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent logo-text">
            DevLATAM
          </h1>
        </div>

        <div className="flex items-center gap-6">
          {lastUpdated && (
            <div className="text-xs text-slate-400 hidden sm:block">
              Última actualización: {new Date(lastUpdated).toLocaleTimeString()}
            </div>
          )}
          
          {onAnalyzeScore && (
            <button
              onClick={onAnalyzeScore}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 border border-indigo-400/20"
            >
              <Activity className="w-4 h-4" />
              <span className="hidden sm:inline">Análisis de Score</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

