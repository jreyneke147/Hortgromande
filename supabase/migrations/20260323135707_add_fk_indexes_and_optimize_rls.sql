/*
  # Add missing foreign key indexes and optimize RLS policies

  1. New Indexes (covering unindexed foreign keys)
    - `idx_access_permissions_granted_by` on access_permissions(granted_by)
    - `idx_documents_uploaded_by` on documents(uploaded_by)
    - `idx_governance_documents_owner_id` on governance_documents(owner_id)
    - `idx_indicator_data_approved_by` on indicator_data(approved_by)
    - `idx_indicator_data_reporting_period_id` on indicator_data(reporting_period_id)
    - `idx_indicator_data_submitted_by` on indicator_data(submitted_by)
    - `idx_notes_author_id` on notes(author_id)
    - `idx_programmes_manager_id` on programmes(manager_id)
    - `idx_projects_lead_id` on projects(lead_id)
    - `idx_risk_flags_resolved_by` on risk_flags(resolved_by)
    - `idx_risk_flags_rule_id` on risk_flags(rule_id)
    - `idx_submissions_submitted_by` on submissions(submitted_by)
    - `idx_training_sessions_entity_id` on training_sessions(entity_id)
    - `idx_validation_logs_performed_by` on validation_logs(performed_by)

  2. RLS Policy Optimizations
    - Replace `auth.uid()` with `(select auth.uid())` in all affected policies
    - This prevents re-evaluation of auth functions per row, improving performance at scale
    - Affected tables: profiles, programmes, entities, projects, farms, indicators,
      reporting_periods, indicator_data, documents, notes, audit_logs, access_permissions,
      submissions, submission_items, validation_logs, training_sessions, training_attendance,
      indicator_history, saved_views, report_templates, generated_reports, benchmark_snapshots,
      document_tags, dashboard_preferences, forecasts, risk_rules, risk_flags, health_scores,
      notifications, governance_documents, permission_policies

  3. Important Notes
    - All indexes use IF NOT EXISTS to prevent errors on re-run
    - Policies are dropped and recreated with optimized auth function calls
    - No data is modified; only structural/security improvements
*/

-- ============================================
-- 1. MISSING FOREIGN KEY INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_access_permissions_granted_by ON access_permissions(granted_by);
CREATE INDEX IF NOT EXISTS idx_documents_uploaded_by ON documents(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_governance_documents_owner_id ON governance_documents(owner_id);
CREATE INDEX IF NOT EXISTS idx_indicator_data_approved_by ON indicator_data(approved_by);
CREATE INDEX IF NOT EXISTS idx_indicator_data_reporting_period_id ON indicator_data(reporting_period_id);
CREATE INDEX IF NOT EXISTS idx_indicator_data_submitted_by ON indicator_data(submitted_by);
CREATE INDEX IF NOT EXISTS idx_notes_author_id ON notes(author_id);
CREATE INDEX IF NOT EXISTS idx_programmes_manager_id ON programmes(manager_id);
CREATE INDEX IF NOT EXISTS idx_projects_lead_id ON projects(lead_id);
CREATE INDEX IF NOT EXISTS idx_risk_flags_resolved_by ON risk_flags(resolved_by);
CREATE INDEX IF NOT EXISTS idx_risk_flags_rule_id ON risk_flags(rule_id);
CREATE INDEX IF NOT EXISTS idx_submissions_submitted_by ON submissions(submitted_by);
CREATE INDEX IF NOT EXISTS idx_training_sessions_entity_id ON training_sessions(entity_id);
CREATE INDEX IF NOT EXISTS idx_validation_logs_performed_by ON validation_logs(performed_by);

-- ============================================
-- 2. OPTIMIZE RLS POLICIES
--    Replace auth.uid() with (select auth.uid())
-- ============================================

-- --- profiles ---
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = id);

-- --- programmes ---
DROP POLICY IF EXISTS "Authenticated users can insert programmes" ON programmes;
CREATE POLICY "Authenticated users can insert programmes"
  ON programmes FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can update programmes" ON programmes;
CREATE POLICY "Authenticated users can update programmes"
  ON programmes FOR UPDATE TO authenticated
  USING ((select auth.uid()) IS NOT NULL)
  WITH CHECK ((select auth.uid()) IS NOT NULL);

-- --- entities ---
DROP POLICY IF EXISTS "Authenticated users can insert entities" ON entities;
CREATE POLICY "Authenticated users can insert entities"
  ON entities FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can update entities" ON entities;
CREATE POLICY "Authenticated users can update entities"
  ON entities FOR UPDATE TO authenticated
  USING ((select auth.uid()) IS NOT NULL)
  WITH CHECK ((select auth.uid()) IS NOT NULL);

-- --- projects ---
DROP POLICY IF EXISTS "Authenticated users can insert projects" ON projects;
CREATE POLICY "Authenticated users can insert projects"
  ON projects FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can update projects" ON projects;
CREATE POLICY "Authenticated users can update projects"
  ON projects FOR UPDATE TO authenticated
  USING ((select auth.uid()) IS NOT NULL)
  WITH CHECK ((select auth.uid()) IS NOT NULL);

-- --- farms ---
DROP POLICY IF EXISTS "Authenticated users can insert farms" ON farms;
CREATE POLICY "Authenticated users can insert farms"
  ON farms FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can update farms" ON farms;
CREATE POLICY "Authenticated users can update farms"
  ON farms FOR UPDATE TO authenticated
  USING ((select auth.uid()) IS NOT NULL)
  WITH CHECK ((select auth.uid()) IS NOT NULL);

-- --- indicators ---
DROP POLICY IF EXISTS "Authenticated users can insert indicators" ON indicators;
CREATE POLICY "Authenticated users can insert indicators"
  ON indicators FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can update indicators" ON indicators;
CREATE POLICY "Authenticated users can update indicators"
  ON indicators FOR UPDATE TO authenticated
  USING ((select auth.uid()) IS NOT NULL)
  WITH CHECK ((select auth.uid()) IS NOT NULL);

-- --- reporting_periods ---
DROP POLICY IF EXISTS "Authenticated users can insert reporting_periods" ON reporting_periods;
CREATE POLICY "Authenticated users can insert reporting_periods"
  ON reporting_periods FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) IS NOT NULL);

-- --- indicator_data ---
DROP POLICY IF EXISTS "Authenticated users can insert indicator_data" ON indicator_data;
CREATE POLICY "Authenticated users can insert indicator_data"
  ON indicator_data FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can update indicator_data" ON indicator_data;
CREATE POLICY "Authenticated users can update indicator_data"
  ON indicator_data FOR UPDATE TO authenticated
  USING ((select auth.uid()) IS NOT NULL)
  WITH CHECK ((select auth.uid()) IS NOT NULL);

-- --- documents ---
DROP POLICY IF EXISTS "Authenticated users can insert documents" ON documents;
CREATE POLICY "Authenticated users can insert documents"
  ON documents FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) IS NOT NULL);

-- --- notes ---
DROP POLICY IF EXISTS "Authenticated users can insert notes" ON notes;
CREATE POLICY "Authenticated users can insert notes"
  ON notes FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "Users can update own notes" ON notes;
CREATE POLICY "Users can update own notes"
  ON notes FOR UPDATE TO authenticated
  USING ((select auth.uid()) = author_id)
  WITH CHECK ((select auth.uid()) = author_id);

-- --- audit_logs ---
DROP POLICY IF EXISTS "Authenticated users can view audit_logs" ON audit_logs;
CREATE POLICY "Authenticated users can view audit_logs"
  ON audit_logs FOR SELECT TO authenticated
  USING ((select auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can insert audit_logs" ON audit_logs;
CREATE POLICY "Authenticated users can insert audit_logs"
  ON audit_logs FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) IS NOT NULL);

-- --- access_permissions ---
DROP POLICY IF EXISTS "Authenticated users can view own permissions" ON access_permissions;
CREATE POLICY "Authenticated users can view own permissions"
  ON access_permissions FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Authenticated users can insert permissions" ON access_permissions;
CREATE POLICY "Authenticated users can insert permissions"
  ON access_permissions FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can delete own permissions" ON access_permissions;
CREATE POLICY "Authenticated users can delete own permissions"
  ON access_permissions FOR DELETE TO authenticated
  USING ((select auth.uid()) = granted_by);

-- --- submissions ---
DROP POLICY IF EXISTS "Authenticated users can insert submissions" ON submissions;
CREATE POLICY "Authenticated users can insert submissions"
  ON submissions FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can update submissions" ON submissions;
CREATE POLICY "Authenticated users can update submissions"
  ON submissions FOR UPDATE TO authenticated
  USING ((select auth.uid()) IS NOT NULL)
  WITH CHECK ((select auth.uid()) IS NOT NULL);

-- --- submission_items ---
DROP POLICY IF EXISTS "Authenticated users can insert submission_items" ON submission_items;
CREATE POLICY "Authenticated users can insert submission_items"
  ON submission_items FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can update submission_items" ON submission_items;
CREATE POLICY "Authenticated users can update submission_items"
  ON submission_items FOR UPDATE TO authenticated
  USING ((select auth.uid()) IS NOT NULL)
  WITH CHECK ((select auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can delete submission_items" ON submission_items;
CREATE POLICY "Authenticated users can delete submission_items"
  ON submission_items FOR DELETE TO authenticated
  USING ((select auth.uid()) IS NOT NULL);

-- --- validation_logs ---
DROP POLICY IF EXISTS "Authenticated users can insert validation_logs" ON validation_logs;
CREATE POLICY "Authenticated users can insert validation_logs"
  ON validation_logs FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) IS NOT NULL);

-- --- training_sessions ---
DROP POLICY IF EXISTS "Authenticated users can insert training_sessions" ON training_sessions;
CREATE POLICY "Authenticated users can insert training_sessions"
  ON training_sessions FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can update training_sessions" ON training_sessions;
CREATE POLICY "Authenticated users can update training_sessions"
  ON training_sessions FOR UPDATE TO authenticated
  USING ((select auth.uid()) IS NOT NULL)
  WITH CHECK ((select auth.uid()) IS NOT NULL);

-- --- training_attendance ---
DROP POLICY IF EXISTS "Authenticated users can insert training_attendance" ON training_attendance;
CREATE POLICY "Authenticated users can insert training_attendance"
  ON training_attendance FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can update training_attendance" ON training_attendance;
CREATE POLICY "Authenticated users can update training_attendance"
  ON training_attendance FOR UPDATE TO authenticated
  USING ((select auth.uid()) IS NOT NULL)
  WITH CHECK ((select auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can delete training_attendance" ON training_attendance;
CREATE POLICY "Authenticated users can delete training_attendance"
  ON training_attendance FOR DELETE TO authenticated
  USING ((select auth.uid()) IS NOT NULL);

-- --- indicator_history ---
DROP POLICY IF EXISTS "Authenticated users can insert indicator_history" ON indicator_history;
CREATE POLICY "Authenticated users can insert indicator_history"
  ON indicator_history FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) IS NOT NULL);

-- --- saved_views ---
DROP POLICY IF EXISTS "Users can view own saved views" ON saved_views;
CREATE POLICY "Users can view own saved views"
  ON saved_views FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own saved views" ON saved_views;
CREATE POLICY "Users can insert own saved views"
  ON saved_views FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own saved views" ON saved_views;
CREATE POLICY "Users can update own saved views"
  ON saved_views FOR UPDATE TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own saved views" ON saved_views;
CREATE POLICY "Users can delete own saved views"
  ON saved_views FOR DELETE TO authenticated
  USING ((select auth.uid()) = user_id);

-- --- report_templates ---
DROP POLICY IF EXISTS "Authenticated users can insert report templates" ON report_templates;
CREATE POLICY "Authenticated users can insert report templates"
  ON report_templates FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can update report templates" ON report_templates;
CREATE POLICY "Authenticated users can update report templates"
  ON report_templates FOR UPDATE TO authenticated
  USING ((select auth.uid()) IS NOT NULL)
  WITH CHECK ((select auth.uid()) IS NOT NULL);

-- --- generated_reports ---
DROP POLICY IF EXISTS "Authenticated users can view generated reports" ON generated_reports;
CREATE POLICY "Authenticated users can view generated reports"
  ON generated_reports FOR SELECT TO authenticated
  USING ((select auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can insert generated reports" ON generated_reports;
CREATE POLICY "Authenticated users can insert generated reports"
  ON generated_reports FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) IS NOT NULL);

-- --- benchmark_snapshots ---
DROP POLICY IF EXISTS "Authenticated users can view benchmarks" ON benchmark_snapshots;
CREATE POLICY "Authenticated users can view benchmarks"
  ON benchmark_snapshots FOR SELECT TO authenticated
  USING ((select auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can insert benchmarks" ON benchmark_snapshots;
CREATE POLICY "Authenticated users can insert benchmarks"
  ON benchmark_snapshots FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) IS NOT NULL);

-- --- document_tags ---
DROP POLICY IF EXISTS "Authenticated users can view document tags" ON document_tags;
CREATE POLICY "Authenticated users can view document tags"
  ON document_tags FOR SELECT TO authenticated
  USING ((select auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can insert document tags" ON document_tags;
CREATE POLICY "Authenticated users can insert document tags"
  ON document_tags FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can delete document tags" ON document_tags;
CREATE POLICY "Authenticated users can delete document tags"
  ON document_tags FOR DELETE TO authenticated
  USING ((select auth.uid()) IS NOT NULL);

-- --- dashboard_preferences ---
DROP POLICY IF EXISTS "Users can view own dashboard preferences" ON dashboard_preferences;
CREATE POLICY "Users can view own dashboard preferences"
  ON dashboard_preferences FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own dashboard preferences" ON dashboard_preferences;
CREATE POLICY "Users can insert own dashboard preferences"
  ON dashboard_preferences FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own dashboard preferences" ON dashboard_preferences;
CREATE POLICY "Users can update own dashboard preferences"
  ON dashboard_preferences FOR UPDATE TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- --- forecasts ---
DROP POLICY IF EXISTS "Authenticated users can read forecasts" ON forecasts;
CREATE POLICY "Authenticated users can read forecasts"
  ON forecasts FOR SELECT TO authenticated
  USING ((select auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can insert forecasts" ON forecasts;
CREATE POLICY "Authenticated users can insert forecasts"
  ON forecasts FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can update forecasts" ON forecasts;
CREATE POLICY "Authenticated users can update forecasts"
  ON forecasts FOR UPDATE TO authenticated
  USING ((select auth.uid()) IS NOT NULL)
  WITH CHECK ((select auth.uid()) IS NOT NULL);

-- --- risk_rules ---
DROP POLICY IF EXISTS "Authenticated users can read risk rules" ON risk_rules;
CREATE POLICY "Authenticated users can read risk rules"
  ON risk_rules FOR SELECT TO authenticated
  USING ((select auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can manage risk rules" ON risk_rules;
CREATE POLICY "Authenticated users can manage risk rules"
  ON risk_rules FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can update risk rules" ON risk_rules;
CREATE POLICY "Authenticated users can update risk rules"
  ON risk_rules FOR UPDATE TO authenticated
  USING ((select auth.uid()) IS NOT NULL)
  WITH CHECK ((select auth.uid()) IS NOT NULL);

-- --- risk_flags ---
DROP POLICY IF EXISTS "Authenticated users can read risk flags" ON risk_flags;
CREATE POLICY "Authenticated users can read risk flags"
  ON risk_flags FOR SELECT TO authenticated
  USING ((select auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can insert risk flags" ON risk_flags;
CREATE POLICY "Authenticated users can insert risk flags"
  ON risk_flags FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can update risk flags" ON risk_flags;
CREATE POLICY "Authenticated users can update risk flags"
  ON risk_flags FOR UPDATE TO authenticated
  USING ((select auth.uid()) IS NOT NULL)
  WITH CHECK ((select auth.uid()) IS NOT NULL);

-- --- health_scores ---
DROP POLICY IF EXISTS "Authenticated users can read health scores" ON health_scores;
CREATE POLICY "Authenticated users can read health scores"
  ON health_scores FOR SELECT TO authenticated
  USING ((select auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can insert health scores" ON health_scores;
CREATE POLICY "Authenticated users can insert health scores"
  ON health_scores FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can update health scores" ON health_scores;
CREATE POLICY "Authenticated users can update health scores"
  ON health_scores FOR UPDATE TO authenticated
  USING ((select auth.uid()) IS NOT NULL)
  WITH CHECK ((select auth.uid()) IS NOT NULL);

-- --- notifications ---
DROP POLICY IF EXISTS "Users can read own notifications" ON notifications;
CREATE POLICY "Users can read own notifications"
  ON notifications FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Authenticated users can insert notifications" ON notifications;
CREATE POLICY "Authenticated users can insert notifications"
  ON notifications FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "Users can delete own notifications" ON notifications;
CREATE POLICY "Users can delete own notifications"
  ON notifications FOR DELETE TO authenticated
  USING ((select auth.uid()) = user_id);

-- --- governance_documents ---
DROP POLICY IF EXISTS "Authenticated users can read governance documents" ON governance_documents;
CREATE POLICY "Authenticated users can read governance documents"
  ON governance_documents FOR SELECT TO authenticated
  USING ((select auth.uid()) IS NOT NULL AND is_deleted = false);

DROP POLICY IF EXISTS "Authenticated users can insert governance documents" ON governance_documents;
CREATE POLICY "Authenticated users can insert governance documents"
  ON governance_documents FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can update governance documents" ON governance_documents;
CREATE POLICY "Authenticated users can update governance documents"
  ON governance_documents FOR UPDATE TO authenticated
  USING ((select auth.uid()) IS NOT NULL)
  WITH CHECK ((select auth.uid()) IS NOT NULL);

-- --- permission_policies ---
DROP POLICY IF EXISTS "Authenticated users can read permission policies" ON permission_policies;
CREATE POLICY "Authenticated users can read permission policies"
  ON permission_policies FOR SELECT TO authenticated
  USING ((select auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can manage permission policies" ON permission_policies;
CREATE POLICY "Authenticated users can manage permission policies"
  ON permission_policies FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can update permission policies" ON permission_policies;
CREATE POLICY "Authenticated users can update permission policies"
  ON permission_policies FOR UPDATE TO authenticated
  USING ((select auth.uid()) IS NOT NULL)
  WITH CHECK ((select auth.uid()) IS NOT NULL);