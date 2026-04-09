-- Mistico forecasting and reporting schema

CREATE TABLE IF NOT EXISTS mistico_orchard_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_sheet text NOT NULL DEFAULT 'Mistico Orch Prod Summary',
  source_row_number integer NOT NULL,
  fruit_type text NOT NULL,
  plant_year integer NOT NULL,
  age integer NOT NULL,
  rootstock text NOT NULL,
  block_number text NOT NULL,
  variety text NOT NULL,
  tree_count numeric NOT NULL DEFAULT 0,
  area_hectares numeric NOT NULL DEFAULT 0,
  trees_per_hectare numeric NOT NULL DEFAULT 0,
  plant_spacing_m numeric NOT NULL DEFAULT 0,
  row_spacing_m numeric NOT NULL DEFAULT 0,
  import_batch_id uuid REFERENCES import_batches(id) ON DELETE SET NULL,
  import_timestamp timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (block_number, variety, plant_year, source_sheet)
);

CREATE TABLE IF NOT EXISTS mistico_production_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  orchard_block_id uuid NOT NULL REFERENCES mistico_orchard_blocks(id) ON DELETE CASCADE,
  year integer NOT NULL CHECK (year IN (2024, 2025, 2026)),
  crates numeric NOT NULL DEFAULT 0,
  ton_per_hectare numeric NOT NULL DEFAULT 0,
  calculated_ton_per_hectare boolean NOT NULL DEFAULT true,
  manual_override boolean NOT NULL DEFAULT false,
  audit_note text,
  source_sheet text NOT NULL,
  source_row_number integer NOT NULL,
  import_batch_id uuid REFERENCES import_batches(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (orchard_block_id, year)
);

CREATE TABLE IF NOT EXISTS mistico_revenue_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  commodity_code text NOT NULL CHECK (commodity_code IN ('AP', 'PR')),
  market_channel text NOT NULL CHECK (market_channel IN ('EXPORT', 'LOCAL', 'ALL', 'HAWKERS', 'OTHER')),
  market_label text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  source_sheet text NOT NULL,
  source_row_number integer NOT NULL,
  import_batch_id uuid REFERENCES import_batches(id) ON DELETE SET NULL,
  import_timestamp timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS mistico_data_quality_issues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL,
  severity text NOT NULL CHECK (severity IN ('error', 'warning')),
  message text NOT NULL,
  source_sheet text NOT NULL,
  source_row_number integer,
  record_id uuid,
  detected_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE mistico_orchard_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE mistico_production_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE mistico_revenue_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE mistico_data_quality_issues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read mistico orchard blocks"
  ON mistico_orchard_blocks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can write mistico orchard blocks"
  ON mistico_orchard_blocks FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can read mistico production records"
  ON mistico_production_records FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can write mistico production records"
  ON mistico_production_records FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can read mistico revenue records"
  ON mistico_revenue_records FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can write mistico revenue records"
  ON mistico_revenue_records FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can read mistico quality issues"
  ON mistico_data_quality_issues FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can write mistico quality issues"
  ON mistico_data_quality_issues FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_mistico_prod_year ON mistico_production_records(year);
CREATE INDEX IF NOT EXISTS idx_mistico_blocks_fruit ON mistico_orchard_blocks(fruit_type, variety, block_number);
CREATE INDEX IF NOT EXISTS idx_mistico_rev ON mistico_revenue_records(commodity_code, market_channel);
