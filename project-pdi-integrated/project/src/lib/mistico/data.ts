import { supabase } from '../supabase';
import { calculateYoYChange } from './calculations';
import type { DataQualityIssue, ForecastSummary, OrchardBlock, ProductionRecord, RevenueRecord } from '../../types/mistico';

export async function getOrchardBlocks() {
  return supabase
    .from('mistico_orchard_blocks')
    .select('*, production:mistico_production_records(*)')
    .order('fruit_type')
    .order('variety');
}

export async function getRevenueRecords() {
  return supabase
    .from('mistico_revenue_records')
    .select('*')
    .order('commodity_code')
    .order('market_channel');
}

export async function getDataQualityIssues() {
  return supabase
    .from('mistico_data_quality_issues')
    .select('*')
    .order('detected_at', { ascending: false })
    .limit(200);
}

export function buildForecastSummary(blocks: (OrchardBlock & { production: ProductionRecord[] })[], revenue: RevenueRecord[]): ForecastSummary {
  const byYear = { '2024': 0, '2025': 0, '2026': 0 };
  const apples = { '2024': 0, '2025': 0, '2026': 0 };
  const pears = { '2024': 0, '2025': 0, '2026': 0 };

  for (const block of blocks) {
    for (const record of block.production) {
      byYear[String(record.year) as keyof typeof byYear] += record.crates;
      if (block.fruit_type.toLowerCase().startsWith('app')) apples[String(record.year) as keyof typeof apples] += record.crates;
      if (block.fruit_type.toLowerCase().startsWith('per') || block.fruit_type.toLowerCase().startsWith('pea')) pears[String(record.year) as keyof typeof pears] += record.crates;
    }
  }

  const grouped = new Map<string, Map<string, number>>();
  for (const item of revenue) {
    if (!grouped.has(item.commodity_code)) grouped.set(item.commodity_code, new Map());
    const commodity = grouped.get(item.commodity_code)!;
    commodity.set(item.market_channel, (commodity.get(item.market_channel) ?? 0) + item.amount);
  }

  const commodity_totals = [...grouped.entries()].map(([commodity_code, channels]) => {
    const by_market = [...channels.entries()].map(([market_channel, total_revenue]) => ({ market_channel: market_channel as RevenueRecord['market_channel'], total_revenue }));
    const total_revenue = by_market.reduce((sum, row) => sum + row.total_revenue, 0);
    return { commodity_code: commodity_code as RevenueRecord['commodity_code'], total_revenue, by_market };
  });

  const grand_total_revenue = commodity_totals.reduce((sum, row) => sum + row.total_revenue, 0);

  return { grand_total_revenue, commodity_totals, production_totals: { by_year: byYear, apples_by_year: apples, pears_by_year: pears } };
}

export function buildOrchardVariances(block: OrchardBlock & { production: ProductionRecord[] }) {
  const byYear = new Map(block.production.map(p => [p.year, p]));
  const p2024 = byYear.get(2024)?.crates ?? 0;
  const p2025 = byYear.get(2025)?.crates ?? 0;
  const p2026 = byYear.get(2026)?.crates ?? 0;
  return {
    yoy_24_25: calculateYoYChange(p2025, p2024),
    yoy_25_26: calculateYoYChange(p2026, p2025),
    yoy_24_26: calculateYoYChange(p2026, p2024),
  };
}

export type MisticoDataQualityIssue = DataQualityIssue & { detected_at: string };
