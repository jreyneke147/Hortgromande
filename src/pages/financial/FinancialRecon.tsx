import { useMemo, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { FINANCIAL_MONTHS, FINANCIAL_RECON_ENTITIES, type FinancialMonth, type FinancialReconEntity } from '../../data/financialRecon';

const currencyFormatter = new Intl.NumberFormat('en-ZA', {
  style: 'currency',
  currency: 'ZAR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatCurrency(value: number | undefined) {
  if (value == null) return '—';
  return currencyFormatter.format(value).replace('ZAR', 'R').trim();
}

function cloneEntities() {
  return FINANCIAL_RECON_ENTITIES.map(entity => ({
    ...entity,
    rows: entity.rows.map(row => ({
      ...row,
      amounts: { ...row.amounts },
    })),
  }));
}

export default function FinancialRecon() {
  const { role } = useAuth();
  const [entities, setEntities] = useState<FinancialReconEntity[]>(() => cloneEntities());
  const [selectedEntityId, setSelectedEntityId] = useState(entities[0]?.id ?? '');

  const isAdmin = useMemo(() => {
    if (!role) return false;
    const roleName = role.name?.toLowerCase() ?? '';
    const displayName = role.display_name?.toLowerCase() ?? '';
    return roleName.includes('admin') || displayName.includes('admin');
  }, [role]);

  const selectedEntity = useMemo(
    () => entities.find(entity => entity.id === selectedEntityId) ?? entities[0],
    [entities, selectedEntityId],
  );

  const totals = useMemo(() => {
    const seed = {
      Inkomste: { grandTotal: 0, months: Object.fromEntries(FINANCIAL_MONTHS.map(month => [month, 0])) as Record<(typeof FINANCIAL_MONTHS)[number], number> },
      Uitgawe: { grandTotal: 0, months: Object.fromEntries(FINANCIAL_MONTHS.map(month => [month, 0])) as Record<(typeof FINANCIAL_MONTHS)[number], number> },
    };

    if (!selectedEntity) return seed;

    for (const row of selectedEntity.rows) {
      seed[row.incomeExpense].grandTotal += row.grandTotal;
      for (const month of FINANCIAL_MONTHS) {
        seed[row.incomeExpense].months[month] += row.amounts[month] ?? 0;
      }
    }

    return seed;
  }, [selectedEntity]);

  function updateTextField(rowIndex: number, field: 'creditor' | 'details', value: string) {
    if (!selectedEntity || !isAdmin) return;

    setEntities(prev => prev.map(entity => {
      if (entity.id !== selectedEntity.id) return entity;

      return {
        ...entity,
        rows: entity.rows.map((row, idx) => (idx === rowIndex ? { ...row, [field]: value } : row)),
      };
    }));
  }

  function updateAmount(rowIndex: number, month: FinancialMonth, value: string) {
    if (!selectedEntity || !isAdmin) return;

    setEntities(prev => prev.map(entity => {
      if (entity.id !== selectedEntity.id) return entity;

      return {
        ...entity,
        rows: entity.rows.map((row, idx) => {
          if (idx !== rowIndex) return row;

          const nextAmounts = { ...row.amounts };
          const parsed = Number(value);

          if (value.trim() === '' || Number.isNaN(parsed)) {
            delete nextAmounts[month];
          } else {
            nextAmounts[month] = parsed;
          }

          const nextGrandTotal = FINANCIAL_MONTHS.reduce((sum, currentMonth) => sum + (nextAmounts[currentMonth] ?? 0), 0);

          return {
            ...row,
            amounts: nextAmounts,
            grandTotal: nextGrandTotal,
          };
        }),
      };
    }));
  }

  if (!selectedEntity) {
    return <p className="text-sm text-gray-500">No financial recon entities loaded.</p>;
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Financial Reconciliation</h1>
        <p className="text-sm text-gray-500 mt-1">Store and display reconciliation data for multiple entities, filtered by selected entity.</p>
      </div>

      <div className="card p-4 space-y-4">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Entity</label>
            <select
              value={selectedEntityId}
              onChange={e => setSelectedEntityId(e.target.value)}
              className="input-field w-80 max-w-full"
            >
              {entities.map(entity => (
                <option key={entity.id} value={entity.id}>{entity.name}</option>
              ))}
            </select>
          </div>
          <p className="text-xs text-gray-500 pb-1">Period: {selectedEntity.periodLabel}</p>
          <p className="text-xs text-gray-500 pb-1">{isAdmin ? 'Admin edit mode enabled' : 'Read-only view (admin users can edit)'}</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Inkomste/Uitgawe</th>
                <th className="text-left">Krediteur</th>
                <th className="text-left">Besonderhede</th>
                {FINANCIAL_MONTHS.map(month => (
                  <th key={month} className="text-right">{month}</th>
                ))}
                <th className="text-right">Grand Total</th>
              </tr>
            </thead>
            <tbody>
              {selectedEntity.rows.map((row, idx) => (
                <tr key={`${row.incomeExpense}-${row.creditor}-${idx}`} className="border-b">
                  <td className="py-2">{row.incomeExpense}</td>
                  <td>
                    {isAdmin ? (
                      <input
                        type="text"
                        value={row.creditor}
                        onChange={e => updateTextField(idx, 'creditor', e.target.value)}
                        className="input-field h-8 min-w-36"
                      />
                    ) : (row.creditor || '—')}
                  </td>
                  <td>
                    {isAdmin ? (
                      <input
                        type="text"
                        value={row.details}
                        onChange={e => updateTextField(idx, 'details', e.target.value)}
                        className="input-field h-8 min-w-40"
                      />
                    ) : row.details}
                  </td>
                  {FINANCIAL_MONTHS.map(month => (
                    <td key={month} className="text-right">
                      {isAdmin ? (
                        <input
                          type="number"
                          step="0.01"
                          value={row.amounts[month] ?? ''}
                          onChange={e => updateAmount(idx, month, e.target.value)}
                          className="input-field h-8 w-28 text-right"
                        />
                      ) : formatCurrency(row.amounts[month])}
                    </td>
                  ))}
                  <td className="text-right font-medium">{formatCurrency(row.grandTotal)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50 border-t">
                <td className="py-2 font-semibold">Inkomste Total</td>
                <td />
                <td />
                {FINANCIAL_MONTHS.map(month => (
                  <td key={month} className="text-right font-semibold">{formatCurrency(totals.Inkomste.months[month])}</td>
                ))}
                <td className="text-right font-semibold">{formatCurrency(totals.Inkomste.grandTotal)}</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="py-2 font-semibold">Uitgawe Total</td>
                <td />
                <td />
                {FINANCIAL_MONTHS.map(month => (
                  <td key={month} className="text-right font-semibold">{formatCurrency(totals.Uitgawe.months[month])}</td>
                ))}
                <td className="text-right font-semibold">{formatCurrency(totals.Uitgawe.grandTotal)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
