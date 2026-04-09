export type CommodityCode = 'AP' | 'PR';
export type MarketChannelCode = 'EXPORT' | 'LOCAL' | 'ALL' | 'HAWKERS' | 'OTHER';

export interface Commodity {
  id: string;
  code: CommodityCode;
  name: string;
}

export interface Variety {
  id: string;
  commodity_code: CommodityCode;
  name: string;
  canonical_name: string;
}

export interface OrchardBlock {
  id: string;
  source_sheet: string;
  source_row_number: number;
  fruit_type: string;
  plant_year: number;
  age: number;
  rootstock: string;
  block_number: string;
  variety: string;
  tree_count: number;
  area_hectares: number;
  trees_per_hectare: number;
  plant_spacing_m: number;
  row_spacing_m: number;
  import_batch_id: string | null;
  import_timestamp: string;
  updated_at: string;
}

export interface ProductionRecord {
  id: string;
  orchard_block_id: string;
  year: 2024 | 2025 | 2026;
  crates: number;
  ton_per_hectare: number;
  calculated_ton_per_hectare: boolean;
  manual_override: boolean;
  audit_note: string | null;
  source_sheet: string;
  source_row_number: number;
  import_batch_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface RevenueRecord {
  id: string;
  commodity_code: CommodityCode;
  market_channel: MarketChannelCode;
  market_label: string;
  amount: number;
  source_sheet: string;
  source_row_number: number;
  import_batch_id: string | null;
  import_timestamp: string;
  updated_at: string;
}

export interface DataQualityIssue {
  code: string;
  severity: 'error' | 'warning';
  message: string;
  source_sheet: string;
  source_row_number: number | null;
  record_id: string | null;
}

export interface ForecastSummary {
  grand_total_revenue: number;
  commodity_totals: Array<{
    commodity_code: CommodityCode;
    total_revenue: number;
    by_market: Array<{ market_channel: MarketChannelCode; total_revenue: number }>;
  }>;
  production_totals: {
    by_year: Record<'2024' | '2025' | '2026', number>;
    apples_by_year: Record<'2024' | '2025' | '2026', number>;
    pears_by_year: Record<'2024' | '2025' | '2026', number>;
  };
}

export interface NormalizedMarketValue {
  canonical: MarketChannelCode;
  original: string;
  normalized: string;
  wasMapped: boolean;
}

export interface ParsedOrchardImportRow {
  source_sheet: string;
  source_row_number: number;
  fruit_type: string;
  plant_year: number;
  age: number;
  rootstock: string;
  block_number: string;
  variety: string;
  tree_count: number;
  area_hectares: number;
  trees_per_hectare: number;
  plant_spacing_m: number;
  row_spacing_m: number;
  crates_2024: number;
  ton_ha_2024: number;
  crates_2025: number;
  ton_ha_2025: number;
  crates_2026: number;
  ton_ha_2026: number;
}

export interface ParsedRevenueImportRow {
  source_sheet: string;
  source_row_number: number;
  commodity_code: CommodityCode;
  market_channel: MarketChannelCode;
  market_label: string;
  amount: number;
}
