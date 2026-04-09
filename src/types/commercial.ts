export interface Market {
  id: string;
  name: string;
  code: string;
  region: string;
  is_active: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface Vendor {
  id: string;
  name: string;
  code: string;
  contact_person: string;
  contact_email: string;
  contact_phone: string;
  market_id: string | null;
  is_active: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  markets?: Market;
}

export interface Shipment {
  id: string;
  vessel: string;
  container_number: string;
  sailing_week: number;
  sailing_year: number;
  market_id: string | null;
  vendor_id: string | null;
  departure_date: string | null;
  arrival_date: string | null;
  status: string;
  source_document_id: string | null;
  import_batch_id: string | null;
  created_at: string;
  updated_at: string;
  markets?: Market;
  vendors?: Vendor;
}

export interface Consignment {
  id: string;
  consignment_number: string;
  shipment_id: string | null;
  grower_id: string | null;
  puc: string;
  commodity: string;
  variety: string;
  pack: string;
  barcode: string;
  num_cartons: number;
  advance_per_carton: number;
  total_advance: number;
  nett_per_carton: number;
  total_nett: number;
  source_document_id: string | null;
  import_batch_id: string | null;
  created_at: string;
  updated_at: string;
  shipments?: Shipment;
}

export interface CommercialRecord {
  id: string;
  consignment_id: string | null;
  season_year: number;
  sailing_week: number;
  market: string;
  vendor_name: string;
  vessel: string;
  container_number: string;
  consignment_number: string;
  puc: string;
  commodity: string;
  variety: string;
  pack: string;
  barcode: string;
  num_cartons: number;
  advance_per_carton: number;
  total_advance: number;
  nett_per_carton: number;
  total_nett: number;
  grower_id: string | null;
  source_document_id: string | null;
  import_batch_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface StagingCommercialRow {
  id: string;
  import_batch_id: string;
  source_sheet_name: string;
  source_row_number: number;
  raw_data: Record<string, string>;
  mapped_data: Record<string, string> | null;
  validation_status: string;
  validation_errors: ValidationError[] | null;
  duplicate_of: string | null;
  target_consignment_id: string | null;
  target_shipment_id: string | null;
  target_grower_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface CommercialImportLog {
  id: string;
  import_batch_id: string;
  staging_row_id: string | null;
  log_level: string;
  message: string;
  details: Record<string, unknown> | null;
  created_at: string;
}

export interface ImportBatch {
  id: string;
  source_document_id: string | null;
  batch_name: string;
  status: string;
  total_rows: number;
  processed_rows: number;
  error_rows: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  source_documents?: { file_name: string; file_type: string };
}

export interface FieldDefinition {
  key: string;
  label: string;
  required: boolean;
}

export const COMMERCIAL_SYSTEM_FIELDS: FieldDefinition[] = [
  { key: 'season_year', label: 'Year', required: true },
  { key: 'sailing_week', label: 'Sailing Week', required: true },
  { key: 'market', label: 'Market', required: true },
  { key: 'vendor_name', label: 'Vendor Name', required: true },
  { key: 'puc', label: 'PUC', required: true },
  { key: 'vessel', label: 'Vessel', required: false },
  { key: 'container_number', label: 'Container Number', required: false },
  { key: 'consignment_number', label: 'Consignment Number', required: true },
  { key: 'commodity', label: 'Commodity', required: true },
  { key: 'variety', label: 'Variety', required: true },
  { key: 'pack', label: 'Pack', required: false },
  { key: 'barcode', label: 'Barcode / Pallet ID', required: false },
  { key: 'num_cartons', label: 'Number of Cartons', required: true },
  { key: 'advance_per_carton', label: 'Advance per Carton', required: false },
  { key: 'total_advance', label: 'Total Advance', required: false },
  { key: 'nett_per_carton', label: 'Nett per Carton', required: false },
  { key: 'total_nett', label: 'Total Nett', required: false },
];

export const COMMERCIAL_AUTO_MATCH: Record<string, RegExp> = {
  season_year: /^(year|season|season.?year)$/i,
  sailing_week: /^(sail.*week|week|wk|sailing.?wk)$/i,
  market: /^(market|mkt|destination)$/i,
  vendor_name: /^(vendor|vendor.?name|agent)$/i,
  puc: /^(puc|producer.?code|grower.?code)$/i,
  vessel: /^(vessel|ship|ship.?name)$/i,
  container_number: /^(container|container.?(no|num|number)|cntr)$/i,
  consignment_number: /^(consignment|consignment.?(no|num|number)|orig.*consignment)$/i,
  commodity: /^(commodity|comm|product|fruit)$/i,
  variety: /^(variety|var|cultivar)$/i,
  pack: /^(pack|pack.?type|packaging)$/i,
  barcode: /^(barcode|pallet|pallet.?id|bar.?code)$/i,
  num_cartons: /^(cartons|num.*cartons|no.*cartons|ctns|qty)$/i,
  advance_per_carton: /^(advance|adv|advance.?per.?(ctn|carton))$/i,
  total_advance: /^(total.*advance|tot.*adv)$/i,
  nett_per_carton: /^(nett|nett.*per.?(ctn|carton)|net.*payment)$/i,
  total_nett: /^(total.*nett|tot.*nett|total.*net)$/i,
};

export const IMPORT_STATUS_LABELS: Record<string, string> = {
  imported: 'Imported',
  mapped: 'Mapped',
  validating: 'Validating',
  'needs_review': 'Needs Review',
  'validation_failed': 'Validation Failed',
  'validation_passed': 'Validation Passed',
  approved: 'Approved',
  published: 'Published',
};

export const VALIDATION_STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  passed: 'Passed',
  failed: 'Failed',
  'needs_review': 'Needs Review',
};
