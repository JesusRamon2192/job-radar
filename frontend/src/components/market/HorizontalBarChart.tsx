import React from 'react';

interface HorizontalBarChartProps {
  data: Array<{ name: string; percentage: number }>;
}

export const HorizontalBarChart: React.FC<HorizontalBarChartProps> = ({ data }) => {
  return (
    <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6">
      <h3 className="text-lg font-bold text-slate-100 mb-6">Tecnologías más demandadas</h3>
      
      <div className="space-y-4">
        {data.map((item, index) => (
          <div key={item.name} className="relative">
            <div className="flex justify-between text-sm font-medium mb-1.5">
              <span className="text-slate-300">{item.name}</span>
              <span className="text-indigo-400">{item.percentage}%</span>
            </div>
            <div className="h-2 w-full bg-slate-700/50 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full animate-slide-right"
                style={{ 
                  width: `${item.percentage}%`,
                  animationDelay: `${index * 100}ms`,
                  animationFillMode: 'both'
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
