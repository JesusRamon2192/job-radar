import React, { useState, useEffect } from 'react';
import { Mail, CheckCircle, ArrowRight, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AuthModal } from './AuthModal';

export const RegistrationBanner: React.FC = () => {
  const { user } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const [isVisible, setIsVisible] = useState(() => {
    return localStorage.getItem('hasSeenSubscriptionSuccess') !== 'true';
  });

  // Check if user is logged in and doesn't explicitly have email_alerts turned off
  const isSubscribed = user && (user.profile_config?.email_alerts !== false);

  useEffect(() => {
    if (isSubscribed && isVisible) {
      // Mark as seen so it won't appear on subsequent reloads
      localStorage.setItem('hasSeenSubscriptionSuccess', 'true');
      
      // Auto-hide after a few seconds for better UX
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isSubscribed, isVisible]);

  if (isSubscribed) {
    if (!isVisible) return null;

    return (
      <div className="w-full bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 mb-6 flex items-center justify-between gap-3 animate-in fade-in duration-500 shadow-sm">
        <div className="flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <p className="text-sm text-emerald-100/90 font-medium">
            ✅ Ya estás suscrito. Te enviaremos nuevas vacantes a tu correo registrado.
          </p>
        </div>
        <button 
          onClick={() => setIsVisible(false)}
          className="text-emerald-500 hover:text-emerald-400 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="w-full bg-slate-800/60 border border-slate-700/50 hover:border-indigo-500/30 rounded-2xl p-4 sm:p-5 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-500 transition-colors shadow-sm relative overflow-hidden group">
        {/* Subtle background glow */}
        <div className="absolute -left-20 -top-20 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none transition-opacity group-hover:opacity-100 opacity-70"></div>

        <div className="flex items-center gap-4 z-10 w-full sm:w-auto">
          <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0 border border-indigo-500/30">
            <Mail className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-slate-200 font-semibold flex items-center gap-2 text-base">
              📬 Registrate
            </h3>
            <p className="text-slate-400 text-sm mt-0.5">
              Regístrate gratis y recibe por correo las nuevas vacantes.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAuthModalOpen(true)}
          className="z-10 w-full sm:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 hover:scale-105 active:scale-95"
        >
          Registrarme
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        defaultTab="register"
      />
    </>
  );
};
