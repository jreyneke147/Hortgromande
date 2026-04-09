import { useEffect, useState } from 'react';
import { Filter, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export interface FilterState {
  programme_id: string;
  entity_id: string;
  province: string;
  pillar: string;
  date_from: string;
  date_to: string;
}

const DEFAULT_FILTERS: FilterState = {
  programme_id: '',
  entity_id: '',
  province: '',
  pillar: '',
  date_from: '',
  date_to: '',
};

interface Props {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  showPillar?: boolean;
  showEntity?: boolean;
  showDate?: boolean;
}

export default function DashboardFilters({ filters, onChange, showPillar = false, showEntity = true, showDate = true }: Props) {
  const [programmes, setProgrammes] = useState<{ id: string; name: string }[]>([]);
  const [entities, setEntities] = useState<{ id: string; name: string }[]>([]);
  const [provinces, setProvinces] = useState<string[]>([]);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    async function load() {
      const [pRes, eRes] = await Promise.all([
        supabase.from('programmes').select('id, name').eq('is_deleted', false).order('name'),
        supabase.from('entities').select('id, name, province').eq('is_deleted', false).order('name'),
      ]);
      setProgrammes(pRes.data ?? []);
      setEntities(eRes.data ?? []);
      const provs = [...new Set((eRes.data ?? []).map(e => e.province).filter(Boolean))].sort();
      setProvinces(provs);
    }
    load();
  }, []);

  const activeCount = Object.values(filters).filter(Boolean).length;

  function update(key: keyof FilterState, value: string) {
    onChange({ ...filters, [key]: value });
  }

  function clear() {
    onChange({ ...DEFAULT_FILTERS });
  }

  return (
    <div className="card">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Filter size={15} className="text-gray-400" />
          <span className="text-sm font-medium text-gray-700">Filters</span>
          {activeCount > 0 && (
            <span className="inline-flex items-center rounded-full bg-brand-100 text-brand-700 px-2 py-0.5 text-xs font-medium">
              {activeCount}
            </span>
          )}
        </div>
        {activeCount > 0 && (
          <button
            onClick={(e) => { e.stopPropagation(); clear(); }}
            className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"
          >
            <X size={12} /> Clear
          </button>
        )}
      </button>

      {expanded && (
        <div className="px-4 pb-4 pt-1 border-t border-gray-100 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div>
            <label className="text-[11px] text-gray-500 mb-1 block">Programme</label>
            <select value={filters.programme_id} onChange={e => update('programme_id', e.target.value)} className="input-field py-1.5 text-xs">
              <option value="">All</option>
              {programmes.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[11px] text-gray-500 mb-1 block">Province</label>
            <select value={filters.province} onChange={e => update('province', e.target.value)} className="input-field py-1.5 text-xs">
              <option value="">All</option>
              {provinces.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          {showEntity && (
            <div>
              <label className="text-[11px] text-gray-500 mb-1 block">Entity</label>
              <select value={filters.entity_id} onChange={e => update('entity_id', e.target.value)} className="input-field py-1.5 text-xs">
                <option value="">All</option>
                {entities.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </div>
          )}
          {showPillar && (
            <div>
              <label className="text-[11px] text-gray-500 mb-1 block">Pillar</label>
              <select value={filters.pillar} onChange={e => update('pillar', e.target.value)} className="input-field py-1.5 text-xs">
                <option value="">All</option>
                <option value="economic">Economic</option>
                <option value="social">Social</option>
                <option value="environmental">Environmental</option>
                <option value="institutional">Institutional</option>
              </select>
            </div>
          )}
          {showDate && (
            <>
              <div>
                <label className="text-[11px] text-gray-500 mb-1 block">From</label>
                <input type="date" value={filters.date_from} onChange={e => update('date_from', e.target.value)} className="input-field py-1.5 text-xs" />
              </div>
              <div>
                <label className="text-[11px] text-gray-500 mb-1 block">To</label>
                <input type="date" value={filters.date_to} onChange={e => update('date_to', e.target.value)} className="input-field py-1.5 text-xs" />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export { DEFAULT_FILTERS };
