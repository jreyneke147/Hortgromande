import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Send,
  Plus,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { uploadCommercialWorkbook } from '../../lib/commercial';
import type { ImportBatch } from '../../types/commercial';
import { IMPORT_STATUS_LABELS } from '../../types/commercial';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import StatusBadge from '../../components/ui/StatusBadge';
import Modal from '../../components/ui/Modal';

export default function CommercialImports() {
  const [batches, setBatches] = useState<ImportBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [batchName, setBatchName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [savedMappings, setSavedMappings] = useState<{ id: string; mapping_name: string }[]>([]);
  const [selectedMapping, setSelectedMapping] = useState('');

  async function loadBatches() {
    const { data } = await supabase
      .from('import_batches')
      .select('id, batch_name, status, total_rows, processed_rows, error_rows, created_by, created_at, updated_at, source_documents(file_name, file_type), source_document_id')
      .order('created_at', { ascending: false })
      .limit(50);
    setBatches((data ?? []) as unknown as ImportBatch[]);
    setLoading(false);
  }

  useEffect(() => {
    loadBatches();
    supabase
      .from('source_field_mappings')
      .select('id, mapping_name')
      .eq('entity_type', 'commercial')
      .eq('is_deleted', false)
      .then(({ data }) => setSavedMappings(data ?? []));
  }, []);

  async function handleUpload() {
    if (!file || !batchName.trim()) return;
    setUploading(true);
    try {
      await uploadCommercialWorkbook(file, batchName, undefined, selectedMapping || undefined);
      setShowUpload(false);
      setBatchName('');
      setFile(null);
      setSelectedMapping('');
      await loadBatches();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  function statusIcon(status: string) {
    switch (status) {
      case 'published': return <CheckCircle2 size={14} className="text-teal-600" />;
      case 'validation_passed': return <CheckCircle2 size={14} className="text-emerald-600" />;
      case 'needs_review':
      case 'validation_failed': return <AlertTriangle size={14} className="text-amber-600" />;
      case 'mapped':
      case 'validating': return <Clock size={14} className="text-sky-600" />;
      default: return <FileSpreadsheet size={14} className="text-gray-400" />;
    }
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Commercial Imports</h1>
          <p className="text-sm text-gray-500 mt-1">Upload and manage commercial export workbooks</p>
        </div>
        <button onClick={() => setShowUpload(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Import Workbook
        </button>
      </div>

      {batches.length === 0 ? (
        <EmptyState
          icon={<Upload size={40} />}
          title="No imports yet"
          description="Upload a commercial export workbook (CSV, TSV, XLSX) to begin the import process."
          action={
            <button onClick={() => setShowUpload(true)} className="btn-primary text-sm">
              Upload First Workbook
            </button>
          }
        />
      ) : (
        <div className="card">
          <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Send size={15} className="text-gray-400" />
              <h3 className="text-sm font-semibold text-gray-900">Import Batches</h3>
            </div>
            <span className="text-xs text-gray-400">{batches.length} batches</span>
          </div>
          <div className="divide-y divide-gray-100">
            {batches.map(b => (
              <Link
                key={b.id}
                to={`/commercial/imports/${b.id}`}
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50/50 transition-colors"
              >
                <div className="flex-shrink-0">{statusIcon(b.status)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{b.batch_name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {b.source_documents?.file_name ?? 'Unknown file'} &middot; {b.total_rows} rows
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <StatusBadge status={IMPORT_STATUS_LABELS[b.status] ?? b.status} />
                  <p className="text-[11px] text-gray-400 mt-1">
                    {new Date(b.created_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <Modal open={showUpload} onClose={() => setShowUpload(false)} title="Import Commercial Workbook">
        <div className="space-y-4">
          <div>
            <label className="label-text">Batch Name</label>
            <input
              type="text"
              value={batchName}
              onChange={e => setBatchName(e.target.value)}
              className="input-field"
              placeholder="e.g. Week 12 Exports 2025"
            />
          </div>
          <div>
            <label className="label-text">File</label>
            <input
              type="file"
              accept=".csv,.tsv,.xlsx,.xls"
              onChange={e => setFile(e.target.files?.[0] ?? null)}
              className="input-field text-sm file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-brand-50 file:text-brand-700"
            />
            <p className="text-xs text-gray-400 mt-1">CSV, TSV, or Excel format</p>
          </div>
          {savedMappings.length > 0 && (
            <div>
              <label className="label-text">Apply Saved Mapping (optional)</label>
              <select
                value={selectedMapping}
                onChange={e => setSelectedMapping(e.target.value)}
                className="input-field"
              >
                <option value="">None - map manually after upload</option>
                {savedMappings.map(m => (
                  <option key={m.id} value={m.id}>{m.mapping_name}</option>
                ))}
              </select>
            </div>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowUpload(false)} className="btn-secondary text-sm">Cancel</button>
            <button
              onClick={handleUpload}
              disabled={uploading || !file || !batchName.trim()}
              className="btn-primary text-sm flex items-center gap-2 disabled:opacity-50"
            >
              {uploading ? <LoadingSpinner /> : <Upload size={15} />}
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
