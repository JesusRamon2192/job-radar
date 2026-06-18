import React from 'react';
import { Radar, RefreshCw } from 'lucide-react';

interface HeaderProps {
  onRefresh: () => void;
  isRefreshing: boolean;
  lastUpdated: string | null;
}

export const Header: React.FC<HeaderProps> = ({ onRefresh, isRefreshing, lastUpdated }) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-900/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-500/20 p-2 rounded-xl text-indigo-400">
            <Radar className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
            Job Radar
          </h1>
        </div>
        
        <div className="flex items-center gap-6">
          {lastUpdated && (
            <div className="text-xs text-slate-400 hidden sm:block">
              Última actualización: {new Date(lastUpdated).toLocaleTimeString()}
            </div>
          )}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-400 text-white text-sm font-medium rounded-lg transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Actualizando...' : 'Refresh Jobs'}
          </button>
        </div>
      </div>
    </header>
  );
};
