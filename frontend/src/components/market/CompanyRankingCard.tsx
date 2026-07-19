import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Link } from 'react-router-dom';

interface CompanyRankingProps {
  companies: Array<{
    id: string;
    name: string;
    active_jobs: number;
    trend: number;
    trend_direction: 'up' | 'down';
  }>;
}

export const CompanyRankingCard: React.FC<CompanyRankingProps> = ({ companies }) => {
  return (
    <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 h-full">
      <h3 className="text-lg font-bold text-slate-100 mb-6">Top Empresas Contratando</h3>
      
      <div className="space-y-4">
        {companies.map((company, index) => (
          <Link 
            key={company.id} 
            to={`/company/${company.id}/market`}
            className="flex items-center justify-between p-3 bg-slate-800/50 hover:bg-slate-700/50 rounded-xl border border-slate-700/30 hover:border-slate-600 transition-all group animate-slide-up"
            style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'both' }}
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-6 h-6 rounded-md bg-slate-700 text-xs font-bold text-slate-300 group-hover:text-white group-hover:bg-indigo-500 transition-colors">
                {index + 1}
              </div>
              <div>
                <div className="font-medium text-slate-200 group-hover:text-indigo-300 transition-colors">{company.name}</div>
                <div className="text-xs text-slate-400">{company.active_jobs} vacantes</div>
              </div>
            </div>
            
            <div className={`flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-full ${
              company.trend_direction === 'up' ? 'text-emerald-400 bg-emerald-400/10' : 'text-rose-400 bg-rose-400/10'
            }`}>
              {company.trend_direction === 'up' ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              {company.trend}%
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
