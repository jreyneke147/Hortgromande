import { supabase } from './supabase';
import type { ValidationError } from '../types/commercial';

export async function uploadCommercialWorkbook(
  file: File,
  batchName: string,
  sheetName?: string,
  mappingId?: string,
): Promise<{ batchId: string; rowCount: number }> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const form = new FormData();
  form.append('file', file);
  form.append('batch_name', batchName);
  if (sheetName) form.append('sheet_name', sheetName);
  if (mappingId) form.append('mapping_id', mappingId);

  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ingest-commercial-workbook`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
    body: form,
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error((errBody as { error?: string }).error ?? 'Upload failed');
  }

  const body = await res.json() as { batch_id: string; rows_inserted: number };
  return { batchId: body.batch_id, rowCount: body.rows_inserted };
}

export function validateCommercialRow(data: Record<string, string>): ValidationError[] {
  const errors: ValidationError[] = [];
  const required = ['season_year', 'sailing_week', 'market', 'vendor_name', 'puc', 'consignment_number', 'commodity', 'variety', 'num_cartons'];

  for (const field of required) {
    if (!data[field]?.trim()) {
      errors.push({ field, message: `${field.replace(/_/g, ' ')} is required`, severity: 'error' });
    }
  }

  const numCartons = Number(data.num_cartons);
  if (data.num_cartons && (isNaN(numCartons) || numCartons < 0)) {
    errors.push({ field: 'num_cartons', message: 'Must be a non-negative number', severity: 'error' });
  }

  const year = Number(data.season_year);
  if (data.season_year && (isNaN(year) || year < 2000 || year > 2100)) {
    errors.push({ field: 'season_year', message: 'Year must be between 2000 and 2100', severity: 'error' });
  }

  const week = Number(data.sailing_week);
  if (data.sailing_week && (isNaN(week) || week < 1 || week > 53)) {
    errors.push({ field: 'sailing_week', message: 'Week must be between 1 and 53', severity: 'error' });
  }

  for (const numField of ['advance_per_carton', 'total_advance', 'nett_per_carton', 'total_nett']) {
    if (data[numField] && isNaN(Number(data[numField]))) {
      errors.push({ field: numField, message: 'Must be a valid number', severity: 'error' });
    }
  }

  if (data.advance_per_carton && data.num_cartons && data.total_advance) {
    const expected = Number(data.advance_per_carton) * Number(data.num_cartons);
    const actual = Number(data.total_advance);
    if (Math.abs(expected - actual) > 1) {
      errors.push({ field: 'total_advance', message: `Expected ${expected.toFixed(2)} (adv x ctns)`, severity: 'warning' });
    }
  }

  return errors;
}

export async function runCommercialBatchValidation(batchId: string): Promise<{ passed: number; failed: number }> {
  await supabase.from('import_batches').update({ status: 'validating' }).eq('id', batchId);

  const { data: rows } = await supabase
    .from('staging_commercial_rows')
    .select('id, mapped_data, raw_data')
    .eq('import_batch_id', batchId);

  if (!rows || rows.length === 0) return { passed: 0, failed: 0 };

  let passed = 0;
  let failed = 0;
  const seen = new Set<string>();

  for (const row of rows) {
    const data = (row.mapped_data ?? row.raw_data) as Record<string, string>;
    const errors = validateCommercialRow(data);

    const dupeKey = `${data.consignment_number}|${data.barcode}|${data.commodity}`;
    if (seen.has(dupeKey)) {
      errors.push({ field: 'consignment_number', message: 'Duplicate consignment/barcode/commodity', severity: 'warning' });
    }
    seen.add(dupeKey);

    const status = errors.some(e => e.severity === 'error') ? 'failed' : errors.length > 0 ? 'needs_review' : 'passed';
    if (status === 'failed') failed++;
    else passed++;

    await supabase.from('staging_commercial_rows').update({
      validation_status: status,
      validation_errors: errors.length > 0 ? errors : null,
    }).eq('id', row.id);
  }

  const batchStatus = failed > 0 ? 'needs_review' : 'validation_passed';
  await supabase.from('import_batches').update({
    status: batchStatus,
    processed_rows: rows.length,
    error_rows: failed,
  }).eq('id', batchId);

  return { passed, failed };
}

export async function publishCommercialBatch(batchId: string): Promise<{ published: number }> {
  const { data: rows } = await supabase
    .from('staging_commercial_rows')
    .select('*')
    .eq('import_batch_id', batchId)
    .in('validation_status', ['passed', 'needs_review']);

  if (!rows || rows.length === 0) return { published: 0 };

  const { data: batch } = await supabase
    .from('import_batches')
    .select('source_document_id')
    .eq('id', batchId)
    .maybeSingle();

  let published = 0;

  for (const row of rows) {
    const d = (row.mapped_data ?? row.raw_data) as Record<string, string>;

    const { data: marketRow } = await supabase
      .from('markets')
      .upsert({ name: d.market, code: d.market.toUpperCase().replace(/\s+/g, '_') }, { onConflict: 'name' })
      .select('id')
      .maybeSingle();

    const { data: vendorRow } = await supabase
      .from('vendors')
      .upsert({ name: d.vendor_name, code: d.vendor_name.toUpperCase().replace(/\s+/g, '_'), market_id: marketRow?.id }, { onConflict: 'code' })
      .select('id')
      .maybeSingle();

    let growerId: string | null = null;
    if (d.puc) {
      const { data: growerRow } = await supabase
        .from('growers')
        .upsert({ puc_code: d.puc, name: d.puc }, { onConflict: 'puc_code' })
        .select('id')
        .maybeSingle();
      growerId = growerRow?.id ?? null;
    }

    const { data: shipmentRow } = await supabase
      .from('shipments')
      .upsert({
        vessel: d.vessel || '',
        container_number: d.container_number || '',
        sailing_week: Number(d.sailing_week) || 0,
        sailing_year: Number(d.season_year) || 0,
        market_id: marketRow?.id,
        vendor_id: vendorRow?.id,
        source_document_id: batch?.source_document_id,
        import_batch_id: batchId,
      }, { onConflict: 'container_number,sailing_year,sailing_week' })
      .select('id')
      .maybeSingle();

    const { data: consRow } = await supabase
      .from('consignments')
      .insert({
        consignment_number: d.consignment_number,
        shipment_id: shipmentRow?.id,
        grower_id: growerId,
        puc: d.puc,
        commodity: d.commodity,
        variety: d.variety,
        pack: d.pack || '',
        barcode: d.barcode || '',
        num_cartons: Number(d.num_cartons) || 0,
        advance_per_carton: Number(d.advance_per_carton) || 0,
        total_advance: Number(d.total_advance) || 0,
        nett_per_carton: Number(d.nett_per_carton) || 0,
        total_nett: Number(d.total_nett) || 0,
        source_document_id: batch?.source_document_id,
        import_batch_id: batchId,
      })
      .select('id')
      .maybeSingle();

    await supabase.from('commercial_records').insert({
      consignment_id: consRow?.id,
      season_year: Number(d.season_year) || 0,
      sailing_week: Number(d.sailing_week) || 0,
      market: d.market,
      vendor_name: d.vendor_name,
      vessel: d.vessel || '',
      container_number: d.container_number || '',
      consignment_number: d.consignment_number,
      puc: d.puc,
      commodity: d.commodity,
      variety: d.variety,
      pack: d.pack || '',
      barcode: d.barcode || '',
      num_cartons: Number(d.num_cartons) || 0,
      advance_per_carton: Number(d.advance_per_carton) || 0,
      total_advance: Number(d.total_advance) || 0,
      nett_per_carton: Number(d.nett_per_carton) || 0,
      total_nett: Number(d.total_nett) || 0,
      grower_id: growerId,
      source_document_id: batch?.source_document_id,
      import_batch_id: batchId,
    });

    await supabase.from('staging_commercial_rows').update({
      validation_status: 'published',
      target_consignment_id: consRow?.id,
      target_shipment_id: shipmentRow?.id,
      target_grower_id: growerId,
    }).eq('id', row.id);

    published++;
  }

  await supabase.from('import_batches').update({ status: 'published' }).eq('id', batchId);
  return { published };
}
