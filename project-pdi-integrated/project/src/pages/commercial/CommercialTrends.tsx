import { useEffect, useState } from 'react';
import {
  Package,
  DollarSign,
  Ship,
  Store,
  Users,
  TrendingUp,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { supabase } from '../../lib/supabase';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';

interface CommRow {
  season_year: number;
  sailing_week: number;
  market: string;
  vendor_name: string;
  commodity: string;
  variety: string;
  num_cartons: number;
  total_advance: number;
  total_nett: number;
}

const PIE_COLORS = ['#16a34a', '#0ea5e9', '#f59e0b', '#ef4444', '#14b8a6', '#ec4899', '#8b5cf6', '#f97316'];

export default function CommercialTrends() {
  const [records, setRecords] = useState<CommRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [yearFilter, setYearFilter] = useState('');
  const [years, setYears] = useState<number[]>([]);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('commercial_records')
        .select('season_year, sailing_week, market, vendor_name, commodity, variety, num_cartons, total_advance, total_nett')
        .order('season_year', { ascending: false });

      const rows = (data ?? []) as CommRow[];
      setRecords(rows);

      const yrs = [...new Set(rows.map(r => r.season_year))].sort((a, b) => b - a);
      setYears(yrs);
      if (yrs.length > 0 && !yearFilter) setYearFilter(String(yrs[0]));

      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <LoadingSpinner />;

  const filtered = yearFilter ? records.filter(r => r.season_year === Number(yearFilter)) : records;

  if (records.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Commercial Performance</h1>
          <p className="text-sm text-gray-500 mt-1">Export analytics and trend analysis</p>
        </div>
        <EmptyState
          icon={<TrendingUp size={40} />}
          title="No commercial data yet"
          description="Performance analytics will appear here after publishing commercial import data."
        />
      </div>
    );
  }

  const totalCartons = filtered.reduce((s, r) => s + r.num_cartons, 0);
  const totalNett = filtered.reduce((s, r) => s + r.total_nett, 0);
  const totalAdvance = filtered.reduce((s, r) => s + r.total_advance, 0);
  const uniqueMarkets = new Set(filtered.map(r => r.market));
  const uniqueVendors = new Set(filtered.map(r => r.vendor_name));
  const uniqueShipments = new Set(filtered.map(r => `${r.sailing_week}-${r.season_year}`));

  const weekMap: Record<number, { cartons: number; nett: number }> = {};
  filtered.forEach(r => {
    if (!weekMap[r.sailing_week]) weekMap[r.sailing_week] = { cartons: 0, nett: 0 };
    weekMap[r.sailing_week].cartons += r.num_cartons;
    weekMap[r.sailing_week].nett += r.total_nett;
  });
  const weekData = Object.entries(weekMap)
    .map(([week, d]) => ({ week: `W${week}`, cartons: d.cartons, nett: Math.round(d.nett) }))
    .sort((a, b) => Number(a.week.slice(1)) - Number(b.week.slice(1)));

  const marketMap: Record<string, { cartons: number; nett: number }> = {};
  filtered.forEach(r => {
    if (!marketMap[r.market]) marketMap[r.market] = { cartons: 0, nett: 0 };
    marketMap[r.market].cartons += r.num_cartons;
    marketMap[r.market].nett += r.total_nett;
  });
  const marketData = Object.entries(marketMap)
    .map(([name, d]) => ({ name, cartons: d.cartons, nett: Math.round(d.nett) }))
    .sort((a, b) => b.cartons - a.cartons)
    .slice(0, 10);

  const commodityMap: Record<string, number> = {};
  filtered.forEach(r => { commodityMap[r.commodity] = (commodityMap[r.commodity] ?? 0) + r.num_cartons; });
  const commodityData = Object.entries(commodityMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

  const vendorMap: Record<string, number> = {};
  filtered.forEach(r => { vendorMap[r.vendor_name] = (vendorMap[r.vendor_name] ?? 0) + r.num_cartons; });
  const vendorData = Object.entries(vendorMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 8);

  const varietyMap: Record<string, number> = {};
  filtered.forEach(r => { varietyMap[r.variety || 'Unknown'] = (varietyMap[r.variety || 'Unknown'] ?? 0) + r.num_cartons; });
  const varietyData = Object.entries(varietyMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 10);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Commercial Performance</h1>
          <p className="text-sm text-gray-500 mt-1">Export analytics and trend analysis</p>
        </div>
        <select value={yearFilter} onChange={e => setYearFilter(e.target.value)} className="input-field w-auto text-sm">
          <option value="">All Years</option>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {[
          { label: 'Total Cartons', value: totalCartons.toLocaleString(), icon: Package, color: 'bg-brand-50 text-brand-700' },
          { label: 'Total Nett', value: `R ${(totalNett / 1000).toFixed(0)}K`, icon: DollarSign, color: 'bg-emerald-50 text-emerald-700' },
          { label: 'Total Advance', value: `R ${(totalAdvance / 1000).toFixed(0)}K`, icon: DollarSign, color: 'bg-amber-50 text-amber-700' },
          { label: 'Shipment Weeks', value: uniqueShipments.size.toString(), icon: Ship, color: 'bg-sky-50 text-sky-700' },
          { label: 'Markets', value: uniqueMarkets.size.toString(), icon: Store, color: 'bg-teal-50 text-teal-700' },
          { label: 'Vendors', value: uniqueVendors.size.toString(), icon: Users, color: 'bg-blue-50 text-blue-700' },
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">Cartons by Week</h3>
          <p className="text-xs text-gray-500 mb-4">Weekly export volume</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekData} margin={{ top: 5, right: 5, bottom: 5, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }} />
                <Bar dataKey="cartons" fill="#16a34a" radius={[4, 4, 0, 0]} barSize={18} name="Cartons" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">Nett Value by Week</h3>
          <p className="text-xs text-gray-500 mb-4">Weekly nett payment trend</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weekData} margin={{ top: 5, right: 5, bottom: 5, left: -10 }}>
                <defs>
                  <linearGradient id="nettGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }} formatter={(v) => `R ${Number(v ?? 0).toLocaleString()}`} />
                <Area type="monotone" dataKey="nett" stroke="#0ea5e9" strokeWidth={2} fill="url(#nettGrad)" name="Nett Value" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Market Performance</h3>
          <div className="space-y-2.5">
            {marketData.map(m => {
              const maxVal = Math.max(...marketData.map(d => d.cartons), 1);
              return (
                <div key={m.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600 truncate max-w-[120px]">{m.name}</span>
                    <span className="text-xs font-medium text-gray-900 tabular-nums">{m.cartons.toLocaleString()} ctns</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-400 rounded-full" style={{ width: `${(m.cartons / maxVal) * 100}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Commodity Distribution</h3>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={commodityData} cx="50%" cy="50%" innerRadius={35} outerRadius={60} paddingAngle={3} dataKey="value">
                  {commodityData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-1 justify-center mt-1">
            {commodityData.map((c, i) => (
              <span key={c.name} className="flex items-center gap-1 text-[10px] text-gray-600">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                {c.name}
              </span>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Top Vendors</h3>
          <div className="space-y-2.5">
            {vendorData.map((v, i) => (
              <div key={v.name} className="flex items-center gap-3 py-1">
                <span className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500">{i + 1}</span>
                <span className="text-xs text-gray-700 flex-1 truncate">{v.name}</span>
                <span className="text-xs font-medium text-gray-900 tabular-nums">{v.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Top Varieties by Volume</h3>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={varietyData} layout="vertical" margin={{ top: 0, right: 10, bottom: 0, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} width={100} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }} />
              <Bar dataKey="value" fill="#0ea5e9" radius={[0, 4, 4, 0]} barSize={16} name="Cartons" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
