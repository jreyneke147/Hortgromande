import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderKanban,
  Building2,
  BarChart3,
  ClipboardCheck,
  TrendingUp,
  ArrowUpRight,
  Activity,
  AlertCircle,
  CheckCircle2,
  Send,
  FileCheck,
  Clock,
  AlertTriangle,
  HeartPulse,
  AlertOctagon,
  Ship,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { supabase } from '../lib/supabase';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import StatusBadge from '../components/ui/StatusBadge';
import { PILLARS } from '../lib/pillars';
import { getPdiDashboardStats } from '../lib/pdi';
import type { IndicatorPillar } from '../types';

interface Stats {
  programmes: number;
  projects: number;
  entities: number;
  indicators: number;
  submissions: number;
  trainingSessions: number;
}

interface PendingSubmission {
  id: string;
  status: string;
  created_at: string;
  projects?: { name: string; code: string };
  reporting_periods?: { name: string };
}

interface PillarCount {
  pillar: IndicatorPillar;
  count: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({ programmes: 0, projects: 0, entities: 0, indicators: 0, submissions: 0, trainingSessions: 0 });
  const [submissionStatusData, setSubmissionStatusData] = useState<{ name: string; value: number; color: string }[]>([]);
  const [pendingQueue, setPendingQueue] = useState<PendingSubmission[]>([]);
  const [pillarCounts, setPillarCounts] = useState<PillarCount[]>([]);
  const [trendData, setTrendData] = useState<{ month: string; submissions: number; approved: number }[]>([]);
  const [riskAlerts, setRiskAlerts] = useState<{ id: string; title: string; severity: string; flagged_at: string }[]>([]);
  const [healthSummary, setHealthSummary] = useState({ green: 0, amber: 0, red: 0, avg: 0 });
  const [commercialStats, setCommercialStats] = useState({ consignments: 0, totalNett: 0, lastImport: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [pRes, prRes, eRes, iRes, sRes, tRes] = await Promise.all([
        supabase.from('programmes').select('id', { count: 'exact', head: true }).eq('is_deleted', false),
        supabase.from('projects').select('id', { count: 'exact', head: true }).eq('is_deleted', false),
        supabase.from('entities').select('id', { count: 'exact', head: true }).eq('is_deleted', false),
        supabase.from('indicators').select('id', { count: 'exact', head: true }).eq('is_deleted', false),
        supabase.from('submissions').select('id', { count: 'exact', head: true }).eq('is_deleted', false),
        supabase.from('training_sessions').select('id', { count: 'exact', head: true }).eq('is_deleted', false),
      ]);

      const hasDbCoreData = [pRes.count, prRes.count, eRes.count, iRes.count].some(count => (count ?? 0) > 0);

      if (!hasDbCoreData) {
        const fallback = getPdiDashboardStats();
        setStats(fallback.stats);
        setSubmissionStatusData(fallback.submissionStatusData);
        setPendingQueue(fallback.pendingQueue);
        setPillarCounts(PILLARS.map(p => ({ pillar: p.key, count: fallback.pillarCounts.find(item => item.pillar === p.key)?.count ?? 0 })));
        setTrendData(fallback.trendData);
        setRiskAlerts(fallback.riskAlerts);
        setHealthSummary(fallback.healthSummary);
        setCommercialStats(fallback.commercialStats);
        setLoading(false);
        return;
      }

      setStats({
        programmes: pRes.count ?? 0,
        projects: prRes.count ?? 0,
        entities: eRes.count ?? 0,
        indicators: iRes.count ?? 0,
        submissions: sRes.count ?? 0,
        trainingSessions: tRes.count ?? 0,
      });

      const { data: allSubs } = await supabase.from('submissions').select('id, status, created_at').eq('is_deleted', false);
      if (allSubs) {
        const counts: Record<string, number> = {};
        allSubs.forEach(s => { counts[s.status] = (counts[s.status] ?? 0) + 1; });
        const statusColors: Record<string, string> = {
          draft: '#9ca3af',
          submitted: '#3b82f6',
          validated: '#f59e0b',
          rejected: '#ef4444',
          approved: '#10b981',
        };
        setSubmissionStatusData(
          Object.entries(counts).map(([name, value]) => ({
            name: name.charAt(0).toUpperCase() + name.slice(1),
            value,
            color: statusColors[name] ?? '#6b7280',
          }))
        );

        const monthMap: Record<string, { submissions: number; approved: number }> = {};
        allSubs.forEach(s => {
          const d = new Date(s.created_at);
          const key = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
          if (!monthMap[key]) monthMap[key] = { submissions: 0, approved: 0 };
          monthMap[key].submissions++;
          if (s.status === 'approved') monthMap[key].approved++;
        });
        const trend = Object.entries(monthMap)
          .map(([month, d]) => ({ month, ...d }))
          .slice(-9);
        setTrendData(trend);
      }

      const { data: pendingSubs } = await supabase
        .from('submissions')
        .select('id, status, created_at, projects(name, code), reporting_periods(name)')
        .eq('is_deleted', false)
        .in('status', ['submitted', 'validated'])
        .order('created_at', { ascending: false })
        .limit(8);
      setPendingQueue((pendingSubs ?? []) as unknown as PendingSubmission[]);

      const { data: indData } = await supabase.from('indicators').select('pillar').eq('is_deleted', false);
      if (indData) {
        const pillarMap: Record<string, number> = {};
        indData.forEach(i => { pillarMap[i.pillar] = (pillarMap[i.pillar] ?? 0) + 1; });
        setPillarCounts(PILLARS.map(p => ({ pillar: p.key, count: pillarMap[p.key] ?? 0 })));
      }

      const { data: riskData } = await supabase
        .from('risk_flags')
        .select('id, title, severity, flagged_at')
        .eq('status', 'open')
        .order('flagged_at', { ascending: false })
        .limit(5);
      setRiskAlerts((riskData ?? []) as { id: string; title: string; severity: string; flagged_at: string }[]);

      const { data: hsData } = await supabase
        .from('health_scores')
        .select('overall_score, status')
        .eq('entity_type', 'project');
      const hs = hsData ?? [];
      setHealthSummary({
        green: hs.filter(h => h.status === 'green').length,
        amber: hs.filter(h => h.status === 'amber').length,
        red: hs.filter(h => h.status === 'red').length,
        avg: hs.length > 0 ? Math.round(hs.reduce((s, h) => s + Number(h.overall_score), 0) / hs.length) : 0,
      });

      const { count: consCount } = await supabase.from('consignments').select('id', { count: 'exact', head: true });
      const { data: crData } = await supabase.from('commercial_records').select('total_nett');
      const crNett = (crData ?? []).reduce((s, r) => s + (Number(r.total_nett) || 0), 0);
      const { data: lastBatch } = await supabase.from('import_batches').select('created_at').eq('status', 'published').order('created_at', { ascending: false }).limit(1);
      setCommercialStats({ consignments: consCount ?? 0, totalNett: crNett, lastImport: lastBatch?.[0]?.created_at ?? '' });
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <LoadingSpinner />;

  const kpis = [
    { label: 'Programmes', value: stats.programmes, icon: FolderKanban, color: 'bg-brand-50 text-brand-700' },
    { label: 'Active Projects', value: stats.projects, icon: Building2, color: 'bg-blue-50 text-blue-700' },
    { label: 'Indicators', value: stats.indicators, icon: BarChart3, color: 'bg-amber-50 text-amber-700' },
    { label: 'Submissions', value: stats.submissions, icon: ClipboardCheck, color: 'bg-teal-50 text-teal-700' },
  ];

  const dataQuality = {
    total: stats.submissions,
    approved: submissionStatusData.find(s => s.name === 'Approved')?.value ?? 0,
    rejected: submissionStatusData.find(s => s.name === 'Rejected')?.value ?? 0,
    pending: (submissionStatusData.find(s => s.name === 'Submitted')?.value ?? 0) + (submissionStatusData.find(s => s.name === 'Validated')?.value ?? 0),
  };
  const qualityRate = dataQuality.total > 0 ? Math.round(((dataQuality.approved) / dataQuality.total) * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
        <p className="text-sm text-gray-500 mt-1">Hortgro Monitoring & Evaluation dashboard</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="card p-5">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${kpi.color}`}>
                <kpi.icon size={20} />
              </div>
              <div className="flex items-center gap-0.5 text-xs font-medium text-emerald-600">
                <ArrowUpRight size={13} />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{kpi.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Submission Trends</h3>
              <p className="text-xs text-gray-500 mt-0.5">Monthly data submissions and approvals</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-brand-500" /> Submissions</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-brand-200" /> Approved</span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 5, right: 5, bottom: 5, left: -15 }}>
                <defs>
                  <linearGradient id="colorSub" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ fontWeight: 600, marginBottom: 4 }}
                />
                <Area type="monotone" dataKey="submissions" stroke="#16a34a" strokeWidth={2} fill="url(#colorSub)" />
                <Area type="monotone" dataKey="approved" stroke="#86efac" strokeWidth={2} fill="none" strokeDasharray="4 4" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-5">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-900">Submission Status</h3>
            <p className="text-xs text-gray-500 mt-0.5">Distribution by workflow stage</p>
          </div>
          <div className="h-44 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={submissionStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {submissionStatusData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center mt-2">
            {submissionStatusData.map(s => (
              <span key={s.name} className="flex items-center gap-1.5 text-xs text-gray-600">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                {s.name} ({s.value})
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle size={16} className="text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-900">Data Quality</h3>
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div className="relative w-20 h-20">
              <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none" stroke="#f0f0f0" strokeWidth="3" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none" stroke="#16a34a" strokeWidth="3"
                  strokeDasharray={`${qualityRate}, 100`}
                  strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-gray-900">{qualityRate}%</span>
              </div>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={12} className="text-emerald-500" />
                <span className="text-gray-600">{dataQuality.approved} approved</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={12} className="text-blue-500" />
                <span className="text-gray-600">{dataQuality.pending} pending review</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle size={12} className="text-red-500" />
                <span className="text-gray-600">{dataQuality.rejected} rejected</span>
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-400">{dataQuality.total} total submissions</p>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={16} className="text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-900">Indicators by Pillar</h3>
          </div>
          <div className="space-y-3">
            {pillarCounts.map(pc => {
              const cfg = PILLARS.find(p => p.key === pc.pillar);
              if (!cfg) return null;
              const maxCount = Math.max(...pillarCounts.map(p => p.count), 1);
              return (
                <div key={pc.pillar}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
                    <span className="text-xs text-gray-500">{pc.count}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${cfg.bgColor.replace('bg-', 'bg-').replace('-50', '-400')}`}
                      style={{ width: `${(pc.count / maxCount) * 100}%`, backgroundColor: cfg.color.includes('emerald') ? '#34d399' : cfg.color.includes('sky') ? '#38bdf8' : cfg.color.includes('teal') ? '#2dd4bf' : '#fbbf24' }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} className="text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-900">Quick Stats</h3>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Active Entities', value: stats.entities, icon: Building2 },
              { label: 'Training Sessions', value: stats.trainingSessions, icon: Activity },
              { label: 'Pending Reviews', value: dataQuality.pending, icon: FileCheck },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-3 py-2">
                <item.icon size={16} className="text-gray-400" />
                <span className="text-sm text-gray-600 flex-1">{item.label}</span>
                <span className="text-sm font-bold text-gray-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Send size={15} className="text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-900">Pending Validation Queue</h3>
          </div>
          <Link to="/data-collection" className="text-xs text-brand-700 hover:text-brand-800 font-medium">View all</Link>
        </div>
        {pendingQueue.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-400">No submissions pending review</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {pendingQueue.map(sub => (
              <Link key={sub.id} to={`/data-collection/${sub.id}`} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50/50 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {(sub.projects as { name: string; code: string } | undefined)?.name ?? '-'}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {(sub.reporting_periods as { name: string } | undefined)?.name ?? ''} &middot; {new Date(sub.created_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })}
                  </p>
                </div>
                <StatusBadge status={sub.status} />
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card">
          <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle size={15} className="text-amber-500" />
              <h3 className="text-sm font-semibold text-gray-900">Active Risk Alerts</h3>
            </div>
            <Link to="/risk-register" className="text-xs text-brand-700 hover:text-brand-800 font-medium">View all</Link>
          </div>
          {riskAlerts.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-400">No open risk alerts</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {riskAlerts.map(r => (
                <Link key={r.id} to="/risk-register" className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50/50 transition-colors">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    r.severity === 'critical' ? 'bg-red-50' : r.severity === 'high' ? 'bg-amber-50' : 'bg-yellow-50'
                  }`}>
                    {r.severity === 'critical' ? <AlertOctagon size={13} className="text-red-600" /> : <AlertTriangle size={13} className={r.severity === 'high' ? 'text-amber-600' : 'text-yellow-600'} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{r.title}</p>
                    <p className="text-[11px] text-gray-400">{new Date(r.flagged_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })}</p>
                  </div>
                  <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-medium ring-1 ring-inset capitalize ${
                    r.severity === 'critical' ? 'bg-red-50 text-red-700 ring-red-600/20' : r.severity === 'high' ? 'bg-amber-50 text-amber-700 ring-amber-600/20' : 'bg-yellow-50 text-yellow-700 ring-yellow-600/20'
                  }`}>
                    {r.severity}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <HeartPulse size={15} className="text-gray-400" />
              <h3 className="text-sm font-semibold text-gray-900">Project Health Summary</h3>
            </div>
            <Link to="/health" className="text-xs text-brand-700 hover:text-brand-800 font-medium">Details</Link>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative w-20 h-20">
              <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#f0f0f0" strokeWidth="3" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none"
                  stroke={healthSummary.avg >= 70 ? '#16a34a' : healthSummary.avg >= 45 ? '#f59e0b' : '#ef4444'}
                  strokeWidth="3" strokeDasharray={`${healthSummary.avg}, 100`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-gray-900">{healthSummary.avg}</span>
              </div>
            </div>
            <div className="flex-1 space-y-2">
              {[
                { label: 'Healthy', count: healthSummary.green, color: 'bg-emerald-500' },
                { label: 'At Risk', count: healthSummary.amber, color: 'bg-amber-500' },
                { label: 'Critical', count: healthSummary.red, color: 'bg-red-500' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                  <span className="text-xs text-gray-600 flex-1">{item.label}</span>
                  <span className="text-sm font-bold text-gray-900">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Ship size={15} className="text-gray-400" />
              <h3 className="text-sm font-semibold text-gray-900">Commercial / Export</h3>
            </div>
            <Link to="/commercial/trends" className="text-xs text-brand-700 hover:text-brand-800 font-medium">View trends</Link>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-600">Consignments</span>
              <span className="text-sm font-bold text-gray-900">{commercialStats.consignments.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-600">Total Nett Value</span>
              <span className="text-sm font-bold text-gray-900">R {(commercialStats.totalNett / 1000).toFixed(0)}K</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-600">Last Published</span>
              <span className="text-sm text-gray-500">
                {commercialStats.lastImport ? new Date(commercialStats.lastImport).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' }) : 'Never'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
