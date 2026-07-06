import React, { useState, useRef, useEffect } from 'react';
import { User, LogOut, Settings, HelpCircle, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface UserDropdownProps {
  onOpenProfile: (tab: 'account' | 'radar' | 'preferences') => void;
}

export const UserDropdown: React.FC<UserDropdownProps> = ({ onOpenProfile }) => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const openProfile = (tab: 'account' | 'radar' | 'preferences') => {
    setIsOpen(false);
    onOpenProfile(tab);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!user) return null;

  const username = user.email.split('@')[0];
  const initial = username.charAt(0).toUpperCase();

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-sm text-slate-300 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 hover:border-slate-600 px-2 py-1.5 rounded-full transition-all"
      >
        <div className="w-7 h-7 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-inner">
          {initial}
        </div>
        <span className="hidden sm:inline font-medium pl-1">{username}</span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 pr-1 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl bg-slate-800 border border-slate-700 shadow-xl overflow-hidden z-[100] transform opacity-100 scale-100 transition-all origin-top-right">
          <div className="p-4 border-b border-slate-700/50 bg-slate-800/80">
            <p className="text-sm font-medium text-white truncate" title={user.email}>{user.email}</p>
            <p className="text-xs text-slate-400 mt-1 capitalize">{user.is_admin ? 'Administrador' : 'Usuario'}</p>
          </div>
          
          <div className="p-1.5">
            <button
              onClick={() => openProfile('account')}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
            >
              <User className="w-4 h-4 text-indigo-400" />
              <span>Mi Perfil</span>
            </button>
            <button
              onClick={() => openProfile('radar')}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
            >
              <Settings className="w-4 h-4 text-cyan-400" />
              <span>Radar de Skills</span>
            </button>
            <button
              onClick={() => openProfile('preferences')}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
            >
              <Settings className="w-4 h-4 text-slate-400" />
              <span>Configuración</span>
            </button>
            <button
              onClick={() => { setIsOpen(false); /* TODO: Help */ }}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
            >
              <HelpCircle className="w-4 h-4 text-emerald-400" />
              <span>Ayuda</span>
            </button>
          </div>

          <div className="p-1.5 border-t border-slate-700/50">
            <button
              onClick={() => {
                setIsOpen(false);
                logout();
              }}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
