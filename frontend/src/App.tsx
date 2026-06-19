import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { DashboardStats } from './components/DashboardStats';
import { JobFilters } from './components/JobFilters';
import { JobCard } from './components/JobCard';
import { fetchJobs } from './api/jobs';
import type { Job } from './api/jobs';

function App() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState('');
  const [company, setCompany] = useState('');
  const [minScore, setMinScore] = useState<number>(0);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const data = await fetchJobs(company || undefined, minScore, search || undefined);
      setJobs(data.jobs);
      setLastUpdated(data.last_updated);
      setIsRefreshing(data.is_refreshing);
    } catch (error) {
      console.error("Failed to load jobs", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
    // Poll every 5 seconds if it's currently refreshing
    let interval: number | undefined;
    if (isRefreshing) {
      interval = window.setInterval(loadJobs, 5000);
    }
    return () => clearInterval(interval);
  }, [isRefreshing, company, minScore, search]);

  // Get unique companies from the full dataset for the dropdown
  // We'll just derive it from current jobs, though ideally it should come from the API
  const companies = Array.from(new Set(jobs.map(j => j.company)));

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-indigo-500/30 pb-20">
      <Header 
        lastUpdated={lastUpdated} 
      />
      
      <main className="container mx-auto px-4 mt-8 max-w-6xl min-[1600px]:max-w-[1536px]">
        <DashboardStats jobs={jobs} />
        
        <JobFilters 
          search={search} setSearch={setSearch}
          company={company} setCompany={setCompany}
          minScore={minScore} setMinScore={setMinScore}
          companies={companies}
        />

        {loading && jobs.length === 0 ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-20 text-slate-400 bg-slate-800/30 rounded-2xl border border-slate-700/50">
            <p className="text-lg">No jobs found matching your criteria.</p>
            <p className="text-sm mt-2">Try adjusting your filters or triggering a refresh.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 min-[1600px]:grid-cols-3 gap-4">
            {jobs.map((job, idx) => (
              <JobCard key={`${job.url}-${idx}`} job={job} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
