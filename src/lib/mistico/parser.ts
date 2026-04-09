import { calculateTonPerHectare } from './calculations';
import { normalizeMarketChannel } from './normalization';
import { orchardImportSchema, revenueImportSchema } from './schemas';
import type { DataQualityIssue, ParsedOrchardImportRow, ParsedRevenueImportRow } from '../../types/mistico';

function toNumber(raw: string): number {
  return Number(raw.replace(/\s/g, '').replace(',', '.'));
}

export function parseOrchardCsv(csv: string, sourceSheet = 'Mistico Orch Prod Summary'): { rows: ParsedOrchardImportRow[]; issues: DataQualityIssue[] } {
  const lines = csv.split(/\r?\n/).filter(Boolean);
  const rows: ParsedOrchardImportRow[] = [];
  const issues: DataQualityIssue[] = [];

  lines.slice(1).forEach((line, index) => {
    const cols = line.split(';').map(v => v.trim());
    if (cols.length < 17) {
      issues.push({
        code: 'MALFORMED_ROW', severity: 'error', message: 'Expected 17+ columns for orchard import', source_sheet: sourceSheet, source_row_number: index + 2, record_id: null,
      });
      return;
    }

    const parsed: ParsedOrchardImportRow = {
      source_sheet: sourceSheet,
      source_row_number: index + 2,
      fruit_type: cols[0],
      plant_year: toNumber(cols[1]),
      age: toNumber(cols[2]),
      rootstock: cols[3],
      block_number: cols[4],
      variety: cols[5],
      tree_count: toNumber(cols[6]),
      area_hectares: toNumber(cols[7]),
      trees_per_hectare: toNumber(cols[8]),
      plant_spacing_m: toNumber(cols[9]),
      row_spacing_m: toNumber(cols[10]),
      crates_2024: toNumber(cols[11]),
      ton_ha_2024: toNumber(cols[12]),
      crates_2025: toNumber(cols[13]),
      ton_ha_2025: toNumber(cols[14]),
      crates_2026: toNumber(cols[15]),
      ton_ha_2026: toNumber(cols[16]),
    };

    const validated = orchardImportSchema.safeParse(parsed);
    if (!validated.success) {
      issues.push({
        code: 'VALIDATION_FAILED',
        severity: 'error',
        message: validated.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; '),
        source_sheet: sourceSheet,
        source_row_number: parsed.source_row_number,
        record_id: null,
      });
      return;
    }

    const standardizedTonHa2026 = calculateTonPerHectare(parsed.crates_2026, parsed.area_hectares);
    if (Math.abs(standardizedTonHa2026 - parsed.ton_ha_2026) > 2) {
      issues.push({
        code: 'TON_HA_RECALCULATED',
        severity: 'warning',
        message: `2026 ton/ha normalized from ${parsed.ton_ha_2026} to ${standardizedTonHa2026}`,
        source_sheet: sourceSheet,
        source_row_number: parsed.source_row_number,
        record_id: null,
      });
      parsed.ton_ha_2026 = standardizedTonHa2026;
    }

    rows.push(parsed);
  });

  return { rows, issues };
}

export function parseRevenueRows(rows: Array<Record<string, string>>, sourceSheet = 'Mistico consolidated data'): { rows: ParsedRevenueImportRow[]; issues: DataQualityIssue[] } {
  const parsedRows: ParsedRevenueImportRow[] = [];
  const issues: DataQualityIssue[] = [];

  rows.forEach((row, index) => {
    const market = normalizeMarketChannel(row.market ?? '');
    const parsed: ParsedRevenueImportRow = {
      source_sheet: sourceSheet,
      source_row_number: index + 2,
      commodity_code: ((row.commodity || '').toUpperCase() === 'PR' ? 'PR' : 'AP'),
      market_channel: market.canonical,
      market_label: row.market ?? '',
      amount: toNumber(row.amount ?? '0'),
    };

    const validated = revenueImportSchema.safeParse(parsed);
    if (!validated.success) {
      issues.push({
        code: 'REVENUE_VALIDATION_FAILED', severity: 'error', message: validated.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; '), source_sheet: sourceSheet, source_row_number: index + 2, record_id: null,
      });
      return;
    }

    if (market.canonical === 'OTHER') {
      issues.push({
        code: 'UNKNOWN_MARKET_CHANNEL', severity: 'warning', message: `Market label '${row.market}' mapped to OTHER`, source_sheet: sourceSheet, source_row_number: index + 2, record_id: null,
      });
    }

    parsedRows.push(parsed);
  });

  return { rows: parsedRows, issues };
}
