import { useEffect, useState } from 'react';
import {
  FileText,
  Download,
  Plus,
  Calendar,
  Search,
  FileSpreadsheet,
  ChevronRight,
  Clock,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { ReportTemplate, GeneratedReport } from '../types';
import Modal from '../components/ui/Modal';
import StatusBadge from '../components/ui/StatusBadge';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';

const REPORT_TYPE_META: Record<string, { label: string; color: string; bgColor: string }> = {
  quarterly: { label: 'Quarterly', color: 'text-blue-700', bgColor: 'bg-blue-50' },
  annual: { label: 'Annual', color: 'text-emerald-700', bgColor: 'bg-emerald-50' },
  governance: { label: 'Governance', color: 'text-amber-700', bgColor: 'bg-amber-50' },
  programme: { label: 'Programme', color: 'text-teal-700', bgColor: 'bg-teal-50' },
  custom: { label: 'Custom', color: 'text-gray-700', bgColor: 'bg-gray-50' },
};

export default function Reports() {
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [reports, setReports] = useState<GeneratedReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [generateModal, setGenerateModal] = useState<ReportTemplate | null>(null);
  const [generating, setGenerating] = useState(false);
  const [programmes, setProgrammes] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    async function load() {
      const [tRes, rRes, pRes] = await Promise.all([
        supabase.from('report_templates').select('*').eq('is_active', true).order('name'),
        supabase.from('generated_reports').select('*').order('created_at', { ascending: false }),
        supabase.from('programmes').select('id, name').eq('is_deleted', false).order('name'),
      ]);
      setTemplates(tRes.data ?? []);
      setReports(rRes.data ?? []);
      setProgrammes(pRes.data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  async function handleGenerate(template: ReportTemplate) {
    setGenerating(true);
    const name = `${template.name} - ${new Date().toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}`;
    await supabase.from('generated_reports').insert({
      template_id: template.id,
      name,
      report_type: template.report_type,
      filters: {},
      status: 'completed',
      file_path: `/reports/${name.toLowerCase().replace(/\s+/g, '-')}.pdf`,
    });
    const { data: updated } = await supabase.from('generated_reports').select('*').order('created_at', { ascending: false });
    setReports(updated ?? []);
    setGenerating(false);
    setGenerateModal(null);
  }

  function exportCSV() {
    const csv = [
      ['Name', 'Type', 'Status', 'Generated'].join(','),
      ...reports.map(r => [
        `"${r.name}"`, r.report_type, r.status,
        new Date(r.created_at).toLocaleDateString('en-ZA'),
      ].join(',')),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'reports-export.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  const filteredReports = reports.filter(r => {
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'all' || r.report_type === typeFilter;
    return matchSearch && matchType;
  });

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-sm text-gray-500 mt-1">{reports.length} generated reports from {templates.length} templates</p>
        </div>
        <button onClick={exportCSV} className="btn-secondary"><Download size={16} /> Export List</button>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-gray-900 mb-3">Report Templates</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {templates.map(t => {
            const meta = REPORT_TYPE_META[t.report_type] ?? REPORT_TYPE_META.custom;
            return (
              <button key={t.id} onClick={() => setGenerateModal(t)} className="card p-4 text-left hover:shadow-md transition-all group">
                <div className="flex items-start justify-between mb-2">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${meta.bgColor} ${meta.color}`}>
                    <FileText size={16} />
                  </div>
                  <ChevronRight size={14} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
                </div>
                <p className="text-sm font-medium text-gray-900 mb-1">{t.name}</p>
                <p className="text-xs text-gray-500 line-clamp-2">{t.description}</p>
                <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-medium mt-2 ${meta.bgColor} ${meta.color}`}>
                  {meta.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="card">
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search reports..." className="input-field pl-9" />
          </div>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="input-field w-auto">
            <option value="all">All types</option>
            <option value="quarterly">Quarterly</option>
            <option value="annual">Annual</option>
            <option value="governance">Governance</option>
            <option value="programme">Programme</option>
            <option value="custom">Custom</option>
          </select>
        </div>

        {filteredReports.length === 0 ? (
          <EmptyState icon={<FileText size={48} />} title="No reports found" description="Generate a report from one of the templates above" />
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredReports.map(r => {
              const meta = REPORT_TYPE_META[r.report_type] ?? REPORT_TYPE_META.custom;
              return (
                <div key={r.id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${meta.bgColor} ${meta.color}`}>
                      {r.file_path.endsWith('.csv') || r.file_path.endsWith('.xlsx') ? <FileSpreadsheet size={14} /> : <FileText size={14} />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{r.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`inline-flex items-center rounded px-1 py-0.5 text-[10px] font-medium ${meta.bgColor} ${meta.color}`}>
                          {meta.label}
                        </span>
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Calendar size={10} />
                          {new Date(r.created_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {r.status === 'completed' ? (
                      <span className="flex items-center gap-1 text-xs text-emerald-600"><CheckCircle2 size={12} /> Completed</span>
                    ) : r.status === 'draft' ? (
                      <span className="flex items-center gap-1 text-xs text-gray-400"><Clock size={12} /> Draft</span>
                    ) : (
                      <StatusBadge status={r.status} />
                    )}
                    {r.status === 'completed' && r.file_path && (
                      <button className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                        <Download size={14} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Modal open={!!generateModal} onClose={() => setGenerateModal(null)} title="Generate Report" size="sm">
        {generateModal && (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-900">{generateModal.name}</p>
              <p className="text-xs text-gray-500 mt-1">{generateModal.description}</p>
            </div>
            <div>
              <label className="label-text">Programme (optional)</label>
              <select className="input-field">
                <option value="">All programmes</option>
                {programmes.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label-text">Format</label>
              <div className="flex gap-2">
                {['PDF', 'Excel', 'CSV'].map(f => (
                  <button key={f} className="flex-1 py-2 text-xs font-medium border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">{f}</button>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-3 border-t border-gray-200">
              <button onClick={() => setGenerateModal(null)} className="btn-secondary">Cancel</button>
              <button onClick={() => handleGenerate(generateModal)} disabled={generating} className="btn-primary">
                {generating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                Generate Report
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
