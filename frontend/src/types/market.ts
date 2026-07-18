export interface MarketOverview {
  summary: {
    active_jobs: number;
    monitored_companies: number;
    jobs_added_today: number;
    hiring_index: number;
  };
  trends: {
    active_jobs_trend: number;
    hiring_index_trend: number;
  };
  evolution: Array<{
    date: string;
    vacancies: number;
  }>;
  top_companies: Array<{
    id: string;
    name: string;
    active_jobs: number;
    trend: number;
    trend_direction: 'up' | 'down';
  }>;
  modality: {
    remote: number;
    hybrid: number;
    onsite: number;
  };
  seniority: {
    junior: number;
    mid: number;
    senior: number;
    lead: number;
    principal: number;
  };
  top_technologies: Array<{
    name: string;
    percentage: number;
  }>;
  trending_skills: Array<{
    name: string;
    time_period: string;
    trend: number;
    trend_direction: 'up' | 'down';
  }>;
  trending_companies: {
    hiring_more: string[];
    hiring_less: string[];
  };
}

export interface CompanyMarketSummary {
  id: string;
  name: string;
  logo: string;
  hiring_score: number;
  active_jobs: number;
  weekly_trend: number;
  trend_direction: 'up' | 'down';
}

export interface CompanyMarketDetail {
  id: string;
  name: string;
  logo: string;
  hiring_score: number;
  active_jobs: number;
  weekly_added_jobs: number;
  weekly_closed_jobs: number;
  daily_average_jobs: number;
  modality: {
    remote: number;
    hybrid: number;
    onsite: number;
  };
  top_technologies: Array<{
    name: string;
    percentage: number;
  }>;
  history: Array<{
    date: string;
    vacancies: number;
  }>;
  top_skills: Array<{
    name: string;
    rank: number;
  }>;
  average_open_time_days: number;
  indicator_message: string;
}
