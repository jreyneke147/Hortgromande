import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../lib/supabase';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

interface EntityOption {
  id: string;
  name: string;
  code: string;
}

interface ProductionRow {
  indicatorName: string;
  indicatorCode: string;
  unit: string;
  totalValue: number;
  submissionsCount: number;
}

interface SubmissionItemRow {
  value: number;
  indicators: {
    name: string;
    code: string;
    unit: string;
    pillar: string;
  } | null;
}

export default function ProductionSummary() {
  const [entities, setEntities] = useState<EntityOption[]>([]);
  const [selectedEntityId, setSelectedEntityId] = useState('');
  const [items, setItems] = useState<SubmissionItemRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingSummary, setLoadingSummary] = useState(false);

  useEffect(() => {
    async function loadEntities() {
      const { data } = await supabase
        .from('projects')
        .select('id, name, code')
        .eq('is_deleted', false)
        .order('name');

      const entityList = (data ?? []) as EntityOption[];
      setEntities(entityList);
      setSelectedEntityId(entityList[0]?.id ?? '');
      setLoading(false);
    }

    loadEntities();
  }, []);

  useEffect(() => {
    async function loadSummary() {
      if (!selectedEntityId) {
        setItems([]);
        return;
      }

      setLoadingSummary(true);
      const { data } = await supabase
        .from('submission_items')
        .select('value, indicators(name, code, unit, pillar), submissions!inner(project_id)')
        .eq('submissions.project_id', selectedEntityId)
        .eq('submissions.is_deleted', false);

      setItems((data ?? []) as unknown as SubmissionItemRow[]);
      setLoadingSummary(false);
    }

    loadSummary();
  }, [selectedEntityId]);

  const summaryRows = useMemo<ProductionRow[]>(() => {
    const production = items.filter(item => item.indicators?.pillar === 'production' && item.indicators?.code);
    const map = new Map<string, ProductionRow>();

    production.forEach(item => {
      const indicator = item.indicators;
      if (!indicator) return;

      const existing = map.get(indicator.code);
      if (existing) {
        existing.totalValue += item.value ?? 0;
        existing.submissionsCount += 1;
      } else {
        map.set(indicator.code, {
          indicatorName: indicator.name,
          indicatorCode: indicator.code,
          unit: indicator.unit,
          totalValue: item.value ?? 0,
          submissionsCount: 1,
        });
      }
    });

    return Array.from(map.values()).sort((a, b) => a.indicatorCode.localeCompare(b.indicatorCode));
  }, [items]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Production Summary</h1>
        <p className="text-sm text-gray-500 mt-1">Select an entity to view production totals from collected submissions.</p>
      </div>

      <div className="card p-4 space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Entity</label>
          <select
            value={selectedEntityId}
            onChange={(e) => setSelectedEntityId(e.target.value)}
            className="input-field w-80 max-w-full"
          >
            <option value="">Select entity...</option>
            {entities.map(entity => (
              <option key={entity.id} value={entity.id}>{entity.name} ({entity.code})</option>
            ))}
          </select>
        </div>

        {!selectedEntityId ? (
          <p className="text-sm text-gray-500">Please select an entity to display production information.</p>
        ) : loadingSummary ? (
          <LoadingSpinner />
        ) : summaryRows.length === 0 ? (
          <p className="text-sm text-gray-500">No production indicators found for the selected entity yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Indicator</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Code</th>
                  <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Value</th>
                  <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Source Rows</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {summaryRows.map(row => (
                  <tr key={row.indicatorCode}>
                    <td className="px-4 py-2.5 text-gray-900 font-medium">{row.indicatorName}</td>
                    <td className="px-4 py-2.5 text-gray-600 font-mono text-xs">{row.indicatorCode}</td>
                    <td className="px-4 py-2.5 text-right text-gray-900">{row.totalValue.toLocaleString()} {row.unit}</td>
                    <td className="px-4 py-2.5 text-right text-gray-600">{row.submissionsCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
