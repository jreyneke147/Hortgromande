import { useEffect, useState } from 'react';
import {
  HeartPulse,
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
  Database,
  Clock,
  Target,
  Shield,
  Leaf,
  GraduationCap,
} from 'lucide-react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
} from 'recharts';
import { supabase } from '../lib/supabase';
import LoadingSpinner from '../components/ui/LoadingSpinner';

interface HealthRow {
  id: string;
  entity_type: string;
  entity_id: string;
  overall_score: number;
  data_completeness: number;
  submission_timeliness: number;
  outcome_performance: number;
  governance_maturity: number;
  sustainability_score: number;
  training_engagement: number;
  status: string;
  period_name: string;
}


const STATUS_COLORS: Record<string, { bg: string; text: string; ring: string; dot: string }> = {
  green: { bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-emerald-600/20', dot: 'bg-emerald-500' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-700', ring: 'ring-amber-600/20', dot: 'bg-amber-500' },
  red: { bg: 'bg-red-50', text: 'text-red-700', ring: 'ring-red-600/20', dot: 'bg-red-500' },
};

const DIMENSION_ICONS = [
  { key: 'data_completeness', label: 'Data Completeness', icon: Database },
  { key: 'submission_timeliness', label: 'Submission Timeliness', icon: Clock },
  { key: 'outcome_performance', label: 'Outcome Performance', icon: Target },
  { key: 'governance_maturity', label: 'Governance Maturity', icon: Shield },
  { key: 'sustainability_score', label: 'Sustainability', icon: Leaf },
  { key: 'training_engagement', label: 'Training Engagement', icon: GraduationCap },
];

export default function HealthOverview() {
  const [scores, setScores] = useState<HealthRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'project' | 'entity' | 'programme'>('project');
  const [sortField, setSortField] = useState<'overall_score' | 'name'>('overall_score');
  const [sortAsc, setSortAsc] = useState(false);
  const [entityNames, setEntityNames] = useState<Record<string, string>>({});
  const [selectedScore, setSelectedScore] = useState<HealthRow | null>(null);

  useEffect(() => {
    async function load() {
      const [hsRes, projRes, entRes, progRes] = await Promise.all([
        supabase.from('health_scores').select('*').order('overall_score', { ascending: false }),
        supabase.from('projects').select('id, name').eq('is_deleted', false),
        supabase.from('entities').select('id, name').eq('is_deleted', false),
        supabase.from('programmes').select('id, name').eq('is_deleted', false),
      ]);

      setScores((hsRes.data ?? []) as HealthRow[]);

      const nameMap: Record<string, string> = {};
      (projRes.data ?? []).forEach(p => { nameMap[p.id] = p.name; });
      (entRes.data ?? []).forEach(e => { nameMap[e.id] = e.name; });
      (progRes.data ?? []).forEach(pr => { nameMap[pr.id] = pr.name; });
      setEntityNames(nameMap);
      setLoading(false);
    }
    load();
  }, []);

  const tabScores = scores.filter(s => s.entity_type === tab);
  const sorted = [...tabScores].sort((a, b) => {
    if (sortField === 'name') {
      const nameA = entityNames[a.entity_id] ?? '';
      const nameB = entityNames[b.entity_id] ?? '';
      return sortAsc ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
    }
    return sortAsc ? a.overall_score - b.overall_score : b.overall_score - a.overall_score;
  });

  const greenCount = tabScores.filter(s => s.status === 'green').length;
  const amberCount = tabScores.filter(s => s.status === 'amber').length;
  const redCount = tabScores.filter(s => s.status === 'red').length;
  const avgScore = tabScores.length > 0 ? Math.round(tabScores.reduce((s, h) => s + h.overall_score, 0) / tabScores.length) : 0;

  function toggleSort(field: 'overall_score' | 'name') {
    if (sortField === field) setSortAsc(!sortAsc);
    else { setSortField(field); setSortAsc(false); }
  }

  const radarData = selectedScore ? DIMENSION_ICONS.map(d => ({
    dimension: d.label.split(' ')[0],
    score: selectedScore[d.key as keyof HealthRow] as number,
  })) : [];

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Health Overview</h1>
          <p className="text-sm text-gray-500 mt-1">Programme, project, and entity health scoring</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {(['project', 'entity', 'programme'] as const).map(t => (
          <button
            key={t}
            onClick={() => { setTab(t); setSelectedScore(null); }}
            className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors capitalize ${
              tab === t ? 'bg-brand-50 border-brand-300 text-brand-700' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
            }`}
          >
            {t}s
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-5">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-gray-50 mb-3">
            <HeartPulse size={18} className="text-gray-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{avgScore}</p>
          <p className="text-xs text-gray-500 mt-0.5">Avg Health Score</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-1.5 mb-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-xs text-gray-500">Healthy</span>
          </div>
          <p className="text-2xl font-bold text-emerald-700">{greenCount}</p>
          <p className="text-xs text-gray-500 mt-0.5">Score 70+</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-1.5 mb-3">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-xs text-gray-500">At Risk</span>
          </div>
          <p className="text-2xl font-bold text-amber-700">{amberCount}</p>
          <p className="text-xs text-gray-500 mt-0.5">Score 45-69</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-1.5 mb-3">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span className="text-xs text-gray-500">Critical</span>
          </div>
          <p className="text-2xl font-bold text-red-700">{redCount}</p>
          <p className="text-xs text-gray-500 mt-0.5">Score below 45</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card">
          <div className="px-4 py-3 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900">Health Score Table</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left px-4 py-2.5">
                    <button onClick={() => toggleSort('name')} className="flex items-center gap-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Name {sortField === 'name' && (sortAsc ? <ChevronUp size={11} /> : <ChevronDown size={11} />)}
                    </button>
                  </th>
                  <th className="text-center px-4 py-2.5">
                    <button onClick={() => toggleSort('overall_score')} className="flex items-center gap-1 text-xs font-semibold text-gray-500 uppercase tracking-wider mx-auto">
                      Score {sortField === 'overall_score' && (sortAsc ? <ChevronUp size={11} /> : <ChevronDown size={11} />)}
                    </button>
                  </th>
                  <th className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-2.5">Status</th>
                  {DIMENSION_ICONS.map(d => (
                    <th key={d.key} className="text-center px-2 py-2.5" title={d.label}>
                      <d.icon size={13} className="mx-auto text-gray-400" />
                    </th>
                  ))}
                  <th className="px-2 py-2.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sorted.map(h => {
                  const cfg = STATUS_COLORS[h.status] ?? STATUS_COLORS.amber;
                  const name = entityNames[h.entity_id] ?? h.entity_id.slice(0, 8);
                  return (
                    <tr
                      key={h.id}
                      onClick={() => setSelectedScore(selectedScore?.id === h.id ? null : h)}
                      className={`cursor-pointer transition-colors ${selectedScore?.id === h.id ? 'bg-brand-50/50' : 'hover:bg-gray-50/50'}`}
                    >
                      <td className="px-4 py-2.5">
                        <p className="text-sm font-medium text-gray-900 truncate max-w-[180px]">{name}</p>
                        <p className="text-[10px] text-gray-400">{h.period_name}</p>
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <span className="text-sm font-bold text-gray-900">{h.overall_score}</span>
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-medium ring-1 ring-inset ${cfg.text} ${cfg.bg} ${cfg.ring}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                          {h.status === 'green' ? 'Healthy' : h.status === 'amber' ? 'At Risk' : 'Critical'}
                        </span>
                      </td>
                      {DIMENSION_ICONS.map(d => {
                        const val = h[d.key as keyof HealthRow] as number;
                        return (
                          <td key={d.key} className="px-2 py-2.5 text-center">
                            <div className="flex flex-col items-center gap-0.5">
                              <div className="w-8 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${val >= 70 ? 'bg-emerald-500' : val >= 45 ? 'bg-amber-500' : 'bg-red-500'}`}
                                  style={{ width: `${val}%` }}
                                />
                              </div>
                              <span className="text-[9px] text-gray-400 tabular-nums">{val}</span>
                            </div>
                          </td>
                        );
                      })}
                      <td className="px-2 py-2.5">
                        <ArrowUpRight size={13} className="text-gray-300" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">Score Breakdown</h3>
          {selectedScore ? (
            <>
              <p className="text-xs text-gray-500 mb-4">{entityNames[selectedScore.entity_id] ?? 'Selected item'}</p>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#e5e7eb" />
                    <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 9, fill: '#6b7280' }} />
                    <Radar dataKey="score" stroke="#16a34a" fill="#16a34a" fillOpacity={0.15} strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 mt-4">
                {DIMENSION_ICONS.map(d => {
                  const val = selectedScore[d.key as keyof HealthRow] as number;
                  const DIcon = d.icon;
                  return (
                    <div key={d.key} className="flex items-center gap-2">
                      <DIcon size={13} className="text-gray-400 flex-shrink-0" />
                      <span className="text-xs text-gray-600 flex-1">{d.label}</span>
                      <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${val >= 70 ? 'bg-emerald-500' : val >= 45 ? 'bg-amber-500' : 'bg-red-500'}`}
                          style={{ width: `${val}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-900 w-7 text-right tabular-nums">{val}</span>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <HeartPulse size={28} className="text-gray-300 mb-2" />
              <p className="text-sm text-gray-400">Select a row to view the score breakdown</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
