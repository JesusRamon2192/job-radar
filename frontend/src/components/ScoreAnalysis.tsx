import React from 'react';
import { ArrowLeft, Cloud, Box, Server, Cpu, Code2, Activity, Layout } from 'lucide-react';

interface ScoreAnalysisProps {
  onBack: () => void;
}

const CATEGORIES = [
  {
    id: 'cloud',
    name: 'Cloud Computing',
    icon: Cloud,
    score: 85,
    color: 'from-blue-500 to-cyan-400',
    skills: ["Amazon Web Services", "Google Cloud Platform", "Microsoft Azure", "Cloud Native Development"]
  },
  {
    id: 'containers',
    name: 'Containers',
    icon: Box,
    score: 90,
    color: 'from-indigo-500 to-blue-400',
    skills: ["Docker", "Docker Compose", "Docker Volumes"]
  },
  {
    id: 'devops',
    name: 'DevOps & CI/CD',
    icon: Server,
    score: 80,
    color: 'from-purple-500 to-pink-500',
    skills: ["DevOps", "Linux", "CI/CD", "GitLab", "Git", "API Testing", "Github", "QA"]
  },
  {
    id: 'ai',
    name: 'Artificial Intelligence',
    icon: Cpu,
    score: 95,
    color: 'from-emerald-400 to-teal-500',
    skills: ["OpenAI API", "ChatGPT", "AI Agents", "Prompt Engineering", "Claude Code", "Github Copilot"]
  },
  {
    id: 'backend',
    name: 'Backend Development',
    icon: Code2,
    score: 88,
    color: 'from-orange-400 to-rose-400',
    skills: ["Python", "Node.js", "Java", "PostgreSQL", "REST API", "API Integration"]
  },
  {
    id: 'observability',
    name: 'Observability',
    icon: Activity,
    score: 75,
    color: 'from-yellow-400 to-orange-500',
    skills: ["New Relic", "Grafana", "Prometheus", "Monitoring", "Observability"]
  },
  {
    id: 'frontend',
    name: 'Frontend Development',
    icon: Layout,
    score: 82,
    color: 'from-pink-500 to-rose-400',
    skills: ["JavaScript", "HTML", "CSS", "React", "TypeScript", "Tailwind CSS", "Frontend Development"]
  }
];

export const ScoreAnalysis: React.FC<ScoreAnalysisProps> = ({ onBack }) => {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out pb-20">
      {/* Header Section */}
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
          <h2 className="text-3xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
            Análisis de Score
          </h2>
          <p className="text-slate-300 max-w-3xl leading-relaxed">
            El Score es una evaluación dinámica que mide qué tan alineadas están tus habilidades 
            con los requerimientos de cada vacante. A continuación, se muestra el estado actual 
            de tu perfil desglosado por áreas tecnológicas clave. Entre mayor sea el porcentaje, 
            mejor preparado estás para enfrentar retos en esa categoría específica.
          </p>
        </div>
      </div>

      {/* Grid of Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 min-[1600px]:grid-cols-3 gap-6">
        {CATEGORIES.map((category) => {
          const Icon = category.icon;
          return (
            <div 
              key={category.id} 
              className="group bg-slate-800/40 hover:bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 hover:border-slate-600 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/10 flex flex-col h-full"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${category.color} bg-opacity-10 shadow-inner`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-100">{category.name}</h3>
                </div>
                <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
                  {category.score}%
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-900/50 rounded-full h-2.5 mb-6 overflow-hidden">
                <div 
                  className={`h-2.5 rounded-full bg-gradient-to-r ${category.color} transition-all duration-1000 ease-out`} 
                  style={{ width: `${category.score}%` }}
                ></div>
              </div>

              {/* Skills List */}
              <div className="mt-auto">
                <h4 className="text-sm font-medium text-slate-400 mb-3 uppercase tracking-wider">Skills Evaluadas</h4>
                <div className="flex flex-wrap gap-2">
                  {category.skills.map(skill => (
                    <span 
                      key={skill} 
                      className="px-2.5 py-1 text-xs font-medium bg-slate-900/80 text-slate-300 border border-slate-700/50 rounded-lg group-hover:border-slate-600 transition-colors"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
