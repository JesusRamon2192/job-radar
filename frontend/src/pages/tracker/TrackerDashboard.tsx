import React, { useState, useEffect } from 'react';
import { 
  DndContext, 
  DragOverlay, 
  closestCorners, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors
} from '@dnd-kit/core';
import type {
  DragStartEvent,
  DragOverEvent,
  DragEndEvent
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { fetchJobs, updateJobStatus } from '../../api/jobs';
import type { Job } from '../../api/jobs';
import { KanbanColumn } from './KanbanColumn';
import { KanbanCard } from './KanbanCard';

const COLUMNS = [
  { id: 'SAVED', title: 'Guardados 📌' },
  { id: 'APPLIED', title: 'Postulados ✉️' },
  { id: 'INTERVIEWING', title: 'Entrevista 🗣️' },
  { id: 'OFFER', title: 'Oferta 🎉' },
  { id: 'REJECTED', title: 'Rechazado ❌' }
];

export const TrackerDashboard: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeJob, setActiveJob] = useState<Job | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await fetchJobs();
        const trackedJobs = data.jobs.filter(j => 
          j.status && !['VIEWED', 'ARCHIVED'].includes(j.status)
        );
        setJobs(trackedJobs);
      } catch (err) {
        console.error("Failed to load tracker jobs", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const getJobsByColumn = (columnId: string) => {
    return jobs.filter(job => job.status === columnId);
  };

  const handleStatusChange = async (jobId: string, newStatus: string) => {
    const originalJobs = [...jobs];
    setJobs(prev => prev.map(j => j.url === jobId ? { ...j, status: newStatus as any } : j));
    
    try {
      await updateJobStatus(jobId, newStatus as any);
    } catch (error) {
      console.error("Failed to update status from menu", error);
      setErrorMsg("Error al actualizar el estado. Cambios revertidos.");
      setJobs(originalJobs);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const { data } = active;
    if (data.current?.type === 'Job') {
      setActiveJob(data.current.job);
      setErrorMsg(null);
    }
  };

  const handleDragOver = (_event: DragOverEvent) => {
    // Optional: add visual feedback during drag
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveJob(null);
    const { active, over } = event;
    
    if (!over) return;

    const activeId = active.id as string;
    
    const activeJobData = active.data.current?.job as Job;
    let overColumnId = over.data.current?.type === 'Column' 
      ? over.data.current?.columnId 
      : over.data.current?.job?.status;

    if (!overColumnId || !activeJobData) return;

    if (activeJobData.status !== overColumnId) {
      // Removed strict transition rules to allow free drag-and-drop

      // Optimistically update
      const originalStatus = activeJobData.status;
      setJobs(prevJobs => prevJobs.map(job => 
        job.url === activeId ? { ...job, status: overColumnId as any } : job
      ));

      try {
        await updateJobStatus(activeId, overColumnId as any);
      } catch (error) {
        console.error("Failed to update status", error);
        setErrorMsg("Error al actualizar el estado. Cambios revertidos.");
        setJobs(prevJobs => prevJobs.map(job => 
          job.url === activeId ? { ...job, status: originalStatus } : job
        ));
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Kanban Job Tracker</h2>
          <p className="text-slate-400">Gestiona y haz seguimiento a tus aplicaciones de forma visual.</p>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/50 text-rose-400 rounded-lg text-sm flex items-center gap-2">
          <span className="font-bold">Error:</span> {errorMsg}
        </div>
      )}

      <div className="flex-1 flex gap-6 overflow-x-auto pb-4">
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          {COLUMNS.map(col => (
            <div key={col.id} className="min-w-[320px] w-[350px] flex-shrink-0 h-full">
              <KanbanColumn 
                id={col.id} 
                title={col.title} 
                jobs={getJobsByColumn(col.id)} 
                onStatusChange={handleStatusChange}
              />
            </div>
          ))}

          <DragOverlay>
            {activeJob ? (
              <div className="opacity-80 rotate-2 scale-105 transition-transform cursor-grabbing">
                <KanbanCard job={activeJob} />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
};
