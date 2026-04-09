import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  AlertCircle,
  AlertOctagon,
  Info,
  Shield,
  CheckCircle2,
  Clock,
  Search,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import LoadingSpinner from '../components/ui/LoadingSpinner';

interface RiskRow {
  id: string;
  severity: string;
  status: string;
  title: string;
  description: string;
  metric_value: number | null;
  threshold_value: number | null;
  flagged_at: string;
  resolved_at: string | null;
  risk_rules?: { name: string; category: string; condition_type: string };
  entities?: { name: string };
  projects?: { name: string };
  programmes?: { name: string };
}

const SEVERITY_CONFIG: Record<string, { icon: typeof AlertTriangle; color: string; bg: string; ring: string; label: string }> = {
  critical: { icon: AlertOctagon, color: 'text-red-700', bg: 'bg-red-50', ring: 'ring-red-600/20', label: 'Critical' },
  high: { icon: AlertTriangle, color: 'text-amber-700', bg: 'bg-amber-50', ring: 'ring-amber-600/20', label: 'High' },
  medium: { icon: AlertCircle, color: 'text-yellow-700', bg: 'bg-yellow-50', ring: 'ring-yellow-600/20', label: 'Medium' },
  low: { icon: Info, color: 'text-blue-700', bg: 'bg-blue-50', ring: 'ring-blue-600/20', label: 'Low' },
};

const STATUS_CONFIG: Record<string, { color: string; bg: string; ring: string; label: string }> = {
  open: { color: 'text-red-700', bg: 'bg-red-50', ring: 'ring-red-600/20', label: 'Open' },
  acknowledged: { color: 'text-amber-700', bg: 'bg-amber-50', ring: 'ring-amber-600/20', label: 'Acknowledged' },
  mitigated: { color: 'text-blue-700', bg: 'bg-blue-50', ring: 'ring-blue-600/20', label: 'Mitigated' },
  closed: { color: 'text-emerald-700', bg: 'bg-emerald-50', ring: 'ring-emerald-600/20', label: 'Closed' },
};

export default function RiskRegister() {
  const [risks, setRisks] = useState<RiskRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('risk_flags')
        .select('id, severity, status, title, description, metric_value, threshold_value, flagged_at, resolved_at, risk_rules(name, category, condition_type), entities(name), projects(name), programmes(name)')
        .order('flagged_at', { ascending: false });
      setRisks((data ?? []) as unknown as RiskRow[]);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = risks.filter(r => {
    if (search && !r.title.toLowerCase().includes(search.toLowerCase()) && !r.description.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterSeverity && r.severity !== filterSeverity) return false;
    if (filterStatus && r.status !== filterStatus) return false;
    return true;
  });

  const severityCounts = { critical: 0, high: 0, medium: 0, low: 0 };
  risks.forEach(r => {
    if (r.status !== 'closed' && r.severity in severityCounts) {
      severityCounts[r.severity as keyof typeof severityCounts]++;
    }
  });
  const openCount = risks.filter(r => r.status === 'open').length;
  const closedCount = risks.filter(r => r.status === 'closed').length;

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Risk Register</h1>
        <p className="text-sm text-gray-500 mt-1">Flagged risks across projects, entities, and programmes</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {Object.entries(SEVERITY_CONFIG).map(([key, cfg]) => {
          const count = severityCounts[key as keyof typeof severityCounts];
          const SevIcon = cfg.icon;
          return (
            <button
              key={key}
              onClick={() => setFilterSeverity(filterSeverity === key ? '' : key)}
              className={`card p-4 text-left transition-all ${filterSeverity === key ? 'ring-2 ring-brand-400' : 'hover:shadow-md'}`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${cfg.bg} mb-2`}>
                <SevIcon size={16} className={cfg.color} />
              </div>
              <p className="text-lg font-bold text-gray-900">{count}</p>
              <p className="text-[11px] text-gray-500">{cfg.label}</p>
            </button>
          );
        })}
        <div className="card p-4">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-50 mb-2">
            <Clock size={16} className="text-red-600" />
          </div>
          <p className="text-lg font-bold text-gray-900">{openCount}</p>
          <p className="text-[11px] text-gray-500">Open</p>
        </div>
        <div className="card p-4">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-50 mb-2">
            <CheckCircle2 size={16} className="text-emerald-600" />
          </div>
          <p className="text-lg font-bold text-gray-900">{closedCount}</p>
          <p className="text-[11px] text-gray-500">Resolved</p>
        </div>
      </div>

      <div className="card">
        <div className="px-4 py-3 border-b border-gray-200 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search risks..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-field pl-9 py-2 text-sm w-full"
            />
          </div>
          <div className="flex gap-2">
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="input-field py-2 text-xs">
              <option value="">All statuses</option>
              <option value="open">Open</option>
              <option value="acknowledged">Acknowledged</option>
              <option value="mitigated">Mitigated</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Shield size={32} className="mx-auto text-gray-300 mb-3" />
            <p className="text-sm text-gray-500">No risks matching your criteria</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filtered.map(risk => {
              const sevCfg = SEVERITY_CONFIG[risk.severity] ?? SEVERITY_CONFIG.medium;
              const statCfg = STATUS_CONFIG[risk.status] ?? STATUS_CONFIG.open;
              const SevIcon = sevCfg.icon;
              const isExpanded = expandedId === risk.id;
              return (
                <div key={risk.id} className="hover:bg-gray-50/50 transition-colors">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : risk.id)}
                    className="w-full flex items-start gap-3 px-4 py-3 text-left"
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${sevCfg.bg}`}>
                      <SevIcon size={14} className={sevCfg.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium text-gray-900">{risk.title}</p>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-medium ring-1 ring-inset ${sevCfg.color} ${sevCfg.bg} ${sevCfg.ring}`}>
                            {sevCfg.label}
                          </span>
                          <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-medium ring-1 ring-inset ${statCfg.color} ${statCfg.bg} ${statCfg.ring}`}>
                            {statCfg.label}
                          </span>
                          {isExpanded ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-2">
                        <span>{risk.risk_rules?.category ? risk.risk_rules.category.replace('_', ' ') : 'General'}</span>
                        <span className="text-gray-300">|</span>
                        <span>{new Date(risk.flagged_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        {(risk.entities as { name: string } | undefined)?.name && (
                          <>
                            <span className="text-gray-300">|</span>
                            <span>{(risk.entities as { name: string }).name}</span>
                          </>
                        )}
                      </p>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 pl-16">
                      <p className="text-sm text-gray-600 mb-3">{risk.description}</p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                        {risk.metric_value != null && (
                          <div>
                            <p className="text-[11px] text-gray-500 mb-0.5">Metric Value</p>
                            <p className="font-medium text-gray-900">{risk.metric_value}</p>
                          </div>
                        )}
                        {risk.threshold_value != null && (
                          <div>
                            <p className="text-[11px] text-gray-500 mb-0.5">Threshold</p>
                            <p className="font-medium text-gray-900">{risk.threshold_value}</p>
                          </div>
                        )}
                        {(risk.projects as { name: string } | undefined)?.name && (
                          <div>
                            <p className="text-[11px] text-gray-500 mb-0.5">Project</p>
                            <p className="font-medium text-gray-900">{(risk.projects as { name: string }).name}</p>
                          </div>
                        )}
                        {(risk.programmes as { name: string } | undefined)?.name && (
                          <div>
                            <p className="text-[11px] text-gray-500 mb-0.5">Programme</p>
                            <p className="font-medium text-gray-900">{(risk.programmes as { name: string }).name}</p>
                          </div>
                        )}
                        {risk.risk_rules?.name && (
                          <div>
                            <p className="text-[11px] text-gray-500 mb-0.5">Rule</p>
                            <p className="font-medium text-gray-900">{risk.risk_rules.name}</p>
                          </div>
                        )}
                        {risk.resolved_at && (
                          <div>
                            <p className="text-[11px] text-gray-500 mb-0.5">Resolved</p>
                            <p className="font-medium text-emerald-700">{new Date(risk.resolved_at).toLocaleDateString('en-ZA')}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
