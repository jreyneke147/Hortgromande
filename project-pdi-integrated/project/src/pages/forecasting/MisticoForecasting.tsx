import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronRight, TrendingDown, TrendingUp } from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { buildForecastSummary, buildOrchardVariances, getDataQualityIssues, getOrchardBlocks, getRevenueRecords, type MisticoDataQualityIssue } from '../../lib/mistico/data';
import { classifyGrowth } from '../../lib/mistico/calculations';
import type { OrchardBlock, ProductionRecord, RevenueRecord } from '../../types/mistico';

type BlockWithProduction = OrchardBlock & { production: ProductionRecord[] };

type ViewKey = 'dashboard' | 'orchard' | 'consolidated' | 'quality';

function pct(value: number | null) {
  if (value == null) return '—';
  return `${value >= 0 ? '+' : ''}${(value * 100).toFixed(1)}%`;
}

export default function MisticoForecasting() {
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewKey>('dashboard');
  const [blocks, setBlocks] = useState<BlockWithProduction[]>([]);
  const [revenue, setRevenue] = useState<RevenueRecord[]>([]);
  const [issues, setIssues] = useState<MisticoDataQualityIssue[]>([]);
  const [fruitFilter, setFruitFilter] = useState('');
  const [varietyFilter, setVarietyFilter] = useState('');
  const [expandedCommodity, setExpandedCommodity] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const [blocksRes, revenueRes, issuesRes] = await Promise.all([
        getOrchardBlocks(),
        getRevenueRecords(),
        getDataQualityIssues(),
      ]);
      setBlocks((blocksRes.data ?? []) as BlockWithProduction[]);
      setRevenue((revenueRes.data ?? []) as RevenueRecord[]);
      setIssues((issuesRes.data ?? []) as MisticoDataQualityIssue[]);
      setLoading(false);
    }
    load();
  }, []);

  const summary = useMemo(() => buildForecastSummary(blocks, revenue), [blocks, revenue]);

  const filteredBlocks = useMemo(() => {
    return blocks.filter(block => {
      const okFruit = !fruitFilter || block.fruit_type.toLowerCase() === fruitFilter.toLowerCase();
      const okVariety = !varietyFilter || block.variety.toLowerCase().includes(varietyFilter.toLowerCase());
      return okFruit && okVariety;
    });
  }, [blocks, fruitFilter, varietyFilter]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mistico Production Forecast (2024-2026)</h1>
        <p className="text-sm text-gray-500 mt-1">Operational orchard forecasting, normalized revenue summaries, and data quality monitoring.</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {[
          ['dashboard', 'Dashboard'],
          ['orchard', 'Orchard Production'],
          ['consolidated', 'Consolidated Summary'],
          ['quality', 'Data Quality'],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setView(key as ViewKey)}
            className={`px-3 py-1.5 rounded-lg text-sm ${view === key ? 'bg-brand-600 text-white' : 'bg-white border border-gray-200 text-gray-700'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {view === 'dashboard' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="card p-4">
            <p className="text-xs text-gray-500">Grand Total Revenue</p>
            <p className="text-2xl font-bold">R {summary.grand_total_revenue.toLocaleString()}</p>
          </div>
          <div className="card p-4">
            <p className="text-xs text-gray-500">2026 Forecast Crates</p>
            <p className="text-2xl font-bold">{summary.production_totals.by_year['2026'].toLocaleString()}</p>
          </div>
          <div className="card p-4">
            <p className="text-xs text-gray-500">Apples 2025→2026</p>
            <p className="text-2xl font-bold text-emerald-600">{pct((summary.production_totals.apples_by_year['2026'] - summary.production_totals.apples_by_year['2025']) / Math.max(1, summary.production_totals.apples_by_year['2025']))}</p>
          </div>
          <div className="card p-4">
            <p className="text-xs text-gray-500">Pears 2025→2026</p>
            <p className="text-2xl font-bold text-red-600">{pct((summary.production_totals.pears_by_year['2026'] - summary.production_totals.pears_by_year['2025']) / Math.max(1, summary.production_totals.pears_by_year['2025']))}</p>
          </div>
        </div>
      )}

      {view === 'orchard' && (
        <div className="card p-4 space-y-3">
          <div className="flex gap-3">
            <input className="input-field" placeholder="Filter fruit type (Appels/Pere)" value={fruitFilter} onChange={e => setFruitFilter(e.target.value)} />
            <input className="input-field" placeholder="Filter variety" value={varietyFilter} onChange={e => setVarietyFilter(e.target.value)} />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Fruit</th><th className="text-left">Block</th><th className="text-left">Variety</th><th className="text-right">2024</th><th className="text-right">2025</th><th className="text-right">2026</th><th className="text-right">YoY 25→26</th><th className="text-center">Signal</th>
                </tr>
              </thead>
              <tbody>
                {filteredBlocks.map(block => {
                  const metrics = buildOrchardVariances(block);
                  const growthType = classifyGrowth(metrics.yoy_25_26);
                  const byYear = new Map(block.production.map(p => [p.year, p]));
                  return (
                    <tr key={block.id} className="border-b">
                      <td className="py-2">{block.fruit_type}</td>
                      <td>{block.block_number}</td>
                      <td>{block.variety}</td>
                      <td className="text-right">{(byYear.get(2024)?.crates ?? 0).toLocaleString()}</td>
                      <td className="text-right">{(byYear.get(2025)?.crates ?? 0).toLocaleString()}</td>
                      <td className="text-right">{(byYear.get(2026)?.crates ?? 0).toLocaleString()}</td>
                      <td className="text-right">{pct(metrics.yoy_25_26)}</td>
                      <td className="text-center">
                        {growthType === 'strong_positive' && <TrendingUp className="text-emerald-600 inline" size={16} />}
                        {growthType === 'moderate' && <span className="text-gray-500">•</span>}
                        {growthType === 'significant_decline' && <TrendingDown className="text-red-600 inline" size={16} />}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {view === 'consolidated' && (
        <div className="card p-4 space-y-3">
          <p className="text-sm text-gray-500">Revenue grouped by commodity and market channel (normalized source values only).</p>
          {summary.commodity_totals.map(c => (
            <div key={c.commodity_code} className="border rounded-lg">
              <button onClick={() => setExpandedCommodity(expandedCommodity === c.commodity_code ? null : c.commodity_code)} className="w-full flex justify-between items-center px-3 py-2 text-left">
                <span className="font-semibold">{c.commodity_code} Total</span>
                <span className="flex items-center gap-2">R {c.total_revenue.toLocaleString()} {expandedCommodity === c.commodity_code ? <ChevronDown size={16} /> : <ChevronRight size={16} />}</span>
              </button>
              {expandedCommodity === c.commodity_code && (
                <table className="w-full text-sm border-t">
                  <tbody>
                    {c.by_market.map(m => (
                      <tr key={m.market_channel}>
                        <td className="px-3 py-1.5">{m.market_channel}</td>
                        <td className="px-3 py-1.5 text-right">R {m.total_revenue.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          ))}
          <div className="text-right font-bold border-t pt-2">Grand Total: R {summary.grand_total_revenue.toLocaleString()}</div>
        </div>
      )}

      {view === 'quality' && (
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-2"><AlertTriangle className="text-amber-600" size={16} /><h3 className="font-semibold">Data anomalies and overrides</h3></div>
          <table className="w-full text-sm">
            <thead><tr className="border-b"><th className="text-left py-2">Severity</th><th className="text-left">Issue</th><th className="text-left">Source</th></tr></thead>
            <tbody>
              {issues.map(issue => (
                <tr key={`${issue.code}-${issue.detected_at}-${issue.source_row_number}`} className="border-b">
                  <td className="py-2"><span className={issue.severity === 'error' ? 'text-red-600' : 'text-amber-600'}>{issue.severity}</span></td>
                  <td>{issue.message}</td>
                  <td>{issue.source_sheet}{issue.source_row_number ? ` #${issue.source_row_number}` : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
