import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface SkillTrendTableProps {
  skills: Array<{
    name: string;
    time_period: string;
    trend: number;
    trend_direction: 'up' | 'down';
  }>;
}

export const SkillTrendTable: React.FC<SkillTrendTableProps> = ({ skills }) => {
  return (
    <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl overflow-hidden">
      <div className="p-6 border-b border-slate-700/50">
        <h3 className="text-lg font-bold text-slate-100">Skills en crecimiento</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-800/80 text-slate-400">
            <tr>
              <th className="px-6 py-4 font-medium">Skill</th>
              <th className="px-6 py-4 font-medium">Periodo</th>
              <th className="px-6 py-4 font-medium text-right">Tendencia</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {skills.map((skill, index) => (
              <tr 
                key={skill.name} 
                className="hover:bg-slate-800/60 transition-colors animate-slide-up"
                style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'both' }}
              >
                <td className="px-6 py-4 font-medium text-slate-200">{skill.name}</td>
                <td className="px-6 py-4 text-slate-400">{skill.time_period}</td>
                <td className="px-6 py-4">
                  <div className={`flex items-center justify-end gap-1.5 font-medium ${
                    skill.trend_direction === 'up' ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {skill.trend_direction === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    {skill.trend}%
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
