/*
  # Phase 4 - Forecasting, Risk Assessment, Health Scoring, Governance & Notifications

  1. New Tables
    - `forecasts` - KPI forecast projections with trend direction and confidence
    - `risk_rules` - configurable risk detection rules
    - `risk_flags` - flagged risks for entities/projects
    - `health_scores` - computed health scores for projects/entities
    - `notifications` - system notifications for users
    - `governance_documents` - SOPs, policies, compliance documents
    - `permission_policies` - data sharing and access rules

  2. Security
    - RLS enabled on all tables
    - Notifications restricted to owning user
    - Other tables readable by all authenticated users

  3. Indexes
    - Performance indexes on FK columns and status fields
*/

-- ============================================================
-- FORECASTS
-- ============================================================
CREATE TABLE IF NOT EXISTS forecasts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  indicator_id uuid REFERENCES indicators(id) ON DELETE CASCADE,
  project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
  entity_id uuid REFERENCES entities(id) ON DELETE SET NULL,
  period_name text NOT NULL,
  forecast_value numeric NOT NULL DEFAULT 0,
  actual_value numeric,
  trend_direction text NOT NULL DEFAULT 'stable',
  confidence numeric NOT NULL DEFAULT 50,
  method text NOT NULL DEFAULT 'linear',
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE forecasts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read forecasts"
  ON forecasts FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert forecasts"
  ON forecasts FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update forecasts"
  ON forecasts FOR UPDATE TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_forecasts_indicator ON forecasts(indicator_id);
CREATE INDEX IF NOT EXISTS idx_forecasts_project ON forecasts(project_id);
CREATE INDEX IF NOT EXISTS idx_forecasts_entity ON forecasts(entity_id);
CREATE INDEX IF NOT EXISTS idx_forecasts_period ON forecasts(period_name);

-- ============================================================
-- RISK RULES
-- ============================================================
CREATE TABLE IF NOT EXISTS risk_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  category text NOT NULL DEFAULT 'performance',
  severity text NOT NULL DEFAULT 'medium',
  condition_type text NOT NULL DEFAULT 'threshold',
  condition_config jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE risk_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read risk rules"
  ON risk_rules FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage risk rules"
  ON risk_rules FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update risk rules"
  ON risk_rules FOR UPDATE TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================
-- RISK FLAGS
-- ============================================================
CREATE TABLE IF NOT EXISTS risk_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id uuid REFERENCES risk_rules(id) ON DELETE SET NULL,
  entity_id uuid REFERENCES entities(id) ON DELETE SET NULL,
  project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
  programme_id uuid REFERENCES programmes(id) ON DELETE SET NULL,
  severity text NOT NULL DEFAULT 'medium',
  status text NOT NULL DEFAULT 'open',
  title text NOT NULL,
  description text DEFAULT '',
  metric_value numeric,
  threshold_value numeric,
  flagged_at timestamptz DEFAULT now(),
  resolved_at timestamptz,
  resolved_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE risk_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read risk flags"
  ON risk_flags FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert risk flags"
  ON risk_flags FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update risk flags"
  ON risk_flags FOR UPDATE TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_risk_flags_entity ON risk_flags(entity_id);
CREATE INDEX IF NOT EXISTS idx_risk_flags_project ON risk_flags(project_id);
CREATE INDEX IF NOT EXISTS idx_risk_flags_programme ON risk_flags(programme_id);
CREATE INDEX IF NOT EXISTS idx_risk_flags_severity ON risk_flags(severity);
CREATE INDEX IF NOT EXISTS idx_risk_flags_status ON risk_flags(status);

-- ============================================================
-- HEALTH SCORES
-- ============================================================
CREATE TABLE IF NOT EXISTS health_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL DEFAULT 'project',
  entity_id uuid NOT NULL,
  overall_score numeric NOT NULL DEFAULT 0,
  data_completeness numeric NOT NULL DEFAULT 0,
  submission_timeliness numeric NOT NULL DEFAULT 0,
  outcome_performance numeric NOT NULL DEFAULT 0,
  governance_maturity numeric NOT NULL DEFAULT 0,
  sustainability_score numeric NOT NULL DEFAULT 0,
  training_engagement numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'amber',
  period_name text NOT NULL DEFAULT '',
  scored_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE health_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read health scores"
  ON health_scores FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert health scores"
  ON health_scores FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update health scores"
  ON health_scores FOR UPDATE TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_health_scores_entity ON health_scores(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_health_scores_status ON health_scores(status);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'info',
  category text NOT NULL DEFAULT 'system',
  title text NOT NULL,
  message text DEFAULT '',
  link text,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own notifications"
  ON notifications FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can insert notifications"
  ON notifications FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete own notifications"
  ON notifications FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, is_read);

-- ============================================================
-- GOVERNANCE DOCUMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS governance_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  document_type text NOT NULL DEFAULT 'policy',
  category text NOT NULL DEFAULT 'governance',
  file_path text DEFAULT '',
  file_size integer DEFAULT 0,
  version text DEFAULT '1.0',
  status text NOT NULL DEFAULT 'draft',
  effective_date date,
  review_date date,
  owner_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  is_deleted boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE governance_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read governance documents"
  ON governance_documents FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL AND is_deleted = false);

CREATE POLICY "Authenticated users can insert governance documents"
  ON governance_documents FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update governance documents"
  ON governance_documents FOR UPDATE TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_gov_docs_type ON governance_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_gov_docs_status ON governance_documents(status);
CREATE INDEX IF NOT EXISTS idx_gov_docs_category ON governance_documents(category);

CREATE TRIGGER update_governance_documents_updated_at
  BEFORE UPDATE ON governance_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- PERMISSION POLICIES
-- ============================================================
CREATE TABLE IF NOT EXISTS permission_policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  role_id uuid REFERENCES roles(id) ON DELETE SET NULL,
  resource_type text NOT NULL DEFAULT 'programme',
  access_level text NOT NULL DEFAULT 'read',
  conditions jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE permission_policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read permission policies"
  ON permission_policies FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage permission policies"
  ON permission_policies FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update permission policies"
  ON permission_policies FOR UPDATE TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_perm_policies_role ON permission_policies(role_id);
CREATE INDEX IF NOT EXISTS idx_perm_policies_resource ON permission_policies(resource_type);

CREATE TRIGGER update_permission_policies_updated_at
  BEFORE UPDATE ON permission_policies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
