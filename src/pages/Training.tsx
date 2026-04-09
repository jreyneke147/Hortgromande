import { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Plus,
  Search,
  GraduationCap,
  Users,
  Clock,
  Award,
  Pencil,
  Loader2,
  ChevronRight,
  MapPin,
  Calendar,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { TrainingSession } from '../types';
import Modal from '../components/ui/Modal';
import StatusBadge from '../components/ui/StatusBadge';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';

const CATEGORIES = [
  { key: 'technical_skills', label: 'Technical Skills' },
  { key: 'farm_management', label: 'Farm Management' },
  { key: 'business_planning', label: 'Business Planning' },
  { key: 'financial_literacy', label: 'Financial Literacy' },
  { key: 'leadership', label: 'Leadership Development' },
  { key: 'compliance', label: 'Compliance & Regulation' },
  { key: 'environmental', label: 'Environmental Practices' },
  { key: 'mentorship', label: 'Mentorship' },
];

const schema = z.object({
  title: z.string().min(2, 'Title is required'),
  description: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  programme_id: z.string().optional(),
  entity_id: z.string().optional(),
  facilitator: z.string().optional(),
  location: z.string().optional(),
  session_date: z.string().min(1, 'Date is required'),
  duration_hours: z.string().optional(),
  max_attendees: z.string().optional(),
  status: z.string(),
});

type FormData = z.infer<typeof schema>;

export default function Training() {
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [programmes, setProgrammes] = useState<{ id: string; name: string }[]>([]);
  const [entities, setEntities] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<TrainingSession | null>(null);
  const [detailSession, setDetailSession] = useState<TrainingSession | null>(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { status: 'planned', duration_hours: '0', max_attendees: '30' },
  });

  const load = useCallback(async () => {
    const [sessRes, progRes, entRes] = await Promise.all([
      supabase.from('training_sessions').select('*, programmes(name), entities(name), training_attendance(*)').eq('is_deleted', false).order('session_date', { ascending: false }),
      supabase.from('programmes').select('id, name').eq('is_deleted', false).order('name'),
      supabase.from('entities').select('id, name').eq('is_deleted', false).order('name'),
    ]);
    setSessions((sessRes.data ?? []) as TrainingSession[]);
    setProgrammes(progRes.data ?? []);
    setEntities(entRes.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  function openCreate() {
    setEditing(null);
    reset({ title: '', description: '', category: '', programme_id: '', entity_id: '', facilitator: '', location: '', session_date: '', duration_hours: '0', max_attendees: '30', status: 'planned' });
    setModalOpen(true);
  }

  function openEdit(s: TrainingSession) {
    setEditing(s);
    reset({
      title: s.title,
      description: s.description,
      category: s.category,
      programme_id: s.programme_id ?? '',
      entity_id: s.entity_id ?? '',
      facilitator: s.facilitator,
      location: s.location,
      session_date: s.session_date,
      duration_hours: String(s.duration_hours),
      max_attendees: String(s.max_attendees),
      status: s.status,
    });
    setModalOpen(true);
  }

  async function onSubmit(data: FormData) {
    const payload = {
      title: data.title,
      description: data.description ?? '',
      category: data.category,
      programme_id: data.programme_id || null,
      entity_id: data.entity_id || null,
      facilitator: data.facilitator ?? '',
      location: data.location ?? '',
      session_date: data.session_date,
      duration_hours: parseFloat(data.duration_hours || '0') || 0,
      max_attendees: parseInt(data.max_attendees || '30') || 30,
      status: data.status,
    };
    if (editing) {
      await supabase.from('training_sessions').update(payload).eq('id', editing.id);
    } else {
      await supabase.from('training_sessions').insert(payload);
    }
    setModalOpen(false);
    load();
  }

  const filtered = sessions.filter(s => {
    const matchSearch = s.title.toLowerCase().includes(search.toLowerCase()) || s.facilitator.toLowerCase().includes(search.toLowerCase());
    const matchCategory = categoryFilter === 'all' || s.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  const totalHours = sessions.reduce((sum, s) => sum + s.duration_hours, 0);
  const totalAttendees = sessions.reduce((sum, s) => sum + (s.training_attendance?.length ?? 0), 0);
  const completedCount = sessions.filter(s => s.status === 'completed').length;
  const certCount = sessions.reduce((sum, s) => sum + (s.training_attendance?.filter(a => a.certificate_issued).length ?? 0), 0);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Training & Capacity Development</h1>
          <p className="text-sm text-gray-500 mt-1">{sessions.length} sessions across {new Set(sessions.map(s => s.category)).size} categories</p>
        </div>
        <button onClick={openCreate} className="btn-primary"><Plus size={16} /> New Session</button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="card p-4">
          <div className="w-9 h-9 rounded-lg bg-brand-50 text-brand-700 flex items-center justify-center mb-2">
            <Clock size={18} />
          </div>
          <p className="text-xl font-bold text-gray-900">{totalHours.toLocaleString()}</p>
          <p className="text-xs text-gray-500">Training Hours</p>
        </div>
        <div className="card p-4">
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center mb-2">
            <Users size={18} />
          </div>
          <p className="text-xl font-bold text-gray-900">{totalAttendees.toLocaleString()}</p>
          <p className="text-xs text-gray-500">Total Attendees</p>
        </div>
        <div className="card p-4">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mb-2">
            <GraduationCap size={18} />
          </div>
          <p className="text-xl font-bold text-gray-900">{completedCount}</p>
          <p className="text-xs text-gray-500">Sessions Completed</p>
        </div>
        <div className="card p-4">
          <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center mb-2">
            <Award size={18} />
          </div>
          <p className="text-xl font-bold text-gray-900">{certCount}</p>
          <p className="text-xs text-gray-500">Certificates Issued</p>
        </div>
      </div>

      <div className="card">
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search sessions..." className="input-field pl-9" />
          </div>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="input-field w-auto">
            <option value="all">All categories</option>
            {CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
          </select>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={<GraduationCap size={48} />}
            title="No training sessions found"
            description="Create a new training session to track capacity development"
            action={<button onClick={openCreate} className="btn-primary"><Plus size={16} /> New Session</button>}
          />
        ) : (
          <div className="divide-y divide-gray-100">
            {filtered.map(session => {
              const cat = CATEGORIES.find(c => c.key === session.category);
              const attendeeCount = session.training_attendance?.length ?? 0;
              const completedAttendees = session.training_attendance?.filter(a => a.completed).length ?? 0;
              return (
                <div key={session.id} className="px-4 py-3.5 hover:bg-gray-50/50 transition-colors cursor-pointer" onClick={() => setDetailSession(session)}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium text-gray-900 truncate">{session.title}</p>
                        <StatusBadge status={session.status} />
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                        {cat && <span className="inline-flex items-center gap-1"><GraduationCap size={11} /> {cat.label}</span>}
                        <span className="inline-flex items-center gap-1"><Calendar size={11} /> {new Date(session.session_date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        {session.location && <span className="inline-flex items-center gap-1"><MapPin size={11} /> {session.location}</span>}
                        <span className="inline-flex items-center gap-1"><Clock size={11} /> {session.duration_hours}h</span>
                        <span className="inline-flex items-center gap-1"><Users size={11} /> {attendeeCount}/{session.max_attendees}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      {attendeeCount > 0 && (
                        <div className="text-right mr-2">
                          <p className="text-xs text-gray-500">{completedAttendees}/{attendeeCount} completed</p>
                          <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden mt-1">
                            <div className="h-full bg-brand-500 rounded-full" style={{ width: `${attendeeCount > 0 ? (completedAttendees / attendeeCount * 100) : 0}%` }} />
                          </div>
                        </div>
                      )}
                      <button onClick={(e) => { e.stopPropagation(); openEdit(session); }} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                        <Pencil size={14} />
                      </button>
                      <ChevronRight size={16} className="text-gray-300" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Training Session' : 'New Training Session'} size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label-text">Title</label>
            <input {...register('title')} className="input-field" placeholder="e.g. Orchard Management Best Practices" />
            {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>}
          </div>
          <div>
            <label className="label-text">Description</label>
            <textarea {...register('description')} rows={2} className="input-field resize-none" placeholder="Session description..." />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label-text">Category</label>
              <select {...register('category')} className="input-field">
                <option value="">Select category...</option>
                {CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
              </select>
              {errors.category && <p className="mt-1 text-xs text-red-600">{errors.category.message}</p>}
            </div>
            <div>
              <label className="label-text">Status</label>
              <select {...register('status')} className="input-field">
                <option value="planned">Planned</option>
                <option value="active">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label-text">Programme</label>
              <select {...register('programme_id')} className="input-field">
                <option value="">Select programme...</option>
                {programmes.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label-text">Entity</label>
              <select {...register('entity_id')} className="input-field">
                <option value="">Select entity...</option>
                {entities.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="label-text">Date</label>
              <input {...register('session_date')} type="date" className="input-field" />
              {errors.session_date && <p className="mt-1 text-xs text-red-600">{errors.session_date.message}</p>}
            </div>
            <div>
              <label className="label-text">Duration (hours)</label>
              <input {...register('duration_hours')} type="number" step="0.5" className="input-field" />
            </div>
            <div>
              <label className="label-text">Max Attendees</label>
              <input {...register('max_attendees')} type="number" className="input-field" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label-text">Facilitator</label>
              <input {...register('facilitator')} className="input-field" placeholder="Facilitator name" />
            </div>
            <div>
              <label className="label-text">Location</label>
              <input {...register('location')} className="input-field" placeholder="Training venue" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary">
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : null}
              {editing ? 'Update Session' : 'Create Session'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={!!detailSession} onClose={() => setDetailSession(null)} title={detailSession?.title ?? 'Session Details'} size="lg">
        {detailSession && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <p className="text-xs text-gray-500">Category</p>
                <p className="text-sm font-medium text-gray-900">{CATEGORIES.find(c => c.key === detailSession.category)?.label ?? detailSession.category}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Date</p>
                <p className="text-sm font-medium text-gray-900">{new Date(detailSession.session_date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Duration</p>
                <p className="text-sm font-medium text-gray-900">{detailSession.duration_hours} hours</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Facilitator</p>
                <p className="text-sm font-medium text-gray-900">{detailSession.facilitator || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Location</p>
                <p className="text-sm font-medium text-gray-900">{detailSession.location || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Status</p>
                <StatusBadge status={detailSession.status} />
              </div>
            </div>

            {detailSession.description && (
              <p className="text-sm text-gray-600">{detailSession.description}</p>
            )}

            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Attendance ({detailSession.training_attendance?.length ?? 0}/{detailSession.max_attendees})
              </h3>
              {(!detailSession.training_attendance || detailSession.training_attendance.length === 0) ? (
                <p className="text-sm text-gray-400 text-center py-4">No attendance records</p>
              ) : (
                <div className="overflow-x-auto -mx-6 px-6">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left text-xs font-semibold text-gray-500 uppercase py-2">Name</th>
                        <th className="text-left text-xs font-semibold text-gray-500 uppercase py-2">Organisation</th>
                        <th className="text-left text-xs font-semibold text-gray-500 uppercase py-2">Gender</th>
                        <th className="text-center text-xs font-semibold text-gray-500 uppercase py-2">Hours</th>
                        <th className="text-center text-xs font-semibold text-gray-500 uppercase py-2">Completed</th>
                        <th className="text-center text-xs font-semibold text-gray-500 uppercase py-2">Certificate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {detailSession.training_attendance.map(att => (
                        <tr key={att.id}>
                          <td className="py-2 font-medium text-gray-900">{att.attendee_name}</td>
                          <td className="py-2 text-gray-600">{att.organisation || '-'}</td>
                          <td className="py-2 text-gray-600 capitalize">{att.gender}</td>
                          <td className="py-2 text-center text-gray-600">{att.hours_attended}</td>
                          <td className="py-2 text-center">
                            {att.completed ? (
                              <span className="inline-flex w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 items-center justify-center"><Award size={12} /></span>
                            ) : (
                              <span className="inline-flex w-5 h-5 rounded-full bg-gray-100 text-gray-400 items-center justify-center">-</span>
                            )}
                          </td>
                          <td className="py-2 text-center">
                            {att.certificate_issued ? (
                              <span className="inline-flex w-5 h-5 rounded-full bg-amber-100 text-amber-600 items-center justify-center"><Award size={12} /></span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
