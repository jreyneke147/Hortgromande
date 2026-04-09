import { useState, useEffect } from 'react';
import { Wand2, Save, Check } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import {
  COMMERCIAL_SYSTEM_FIELDS,
  COMMERCIAL_AUTO_MATCH,
} from '../../types/commercial';
import Modal from '../../components/ui/Modal';

interface Props {
  batchId: string;
  sourceColumns: string[];
  open: boolean;
  onClose: () => void;
  onApplied: () => void;
}

export default function CommercialFieldMapping({ batchId, sourceColumns, open, onClose, onApplied }: Props) {
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [saveName, setSaveName] = useState('');
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    if (open) {
      setMapping({});
      setSaveName('');
    }
  }, [open]);

  function autoDetect() {
    const detected: Record<string, string> = {};
    for (const col of sourceColumns) {
      for (const [sysField, regex] of Object.entries(COMMERCIAL_AUTO_MATCH)) {
        if (regex.test(col.trim()) && !Object.values(detected).includes(col)) {
          detected[sysField] = col;
          break;
        }
      }
    }
    setMapping(prev => ({ ...prev, ...detected }));
  }

  const requiredCount = COMMERCIAL_SYSTEM_FIELDS.filter(f => f.required).length;
  const mappedRequired = COMMERCIAL_SYSTEM_FIELDS.filter(f => f.required && mapping[f.key]).length;

  async function apply() {
    setApplying(true);
    try {
      if (saveName.trim()) {
        await supabase.from('source_field_mappings').insert({
          entity_type: 'commercial',
          mapping_name: saveName.trim(),
          field_mapping: mapping,
        });
      }

      const { data: rows } = await supabase
        .from('staging_commercial_rows')
        .select('id, raw_data')
        .eq('import_batch_id', batchId);

      if (rows) {
        for (const row of rows) {
          const raw = row.raw_data as Record<string, string>;
          const mapped: Record<string, string> = {};
          for (const [sysField, srcCol] of Object.entries(mapping)) {
            if (srcCol && raw[srcCol] !== undefined) {
              mapped[sysField] = raw[srcCol];
            }
          }
          await supabase.from('staging_commercial_rows').update({ mapped_data: mapped }).eq('id', row.id);
        }
      }

      await supabase.from('import_batches').update({ status: 'mapped' }).eq('id', batchId);
      onApplied();
      onClose();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Mapping failed');
    } finally {
      setApplying(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Map Source Columns" size="lg">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500">
            Map source columns to system fields. <span className="font-medium text-gray-700">{mappedRequired}/{requiredCount}</span> required fields mapped.
          </p>
          <button onClick={autoDetect} className="btn-secondary text-xs flex items-center gap-1.5 py-1.5">
            <Wand2 size={13} /> Auto-Detect
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 max-h-[45vh] overflow-y-auto pr-1">
          {COMMERCIAL_SYSTEM_FIELDS.map(field => (
            <div key={field.key} className="flex items-center gap-3">
              <div className="w-48 flex-shrink-0">
                <span className={`text-sm ${field.required ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
                  {field.label}
                  {field.required && <span className="text-red-500 ml-0.5">*</span>}
                </span>
              </div>
              <div className="flex-1 relative">
                <select
                  value={mapping[field.key] ?? ''}
                  onChange={e => setMapping(prev => ({ ...prev, [field.key]: e.target.value }))}
                  className="input-field text-sm py-1.5"
                >
                  <option value="">-- Select source column --</option>
                  {sourceColumns.map(col => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>
                {mapping[field.key] && (
                  <Check size={13} className="absolute right-8 top-1/2 -translate-y-1/2 text-emerald-500" />
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-200 pt-4">
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className="label-text">Save mapping as (optional)</label>
              <input
                type="text"
                value={saveName}
                onChange={e => setSaveName(e.target.value)}
                className="input-field text-sm"
                placeholder="e.g. Mistico Standard Layout"
              />
            </div>
            <div className="flex gap-2">
              <button onClick={onClose} className="btn-secondary text-sm">Cancel</button>
              <button
                onClick={apply}
                disabled={applying || mappedRequired < requiredCount}
                className="btn-primary text-sm flex items-center gap-2 disabled:opacity-50"
              >
                {applying ? 'Applying...' : <><Save size={14} /> Apply Mapping</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
