import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Search, Pencil, Loader2, Building2, Eye } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Project } from '../types';
import Modal from '../components/ui/Modal';
import StatusBadge from '../components/ui/StatusBadge';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  code: z.string().min(2, 'Code is required'),
  description: z.string().optional(),
  programme_id: z.string().optional(),
  entity_id: z.string().optional(),
  status: z.string(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  budget: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function Projects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [programmes, setProgrammes] = useState<{ id: string; name: string; code: string }[]>([]);
  const [entities, setEntities] = useState<{ id: string; name: string; type: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { status: 'active', budget: '0' },
  });

  const load = useCallback(async () => {
    const [projRes, progRes, entRes] = await Promise.all([
      supabase.from('projects').select('*, programmes(name, code), entities(name, type)').eq('is_deleted', false).order('created_at', { ascending: false }),
      supabase.from('programmes').select('id, name, code').eq('is_deleted', false).order('name'),
      supabase.from('entities').select('id, name, type').eq('is_deleted', false).order('name'),
    ]);
    setProjects(projRes.data ?? []);
    setProgrammes(progRes.data ?? []);
    setEntities(entRes.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  function openCreate() {
    setEditing(null);
    reset({ name: '', code: '', description: '', programme_id: '', entity_id: '', status: 'active', start_date: '', end_date: '', budget: '0' });
    setModalOpen(true);
  }

  function openEdit(p: Project) {
    setEditing(p);
    reset({
      name: p.name, code: p.code, description: p.description, programme_id: p.programme_id ?? '',
      entity_id: p.entity_id ?? '', status: p.status, start_date: p.start_date ?? '', end_date: p.end_date ?? '', budget: String(p.budget),
    });
    setModalOpen(true);
  }

  async function onSubmit(data: FormData) {
    const payload = {
      name: data.name,
      code: data.code,
      description: data.description ?? '',
      status: data.status,
      programme_id: data.programme_id || null,
      entity_id: data.entity_id || null,
      start_date: data.start_date || null,
      end_date: data.end_date || null,
      budget: parseFloat(data.budget || '0') || 0,
    };
    if (editing) {
      await supabase.from('projects').update(payload).eq('id', editing.id);
    } else {
      await supabase.from('projects').insert(payload);
    }
    setModalOpen(false);
    load();
  }

  const filtered = projects.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.code.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects & Entities</h1>
          <p className="text-sm text-gray-500 mt-1">{projects.length} project{projects.length !== 1 ? 's' : ''} across {entities.length} entities</p>
        </div>
        <button onClick={openCreate} className="btn-primary"><Plus size={16} /> New Project</button>
      </div>

      <div className="card">
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search projects..." className="input-field pl-9" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field w-auto">
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="planned">Planned</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon={<Building2 size={48} />} title="No projects found" description={search ? 'Try adjusting your filters' : 'Create your first project to get started'}
            action={!search ? <button onClick={openCreate} className="btn-primary"><Plus size={16} /> New Project</button> : undefined} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Project</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Code</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Programme</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Entity</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Status</th>
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Budget (R)</th>
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3 w-16"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3.5">
                      <p className="text-sm font-medium text-gray-900">{p.name}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-sm font-mono text-gray-600 bg-gray-100 px-2 py-0.5 rounded">{p.code}</span>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-600">{p.programmes?.name ?? '-'}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-600">{p.entities?.name ?? '-'}</td>
                    <td className="px-4 py-3.5"><StatusBadge status={p.status} /></td>
                    <td className="px-4 py-3.5 text-sm text-gray-900 font-medium text-right tabular-nums">
                      {p.budget ? `R ${p.budget.toLocaleString()}` : '-'}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => navigate(`/projects/${p.id}`)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                          <Eye size={15} />
                        </button>
                        <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                          <Pencil size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Project' : 'New Project'} size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label-text">Project Name</label>
              <input {...register('name')} className="input-field" placeholder="e.g. Ceres Apple Expansion" />
              {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
            </div>
            <div>
              <label className="label-text">Code</label>
              <input {...register('code')} className="input-field font-mono" placeholder="e.g. CAE-002" disabled={!!editing} />
              {errors.code && <p className="mt-1 text-xs text-red-600">{errors.code.message}</p>}
            </div>
          </div>
          <div>
            <label className="label-text">Description</label>
            <textarea {...register('description')} rows={3} className="input-field resize-none" placeholder="Describe this project..." />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label-text">Programme</label>
              <select {...register('programme_id')} className="input-field">
                <option value="">Select programme...</option>
                {programmes.map(prog => <option key={prog.id} value={prog.id}>{prog.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label-text">Entity</label>
              <select {...register('entity_id')} className="input-field">
                <option value="">Select entity...</option>
                {entities.map(ent => <option key={ent.id} value={ent.id}>{ent.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="label-text">Status</label>
              <select {...register('status')} className="input-field">
                <option value="active">Active</option>
                <option value="planned">Planned</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div>
              <label className="label-text">Start Date</label>
              <input {...register('start_date')} type="date" className="input-field" />
            </div>
            <div>
              <label className="label-text">End Date</label>
              <input {...register('end_date')} type="date" className="input-field" />
            </div>
          </div>
          <div>
            <label className="label-text">Budget (R)</label>
            <input {...register('budget')} type="number" className="input-field" placeholder="0" />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary">
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : null}
              {editing ? 'Update Project' : 'Create Project'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
