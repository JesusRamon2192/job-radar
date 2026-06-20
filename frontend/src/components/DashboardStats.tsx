import React from 'react';
import type { Job } from '../api/jobs';

interface DashboardStatsProps {
  jobs: Job[];
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ jobs }) => {
  const totalJobs = jobs.length;
  const companies = new Set(jobs.map(j => j.company)).size;
  const bestScore = jobs.length > 0 ? Math.max(...jobs.map(j => j.score)) : 0;

  const getScoreClassification = (score: number) => {
    if (score >= 80) return { colorClass: 'text-emerald-400', stars: '★★★★★' };
    if (score >= 60) return { colorClass: 'text-blue-400', stars: '★★★★☆' };
    if (score >= 40) return { colorClass: 'text-amber-400', stars: '★★★☆☆' };
    if (score >= 20) return { colorClass: 'text-slate-400', stars: '★★☆☆☆' };
    return { colorClass: 'text-slate-400', stars: '★☆☆☆☆' };
  };

  const scoreInfo = getScoreClassification(bestScore);

  return (
    <div className="flex flex-wrap items-center gap-2 md:gap-3 text-sm md:text-base mb-4 px-1">
      <div className="flex items-center gap-1.5">
        <span className="font-bold text-white">{totalJobs}</span>
        <span className="text-slate-400">Vacantes</span>
      </div>
      <span className="text-slate-600">•</span>
      <div className="flex items-center gap-1.5">
        <span className="font-bold text-white">{companies}</span>
        <span className="text-slate-400">Compañías</span>
      </div>
      <span className="text-slate-600">•</span>
      <div className="flex items-center gap-1.5">
        <span className="text-slate-400">Mejor Match</span>
        <span className={`font-bold text-sm tracking-[0.15em] opacity-90 ${scoreInfo.colorClass}`}>
          {scoreInfo.stars}
        </span>
      </div>
    </div>
  );
};
