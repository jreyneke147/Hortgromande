import { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Search, Pencil, Loader2, BarChart3, Layers } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Indicator, IndicatorPillar } from '../types';
import { PILLARS, CATEGORIES, getPillarConfig, getCategoryLabel } from '../lib/pillars';
import Modal from '../components/ui/Modal';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  code: z.string().min(2, 'Code is required'),
  description: z.string().optional(),
  unit: z.string().min(1, 'Unit is required'),
  type: z.string(),
  frequency: z.string(),
  pillar: z.string(),
  category: z.string(),
  target_value: z.string().optional(),
  baseline_value: z.string().optional(),
  programme_id: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function Indicators() {
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [programmes, setProgrammes] = useState<{ id: string; name: string; code: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Indicator | null>(null);
  const [search, setSearch] = useState('');
  const [pillarFilter, setPillarFilter] = useState<string>('all');

  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'output', frequency: 'quarterly', unit: 'number', target_value: '0', baseline_value: '0', pillar: 'economic', category: '' },
  });

  const watchPillar = watch('pillar') as IndicatorPillar;

  const load = useCallback(async () => {
    const [indRes, progRes] = await Promise.all([
      supabase.from('indicators').select('*, programmes(name, code)').eq('is_deleted', false).order('pillar').order('code'),
      supabase.from('programmes').select('id, name, code').eq('is_deleted', false).order('name'),
    ]);
    setIndicators(indRes.data ?? []);
    setProgrammes(progRes.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  function openCreate() {
    setEditing(null);
    reset({ name: '', code: '', description: '', unit: 'number', type: 'output', frequency: 'quarterly', target_value: '0', baseline_value: '0', pillar: 'economic', category: '', programme_id: '' });
    setModalOpen(true);
  }

  function openEdit(ind: Indicator) {
    setEditing(ind);
    reset({
      name: ind.name, code: ind.code, description: ind.description, unit: ind.unit,
      type: ind.type, frequency: ind.frequency, target_value: String(ind.target_value), baseline_value: String(ind.baseline_value ?? 0),
      pillar: ind.pillar, category: ind.category, programme_id: ind.programme_id ?? '',
    });
    setModalOpen(true);
  }

  async function onSubmit(data: FormData) {
    const payload = {
      name: data.name, code: data.code, description: data.description ?? '', unit: data.unit,
      type: data.type, frequency: data.frequency, pillar: data.pillar, category: data.category,
      programme_id: data.programme_id || null,
      target_value: parseFloat(data.target_value || '0') || 0,
      baseline_value: parseFloat(data.baseline_value || '0') || 0,
    };
    if (editing) {
      await supabase.from('indicators').update(payload).eq('id', editing.id);
    } else {
      await supabase.from('indicators').insert(payload);
    }
    setModalOpen(false);
    load();
  }

  const filtered = indicators.filter(i => {
    const matchesSearch = i.name.toLowerCase().includes(search.toLowerCase()) || i.code.toLowerCase().includes(search.toLowerCase());
    const matchesPillar = pillarFilter === 'all' || i.pillar === pillarFilter;
    return matchesSearch && matchesPillar;
  });

  const pillarCounts = PILLARS.map(p => ({
    ...p,
    count: indicators.filter(i => i.pillar === p.key).length,
  }));

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Indicator Library</h1>
          <p className="text-sm text-gray-500 mt-1">{indicators.length} indicators across 4 pillars</p>
        </div>
        <button onClick={openCreate} className="btn-primary"><Plus size={16} /> New Indicator</button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {pillarCounts.map((p) => (
          <button
            key={p.key}
            onClick={() => setPillarFilter(pillarFilter === p.key ? 'all' : p.key)}
            className={`card p-4 text-left transition-all hover:shadow-md ${pillarFilter === p.key ? 'ring-2 ring-brand-500' : ''}`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${p.bgColor} ${p.color}`}>
                <Layers size={16} />
              </div>
              <span className="text-2xl font-bold text-gray-900">{p.count}</span>
            </div>
            <p className="text-sm font-medium text-gray-700">{p.label}</p>
            <p className="text-xs text-gray-400 mt-0.5">Pillar</p>
          </button>
        ))}
      </div>

      <div className="card">
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search indicators..." className="input-field pl-9" />
          </div>
          <select value={pillarFilter} onChange={(e) => setPillarFilter(e.target.value)} className="input-field w-auto">
            <option value="all">All pillars</option>
            {PILLARS.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
          </select>
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon={<BarChart3 size={48} />} title="No indicators found" description={search ? 'Try adjusting your filters' : 'Define your first M&E indicator'}
            action={!search ? <button onClick={openCreate} className="btn-primary"><Plus size={16} /> New Indicator</button> : undefined} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Indicator</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Code</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Pillar</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Unit</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Freq.</th>
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Baseline</th>
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Target</th>
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3 w-16"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((ind) => {
                  const pc = getPillarConfig(ind.pillar);
                  return (
                    <tr key={ind.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3.5">
                        <p className="text-sm font-medium text-gray-900">{ind.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{getCategoryLabel(ind.pillar, ind.category)}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-sm font-mono text-gray-600 bg-gray-100 px-2 py-0.5 rounded">{ind.code}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${pc.bgColor} ${pc.color} ${pc.ringColor}`}>
                          {pc.label}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-gray-600 capitalize">{ind.unit}</td>
                      <td className="px-4 py-3.5 text-sm text-gray-600 capitalize">{ind.frequency}</td>
                      <td className="px-4 py-3.5 text-sm text-gray-500 text-right tabular-nums">{ind.baseline_value?.toLocaleString() ?? '-'}</td>
                      <td className="px-4 py-3.5 text-sm text-gray-900 font-medium text-right tabular-nums">{ind.target_value?.toLocaleString() ?? '-'}</td>
                      <td className="px-4 py-3.5 text-right">
                        <button onClick={() => openEdit(ind)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                          <Pencil size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Indicator' : 'New Indicator'} size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label-text">Indicator Name</label>
              <input {...register('name')} className="input-field" placeholder="e.g. Hectares Under New Cultivation" />
              {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
            </div>
            <div>
              <label className="label-text">Code</label>
              <input {...register('code')} className="input-field font-mono" placeholder="e.g. IND-001" disabled={!!editing} />
              {errors.code && <p className="mt-1 text-xs text-red-600">{errors.code.message}</p>}
            </div>
          </div>
          <div>
            <label className="label-text">Description</label>
            <textarea {...register('description')} rows={2} className="input-field resize-none" placeholder="What does this indicator measure?" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label-text">Pillar</label>
              <select {...register('pillar')} className="input-field">
                {PILLARS.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
              </select>
            </div>
            <div>
              <label className="label-text">Category</label>
              <select {...register('category')} className="input-field">
                <option value="">Select category...</option>
                {CATEGORIES[watchPillar]?.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="label-text">Type</label>
              <select {...register('type')} className="input-field">
                <option value="output">Output</option>
                <option value="outcome">Outcome</option>
                <option value="impact">Impact</option>
              </select>
            </div>
            <div>
              <label className="label-text">Unit</label>
              <input {...register('unit')} className="input-field" placeholder="e.g. hectares, number, %" />
              {errors.unit && <p className="mt-1 text-xs text-red-600">{errors.unit.message}</p>}
            </div>
            <div>
              <label className="label-text">Frequency</label>
              <select {...register('frequency')} className="input-field">
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="annually">Annually</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="label-text">Baseline Value</label>
              <input {...register('baseline_value')} type="number" className="input-field" placeholder="0" />
            </div>
            <div>
              <label className="label-text">Target Value</label>
              <input {...register('target_value')} type="number" className="input-field" placeholder="0" />
            </div>
            <div>
              <label className="label-text">Programme</label>
              <select {...register('programme_id')} className="input-field">
                <option value="">Select programme...</option>
                {programmes.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary">
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : null}
              {editing ? 'Update Indicator' : 'Create Indicator'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
