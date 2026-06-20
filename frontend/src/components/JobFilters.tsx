import React from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';

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
    <div className="bg-slate-800/40 backdrop-blur rounded-xl p-3 mb-6 border border-slate-700/50 flex flex-col md:flex-row gap-3 items-center">
      {/* Search */}
      <div className="relative w-full md:flex-1">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-slate-500" />
        </div>
        <input
          type="text"
          placeholder="Buscar por título o skills..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="block w-full pl-10 pr-3 py-2 border border-slate-700 rounded-lg bg-slate-900/50 text-slate-300 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm"
        />
      </div>

      {/* Company Dropdown */}
      <div className="relative w-full md:w-64">
        <select
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          className="block w-full pl-3 pr-10 py-2 border border-slate-700 rounded-lg bg-slate-900/50 text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm appearance-none"
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
      <div className="flex items-center gap-3 w-full md:w-auto bg-slate-900/50 px-3 py-2 border border-slate-700 rounded-lg">
        <label className="text-sm text-slate-400 whitespace-nowrap min-w-[70px]">Score: {minScore}</label>
        <input
          type="range"
          min="0"
          max="100"
          step="10"
          value={minScore}
          onChange={(e) => setMinScore(Number(e.target.value))}
          className="w-full md:w-24 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
        />
      </div>
    </div>
  );
};
