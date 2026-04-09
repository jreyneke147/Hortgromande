import { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Search, Pencil, Loader2, FolderKanban } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Programme } from '../types';
import Modal from '../components/ui/Modal';
import StatusBadge from '../components/ui/StatusBadge';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  code: z.string().min(2, 'Code is required').max(10, 'Code must be 10 characters or less'),
  description: z.string().optional(),
  status: z.string(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  budget: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function Programmes() {
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Programme | null>(null);
  const [search, setSearch] = useState('');

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { status: 'active', budget: '0' },
  });

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('programmes')
      .select('*')
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });
    setProgrammes(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  function openCreate() {
    setEditing(null);
    reset({ name: '', code: '', description: '', status: 'active', start_date: '', end_date: '', budget: '0' });
    setModalOpen(true);
  }

  function openEdit(p: Programme) {
    setEditing(p);
    reset({
      name: p.name,
      code: p.code,
      description: p.description,
      status: p.status,
      start_date: p.start_date ?? '',
      end_date: p.end_date ?? '',
      budget: String(p.budget),
    });
    setModalOpen(true);
  }

  async function onSubmit(data: FormData) {
    const payload = {
      name: data.name,
      code: data.code,
      description: data.description ?? '',
      status: data.status,
      start_date: data.start_date || null,
      end_date: data.end_date || null,
      budget: parseFloat(data.budget || '0') || 0,
    };

    if (editing) {
      await supabase.from('programmes').update(payload).eq('id', editing.id);
    } else {
      await supabase.from('programmes').insert(payload);
    }

    setModalOpen(false);
    load();
  }

  const filtered = programmes.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.code.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Programmes</h1>
          <p className="text-sm text-gray-500 mt-1">{programmes.length} programme{programmes.length !== 1 ? 's' : ''} total</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Plus size={16} /> New Programme
        </button>
      </div>

      <div className="card">
        <div className="p-4 border-b border-gray-200">
          <div className="relative max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search programmes..."
              className="input-field pl-9"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={<FolderKanban size={48} />}
            title="No programmes found"
            description={search ? 'Try adjusting your search terms' : 'Get started by creating your first programme'}
            action={!search ? <button onClick={openCreate} className="btn-primary"><Plus size={16} /> New Programme</button> : undefined}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Programme</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Code</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Status</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Period</th>
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Budget (R)</th>
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3 w-16"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3.5">
                      <p className="text-sm font-medium text-gray-900">{p.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-1 max-w-md">{p.description}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-sm font-mono text-gray-600 bg-gray-100 px-2 py-0.5 rounded">{p.code}</span>
                    </td>
                    <td className="px-4 py-3.5"><StatusBadge status={p.status} /></td>
                    <td className="px-4 py-3.5 text-sm text-gray-600">
                      {p.start_date && p.end_date
                        ? `${new Date(p.start_date).toLocaleDateString('en-ZA', { month: 'short', year: 'numeric' })} - ${new Date(p.end_date).toLocaleDateString('en-ZA', { month: 'short', year: 'numeric' })}`
                        : '-'}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-900 font-medium text-right tabular-nums">
                      {p.budget ? `R ${p.budget.toLocaleString()}` : '-'}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                        <Pencil size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Programme' : 'New Programme'} size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label-text">Programme Name</label>
              <input {...register('name')} className="input-field" placeholder="e.g. Deciduous Fruit Development" />
              {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
            </div>
            <div>
              <label className="label-text">Code</label>
              <input {...register('code')} className="input-field font-mono" placeholder="e.g. DFDP" disabled={!!editing} />
              {errors.code && <p className="mt-1 text-xs text-red-600">{errors.code.message}</p>}
            </div>
          </div>
          <div>
            <label className="label-text">Description</label>
            <textarea {...register('description')} rows={3} className="input-field resize-none" placeholder="Describe this programme..." />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="label-text">Status</label>
              <select {...register('status')} className="input-field">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="archived">Archived</option>
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
              {editing ? 'Update Programme' : 'Create Programme'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
