import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Job } from '../../api/jobs';
import { ExternalLink, Building2, MoreHorizontal, ArrowRight, Archive } from 'lucide-react';

interface KanbanCardProps {
  job: Job;
  onStatusChange?: (jobId: string, newStatus: string) => void;
}

export const KanbanCard: React.FC<KanbanCardProps> = ({ job, onStatusChange }) => {
  const [showMenu, setShowMenu] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: job.url,
    data: {
      type: 'Job',
      job,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const handleStatusChange = (e: React.MouseEvent, status: string) => {
    e.stopPropagation();
    setShowMenu(false);
    if (onStatusChange) {
      onStatusChange(job.url, status);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-slate-800 p-3 rounded-lg border border-slate-700 shadow-sm cursor-grab active:cursor-grabbing hover:border-indigo-500/50 transition-colors relative ${
        isDragging ? 'ring-2 ring-indigo-500' : ''
      }`}
    >
      <div className="flex justify-between items-start gap-2">
        <h4 className="font-medium text-sm text-slate-200 line-clamp-2" title={job.title}>
          {job.title}
        </h4>
        <div className="flex gap-1" onPointerDown={(e) => e.stopPropagation()}>
          <a 
            href={job.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-indigo-400 p-1 bg-slate-700/50 rounded hover:bg-slate-700 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <div className="relative">
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="text-slate-400 hover:text-indigo-400 p-1 bg-slate-700/50 rounded hover:bg-slate-700 transition-colors"
            >
              <MoreHorizontal className="w-3.5 h-3.5" />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-1 w-40 bg-slate-700 border border-slate-600 rounded-md shadow-lg z-50 overflow-hidden">
                <div className="p-1">
                  <div className="text-xs font-semibold text-slate-400 px-2 py-1 uppercase tracking-wider">Mover a</div>
                  <button onClick={(e) => handleStatusChange(e, 'SAVED')} className="w-full text-left px-2 py-1.5 text-sm text-slate-200 hover:bg-slate-600 rounded flex items-center gap-2">
                    <ArrowRight className="w-3 h-3 text-slate-400" /> Guardados
                  </button>
                  <button onClick={(e) => handleStatusChange(e, 'APPLIED')} className="w-full text-left px-2 py-1.5 text-sm text-slate-200 hover:bg-slate-600 rounded flex items-center gap-2">
                    <ArrowRight className="w-3 h-3 text-slate-400" /> Postulados
                  </button>
                  <button onClick={(e) => handleStatusChange(e, 'INTERVIEWING')} className="w-full text-left px-2 py-1.5 text-sm text-slate-200 hover:bg-slate-600 rounded flex items-center gap-2">
                    <ArrowRight className="w-3 h-3 text-slate-400" /> Entrevista
                  </button>
                  <button onClick={(e) => handleStatusChange(e, 'OFFER')} className="w-full text-left px-2 py-1.5 text-sm text-slate-200 hover:bg-slate-600 rounded flex items-center gap-2">
                    <ArrowRight className="w-3 h-3 text-slate-400" /> Oferta
                  </button>
                  <button onClick={(e) => handleStatusChange(e, 'REJECTED')} className="w-full text-left px-2 py-1.5 text-sm text-slate-200 hover:bg-slate-600 rounded flex items-center gap-2">
                    <ArrowRight className="w-3 h-3 text-slate-400" /> Rechazado
                  </button>
                  
                  <div className="h-px bg-slate-600 my-1"></div>
                  
                  <button onClick={(e) => handleStatusChange(e, 'ARCHIVED')} className="w-full text-left px-2 py-1.5 text-sm text-rose-400 hover:bg-rose-500/10 rounded flex items-center gap-2">
                    <Archive className="w-3 h-3" /> Archivar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-400">
        <Building2 className="w-3.5 h-3.5" />
        <span className="truncate">{job.company}</span>
      </div>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-700 text-slate-300">
          Score: {job.score}
        </span>
        {job.modality && (
          <span className="text-xs text-slate-500 truncate max-w-[80px]" title={job.modality}>
            {job.modality}
          </span>
        )}
      </div>
    </div>
  );
};
