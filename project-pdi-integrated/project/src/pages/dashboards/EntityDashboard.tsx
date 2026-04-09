import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  FolderKanban,
  Sprout,
  TrendingUp,
  GraduationCap,
  Award,
  ClipboardList,
  ArrowUp,
  ArrowDown,
  Minus,
  MapPin,
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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  Legend,
} from 'recharts';
import { supabase } from '../../lib/supabase';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import StatusBadge from '../../components/ui/StatusBadge';
import { getPillarConfig } from '../../lib/pillars';
import { getPdiBenchmarks, getPdiEntityFarmStats, getPdiEntityMeta, getPdiEntityOptions, getPdiEntityTrend } from '../../lib/pdi';
import type { IndicatorPillar } from '../../types';

interface EntityOption {
  id: string;
  name: string;
  type: string;
  region: string;
  province: string;
  is_active: boolean;
}

interface ProjectRow {
  id: string;
  name: string;
  code: string;
  status: string;
  budget: number;
  programmes?: { name: string };
}

interface SubmissionRow {
  id: string;
  status: string;
  created_at: string;
  projects?: { name: string };
  reporting_periods?: { name: string };
}

interface BenchmarkRow {
  indicator_id: string;
  entity_value: number;
  regional_avg: number;
  programme_avg: number;
  sector_avg: number;
  percentile_rank: number;
  indicators?: { name: string; code: string; unit: string; pillar: IndicatorPillar };
}

interface TrendPoint {
  period: string;
  value: number;
}

export default function EntityDashboard() {
  const [searchParams] = useSearchParams();
  const preEntity = searchParams.get('entity') ?? '';
  const [entities, setEntities] = useState<EntityOption[]>([]);
  const [selectedEntity, setSelectedEntity] = useState(preEntity);
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);

  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionRow[]>([]);
  const [benchmarks, setBenchmarks] = useState<BenchmarkRow[]>([]);
  const [trendData, setTrendData] = useState<TrendPoint[]>([]);
  const [farmStats, setFarmStats] = useState({ count: 0, hectares: 0 });
  const [trainingStats, setTrainingStats] = useState({ sessions: 0, attendees: 0 });
  const [commercialStats, setCommercialStats] = useState({ cartons: 0, nett: 0 });
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    async function init() {
      const { data } = await supabase
        .from('entities')
        .select('id, name, type, region, province, is_active')
        .eq('is_deleted', false)
        .order('name');
      const dbList = data ?? [];
      if (dbList.length === 0) {
        const fallbackList = getPdiEntityOptions().map(item => ({ id: item.id, name: item.name, type: 'PDI entity', region: item.region, province: item.province, is_active: true }));
        setUsingFallback(true);
        setEntities(fallbackList);
        if (!preEntity && fallbackList.length > 0) setSelectedEntity(fallbackList[0].id);
      } else {
        setEntities(dbList);
        if (!preEntity && dbList.length > 0) setSelectedEntity(dbList[0].id);
      }
      setLoading(false);
    }
    init();
  }, [preEntity]);

  const loadEntityData = useCallback(async () => {
    if (!selectedEntity) return;
    setDataLoading(true);

    if (usingFallback) {
      setProjects([]);
      setSubmissions([]);
      setFarmStats(getPdiEntityFarmStats(selectedEntity));
      setBenchmarks(getPdiBenchmarks(selectedEntity, '2025') as BenchmarkRow[]);
      setTrainingStats({ sessions: 0, attendees: 0 });
      setCommercialStats({ cartons: 0, nett: 0 });
      setTrendData(getPdiEntityTrend(selectedEntity));
      setDataLoading(false);
      return;
    }

    const [projRes, subRes, farmRes, benchRes, trainRes] = await Promise.all([
      supabase
        .from('projects')
        .select('id, name, code, status, budget, programmes(name)')
        .eq('entity_id', selectedEntity)
        .eq('is_deleted', false)
        .order('name'),
      supabase
        .from('submissions')
        .select('id, status, created_at, projects(name), reporting_periods(name)')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .limit(10),
      supabase
        .from('farms')
        .select('id, hectares')
        .eq('entity_id', selectedEntity)
        .eq('is_deleted', false),
      supabase
        .from('benchmark_snapshots')
        .select('indicator_id, entity_value, regional_avg, programme_avg, sector_avg, percentile_rank, indicators(name, code, unit, pillar)')
        .eq('entity_id', selectedEntity)
        .order('snapshot_date', { ascending: false })
        .limit(20),
      supabase
        .from('training_sessions')
        .select('id, training_attendance(id)')
        .eq('entity_id', selectedEntity)
        .eq('is_deleted', false),
    ]);

    const projList = (projRes.data ?? []) as unknown as ProjectRow[];
    setProjects(projList);

    setSubmissions(((subRes.data ?? []) as unknown as SubmissionRow[]).slice(0, 10));
    const projIds = projList.map(p => p.id);

    const farms = farmRes.data ?? [];
    setFarmStats({
      count: farms.length,
      hectares: Math.round(farms.reduce((s, f) => s + (Number(f.hectares) || 0), 0)),
    });

    const benchData = (benchRes.data ?? []) as unknown as BenchmarkRow[];
    const uniqueBench = Array.from(
      benchData.reduce((map, b) => {
        if (!map.has(b.indicator_id)) map.set(b.indicator_id, b);
        return map;
      }, new Map<string, BenchmarkRow>()).values()
    );
    setBenchmarks(uniqueBench);

    const trainSessions = trainRes.data ?? [];
    const totalAttendees = trainSessions.reduce(
      (s, t) => s + ((t.training_attendance as unknown as { id: string }[])?.length ?? 0),
      0
    );
    setTrainingStats({ sessions: trainSessions.length, attendees: totalAttendees });

    const { data: crData } = await supabase.from('commercial_records').select('num_cartons, total_nett');
    const crRows = crData ?? [];
    setCommercialStats({
      cartons: crRows.reduce((s, r) => s + (Number(r.num_cartons) || 0), 0),
      nett: crRows.reduce((s, r) => s + (Number(r.total_nett) || 0), 0),
    });

    if (projIds.length > 0) {
      const { data: histData } = await supabase
        .from('indicator_history')
        .select('period_name, period_date, value')
        .in('project_id', projIds.slice(0, 5))
        .order('period_date');
      const periodMap: Record<string, { sum: number; count: number }> = {};
      (histData ?? []).forEach(h => {
        if (!periodMap[h.period_name]) periodMap[h.period_name] = { sum: 0, count: 0 };
        periodMap[h.period_name].sum += h.value;
        periodMap[h.period_name].count++;
      });
      setTrendData(
        Object.entries(periodMap)
          .map(([period, d]) => ({ period, value: Math.round(d.sum / d.count) }))
          .slice(-12)
      );
    } else {
      setTrendData([]);
    }

    setDataLoading(false);
  }, [selectedEntity, usingFallback]);

  useEffect(() => { loadEntityData(); }, [loadEntityData]);

  if (loading) return <LoadingSpinner />;

  const entity = entities.find(e => e.id === selectedEntity);
  const fallbackMeta = usingFallback ? getPdiEntityMeta(selectedEntity) : null;
  const avgPercentile = benchmarks.length > 0
    ? Math.round(benchmarks.reduce((s, b) => s + b.percentile_rank, 0) / benchmarks.length)
    : 0;
  const activeProjects = projects.filter(p => p.status === 'active').length;
  const totalBudget = projects.reduce((s, p) => s + (p.budget ?? 0), 0);

  const radarData = benchmarks.slice(0, 6).map(b => ({
    indicator: b.indicators?.code ?? '',
    entity: Math.min(100, b.percentile_rank),
    regional: Math.min(100, b.regional_avg > 0 ? (b.regional_avg / Math.max(b.entity_value, b.regional_avg, 1)) * 100 : 0),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Entity Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            {entity ? `${entity.name} - ${entity.region}, ${entity.province}` : 'Select an entity'}
            {usingFallback && fallbackMeta ? ` · ${fallbackMeta.business_type}` : ''}
          </p>
        </div>
        <select
          value={selectedEntity}
          onChange={e => setSelectedEntity(e.target.value)}
          className="input-field w-auto text-sm"
        >
          {entities.map(e => (
            <option key={e.id} value={e.id}>{e.name}</option>
          ))}
        </select>
      </div>

      {dataLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: 'Projects', value: projects.length, sub: `${activeProjects} active`, icon: FolderKanban, color: 'bg-brand-50 text-brand-700' },
              { label: 'Budget', value: `R ${(totalBudget / 1000000).toFixed(1)}M`, sub: 'allocated', icon: TrendingUp, color: 'bg-amber-50 text-amber-700' },
              { label: 'Farms', value: farmStats.count, sub: `${farmStats.hectares.toLocaleString()} ha`, icon: Sprout, color: 'bg-emerald-50 text-emerald-700' },
              { label: 'Training', value: trainingStats.sessions, sub: `${trainingStats.attendees} attendees`, icon: GraduationCap, color: 'bg-sky-50 text-sky-700' },
              { label: 'Avg Percentile', value: `${avgPercentile}th`, sub: 'vs peers', icon: Award, color: 'bg-teal-50 text-teal-700' },
              { label: 'Submissions', value: submissions.length, sub: 'recent', icon: ClipboardList, color: 'bg-blue-50 text-blue-700' },
            ].map(k => (
              <div key={k.label} className="card p-4">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${k.color}`}>
                  <k.icon size={16} />
                </div>
                <p className="text-lg font-bold text-gray-900">{k.value}</p>
                <p className="text-[11px] text-gray-500">{k.sub}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-1">Indicator Trend (Avg)</h3>
              <p className="text-xs text-gray-500 mb-4">Average indicator values across entity projects</p>
              {trendData.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-12">No trend data available</p>
              ) : (
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData} margin={{ top: 5, right: 5, bottom: 5, left: -15 }}>
                      <defs>
                        <linearGradient id="entityTrendGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#16a34a" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="period" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }} />
                      <Area type="monotone" dataKey="value" stroke="#16a34a" strokeWidth={2} fill="url(#entityTrendGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            <div className="card p-5">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-semibold text-gray-900">Benchmark Radar</h3>
                <Link to={`/benchmarking?entity=${selectedEntity}`} className="text-xs text-brand-700 hover:text-brand-800 font-medium">
                  Full benchmarks
                </Link>
              </div>
              <p className="text-xs text-gray-500 mb-3">Percentile ranking vs regional average</p>
              {benchmarks.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-12">No benchmark data available</p>
              ) : (
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="#e5e7eb" />
                      <PolarAngleAxis dataKey="indicator" tick={{ fontSize: 10, fill: '#6b7280' }} />
                      <Radar name="Entity" dataKey="entity" stroke="#16a34a" fill="#16a34a" fillOpacity={0.2} strokeWidth={2} />
                      <Radar name="Regional Avg" dataKey="regional" stroke="#9ca3af" fill="none" strokeDasharray="4 4" />
                      <Legend iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FolderKanban size={15} className="text-gray-400" />
                  <h3 className="text-sm font-semibold text-gray-900">Projects</h3>
                </div>
                <span className="text-xs text-gray-400">{projects.length} total</span>
              </div>
              {projects.length === 0 ? (
                <p className="p-6 text-center text-sm text-gray-400">No projects linked</p>
              ) : (
                <div className="divide-y divide-gray-100">
                  {projects.map(p => (
                    <Link
                      key={p.id}
                      to={`/projects/${p.id}`}
                      className="flex items-center justify-between px-4 py-3 hover:bg-gray-50/50 transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {p.code} {(p.programmes as { name: string } | undefined)?.name ? `- ${(p.programmes as { name: string }).name}` : ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-500 tabular-nums">R {p.budget?.toLocaleString()}</span>
                        <StatusBadge status={p.status} />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="card">
              <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ClipboardList size={15} className="text-gray-400" />
                  <h3 className="text-sm font-semibold text-gray-900">Recent Submissions</h3>
                </div>
                <Link to="/data-collection" className="text-xs text-brand-700 hover:text-brand-800 font-medium">View all</Link>
              </div>
              {submissions.length === 0 ? (
                <p className="p-6 text-center text-sm text-gray-400">No submissions</p>
              ) : (
                <div className="divide-y divide-gray-100">
                  {submissions.map(sub => (
                    <Link
                      key={sub.id}
                      to={`/data-collection/${sub.id}`}
                      className="flex items-center justify-between px-4 py-3 hover:bg-gray-50/50 transition-colors"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {(sub.projects as { name: string } | undefined)?.name ?? '-'}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {(sub.reporting_periods as { name: string } | undefined)?.name ?? ''} - {new Date(sub.created_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })}
                        </p>
                      </div>
                      <StatusBadge status={sub.status} />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {benchmarks.length > 0 && (
            <div className="card">
              <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award size={15} className="text-gray-400" />
                  <h3 className="text-sm font-semibold text-gray-900">Benchmark Summary</h3>
                </div>
                <Link to={`/benchmarking?entity=${selectedEntity}`} className="text-xs text-brand-700 hover:text-brand-800 font-medium">
                  View full comparison
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-2.5">Indicator</th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-2.5">Pillar</th>
                      <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-2.5">Value</th>
                      <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-2.5">Prog. Avg</th>
                      <th className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-2.5">Rank</th>
                      <th className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-2.5">vs Avg</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {benchmarks.slice(0, 8).map(b => {
                      const ind = b.indicators;
                      const pillarCfg = ind ? getPillarConfig(ind.pillar) : null;
                      const diff = b.entity_value - b.programme_avg;
                      const pctDiff = b.programme_avg > 0 ? Math.round((diff / b.programme_avg) * 100) : 0;
                      return (
                        <tr key={b.indicator_id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-4 py-2.5">
                            <p className="text-sm font-medium text-gray-900">{ind?.name ?? '-'}</p>
                            <p className="text-xs text-gray-400">{ind?.code}</p>
                          </td>
                          <td className="px-4 py-2.5">
                            {pillarCfg && (
                              <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-medium ring-1 ring-inset ${pillarCfg.color} ${pillarCfg.bgColor} ${pillarCfg.ringColor}`}>
                                {pillarCfg.label}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-2.5 text-sm font-bold text-gray-900 text-right tabular-nums">
                            {Math.round(b.entity_value).toLocaleString()}
                          </td>
                          <td className="px-4 py-2.5 text-sm text-gray-500 text-right tabular-nums">
                            {Math.round(b.programme_avg).toLocaleString()}
                          </td>
                          <td className="px-4 py-2.5 text-center">
                            <div className="inline-flex items-center gap-1">
                              <div className="w-14 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${b.percentile_rank >= 75 ? 'bg-emerald-500' : b.percentile_rank >= 50 ? 'bg-brand-500' : b.percentile_rank >= 25 ? 'bg-amber-500' : 'bg-red-500'}`}
                                  style={{ width: `${b.percentile_rank}%` }}
                                />
                              </div>
                              <span className="text-xs text-gray-500 w-8">{b.percentile_rank}%</span>
                            </div>
                          </td>
                          <td className="px-4 py-2.5 text-center">
                            <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${pctDiff > 0 ? 'text-emerald-600' : pctDiff < 0 ? 'text-red-600' : 'text-gray-400'}`}>
                              {pctDiff > 0 ? <ArrowUp size={11} /> : pctDiff < 0 ? <ArrowDown size={11} /> : <Minus size={11} />}
                              {Math.abs(pctDiff)}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {commercialStats.cartons > 0 && (
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Ship size={15} className="text-gray-400" />
                  <h3 className="text-sm font-semibold text-gray-900">Commercial / Export</h3>
                </div>
                <Link to="/commercial/trends" className="text-xs text-brand-700 hover:text-brand-800 font-medium">View trends</Link>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-900">{commercialStats.cartons.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">Cartons</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-900">R {(commercialStats.nett / 1000).toFixed(0)}K</p>
                  <p className="text-xs text-gray-500">Nett Value</p>
                </div>
              </div>
            </div>
          )}

          {entity && (
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-4">
                <MapPin size={15} className="text-gray-400" />
                <h3 className="text-sm font-semibold text-gray-900">Entity Details</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Type</p>
                  <p className="font-medium text-gray-900 capitalize">{entity.type}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Region</p>
                  <p className="font-medium text-gray-900">{entity.region}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Province</p>
                  <p className="font-medium text-gray-900">{entity.province}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Status</p>
                  <StatusBadge status={entity.is_active ? 'active' : 'inactive'} />
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
