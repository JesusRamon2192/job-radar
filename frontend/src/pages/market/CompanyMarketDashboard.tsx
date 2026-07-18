import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCompanyMarketStats } from '../../hooks/useMarketStats';
import { StatCard } from '../../components/market/StatCard';
import { TrendChart } from '../../components/market/TrendChart';
import { DonutChart } from '../../components/market/DonutChart';
import { HorizontalBarChart } from '../../components/market/HorizontalBarChart';
import { Briefcase, Activity, TrendingUp, Clock, ArrowLeft } from 'lucide-react';

export const CompanyMarketDashboard: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: stats, loading } = useCompanyMarketStats(id || '');

  if (loading || !stats) {
    return (
      <div className="container mx-auto px-4 mt-8 max-w-6xl min-[1600px]:max-w-[1536px]">
        <div className="flex justify-center items-center py-32">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 mt-8 max-w-6xl min-[1600px]:max-w-[1536px] pb-12">
      {/* HEADER */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <button 
            onClick={() => navigate('/market')}
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al Mercado
          </button>
          
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white rounded-2xl overflow-hidden flex items-center justify-center border border-slate-700/50 shadow-lg">
              <img src={stats.logo} alt={stats.name} className="w-full h-full object-contain p-1.5" onError={(e) => { e.currentTarget.src = 'https://ui-avatars.com/api/?name=' + stats.name + '&background=random' }} />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-slate-100">{stats.name}</h2>
              <div className="text-emerald-400 font-medium text-sm mt-1">{stats.indicator_message}</div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col items-end">
          <div className="text-sm text-slate-400 mb-1">Hiring Score</div>
          <div className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            {stats.hiring_score}
          </div>
        </div>
      </div>

      {/* PRIMERA FILA: Tarjetas Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard 
          title="Vacantes Activas" 
          value={stats.active_jobs} 
          icon={Briefcase} 
          delay={0} 
        />
        <StatCard 
          title="Nuevas (Esta semana)" 
          value={`+${stats.weekly_added_jobs}`} 
          icon={TrendingUp} 
          trendDirection="up"
          delay={100} 
        />
        <StatCard 
          title="Promedio Diario" 
          value={stats.daily_average_jobs} 
          icon={Activity} 
          delay={200} 
        />
        <StatCard 
          title="Tiempo Prom. Abierta" 
          value={`${stats.average_open_time_days} días`} 
          icon={Clock} 
          delay={300} 
        />
      </div>

      {/* SEGUNDA FILA: Evolución e Info Extra */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <TrendChart data={stats.history} />
        </div>
        
        <div className="lg:col-span-1 flex flex-col gap-6">
          <DonutChart 
            title="Modalidad de Trabajo" 
            data={[
              { name: 'Remote', value: stats.modality.remote },
              { name: 'Hybrid', value: stats.modality.hybrid },
              { name: 'On Site', value: stats.modality.onsite }
            ]} 
            colors={['#818cf8', '#34d399', '#fbbf24']} 
          />
        </div>
      </div>

      {/* TERCERA FILA: Tecnologías y Skills */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <HorizontalBarChart data={stats.top_technologies} />
        
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-slate-100 mb-6">Ranking de Skills</h3>
          <div className="space-y-4">
            {stats.top_skills.map((skill, index) => (
              <div 
                key={skill.name} 
                className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl border border-slate-700/30 animate-slide-up"
                style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'both' }}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 font-bold">
                    #{skill.rank}
                  </div>
                  <span className="font-medium text-slate-200">{skill.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
