import React, { useState } from 'react';
import { Lock, AlertCircle, Eye, EyeOff, KeyRound } from 'lucide-react';
import { resetPassword } from '../api/auth';

interface ResetPasswordProps {
  token: string;
  onSuccess: () => void;
}

export const ResetPassword: React.FC<ResetPasswordProps> = ({ token, onSuccess }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setLoading(true);

    try {
      const data = await resetPassword(token, password);
      setSuccess(data.message || 'Contraseña restablecida correctamente.');
      setTimeout(() => {
        onSuccess();
      }, 2000);
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail);
      } else {
        setError('Ocurrió un error al restablecer la contraseña. Es posible que el enlace haya expirado.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" />
      
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/50 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500"></div>
        
        <div className="p-8">
          <div className="w-12 h-12 bg-slate-800/50 rounded-2xl flex items-center justify-center mb-6 border border-slate-700/50">
            <KeyRound className="w-6 h-6 text-emerald-400" />
          </div>
          
          <h2 className="text-2xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
            Crea una nueva contraseña
          </h2>
          <p className="text-slate-400 text-sm mb-6">
            Por favor ingresa tu nueva contraseña a continuación.
          </p>

          {error && (
            <div className="mb-6 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <p className="text-sm text-rose-200">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-start gap-3 animate-in fade-in">
              <AlertCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <p className="text-sm text-emerald-200">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Nueva Contraseña</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-2.5 border border-slate-700 rounded-xl bg-slate-900/50 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                  disabled={loading || !!success}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors focus:outline-none"
                  disabled={loading || !!success}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Confirmar Contraseña</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-2.5 border border-slate-700 rounded-xl bg-slate-900/50 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                  disabled={loading || !!success}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors focus:outline-none"
                  disabled={loading || !!success}
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !!success}
              className={`w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 focus:ring-offset-slate-900 transition-all ${
                loading || !!success ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : 'Guardar Contraseña'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
