import { useEffect, useState, useCallback } from 'react';
import { Bookmark, BookmarkCheck, Plus, X, Trash2, Star } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import type { FilterState } from './DashboardFilters';

interface SavedViewRow {
  id: string;
  name: string;
  view_type: string;
  filters: Record<string, unknown>;
  is_default: boolean;
}

interface Props {
  viewType: string;
  currentFilters: FilterState;
  onApply: (filters: FilterState) => void;
}

export default function SavedViews({ viewType, currentFilters, onApply }: Props) {
  const { user } = useAuth();
  const [views, setViews] = useState<SavedViewRow[]>([]);
  const [showSave, setShowSave] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('saved_views')
      .select('id, name, view_type, filters, is_default')
      .eq('user_id', user.id)
      .eq('view_type', viewType)
      .order('is_default', { ascending: false });
    setViews((data ?? []) as SavedViewRow[]);
  }, [user, viewType]);

  useEffect(() => { load(); }, [load]);

  async function handleSave() {
    if (!user || !saveName.trim()) return;
    setSaving(true);
    await supabase.from('saved_views').insert({
      user_id: user.id,
      name: saveName.trim(),
      view_type: viewType,
      filters: currentFilters as unknown as Record<string, unknown>,
      is_default: false,
    });
    setSaveName('');
    setShowSave(false);
    setSaving(false);
    load();
  }

  async function handleDelete(id: string) {
    await supabase.from('saved_views').delete().eq('id', id);
    load();
  }

  async function handleSetDefault(id: string) {
    if (!user) return;
    await supabase
      .from('saved_views')
      .update({ is_default: false })
      .eq('user_id', user.id)
      .eq('view_type', viewType);
    await supabase
      .from('saved_views')
      .update({ is_default: true })
      .eq('id', id);
    load();
  }

  function applyView(view: SavedViewRow) {
    const f = view.filters as unknown as FilterState;
    onApply({
      programme_id: f.programme_id ?? '',
      entity_id: f.entity_id ?? '',
      province: f.province ?? '',
      pillar: f.pillar ?? '',
      date_from: f.date_from ?? '',
      date_to: f.date_to ?? '',
    });
  }

  const hasActiveFilters = Object.values(currentFilters).some(v => v !== '');

  return (
    <div className="relative">
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => setExpanded(!expanded)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
            expanded ? 'bg-brand-50 border-brand-300 text-brand-700' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
          }`}
        >
          {views.length > 0 ? <BookmarkCheck size={13} /> : <Bookmark size={13} />}
          Saved Views
          {views.length > 0 && (
            <span className="inline-flex items-center rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-600">
              {views.length}
            </span>
          )}
        </button>

        {hasActiveFilters && (
          <button
            onClick={() => setShowSave(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-dashed border-gray-300 text-xs text-gray-500 hover:border-brand-300 hover:text-brand-600 transition-colors"
          >
            <Plus size={12} /> Save current
          </button>
        )}
      </div>

      {expanded && views.length > 0 && (
        <div className="absolute top-10 left-0 z-30 w-72 card shadow-lg p-0">
          <div className="px-3 py-2 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-700">Saved Views</p>
          </div>
          <div className="max-h-60 overflow-y-auto divide-y divide-gray-50">
            {views.map(v => (
              <div key={v.id} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50/80 transition-colors group">
                <button
                  onClick={() => { applyView(v); setExpanded(false); }}
                  className="flex-1 text-left min-w-0"
                >
                  <p className="text-sm font-medium text-gray-900 truncate">{v.name}</p>
                  <p className="text-[10px] text-gray-400">
                    {Object.values(v.filters).filter(Boolean).length} filters
                    {v.is_default && ' - Default'}
                  </p>
                </button>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleSetDefault(v.id)}
                    className={`p-1 rounded hover:bg-gray-100 transition-colors ${v.is_default ? 'text-amber-500' : 'text-gray-300 hover:text-amber-400'}`}
                    title="Set as default"
                  >
                    <Star size={12} fill={v.is_default ? 'currentColor' : 'none'} />
                  </button>
                  <button
                    onClick={() => handleDelete(v.id)}
                    className="p-1 rounded text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                    title="Delete view"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showSave && (
        <div className="absolute top-10 left-0 z-30 w-72 card shadow-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-gray-900">Save Current View</p>
            <button onClick={() => setShowSave(false)} className="p-1 rounded text-gray-400 hover:text-gray-600">
              <X size={14} />
            </button>
          </div>
          <input
            type="text"
            value={saveName}
            onChange={e => setSaveName(e.target.value)}
            placeholder="View name..."
            className="input-field text-sm mb-3"
            autoFocus
            onKeyDown={e => { if (e.key === 'Enter') handleSave(); }}
          />
          <div className="flex gap-2">
            <button onClick={() => setShowSave(false)} className="btn-secondary flex-1 text-xs py-1.5">
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !saveName.trim()}
              className="btn-primary flex-1 text-xs py-1.5 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
