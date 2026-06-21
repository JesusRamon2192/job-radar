import React, { useState, useRef, useEffect } from 'react';
import { Search, Building2, SlidersHorizontal, ArrowDownWideNarrow, Star, Briefcase, Code2, ChevronDown, Check } from 'lucide-react';

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
  modalities: string[];
  setModalities: (val: string[]) => void;
  availableModalities: string[];
  skills: string[];
  setSkills: (val: string[]) => void;
  availableSkills: string[];
}

export const JobFilters: React.FC<JobFiltersProps> = ({
  search, setSearch,
  company, setCompany,
  minScore, setMinScore,
  companies,
  sortBy, setSortBy,
  modalities, setModalities,
  availableModalities,
  skills, setSkills,
  availableSkills
}) => {
  const [openDropdown, setOpenDropdown] = useState<'modalities' | 'skills' | 'company' | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleModality = (mod: string) => {
    setModalities(modalities.includes(mod) 
      ? modalities.filter(m => m !== mod) 
      : [...modalities, mod]);
  };

  const toggleSkill = (skill: string) => {
    setSkills(skills.includes(skill) 
      ? skills.filter(s => s !== skill) 
      : [...skills, skill]);
  };

  return (
    <div className="relative z-50 bg-slate-800/40 backdrop-blur-md rounded-2xl p-4 mb-6 border border-slate-700/50 shadow-lg flex flex-col gap-4">
      <div className="flex flex-col xl:flex-row gap-2 items-center w-full">
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

        <div className="flex flex-col md:flex-row flex-wrap gap-2 w-full xl:w-auto" ref={dropdownRef}>
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
          <div className="relative w-full md:w-56">
            <button
              onClick={() => setOpenDropdown(openDropdown === 'company' ? null : 'company')}
              className={`w-full flex items-center justify-between pl-3 pr-4 py-2.5 rounded-xl bg-slate-900/40 hover:bg-slate-900/60 transition-all text-sm border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${openDropdown === 'company' ? 'border-indigo-500/50 text-indigo-300' : 'border-transparent text-slate-300'}`}
            >
              <div className="flex items-center gap-2 truncate">
                <Building2 className={`h-4 w-4 shrink-0 ${company ? 'text-indigo-400' : 'text-slate-500'}`} />
                <span className="truncate">
                  {company || 'Todas las Compañías'}
                </span>
              </div>
              <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${openDropdown === 'company' ? 'rotate-180 text-indigo-400' : 'text-slate-500'}`} />
            </button>

            {openDropdown === 'company' && (
              <div className="absolute top-full left-0 mt-2 w-full min-w-[240px] bg-slate-800 border border-slate-700/50 rounded-xl shadow-2xl z-50 py-2 backdrop-blur-xl">
                <div className="max-h-60 overflow-y-auto custom-scrollbar px-2 grid grid-cols-1 gap-1">
                  <label 
                    onClick={(e) => { e.preventDefault(); setCompany(''); setOpenDropdown(null); }}
                    className="flex items-center gap-3 px-3 py-2 hover:bg-slate-700/50 rounded-lg cursor-pointer transition-colors group"
                  >
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors shrink-0 ${!company ? 'border-indigo-500 bg-indigo-500' : 'border-slate-500 bg-slate-900/50 group-hover:border-indigo-400'}`}>
                      {!company && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <span className={`text-sm group-hover:text-slate-100 ${!company ? 'text-slate-200 font-medium' : 'text-slate-300'}`}>Todas las Compañías</span>
                  </label>
                  {companies.map(c => (
                    <label 
                      key={c} 
                      onClick={(e) => { e.preventDefault(); setCompany(c); setOpenDropdown(null); }}
                      className="flex items-center gap-3 px-3 py-2 hover:bg-slate-700/50 rounded-lg cursor-pointer transition-colors group"
                    >
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors shrink-0 ${company === c ? 'border-indigo-500 bg-indigo-500' : 'border-slate-500 bg-slate-900/50 group-hover:border-indigo-400'}`}>
                        {company === c && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                      <span className={`text-sm truncate group-hover:text-slate-100 ${company === c ? 'text-slate-200 font-medium' : 'text-slate-300'}`}>{c}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Modalities Multi-Select */}
          {availableModalities.length > 0 && (
            <div className="relative w-full md:w-48">
              <button
                onClick={() => setOpenDropdown(openDropdown === 'modalities' ? null : 'modalities')}
                className={`w-full flex items-center justify-between pl-3 pr-4 py-2.5 rounded-xl bg-slate-900/40 hover:bg-slate-900/60 transition-all text-sm border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${openDropdown === 'modalities' ? 'border-indigo-500/50 text-indigo-300' : 'border-transparent text-slate-300'}`}
              >
                <div className="flex items-center gap-2 truncate">
                  <Briefcase className={`h-4 w-4 shrink-0 ${modalities.length > 0 ? 'text-indigo-400' : 'text-slate-500'}`} />
                  <span className="truncate">
                    Modalidad {modalities.length > 0 && <span className="ml-1 bg-indigo-500/20 text-indigo-300 py-0.5 px-2 rounded-full text-xs font-semibold">{modalities.length}</span>}
                  </span>
                </div>
                <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${openDropdown === 'modalities' ? 'rotate-180 text-indigo-400' : 'text-slate-500'}`} />
              </button>

              {openDropdown === 'modalities' && (
                <div className="absolute top-full left-0 mt-2 w-full min-w-[220px] bg-slate-800 border border-slate-700/50 rounded-xl shadow-2xl z-50 py-2 backdrop-blur-xl">
                  <div className="max-h-60 overflow-y-auto custom-scrollbar px-2">
                    {availableModalities.map(mod => (
                      <label 
                        key={mod} 
                        onClick={(e) => { e.preventDefault(); toggleModality(mod); }}
                        className="flex items-center gap-3 px-3 py-2 hover:bg-slate-700/50 rounded-lg cursor-pointer transition-colors group"
                      >
                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0 ${modalities.includes(mod) ? 'bg-indigo-500 border-indigo-500' : 'border-slate-500 bg-slate-900/50 group-hover:border-indigo-400'}`}>
                          {modalities.includes(mod) && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <span className="text-sm text-slate-300 group-hover:text-slate-100">{mod}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Skills Multi-Select */}
          {availableSkills.length > 0 && (
            <div className="relative w-full md:w-48">
              <button
                onClick={() => setOpenDropdown(openDropdown === 'skills' ? null : 'skills')}
                className={`w-full flex items-center justify-between pl-3 pr-4 py-2.5 rounded-xl bg-slate-900/40 hover:bg-slate-900/60 transition-all text-sm border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${openDropdown === 'skills' ? 'border-indigo-500/50 text-indigo-300' : 'border-transparent text-slate-300'}`}
              >
                <div className="flex items-center gap-2 truncate">
                  <Code2 className={`h-4 w-4 shrink-0 ${skills.length > 0 ? 'text-indigo-400' : 'text-slate-500'}`} />
                  <span className="truncate">
                    Skills {skills.length > 0 && <span className="ml-1 bg-indigo-500/20 text-indigo-300 py-0.5 px-2 rounded-full text-xs font-semibold">{skills.length}</span>}
                  </span>
                </div>
                <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${openDropdown === 'skills' ? 'rotate-180 text-indigo-400' : 'text-slate-500'}`} />
              </button>

              {openDropdown === 'skills' && (
                <div className="absolute top-full right-0 md:left-0 md:right-auto mt-2 w-[280px] bg-slate-800 border border-slate-700/50 rounded-xl shadow-2xl z-50 py-2 backdrop-blur-xl">
                  <div className="px-3 pb-2 mb-2 border-b border-slate-700/50">
                    <div className="text-xs font-medium text-slate-400 mb-2">
                      {skills.length} seleccionados
                    </div>
                    {skills.length > 0 && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); setSkills([]); }}
                        className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                      >
                        Limpiar selección
                      </button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto custom-scrollbar px-2 grid grid-cols-1 gap-1">
                    {availableSkills.map(skill => (
                      <label 
                        key={skill} 
                        onClick={(e) => { e.preventDefault(); toggleSkill(skill); }}
                        className="flex items-center gap-3 px-3 py-2 hover:bg-slate-700/50 rounded-lg cursor-pointer transition-colors group"
                      >
                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0 ${skills.includes(skill) ? 'bg-indigo-500 border-indigo-500' : 'border-slate-500 bg-slate-900/50 group-hover:border-indigo-400'}`}>
                          {skills.includes(skill) && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <span className="text-sm text-slate-300 group-hover:text-slate-100 truncate">{skill}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

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
    </div>
  );
};
