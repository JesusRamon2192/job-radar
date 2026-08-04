import React, { useMemo } from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { KanbanCard } from './KanbanCard';
import type { Job } from '../../api/jobs';

interface KanbanColumnProps {
  id: string;
  title: string;
  jobs: Job[];
  onStatusChange?: (jobId: string, newStatus: string) => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({ id, title, jobs, onStatusChange }) => {
  const { setNodeRef } = useDroppable({
    id,
    data: {
      type: 'Column',
      columnId: id,
    },
  });

  const jobIds = useMemo(() => jobs.map((job) => job.url), [jobs]);

  return (
    <div className="flex flex-col bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden w-full h-full min-h-[500px]">
      <div className="p-4 border-b border-slate-800 bg-slate-800/20">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-slate-200">{title}</h3>
          <span className="bg-slate-800 text-slate-400 text-xs font-medium px-2 py-1 rounded-full">
            {jobs.length}
          </span>
        </div>
      </div>
      
      <div ref={setNodeRef} className="flex-1 p-3 overflow-y-auto flex flex-col gap-3">
        <SortableContext items={jobIds} strategy={verticalListSortingStrategy}>
          {jobs.map((job) => (
            <KanbanCard key={job.url} job={job} onStatusChange={onStatusChange} />
          ))}
        </SortableContext>
        
        {jobs.length === 0 && (
          <div className="h-full flex items-center justify-center text-sm text-slate-500 border-2 border-dashed border-slate-800 rounded-lg py-8">
            Soltar aquí
          </div>
        )}
      </div>
    </div>
  );
};
