import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BarChart3, Award, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar, Legend } from 'recharts';
import { supabase } from '../lib/supabase';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { getPillarConfig } from '../lib/pillars';
import { getPdiBenchmarks, getPdiEntityOptions, getPdiPeriods } from '../lib/pdi';
import type { IndicatorPillar } from '../types';

interface BenchmarkRow {
  id: string;
  entity_id: string;
  indicator_id: string;
  period_name: string;
  entity_value: number;
  regional_avg: number;
  programme_avg: number;
  sector_avg: number;
  percentile_rank: number;
  entities?: { name: string; region: string };
  indicators?: { name: string; code: string; unit: string; pillar: IndicatorPillar };
}

export default function Benchmarking() {
  const [searchParams] = useSearchParams();
  const preEntity = searchParams.get('entity') ?? '';
  const fallbackEntities = getPdiEntityOptions();
  const fallbackPeriods = getPdiPeriods();

  const [entities, setEntities] = useState<{ id: string; name: string; region: string }[]>(fallbackEntities);
  const [selectedEntity, setSelectedEntity] = useState(preEntity || fallbackEntities[0]?.id || '');
  const [selectedPeriod, setSelectedPeriod] = useState(fallbackPeriods[fallbackPeriods.length - 1] ?? '2025');
  const [benchmarks, setBenchmarks] = useState<BenchmarkRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [periods, setPeriods] = useState<string[]>(fallbackPeriods);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    async function init() {
      const [eRes, pRes] = await Promise.all([
        supabase.from('entities').select('id, name, region').eq('is_deleted', false).order('name'),
        supabase.from('benchmark_snapshots').select('period_name').order('snapshot_date'),
      ]);

      const dbEntities = eRes.data ?? [];
      const dbPeriods = [...new Set((pRes.data ?? []).map(p => p.period_name))];
      const useFallback = dbEntities.length === 0 || dbPeriods.length === 0;
      setUsingFallback(useFallback);
      setEntities(useFallback ? fallbackEntities : dbEntities);
      setPeriods(useFallback ? fallbackPeriods : dbPeriods);

      if (!preEntity) {
        const firstEntity = (useFallback ? fallbackEntities : dbEntities)[0]?.id ?? '';
        setSelectedEntity(firstEntity);
      }
      if (useFallback && fallbackPeriods.length > 0) {
        setSelectedPeriod(fallbackPeriods[fallbackPeriods.length - 1]);
      } else if (dbPeriods.length > 0) {
        setSelectedPeriod(dbPeriods[0]);
      }
      setLoading(false);
    }
    init();
  }, [preEntity]);

  const loadBenchmarks = useCallback(async () => {
    if (!selectedEntity || !selectedPeriod) return;
    if (usingFallback) {
      setBenchmarks(getPdiBenchmarks(selectedEntity, selectedPeriod) as BenchmarkRow[]);
      return;
    }
    const { data } = await supabase
      .from('benchmark_snapshots')
      .select('*, entities(name, region), indicators(name, code, unit, pillar)')
      .eq('entity_id', selectedEntity)
      .eq('period_name', selectedPeriod)
      .order('indicators(code)');
    setBenchmarks((data ?? []) as unknown as BenchmarkRow[]);
  }, [selectedEntity, selectedPeriod, usingFallback]);

  useEffect(() => { loadBenchmarks(); }, [loadBenchmarks]);

  if (loading) return <LoadingSpinner />;

  const entityName = entities.find(e => e.id === selectedEntity)?.name ?? 'Select entity';

  const radarData = benchmarks.slice(0, 6).map(b => ({
    indicator: b.indicators?.code ?? '',
    entity: Math.min(100, b.percentile_rank),
    regional: Math.min(100, b.regional_avg > 0 ? (b.regional_avg / Math.max(b.entity_value, b.regional_avg, 1)) * 100 : 0),
    sector: Math.min(100, b.sector_avg > 0 ? (b.sector_avg / Math.max(b.entity_value, b.sector_avg, 1)) * 100 : 0),
  }));

  const avgPercentile = benchmarks.length > 0 ? Math.round(benchmarks.reduce((s, b) => s + b.percentile_rank, 0) / benchmarks.length) : 0;
  const aboveAvgCount = benchmarks.filter(b => b.entity_value > b.programme_avg).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Benchmarking</h1>
          <p className="text-sm text-gray-500 mt-1">Compare {entityName} against peers, region, and sector averages</p>
          {usingFallback && <p className="text-xs text-amber-600 mt-1">Using uploaded PDI workbook data as the live benchmark source.</p>}
        </div>
        <div className="flex gap-2">
          <select value={selectedEntity} onChange={e => setSelectedEntity(e.target.value)} className="input-field w-auto text-sm">
            {entities.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
          <select value={selectedPeriod} onChange={e => setSelectedPeriod(e.target.value)} className="input-field w-auto text-sm">
            {periods.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-5 text-center">
          <div className="w-12 h-12 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center mx-auto mb-3"><Award size={24} /></div>
          <p className="text-3xl font-bold text-gray-900">{avgPercentile}<span className="text-lg text-gray-400">th</span></p>
          <p className="text-sm text-gray-500 mt-1">Average Percentile</p>
        </div>
        <div className="card p-5 text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-3"><ArrowUp size={24} /></div>
          <p className="text-3xl font-bold text-gray-900">{aboveAvgCount}<span className="text-lg text-gray-400">/{benchmarks.length}</span></p>
          <p className="text-sm text-gray-500 mt-1">Above Peer Avg</p>
        </div>
        <div className="card p-5 text-center">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center mx-auto mb-3"><BarChart3 size={24} /></div>
          <p className="text-3xl font-bold text-gray-900">{benchmarks.length}</p>
          <p className="text-sm text-gray-500 mt-1">Indicators Tracked</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">Performance Radar</h3>
          <p className="text-xs text-gray-500 mb-3">Percentile ranking vs regional and sector averages</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="indicator" tick={{ fontSize: 10, fill: '#6b7280' }} />
                <Radar name="Entity" dataKey="entity" stroke="#16a34a" fill="#16a34a" fillOpacity={0.2} strokeWidth={2} />
                <Radar name="Regional Avg" dataKey="regional" stroke="#9ca3af" fill="none" strokeDasharray="4 4" />
                <Radar name="Sector Avg" dataKey="sector" stroke="#60a5fa" fill="none" strokeDasharray="2 3" />
                <Legend iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">Percentile Ranking</h3>
          <p className="text-xs text-gray-500 mb-3">Where this entity ranks among peers</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={benchmarks.slice(0, 8).map(b => ({ code: b.indicators?.code ?? '', percentile: b.percentile_rank }))} margin={{ top: 5, right: 5, bottom: 5, left: -15 }}>
                <XAxis dataKey="code" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }} />
                <Bar dataKey="percentile" fill="#16a34a" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="px-4 py-3 border-b border-gray-200"><h3 className="text-sm font-semibold text-gray-900">Indicator Comparison</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-2.5">Indicator</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-2.5">Pillar</th>
                <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-2.5">Entity Value</th>
                <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-2.5">Regional Avg</th>
                <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-2.5">Peer Avg</th>
                <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-2.5">Sector Avg</th>
                <th className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-2.5">Rank</th>
                <th className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-2.5">vs Avg</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {benchmarks.map(b => {
                const ind = b.indicators;
                const pillarCfg = ind ? getPillarConfig(ind.pillar) : null;
                const diff = b.entity_value - b.programme_avg;
                const pctDiff = b.programme_avg > 0 ? Math.round((diff / b.programme_avg) * 100) : 0;
                return (
                  <tr key={b.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-2.5">
                      <p className="text-sm font-medium text-gray-900">{ind?.name ?? '-'}</p>
                      <p className="text-xs text-gray-400">{ind?.code} ({ind?.unit})</p>
                    </td>
                    <td className="px-4 py-2.5">
                      {pillarCfg && <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-medium ring-1 ring-inset ${pillarCfg.color} ${pillarCfg.bgColor} ${pillarCfg.ringColor}`}>{pillarCfg.label}</span>}
                    </td>
                    <td className="px-4 py-2.5 text-sm font-bold text-gray-900 text-right tabular-nums">{Math.round(b.entity_value).toLocaleString()}</td>
                    <td className="px-4 py-2.5 text-sm text-gray-500 text-right tabular-nums">{Math.round(b.regional_avg).toLocaleString()}</td>
                    <td className="px-4 py-2.5 text-sm text-gray-500 text-right tabular-nums">{Math.round(b.programme_avg).toLocaleString()}</td>
                    <td className="px-4 py-2.5 text-sm text-gray-500 text-right tabular-nums">{Math.round(b.sector_avg).toLocaleString()}</td>
                    <td className="px-4 py-2.5 text-center">
                      <div className="inline-flex items-center gap-1">
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${b.percentile_rank >= 75 ? 'bg-emerald-500' : b.percentile_rank >= 50 ? 'bg-brand-500' : b.percentile_rank >= 25 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${b.percentile_rank}%` }} />
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
    </div>
  );
}
