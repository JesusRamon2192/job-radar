import { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { DashboardStats } from './components/DashboardStats';
import { JobFilters } from './components/JobFilters';
import { JobCard } from './components/JobCard';
import { ScoreAnalysis } from './components/ScoreAnalysis';
import { Footer } from './components/Footer';
import { Pagination } from './components/Pagination';
import { fetchJobs } from './api/jobs';
import type { Job } from './api/jobs';

function App() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<'dashboard' | 'score'>('dashboard');

  // Filters state
  const [search, setSearch] = useState('');
  const [company, setCompany] = useState('');
  const [minScore, setMinScore] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'score' | 'date' | 'title'>('score');
  const [modalities, setModalities] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);

  // Available options
  const [availableCompanies, setAvailableCompanies] = useState<string[]>([]);
  const [availableModalities, setAvailableModalities] = useState<string[]>([]);
  const [availableSkills, setAvailableSkills] = useState<string[]>([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const listRef = useRef<HTMLDivElement>(null);
  const JOBS_PER_PAGE = 8;

  const loadJobs = async () => {
    try {
      setLoading(true);
      const data = await fetchJobs(company || undefined, minScore, search || undefined, modalities, skills);
      setJobs(data.jobs);
      setLastUpdated(data.last_updated);
      setIsRefreshing(data.is_refreshing);

      // Aggregate available options
      setAvailableCompanies(prev => Array.from(new Set([...prev, ...data.jobs.map(j => j.company)])));
      setAvailableModalities(prev => Array.from(new Set([...prev, ...(data.jobs.map(j => j.modality).filter(Boolean) as string[])])));
      setAvailableSkills(prev => Array.from(new Set([...prev, ...data.jobs.flatMap(j => j.skills || [])])).sort());
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
  }, [isRefreshing, company, minScore, search, modalities, skills]);

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, company, minScore, sortBy, modalities, skills]);

  const sortedJobs = [...jobs].sort((a, b) => {
    if (sortBy === 'score') return b.score - a.score;
    if (sortBy === 'title') return a.title.localeCompare(b.title);
    if (sortBy === 'date') {
      const dateA = a.publication_date ? new Date(a.publication_date).getTime() : 0;
      const dateB = b.publication_date ? new Date(b.publication_date).getTime() : 0;
      return dateB - dateA;
    }
    return 0;
  });

  const totalPages = Math.ceil(sortedJobs.length / JOBS_PER_PAGE);
  const paginatedJobs = sortedJobs.slice((currentPage - 1) * JOBS_PER_PAGE, currentPage * JOBS_PER_PAGE);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    if (listRef.current) {
      const yOffset = -20; // Some padding from top
      const y = listRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-indigo-500/30 pb-20">
      <Header 
        lastUpdated={lastUpdated} 
        onAnalyzeScore={() => setCurrentView('score')}
      />
      
      {currentView === 'score' ? (
        <main className="container mx-auto px-4 mt-8 max-w-6xl min-[1600px]:max-w-[1536px]">
          <ScoreAnalysis onBack={() => setCurrentView('dashboard')} />
        </main>
      ) : (
        <main className="container mx-auto px-4 mt-4 max-w-6xl min-[1600px]:max-w-[1536px]">
          <DashboardStats jobs={jobs} />
          
          <JobFilters 
            search={search} setSearch={setSearch}
            company={company} setCompany={setCompany}
            minScore={minScore} setMinScore={setMinScore}
            companies={availableCompanies}
            sortBy={sortBy} setSortBy={setSortBy}
            modalities={modalities} setModalities={setModalities}
            availableModalities={availableModalities}
            skills={skills} setSkills={setSkills}
            availableSkills={availableSkills}
          />

          {loading && jobs.length === 0 ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
            </div>
          ) : sortedJobs.length === 0 ? (
            <div className="text-center py-20 text-slate-400 bg-slate-800/30 rounded-2xl border border-slate-700/50">
              <p className="text-lg">No jobs found matching your criteria.</p>
              <p className="text-sm mt-2">Try adjusting your filters or triggering a refresh.</p>
            </div>
          ) : (
            <div ref={listRef} className="animate-fade-in">
              <div className="grid grid-cols-1 lg:grid-cols-2 min-[1600px]:grid-cols-3 gap-4 items-start">
                {paginatedJobs.map((job, idx) => (
                  <div key={`${job.url}-${idx}`} className="animate-slide-up" style={{ animationDelay: `${idx * 50}ms`, animationFillMode: 'both' }}>
                    <JobCard job={job} />
                  </div>
                ))}
              </div>
              
              <Pagination 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </main>
      )}
      
      <Footer />
    </div>
  );
}

export default App;
