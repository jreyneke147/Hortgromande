import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Send,
  CheckCircle2,
  XCircle,
  FileCheck,
  Clock,
  MessageSquare,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Submission, ValidationLog, IndicatorPillar } from '../types';
import StatusBadge from '../components/ui/StatusBadge';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Modal from '../components/ui/Modal';
import { getPillarConfig } from '../lib/pillars';

interface ItemRow {
  id: string;
  submission_id: string;
  indicator_id: string;
  value: number;
  notes: string;
  created_at: string;
  updated_at: string;
  indicators?: {
    id: string;
    name: string;
    code: string;
    unit: string;
    pillar: IndicatorPillar;
    target_value: number;
  };
}

export default function SubmissionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [submission, setSubmission] = useState<Submission | null>(null);
  const [items, setItems] = useState<ItemRow[]>([]);
  const [logs, setLogs] = useState<ValidationLog[]>([]);
  const [availableIndicators, setAvailableIndicators] = useState<{ id: string; name: string; code: string; unit: string; pillar: IndicatorPillar; target_value: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionModal, setActionModal] = useState<'submit' | 'validate' | 'reject' | 'approve' | null>(null);
  const [comment, setComment] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [editValues, setEditValues] = useState<Record<string, { value: string; notes: string }>>({});

  const load = useCallback(async () => {
    if (!id) return;
    const [subRes, itemRes, logRes, indRes] = await Promise.all([
      supabase.from('submissions').select('*, projects(name, code, programmes(name)), reporting_periods(name, status)').eq('id', id).maybeSingle(),
      supabase.from('submission_items').select('*, indicators(id, name, code, unit, pillar, target_value)').eq('submission_id', id).order('created_at'),
      supabase.from('validation_logs').select('*, profiles(full_name, email)').eq('submission_id', id).order('created_at', { ascending: false }),
      supabase.from('indicators').select('id, name, code, unit, pillar, target_value').eq('is_deleted', false).eq('is_active', true).order('code'),
    ]);
    setSubmission(subRes.data as Submission | null);
    const loadedItems = (itemRes.data ?? []) as ItemRow[];
    setItems(loadedItems);
    setLogs((logRes.data ?? []) as ValidationLog[]);
    setAvailableIndicators(indRes.data ?? []);

    const values: Record<string, { value: string; notes: string }> = {};
    loadedItems.forEach(item => {
      values[item.id] = { value: String(item.value ?? ''), notes: item.notes ?? '' };
    });
    setEditValues(values);
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  function updateItemValue(itemId: string, field: 'value' | 'notes', val: string) {
    setEditValues(prev => ({
      ...prev,
      [itemId]: { ...prev[itemId], [field]: val },
    }));
  }

  async function saveAll() {
    setSaving(true);
    const updates = items.map(item => {
      const ev = editValues[item.id];
      return supabase.from('submission_items').update({
        value: parseFloat(ev?.value || '0') || 0,
        notes: ev?.notes ?? '',
      }).eq('id', item.id);
    });
    await Promise.all(updates);
    setSaving(false);
    load();
  }

  async function addIndicator(indicatorId: string) {
    if (!id) return;
    await supabase.from('submission_items').insert({
      submission_id: id,
      indicator_id: indicatorId,
      value: 0,
      notes: '',
    });
    load();
  }

  async function removeItem(itemId: string) {
    await supabase.from('submission_items').delete().eq('id', itemId);
    load();
  }

  async function performAction() {
    if (!id || !actionModal) return;
    setActionLoading(true);

    const statusMap = {
      submit: 'submitted',
      validate: 'validated',
      reject: 'rejected',
      approve: 'approved',
    };
    const newStatus = statusMap[actionModal];

    const updatePayload: Record<string, unknown> = { status: newStatus };
    if (actionModal === 'submit') {
      updatePayload.submission_date = new Date().toISOString();
      updatePayload.submitted_by = user?.id ?? null;
    }

    await supabase.from('submissions').update(updatePayload).eq('id', id);
    await supabase.from('validation_logs').insert({
      submission_id: id,
      action: actionModal,
      comment: comment || null,
      performed_by: user?.id ?? null,
    });

    setActionLoading(false);
    setActionModal(null);
    setComment('');
    load();
  }

  if (loading) return <LoadingSpinner />;
  if (!submission) {
    return (
      <div className="text-center py-20">
        <AlertTriangle size={48} className="mx-auto mb-4 text-gray-300" />
        <p className="text-gray-500">Submission not found</p>
        <button onClick={() => navigate('/data-collection')} className="btn-secondary mt-4">Back to Data Collection</button>
      </div>
    );
  }

  const proj = submission.projects as { name: string; code: string; programmes?: { name: string } } | undefined;
  const period = submission.reporting_periods as { name: string; status: string } | undefined;
  const isDraft = submission.status === 'draft';
  const isSubmitted = submission.status === 'submitted';
  const isValidated = submission.status === 'validated';

  const usedIndicatorIds = new Set(items.map(i => i.indicator_id));
  const unusedIndicators = availableIndicators.filter(ind => !usedIndicatorIds.has(ind.id));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/data-collection')} className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{proj?.name ?? 'Submission'}</h1>
            <StatusBadge status={submission.status} />
          </div>
          <p className="text-sm text-gray-500 mt-0.5">
            {proj?.programmes?.name ?? ''} {period ? `/ ${period.name}` : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isDraft && (
            <>
              <button onClick={saveAll} disabled={saving} className="btn-secondary">
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                Save Draft
              </button>
              <button onClick={() => setActionModal('submit')} className="btn-primary">
                <Send size={16} /> Submit for Review
              </button>
            </>
          )}
          {isSubmitted && (
            <>
              <button onClick={() => setActionModal('reject')} className="inline-flex items-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2.5 text-sm font-medium text-red-700 transition-all hover:bg-red-50">
                <XCircle size={16} /> Reject
              </button>
              <button onClick={() => setActionModal('validate')} className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-amber-700">
                <FileCheck size={16} /> Validate
              </button>
            </>
          )}
          {isValidated && (
            <>
              <button onClick={() => setActionModal('reject')} className="inline-flex items-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2.5 text-sm font-medium text-red-700 transition-all hover:bg-red-50">
                <XCircle size={16} /> Reject
              </button>
              <button onClick={() => setActionModal('approve')} className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-emerald-700">
                <CheckCircle2 size={16} /> Approve
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="card p-4">
          <p className="text-xs text-gray-500 mb-1">Indicators</p>
          <p className="text-xl font-bold text-gray-900">{items.length}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-gray-500 mb-1">Completed</p>
          <p className="text-xl font-bold text-gray-900">
            {items.filter(i => (editValues[i.id]?.value ? parseFloat(editValues[i.id].value) : i.value) > 0).length}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-gray-500 mb-1">Status</p>
          <StatusBadge status={submission.status} />
        </div>
        <div className="card p-4">
          <p className="text-xs text-gray-500 mb-1">Created</p>
          <p className="text-sm font-medium text-gray-900">
            {new Date(submission.created_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="card">
            <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-900">Indicator Values</h2>
              {isDraft && unusedIndicators.length > 0 && (
                <select
                  className="input-field w-auto text-xs py-1.5"
                  value=""
                  onChange={(e) => { if (e.target.value) addIndicator(e.target.value); }}
                >
                  <option value="">+ Add indicator...</option>
                  {unusedIndicators.map(ind => (
                    <option key={ind.id} value={ind.id}>{ind.code} - {ind.name}</option>
                  ))}
                </select>
              )}
            </div>

            {items.length === 0 ? (
              <div className="p-8 text-center text-sm text-gray-500">
                No indicator items yet. Add indicators to start entering data.
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {items.map((item) => {
                  const ind = item.indicators;
                  const pillarCfg = ind ? getPillarConfig(ind.pillar) : null;
                  const ev = editValues[item.id] ?? { value: String(item.value), notes: item.notes };
                  const numericVal = parseFloat(ev.value) || 0;
                  const pct = ind && ind.target_value > 0 ? Math.min(100, Math.round((numericVal / ind.target_value) * 100)) : 0;

                  return (
                    <div key={item.id} className="px-4 py-3.5">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-xs font-mono text-gray-400">{ind?.code}</span>
                            {pillarCfg && (
                              <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-medium ring-1 ring-inset ${pillarCfg.color} ${pillarCfg.bgColor} ${pillarCfg.ringColor}`}>
                                {pillarCfg.label}
                              </span>
                            )}
                          </div>
                          <p className="text-sm font-medium text-gray-900">{ind?.name ?? 'Unknown Indicator'}</p>
                        </div>
                        {isDraft && (
                          <button onClick={() => removeItem(item.id)} className="p-1 rounded text-gray-300 hover:text-red-500 transition-colors">
                            <XCircle size={14} />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
                        <div>
                          <label className="text-[11px] text-gray-500 mb-0.5 block">Value ({ind?.unit ?? '-'})</label>
                          {isDraft ? (
                            <input
                              type="number"
                              value={ev.value}
                              onChange={(e) => updateItemValue(item.id, 'value', e.target.value)}
                              className="input-field py-1.5 text-sm"
                              step="any"
                            />
                          ) : (
                            <p className="text-sm font-medium text-gray-900">{numericVal.toLocaleString()}</p>
                          )}
                        </div>
                        <div>
                          <label className="text-[11px] text-gray-500 mb-0.5 block">Target</label>
                          <p className="text-sm text-gray-600">{ind?.target_value?.toLocaleString() ?? '-'}</p>
                        </div>
                        <div>
                          <label className="text-[11px] text-gray-500 mb-0.5 block">Progress</label>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${pct >= 100 ? 'bg-emerald-500' : pct >= 50 ? 'bg-brand-500' : 'bg-amber-500'}`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium text-gray-500 w-8 text-right">{pct}%</span>
                          </div>
                        </div>
                      </div>

                      {isDraft ? (
                        <div className="mt-2">
                          <input
                            type="text"
                            value={ev.notes}
                            onChange={(e) => updateItemValue(item.id, 'notes', e.target.value)}
                            className="input-field py-1.5 text-xs"
                            placeholder="Notes (optional)"
                          />
                        </div>
                      ) : ev.notes ? (
                        <p className="mt-2 text-xs text-gray-500 italic">{ev.notes}</p>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="card p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Submission Info</h3>
            <dl className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Project</dt>
                <dd className="text-gray-900 font-medium text-right">{proj?.name ?? '-'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Programme</dt>
                <dd className="text-gray-900 text-right">{proj?.programmes?.name ?? '-'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Period</dt>
                <dd className="text-gray-900 text-right">{period?.name ?? '-'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Submitted</dt>
                <dd className="text-gray-900 text-right">
                  {submission.submission_date
                    ? new Date(submission.submission_date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })
                    : '-'}
                </dd>
              </div>
            </dl>
          </div>

          <div className="card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Clock size={14} className="text-gray-400" />
              <h3 className="text-sm font-semibold text-gray-900">Audit Trail</h3>
            </div>

            {logs.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-3">No activity yet</p>
            ) : (
              <div className="space-y-0">
                {logs.map((log, idx) => {
                  const actionIcons: Record<string, { icon: typeof CheckCircle2; color: string }> = {
                    submit: { icon: Send, color: 'text-blue-500' },
                    validate: { icon: FileCheck, color: 'text-amber-500' },
                    approve: { icon: CheckCircle2, color: 'text-emerald-500' },
                    reject: { icon: XCircle, color: 'text-red-500' },
                  };
                  const cfg = actionIcons[log.action] ?? { icon: MessageSquare, color: 'text-gray-400' };
                  const ActionIcon = cfg.icon;

                  return (
                    <div key={log.id} className={`flex gap-3 py-2.5 ${idx < logs.length - 1 ? 'border-b border-gray-100' : ''}`}>
                      <div className={`mt-0.5 ${cfg.color}`}>
                        <ActionIcon size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-900 capitalize">{log.action}</p>
                        {log.comment && <p className="text-xs text-gray-500 mt-0.5">{log.comment}</p>}
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          {log.profiles?.full_name ?? 'System'} &middot; {new Date(log.created_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal
        open={!!actionModal}
        onClose={() => { setActionModal(null); setComment(''); }}
        title={
          actionModal === 'submit' ? 'Submit for Review'
            : actionModal === 'validate' ? 'Validate Submission'
            : actionModal === 'reject' ? 'Reject Submission'
            : 'Approve Submission'
        }
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            {actionModal === 'submit' && 'This will submit the data for review. You won\'t be able to edit values after submission.'}
            {actionModal === 'validate' && 'Mark this submission as validated. It will move to the approval stage.'}
            {actionModal === 'reject' && 'Reject this submission and send it back for corrections. Please provide a reason.'}
            {actionModal === 'approve' && 'Approve this submission. The data will be finalized.'}
          </p>
          <div>
            <label className="label-text">Comment {actionModal === 'reject' ? '(required)' : '(optional)'}</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              className="input-field resize-none"
              placeholder={actionModal === 'reject' ? 'Reason for rejection...' : 'Add a comment...'}
            />
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t border-gray-200">
            <button onClick={() => { setActionModal(null); setComment(''); }} className="btn-secondary">Cancel</button>
            <button
              onClick={performAction}
              disabled={actionLoading || (actionModal === 'reject' && !comment.trim())}
              className={
                actionModal === 'reject'
                  ? 'btn-danger'
                  : actionModal === 'approve'
                  ? 'inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50'
                  : 'btn-primary'
              }
            >
              {actionLoading && <Loader2 size={16} className="animate-spin" />}
              {actionModal === 'submit' && 'Submit'}
              {actionModal === 'validate' && 'Validate'}
              {actionModal === 'reject' && 'Reject'}
              {actionModal === 'approve' && 'Approve'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
