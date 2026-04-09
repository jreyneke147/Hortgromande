import { useEffect, useState } from 'react';
import {
  FileText,
  FileSpreadsheet,
  Search,
  Upload,
  Tag,
  Calendar,
  FolderOpen,
  Download,
  X,
  Loader2,
  File,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { DocumentRecord } from '../types';
import Modal from '../components/ui/Modal';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

function getFileIcon(fileType: string) {
  if (fileType.includes('spreadsheet') || fileType.includes('csv') || fileType.includes('excel')) return FileSpreadsheet;
  if (fileType.includes('pdf')) return FileText;
  return File;
}

export default function Documents() {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [programmeFilter, setProgrammeFilter] = useState('');
  const [programmes, setProgrammes] = useState<{ id: string; name: string }[]>([]);
  const [uploadModal, setUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newDoc, setNewDoc] = useState({ name: '', description: '', programme_id: '', tags: '' });

  useEffect(() => {
    async function load() {
      const [dRes, pRes, tRes] = await Promise.all([
        supabase.from('documents').select('*, programmes(name), document_tags(id, tag)').eq('is_deleted', false).order('created_at', { ascending: false }),
        supabase.from('programmes').select('id, name').eq('is_deleted', false).order('name'),
        supabase.from('document_tags').select('tag'),
      ]);
      setDocuments((dRes.data ?? []) as unknown as DocumentRecord[]);
      setProgrammes(pRes.data ?? []);
      const tags = [...new Set((tRes.data ?? []).map(t => t.tag))].sort();
      setAllTags(tags);
      setLoading(false);
    }
    load();
  }, []);

  async function handleUpload() {
    setUploading(true);
    const { data: inserted } = await supabase.from('documents').insert({
      name: newDoc.name,
      description: newDoc.description,
      programme_id: newDoc.programme_id || null,
      entity_type: 'programme',
      entity_id: newDoc.programme_id || '00000000-0000-0000-0000-000000000000',
      file_path: `/docs/${newDoc.name.toLowerCase().replace(/\s+/g, '-')}.pdf`,
      file_type: 'application/pdf',
      file_size: 0,
    }).select('id').maybeSingle();

    if (inserted && newDoc.tags) {
      const tags = newDoc.tags.split(',').map(t => t.trim()).filter(Boolean);
      if (tags.length > 0) {
        await supabase.from('document_tags').insert(tags.map(tag => ({ document_id: inserted.id, tag })));
      }
    }

    const { data: updated } = await supabase.from('documents').select('*, programmes(name), document_tags(id, tag)').eq('is_deleted', false).order('created_at', { ascending: false });
    setDocuments((updated ?? []) as unknown as DocumentRecord[]);
    setUploading(false);
    setUploadModal(false);
    setNewDoc({ name: '', description: '', programme_id: '', tags: '' });
  }

  const filtered = documents.filter(d => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) || d.description?.toLowerCase().includes(search.toLowerCase());
    const matchTag = !tagFilter || (d.document_tags ?? []).some(t => t.tag === tagFilter);
    const matchProg = !programmeFilter || d.programme_id === programmeFilter;
    return matchSearch && matchTag && matchProg;
  });

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Document Repository</h1>
          <p className="text-sm text-gray-500 mt-1">{documents.length} documents across {allTags.length} tags</p>
        </div>
        <button onClick={() => setUploadModal(true)} className="btn-primary"><Upload size={16} /> Upload Document</button>
      </div>

      <div className="card">
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search documents..." className="input-field pl-9" />
          </div>
          <select value={programmeFilter} onChange={e => setProgrammeFilter(e.target.value)} className="input-field w-auto">
            <option value="">All programmes</option>
            {programmes.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <select value={tagFilter} onChange={e => setTagFilter(e.target.value)} className="input-field w-auto">
            <option value="">All tags</option>
            {allTags.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        {tagFilter && (
          <div className="px-4 py-2 border-b border-gray-100 flex items-center gap-2">
            <Tag size={12} className="text-gray-400" />
            <span className="text-xs text-gray-500">Filtered by:</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 text-brand-700 px-2 py-0.5 text-xs font-medium">
              {tagFilter}
              <button onClick={() => setTagFilter('')} className="hover:text-brand-900"><X size={10} /></button>
            </span>
          </div>
        )}

        {filtered.length === 0 ? (
          <EmptyState icon={<FolderOpen size={48} />} title="No documents found" description={search || tagFilter ? 'Try adjusting your search or filters' : 'Upload your first document to get started'}
            action={!search && !tagFilter ? <button onClick={() => setUploadModal(true)} className="btn-primary"><Upload size={16} /> Upload</button> : undefined} />
        ) : (
          <div className="divide-y divide-gray-100">
            {filtered.map(doc => {
              const Icon = getFileIcon(doc.file_type);
              const tags = doc.document_tags ?? [];
              return (
                <div key={doc.id} className="flex items-start gap-3 px-4 py-3.5 hover:bg-gray-50/50 transition-colors">
                  <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 text-gray-500">
                    <Icon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                    {doc.description && <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{doc.description}</p>}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
                      {doc.programmes?.name && (
                        <span className="text-[11px] text-gray-400">{doc.programmes.name}</span>
                      )}
                      <span className="text-[11px] text-gray-400 flex items-center gap-1">
                        <Calendar size={10} />
                        {new Date(doc.created_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      <span className="text-[11px] text-gray-400">{formatFileSize(doc.file_size)}</span>
                    </div>
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {tags.map(t => (
                          <button key={t.id} onClick={() => setTagFilter(t.tag)}
                            className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600 hover:bg-gray-200 transition-colors">
                            {t.tag}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <button className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors flex-shrink-0">
                    <Download size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Modal open={uploadModal} onClose={() => setUploadModal(false)} title="Upload Document" size="md">
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center">
            <Upload size={28} className="mx-auto mb-2 text-gray-300" />
            <p className="text-sm text-gray-500">Drag and drop or click to select</p>
            <p className="text-xs text-gray-400 mt-1">PDF, Excel, CSV, Word up to 10MB</p>
          </div>
          <div>
            <label className="label-text">Document Name</label>
            <input type="text" value={newDoc.name} onChange={e => setNewDoc(prev => ({ ...prev, name: e.target.value }))} className="input-field" placeholder="e.g. Q1 2026 Progress Report" />
          </div>
          <div>
            <label className="label-text">Description</label>
            <textarea value={newDoc.description} onChange={e => setNewDoc(prev => ({ ...prev, description: e.target.value }))} rows={2} className="input-field resize-none" placeholder="Brief description..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-text">Programme</label>
              <select value={newDoc.programme_id} onChange={e => setNewDoc(prev => ({ ...prev, programme_id: e.target.value }))} className="input-field">
                <option value="">Select...</option>
                {programmes.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label-text">Tags (comma-separated)</label>
              <input type="text" value={newDoc.tags} onChange={e => setNewDoc(prev => ({ ...prev, tags: e.target.value }))} className="input-field" placeholder="report, quarterly" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t border-gray-200">
            <button onClick={() => setUploadModal(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleUpload} disabled={uploading || !newDoc.name} className="btn-primary">
              {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
              Upload
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
