import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Ship, Package, DollarSign, FileText } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { supabase } from '../../lib/supabase';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import StatusBadge from '../../components/ui/StatusBadge';

interface ShipmentRow {
  id: string;
  vessel: string;
  container_number: string;
  sailing_week: number;
  sailing_year: number;
  status: string;
  departure_date: string | null;
  arrival_date: string | null;
  markets?: { name: string };
  vendors?: { name: string };
}

interface ConsignmentRow {
  id: string;
  consignment_number: string;
  puc: string;
  commodity: string;
  variety: string;
  pack: string;
  barcode: string;
  num_cartons: number;
  advance_per_carton: number;
  total_advance: number;
  nett_per_carton: number;
  total_nett: number;
}

const PIE_COLORS = ['#16a34a', '#0ea5e9', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

export default function ShipmentDetail() {
  const { id } = useParams<{ id: string }>();
  const [shipment, setShipment] = useState<ShipmentRow | null>(null);
  const [consignments, setConsignments] = useState<ConsignmentRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [sRes, cRes] = await Promise.all([
        supabase.from('shipments').select('id, vessel, container_number, sailing_week, sailing_year, status, departure_date, arrival_date, markets(name), vendors(name)').eq('id', id!).maybeSingle(),
        supabase.from('consignments').select('id, consignment_number, puc, commodity, variety, pack, barcode, num_cartons, advance_per_carton, total_advance, nett_per_carton, total_nett').eq('shipment_id', id!).order('consignment_number'),
      ]);
      setShipment(sRes.data as unknown as ShipmentRow | null);
      setConsignments((cRes.data ?? []) as unknown as ConsignmentRow[]);
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (!shipment) return <div className="p-8 text-center text-gray-500">Shipment not found</div>;

  const totalCartons = consignments.reduce((s, c) => s + c.num_cartons, 0);
  const totalNett = consignments.reduce((s, c) => s + c.total_nett, 0);
  const totalAdvance = consignments.reduce((s, c) => s + c.total_advance, 0);

  const commodityMap: Record<string, number> = {};
  consignments.forEach(c => { commodityMap[c.commodity] = (commodityMap[c.commodity] ?? 0) + c.num_cartons; });
  const commodityData = Object.entries(commodityMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

  const varietyMap: Record<string, number> = {};
  consignments.forEach(c => { varietyMap[c.variety || 'Unknown'] = (varietyMap[c.variety || 'Unknown'] ?? 0) + c.num_cartons; });
  const varietyData = Object.entries(varietyMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 8);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link to="/commercial/consignments" className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">{shipment.vessel || 'Unknown Vessel'}</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Container {shipment.container_number || '-'} &middot; Week {shipment.sailing_week}, {shipment.sailing_year}
          </p>
        </div>
        <StatusBadge status={shipment.status} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total Cartons', value: totalCartons.toLocaleString(), icon: Package, color: 'bg-brand-50 text-brand-700' },
          { label: 'Total Nett', value: `R ${totalNett.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, icon: DollarSign, color: 'bg-emerald-50 text-emerald-700' },
          { label: 'Total Advance', value: `R ${totalAdvance.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, icon: DollarSign, color: 'bg-amber-50 text-amber-700' },
          { label: 'Consignments', value: consignments.length.toString(), icon: FileText, color: 'bg-blue-50 text-blue-700' },
        ].map(k => (
          <div key={k.label} className="card p-4">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${k.color}`}>
              <k.icon size={16} />
            </div>
            <p className="text-lg font-bold text-gray-900">{k.value}</p>
            <p className="text-xs text-gray-500">{k.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Shipment Details</h3>
          <div className="space-y-2.5 text-sm">
            {[
              ['Vessel', shipment.vessel || '-'],
              ['Container', shipment.container_number || '-'],
              ['Market', (shipment.markets as { name: string } | undefined)?.name ?? '-'],
              ['Vendor', (shipment.vendors as { name: string } | undefined)?.name ?? '-'],
              ['Sailing Week', `Week ${shipment.sailing_week}, ${shipment.sailing_year}`],
              ['Departure', shipment.departure_date ? new Date(shipment.departure_date).toLocaleDateString('en-ZA') : '-'],
              ['Arrival', shipment.arrival_date ? new Date(shipment.arrival_date).toLocaleDateString('en-ZA') : '-'],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-gray-500">{label}</span>
                <span className="font-medium text-gray-900">{value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Cartons by Commodity</h3>
          {commodityData.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No data</p>
          ) : (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={commodityData} margin={{ top: 5, right: 5, bottom: 5, left: -10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }} />
                  <Bar dataKey="value" fill="#16a34a" radius={[4, 4, 0, 0]} barSize={32} name="Cartons" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Variety Distribution</h3>
          {varietyData.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No data</p>
          ) : (
            <>
              <div className="h-36">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={varietyData} cx="50%" cy="50%" innerRadius={35} outerRadius={55} paddingAngle={2} dataKey="value">
                      {varietyData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-x-3 gap-y-1 justify-center mt-2">
                {varietyData.map((v, i) => (
                  <span key={v.name} className="flex items-center gap-1 text-[10px] text-gray-600">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                    {v.name}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Ship size={15} className="text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-900">Consignments ({consignments.length})</h3>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/50">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-2.5">Consignment #</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-2.5">PUC</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-2.5">Commodity</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-2.5">Variety</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-2.5">Pack</th>
                <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-2.5">Cartons</th>
                <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-2.5">Advance</th>
                <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-2.5">Nett/Ctn</th>
                <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-2.5">Total Nett</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {consignments.map(c => (
                <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-2.5 text-sm font-medium text-gray-900">{c.consignment_number}</td>
                  <td className="px-4 py-2.5 text-sm text-gray-600">{c.puc}</td>
                  <td className="px-4 py-2.5 text-sm text-gray-700">{c.commodity}</td>
                  <td className="px-4 py-2.5 text-sm text-gray-700">{c.variety}</td>
                  <td className="px-4 py-2.5 text-sm text-gray-600">{c.pack || '-'}</td>
                  <td className="px-4 py-2.5 text-sm font-medium text-gray-900 text-right tabular-nums">{c.num_cartons.toLocaleString()}</td>
                  <td className="px-4 py-2.5 text-sm text-gray-600 text-right tabular-nums">R {c.total_advance.toFixed(2)}</td>
                  <td className="px-4 py-2.5 text-sm text-gray-600 text-right tabular-nums">R {c.nett_per_carton.toFixed(2)}</td>
                  <td className="px-4 py-2.5 text-sm font-medium text-gray-900 text-right tabular-nums">R {c.total_nett.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
