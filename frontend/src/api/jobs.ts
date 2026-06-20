import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '';

export interface Job {
  title: string;
  score: number;
  matches: Record<string, string[]>;
  skills: string[];
  url: string;
  company: string;
  publication_date?: string;
  created_at?: string;
}

export interface JobsResponse {
  jobs: Job[];
  total: number;
  last_updated: string | null;
  is_refreshing: boolean;
}

export const fetchJobs = async (company?: string, minScore?: number, search?: string): Promise<JobsResponse> => {
  const params = new URLSearchParams();
  if (company) params.append('company', company);
  if (minScore !== undefined) params.append('min_score', minScore.toString());
  if (search) params.append('search', search);

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
