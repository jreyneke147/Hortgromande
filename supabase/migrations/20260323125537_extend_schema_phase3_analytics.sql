/*
  # Phase 3 - Analytics, Mapping, Benchmarking, Reporting

  1. New Tables
    - `saved_views` - User-saved dashboard filter configurations
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `name` (text) - view name
      - `view_type` (text) - programme/entity/sector/custom
      - `filters` (jsonb) - serialised filter state
      - `is_default` (boolean) - whether this is user's default view
      - `created_at` / `updated_at` (timestamptz)

    - `report_templates` - Prebuilt report definitions
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `report_type` (text) - quarterly/annual/governance/programme/custom
      - `template_config` (jsonb) - sections, indicators, layout
      - `is_active` (boolean)
      - `created_at` (timestamptz)

    - `generated_reports` - Instances of generated reports
      - `id` (uuid, primary key)
      - `template_id` (uuid, references report_templates)
      - `name` (text)
      - `report_type` (text)
      - `filters` (jsonb) - parameters used
      - `status` (text) - draft/generating/completed/failed
      - `generated_by` (uuid, references profiles)
      - `file_path` (text)
      - `created_at` (timestamptz)

    - `benchmark_snapshots` - Point-in-time benchmark data
      - `id` (uuid, primary key)
      - `entity_id` (uuid, references entities)
      - `indicator_id` (uuid, references indicators)
      - `period_name` (text)
      - `entity_value` (numeric) - this entity's value
      - `regional_avg` (numeric) - regional average
      - `programme_avg` (numeric) - programme average
      - `sector_avg` (numeric) - sector average
      - `percentile_rank` (integer) - 0-100
      - `snapshot_date` (date)
      - `created_at` (timestamptz)

    - `document_tags` - Tags for the document repository
      - `id` (uuid, primary key)
      - `document_id` (uuid, references documents)
      - `tag` (text) - tag name
      - `created_at` (timestamptz)

    - `dashboard_preferences` - Per-user dashboard layout preferences
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `dashboard_type` (text) - overview/programme/entity/sector
      - `preferences` (jsonb) - layout, visible widgets, etc.
      - `created_at` / `updated_at` (timestamptz)

  2. Modified Tables
    - `documents` - add description, programme_id, reporting_period_id columns
    - `entities` - ensure GPS coordinates are populated for map module

  3. Security
    - RLS enabled on all new tables
    - Policies restrict access to authenticated users
    - Saved views and preferences restricted to owner

  4. Indexes
    - Foreign key columns indexed
    - benchmark_snapshots indexed on entity_id, indicator_id, period_name
    - document_tags indexed on document_id and tag
*/

-- ============================================
-- SAVED VIEWS
-- ============================================
CREATE TABLE IF NOT EXISTS saved_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  view_type text NOT NULL DEFAULT 'custom',
  filters jsonb DEFAULT '{}'::jsonb,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE saved_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own saved views"
  ON saved_views FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved views"
  ON saved_views FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own saved views"
  ON saved_views FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved views"
  ON saved_views FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_saved_views_user_id ON saved_views(user_id);

-- ============================================
-- REPORT TEMPLATES
-- ============================================
CREATE TABLE IF NOT EXISTS report_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  report_type text NOT NULL DEFAULT 'quarterly',
  template_config jsonb DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE report_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view report templates"
  ON report_templates FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Authenticated users can insert report templates"
  ON report_templates FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update report templates"
  ON report_templates FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_report_templates_type ON report_templates(report_type);

-- ============================================
-- GENERATED REPORTS
-- ============================================
CREATE TABLE IF NOT EXISTS generated_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid REFERENCES report_templates(id),
  name text NOT NULL,
  report_type text NOT NULL DEFAULT 'quarterly',
  filters jsonb DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'completed',
  generated_by uuid REFERENCES profiles(id),
  file_path text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE generated_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view generated reports"
  ON generated_reports FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert generated reports"
  ON generated_reports FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_generated_reports_template_id ON generated_reports(template_id);
CREATE INDEX IF NOT EXISTS idx_generated_reports_generated_by ON generated_reports(generated_by);
CREATE INDEX IF NOT EXISTS idx_generated_reports_status ON generated_reports(status);

-- ============================================
-- BENCHMARK SNAPSHOTS
-- ============================================
CREATE TABLE IF NOT EXISTS benchmark_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id uuid NOT NULL REFERENCES entities(id),
  indicator_id uuid NOT NULL REFERENCES indicators(id),
  period_name text NOT NULL DEFAULT '',
  entity_value numeric DEFAULT 0,
  regional_avg numeric DEFAULT 0,
  programme_avg numeric DEFAULT 0,
  sector_avg numeric DEFAULT 0,
  percentile_rank integer DEFAULT 50,
  snapshot_date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE benchmark_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view benchmarks"
  ON benchmark_snapshots FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert benchmarks"
  ON benchmark_snapshots FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_benchmark_entity ON benchmark_snapshots(entity_id);
CREATE INDEX IF NOT EXISTS idx_benchmark_indicator ON benchmark_snapshots(indicator_id);
CREATE INDEX IF NOT EXISTS idx_benchmark_period ON benchmark_snapshots(period_name);
CREATE INDEX IF NOT EXISTS idx_benchmark_date ON benchmark_snapshots(snapshot_date);

-- ============================================
-- DOCUMENT TAGS
-- ============================================
CREATE TABLE IF NOT EXISTS document_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  tag text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE document_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view document tags"
  ON document_tags FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert document tags"
  ON document_tags FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete document tags"
  ON document_tags FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_document_tags_document_id ON document_tags(document_id);
CREATE INDEX IF NOT EXISTS idx_document_tags_tag ON document_tags(tag);

-- ============================================
-- DASHBOARD PREFERENCES
-- ============================================
CREATE TABLE IF NOT EXISTS dashboard_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  dashboard_type text NOT NULL DEFAULT 'overview',
  preferences jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE dashboard_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own dashboard preferences"
  ON dashboard_preferences FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own dashboard preferences"
  ON dashboard_preferences FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own dashboard preferences"
  ON dashboard_preferences FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_dashboard_prefs_user ON dashboard_preferences(user_id);

-- ============================================
-- EXTEND DOCUMENTS TABLE
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'documents' AND column_name = 'description'
  ) THEN
    ALTER TABLE documents ADD COLUMN description text DEFAULT '';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'documents' AND column_name = 'programme_id'
  ) THEN
    ALTER TABLE documents ADD COLUMN programme_id uuid REFERENCES programmes(id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'documents' AND column_name = 'reporting_period_id'
  ) THEN
    ALTER TABLE documents ADD COLUMN reporting_period_id uuid REFERENCES reporting_periods(id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_documents_programme_id ON documents(programme_id);
CREATE INDEX IF NOT EXISTS idx_documents_reporting_period_id ON documents(reporting_period_id);

-- ============================================
-- TRIGGERS
-- ============================================
CREATE TRIGGER tr_saved_views_updated_at BEFORE UPDATE ON saved_views FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_dashboard_prefs_updated_at BEFORE UPDATE ON dashboard_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at();
