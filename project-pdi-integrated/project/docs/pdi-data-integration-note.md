# PDI data integration note

This project now includes the uploaded PDI workbook data as a first-class source.

## What was added

- `src/data/pdiDataset.ts`
  - Generated dataset from the uploaded PDI workbook.
  - Includes:
    - latest 2025 entity records
    - latest 2025 farm records
    - entity assessments for both `Baseline 2024` and `2025`
- `src/lib/pdi.ts`
  - Fallback data helpers for dashboards and benchmarking.
  - Derives benchmark rows from real uploaded entity/farm metrics.
- `supabase/migrations/20260408120000_seed_pdi_workbook_data.sql`
  - Seeds the uploaded workbook into new assessment tables.
  - Seeds latest 2025 entity/farm rows into the existing `entities` and `farms` tables.
- UI fallback updates
  - `src/pages/Dashboard.tsx`
  - `src/pages/Benchmarking.tsx`
  - `src/pages/dashboards/EntityDashboard.tsx`

## What the integration covers

### Real uploaded data now powers
- entity list
- farm counts and hectares
- benchmark comparisons
- period switching between `Baseline 2024` and `2025`
- fallback dashboard overview when Supabase core tables are empty

### Benchmark indicators now derived from workbook data
- Beneficiaries
- Farms linked
- Total hectares
- Pome hectares
- Stone hectares
- New hectares planted
- Black ownership %
- Women ownership %
- Youth ownership %

## Important limitation

The uploaded workbook does **not** contain enough structured data to fully replace every domain in the app.
The following areas still need source data before they can be turned into real non-mock workflows end-to-end:

- programmes
- projects
- training sessions
- submissions / workflow approvals
- commercial consignments
- GIS coordinates
- governance documents
- risk register items

## Recommended next step

Run the new Supabase migration, then replace the remaining empty modules using additional source files for:
- programmes/projects mapping
- coordinates / GIS source
- submission history
- risk/governance data
- training registers
