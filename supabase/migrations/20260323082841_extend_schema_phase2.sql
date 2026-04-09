/*
  # Phase 2 - M&E Engine Schema Extension

  1. Modified Tables
    - `indicators` - Added pillar, category, baseline_value, validation_rules columns

  2. New Tables
    - `submissions` - Data collection submissions with workflow status
      - `id` (uuid, PK)
      - `project_id` (uuid, FK -> projects)
      - `reporting_period_id` (uuid, FK -> reporting_periods)
      - `submitted_by` (uuid, FK -> profiles)
      - `status` (text) - draft/submitted/validated/rejected/approved
      - `submission_date` (timestamptz)
      - `notes` (text)
      - `is_deleted` (boolean)
      - `created_at` / `updated_at` (timestamptz)

    - `submission_items` - Individual indicator values within a submission
      - `id` (uuid, PK)
      - `submission_id` (uuid, FK -> submissions)
      - `indicator_id` (uuid, FK -> indicators)
      - `value` (numeric)
      - `notes` (text)
      - `created_at` / `updated_at` (timestamptz)

    - `validation_logs` - Reviewer actions on submissions
      - `id` (uuid, PK)
      - `submission_id` (uuid, FK -> submissions)
      - `action` (text) - validated/rejected/approved
      - `comment` (text)
      - `performed_by` (uuid, FK -> profiles)
      - `created_at` (timestamptz)

    - `training_sessions` - Training/capacity building events
      - `id` (uuid, PK)
      - `title` (text)
      - `description` (text)
      - `category` (text)
      - `programme_id` (uuid, FK -> programmes)
      - `entity_id` (uuid, FK -> entities)
      - `facilitator` (text)
      - `location` (text)
      - `session_date` (date)
      - `duration_hours` (numeric)
      - `max_attendees` (integer)
      - `status` (text) - planned/in_progress/completed/cancelled
      - `is_deleted` (boolean)
      - `created_at` / `updated_at` (timestamptz)

    - `training_attendance` - Attendance records for training sessions
      - `id` (uuid, PK)
      - `session_id` (uuid, FK -> training_sessions)
      - `attendee_name` (text)
      - `attendee_email` (text)
      - `attendee_phone` (text)
      - `organisation` (text)
      - `gender` (text)
      - `age_group` (text)
      - `completed` (boolean)
      - `hours_attended` (numeric)
      - `certificate_issued` (boolean)
      - `created_at` (timestamptz)

    - `indicator_history` - Historical indicator values for trend tracking
      - `id` (uuid, PK)
      - `indicator_id` (uuid, FK -> indicators)
      - `project_id` (uuid, FK -> projects)
      - `period_name` (text)
      - `period_date` (date)
      - `value` (numeric)
      - `created_at` (timestamptz)

  3. Security
    - RLS enabled on all new tables
    - Policies for authenticated users
    
  4. Indexes
    - Foreign keys and status columns indexed
*/

-- ============================================
-- EXTEND INDICATORS TABLE
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'indicators' AND column_name = 'pillar'
  ) THEN
    ALTER TABLE indicators ADD COLUMN pillar text NOT NULL DEFAULT 'economic';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'indicators' AND column_name = 'category'
  ) THEN
    ALTER TABLE indicators ADD COLUMN category text NOT NULL DEFAULT '';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'indicators' AND column_name = 'baseline_value'
  ) THEN
    ALTER TABLE indicators ADD COLUMN baseline_value numeric DEFAULT 0;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'indicators' AND column_name = 'validation_rules'
  ) THEN
    ALTER TABLE indicators ADD COLUMN validation_rules jsonb DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- ============================================
-- SUBMISSIONS
-- ============================================
CREATE TABLE IF NOT EXISTS submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id),
  reporting_period_id uuid NOT NULL REFERENCES reporting_periods(id),
  submitted_by uuid REFERENCES profiles(id),
  status text NOT NULL DEFAULT 'draft',
  submission_date timestamptz,
  notes text DEFAULT '',
  is_deleted boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view submissions"
  ON submissions FOR SELECT TO authenticated
  USING (is_deleted = false);

CREATE POLICY "Authenticated users can insert submissions"
  ON submissions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update submissions"
  ON submissions FOR UPDATE TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================
-- SUBMISSION ITEMS
-- ============================================
CREATE TABLE IF NOT EXISTS submission_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  indicator_id uuid NOT NULL REFERENCES indicators(id),
  value numeric NOT NULL DEFAULT 0,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE submission_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view submission_items"
  ON submission_items FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert submission_items"
  ON submission_items FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update submission_items"
  ON submission_items FOR UPDATE TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete submission_items"
  ON submission_items FOR DELETE TO authenticated
  USING (auth.uid() IS NOT NULL);

-- ============================================
-- VALIDATION LOGS
-- ============================================
CREATE TABLE IF NOT EXISTS validation_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  action text NOT NULL,
  comment text DEFAULT '',
  performed_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE validation_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view validation_logs"
  ON validation_logs FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert validation_logs"
  ON validation_logs FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================
-- TRAINING SESSIONS
-- ============================================
CREATE TABLE IF NOT EXISTS training_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  category text NOT NULL DEFAULT 'general',
  programme_id uuid REFERENCES programmes(id),
  entity_id uuid REFERENCES entities(id),
  facilitator text DEFAULT '',
  location text DEFAULT '',
  session_date date NOT NULL,
  duration_hours numeric NOT NULL DEFAULT 0,
  max_attendees integer DEFAULT 0,
  status text NOT NULL DEFAULT 'planned',
  is_deleted boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE training_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view training_sessions"
  ON training_sessions FOR SELECT TO authenticated
  USING (is_deleted = false);

CREATE POLICY "Authenticated users can insert training_sessions"
  ON training_sessions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update training_sessions"
  ON training_sessions FOR UPDATE TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================
-- TRAINING ATTENDANCE
-- ============================================
CREATE TABLE IF NOT EXISTS training_attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES training_sessions(id) ON DELETE CASCADE,
  attendee_name text NOT NULL,
  attendee_email text DEFAULT '',
  attendee_phone text DEFAULT '',
  organisation text DEFAULT '',
  gender text DEFAULT '',
  age_group text DEFAULT '',
  completed boolean DEFAULT false,
  hours_attended numeric DEFAULT 0,
  certificate_issued boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE training_attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view training_attendance"
  ON training_attendance FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert training_attendance"
  ON training_attendance FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update training_attendance"
  ON training_attendance FOR UPDATE TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete training_attendance"
  ON training_attendance FOR DELETE TO authenticated
  USING (auth.uid() IS NOT NULL);

-- ============================================
-- INDICATOR HISTORY
-- ============================================
CREATE TABLE IF NOT EXISTS indicator_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  indicator_id uuid NOT NULL REFERENCES indicators(id),
  project_id uuid REFERENCES projects(id),
  period_name text NOT NULL,
  period_date date NOT NULL,
  value numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE indicator_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view indicator_history"
  ON indicator_history FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert indicator_history"
  ON indicator_history FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================
-- TRIGGERS FOR updated_at
-- ============================================
CREATE TRIGGER tr_submissions_updated_at BEFORE UPDATE ON submissions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_submission_items_updated_at BEFORE UPDATE ON submission_items FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_training_sessions_updated_at BEFORE UPDATE ON training_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_indicators_pillar ON indicators(pillar);
CREATE INDEX IF NOT EXISTS idx_indicators_category ON indicators(category);
CREATE INDEX IF NOT EXISTS idx_submissions_project_id ON submissions(project_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);
CREATE INDEX IF NOT EXISTS idx_submissions_reporting_period ON submissions(reporting_period_id);
CREATE INDEX IF NOT EXISTS idx_submission_items_submission ON submission_items(submission_id);
CREATE INDEX IF NOT EXISTS idx_submission_items_indicator ON submission_items(indicator_id);
CREATE INDEX IF NOT EXISTS idx_validation_logs_submission ON validation_logs(submission_id);
CREATE INDEX IF NOT EXISTS idx_training_sessions_programme ON training_sessions(programme_id);
CREATE INDEX IF NOT EXISTS idx_training_sessions_status ON training_sessions(status);
CREATE INDEX IF NOT EXISTS idx_training_attendance_session ON training_attendance(session_id);
CREATE INDEX IF NOT EXISTS idx_indicator_history_indicator ON indicator_history(indicator_id);
CREATE INDEX IF NOT EXISTS idx_indicator_history_project ON indicator_history(project_id);
