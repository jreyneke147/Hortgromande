# Mistico Forecast Migration Notes (2026-03-31)

## What changed

1. Added dedicated Mistico forecasting schema and tables for orchard-level production, normalized consolidated revenue, and data quality issues.
2. Added centralized business logic for:
   - year-on-year variance formula `(new - old) / old`
   - ton/ha calculation from crates and hectares (single programmatic rule)
   - growth classification signals
3. Added normalization utilities for market/channel labels and week formatting.
4. Added import parsing utilities for orchard and consolidated rows with validation and anomaly capture.
5. Added a dedicated Mistico Forecast UI with 4 operational views:
   - Dashboard
   - Orchard Production
   - Consolidated Summary
   - Data Quality

## Preserved behavior

- Existing KPI forecasting screen remains available at `/forecasting`.
- Existing commercial imports/review/trends features were not removed.

## Workbook inconsistency assumptions and design decisions

1. **Grand total % variance inconsistency** in workbook pivots:
   - standardized everywhere in application to `(new - old) / old`.
2. **2026 ton/ha hard-coded in some pear rows**:
   - enforced programmatic recomputation during import and raised warning issues when source values differ significantly.
3. **Mixed market naming**:
   - introduced alias normalization and explicit `OTHER` fallback with warnings.
4. **Mixed period/week formats**:
   - normalized to `W##` format when parseable.

## Traceability improvements

- Source sheet and source row persisted with imported records.
- Import batch linkage retained.
- Manual override flags and audit note fields included on production records.
