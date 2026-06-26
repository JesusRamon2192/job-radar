import React from 'react';
import { Github, Twitter, Mail, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-800 bg-slate-900/50 mt-12 py-8 text-sm">
      <div className="container mx-auto px-4 max-w-6xl min-[1600px]:max-w-[1536px]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Brand & Description */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              DevLATAM
            </h2>
            <p className="text-slate-400">
              Un motor de búsqueda y agregador de vacantes diseñado para ayudar a desarrolladores en LATAM a encontrar su trabajo ideal basándose en la compatibilidad de habilidades.
            </p>
            <p className="text-slate-500 flex items-center gap-1">
              Hecho con <Heart className="w-3 h-3 text-rose-500 fill-rose-500/20" />.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-200">Enlaces Útiles</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-slate-400 hover:text-indigo-400 transition-colors">Términos y Condiciones</a>
              </li>
              <li>
                <a href="#" className="text-slate-400 hover:text-indigo-400 transition-colors">Políticas de Privacidad</a>
              </li>
              <li>
                <a href="#" className="text-slate-400 hover:text-indigo-400 transition-colors">Aviso de Cookies</a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-200">Contacto</h3>
            <div className="flex gap-4">
              <a href="https://github.com/JesusRamon2192/job-radar" target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 rounded-lg text-slate-400 hover:text-white transition-all">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 rounded-lg text-slate-400 hover:text-[#1DA1F2] transition-all">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="mailto:contacto@devlatam.com" className="p-2 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 rounded-lg text-slate-400 hover:text-emerald-400 transition-all">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

        </div>

        <div className="mt-8 pt-8 border-t border-slate-800/50 text-center text-slate-500 text-xs">
          <p>© {new Date().getFullYear()} DevLATAM. Todos los derechos reservados. Las ofertas de trabajo son propiedad de sus respectivas plataformas originales.</p>
        </div>
      </div>
    </footer>
  );
};
