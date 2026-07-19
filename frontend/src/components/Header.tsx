import React, { useState } from 'react';
import { Radar, Activity, User, Clock, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AuthModal } from './AuthModal';
import { SupportModal } from './SupportModal';
import { UserDropdown } from './UserDropdown';
import { ProfileModal } from './ProfileModal';
import { useNavigate, Link } from 'react-router-dom';

interface HeaderProps {
  lastUpdated: string | null;
}

export const Header: React.FC<HeaderProps> = ({ lastUpdated }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileTab, setProfileTab] = useState<'account' | 'radar' | 'preferences'>('account');

  const openAuth = (tab: 'login' | 'register') => {
    setAuthTab(tab);
    setIsAuthModalOpen(true);
  };

  return (
    <>
      <header className="dev-radar-header sticky top-0 z-[100] w-full border-b border-slate-800 bg-slate-900/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between header-content">
          <Link to="/" className="flex items-center gap-2 logo-container cursor-pointer">
            <div className="bg-indigo-500/20 p-2 rounded-xl text-indigo-400 logo-icon">
              <Radar className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent logo-text">
              DevLATAM
            </h1>
          </Link>

          <div className="flex items-center gap-4 sm:gap-6">
            {lastUpdated && lastUpdated !== 'Never' && !isNaN(new Date(lastUpdated).getTime()) && (
              <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/50 border border-slate-700/50 rounded-full text-xs font-medium text-slate-300 shadow-sm hover:bg-slate-800/80 transition-colors">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                <span>
                  Actualizado: <span className="text-slate-100">{new Date(lastUpdated).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })} a las {new Date(lastUpdated).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
                </span>
              </div>
            )}
            
            <button
              onClick={() => navigate('/score')}
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 border border-indigo-400/20"
            >
              <Activity className="w-4 h-4" />
              <span>Análisis de Score</span>
            </button>
            
            <button
              onClick={() => navigate('/market')}
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-800/80 hover:bg-slate-700/80 text-emerald-400 hover:text-emerald-300 text-sm font-medium rounded-xl transition-all border border-emerald-500/20 hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-500/10"
            >
              <TrendingUp className="w-4 h-4" />
              <span>Mercado</span>
            </button>

            {user && (user.email === 'jesus.ramon2192@gmail.com' || user.is_admin) && (
              <button
                onClick={() => navigate('/admin')}
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-xl transition-all border border-slate-700"
              >
                <User className="w-4 h-4" />
                <span>Admin</span>
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
              <UserDropdown onOpenProfile={(tab) => {
                setProfileTab(tab);
                setIsProfileModalOpen(true);
              }} />
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

      <ProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
        defaultTab={profileTab} 
      />
    </>
  );
};

