import React from 'react';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';

interface JobFiltersProps {
  search: string;
  setSearch: (val: string) => void;
  company: string;
  setCompany: (val: string) => void;
  minScore: number;
  setMinScore: (val: number) => void;
  companies: string[];
}

export const JobFilters: React.FC<JobFiltersProps> = ({
  search, setSearch,
  company, setCompany,
  minScore, setMinScore,
  companies
}) => {
  return (
    <div className="bg-slate-800/30 backdrop-blur rounded-2xl p-4 md:p-6 mb-8 border border-slate-700/50">
      <div className="flex items-center gap-2 mb-4 text-slate-300">
        <Filter className="w-5 h-5" />
        <h3 className="font-medium">Filter Vacancies</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-500" />
          </div>
          <input
            type="text"
            placeholder="Search by title or skills..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-slate-700 rounded-xl bg-slate-900/50 text-slate-300 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all sm:text-sm"
          />
        </div>

        {/* Company Dropdown */}
        <div className="relative">
          <select
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="block w-full pl-3 pr-10 py-2 border border-slate-700 rounded-xl bg-slate-900/50 text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all sm:text-sm appearance-none"
          >
            <option value="">All Companies</option>
            {companies.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <SlidersHorizontal className="h-4 w-4 text-slate-500" />
          </div>
        </div>

        {/* Score Filter */}
        <div className="flex items-center gap-4 bg-slate-900/50 px-4 py-2 border border-slate-700 rounded-xl">
          <label className="text-sm text-slate-400 whitespace-nowrap">Min Score: {minScore}</label>
          <input
            type="range"
            min="0"
            max="100"
            step="10"
            value={minScore}
            onChange={(e) => setMinScore(Number(e.target.value))}
            className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
        </div>
      </div>
    </div>
  );
};
