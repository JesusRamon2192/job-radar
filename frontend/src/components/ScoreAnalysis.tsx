import React, { useState, useEffect } from 'react';
import { ArrowLeft, Cloud, Box, Server, Cpu, Code2, Activity, Layout, Edit2, Save, X, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { updateProfileConfig } from '../api/auth';

interface ScoreAnalysisProps {
  onBack: () => void;
}

const DEFAULT_CATEGORIES = [
  { id: 'Cloud Computing', icon: Cloud, defaultScore: 85, color: 'from-blue-500 to-cyan-400', defaultSkills: ["Amazon Web Services", "Google Cloud Platform", "Microsoft Azure", "Cloud Native Development"] },
  { id: 'Containers', icon: Box, defaultScore: 90, color: 'from-indigo-500 to-blue-400', defaultSkills: ["Docker", "Docker Compose", "Docker Volumes"] },
  { id: 'DevOps & CI/CD', icon: Server, defaultScore: 90, color: 'from-purple-500 to-pink-500', defaultSkills: ["DevOps", "Linux", "CI/CD", "GitLab", "Git", "API Testing", "Github", "QA"] },
  { id: 'Artificial Intelligence', icon: Cpu, defaultScore: 88, color: 'from-emerald-400 to-teal-500', defaultSkills: ["OpenAI API", "ChatGPT", "AI Agents", "Prompt Engineering", "Claude Code", "Github Copilot"] },
  { id: 'Backend', icon: Code2, defaultScore: 88, color: 'from-orange-400 to-rose-400', defaultSkills: ["Python", "Node.js", "Java", "PostgreSQL", "REST API", "API Integration"] },
  { id: 'Observability', icon: Activity, defaultScore: 70, color: 'from-yellow-400 to-orange-500', defaultSkills: ["New Relic", "Grafana", "Prometheus", "Monitoring", "Observability"] },
  { id: 'Frontend', icon: Layout, defaultScore: 82, color: 'from-pink-500 to-rose-400', defaultSkills: ["JavaScript", "HTML", "CSS", "React", "TypeScript", "Tailwind CSS", "Frontend Development"] }
];

export const ScoreAnalysis: React.FC<ScoreAnalysisProps> = ({ onBack }) => {
  const { user, fetchUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [categoriesConfig, setCategoriesConfig] = useState<Record<string, string[]>>({});
  const [weightsConfig, setWeightsConfig] = useState<Record<string, number>>({});
  const [newSkillText, setNewSkillText] = useState<Record<string, string>>({});

  useEffect(() => {
    const pConf = user?.profile_config || {};
    const catConf = pConf.categories || {};
    const wConf = pConf.weights || {};

    const initialCats: Record<string, string[]> = {};
    const initialWeights: Record<string, number> = {};

    DEFAULT_CATEGORIES.forEach(c => {
      initialCats[c.id] = catConf[c.id] || c.defaultSkills;
      initialWeights[c.id] = wConf[c.id] !== undefined ? wConf[c.id] : c.defaultScore;
    });

    Object.keys(catConf).forEach(k => {
      if (!initialCats[k]) initialCats[k] = catConf[k];
    });
    Object.keys(wConf).forEach(k => {
      if (initialWeights[k] === undefined) initialWeights[k] = wConf[k];
    });

    setCategoriesConfig(initialCats);
    setWeightsConfig(initialWeights);
  }, [user, isEditing]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfileConfig({
        categories: categoriesConfig,
        weights: weightsConfig
      });
      await fetchUser();
      setIsEditing(false);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleAddSkill = (catId: string) => {
    const text = newSkillText[catId]?.trim();
    if (text && !categoriesConfig[catId].includes(text)) {
      setCategoriesConfig(prev => ({
        ...prev,
        [catId]: [...prev[catId], text]
      }));
      setNewSkillText(prev => ({ ...prev, [catId]: '' }));
    }
  };

  const handleRemoveSkill = (catId: string, skill: string) => {
    setCategoriesConfig(prev => ({
      ...prev,
      [catId]: prev[catId].filter(s => s !== skill)
    }));
  };

  const handleWeightChange = (catId: string, value: number) => {
    setWeightsConfig(prev => ({
      ...prev,
      [catId]: value
    }));
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out pb-20">
      <div className="mb-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Volver al Dashboard
        </button>

        <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50 p-8 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500"></div>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
              Análisis de Score
            </h2>
            
            {user ? (
              <div className="flex items-center gap-2">
                {isEditing ? (
                  <>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors text-sm font-medium"
                      disabled={saving}
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl transition-colors text-sm font-medium"
                    >
                      {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                      Guardar
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl transition-colors text-sm font-medium"
                  >
                    <Edit2 className="w-4 h-4" />
                    Configurar Mi Perfil
                  </button>
                )}
              </div>
            ) : (
              <div className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm rounded-xl">
                Inicia sesión para configurar tus habilidades
              </div>
            )}
          </div>

          <div className="space-y-4 text-slate-300 max-w-4xl leading-relaxed">
            <p>
              El <strong>Score de Afinidad</strong> es una evaluación dinámica que mide qué tan alineadas están tus habilidades 
              con los requerimientos de cada vacante.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 min-[1600px]:grid-cols-3 gap-6">
        {DEFAULT_CATEGORIES.map((category) => {
          const Icon = category.icon;
          const score = weightsConfig[category.id] || 0;
          const skills = categoriesConfig[category.id] || [];

          return (
            <div
              key={category.id}
              className="group bg-slate-800/40 hover:bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 hover:border-slate-600 rounded-2xl p-6 transition-all duration-300 flex flex-col h-full"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${category.color} bg-opacity-10 shadow-inner`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-100">{category.id}</h3>
                </div>
                <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
                  {score}%
                </div>
              </div>

              {isEditing ? (
                <div className="mb-6 space-y-2">
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Nivel de Dominio</span>
                    <span>{score}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={score}
                    onChange={(e) => handleWeightChange(category.id, parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                </div>
              ) : (
                <div className="w-full bg-slate-900/50 rounded-full h-2.5 mb-6 overflow-hidden">
                  <div
                    className={`h-2.5 rounded-full bg-gradient-to-r ${category.color} transition-all duration-1000 ease-out`}
                    style={{ width: `${score}%` }}
                  ></div>
                </div>
              )}

              <div className="mt-auto">
                <h4 className="text-sm font-medium text-slate-400 mb-3 uppercase tracking-wider">Skills Evaluadas</h4>
                <div className="flex flex-wrap gap-2">
                  {skills.map(skill => (
                    <span
                      key={skill}
                      className="px-2.5 py-1 flex items-center gap-1.5 text-xs font-medium bg-slate-900/80 text-slate-300 border border-slate-700/50 rounded-lg"
                    >
                      {skill}
                      {isEditing && (
                        <button 
                          onClick={() => handleRemoveSkill(category.id, skill)}
                          className="hover:text-rose-400 focus:outline-none"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </span>
                  ))}
                </div>

                {isEditing && (
                  <div className="mt-4 flex gap-2">
                    <input
                      type="text"
                      placeholder="Nueva habilidad..."
                      value={newSkillText[category.id] || ''}
                      onChange={(e) => setNewSkillText(prev => ({ ...prev, [category.id]: e.target.value }))}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddSkill(category.id)}
                      className="flex-1 px-3 py-1.5 bg-slate-900/50 border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                    <button
                      onClick={() => handleAddSkill(category.id)}
                      className="p-1.5 bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 rounded-lg transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
