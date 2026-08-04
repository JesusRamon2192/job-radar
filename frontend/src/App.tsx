import { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { DashboardStats } from './components/DashboardStats';
import { RegistrationBanner } from './components/RegistrationBanner';
import { JobFilters } from './components/JobFilters';
import { JobCard } from './components/JobCard';
import { ScoreAnalysis } from './components/ScoreAnalysis';
import { Footer } from './components/Footer';
import { Pagination } from './components/Pagination';
import { fetchJobs } from './api/jobs';
import type { Job } from './api/jobs';
import { AdminDashboard } from './components/AdminDashboard';
import { useAuth } from './context/AuthContext';
import { ResetPassword } from './components/ResetPassword';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { MarketDashboard } from './pages/market/MarketDashboard';
import { CompanyMarketDashboard } from './pages/market/CompanyMarketDashboard';
import { TrackerDashboard } from './pages/tracker/TrackerDashboard';

function App() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const searchParams = new URLSearchParams(window.location.search);
  const [resetToken, setResetToken] = useState<string | null>(searchParams.get('token'));

  // Filters state
  const [search, setSearch] = useState('');
  const [company, setCompany] = useState('');
  const [minScore, setMinScore] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'score' | 'date' | 'title'>('score');
  const [modalities, setModalities] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [status, setStatus] = useState<string>('Todos');

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
      const data = await fetchJobs(company || undefined, minScore, search || undefined, modalities, skills, status);
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
  }, [isRefreshing, company, minScore, search, modalities, skills, status, token]);

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, company, minScore, sortBy, modalities, skills, status]);

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
      />
      
      {resetToken && (
        <ResetPassword 
          token={resetToken} 
          onSuccess={() => {
            setResetToken(null);
            window.history.replaceState({}, document.title, window.location.pathname);
          }} 
        />
      )}
      
      <Routes>
        <Route path="/admin" element={
          <main className="container mx-auto px-4 mt-8 max-w-6xl min-[1600px]:max-w-[1536px]">
            <AdminDashboard onBack={() => navigate('/')} />
          </main>
        } />
        <Route path="/score" element={
          <main className="container mx-auto px-4 mt-8 max-w-6xl min-[1600px]:max-w-[1536px]">
            <ScoreAnalysis onBack={() => navigate('/')} />
          </main>
        } />
        <Route path="/market" element={<MarketDashboard />} />
        <Route path="/company/:id/market" element={<CompanyMarketDashboard />} />
        <Route path="/tracker" element={
          <main className="container mx-auto px-4 mt-8 max-w-[1920px]">
            <TrackerDashboard />
          </main>
        } />
        <Route path="/" element={
          <main className="container mx-auto px-4 mt-4 max-w-6xl min-[1600px]:max-w-[1536px]">
            <DashboardStats jobs={jobs} />
            
            <RegistrationBanner />

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
              status={status} setStatus={setStatus}
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
        } />
      </Routes>
      
      <Footer />
    </div>
  );
}

export default App;
