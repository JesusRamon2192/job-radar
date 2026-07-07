import React, { useState, useEffect } from 'react';
import { X, User, Sliders, Settings, Save, Shield, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { updateProfileConfig, changePassword } from '../api/auth';

type TabType = 'account' | 'radar' | 'preferences';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: TabType;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, defaultTab = 'account' }) => {
  const { user, updateUserContext } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>(defaultTab);
  const [weights, setWeights] = useState<Record<string, number>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Personal Data State
  const [personalData, setPersonalData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    city: '',
    title: '',
    linkedin: ''
  });
  const [isSavingPersonal, setIsSavingPersonal] = useState(false);

  // Password State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Mailing Preferences State
  const [mailingPreferences, setMailingPreferences] = useState<{ enabled: boolean; keywords_include: string[] }>({
    enabled: true,
    keywords_include: []
  });
  const [newKeyword, setNewKeyword] = useState('');
  const [isSavingMailing, setIsSavingMailing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(defaultTab);
      setSaveMessage(null);
      setPasswordMessage(null);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      
      // Initialize weights
      if (user?.profile_config?.weights) {
        setWeights(user.profile_config.weights);
      }
      
      // Initialize personal data
      if (user?.profile_config?.personal_data) {
        setPersonalData({
          firstName: user.profile_config.personal_data.firstName || '',
          lastName: user.profile_config.personal_data.lastName || '',
          phone: user.profile_config.personal_data.phone || '',
          city: user.profile_config.personal_data.city || '',
          title: user.profile_config.personal_data.title || '',
          linkedin: user.profile_config.personal_data.linkedin || '',
        });
      }

      // Initialize mailing preferences
      if (user?.profile_config?.mailing_preferences) {
        setMailingPreferences({
          enabled: user.profile_config.mailing_preferences.enabled ?? true,
          keywords_include: user.profile_config.mailing_preferences.keywords_include || []
        });
      }
    }
  }, [isOpen, defaultTab, user]);

  if (!isOpen || !user) return null;

  const handleWeightChange = (category: string, value: number) => {
    setWeights(prev => ({ ...prev, [category]: value }));
  };

  const handleSaveRadar = async () => {
    setIsSaving(true);
    setSaveMessage(null);
    try {
      const newConfig = {
        ...user.profile_config,
        weights: {
          ...(user.profile_config?.weights || {}),
          ...weights
        }
      };

      const updatedUser = await updateProfileConfig(newConfig);
      updateUserContext(updatedUser);
      
      setSaveMessage({ type: 'success', text: 'Configuración guardada correctamente.' });
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      console.error("Error saving profile", error);
      setSaveMessage({ type: 'error', text: 'Error al guardar la configuración.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePersonalData = async () => {
    setIsSavingPersonal(true);
    setSaveMessage(null);
    try {
      const newConfig = {
        ...user.profile_config,
        personal_data: personalData
      };

      const updatedUser = await updateProfileConfig(newConfig);
      updateUserContext(updatedUser);
      
      setSaveMessage({ type: 'success', text: 'Datos personales actualizados correctamente.' });
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      console.error("Error saving personal data", error);
      setSaveMessage({ type: 'error', text: 'Error al actualizar los datos personales.' });
    } finally {
      setIsSavingPersonal(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordMessage(null);
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'Las nuevas contraseñas no coinciden.' });
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'La nueva contraseña debe tener al menos 6 caracteres.' });
      return;
    }

    setIsSavingPassword(true);
    try {
      await changePassword(passwordData.currentPassword, passwordData.newPassword);
      setPasswordMessage({ type: 'success', text: 'Contraseña actualizada correctamente.' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPasswordMessage(null), 4000);
    } catch (error: any) {
      console.error("Error changing password", error);
      const detail = error.response?.data?.detail || 'Error al cambiar la contraseña. Verifica tu contraseña actual.';
      setPasswordMessage({ type: 'error', text: detail });
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleSaveMailingPreferences = async () => {
    setIsSavingMailing(true);
    setSaveMessage(null);
    try {
      const newConfig = {
        ...user.profile_config,
        mailing_preferences: mailingPreferences
      };
      const updatedUser = await updateProfileConfig(newConfig);
      updateUserContext(updatedUser);
      setSaveMessage({ type: 'success', text: 'Preferencias de correo guardadas correctamente.' });
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      console.error("Error saving mailing preferences", error);
      setSaveMessage({ type: 'error', text: 'Error al actualizar las preferencias de correo.' });
    } finally {
      setIsSavingMailing(false);
    }
  };

  const addKeyword = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newKeyword.trim() !== '') {
      e.preventDefault();
      if (!mailingPreferences.keywords_include.includes(newKeyword.trim())) {
        setMailingPreferences(prev => ({
          ...prev,
          keywords_include: [...prev.keywords_include, newKeyword.trim()]
        }));
      }
      setNewKeyword('');
    }
  };

  const removeKeyword = (keywordToRemove: string) => {
    setMailingPreferences(prev => ({
      ...prev,
      keywords_include: prev.keywords_include.filter(k => k !== keywordToRemove)
    }));
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center p-4 pt-24 sm:pt-28 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden transform transition-all">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/50">
          <h2 className="text-xl font-semibold text-white">Configuración del Perfil</h2>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col sm:flex-row flex-1 overflow-hidden">
          
          {/* Sidebar Tabs */}
          <div className="w-full sm:w-64 border-b sm:border-b-0 sm:border-r border-slate-800 bg-slate-900/30 p-4 space-y-2 overflow-y-auto shrink-0 flex sm:flex-col gap-2 sm:gap-0">
            <button
              onClick={() => { setActiveTab('account'); setSaveMessage(null); }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium whitespace-nowrap ${
                activeTab === 'account' 
                  ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Mi Cuenta</span>
            </button>
            <button
              onClick={() => { setActiveTab('radar'); setSaveMessage(null); }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium whitespace-nowrap ${
                activeTab === 'radar' 
                  ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>Radar de Skills</span>
            </button>
            <button
              onClick={() => { setActiveTab('preferences'); setSaveMessage(null); }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium whitespace-nowrap ${
                activeTab === 'preferences' 
                  ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Preferencias</span>
            </button>
          </div>

          {/* Tab Panels */}
          <div className="flex-1 p-6 overflow-y-auto bg-slate-900">
            {activeTab === 'account' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div>
                  <h3 className="text-lg font-medium text-white mb-4">Información Básica</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-1">Correo Electrónico</label>
                      <input 
                        type="email" 
                        value={user.email} 
                        disabled 
                        className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-300 cursor-not-allowed opacity-70"
                      />
                      <p className="text-xs text-slate-500 mt-1">El correo electrónico no se puede cambiar actualmente.</p>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-800">
                  <h3 className="text-lg font-medium text-white mb-4">Detalles de la Cuenta</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-slate-800/30 border border-slate-700/50 p-4 rounded-xl flex items-center gap-4">
                      <div className="p-3 bg-slate-800 rounded-lg text-indigo-400">
                        <Shield className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Nivel de Acceso</p>
                        <p className="text-sm font-medium text-white capitalize">{user.is_admin ? 'Administrador' : 'Usuario Estándar'}</p>
                      </div>
                    </div>
                    <div className="bg-slate-800/30 border border-slate-700/50 p-4 rounded-xl flex items-center gap-4">
                      <div className="p-3 bg-slate-800 rounded-lg text-emerald-400">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Plan Actual</p>
                        <p className="text-sm font-medium text-white">{user.is_pro ? 'PRO' : 'Básico'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'radar' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 pb-16">
                <div>
                  <h3 className="text-lg font-medium text-white mb-1">Configuración del Radar</h3>
                  <p className="text-sm text-slate-400 mb-6">Ajusta el peso (importancia) de cada categoría para afinar cómo se evalúan las ofertas de trabajo.</p>
                  
                  {Object.keys(weights).length > 0 ? (
                    <div className="space-y-6">
                      {Object.entries(weights).map(([category, value]) => (
                        <div key={category} className="bg-slate-800/20 p-4 rounded-xl border border-slate-700/30">
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-sm font-medium text-slate-200">{category}</span>
                            <span className="text-xs font-mono px-2 py-1 bg-slate-800 text-indigo-300 rounded-md">
                              {value}%
                            </span>
                          </div>
                          <input 
                            type="range" 
                            min="0" 
                            max="100" 
                            step="5"
                            value={value}
                            onChange={(e) => handleWeightChange(category, parseInt(e.target.value))}
                            className="w-full accent-indigo-500 bg-slate-700 h-1.5 rounded-lg appearance-none cursor-pointer"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-400 border border-dashed border-slate-700 rounded-xl bg-slate-800/10">
                      No hay configuración de pesos disponible.
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'preferences' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300 pb-16">
                {/* Personal Data */}
                <div className="bg-slate-800/20 border border-slate-700/50 rounded-2xl p-6">
                  <h3 className="text-lg font-medium text-white mb-1">Datos Personales</h3>
                  <p className="text-sm text-slate-400 mb-6">Actualiza tu información básica de perfil.</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Nombre(s)</label>
                      <input 
                        type="text" 
                        value={personalData.firstName}
                        onChange={(e) => setPersonalData({...personalData, firstName: e.target.value})}
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Tu nombre"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Apellidos</label>
                      <input 
                        type="text" 
                        value={personalData.lastName}
                        onChange={(e) => setPersonalData({...personalData, lastName: e.target.value})}
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Tus apellidos"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Puesto de trabajo</label>
                      <input 
                        type="text" 
                        value={personalData.title}
                        onChange={(e) => setPersonalData({...personalData, title: e.target.value})}
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Ej: Software Engineer"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Ciudad / Ubicación</label>
                      <input 
                        type="text" 
                        value={personalData.city}
                        onChange={(e) => setPersonalData({...personalData, city: e.target.value})}
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Ej: CDMX"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Teléfono</label>
                      <input 
                        type="text" 
                        value={personalData.phone}
                        onChange={(e) => setPersonalData({...personalData, phone: e.target.value})}
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="+52..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">LinkedIn URL</label>
                      <input 
                        type="url" 
                        value={personalData.linkedin}
                        onChange={(e) => setPersonalData({...personalData, linkedin: e.target.value})}
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="https://linkedin.com/in/..."
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={handleSavePersonalData}
                      disabled={isSavingPersonal}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition-all disabled:opacity-50"
                    >
                      {isSavingPersonal ? 'Guardando...' : 'Guardar Datos Personales'}
                    </button>
                  </div>
                </div>

                {/* Password Change */}
                <div className="bg-slate-800/20 border border-slate-700/50 rounded-2xl p-6">
                  <h3 className="text-lg font-medium text-white mb-1">Cambiar Contraseña</h3>
                  <p className="text-sm text-slate-400 mb-6">Asegúrate de usar una contraseña larga y segura.</p>
                  
                  {passwordMessage && (
                    <div className={`mb-6 p-3 rounded-xl text-sm ${passwordMessage.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                      {passwordMessage.text}
                    </div>
                  )}

                  <div className="space-y-4 mb-6 max-w-sm">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Contraseña Actual</label>
                      <input 
                        type="password" 
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Nueva Contraseña</label>
                      <input 
                        type="password" 
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Confirmar Nueva Contraseña</label>
                      <input 
                        type="password" 
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <button
                      onClick={handleChangePassword}
                      disabled={isSavingPassword || !passwordData.currentPassword || !passwordData.newPassword}
                      className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium rounded-xl transition-all disabled:opacity-50"
                    >
                      {isSavingPassword ? 'Actualizando...' : 'Actualizar Contraseña'}
                    </button>
                  </div>
                </div>

                {/* Mailing Preferences */}
                <div className="bg-slate-800/20 border border-slate-700/50 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-1">
                    <Mail className="w-5 h-5 text-indigo-400" />
                    <h3 className="text-lg font-medium text-white">Notificaciones de Correo</h3>
                  </div>
                  <p className="text-sm text-slate-400 mb-6">Configura las alertas diarias (8:00 AM) de nuevas vacantes.</p>
                  
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl border border-slate-700/50">
                      <div>
                        <p className="text-sm font-medium text-white">Recibir alertas diarias</p>
                        <p className="text-xs text-slate-400">Si lo desactivas, no recibirás correos de vacantes.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer"
                          checked={mailingPreferences.enabled}
                          onChange={(e) => setMailingPreferences({...mailingPreferences, enabled: e.target.checked})}
                        />
                        <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
                      </label>
                    </div>

                    <div className={`transition-opacity duration-300 ${mailingPreferences.enabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Palabras Clave (Keywords)
                      </label>
                      <p className="text-xs text-slate-400 mb-3">
                        Agrega palabras clave para recibir SOLO vacantes que las contengan (ej. Python, React, Cloud). Si la lista está vacía, recibirás todas las vacantes. Presiona Enter para agregar.
                      </p>
                      
                      <div className="flex flex-wrap gap-2 mb-3">
                        {mailingPreferences.keywords_include.map((keyword, idx) => (
                          <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/20 text-indigo-300 text-sm font-medium rounded-lg border border-indigo-500/30">
                            {keyword}
                            <button 
                              onClick={() => removeKeyword(keyword)}
                              className="p-0.5 hover:bg-indigo-500/30 rounded-md transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>

                      <input 
                        type="text" 
                        value={newKeyword}
                        onChange={(e) => setNewKeyword(e.target.value)}
                        onKeyDown={addKeyword}
                        placeholder="Escribe una palabra y presiona Enter"
                        className="w-full max-w-md bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="flex justify-start pt-2">
                      <button
                        onClick={handleSaveMailingPreferences}
                        disabled={isSavingMailing}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition-all disabled:opacity-50"
                      >
                        {isSavingMailing ? 'Guardando...' : 'Guardar Preferencias'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Global Footer (Only visible on tabs that need a global save, like Radar) */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between">
          <div className="flex-1 flex items-center">
            {saveMessage && (
              <span className={`text-sm ${saveMessage.type === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>
                {saveMessage.text}
              </span>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors border border-slate-700"
            >
              Cerrar
            </button>
            {activeTab === 'radar' && (
              <button
                onClick={handleSaveRadar}
                disabled={isSaving}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-xl transition-all shadow-lg border
                  ${isSaving
                    ? 'bg-indigo-600/50 border-indigo-500/20 cursor-not-allowed opacity-70' 
                    : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 shadow-indigo-500/20 border-indigo-400/20'}`}
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Guardando...' : 'Guardar Cambios'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
