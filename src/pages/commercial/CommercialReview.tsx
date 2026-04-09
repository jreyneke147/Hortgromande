import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Play,
  Rocket,
  Columns3,
  ChevronDown,
  ChevronUp,
  FileText,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { runCommercialBatchValidation, publishCommercialBatch } from '../../lib/commercial';
import type { StagingCommercialRow, CommercialImportLog, ImportBatch } from '../../types/commercial';
import { VALIDATION_STATUS_LABELS } from '../../types/commercial';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import StatusBadge from '../../components/ui/StatusBadge';
import Modal from '../../components/ui/Modal';
import CommercialFieldMapping from './CommercialFieldMapping';

export default function CommercialReview() {
  const { id: batchId } = useParams<{ id: string }>();
  const [batch, setBatch] = useState<ImportBatch | null>(null);
  const [rows, setRows] = useState<StagingCommercialRow[]>([]);
  const [logs, setLogs] = useState<CommercialImportLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRow, setSelectedRow] = useState<StagingCommercialRow | null>(null);
  const [showMapping, setShowMapping] = useState(false);
  const [sourceColumns, setSourceColumns] = useState<string[]>([]);
  const [showLogs, setShowLogs] = useState(false);
  const [processing, setProcessing] = useState(false);

  const load = useCallback(async () => {
    if (!batchId) return;
    const [bRes, rRes, lRes] = await Promise.all([
      supabase.from('import_batches').select('id, batch_name, status, total_rows, processed_rows, error_rows, created_by, created_at, updated_at, source_documents(file_name, file_type), source_document_id').eq('id', batchId).maybeSingle(),
      supabase.from('staging_commercial_rows').select('*').eq('import_batch_id', batchId).order('source_row_number'),
      supabase.from('commercial_import_logs').select('*').eq('import_batch_id', batchId).order('created_at', { ascending: false }).limit(100),
    ]);
    setBatch(bRes.data as unknown as ImportBatch | null);
    const stagingRows = (rRes.data ?? []) as unknown as StagingCommercialRow[];
    setRows(stagingRows);
    setLogs((lRes.data ?? []) as unknown as CommercialImportLog[]);

    if (stagingRows.length > 0 && stagingRows[0].raw_data) {
      setSourceColumns(Object.keys(stagingRows[0].raw_data));
    }
    setLoading(false);
  }, [batchId]);

  useEffect(() => { load(); }, [load]);

  const counts = {
    total: rows.length,
    passed: rows.filter(r => r.validation_status === 'passed').length,
    failed: rows.filter(r => r.validation_status === 'failed').length,
    needs_review: rows.filter(r => r.validation_status === 'needs_review').length,
    pending: rows.filter(r => r.validation_status === 'pending').length,
    published: rows.filter(r => r.validation_status === 'published').length,
  };

  const filteredRows = statusFilter === 'all' ? rows : rows.filter(r => r.validation_status === statusFilter);

  async function handleValidate() {
    setProcessing(true);
    try {
      await runCommercialBatchValidation(batchId!);
      await load();
    } finally {
      setProcessing(false);
    }
  }

  async function handlePublish() {
    if (!confirm('Publish validated rows to live commercial records?')) return;
    setProcessing(true);
    try {
      const result = await publishCommercialBatch(batchId!);
      alert(`Published ${result.published} records successfully.`);
      await load();
    } finally {
      setProcessing(false);
    }
  }

  if (loading) return <LoadingSpinner />;
  if (!batch) return <div className="p-8 text-center text-gray-500">Batch not found</div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link to="/commercial/imports" className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">{batch.batch_name}</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {batch.source_documents?.file_name ?? 'Unknown file'} &middot; {counts.total} staging rows
          </p>
        </div>
        <div className="flex items-center gap-2">
          {sourceColumns.length > 0 && batch.status === 'imported' && (
            <button onClick={() => setShowMapping(true)} className="btn-secondary text-sm flex items-center gap-1.5">
              <Columns3 size={14} /> Map Fields
            </button>
          )}
          {['mapped', 'imported', 'needs_review'].includes(batch.status) && (
            <button onClick={handleValidate} disabled={processing} className="btn-secondary text-sm flex items-center gap-1.5 disabled:opacity-50">
              <Play size={14} /> {processing ? 'Validating...' : 'Run Validation'}
            </button>
          )}
          {['validation_passed', 'needs_review'].includes(batch.status) && (
            <button onClick={handlePublish} disabled={processing} className="btn-primary text-sm flex items-center gap-1.5 disabled:opacity-50">
              <Rocket size={14} /> {processing ? 'Publishing...' : 'Publish to Live'}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Total', value: counts.total, color: 'bg-gray-50 text-gray-700' },
          { label: 'Passed', value: counts.passed, color: 'bg-emerald-50 text-emerald-700' },
          { label: 'Failed', value: counts.failed, color: 'bg-red-50 text-red-700' },
          { label: 'Needs Review', value: counts.needs_review, color: 'bg-amber-50 text-amber-700' },
          { label: 'Pending', value: counts.pending, color: 'bg-blue-50 text-blue-700' },
          { label: 'Published', value: counts.published, color: 'bg-teal-50 text-teal-700' },
        ].map(c => (
          <div key={c.label} className={`rounded-xl p-3 text-center ${c.color}`}>
            <p className="text-xl font-bold">{c.value}</p>
            <p className="text-[11px] mt-0.5">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {['all', 'pending', 'passed', 'failed', 'needs_review', 'published'].map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
              statusFilter === s ? 'bg-brand-50 border-brand-300 text-brand-700' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
            }`}
          >
            {s === 'all' ? 'All' : VALIDATION_STATUS_LABELS[s] ?? s}
          </button>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/50">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-2.5">Row</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-2.5">Consignment</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-2.5">Commodity</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-2.5">Market</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-2.5">Vendor</th>
                <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-2.5">Cartons</th>
                <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-2.5">Nett</th>
                <th className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-2.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredRows.map(row => {
                const d = (row.mapped_data ?? row.raw_data) as Record<string, string>;
                return (
                  <tr
                    key={row.id}
                    onClick={() => setSelectedRow(row)}
                    className="hover:bg-gray-50/50 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-2.5 text-xs text-gray-500 tabular-nums">{row.source_row_number}</td>
                    <td className="px-4 py-2.5 text-sm font-medium text-gray-900">{d.consignment_number || '-'}</td>
                    <td className="px-4 py-2.5 text-sm text-gray-700">{d.commodity || '-'} {d.variety ? `/ ${d.variety}` : ''}</td>
                    <td className="px-4 py-2.5 text-sm text-gray-700">{d.market || '-'}</td>
                    <td className="px-4 py-2.5 text-sm text-gray-700">{d.vendor_name || '-'}</td>
                    <td className="px-4 py-2.5 text-sm text-gray-900 text-right tabular-nums">{d.num_cartons || '-'}</td>
                    <td className="px-4 py-2.5 text-sm text-gray-900 text-right tabular-nums">{d.total_nett ? Number(d.total_nett).toFixed(2) : '-'}</td>
                    <td className="px-4 py-2.5 text-center">
                      <StatusBadge status={VALIDATION_STATUS_LABELS[row.validation_status] ?? row.validation_status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {logs.length > 0 && (
        <div className="card">
          <button
            onClick={() => setShowLogs(!showLogs)}
            className="w-full px-5 py-3 flex items-center justify-between hover:bg-gray-50/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <FileText size={14} className="text-gray-400" />
              <span className="text-sm font-semibold text-gray-900">Import Logs ({logs.length})</span>
            </div>
            {showLogs ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
          </button>
          {showLogs && (
            <div className="border-t border-gray-200 divide-y divide-gray-100 max-h-60 overflow-y-auto">
              {logs.map(log => (
                <div key={log.id} className="px-5 py-2 flex items-start gap-3">
                  {log.log_level === 'error' ? <XCircle size={13} className="text-red-500 mt-0.5" /> :
                    log.log_level === 'warning' ? <AlertTriangle size={13} className="text-amber-500 mt-0.5" /> :
                      <CheckCircle2 size={13} className="text-gray-400 mt-0.5" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-700">{log.message}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{new Date(log.created_at).toLocaleString('en-ZA')}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <Modal open={!!selectedRow} onClose={() => setSelectedRow(null)} title={`Row ${selectedRow?.source_row_number ?? ''} Detail`}>
        {selectedRow && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <StatusBadge status={VALIDATION_STATUS_LABELS[selectedRow.validation_status] ?? selectedRow.validation_status} />
            </div>
            {selectedRow.validation_errors && selectedRow.validation_errors.length > 0 && (
              <div className="bg-red-50 rounded-lg p-3 space-y-1.5">
                <p className="text-xs font-semibold text-red-800">Validation Errors</p>
                {selectedRow.validation_errors.map((e, i) => (
                  <p key={i} className={`text-xs ${e.severity === 'error' ? 'text-red-700' : 'text-amber-700'}`}>
                    <span className="font-medium">{e.field}:</span> {e.message}
                  </p>
                ))}
              </div>
            )}
            <div>
              <p className="text-xs font-semibold text-gray-700 mb-2">Mapped Data</p>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries((selectedRow.mapped_data ?? selectedRow.raw_data) as Record<string, string>).map(([k, v]) => (
                  <div key={k}>
                    <p className="text-[10px] text-gray-400">{k}</p>
                    <p className="text-xs text-gray-900">{v || '-'}</p>
                  </div>
                ))}
              </div>
            </div>
            {selectedRow.mapped_data && (
              <div>
                <p className="text-xs font-semibold text-gray-700 mb-2">Raw Data</p>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(selectedRow.raw_data).map(([k, v]) => (
                    <div key={k}>
                      <p className="text-[10px] text-gray-400">{k}</p>
                      <p className="text-xs text-gray-900">{v || '-'}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      <CommercialFieldMapping
        batchId={batchId!}
        sourceColumns={sourceColumns}
        open={showMapping}
        onClose={() => setShowMapping(false)}
        onApplied={load}
      />
    </div>
  );
}
