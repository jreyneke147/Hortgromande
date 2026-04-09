import { useEffect, useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowRight,
  BarChart3,
  Target,
  Activity,
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
  Cell,
  ReferenceLine,
} from 'recharts';
import { supabase } from '../lib/supabase';
import LoadingSpinner from '../components/ui/LoadingSpinner';

interface ForecastRow {
  id: string;
  indicator_id: string;
  project_id: string | null;
  period_name: string;
  forecast_value: number;
  actual_value: number | null;
  trend_direction: string;
  confidence: number;
  method: string;
  indicators?: { name: string; code: string; unit: string };
  projects?: { name: string };
}

interface IndicatorOption {
  id: string;
  name: string;
  code: string;
  unit: string;
}

const TREND_ICONS = { up: TrendingUp, down: TrendingDown, stable: Minus };
const TREND_COLORS = { up: 'text-emerald-600', down: 'text-red-600', stable: 'text-gray-500' };
const TREND_BG = { up: 'bg-emerald-50', down: 'bg-red-50', stable: 'bg-gray-50' };

export default function Forecasting() {
  const [forecasts, setForecasts] = useState<ForecastRow[]>([]);
  const [indicators, setIndicators] = useState<IndicatorOption[]>([]);
  const [selectedIndicator, setSelectedIndicator] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: indData } = await supabase
        .from('indicators')
        .select('id, name, code, unit')
        .eq('is_deleted', false)
        .in('code', ['IND-001', 'IND-002', 'IND-003', 'IND-005', 'IND-007', 'IND-008'])
        .order('code');
      const list = (indData ?? []) as IndicatorOption[];
      setIndicators(list);
      if (list.length > 0) setSelectedIndicator(list[0].id);
      setLoading(false);
    }
    load();
  }, []);

  useEffect(() => {
    if (!selectedIndicator) return;
    async function loadForecasts() {
      const { data } = await supabase
        .from('forecasts')
        .select('id, indicator_id, project_id, period_name, forecast_value, actual_value, trend_direction, confidence, method, indicators(name, code, unit), projects(name)')
        .eq('indicator_id', selectedIndicator)
        .order('period_name');
      setForecasts((data ?? []) as unknown as ForecastRow[]);
    }
    loadForecasts();
  }, [selectedIndicator]);

  const ind = indicators.find(i => i.id === selectedIndicator);

  const periodAggregates = useMemo(() => {
    const map: Record<string, { forecast: number[]; actual: number[] }> = {};
    forecasts.forEach(f => {
      if (!map[f.period_name]) map[f.period_name] = { forecast: [], actual: [] };
      map[f.period_name].forecast.push(f.forecast_value);
      if (f.actual_value != null) map[f.period_name].actual.push(f.actual_value);
    });
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([period, d]) => ({
        period,
        forecast: Math.round(d.forecast.reduce((s, v) => s + v, 0) / d.forecast.length),
        actual: d.actual.length > 0 ? Math.round(d.actual.reduce((s, v) => s + v, 0) / d.actual.length) : null,
      }));
  }, [forecasts]);

  const futureForecasts = periodAggregates.filter(p => p.actual == null);
  const pastForecasts = periodAggregates.filter(p => p.actual != null);
  const avgConfidence = forecasts.length > 0
    ? Math.round(forecasts.reduce((s, f) => s + f.confidence, 0) / forecasts.length)
    : 0;
  const trendCounts = { up: 0, down: 0, stable: 0 };
  forecasts.forEach(f => { if (f.trend_direction in trendCounts) trendCounts[f.trend_direction as keyof typeof trendCounts]++; });
  const dominantTrend = Object.entries(trendCounts).sort(([, a], [, b]) => b - a)[0]?.[0] ?? 'stable';

  const accuracyData = pastForecasts.map(p => ({
    period: p.period,
    accuracy: p.actual != null && p.forecast > 0
      ? Math.round(100 - Math.abs(((p.forecast - p.actual) / p.forecast) * 100))
      : 0,
  }));
  const avgAccuracy = accuracyData.length > 0
    ? Math.round(accuracyData.reduce((s, d) => s + d.accuracy, 0) / accuracyData.length)
    : 0;

  if (loading) return <LoadingSpinner />;

  const DominantIcon = TREND_ICONS[dominantTrend as keyof typeof TREND_ICONS] ?? Minus;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Forecasting</h1>
          <p className="text-sm text-gray-500 mt-1">KPI trend projections and expected performance direction</p>
        </div>
        <select
          value={selectedIndicator}
          onChange={e => setSelectedIndicator(e.target.value)}
          className="input-field w-auto text-sm"
        >
          {indicators.map(i => (
            <option key={i.id} value={i.id}>{i.code} - {i.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${TREND_BG[dominantTrend as keyof typeof TREND_BG] ?? 'bg-gray-50'}`}>
              <DominantIcon size={18} className={TREND_COLORS[dominantTrend as keyof typeof TREND_COLORS] ?? 'text-gray-500'} />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 capitalize">{dominantTrend}</p>
          <p className="text-xs text-gray-500 mt-0.5">Dominant Trend</p>
        </div>
        <div className="card p-5">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-blue-50 mb-3">
            <Target size={18} className="text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{avgConfidence}%</p>
          <p className="text-xs text-gray-500 mt-0.5">Avg Confidence</p>
        </div>
        <div className="card p-5">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-amber-50 mb-3">
            <Activity size={18} className="text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{avgAccuracy}%</p>
          <p className="text-xs text-gray-500 mt-0.5">Forecast Accuracy</p>
        </div>
        <div className="card p-5">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-teal-50 mb-3">
            <BarChart3 size={18} className="text-teal-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{futureForecasts.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Future Periods</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">
            Forecast vs Actual - {ind?.name ?? 'Selected Indicator'}
          </h3>
          <p className="text-xs text-gray-500 mb-4">Projected values with actual performance overlay</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={periodAggregates} margin={{ top: 5, right: 5, bottom: 5, left: -15 }}>
                <defs>
                  <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="period" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }} />
                <Area type="monotone" dataKey="forecast" stroke="#3b82f6" strokeWidth={2} fill="url(#forecastGrad)" strokeDasharray="6 3" name="Forecast" />
                <Area type="monotone" dataKey="actual" stroke="#16a34a" strokeWidth={2} fill="url(#actualGrad)" name="Actual" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">Forecast Accuracy</h3>
          <p className="text-xs text-gray-500 mb-4">How close were past forecasts to actual results</p>
          {accuracyData.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No past forecast data available</p>
          ) : (
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={accuracyData} margin={{ top: 5, right: 5, bottom: 5, left: -15 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="period" tick={{ fontSize: 9, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }} />
                  <ReferenceLine y={80} stroke="#16a34a" strokeDasharray="4 4" label={{ value: 'Target', fontSize: 10, fill: '#16a34a' }} />
                  <Bar dataKey="accuracy" radius={[4, 4, 0, 0]} barSize={20} name="Accuracy %">
                    {accuracyData.map((d, i) => (
                      <Cell key={i} fill={d.accuracy >= 80 ? '#16a34a' : d.accuracy >= 60 ? '#f59e0b' : '#ef4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">Future Period Projections</h3>
          <span className="text-xs text-gray-400">{ind?.unit ?? ''}</span>
        </div>
        {futureForecasts.length === 0 ? (
          <p className="p-8 text-center text-sm text-gray-400">No future forecasts available for this indicator</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-gray-100">
            {futureForecasts.map(p => {
              const prev = periodAggregates[periodAggregates.indexOf(p) - 1];
              const change = prev ? Math.round(((p.forecast - (prev.actual ?? prev.forecast)) / (prev.actual ?? prev.forecast)) * 100) : 0;
              return (
                <div key={p.period} className="bg-white p-4">
                  <p className="text-xs font-medium text-gray-500 mb-2">{p.period}</p>
                  <p className="text-xl font-bold text-gray-900">{p.forecast.toLocaleString()}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {change > 0 ? (
                      <TrendingUp size={12} className="text-emerald-500" />
                    ) : change < 0 ? (
                      <TrendingDown size={12} className="text-red-500" />
                    ) : (
                      <ArrowRight size={12} className="text-gray-400" />
                    )}
                    <span className={`text-xs font-medium ${change > 0 ? 'text-emerald-600' : change < 0 ? 'text-red-600' : 'text-gray-500'}`}>
                      {change > 0 ? '+' : ''}{change}% from prev
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="card">
        <div className="px-4 py-3 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900">Year-on-Year Comparison</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-2.5">Period</th>
                <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-2.5">Forecast</th>
                <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-2.5">Actual</th>
                <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-2.5">Variance</th>
                <th className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-2.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {periodAggregates.map(p => {
                const variance = p.actual != null ? Math.round(((p.actual - p.forecast) / p.forecast) * 100) : null;
                return (
                  <tr key={p.period} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-2.5 text-sm font-medium text-gray-900">{p.period}</td>
                    <td className="px-4 py-2.5 text-sm text-gray-600 text-right tabular-nums">{p.forecast.toLocaleString()}</td>
                    <td className="px-4 py-2.5 text-sm text-right tabular-nums">
                      {p.actual != null ? (
                        <span className="font-medium text-gray-900">{p.actual.toLocaleString()}</span>
                      ) : (
                        <span className="text-gray-400 italic">pending</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-sm text-right tabular-nums">
                      {variance != null ? (
                        <span className={`font-medium ${variance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                          {variance >= 0 ? '+' : ''}{variance}%
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      {p.actual != null ? (
                        <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-medium ring-1 ring-inset ${
                          Math.abs(((p.actual - p.forecast) / p.forecast) * 100) <= 10
                            ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20'
                            : Math.abs(((p.actual - p.forecast) / p.forecast) * 100) <= 25
                            ? 'bg-amber-50 text-amber-700 ring-amber-600/20'
                            : 'bg-red-50 text-red-700 ring-red-600/20'
                        }`}>
                          {Math.abs(((p.actual - p.forecast) / p.forecast) * 100) <= 10 ? 'On Track' : Math.abs(((p.actual - p.forecast) / p.forecast) * 100) <= 25 ? 'Deviation' : 'Significant Gap'}
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-0.5 text-[10px] font-medium text-gray-500 ring-1 ring-inset ring-gray-200">
                          Projected
                        </span>
                      )}
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
