import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: number;
  trendDirection?: 'up' | 'down';
  trendLabel?: string;
  delay?: number;
}

export const StatCard: React.FC<StatCardProps> = ({ 
  title, value, icon: Icon, trend, trendDirection, trendLabel, delay = 0 
}) => {
  return (
    <div 
      className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 hover:bg-slate-800/60 transition-all hover:border-slate-600/50 hover:shadow-lg hover:shadow-indigo-500/5 animate-slide-up"
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'both' }}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400">
          <Icon className="w-6 h-6" />
        </div>
        
        {trend !== undefined && trendDirection && (
          <div className={`flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-full ${
            trendDirection === 'up' ? 'text-emerald-400 bg-emerald-400/10' : 'text-rose-400 bg-rose-400/10'
          }`}>
            {trendDirection === 'up' ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            {trend}% {trendLabel && <span className="text-xs opacity-80 font-normal ml-1">{trendLabel}</span>}
          </div>
        )}
      </div>
      
      <div>
        <h3 className="text-slate-400 text-sm font-medium mb-1">{title}</h3>
        <div className="text-3xl font-bold text-slate-100">{value}</div>
      </div>
    </div>
  );
};
