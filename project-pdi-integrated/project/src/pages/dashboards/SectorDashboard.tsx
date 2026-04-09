import { useEffect, useState } from 'react';
import {
  Sprout,
  Users,
  TrendingUp,
  GraduationCap,
  MapPin,
  BarChart3,
  Ship,
  DollarSign,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { supabase } from '../../lib/supabase';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import DashboardFilters, { type FilterState, DEFAULT_FILTERS } from '../../components/ui/DashboardFilters';
import SavedViews from '../../components/ui/SavedViews';

export default function SectorDashboard() {
  const [filters, setFilters] = useState<FilterState>({ ...DEFAULT_FILTERS });
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState({ totalJobs: 0, totalHectares: 0, totalProduction: 0, trainingReach: 0, entities: 0, programmes: 0 });
  const [trendData, setTrendData] = useState<{ period: string; jobs: number; production: number }[]>([]);
  const [programmePerf, setProgrammePerf] = useState<{ name: string; projects: number; budget: number }[]>([]);
  const [provinceDist, setProvinceDist] = useState<{ province: string; count: number }[]>([]);
  const [commercialKpis, setCommercialKpis] = useState({ cartons: 0, nett: 0, markets: 0 });
  const [marketPerf, setMarketPerf] = useState<{ name: string; cartons: number }[]>([]);

  useEffect(() => {
    async function load() {
      setLoading(true);

      const [pRes, eRes, prRes, tRes, fRes] = await Promise.all([
        supabase.from('programmes').select('id, name, budget').eq('is_deleted', false),
        supabase.from('entities').select('id, province').eq('is_deleted', false),
        supabase.from('projects').select('id, programme_id, budget').eq('is_deleted', false),
        supabase.from('training_attendance').select('id, hours_attended'),
        supabase.from('farms').select('id, hectares').eq('is_deleted', false),
      ]);

      const programmes = pRes.data ?? [];
      const entities = eRes.data ?? [];
      const projects = prRes.data ?? [];
      const attendees = tRes.data ?? [];
      const farms = fRes.data ?? [];

      const totalHectares = farms.reduce((s, f) => s + (Number(f.hectares) || 0), 0);

      const { data: histData } = await supabase
        .from('indicator_history')
        .select('period_name, period_date, value, indicators(code)')
        .order('period_date');

      const periodJobs: Record<string, { jobs: number; production: number }> = {};
      ((histData ?? []) as unknown as { period_name: string; value: number; indicators?: { code: string } }[]).forEach(h => {
        if (!periodJobs[h.period_name]) periodJobs[h.period_name] = { jobs: 0, production: 0 };
        const code = h.indicators?.code ?? '';
        if (code === 'IND-005') periodJobs[h.period_name].jobs += h.value;
        if (code === 'IND-001') periodJobs[h.period_name].production += h.value;
      });

      let totalJobs = 0;
      let totalProd = 0;
      const lastPeriod = Object.keys(periodJobs).pop();
      if (lastPeriod) {
        totalJobs = Math.round(periodJobs[lastPeriod].jobs);
        totalProd = Math.round(periodJobs[lastPeriod].production);
      }

      setKpis({
        totalJobs,
        totalHectares: Math.round(totalHectares),
        totalProduction: totalProd,
        trainingReach: attendees.length,
        entities: entities.length,
        programmes: programmes.length,
      });

      setTrendData(
        Object.entries(periodJobs)
          .map(([period, d]) => ({ period, jobs: Math.round(d.jobs), production: Math.round(d.production) }))
          .slice(-12)
      );

      const progMap: Record<string, { name: string; projects: number; budget: number }> = {};
      programmes.forEach(p => { progMap[p.id] = { name: p.name, projects: 0, budget: p.budget }; });
      projects.forEach(p => { if (p.programme_id && progMap[p.programme_id]) progMap[p.programme_id].projects++; });
      setProgrammePerf(Object.values(progMap).sort((a, b) => b.projects - a.projects));

      const provMap: Record<string, number> = {};
      entities.forEach(e => { provMap[e.province || 'Unknown'] = (provMap[e.province || 'Unknown'] ?? 0) + 1; });
      setProvinceDist(Object.entries(provMap).map(([province, count]) => ({ province, count })).sort((a, b) => b.count - a.count));

      const { data: crData } = await supabase.from('commercial_records').select('market, num_cartons, total_nett');
      const crRows = crData ?? [];
      const totalCartons = crRows.reduce((s, r) => s + (Number(r.num_cartons) || 0), 0);
      const totalNett = crRows.reduce((s, r) => s + (Number(r.total_nett) || 0), 0);
      const mktSet = new Set(crRows.map(r => r.market));
      setCommercialKpis({ cartons: totalCartons, nett: totalNett, markets: mktSet.size });

      const mktMap: Record<string, number> = {};
      crRows.forEach(r => { mktMap[r.market] = (mktMap[r.market] ?? 0) + (Number(r.num_cartons) || 0); });
      setMarketPerf(Object.entries(mktMap).map(([name, cartons]) => ({ name, cartons })).sort((a, b) => b.cartons - a.cartons).slice(0, 8));

      setLoading(false);
    }
    load();
  }, [filters]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Sector Overview</h1>
        <p className="text-sm text-gray-500 mt-1">Cross-programme performance across the deciduous fruit sector</p>
      </div>

      <div className="flex items-center gap-3">
        <SavedViews viewType="sector" currentFilters={filters} onApply={setFilters} />
      </div>

      <DashboardFilters filters={filters} onChange={setFilters} showPillar showEntity={false} />

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {[
          { label: 'Programmes', value: kpis.programmes, icon: BarChart3, color: 'bg-brand-50 text-brand-700' },
          { label: 'Entities', value: kpis.entities, icon: MapPin, color: 'bg-blue-50 text-blue-700' },
          { label: 'Total Hectares', value: kpis.totalHectares.toLocaleString(), icon: Sprout, color: 'bg-emerald-50 text-emerald-700' },
          { label: 'Jobs (Latest)', value: kpis.totalJobs.toLocaleString(), icon: Users, color: 'bg-sky-50 text-sky-700' },
          { label: 'Training Reach', value: kpis.trainingReach.toLocaleString(), icon: GraduationCap, color: 'bg-amber-50 text-amber-700' },
          { label: 'Production (Latest)', value: kpis.totalProduction.toLocaleString(), icon: TrendingUp, color: 'bg-teal-50 text-teal-700' },
        ].map(k => (
          <div key={k.label} className="card p-4">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${k.color}`}>
              <k.icon size={16} />
            </div>
            <p className="text-lg font-bold text-gray-900">{k.value}</p>
            <p className="text-xs text-gray-500">{k.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">Jobs & Production Trends</h3>
          <p className="text-xs text-gray-500 mb-4">Longitudinal employment and production data</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 5, right: 5, bottom: 5, left: -15 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="period" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }} />
                <Area type="monotone" dataKey="jobs" stroke="#0ea5e9" strokeWidth={2} fill="none" />
                <Area type="monotone" dataKey="production" stroke="#16a34a" strokeWidth={2} fill="none" strokeDasharray="4 4" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-4 justify-center mt-2 text-xs text-gray-500">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-sky-500" /> Jobs</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-brand-500" /> Production</span>
          </div>
        </div>

        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">Programme Performance</h3>
          <p className="text-xs text-gray-500 mb-4">Projects and budget by programme</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={programmePerf} layout="vertical" margin={{ top: 0, right: 5, bottom: 0, left: 5 }}>
                <XAxis type="number" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} width={120} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }} />
                <Bar dataKey="projects" fill="#16a34a" radius={[0, 4, 4, 0]} barSize={14} name="Projects" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <MapPin size={15} className="text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-900">Provincial Distribution</h3>
          </div>
          <div className="space-y-3">
            {provinceDist.map(p => {
              const maxVal = Math.max(...provinceDist.map(d => d.count), 1);
              return (
                <div key={p.province}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600">{p.province}</span>
                    <span className="text-xs font-medium text-gray-900">{p.count} entities</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-400 rounded-full" style={{ width: `${(p.count / maxVal) * 100}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={15} className="text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-900">Funding Overview</h3>
          </div>
          <div className="space-y-3">
            {programmePerf.map(p => (
              <div key={p.name} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">{p.name}</p>
                  <p className="text-xs text-gray-500">{p.projects} projects</p>
                </div>
                <p className="text-sm font-bold text-gray-900 tabular-nums">R {(p.budget / 1000000).toFixed(1)}M</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {commercialKpis.cartons > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { label: 'Export Cartons', value: commercialKpis.cartons.toLocaleString(), icon: Ship, color: 'bg-brand-50 text-brand-700' },
              { label: 'Export Nett Value', value: `R ${(commercialKpis.nett / 1000).toFixed(0)}K`, icon: DollarSign, color: 'bg-emerald-50 text-emerald-700' },
              { label: 'Export Markets', value: commercialKpis.markets.toString(), icon: MapPin, color: 'bg-sky-50 text-sky-700' },
            ].map(k => (
              <div key={k.label} className="card p-4">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${k.color}`}>
                  <k.icon size={16} />
                </div>
                <p className="text-lg font-bold text-gray-900">{k.value}</p>
                <p className="text-xs text-gray-500">{k.label}</p>
              </div>
            ))}
          </div>

          {marketPerf.length > 0 && (
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-1">Export Performance by Market</h3>
              <p className="text-xs text-gray-500 mb-4">Cartons exported by destination market</p>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={marketPerf} margin={{ top: 5, right: 5, bottom: 5, left: -10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }} />
                    <Bar dataKey="cartons" fill="#0ea5e9" radius={[4, 4, 0, 0]} barSize={28} name="Cartons" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
