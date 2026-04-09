import { useMemo, useState } from 'react';
import { FINANCIAL_MONTHS, FINANCIAL_RECON_ENTITIES } from '../../data/financialRecon';

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

export default function FinancialRecon() {
  const [selectedEntityId, setSelectedEntityId] = useState(FINANCIAL_RECON_ENTITIES[0]?.id ?? '');

  const selectedEntity = useMemo(
    () => FINANCIAL_RECON_ENTITIES.find(entity => entity.id === selectedEntityId) ?? FINANCIAL_RECON_ENTITIES[0],
    [selectedEntityId],
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
              {FINANCIAL_RECON_ENTITIES.map(entity => (
                <option key={entity.id} value={entity.id}>{entity.name}</option>
              ))}
            </select>
          </div>
          <p className="text-xs text-gray-500 pb-1">Period: {selectedEntity.periodLabel}</p>
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
                  <td>{row.creditor || '—'}</td>
                  <td>{row.details}</td>
                  {FINANCIAL_MONTHS.map(month => (
                    <td key={month} className="text-right">{formatCurrency(row.amounts[month])}</td>
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
