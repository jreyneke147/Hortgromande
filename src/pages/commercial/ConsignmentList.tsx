import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Package, Filter } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';

interface ConsignmentRow {
  id: string;
  consignment_number: string;
  commodity: string;
  variety: string;
  puc: string;
  num_cartons: number;
  nett_per_carton: number;
  total_nett: number;
  shipment_id: string | null;
  shipments?: {
    vessel: string;
    container_number: string;
    markets?: { name: string };
  };
}

export default function ConsignmentList() {
  const [consignments, setConsignments] = useState<ConsignmentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [commodityFilter, setCommodityFilter] = useState('');
  const [marketFilter, setMarketFilter] = useState('');
  const [commodities, setCommodities] = useState<string[]>([]);
  const [markets, setMarkets] = useState<string[]>([]);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('consignments')
        .select('id, consignment_number, commodity, variety, puc, num_cartons, nett_per_carton, total_nett, shipment_id, shipments(vessel, container_number, markets(name))')
        .order('created_at', { ascending: false })
        .limit(200);

      const rows = (data ?? []) as unknown as ConsignmentRow[];
      setConsignments(rows);

      const comms = [...new Set(rows.map(r => r.commodity).filter(Boolean))].sort();
      setCommodities(comms);

      const mkts = [...new Set(rows.map(r => r.shipments?.markets?.name).filter(Boolean) as string[])].sort();
      setMarkets(mkts);

      setLoading(false);
    }
    load();
  }, []);

  const filtered = consignments.filter(c => {
    if (commodityFilter && c.commodity !== commodityFilter) return false;
    if (marketFilter && c.shipments?.markets?.name !== marketFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        c.consignment_number?.toLowerCase().includes(q) ||
        c.puc?.toLowerCase().includes(q) ||
        c.commodity?.toLowerCase().includes(q) ||
        c.variety?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Consignments</h1>
        <p className="text-sm text-gray-500 mt-1">{consignments.length} consignment records</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search consignment, PUC, commodity, variety..."
            className="input-field pl-9 text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-gray-400" />
          <select value={commodityFilter} onChange={e => setCommodityFilter(e.target.value)} className="input-field w-auto py-1.5 text-xs">
            <option value="">All commodities</option>
            {commodities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={marketFilter} onChange={e => setMarketFilter(e.target.value)} className="input-field w-auto py-1.5 text-xs">
            <option value="">All markets</option>
            {markets.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Package size={40} />}
          title={consignments.length === 0 ? 'No consignments yet' : 'No matches'}
          description={consignments.length === 0 ? 'Consignment records will appear here after publishing commercial imports.' : 'Try adjusting your search or filters.'}
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/50">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-2.5">Consignment #</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-2.5">Commodity / Variety</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-2.5">PUC</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-2.5">Vessel / Container</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-2.5">Market</th>
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-2.5">Cartons</th>
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-2.5">Nett/Ctn</th>
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-2.5">Total Nett</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-2.5 text-sm font-medium text-brand-700">
                      {c.shipment_id ? (
                        <Link to={`/commercial/shipments/${c.shipment_id}`} className="hover:underline">{c.consignment_number}</Link>
                      ) : c.consignment_number}
                    </td>
                    <td className="px-4 py-2.5 text-sm text-gray-700">{c.commodity}{c.variety ? ` / ${c.variety}` : ''}</td>
                    <td className="px-4 py-2.5 text-sm text-gray-600">{c.puc}</td>
                    <td className="px-4 py-2.5 text-sm text-gray-600">
                      {c.shipments?.vessel ?? '-'}{c.shipments?.container_number ? ` / ${c.shipments.container_number}` : ''}
                    </td>
                    <td className="px-4 py-2.5 text-sm text-gray-600">{c.shipments?.markets?.name ?? '-'}</td>
                    <td className="px-4 py-2.5 text-sm font-medium text-gray-900 text-right tabular-nums">{c.num_cartons.toLocaleString()}</td>
                    <td className="px-4 py-2.5 text-sm text-gray-600 text-right tabular-nums">R {c.nett_per_carton.toFixed(2)}</td>
                    <td className="px-4 py-2.5 text-sm font-medium text-gray-900 text-right tabular-nums">R {c.total_nett.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
