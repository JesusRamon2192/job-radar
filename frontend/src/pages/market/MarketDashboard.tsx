import React from 'react';
import { useMarketOverview, useMarketCompanies } from '../../hooks/useMarketStats';
import { StatCard } from '../../components/market/StatCard';
import { TrendChart } from '../../components/market/TrendChart';
import { DonutChart } from '../../components/market/DonutChart';
import { HorizontalBarChart } from '../../components/market/HorizontalBarChart';
import { CompanyRankingCard } from '../../components/market/CompanyRankingCard';
import { SkillTrendTable } from '../../components/market/SkillTrendTable';
import { Briefcase, Building2, PlusCircle, Activity, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const MarketDashboard: React.FC = () => {
  const { data: overview, loading: overviewLoading } = useMarketOverview();
  const { data: companies, loading: companiesLoading } = useMarketCompanies();
  const navigate = useNavigate();

  if (overviewLoading || companiesLoading || !overview) {
    return (
      <div className="container mx-auto px-4 mt-8 max-w-6xl min-[1600px]:max-w-[1536px]">
        <div className="flex justify-center items-center py-32">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    );
  }

  const { summary, trends, evolution, top_companies, modality, seniority, top_technologies, trending_skills, trending_companies } = overview;

  return (
    <div className="container mx-auto px-4 mt-8 max-w-6xl min-[1600px]:max-w-[1536px] pb-12">
      {/* HEADER */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent mb-2">
          Mercado Laboral LATAM
        </h2>
        <p className="text-slate-400">Analiza la evolución del mercado de tecnología utilizando datos históricos de DevLATAM.</p>
      </div>

      {/* PRIMERA FILA: Tarjetas Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard 
          title="Vacantes Activas" 
          value={summary.active_jobs} 
          icon={Briefcase} 
          trend={trends.active_jobs_trend} 
          trendDirection="up" 
          delay={0} 
        />
        <StatCard 
          title="Empresas Monitoreadas" 
          value={summary.monitored_companies} 
          icon={Building2} 
          delay={100} 
        />
        <StatCard 
          title="Vacantes Agregadas Hoy" 
          value={`+${summary.jobs_added_today}`} 
          icon={PlusCircle} 
          delay={200} 
        />
        <StatCard 
          title="Hiring Index" 
          value={summary.hiring_index} 
          icon={Activity} 
          trend={trends.hiring_index_trend} 
          trendDirection="up" 
          delay={300} 
        />
      </div>

      {/* SEGUNDA FILA: Evolución y Ranking */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <TrendChart data={evolution} />
        </div>
        <div className="lg:col-span-1">
          <CompanyRankingCard companies={top_companies} />
        </div>
      </div>

      {/* TERCERA FILA: Donut Charts (Modalidad y Seniority) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <DonutChart 
          title="Vacantes por Modalidad" 
          data={[
            { name: 'Remote', value: modality.remote },
            { name: 'Hybrid', value: modality.hybrid },
            { name: 'On Site', value: modality.onsite }
          ]} 
          colors={['#818cf8', '#34d399', '#fbbf24']} 
        />
        <DonutChart 
          title="Vacantes por Seniority" 
          data={[
            { name: 'Junior', value: seniority.junior },
            { name: 'Mid', value: seniority.mid },
            { name: 'Senior', value: seniority.senior },
            { name: 'Lead', value: seniority.lead },
            { name: 'Principal', value: seniority.principal }
          ]} 
          colors={['#94a3b8', '#60a5fa', '#818cf8', '#c084fc', '#fb7185']} 
        />
      </div>

      {/* CUARTA FILA: Tecnologías */}
      <div className="mb-6">
        <HorizontalBarChart data={top_technologies} />
      </div>

      {/* QUINTA FILA: Tabla de Skills y Tendencia Empresas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
        <SkillTrendTable skills={trending_skills} />
        
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-slate-100 mb-6">Empresas en Tendencia</h3>
          
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-4 text-emerald-400 font-medium">
                <TrendingUp className="w-5 h-5" />
                Contratando más
              </div>
              <ul className="space-y-3">
                {trending_companies.hiring_more.map((comp) => (
                  <li key={comp} className="flex items-center gap-2 text-slate-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                    {comp}
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <div className="flex items-center gap-2 mb-4 text-rose-400 font-medium">
                <TrendingDown className="w-5 h-5" />
                Disminuyendo
              </div>
              <ul className="space-y-3">
                {trending_companies.hiring_less.map((comp) => (
                  <li key={comp} className="flex items-center gap-2 text-slate-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div>
                    {comp}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* SEXTA FILA: Todas las Empresas */}
      <div>
        <h3 className="text-2xl font-bold text-slate-100 mb-6">Empresas</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {companies?.map((company, index) => (
            <div 
              key={company.id}
              className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5 hover:bg-slate-800/80 transition-all hover:border-slate-600/50 group animate-slide-up"
              style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-white rounded-xl overflow-hidden flex items-center justify-center border border-slate-700/50">
                  <img src={company.logo} alt={company.name} className="w-full h-full object-contain p-1" onError={(e) => { e.currentTarget.src = 'https://ui-avatars.com/api/?name=' + company.name + '&background=random' }} />
                </div>
                <div className="flex flex-col items-end">
                  <div className="text-xs text-slate-400 mb-1">Score</div>
                  <div className="text-sm font-bold text-indigo-400 bg-indigo-400/10 px-2 py-0.5 rounded-md">{company.hiring_score}</div>
                </div>
              </div>
              
              <h4 className="text-lg font-bold text-slate-200 mb-1">{company.name}</h4>
              <p className="text-sm text-slate-400 mb-4">{company.active_jobs} vacantes activas</p>
              
              <div className="flex items-center justify-between">
                <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                  company.trend_direction === 'up' ? 'text-emerald-400 bg-emerald-400/10' : 'text-rose-400 bg-rose-400/10'
                }`}>
                  {company.trend_direction === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {company.weekly_trend}% vs. semana ant.
                </div>
              </div>
              
              <button 
                onClick={() => navigate(`/company/${company.id}/market`)}
                className="w-full mt-4 flex items-center justify-center gap-2 py-2 text-sm font-medium text-slate-300 bg-slate-700/30 hover:bg-slate-700/60 hover:text-white rounded-lg transition-colors"
              >
                Ver estadísticas
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
