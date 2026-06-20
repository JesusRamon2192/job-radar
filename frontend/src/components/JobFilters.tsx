import React from 'react';
import { Search, Building2, SlidersHorizontal, ArrowDownWideNarrow, Star } from 'lucide-react';

interface JobFiltersProps {
  search: string;
  setSearch: (val: string) => void;
  company: string;
  setCompany: (val: string) => void;
  minScore: number;
  setMinScore: (val: number) => void;
  companies: string[];
  sortBy: 'score' | 'date' | 'title';
  setSortBy: (val: 'score' | 'date' | 'title') => void;
}

export const JobFilters: React.FC<JobFiltersProps> = ({
  search, setSearch,
  company, setCompany,
  minScore, setMinScore,
  companies,
  sortBy, setSortBy
}) => {
  return (
    <div className="bg-slate-800/40 backdrop-blur-md rounded-2xl p-2 mb-6 border border-slate-700/50 shadow-lg flex flex-col xl:flex-row gap-2 items-center">
      {/* Search */}
      <div className="relative w-full xl:flex-1 group">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
          <Search className="h-4 w-4" />
        </div>
        <input
          type="text"
          placeholder="Buscar por título o skills..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="block w-full pl-10 pr-4 py-2.5 border-none rounded-xl bg-slate-900/40 hover:bg-slate-900/60 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm"
        />
      </div>

      <div className="flex flex-col md:flex-row gap-2 w-full xl:w-auto">
        {/* Sort By Dropdown */}
        <div className="relative w-full md:w-44 group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
            <ArrowDownWideNarrow className="h-4 w-4" />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'score' | 'date' | 'title')}
            className="block w-full pl-9 pr-10 py-2.5 border-none rounded-xl bg-slate-900/40 hover:bg-slate-900/60 text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm appearance-none cursor-pointer"
          >
            <option value="score">Mejor Match</option>
            <option value="date">Más Recientes</option>
            <option value="title">Alfabéticamente</option>
          </select>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <SlidersHorizontal className="h-4 w-4 text-slate-500" />
          </div>
        </div>

        {/* Company Dropdown */}
        <div className="relative w-full md:w-56 group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
            <Building2 className="h-4 w-4" />
          </div>
          <select
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="block w-full pl-9 pr-10 py-2.5 border-none rounded-xl bg-slate-900/40 hover:bg-slate-900/60 text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm appearance-none cursor-pointer"
          >
            <option value="">Todas las Compañías</option>
            {companies.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <SlidersHorizontal className="h-4 w-4 text-slate-500" />
          </div>
        </div>

        {/* Score Filter */}
        <div className="flex items-center gap-3 w-full md:w-auto bg-slate-900/40 hover:bg-slate-900/60 transition-colors px-4 py-2.5 rounded-xl border-none">
          <Star className="h-4 w-4 text-slate-500 shrink-0" />
          <label className="text-sm text-slate-400 whitespace-nowrap min-w-[65px]">
            Score: <span className="text-amber-400 font-medium">{minScore}</span>
          </label>
          <input
            type="range"
            min="0"
            max="100"
            step="10"
            value={minScore}
            onChange={(e) => setMinScore(Number(e.target.value))}
            className="w-full md:w-24 h-1.5 bg-slate-700/50 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400 transition-all"
          />
        </div>
      </div>
    </div>
  );
};
