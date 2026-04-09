import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  FolderKanban,
  Building2,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  MapPin,
  BarChart3,
  Ship,
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
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { supabase } from '../../lib/supabase';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import StatusBadge from '../../components/ui/StatusBadge';
import DashboardFilters, { type FilterState, DEFAULT_FILTERS } from '../../components/ui/DashboardFilters';
import SavedViews from '../../components/ui/SavedViews';
import { PILLARS } from '../../lib/pillars';

interface ProgrammeRow {
  id: string;
  name: string;
  code: string;
  status: string;
  budget: number;
}

export default function ProgrammeDashboard() {
  const [searchParams] = useSearchParams();
  const preselectedProg = searchParams.get('id') ?? '';
  const [filters, setFilters] = useState<FilterState>({ ...DEFAULT_FILTERS, programme_id: preselectedProg });
  const [programmes, setProgrammes] = useState<ProgrammeRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [kpis, setKpis] = useState({ projects: 0, entities: 0, budget: 0, submissions: 0 });
  const [trendData, setTrendData] = useState<{ period: string; value: number }[]>([]);
  const [regionalData, setRegionalData] = useState<{ region: string; count: number }[]>([]);
  const [statusData, setStatusData] = useState<{ name: string; value: number; color: string }[]>([]);
  const [riskItems, setRiskItems] = useState<{ id: string; name: string; status: string; budget: number }[]>([]);
  const [pillarData, setPillarData] = useState<{ pillar: string; count: number }[]>([]);
  const [commercialSummary, setCommercialSummary] = useState({ records: 0, cartons: 0, nett: 0 });

  const load = useCallback(async () => {
    setLoading(true);
    const { data: progs } = await supabase.from('programmes').select('id, name, code, status, budget').eq('is_deleted', false).order('name');
    setProgrammes(progs ?? []);

    let projectQuery = supabase.from('projects').select('id, name, status, budget, entity_id, entities(region, province)').eq('is_deleted', false);
    if (filters.programme_id) projectQuery = projectQuery.eq('programme_id', filters.programme_id);
    if (filters.province) projectQuery = projectQuery.eq('entities.province', filters.province);
    const { data: projects } = await projectQuery;
    const projList = (projects ?? []) as unknown as { id: string; name: string; status: string; budget: number; entity_id: string; entities?: { region: string; province: string } }[];

    const entityIds = [...new Set(projList.map(p => p.entity_id).filter(Boolean))];
    const totalBudget = filters.programme_id
      ? (progs ?? []).filter(p => p.id === filters.programme_id).reduce((s, p) => s + (p.budget ?? 0), 0)
      : (progs ?? []).reduce((s, p) => s + (p.budget ?? 0), 0);

    let subCount = 0;
    if (projList.length > 0) {
      const { count } = await supabase.from('submissions').select('id', { count: 'exact', head: true })
        .eq('is_deleted', false)
        .in('project_id', projList.map(p => p.id));
      subCount = count ?? 0;
    }

    setKpis({ projects: projList.length, entities: entityIds.length, budget: totalBudget, submissions: subCount });

    const regionMap: Record<string, number> = {};
    projList.forEach(p => {
      const r = p.entities?.region ?? 'Unknown';
      regionMap[r] = (regionMap[r] ?? 0) + 1;
    });
    setRegionalData(Object.entries(regionMap).map(([region, count]) => ({ region, count })).sort((a, b) => b.count - a.count));

    const statMap: Record<string, number> = {};
    projList.forEach(p => { statMap[p.status] = (statMap[p.status] ?? 0) + 1; });
    const statusColors: Record<string, string> = { active: '#10b981', planned: '#3b82f6', completed: '#14b8a6', inactive: '#9ca3af' };
    setStatusData(Object.entries(statMap).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value, color: statusColors[name] ?? '#6b7280' })));

    const overBudgetOrLate = projList.filter(p => p.status === 'active' && p.budget > 500000).slice(0, 5);
    setRiskItems(overBudgetOrLate);

    let indQuery = supabase.from('indicators').select('pillar').eq('is_deleted', false);
    if (filters.programme_id) indQuery = indQuery.eq('programme_id', filters.programme_id);
    const { data: inds } = await indQuery;
    const pillarMap: Record<string, number> = {};
    (inds ?? []).forEach(i => { pillarMap[i.pillar] = (pillarMap[i.pillar] ?? 0) + 1; });
    setPillarData(PILLARS.map(p => ({ pillar: p.label, count: pillarMap[p.key] ?? 0 })));

    if (projList.length > 0) {
      const { data: histData } = await supabase
        .from('indicator_history')
        .select('period_name, period_date, value')
        .in('project_id', projList.slice(0, 5).map(p => p.id))
        .order('period_date');
      const periodMap: Record<string, { sum: number; count: number }> = {};
      (histData ?? []).forEach(h => {
        if (!periodMap[h.period_name]) periodMap[h.period_name] = { sum: 0, count: 0 };
        periodMap[h.period_name].sum += h.value;
        periodMap[h.period_name].count++;
      });
      setTrendData(Object.entries(periodMap).map(([period, d]) => ({ period, value: Math.round(d.sum / d.count) })).slice(-12));
    }

    const { data: crData } = await supabase.from('commercial_records').select('num_cartons, total_nett');
    const crRows = crData ?? [];
    setCommercialSummary({
      records: crRows.length,
      cartons: crRows.reduce((s, r) => s + (Number(r.num_cartons) || 0), 0),
      nett: crRows.reduce((s, r) => s + (Number(r.total_nett) || 0), 0),
    });

    setLoading(false);
  }, [filters.programme_id, filters.province]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Programme Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            {filters.programme_id ? programmes.find(p => p.id === filters.programme_id)?.name ?? 'Selected programme' : 'All programmes overview'}
          </p>
        </div>
        <div className="flex gap-2">
          {programmes.map(p => (
            <button
              key={p.id}
              onClick={() => setFilters(prev => ({ ...prev, programme_id: prev.programme_id === p.id ? '' : p.id }))}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${filters.programme_id === p.id ? 'bg-brand-50 border-brand-300 text-brand-700' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}
            >
              {p.code}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <SavedViews viewType="programme" currentFilters={filters} onApply={setFilters} />
      </div>

      <DashboardFilters filters={filters} onChange={setFilters} showPillar showEntity={false} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Projects', value: kpis.projects, icon: FolderKanban, color: 'bg-brand-50 text-brand-700' },
          { label: 'Entities', value: kpis.entities, icon: Building2, color: 'bg-blue-50 text-blue-700' },
          { label: 'Total Budget', value: `R ${(kpis.budget / 1000000).toFixed(1)}M`, icon: DollarSign, color: 'bg-amber-50 text-amber-700' },
          { label: 'Submissions', value: kpis.submissions, icon: TrendingUp, color: 'bg-teal-50 text-teal-700' },
        ].map(k => (
          <div key={k.label} className="card p-5">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${k.color}`}>
              <k.icon size={20} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{k.value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{k.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">Indicator Trend (Avg)</h3>
          <p className="text-xs text-gray-500 mb-4">Average indicator values across projects over time</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 5, right: 5, bottom: 5, left: -15 }}>
                <defs>
                  <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="period" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }} />
                <Area type="monotone" dataKey="value" stroke="#16a34a" strokeWidth={2} fill="url(#trendGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">Project Status</h3>
          <p className="text-xs text-gray-500 mb-3">Distribution by current status</p>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                  {statusData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center mt-1">
            {statusData.map(s => (
              <span key={s.name} className="flex items-center gap-1.5 text-xs text-gray-600">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                {s.name} ({s.value})
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <MapPin size={15} className="text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-900">Regional Breakdown</h3>
          </div>
          <div className="space-y-2.5">
            {regionalData.slice(0, 8).map(r => {
              const maxVal = Math.max(...regionalData.map(d => d.count), 1);
              return (
                <div key={r.region}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600">{r.region}</span>
                    <span className="text-xs font-medium text-gray-900">{r.count}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-400 rounded-full" style={{ width: `${(r.count / maxVal) * 100}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={15} className="text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-900">Indicators by Pillar</h3>
          </div>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pillarData} layout="vertical" margin={{ top: 0, right: 5, bottom: 0, left: 5 }}>
                <XAxis type="number" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="pillar" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} width={90} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }} />
                <Bar dataKey="count" fill="#16a34a" radius={[0, 4, 4, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={15} className="text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-900">High-Value Active Projects</h3>
          </div>
          {riskItems.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-4">No items</p>
          ) : (
            <div className="space-y-2.5">
              {riskItems.map(r => (
                <Link key={r.id} to={`/projects/${r.id}`} className="flex items-center justify-between py-1.5 hover:bg-gray-50 rounded px-1 -mx-1 transition-colors">
                  <div>
                    <p className="text-xs font-medium text-gray-900">{r.name}</p>
                    <p className="text-[11px] text-gray-400">R {r.budget.toLocaleString()}</p>
                  </div>
                  <StatusBadge status={r.status} />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {commercialSummary.records > 0 && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Ship size={15} className="text-gray-400" />
              <h3 className="text-sm font-semibold text-gray-900">Commercial / Export Summary</h3>
            </div>
            <Link to="/commercial/trends" className="text-xs text-brand-700 hover:text-brand-800 font-medium">View details</Link>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-lg font-bold text-gray-900">{commercialSummary.records.toLocaleString()}</p>
              <p className="text-xs text-gray-500">Records</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-gray-900">{commercialSummary.cartons.toLocaleString()}</p>
              <p className="text-xs text-gray-500">Cartons</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-gray-900">R {(commercialSummary.nett / 1000).toFixed(0)}K</p>
              <p className="text-xs text-gray-500">Nett Value</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
