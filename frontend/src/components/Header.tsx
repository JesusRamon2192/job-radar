import React, { useState } from 'react';
import { Radar, Activity, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AuthModal } from './AuthModal';
import { SupportModal } from './SupportModal';

interface HeaderProps {
  lastUpdated: string | null;
  onAnalyzeScore?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ lastUpdated, onAnalyzeScore }) => {
  const { user, logout } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');

  const openAuth = (tab: 'login' | 'register') => {
    setAuthTab(tab);
    setIsAuthModalOpen(true);
  };

  return (
    <>
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

          <div className="flex items-center gap-4 sm:gap-6">
            {lastUpdated && (
              <div className="text-xs text-slate-400 hidden lg:block">
                Última actualización: {new Date(lastUpdated).toLocaleTimeString()}
              </div>
            )}
            
            {onAnalyzeScore && (
              <button
                onClick={onAnalyzeScore}
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 border border-indigo-400/20"
              >
                <Activity className="w-4 h-4" />
                <span>Análisis de Score</span>
              </button>
            )}
            
            <button
              onClick={() => setIsSupportModalOpen(true)}
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-800/80 hover:bg-slate-700/80 text-rose-300 hover:text-rose-200 text-sm font-medium rounded-xl transition-all border border-rose-500/20 hover:border-rose-500/40 hover:shadow-lg hover:shadow-rose-500/10"
            >
              <span>Donaciones ☕</span>
            </button>

            <div className="h-6 w-px bg-slate-700 hidden sm:block"></div>

            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm text-slate-300 bg-slate-800/50 border border-slate-700/50 px-3 py-1.5 rounded-full">
                  <User className="w-4 h-4 text-indigo-400" />
                  <span className="hidden sm:inline">{user.email.split('@')[0]}</span>
                </div>
                <button
                  onClick={logout}
                  className="p-2 text-slate-400 hover:text-rose-400 transition-colors"
                  title="Cerrar Sesión"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openAuth('login')}
                  className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
                >
                  Entrar
                </button>
                <button
                  onClick={() => openAuth('register')}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-sm font-medium rounded-xl transition-all"
                >
                  Registro
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        defaultTab={authTab} 
      />
      
      <SupportModal 
        isOpen={isSupportModalOpen}
        onClose={() => setIsSupportModalOpen(false)}
      />
    </>
  );
};

