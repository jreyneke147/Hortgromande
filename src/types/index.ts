export interface Role {
  id: string;
  name: string;
  display_name: string;
  description: string;
  permissions: Record<string, string>;
  created_at: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string;
  role_id: string | null;
  organisation: string;
  phone: string;
  is_active: boolean;
  last_sign_in: string | null;
  created_at: string;
  updated_at: string;
  roles?: Role;
}

export interface Programme {
  id: string;
  name: string;
  code: string;
  description: string;
  status: string;
  start_date: string | null;
  end_date: string | null;
  budget: number;
  manager_id: string | null;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
}

export interface Entity {
  id: string;
  name: string;
  type: string;
  region: string;
  province: string;
  latitude: number | null;
  longitude: number | null;
  contact_person: string;
  contact_email: string;
  contact_phone: string;
  is_active: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  name: string;
  code: string;
  description: string;
  programme_id: string | null;
  entity_id: string | null;
  status: string;
  start_date: string | null;
  end_date: string | null;
  budget: number;
  lead_id: string | null;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  programmes?: Programme;
  entities?: Entity;
}

export type IndicatorPillar = 'economic' | 'social' | 'environmental' | 'institutional';

export interface Indicator {
  id: string;
  name: string;
  code: string;
  description: string;
  unit: string;
  type: string;
  frequency: string;
  target_value: number;
  baseline_value: number;
  pillar: IndicatorPillar;
  category: string;
  validation_rules: Record<string, unknown>;
  programme_id: string | null;
  is_active: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  programmes?: Programme;
}

export interface ReportingPeriod {
  id: string;
  name: string;
  period_type: string;
  start_date: string;
  end_date: string;
  status: string;
  created_at: string;
}

export interface Submission {
  id: string;
  project_id: string;
  reporting_period_id: string;
  submitted_by: string | null;
  status: string;
  submission_date: string | null;
  notes: string;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  projects?: Project;
  reporting_periods?: ReportingPeriod;
  profiles?: Profile;
  submission_items?: SubmissionItem[];
}

export interface SubmissionItem {
  id: string;
  submission_id: string;
  indicator_id: string;
  value: number;
  notes: string;
  created_at: string;
  updated_at: string;
  indicators?: Indicator;
}

export interface ValidationLog {
  id: string;
  submission_id: string;
  action: string;
  comment: string;
  performed_by: string | null;
  created_at: string;
  profiles?: Profile;
}

export interface TrainingSession {
  id: string;
  title: string;
  description: string;
  category: string;
  programme_id: string | null;
  entity_id: string | null;
  facilitator: string;
  location: string;
  session_date: string;
  duration_hours: number;
  max_attendees: number;
  status: string;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  programmes?: Programme;
  entities?: Entity;
  training_attendance?: TrainingAttendance[];
}

export interface TrainingAttendance {
  id: string;
  session_id: string;
  attendee_name: string;
  attendee_email: string;
  attendee_phone: string;
  organisation: string;
  gender: string;
  age_group: string;
  completed: boolean;
  hours_attended: number;
  certificate_issued: boolean;
  created_at: string;
}

export interface IndicatorHistory {
  id: string;
  indicator_id: string;
  project_id: string | null;
  period_name: string;
  period_date: string;
  value: number;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  old_values: Record<string, unknown>;
  new_values: Record<string, unknown>;
  ip_address: string;
  created_at: string;
  profiles?: Profile;
}

export type UserRole = 'super_admin' | 'hortgro_admin' | 'programme_manager' | 'me_officer' | 'partner' | 'viewer';

export interface SavedView {
  id: string;
  user_id: string;
  name: string;
  view_type: string;
  filters: Record<string, unknown>;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  report_type: string;
  template_config: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
}

export interface GeneratedReport {
  id: string;
  template_id: string | null;
  name: string;
  report_type: string;
  filters: Record<string, unknown>;
  status: string;
  generated_by: string | null;
  file_path: string;
  created_at: string;
}

export interface BenchmarkSnapshot {
  id: string;
  entity_id: string;
  indicator_id: string;
  period_name: string;
  entity_value: number;
  regional_avg: number;
  programme_avg: number;
  sector_avg: number;
  percentile_rank: number;
  snapshot_date: string;
  created_at: string;
  entities?: Entity;
  indicators?: Indicator;
}

export interface DocumentRecord {
  id: string;
  name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  entity_type: string;
  entity_id: string;
  description: string;
  programme_id: string | null;
  reporting_period_id: string | null;
  uploaded_by: string | null;
  is_deleted: boolean;
  created_at: string;
  programmes?: Programme;
  document_tags?: { id: string; tag: string }[];
}

export interface DocumentTag {
  id: string;
  document_id: string;
  tag: string;
  created_at: string;
}

export interface Forecast {
  id: string;
  indicator_id: string;
  project_id: string | null;
  entity_id: string | null;
  period_name: string;
  forecast_value: number;
  actual_value: number | null;
  trend_direction: string;
  confidence: number;
  method: string;
  notes: string;
  created_at: string;
  indicators?: Indicator;
  projects?: Project;
  entities?: Entity;
}

export interface RiskRule {
  id: string;
  name: string;
  description: string;
  category: string;
  severity: string;
  condition_type: string;
  condition_config: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
}

export interface RiskFlag {
  id: string;
  rule_id: string | null;
  entity_id: string | null;
  project_id: string | null;
  programme_id: string | null;
  severity: string;
  status: string;
  title: string;
  description: string;
  metric_value: number | null;
  threshold_value: number | null;
  flagged_at: string;
  resolved_at: string | null;
  resolved_by: string | null;
  created_at: string;
  risk_rules?: RiskRule;
  entities?: Entity;
  projects?: Project;
  programmes?: Programme;
}

export interface HealthScore {
  id: string;
  entity_type: string;
  entity_id: string;
  overall_score: number;
  data_completeness: number;
  submission_timeliness: number;
  outcome_performance: number;
  governance_maturity: number;
  sustainability_score: number;
  training_engagement: number;
  status: string;
  period_name: string;
  scored_at: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  category: string;
  title: string;
  message: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

export interface GovernanceDocument {
  id: string;
  title: string;
  description: string;
  document_type: string;
  category: string;
  file_path: string;
  file_size: number;
  version: string;
  status: string;
  effective_date: string | null;
  review_date: string | null;
  owner_id: string | null;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface PermissionPolicy {
  id: string;
  name: string;
  description: string;
  role_id: string | null;
  resource_type: string;
  access_level: string;
  conditions: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  roles?: Role;
}
