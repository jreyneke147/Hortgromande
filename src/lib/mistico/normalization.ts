import type { MarketChannelCode, NormalizedMarketValue } from '../../types/mistico';

const MARKET_ALIASES: Record<MarketChannelCode, string[]> = {
  EXPORT: ['export', 'exp', 'xport'],
  LOCAL: ['local', 'domestic', 'rsa'],
  ALL: ['all', 'mixed', 'combined'],
  HAWKERS: ['hawkers', 'hawker', 'street'],
  OTHER: [],
};

function normalizeText(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, ' ');
}

export function normalizeMarketChannel(value: string): NormalizedMarketValue {
  const normalized = normalizeText(value);
  for (const [canonical, aliases] of Object.entries(MARKET_ALIASES) as Array<[MarketChannelCode, string[]]>) {
    if (aliases.includes(normalized)) {
      return { canonical, original: value, normalized, wasMapped: canonical !== normalized.toUpperCase() };
    }
  }

  if (normalized === 'export') return { canonical: 'EXPORT', original: value, normalized, wasMapped: false };
  if (normalized === 'local') return { canonical: 'LOCAL', original: value, normalized, wasMapped: false };

  return { canonical: 'OTHER', original: value, normalized, wasMapped: true };
}

export function normalizePeriodWeek(value: string): string {
  const normalized = normalizeText(value);
  const match = normalized.match(/(?:week|wk)?\s*(\d{1,2})/);
  if (!match) return normalized.toUpperCase();
  return `W${match[1].padStart(2, '0')}`;
}
