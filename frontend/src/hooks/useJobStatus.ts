import { useState, useCallback } from 'react';
import { updateJobStatus as apiUpdateJobStatus, resetJobStatus as apiResetJobStatus } from '../api/jobs';
import type { Job } from '../api/jobs';

export const useJobStatus = (initialJob: Job) => {
  const [job, setJob] = useState<Job>(initialJob);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateStatus = useCallback(async (newStatus: 'VIEWED' | 'SAVED' | 'APPLIED' | 'SENT') => {
    // If the job already has this status, don't update
    if (job.status === newStatus) return;

    // Prevent downgrading from SENT
    if (job.status === 'SENT') {
      setError("No se puede cambiar el estado de una vacante enviada. Reinicia el estado primero.");
      return;
    }
    
    // VIEWED condition: "Si la vacante ya tiene otro estado, NO debe cambiar a Vista."
    if (newStatus === 'VIEWED' && job.status && job.status !== 'VIEWED') {
      return;
    }

    const previousStatus = job.status;
    
    // Optimistic update
    setJob(prev => ({ ...prev, status: newStatus }));
    setIsUpdating(true);
    setError(null);

    try {
      await apiUpdateJobStatus(job.url, newStatus);
    } catch (err) {
      // Revert on error
      setJob(prev => ({ ...prev, status: previousStatus }));
      setError("Error al actualizar el estado. Intenta de nuevo.");
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  }, [job.url, job.status]);

  const resetStatus = useCallback(async () => {
    const previousStatus = job.status;
    setJob(prev => {
      const { status, ...rest } = prev;
      return rest as Job;
    });
    setIsUpdating(true);
    setError(null);

    try {
      await apiResetJobStatus(job.url);
    } catch (err) {
      setJob(prev => ({ ...prev, status: previousStatus }));
      setError("Error al reiniciar el estado. Intenta de nuevo.");
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  }, [job.url, job.status]);

  return {
    job,
    updateStatus,
    resetStatus,
    isUpdating,
    error,
    clearError: () => setError(null)
  };
};
