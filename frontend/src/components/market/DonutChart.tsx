import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface DonutChartProps {
  title: string;
  data: Array<{ name: string; value: number }>;
  colors: string[];
}

export const DonutChart: React.FC<DonutChartProps> = ({ title, data, colors }) => {
  return (
    <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 h-full flex flex-col">
      <h3 className="text-lg font-bold text-slate-100 mb-6">{title}</h3>
      
      <div className="flex-1 w-full min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '0.5rem', color: '#f1f5f9' }}
              itemStyle={{ color: '#f1f5f9' }}
              formatter={(value: number) => [`${value}%`, '']}
            />
            <Legend 
              verticalAlign="bottom" 
              height={36} 
              iconType="circle"
              wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
