import React, { useState, useEffect } from 'react';
import { ExternalLink, Building, MapPin, Tag, Calendar, Search, Heart, CheckCircle2, Eye } from 'lucide-react';
import type { Job } from '../api/jobs';
import { useJobStatus } from '../hooks/useJobStatus';

interface JobCardProps {
  job: Job;
}

export const JobCard: React.FC<JobCardProps> = ({ job: initialJob }) => {
  const [expanded, setExpanded] = useState(false);
  const { job, updateStatus, resetStatus, error, clearError } = useJobStatus(initialJob);

  useEffect(() => {
    if (expanded && (!job.status || job.status !== 'VIEWED')) {
      // Only set VIEWED if it has no other significant status
      if (!job.status) {
        updateStatus('VIEWED');
      }
    }
  }, [expanded, job.status, updateStatus]);

  useEffect(() => {
    if (error) {
      alert(error); // In a real app we would use a toast
      clearError();
    }
  }, [error, clearError]);

  const getStatusBadge = () => {
    if (!job.status) return null;
    
    switch (job.status) {
      case 'VIEWED':
        return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-700/50 text-slate-300 text-xs font-medium border border-slate-600/50"><Eye className="w-3.5 h-3.5" /> Vista</span>;
      case 'SAVED':
        return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-yellow-500/10 text-yellow-500 text-xs font-medium border border-yellow-500/20"><Heart className="w-3.5 h-3.5 fill-current" /> Guardada</span>;
      case 'APPLIED':
        return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-medium border border-blue-500/20"><CheckCircle2 className="w-3.5 h-3.5" /> Aplicada</span>;

      default:
        return null;
    }
  };

  const getScoreClassification = (score: number) => {
    if (score >= 80) return { colorClass: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20', stars: '★★★★★', label: 'Excelente' };
    if (score >= 60) return { colorClass: 'text-blue-400 bg-blue-400/10 border-blue-400/20', stars: '★★★★☆', label: 'Buena' };
    if (score >= 40) return { colorClass: 'text-amber-400 bg-amber-400/10 border-amber-400/20', stars: '★★★☆☆', label: 'Regular' };
    if (score >= 20) return { colorClass: 'text-slate-400 bg-slate-400/10 border-slate-400/20', stars: '★★☆☆☆', label: 'Baja' };
    return { colorClass: 'text-slate-400 bg-slate-400/10 border-slate-400/20', stars: '★☆☆☆☆', label: 'Baja' };
  };

  const getScoreTierMobile = (score: number) => {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'regular';
    return 'low';
  };

  const modality = job.modality && job.modality !== "Unknown" 
    ? job.modality 
    : (job.title.toLowerCase().includes('remote') || job.title.toLowerCase().includes('remoto') ? 'Remote' : null);

  const scoreInfo = getScoreClassification(job.score);

  const getRelativeDateInfo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    
    const dateCalendar = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const nowCalendar = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diffDays = Math.max(0, Math.floor((nowCalendar.getTime() - dateCalendar.getTime()) / (1000 * 60 * 60 * 24)));
    
    const isNew = diffTime < 72 * 60 * 60 * 1000;
    
    let relative = '';
    if (diffDays === 0) {
      relative = 'hoy';
    } else if (diffDays === 1) {
      relative = 'hace 1 día';
    } else if (diffDays < 7) {
      relative = `hace ${diffDays} días`;
    } else if (diffDays === 7) {
      relative = 'hace 1 semana';
    } else {
      const weeks = Math.floor(diffDays / 7);
      if (weeks < 4) {
        relative = `hace ${weeks} semanas`;
      } else {
        const months = Math.floor(diffDays / 30);
        if (months <= 1) {
          relative = 'hace 1 mes';
        } else {
          relative = `hace ${months} meses`;
        }
      }
    }
    
    return { relative, isNew };
  };

  const formatDateShort = (dateStr: string) => {
    const date = new Date(dateStr);
    const day = date.getDate();
    const month = date.toLocaleDateString('es-ES', { month: 'short' }).replace('.', '');
    const capitalizedMonth = month.charAt(0).toUpperCase() + month.slice(1);
    const year = date.getFullYear();
    return `${day} ${capitalizedMonth} ${year}`;
  };

  return (
    <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 lg:p-5 hover:bg-slate-800 transition-all shadow-lg hover:shadow-indigo-500/5 group cursor-pointer job-card" onClick={() => setExpanded(!expanded)}>
      <div className="flex justify-between items-start gap-4 job-card-header">
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-slate-100 group-hover:text-indigo-400 transition-colors line-clamp-2 job-title">
            {job.title}
          </h2>
          
          <div className="mt-3 flex flex-col gap-2 text-sm text-slate-400 job-metadata">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-1.5">
                <Building className="w-4 h-4 shrink-0" />
                {job.company}
              </div>
              {modality && (
                <div className="flex items-center gap-1.5 text-indigo-300">
                  <MapPin className="w-4 h-4 shrink-0" />
                  {modality}
                </div>
              )}
            </div>
            
            {(job.publication_date || job.created_at) && (
              <div className="flex flex-col gap-1.5">
                {job.publication_date && (() => {
                  const pubDateInfo = getRelativeDateInfo(job.publication_date);
                  return (
                    <div className="flex items-center gap-1.5 text-slate-400" title="Fecha de Publicación">
                      <Calendar className="w-4 h-4 shrink-0" />
                      <span>
                        Publicada <span className="font-medium text-slate-300">{pubDateInfo.relative}</span> · {formatDateShort(job.publication_date)}
                      </span>
                      {pubDateInfo.isNew && (
                        <span className="flex items-center gap-1 ml-1.5 px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-medium border border-emerald-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          Nueva
                        </span>
                      )}
                    </div>
                  );
                })()}
                
                {job.created_at && (() => {
                  const createdDateInfo = getRelativeDateInfo(job.created_at);
                  return (
                    <div className="flex items-center gap-1.5 text-slate-400" title="Fecha Descubierta por Radar">
                      <Search className="w-4 h-4 shrink-0" />
                      <span>
                        Detectada <span className="font-medium text-slate-300">{createdDateInfo.relative}</span> · {formatDateShort(job.created_at)}
                      </span>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          {getStatusBadge()}
          <div 
            className={`flex items-center justify-center px-4 py-2.5 rounded-xl border ${scoreInfo.colorClass} job-score transition-colors`} 
            data-mobile-tier={getScoreTierMobile(job.score)}
            title={`${scoreInfo.label} coincidencia: ${job.score} pts`}
          >
            <span className="text-sm tracking-[0.15em] opacity-90 score-stars">{scoreInfo.stars}</span>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between job-card-footer">
        <div className="flex items-center gap-2 overflow-hidden">
          <Tag className="w-4 h-4 text-slate-500 shrink-0" />
          <div className="flex gap-2 overflow-x-auto no-scrollbar mask-fade-right pb-1 job-skills">
            {job.skills.slice(0, 5).map((skill, idx) => {
              let visibilityClass = '';
              if (idx >= 4) {
                visibilityClass = 'hidden md:inline-flex lg:hidden';
              } else if (idx >= 3) {
                visibilityClass = 'hidden md:inline-flex';
              }
              return (
                <span key={idx} className={`px-2.5 py-1 rounded-full bg-slate-700/50 text-slate-300 text-xs whitespace-nowrap ${visibilityClass}`}>
                  {skill}
                </span>
              );
            })}
            {job.skills.length > 4 && (
              <span className="px-2.5 py-1 rounded-full bg-slate-700/30 text-slate-400 text-xs whitespace-nowrap hidden lg:inline-flex">
                +{job.skills.length - 4}
              </span>
            )}
            {job.skills.length > 5 && (
              <span className="px-2.5 py-1 rounded-full bg-slate-700/30 text-slate-400 text-xs whitespace-nowrap hidden md:inline-flex lg:hidden">
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

        <div className="flex items-center gap-2 shrink-0">
          <button 
            onClick={(e) => { 
              e.stopPropagation(); 
              if (job.status === 'SAVED') {
                resetStatus();
              } else {
                updateStatus('SAVED');
              }
            }}
            disabled={job.status !== undefined && job.status !== 'VIEWED' && job.status !== 'SAVED'}
            className={`p-2 rounded-lg transition-colors border ${
              job.status === 'SAVED' 
                ? 'bg-yellow-500/20 border-yellow-500/30 text-yellow-500' 
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-yellow-500 hover:border-yellow-500/50'
            } disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-slate-400 disabled:hover:border-slate-700 disabled:bg-slate-800`}
            title={job.status === 'SAVED' ? 'Desguardar' : 'Guardar'}
          >
            <Heart className={`w-4 h-4 ${job.status === 'SAVED' ? 'fill-current' : ''}`} />
          </button>
          
          <button 
            onClick={(e) => { 
              e.stopPropagation(); 
              if (job.status !== 'APPLIED') {
                if (window.confirm('¿Confirmas que ya aplicaste a esta vacante?')) {
                  updateStatus('APPLIED'); 
                }
              }
            }}
            disabled={job.status === 'APPLIED'}
            className={`p-2 rounded-lg transition-colors border ${job.status === 'APPLIED' ? 'bg-blue-500/20 border-blue-500/30 text-blue-400' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-blue-400 hover:border-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed'}`}
            title="Marcar como Aplicada"
          >
            <CheckCircle2 className="w-4 h-4" />
          </button>

          <a 
            href={job.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              e.stopPropagation();
              if (!job.status) {
                updateStatus('VIEWED');
              }
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-lg transition-colors text-sm font-medium view-job-btn"
          >
            <span className="view-job-text">View Job</span>
            <ExternalLink className="w-4 h-4 view-job-icon" />
          </a>
        </div>
      </div>

      {expanded && (
        <div className="mt-6 pt-6 border-t border-slate-700/50 animate-in fade-in slide-in-from-top-4">
          <h3 className="text-sm font-semibold text-slate-300 mb-3">Matching Categories & Score Breakdown</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.entries(job.matches).map(([category, skills]) => (
              <div key={category} className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/30">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-medium text-indigo-300 capitalize">{category}</h4>
                  {job.category_breakdown && job.category_breakdown[category] !== undefined && (
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded">
                      +{job.category_breakdown[category]} pts
                    </span>
                  )}
                </div>
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
