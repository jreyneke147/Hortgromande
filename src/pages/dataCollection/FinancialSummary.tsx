import { useMemo, useState } from 'react';
import { FINANCIAL_MONTHS, FINANCIAL_RECON_ENTITIES } from '../../data/financialRecon';

const currencyFormatter = new Intl.NumberFormat('en-ZA', {
  style: 'currency',
  currency: 'ZAR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatCurrency(value: number) {
  return currencyFormatter.format(value).replace('ZAR', 'R').trim();
}

export default function FinancialSummary() {
  const [selectedEntityId, setSelectedEntityId] = useState(FINANCIAL_RECON_ENTITIES[0]?.id ?? '');

  const selectedEntity = useMemo(
    () => FINANCIAL_RECON_ENTITIES.find(entity => entity.id === selectedEntityId),
    [selectedEntityId],
  );

  const summary = useMemo(() => {
    if (!selectedEntity) return { income: 0, expense: 0, net: 0 };

    const income = selectedEntity.rows
      .filter(row => row.incomeExpense === 'Inkomste')
      .reduce((sum, row) => sum + row.grandTotal, 0);

    const expense = selectedEntity.rows
      .filter(row => row.incomeExpense === 'Uitgawe')
      .reduce((sum, row) => sum + row.grandTotal, 0);

    return { income, expense, net: income - expense };
  }, [selectedEntity]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Financial Summary</h1>
        <p className="text-sm text-gray-500 mt-1">Shows totals for the currently selected entity while listing all added entities in the selector.</p>
      </div>

      <div className="card p-4 space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Entity</label>
          <select
            value={selectedEntityId}
            onChange={(e) => setSelectedEntityId(e.target.value)}
            className="input-field w-80 max-w-full"
          >
            {FINANCIAL_RECON_ENTITIES.map(entity => (
              <option key={entity.id} value={entity.id}>{entity.name}</option>
            ))}
          </select>
        </div>

        {!selectedEntity ? (
          <p className="text-sm text-gray-500">Please select an entity to display financial information.</p>
        ) : (
          <>
            <p className="text-xs text-gray-500">Period: {selectedEntity.periodLabel}</p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="card p-4">
                <p className="text-xs text-gray-500">Total Inkomste</p>
                <p className="text-xl font-semibold text-emerald-700">{formatCurrency(summary.income)}</p>
              </div>
              <div className="card p-4">
                <p className="text-xs text-gray-500">Total Uitgawe</p>
                <p className="text-xl font-semibold text-red-700">{formatCurrency(summary.expense)}</p>
              </div>
              <div className="card p-4">
                <p className="text-xs text-gray-500">Net Position</p>
                <p className={`text-xl font-semibold ${summary.net >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                  {formatCurrency(summary.net)}
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                    {FINANCIAL_MONTHS.map(month => (
                      <th key={month} className="text-right px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">{month}</th>
                    ))}
                    <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Grand Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {['Inkomste', 'Uitgawe'].map(type => {
                    const monthTotals = Object.fromEntries(FINANCIAL_MONTHS.map(month => [month, 0])) as Record<(typeof FINANCIAL_MONTHS)[number], number>;
                    const rows = selectedEntity.rows.filter(row => row.incomeExpense === type);
                    rows.forEach(row => {
                      FINANCIAL_MONTHS.forEach(month => {
                        monthTotals[month] += row.amounts[month] ?? 0;
                      });
                    });
                    const grandTotal = rows.reduce((sum, row) => sum + row.grandTotal, 0);

                    return (
                      <tr key={type}>
                        <td className="px-4 py-2.5 font-medium text-gray-900">{type}</td>
                        {FINANCIAL_MONTHS.map(month => (
                          <td key={month} className="px-4 py-2.5 text-right text-gray-700">{formatCurrency(monthTotals[month])}</td>
                        ))}
                        <td className="px-4 py-2.5 text-right font-semibold text-gray-900">{formatCurrency(grandTotal)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
