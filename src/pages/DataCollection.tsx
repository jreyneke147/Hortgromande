import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, ClipboardList, ChevronRight, Send, FileCheck, XCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Submission } from '../types';
import StatusBadge from '../components/ui/StatusBadge';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import Modal from '../components/ui/Modal';

export default function DataCollection() {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [projects, setProjects] = useState<{ id: string; name: string; code: string }[]>([]);
  const [periods, setPeriods] = useState<{ id: string; name: string; status: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [createOpen, setCreateOpen] = useState(false);
  const [newProjectId, setNewProjectId] = useState('');
  const [newPeriodId, setNewPeriodId] = useState('');

  const load = useCallback(async () => {
    const [subRes, projRes, perRes] = await Promise.all([
      supabase.from('submissions').select('*, projects(name, code, programmes(name)), reporting_periods(name, status)').eq('is_deleted', false).order('created_at', { ascending: false }),
      supabase.from('projects').select('id, name, code').eq('is_deleted', false).order('name'),
      supabase.from('reporting_periods').select('id, name, status').order('start_date', { ascending: false }),
    ]);
    setSubmissions(subRes.data ?? []);
    setProjects(projRes.data ?? []);
    setPeriods(perRes.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function createSubmission() {
    if (!newProjectId || !newPeriodId) return;
    const { data } = await supabase.from('submissions').insert({ project_id: newProjectId, reporting_period_id: newPeriodId, status: 'draft' }).select('id').maybeSingle();
    if (data) {
      setCreateOpen(false);
      navigate(`/data-collection/${data.id}`);
    }
  }

  const statusCounts = {
    draft: submissions.filter(s => s.status === 'draft').length,
    submitted: submissions.filter(s => s.status === 'submitted').length,
    validated: submissions.filter(s => s.status === 'validated').length,
    rejected: submissions.filter(s => s.status === 'rejected').length,
    approved: submissions.filter(s => s.status === 'approved').length,
  };

  const filtered = submissions.filter(s => {
    const proj = s.projects as { name: string; code: string } | undefined;
    const matchesSearch = (proj?.name ?? '').toLowerCase().includes(search.toLowerCase()) || (proj?.code ?? '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Data Collection</h1>
          <p className="text-sm text-gray-500 mt-1">{submissions.length} submissions total</p>
        </div>
        <button onClick={() => setCreateOpen(true)} className="btn-primary"><Plus size={16} /> New Submission</button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {([
          { key: 'draft', label: 'Drafts', icon: ClipboardList, color: 'text-gray-600 bg-gray-50' },
          { key: 'submitted', label: 'Submitted', icon: Send, color: 'text-blue-700 bg-blue-50' },
          { key: 'validated', label: 'Validated', icon: FileCheck, color: 'text-amber-700 bg-amber-50' },
          { key: 'rejected', label: 'Rejected', icon: XCircle, color: 'text-red-700 bg-red-50' },
          { key: 'approved', label: 'Approved', icon: CheckCircle2, color: 'text-emerald-700 bg-emerald-50' },
        ] as const).map((s) => (
          <button key={s.key} onClick={() => setStatusFilter(statusFilter === s.key ? 'all' : s.key)}
            className={`card p-3 text-center transition-all hover:shadow-md ${statusFilter === s.key ? 'ring-2 ring-brand-500' : ''}`}>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-1.5 ${s.color}`}>
              <s.icon size={15} />
            </div>
            <p className="text-lg font-bold text-gray-900">{statusCounts[s.key]}</p>
            <p className="text-xs text-gray-500">{s.label}</p>
          </button>
        ))}
      </div>

      <div className="card">
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by project..." className="input-field pl-9" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field w-auto">
            <option value="all">All statuses</option>
            <option value="draft">Draft</option>
            <option value="submitted">Submitted</option>
            <option value="validated">Validated</option>
            <option value="rejected">Rejected</option>
            <option value="approved">Approved</option>
          </select>
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon={<ClipboardList size={48} />} title="No submissions found" description="Start a new data submission to record indicator values"
            action={<button onClick={() => setCreateOpen(true)} className="btn-primary"><Plus size={16} /> New Submission</button>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Project</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Period</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Status</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Submitted</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Created</th>
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3 w-16"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((s) => {
                  const proj = s.projects as { name: string; code: string; programmes?: { name: string } } | undefined;
                  const period = s.reporting_periods as { name: string } | undefined;
                  return (
                    <tr key={s.id} className="hover:bg-gray-50/50 transition-colors cursor-pointer" onClick={() => navigate(`/data-collection/${s.id}`)}>
                      <td className="px-4 py-3.5">
                        <p className="text-sm font-medium text-gray-900">{proj?.name ?? '-'}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{proj?.programmes?.name ?? ''}</p>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-gray-600">{period?.name ?? '-'}</td>
                      <td className="px-4 py-3.5"><StatusBadge status={s.status} /></td>
                      <td className="px-4 py-3.5 text-sm text-gray-600">
                        {s.submission_date ? new Date(s.submission_date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                      </td>
                      <td className="px-4 py-3.5 text-sm text-gray-500">
                        {new Date(s.created_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <ChevronRight size={16} className="text-gray-400" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="New Data Submission" size="md">
        <div className="space-y-4">
          <div>
            <label className="label-text">Project</label>
            <select value={newProjectId} onChange={(e) => setNewProjectId(e.target.value)} className="input-field">
              <option value="">Select project...</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name} ({p.code})</option>)}
            </select>
          </div>
          <div>
            <label className="label-text">Reporting Period</label>
            <select value={newPeriodId} onChange={(e) => setNewPeriodId(e.target.value)} className="input-field">
              <option value="">Select period...</option>
              {periods.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button onClick={() => setCreateOpen(false)} className="btn-secondary">Cancel</button>
            <button onClick={createSubmission} disabled={!newProjectId || !newPeriodId} className="btn-primary">Create Submission</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
