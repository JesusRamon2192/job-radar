import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface TrendChartProps {
  data: Array<{ date: string; vacancies: number }>;
}

export const TrendChart: React.FC<TrendChartProps> = ({ data }) => {
  const [filter, setFilter] = useState<'30' | '90' | '365' | 'all'>('30');

  // Forma básica de filtrar (idealmente se hace con datos reales)
  const filteredData = React.useMemo(() => {
    if (filter === 'all') return data;
    const daysToKeep = parseInt(filter);
    // Asume que los últimos elementos son los más recientes
    return data.slice(Math.max(data.length - (daysToKeep / 30), 0)); 
  }, [data, filter]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-100">Evolución de Vacantes</h3>
          <p className="text-sm text-slate-400">Total de vacantes activas en el tiempo</p>
        </div>
        
        <div className="flex bg-slate-900/80 p-1 rounded-lg border border-slate-700/50">
          {[
            { id: '30', label: '30d' },
            { id: '90', label: '90d' },
            { id: '365', label: '1a' },
            { id: 'all', label: 'Todo' }
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id as any)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                filter === f.id 
                  ? 'bg-indigo-500/20 text-indigo-300' 
                  : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>
      
      <div className="flex-1 w-full min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={filteredData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorVacancies" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatDate} 
              stroke="#64748b" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis 
              stroke="#64748b" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
              dx={-10}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '0.5rem', color: '#f1f5f9' }}
              itemStyle={{ color: '#818cf8' }}
              labelFormatter={formatDate}
            />
            <Area 
              type="monotone" 
              dataKey="vacancies" 
              name="Vacantes"
              stroke="#818cf8" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorVacancies)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
