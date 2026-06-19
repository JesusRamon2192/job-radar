import React, { useState } from 'react';
import { ExternalLink, Building, MapPin, Tag } from 'lucide-react';
import type { Job } from '../api/jobs';

interface JobCardProps {
  job: Job;
}

export const JobCard: React.FC<JobCardProps> = ({ job }) => {
  const [expanded, setExpanded] = useState(false);

  const getScoreColor = (score: number) => {
    if (score >= 50) return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
    if (score >= 30) return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
    return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
  };

  const getScoreTierMobile = (score: number) => {
    if (score >= 70) return 'high';
    if (score >= 50) return 'medium';
    return 'low';
  };

  const isRemote = job.title.toLowerCase().includes('remote') || 
                   job.title.toLowerCase().includes('remoto');

  return (
    <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:bg-slate-800 transition-all shadow-lg hover:shadow-indigo-500/5 group cursor-pointer job-card" onClick={() => setExpanded(!expanded)}>
      <div className="flex justify-between items-start gap-4 job-card-header">
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-slate-100 group-hover:text-indigo-400 transition-colors line-clamp-2 job-title">
            {job.title}
          </h2>
          
          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-400 job-metadata">
            <div className="flex items-center gap-1.5">
              <Building className="w-4 h-4 shrink-0" />
              {job.company}
            </div>
            {isRemote && (
              <div className="flex items-center gap-1.5 text-indigo-300">
                <MapPin className="w-4 h-4 shrink-0" />
                Remote
              </div>
            )}
          </div>
        </div>

        <div className={`flex flex-col items-center justify-center min-w-[60px] h-[60px] rounded-xl border ${getScoreColor(job.score)} job-score`} data-mobile-tier={getScoreTierMobile(job.score)}>
          <span className="text-xs font-medium uppercase opacity-70 score-label">Score</span>
          <span className="text-xl font-bold leading-tight score-value">{job.score}</span>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between job-card-footer">
        <div className="flex items-center gap-2 overflow-hidden">
          <Tag className="w-4 h-4 text-slate-500 shrink-0" />
          <div className="flex gap-2 overflow-x-auto no-scrollbar mask-fade-right pb-1 job-skills">
            {job.skills.slice(0, 5).map((skill, idx) => (
              <span key={idx} className={`px-2.5 py-1 rounded-full bg-slate-700/50 text-slate-300 text-xs whitespace-nowrap ${idx >= 3 ? 'hidden md:inline-flex' : ''}`}>
                {skill}
              </span>
            ))}
            {job.skills.length > 5 && (
              <span className="px-2.5 py-1 rounded-full bg-slate-700/30 text-slate-400 text-xs whitespace-nowrap hidden md:inline-flex">
                +{job.skills.length - 5}
              </span>
            )}
            {job.skills.length > 3 && (
              <span className="px-2.5 py-1 rounded-full bg-slate-700/30 text-slate-400 text-xs whitespace-nowrap md:hidden">
                +{job.skills.length - 3} más
              </span>
            )}
          </div>
        </div>

        <a 
          href={job.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="shrink-0 flex items-center gap-1.5 px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-lg transition-colors text-sm font-medium view-job-btn"
        >
          <span className="view-job-text">View Job</span>
          <ExternalLink className="w-4 h-4 view-job-icon" />
        </a>
      </div>

      {expanded && (
        <div className="mt-6 pt-6 border-t border-slate-700/50 animate-in fade-in slide-in-from-top-4">
          <h3 className="text-sm font-semibold text-slate-300 mb-3">Matching Categories</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.entries(job.matches).map(([category, skills]) => (
              <div key={category} className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/30">
                <h4 className="text-xs font-medium text-indigo-300 mb-2">{category}</h4>
                <div className="flex flex-wrap gap-1.5">
                  {(skills as string[]).map(s => (
                    <span key={s} className="px-2 py-0.5 bg-indigo-500/10 text-indigo-200 rounded text-xs">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          {job.skills.length > 0 && (
            <div className="mt-4">
               <h3 className="text-sm font-semibold text-slate-300 mb-3">All Required Skills</h3>
               <div className="flex flex-wrap gap-1.5">
                 {job.skills.map(s => (
                    <span key={s} className="px-2 py-1 bg-slate-700/30 text-slate-400 rounded text-xs">
                      {s}
                    </span>
                 ))}
               </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
