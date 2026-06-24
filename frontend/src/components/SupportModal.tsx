import React from 'react';
import { Heart, Coffee, ExternalLink, X, Mail } from 'lucide-react';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupportModal: React.FC<SupportModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div 
        className="bg-slate-900 border border-slate-700/50 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800/50 bg-slate-800/20">
          <h2 className="text-xl font-bold flex items-center gap-2 text-white">
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500/20" />
            Apoyar al Proyecto
          </h2>
          <button 
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="text-center space-y-2">
            <p className="text-slate-300">
              DevLATAM es una herramienta gratuita mantenida por la comunidad. Si te ha ayudado a encontrar tu próximo trabajo o a mejorar tu perfil, considera apoyarnos para mantener los servidores funcionando.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <a 
              href="https://ko-fi.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 bg-[#FF5E5B]/10 hover:bg-[#FF5E5B]/20 border border-[#FF5E5B]/20 rounded-xl transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#FF5E5B]/20 rounded-lg text-[#FF5E5B]">
                  <Coffee className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-slate-100 group-hover:text-white transition-colors">Invítanos un Café</h3>
                  <p className="text-xs text-slate-400">A través de Ko-fi</p>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-[#FF5E5B] transition-colors" />
            </a>

            <a 
              href="https://paypal.me/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 bg-[#00457C]/20 hover:bg-[#00457C]/40 border border-[#0079C1]/30 rounded-xl transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#0079C1]/20 rounded-lg text-[#0079C1]">
                  <span className="font-bold text-lg leading-none italic">P</span>
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-slate-100 group-hover:text-white transition-colors">Donación Vía PayPal</h3>
                  <p className="text-xs text-slate-400">Contribución directa</p>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-[#0079C1] transition-colors" />
            </a>
          </div>

          <div className="pt-4 border-t border-slate-800/50">
            <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
              <Mail className="w-4 h-4 text-slate-400" />
              Sugerencias y Contacto
            </h3>
            <p className="text-sm text-slate-400 mb-3">
              ¿Tienes ideas para mejorar DevLATAM o encontraste un error?
            </p>
            <a 
              href="mailto:contacto@devlatam.com" 
              className="block w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 text-center text-sm font-medium rounded-xl transition-colors border border-slate-700"
            >
              Escríbenos un correo
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
