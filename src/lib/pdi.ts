import { PDI_ASSESSMENTS, PDI_ENTITIES, PDI_FARMS, PDI_PERIODS } from '../data/pdiDataset';

export type PdiIndicatorPillar = 'growth' | 'production' | 'transformation' | 'sustainability' | 'capacity';

export interface DerivedBenchmarkRow {
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
  indicators?: { name: string; code: string; unit: string; pillar: PdiIndicatorPillar };
}

const INDICATORS = [
  { key: 'beneficiaries', code: 'BEN', name: 'Beneficiaries', unit: 'count', pillar: 'transformation' },
  { key: 'farm_count', code: 'FARM', name: 'Farms Linked', unit: 'count', pillar: 'capacity' },
  { key: 'total_hectares', code: 'HA', name: 'Total Hectares', unit: 'ha', pillar: 'production' },
  { key: 'pome_hectares', code: 'POME', name: 'Pome Hectares', unit: 'ha', pillar: 'production' },
  { key: 'stone_hectares', code: 'STONE', name: 'Stone Hectares', unit: 'ha', pillar: 'production' },
  { key: 'new_hectares', code: 'NEW', name: 'New Hectares Planted', unit: 'ha', pillar: 'growth' },
  { key: 'black_ownership_pct', code: 'BOWN', name: 'Black Ownership', unit: '%', pillar: 'transformation' },
  { key: 'women_ownership_pct', code: 'WOWN', name: 'Women Ownership', unit: '%', pillar: 'transformation' },
  { key: 'youth_ownership_pct', code: 'YOWN', name: 'Youth Ownership', unit: '%', pillar: 'transformation' },
] as const;

function asSafeString(value: unknown, fallback = '') {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : fallback;
  return fallback;
}

function isActiveStatus(status: unknown) {
  return asSafeString(status).toLowerCase() === 'active';
}

function mean(values: number[]) {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function percentileRank(values: number[], target: number) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const belowOrEqual = sorted.filter(value => value <= target).length;
  return Math.round((belowOrEqual / sorted.length) * 100);
}

function valueForIndicator(record: typeof PDI_ASSESSMENTS[number], indicatorKey: typeof INDICATORS[number]['key']) {
  const raw = record[indicatorKey];
  if (raw == null) return 0;
  if (indicatorKey.endsWith('_pct')) return raw * 100;
  return raw;
}

export function getPdiEntityOptions() {
  return PDI_ENTITIES.map(entity => ({
    id: asSafeString(entity.entity_code),
    name: asSafeString(entity.name, 'Unknown Entity'),
    region: asSafeString(entity.town ?? entity.province),
    province: asSafeString(entity.province),
  })).sort((a, b) => a.name.localeCompare(b.name));
}

export function getPdiPeriods() {
  return [...PDI_PERIODS];
}

export function getPdiDashboardStats() {
  const activeEntities = PDI_ENTITIES.filter(entity => isActiveStatus(entity.status));
  const activeFarms = PDI_FARMS.filter(farm => isActiveStatus(farm.status));
  const activeByProvince = new Map<string, number>();
  activeEntities.forEach(entity => activeByProvince.set(entity.province ?? 'Unknown', (activeByProvince.get(entity.province ?? 'Unknown') ?? 0) + 1));
  const trendData = getPdiPeriods().map(period => {
    const rows = PDI_ASSESSMENTS.filter(item => item.year === period);
    return {
      month: period,
      submissions: rows.reduce((sum, item) => sum + item.beneficiaries, 0),
      approved: rows.reduce((sum, item) => sum + item.farm_count, 0),
    };
  });

  const pillarCounts = [
    { pillar: 'growth', count: 1 },
    { pillar: 'production', count: 3 },
    { pillar: 'transformation', count: 4 },
    { pillar: 'sustainability', count: 0 },
    { pillar: 'capacity', count: 1 },
  ] as const;

  const provinces = [...activeByProvince.entries()].sort((a, b) => b[1] - a[1]);
  const riskAlerts = activeEntities
    .filter(entity => entity.farm_count === 0 || entity.total_hectares === 0)
    .slice(0, 5)
    .map(entity => ({
      id: entity.entity_code,
      title: `${entity.name} has incomplete farm/hectare coverage`,
      severity: entity.farm_count === 0 ? 'high' : 'medium',
      flagged_at: entity.assessment_year,
    }));

  const avgOwnership = Math.round(mean(activeEntities.map(entity => (entity.black_ownership_pct ?? 0) * 100)));

  return {
    stats: {
      programmes: [...new Set(activeEntities.map(entity => entity.business_type || 'Unknown'))].length,
      projects: activeFarms.length,
      entities: activeEntities.length,
      indicators: INDICATORS.length,
      submissions: PDI_ASSESSMENTS.length,
      trainingSessions: 0,
    },
    submissionStatusData: [
      { name: '2025 Active', value: activeEntities.length, color: '#10b981' },
      { name: '2025 Inactive', value: PDI_ENTITIES.length - activeEntities.length, color: '#ef4444' },
    ],
    pendingQueue: [] as Array<{ id: string; status: string; created_at: string; projects?: { name: string; code: string }; reporting_periods?: { name: string } }>,
    pillarCounts,
    trendData,
    riskAlerts,
    healthSummary: {
      green: activeEntities.filter(entity => entity.total_hectares > 50).length,
      amber: activeEntities.filter(entity => entity.total_hectares > 0 && entity.total_hectares <= 50).length,
      red: activeEntities.filter(entity => entity.total_hectares === 0).length,
      avg: avgOwnership,
    },
    commercialStats: {
      consignments: 0,
      totalNett: 0,
      lastImport: '2025',
    },
    provinceBreakdown: provinces,
  };
}

export function getPdiBenchmarks(entityCode: string, periodName: string): DerivedBenchmarkRow[] {
  const periodRows = PDI_ASSESSMENTS.filter(item => item.year === periodName);
  const entityRow = periodRows.find(item => item.entity_code === entityCode);
  if (!entityRow) return [];
  const regionRows = periodRows.filter(item => item.province === entityRow.province);
  const peerRows = periodRows.filter(item => item.business_type === entityRow.business_type);

  return INDICATORS.map(indicator => {
    const values = periodRows.map(item => valueForIndicator(item, indicator.key));
    const entityValue = valueForIndicator(entityRow, indicator.key);
    return {
      id: `${entityCode}-${periodName}-${indicator.key}`,
      entity_id: entityCode,
      indicator_id: indicator.key,
      period_name: periodName,
      entity_value: entityValue,
      regional_avg: mean(regionRows.map(item => valueForIndicator(item, indicator.key))),
      programme_avg: mean(peerRows.map(item => valueForIndicator(item, indicator.key))),
      sector_avg: mean(values),
      percentile_rank: percentileRank(values, entityValue),
      entities: { name: asSafeString(entityRow.entity_name, 'Unknown Entity'), region: asSafeString(entityRow.province) },
      indicators: {
        name: indicator.name,
        code: indicator.code,
        unit: indicator.unit,
        pillar: indicator.pillar,
      },
    };
  });
}

export function getPdiEntityFarmStats(entityCode: string) {
  const farms = PDI_FARMS.filter(farm => farm.entity_code === entityCode);
  return {
    count: farms.length,
    hectares: Math.round(farms.reduce((sum, farm) => sum + farm.total_hectares, 0)),
  };
}

export function getPdiEntityTrend(entityCode: string) {
  return getPdiPeriods().map(period => {
    const row = PDI_ASSESSMENTS.find(item => item.entity_code === entityCode && item.year === period);
    return { period, value: Math.round(row?.total_hectares ?? 0) };
  }).filter(item => item.value > 0);
}

export function getPdiEntityMeta(entityCode: string) {
  return PDI_ENTITIES.find(entity => asSafeString(entity.entity_code) === entityCode) ?? null;
}
