import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '';

export interface Job {
  title: string;
  score: number;
  matches: Record<string, string[]>;
  category_breakdown?: Record<string, number>;
  skills: string[];
  url: string;
  company: string;
  publication_date?: string;
  modality?: string;
  created_at?: string;
  status?: 'VIEWED' | 'SAVED' | 'APPLIED' | 'SENT';
}

export interface JobsResponse {
  jobs: Job[];
  total: number;
  last_updated: string | null;
  is_refreshing: boolean;
}

export const fetchJobs = async (
  company?: string, 
  minScore?: number, 
  search?: string,
  modalities?: string[],
  skills?: string[],
  status?: string
): Promise<JobsResponse> => {
  const params = new URLSearchParams();
  if (company) params.append('company', company);
  if (minScore !== undefined) params.append('min_score', minScore.toString());
  if (search) params.append('search', search);
  if (modalities && modalities.length > 0) params.append('modalities', modalities.join(','));
  if (skills && skills.length > 0) params.append('skills', skills.join(','));
  if (status && status !== 'Todos') params.append('status', status);

  const response = await axios.get(`${API_URL}/jobs`, { params });
  return response.data;
};

export const fetchTopJobs = async (limit: number = 10): Promise<{jobs: Job[]}> => {
  const response = await axios.get(`${API_URL}/jobs/top`, { params: { limit } });
  return response.data;
};

export const refreshJobs = async (): Promise<{status: string, message: string}> => {
  const response = await axios.post(`${API_URL}/refresh`);
  return response.data;
};

export interface JobStatusResponse {
  job_id: string;
  status: 'VIEWED' | 'SAVED' | 'APPLIED' | 'SENT';
  created_at: string;
  updated_at?: string;
}

export const updateJobStatus = async (job_id: string, status: 'VIEWED' | 'SAVED' | 'APPLIED' | 'SENT'): Promise<JobStatusResponse> => {
  const response = await axios.post(`${API_URL}/jobs/status`, { job_id, status });
  return response.data;
};

export const resetJobStatus = async (job_id: string): Promise<void> => {
  await axios.delete(`${API_URL}/jobs/status`, { params: { job_id } });
};
