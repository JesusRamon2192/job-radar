import React from 'react';
import { Briefcase, Building2, Trophy } from 'lucide-react';
import type { Job } from '../api/jobs';

interface DashboardStatsProps {
  jobs: Job[];
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ jobs }) => {
  const totalJobs = jobs.length;
  const companies = new Set(jobs.map(j => j.company)).size;
  const bestScore = jobs.length > 0 ? Math.max(...jobs.map(j => j.score)) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 kpi-container">
      <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6 flex items-center gap-4 hover:bg-slate-800 transition-colors kpi-card">
        <div className="bg-blue-500/10 p-3 rounded-xl text-blue-400 kpi-icon">
          <Briefcase className="w-8 h-8" />
        </div>
        <div className="kpi-content">
          <p className="text-slate-400 text-sm font-medium kpi-label">Vacantes Totales</p>
          <p className="text-3xl font-bold text-white kpi-value">{totalJobs}</p>
        </div>
      </div>

      <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6 flex items-center gap-4 hover:bg-slate-800 transition-colors kpi-card">
        <div className="bg-emerald-500/10 p-3 rounded-xl text-emerald-400 kpi-icon">
          <Building2 className="w-8 h-8" />
        </div>
        <div className="kpi-content">
          <p className="text-slate-400 text-sm font-medium kpi-label">Compañías</p>
          <p className="text-3xl font-bold text-white kpi-value">{companies}</p>
        </div>
      </div>

      <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6 flex items-center gap-4 hover:bg-slate-800 transition-colors kpi-card">
        <div className="bg-amber-500/10 p-3 rounded-xl text-amber-400 kpi-icon">
          <Trophy className="w-8 h-8" />
        </div>
        <div className="kpi-content">
          <p className="text-slate-400 text-sm font-medium kpi-label">Mejor Score</p>
          <p className="text-3xl font-bold text-white kpi-value">{bestScore}</p>
        </div>
      </div>
    </div>
  );
};
