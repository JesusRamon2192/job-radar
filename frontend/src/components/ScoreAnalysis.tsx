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
    score: 90,
    color: 'from-purple-500 to-pink-500',
    skills: ["DevOps", "Linux", "CI/CD", "GitLab", "Git", "API Testing", "Github", "QA"]
  },
  {
    id: 'ai',
    name: 'Artificial Intelligence',
    icon: Cpu,
    score: 88,
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
    score: 70,
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
          <div className="space-y-4 text-slate-300 max-w-4xl leading-relaxed">
            <p>
              El <strong>Score de Afinidad</strong> es una evaluación dinámica que mide qué tan alineadas están tus habilidades 
              con los requerimientos de cada vacante. A continuación, se muestra el estado actual 
              de tu perfil desglosado por áreas tecnológicas clave. 
            </p>
            <div className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-xl">
              <h3 className="text-sm font-bold text-indigo-300 mb-2 uppercase tracking-wide">¿Cómo se evalúan las vacantes?</h3>
              <p className="text-sm">
                Cuando el radar encuentra una vacante, analiza sus requerimientos técnicos. Por cada habilidad (skill) que hace <em>match</em> con tu perfil, 
                el sistema te otorga puntos. Sin embargo, <strong>esos puntos no son fijos</strong>; se multiplican por tu porcentaje de dominio en esa categoría.
                <br /><br />
                <em>Ejemplo:</em> Si una vacante requiere "React" (categoría Frontend), y tu dominio en Frontend es del 82%, el sistema 
                multiplicará el puntaje base de la habilidad por 0.82 para determinar cuánto aporta esa categoría al score total de la vacante. 
                ¡Entre mayor sea tu dominio en un área, más puntos sumarás en vacantes que requieran esas tecnologías!
              </p>
            </div>
          </div>
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
