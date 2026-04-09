import { useEffect, useState } from 'react';
import {
  Shield,
  FileText,
  Lock,
  History,
  Search,
  Download,
  Plus,
  Eye,
  BookOpen,
  FileCheck,
  AlertCircle,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Modal from '../components/ui/Modal';

type TabKey = 'documents' | 'audit' | 'permissions';

interface GovDoc {
  id: string;
  title: string;
  description: string;
  document_type: string;
  category: string;
  file_size: number;
  version: string;
  status: string;
  effective_date: string | null;
  review_date: string | null;
}

interface AuditRow {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  old_values: Record<string, unknown>;
  new_values: Record<string, unknown>;
  ip_address: string;
  created_at: string;
}

interface PermRow {
  id: string;
  name: string;
  description: string;
  resource_type: string;
  access_level: string;
  is_active: boolean;
  roles?: { name: string; display_name: string };
}

const DOC_TYPE_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  sop: { label: 'SOP', color: 'text-blue-700', bg: 'bg-blue-50' },
  policy: { label: 'Policy', color: 'text-emerald-700', bg: 'bg-emerald-50' },
  framework: { label: 'Framework', color: 'text-teal-700', bg: 'bg-teal-50' },
  guideline: { label: 'Guideline', color: 'text-amber-700', bg: 'bg-amber-50' },
  template: { label: 'Template', color: 'text-gray-700', bg: 'bg-gray-50' },
};

const DOC_STATUS_COLORS: Record<string, string> = {
  active: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  draft: 'bg-gray-50 text-gray-600 ring-gray-500/20',
  archived: 'bg-red-50 text-red-700 ring-red-600/20',
  under_review: 'bg-amber-50 text-amber-700 ring-amber-600/20',
};

const ACCESS_COLORS: Record<string, string> = {
  admin: 'bg-red-50 text-red-700',
  write: 'bg-amber-50 text-amber-700',
  read: 'bg-emerald-50 text-emerald-700',
  none: 'bg-gray-50 text-gray-500',
};

function formatSize(bytes: number): string {
  if (bytes >= 1000000) return `${(bytes / 1000000).toFixed(1)} MB`;
  if (bytes >= 1000) return `${(bytes / 1000).toFixed(0)} KB`;
  return `${bytes} B`;
}

export default function Governance() {
  const [tab, setTab] = useState<TabKey>('documents');
  const [loading, setLoading] = useState(true);
  const [docs, setDocs] = useState<GovDoc[]>([]);
  const [audits, setAudits] = useState<AuditRow[]>([]);
  const [perms, setPerms] = useState<PermRow[]>([]);
  const [docSearch, setDocSearch] = useState('');
  const [docTypeFilter, setDocTypeFilter] = useState('');
  const [auditSearch, setAuditSearch] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<GovDoc | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      if (tab === 'documents') {
        const { data } = await supabase
          .from('governance_documents')
          .select('id, title, description, document_type, category, file_size, version, status, effective_date, review_date')
          .eq('is_deleted', false)
          .order('title');
        setDocs((data ?? []) as GovDoc[]);
      } else if (tab === 'audit') {
        const { data } = await supabase
          .from('audit_logs')
          .select('id, action, entity_type, entity_id, old_values, new_values, ip_address, created_at')
          .order('created_at', { ascending: false })
          .limit(100);
        setAudits((data ?? []) as AuditRow[]);
      } else {
        const { data } = await supabase
          .from('permission_policies')
          .select('id, name, description, resource_type, access_level, is_active, roles(name, display_name)')
          .order('name');
        setPerms((data ?? []) as unknown as PermRow[]);
      }
      setLoading(false);
    }
    load();
  }, [tab]);

  const filteredDocs = docs.filter(d => {
    if (docSearch && !d.title.toLowerCase().includes(docSearch.toLowerCase())) return false;
    if (docTypeFilter && d.document_type !== docTypeFilter) return false;
    return true;
  });

  const filteredAudits = audits.filter(a => {
    if (!auditSearch) return true;
    return a.action.toLowerCase().includes(auditSearch.toLowerCase()) || a.entity_type.toLowerCase().includes(auditSearch.toLowerCase());
  });

  const tabs: { key: TabKey; label: string; icon: typeof Shield }[] = [
    { key: 'documents', label: 'SOPs & Policies', icon: FileText },
    { key: 'audit', label: 'Audit Log', icon: History },
    { key: 'permissions', label: 'Access Matrix', icon: Lock },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Governance & Compliance</h1>
          <p className="text-sm text-gray-500 mt-1">Policies, audit trails, and access controls</p>
        </div>
      </div>

      <div className="flex items-center gap-1 border-b border-gray-200">
        {tabs.map(t => {
          const TIcon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
                tab === t.key ? 'border-brand-600 text-brand-700' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <TIcon size={15} />
              {t.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : tab === 'documents' ? (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search documents..."
                value={docSearch}
                onChange={e => setDocSearch(e.target.value)}
                className="input-field pl-9 py-2 text-sm w-full"
              />
            </div>
            <select value={docTypeFilter} onChange={e => setDocTypeFilter(e.target.value)} className="input-field py-2 text-xs w-auto">
              <option value="">All types</option>
              {Object.entries(DOC_TYPE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
            <button onClick={() => setShowUpload(true)} className="btn-primary flex items-center gap-1.5 text-sm">
              <Plus size={15} /> Upload
            </button>
          </div>

          <div className="card divide-y divide-gray-100">
            {filteredDocs.length === 0 ? (
              <div className="p-12 text-center">
                <BookOpen size={28} className="mx-auto text-gray-300 mb-2" />
                <p className="text-sm text-gray-400">No documents found</p>
              </div>
            ) : (
              filteredDocs.map(doc => {
                const typeInfo = DOC_TYPE_LABELS[doc.document_type] ?? DOC_TYPE_LABELS.template;
                const statusClass = DOC_STATUS_COLORS[doc.status] ?? DOC_STATUS_COLORS.draft;
                return (
                  <div key={doc.id} className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50/50 transition-colors">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${typeInfo.bg}`}>
                      <FileText size={18} className={typeInfo.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{doc.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{doc.description}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-medium ${typeInfo.bg} ${typeInfo.color}`}>
                            {typeInfo.label}
                          </span>
                          <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-medium ring-1 ring-inset ${statusClass}`}>
                            {doc.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mt-1.5 text-[11px] text-gray-400">
                        <span>v{doc.version}</span>
                        <span>{formatSize(doc.file_size)}</span>
                        <span className="capitalize">{doc.category.replace('_', ' ')}</span>
                        {doc.effective_date && <span>Effective: {new Date(doc.effective_date).toLocaleDateString('en-ZA')}</span>}
                        {doc.review_date && (
                          <span className={new Date(doc.review_date) < new Date() ? 'text-red-500 font-medium' : ''}>
                            Review: {new Date(doc.review_date).toLocaleDateString('en-ZA')}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedDoc(doc)}
                      className="p-1.5 rounded-lg text-gray-300 hover:text-gray-600 hover:bg-gray-100 transition-colors flex-shrink-0"
                    >
                      <Eye size={15} />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          <div className="card p-5 border-l-4 border-l-amber-400">
            <div className="flex items-start gap-3">
              <AlertCircle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">POPIA Compliance Notice</p>
                <p className="text-xs text-gray-500 mt-1">
                  All personal information processed through this platform is subject to the Protection of Personal Information Act (POPIA).
                  Data access is restricted based on user roles and entity boundaries. Audit logs track all data interactions for compliance purposes.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : tab === 'audit' ? (
        <div className="space-y-4">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search audit log..."
              value={auditSearch}
              onChange={e => setAuditSearch(e.target.value)}
              className="input-field pl-9 py-2 text-sm"
            />
          </div>
          <div className="card">
            {filteredAudits.length === 0 ? (
              <div className="p-12 text-center">
                <History size={28} className="mx-auto text-gray-300 mb-2" />
                <p className="text-sm text-gray-400">No audit entries found</p>
                <p className="text-xs text-gray-400 mt-1">Activity will be logged here as users interact with the platform</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredAudits.map(a => (
                  <div key={a.id} className="flex items-start gap-3 px-4 py-2.5 hover:bg-gray-50/50 transition-colors">
                    <div className="w-2 h-2 rounded-full bg-brand-400 mt-1.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">
                        <span className="font-medium capitalize">{a.action}</span>
                        {' '}on{' '}
                        <span className="font-medium">{a.entity_type}</span>
                        {a.entity_id && <span className="text-gray-500"> ({a.entity_id.slice(0, 8)}...)</span>}
                      </p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {new Date(a.created_at).toLocaleString('en-ZA')}
                        {a.ip_address && ` - ${a.ip_address}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="card">
            <div className="px-4 py-3 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900">Role Access Matrix</h3>
              <p className="text-xs text-gray-500 mt-0.5">Data access policies per role and resource type</p>
            </div>
            {perms.length === 0 ? (
              <div className="p-12 text-center">
                <Lock size={28} className="mx-auto text-gray-300 mb-2" />
                <p className="text-sm text-gray-400">No permission policies configured</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-2.5">Policy</th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-2.5">Role</th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-2.5">Resource</th>
                      <th className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-2.5">Access</th>
                      <th className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {perms.map(p => {
                      const accessClass = ACCESS_COLORS[p.access_level] ?? ACCESS_COLORS.read;
                      return (
                        <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-4 py-2.5">
                            <p className="text-sm font-medium text-gray-900">{p.name}</p>
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{p.description}</p>
                          </td>
                          <td className="px-4 py-2.5">
                            <span className="text-sm text-gray-700">
                              {(p.roles as { display_name: string } | undefined)?.display_name ?? '-'}
                            </span>
                          </td>
                          <td className="px-4 py-2.5">
                            <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-0.5 text-xs font-medium text-gray-600 capitalize">
                              {p.resource_type}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-center">
                            <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-medium capitalize ${accessClass}`}>
                              {p.access_level}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-center">
                            <span className={`inline-flex items-center rounded-full w-2 h-2 ${p.is_active ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      <Modal open={showUpload} onClose={() => setShowUpload(false)} title="Upload Governance Document">
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const form = e.target as HTMLFormElement;
            const fd = new FormData(form);
            await supabase.from('governance_documents').insert({
              title: fd.get('title') as string,
              description: fd.get('description') as string,
              document_type: fd.get('document_type') as string,
              category: fd.get('category') as string,
              version: fd.get('version') as string || '1.0',
              status: 'draft',
              file_size: 0,
            });
            setShowUpload(false);
            setTab('documents');
            const { data } = await supabase.from('governance_documents').select('*').eq('is_deleted', false).order('title');
            setDocs((data ?? []) as GovDoc[]);
          }}
          className="space-y-4"
        >
          <div>
            <label className="label-text">Title</label>
            <input name="title" required className="input-field" />
          </div>
          <div>
            <label className="label-text">Description</label>
            <textarea name="description" rows={3} className="input-field" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-text">Document Type</label>
              <select name="document_type" className="input-field">
                <option value="policy">Policy</option>
                <option value="sop">SOP</option>
                <option value="framework">Framework</option>
                <option value="guideline">Guideline</option>
                <option value="template">Template</option>
              </select>
            </div>
            <div>
              <label className="label-text">Category</label>
              <select name="category" className="input-field">
                <option value="governance">Governance</option>
                <option value="compliance">Compliance</option>
                <option value="data_management">Data Management</option>
                <option value="reporting">Reporting</option>
                <option value="operations">Operations</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label-text">Version</label>
            <input name="version" defaultValue="1.0" className="input-field" />
          </div>
          <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
            <FileCheck size={24} className="mx-auto text-gray-300 mb-2" />
            <p className="text-sm text-gray-500">Drag & drop file here or click to browse</p>
            <p className="text-xs text-gray-400 mt-1">PDF, DOCX, XLSX (max 25 MB)</p>
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <button type="button" onClick={() => setShowUpload(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Upload Document</button>
          </div>
        </form>
      </Modal>

      {selectedDoc && (
        <Modal open={!!selectedDoc} onClose={() => setSelectedDoc(null)} title={selectedDoc.title} size="lg">
          <div className="space-y-4">
            <p className="text-sm text-gray-600">{selectedDoc.description}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Type</p>
                <p className="font-medium text-gray-900 capitalize">{selectedDoc.document_type}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Category</p>
                <p className="font-medium text-gray-900 capitalize">{selectedDoc.category.replace('_', ' ')}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Version</p>
                <p className="font-medium text-gray-900">v{selectedDoc.version}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Status</p>
                <p className="font-medium text-gray-900 capitalize">{selectedDoc.status.replace('_', ' ')}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Size</p>
                <p className="font-medium text-gray-900">{formatSize(selectedDoc.file_size)}</p>
              </div>
              {selectedDoc.effective_date && (
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Effective</p>
                  <p className="font-medium text-gray-900">{new Date(selectedDoc.effective_date).toLocaleDateString('en-ZA')}</p>
                </div>
              )}
            </div>
            <div className="flex gap-2 pt-2">
              <button className="btn-primary flex items-center gap-1.5">
                <Download size={15} /> Download
              </button>
              <button onClick={() => setSelectedDoc(null)} className="btn-secondary">Close</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
