import React from 'react';
import { Radar } from 'lucide-react';

interface HeaderProps {
  lastUpdated: string | null;
}

export const Header: React.FC<HeaderProps> = ({ lastUpdated }) => {
  return (
    <header className="dev-radar-header sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-900/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between header-content">
        <div className="flex items-center gap-2 logo-container">
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
        </div>
      </div>
    </header>
  );
};

