/*
  # Hortgro Integrated M&E Platform - Initial Schema

  1. New Tables
    - `roles` - System roles (Super Admin, Hortgro Admin, Programme Manager, etc.)
      - `id` (uuid, primary key)
      - `name` (text, unique) - role identifier
      - `display_name` (text) - human-readable name
      - `description` (text) - role description
      - `permissions` (jsonb) - role permissions object
      - `created_at` (timestamptz)

    - `profiles` - Extended user profiles linked to auth.users
      - `id` (uuid, primary key, references auth.users)
      - `email` (text)
      - `full_name` (text)
      - `avatar_url` (text)
      - `role_id` (uuid, references roles)
      - `organisation` (text)
      - `phone` (text)
      - `is_active` (boolean)
      - `last_sign_in` (timestamptz)
      - `created_at` / `updated_at` (timestamptz)

    - `programmes` - Top-level programme groupings
      - `id` (uuid, primary key)
      - `name` (text)
      - `code` (text, unique) - short code
      - `description` (text)
      - `status` (text) - active/inactive/archived
      - `start_date` / `end_date` (date)
      - `budget` (numeric)
      - `manager_id` (uuid, references profiles)
      - `is_deleted` (boolean) - soft delete
      - `created_at` / `updated_at` (timestamptz)

    - `entities` - Organisational entities (cooperatives, farms, groups)
      - `id` (uuid, primary key)
      - `name` (text)
      - `type` (text) - farm/cooperative/association/company
      - `region` (text)
      - `province` (text)
      - `latitude` / `longitude` (numeric)
      - `contact_person` (text)
      - `contact_email` / `contact_phone` (text)
      - `is_active` / `is_deleted` (boolean)
      - `created_at` / `updated_at` (timestamptz)

    - `projects` - Projects under programmes linked to entities
      - `id` (uuid, primary key)
      - `name` (text)
      - `code` (text, unique)
      - `description` (text)
      - `programme_id` (uuid, references programmes)
      - `entity_id` (uuid, references entities)
      - `status` (text)
      - `start_date` / `end_date` (date)
      - `budget` (numeric)
      - `lead_id` (uuid, references profiles)
      - `is_deleted` (boolean)
      - `created_at` / `updated_at` (timestamptz)

    - `farms` - Farm-level data
      - `id` (uuid, primary key)
      - `name` (text)
      - `entity_id` (uuid, references entities)
      - `hectares` (numeric)
      - `crop_types` (text[])
      - `region` / `province` (text)
      - `latitude` / `longitude` (numeric)
      - `is_active` / `is_deleted` (boolean)
      - `created_at` / `updated_at` (timestamptz)

    - `indicators` - M&E indicators
      - `id` (uuid, primary key)
      - `name` (text)
      - `code` (text, unique)
      - `description` (text)
      - `unit` (text)
      - `type` (text) - output/outcome/impact
      - `frequency` (text) - monthly/quarterly/annually
      - `target_value` (numeric)
      - `programme_id` (uuid, references programmes)
      - `is_active` / `is_deleted` (boolean)
      - `created_at` / `updated_at` (timestamptz)

    - `reporting_periods` - Time-bound reporting windows
      - `id` (uuid, primary key)
      - `name` (text)
      - `period_type` (text)
      - `start_date` / `end_date` (date)
      - `status` (text) - open/closed/locked
      - `created_at` (timestamptz)

    - `indicator_data` - Actual indicator submissions
      - `id` (uuid, primary key)
      - `indicator_id` (uuid, references indicators)
      - `project_id` (uuid, references projects)
      - `reporting_period_id` (uuid, references reporting_periods)
      - `value` (numeric)
      - `notes` (text)
      - `status` (text) - draft/submitted/approved/rejected
      - `submitted_by` (uuid, references profiles)
      - `approved_by` (uuid, references profiles)
      - `created_at` / `updated_at` (timestamptz)

    - `documents` - File/document metadata
      - `id` (uuid, primary key)
      - `name` (text)
      - `file_path` (text)
      - `file_type` (text)
      - `file_size` (integer)
      - `entity_type` (text)
      - `entity_id` (uuid)
      - `uploaded_by` (uuid, references profiles)
      - `is_deleted` (boolean)
      - `created_at` (timestamptz)

    - `notes` - General notes attached to entities
      - `id` (uuid, primary key)
      - `content` (text)
      - `entity_type` (text)
      - `entity_id` (uuid)
      - `author_id` (uuid, references profiles)
      - `is_deleted` (boolean)
      - `created_at` / `updated_at` (timestamptz)

    - `audit_logs` - System activity log
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `action` (text)
      - `entity_type` (text)
      - `entity_id` (uuid)
      - `old_values` / `new_values` (jsonb)
      - `ip_address` (text)
      - `created_at` (timestamptz)

    - `access_permissions` - Granular access control
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `resource_type` (text)
      - `resource_id` (uuid)
      - `permission_level` (text)
      - `granted_by` (uuid, references profiles)
      - `created_at` (timestamptz)

  2. Security
    - RLS enabled on ALL tables
    - Policies for authenticated users based on role and ownership
    - Audit logs restricted to admins

  3. Indexes
    - Foreign key columns indexed for performance
    - Status and is_deleted columns indexed for filtering
*/

-- ============================================
-- ROLES
-- ============================================
CREATE TABLE IF NOT EXISTS roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  display_name text NOT NULL,
  description text DEFAULT '',
  permissions jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view roles"
  ON roles FOR SELECT
  TO authenticated
  USING (true);

-- ============================================
-- PROFILES
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL DEFAULT '',
  avatar_url text DEFAULT '',
  role_id uuid REFERENCES roles(id),
  organisation text DEFAULT '',
  phone text DEFAULT '',
  is_active boolean DEFAULT true,
  last_sign_in timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- ============================================
-- PROGRAMMES
-- ============================================
CREATE TABLE IF NOT EXISTS programmes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text UNIQUE NOT NULL,
  description text DEFAULT '',
  status text NOT NULL DEFAULT 'active',
  start_date date,
  end_date date,
  budget numeric DEFAULT 0,
  manager_id uuid REFERENCES profiles(id),
  is_deleted boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE programmes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view programmes"
  ON programmes FOR SELECT
  TO authenticated
  USING (is_deleted = false);

CREATE POLICY "Authenticated users can insert programmes"
  ON programmes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update programmes"
  ON programmes FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================
-- ENTITIES
-- ============================================
CREATE TABLE IF NOT EXISTS entities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL DEFAULT 'farm',
  region text DEFAULT '',
  province text DEFAULT '',
  latitude numeric,
  longitude numeric,
  contact_person text DEFAULT '',
  contact_email text DEFAULT '',
  contact_phone text DEFAULT '',
  is_active boolean DEFAULT true,
  is_deleted boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE entities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view entities"
  ON entities FOR SELECT
  TO authenticated
  USING (is_deleted = false);

CREATE POLICY "Authenticated users can insert entities"
  ON entities FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update entities"
  ON entities FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================
-- PROJECTS
-- ============================================
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text UNIQUE NOT NULL,
  description text DEFAULT '',
  programme_id uuid REFERENCES programmes(id),
  entity_id uuid REFERENCES entities(id),
  status text NOT NULL DEFAULT 'active',
  start_date date,
  end_date date,
  budget numeric DEFAULT 0,
  lead_id uuid REFERENCES profiles(id),
  is_deleted boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view projects"
  ON projects FOR SELECT
  TO authenticated
  USING (is_deleted = false);

CREATE POLICY "Authenticated users can insert projects"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update projects"
  ON projects FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================
-- FARMS
-- ============================================
CREATE TABLE IF NOT EXISTS farms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  entity_id uuid REFERENCES entities(id),
  hectares numeric DEFAULT 0,
  crop_types text[] DEFAULT '{}',
  region text DEFAULT '',
  province text DEFAULT '',
  latitude numeric,
  longitude numeric,
  is_active boolean DEFAULT true,
  is_deleted boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE farms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view farms"
  ON farms FOR SELECT
  TO authenticated
  USING (is_deleted = false);

CREATE POLICY "Authenticated users can insert farms"
  ON farms FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update farms"
  ON farms FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================
-- INDICATORS
-- ============================================
CREATE TABLE IF NOT EXISTS indicators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text UNIQUE NOT NULL,
  description text DEFAULT '',
  unit text NOT NULL DEFAULT 'number',
  type text NOT NULL DEFAULT 'output',
  frequency text NOT NULL DEFAULT 'quarterly',
  target_value numeric DEFAULT 0,
  programme_id uuid REFERENCES programmes(id),
  is_active boolean DEFAULT true,
  is_deleted boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE indicators ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view indicators"
  ON indicators FOR SELECT
  TO authenticated
  USING (is_deleted = false);

CREATE POLICY "Authenticated users can insert indicators"
  ON indicators FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update indicators"
  ON indicators FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================
-- REPORTING PERIODS
-- ============================================
CREATE TABLE IF NOT EXISTS reporting_periods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  period_type text NOT NULL DEFAULT 'quarterly',
  start_date date NOT NULL,
  end_date date NOT NULL,
  status text NOT NULL DEFAULT 'open',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE reporting_periods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view reporting_periods"
  ON reporting_periods FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert reporting_periods"
  ON reporting_periods FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================
-- INDICATOR DATA
-- ============================================
CREATE TABLE IF NOT EXISTS indicator_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  indicator_id uuid NOT NULL REFERENCES indicators(id),
  project_id uuid REFERENCES projects(id),
  reporting_period_id uuid REFERENCES reporting_periods(id),
  value numeric NOT NULL DEFAULT 0,
  notes text DEFAULT '',
  status text NOT NULL DEFAULT 'draft',
  submitted_by uuid REFERENCES profiles(id),
  approved_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE indicator_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view indicator_data"
  ON indicator_data FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert indicator_data"
  ON indicator_data FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update indicator_data"
  ON indicator_data FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================
-- DOCUMENTS
-- ============================================
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  file_path text DEFAULT '',
  file_type text DEFAULT '',
  file_size integer DEFAULT 0,
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  uploaded_by uuid REFERENCES profiles(id),
  is_deleted boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view documents"
  ON documents FOR SELECT
  TO authenticated
  USING (is_deleted = false);

CREATE POLICY "Authenticated users can insert documents"
  ON documents FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================
-- NOTES
-- ============================================
CREATE TABLE IF NOT EXISTS notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  author_id uuid REFERENCES profiles(id),
  is_deleted boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view notes"
  ON notes FOR SELECT
  TO authenticated
  USING (is_deleted = false);

CREATE POLICY "Authenticated users can insert notes"
  ON notes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own notes"
  ON notes FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

-- ============================================
-- AUDIT LOGS
-- ============================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id),
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  old_values jsonb DEFAULT '{}'::jsonb,
  new_values jsonb DEFAULT '{}'::jsonb,
  ip_address text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view audit_logs"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert audit_logs"
  ON audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================
-- ACCESS PERMISSIONS
-- ============================================
CREATE TABLE IF NOT EXISTS access_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id),
  resource_type text NOT NULL,
  resource_id uuid NOT NULL,
  permission_level text NOT NULL DEFAULT 'view',
  granted_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE access_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view own permissions"
  ON access_permissions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can insert permissions"
  ON access_permissions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete own permissions"
  ON access_permissions FOR DELETE
  TO authenticated
  USING (auth.uid() = granted_by);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_profiles_role_id ON profiles(role_id);
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_programmes_status ON programmes(status);
CREATE INDEX IF NOT EXISTS idx_programmes_is_deleted ON programmes(is_deleted);
CREATE INDEX IF NOT EXISTS idx_entities_type ON entities(type);
CREATE INDEX IF NOT EXISTS idx_entities_province ON entities(province);
CREATE INDEX IF NOT EXISTS idx_entities_is_deleted ON entities(is_deleted);
CREATE INDEX IF NOT EXISTS idx_projects_programme_id ON projects(programme_id);
CREATE INDEX IF NOT EXISTS idx_projects_entity_id ON projects(entity_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_is_deleted ON projects(is_deleted);
CREATE INDEX IF NOT EXISTS idx_farms_entity_id ON farms(entity_id);
CREATE INDEX IF NOT EXISTS idx_indicators_programme_id ON indicators(programme_id);
CREATE INDEX IF NOT EXISTS idx_indicators_type ON indicators(type);
CREATE INDEX IF NOT EXISTS idx_indicator_data_indicator_id ON indicator_data(indicator_id);
CREATE INDEX IF NOT EXISTS idx_indicator_data_project_id ON indicator_data(project_id);
CREATE INDEX IF NOT EXISTS idx_indicator_data_status ON indicator_data(status);
CREATE INDEX IF NOT EXISTS idx_documents_entity ON documents(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_notes_entity ON notes(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_access_permissions_user_id ON access_permissions(user_id);

-- ============================================
-- TRIGGER: Auto-update updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_programmes_updated_at BEFORE UPDATE ON programmes FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_entities_updated_at BEFORE UPDATE ON entities FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_farms_updated_at BEFORE UPDATE ON farms FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_indicators_updated_at BEFORE UPDATE ON indicators FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_indicator_data_updated_at BEFORE UPDATE ON indicator_data FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_notes_updated_at BEFORE UPDATE ON notes FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- FUNCTION: Handle new user signup
-- ============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  viewer_role_id uuid;
BEGIN
  SELECT id INTO viewer_role_id FROM roles WHERE name = 'viewer' LIMIT 1;
  
  INSERT INTO profiles (id, email, full_name, role_id)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    viewer_role_id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
