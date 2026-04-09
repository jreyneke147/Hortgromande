import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  FolderKanban,
  MapPin,
  ClipboardList,
  Calendar,
  DollarSign,
  TrendingUp,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import StatusBadge from '../components/ui/StatusBadge';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { getPillarConfig } from '../lib/pillars';
import type { IndicatorPillar } from '../types';

interface ProjectFull {
  id: string;
  name: string;
  code: string;
  description: string;
  status: string;
  start_date: string | null;
  end_date: string | null;
  budget: number;
  entity_id: string | null;
  programmes?: { name: string; code: string };
  entities?: { name: string; type: string; region: string; province: string };
}

interface LinkedSubmission {
  id: string;
  status: string;
  created_at: string;
  submission_date: string | null;
  reporting_periods?: { name: string };
}

interface LinkedIndicator {
  id: string;
  indicator_id: string;
  value: number;
  indicators?: { name: string; code: string; unit: string; pillar: IndicatorPillar; target_value: number };
}

interface LinkedFarm {
  id: string;
  name: string;
  size_hectares: number;
  crop_type: string;
  region: string;
}

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<ProjectFull | null>(null);
  const [submissions, setSubmissions] = useState<LinkedSubmission[]>([]);
  const [indicators, setIndicators] = useState<LinkedIndicator[]>([]);
  const [farms, setFarms] = useState<LinkedFarm[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!id) return;
    const [projRes, subRes] = await Promise.all([
      supabase.from('projects').select('*, programmes(name, code), entities(name, type, region, province)').eq('id', id).maybeSingle(),
      supabase.from('submissions').select('id, status, created_at, submission_date, reporting_periods(name)').eq('project_id', id).eq('is_deleted', false).order('created_at', { ascending: false }).limit(10),
    ]);

    const proj = projRes.data as unknown as ProjectFull | null;
    setProject(proj);
    setSubmissions((subRes.data ?? []) as unknown as LinkedSubmission[]);

    if (proj?.entity_id) {
      const { data: farmData } = await supabase.from('farms').select('id, name, size_hectares, crop_type, region').eq('entity_id', proj.entity_id).eq('is_deleted', false).order('name');
      setFarms((farmData ?? []) as LinkedFarm[]);
    }

    const subIds = (subRes.data ?? []).map((s: { id: string }) => s.id);
    if (subIds.length > 0) {
      const { data: itemData } = await supabase
        .from('submission_items')
        .select('id, indicator_id, value, indicators(name, code, unit, pillar, target_value)')
        .in('submission_id', subIds);
      setIndicators((itemData ?? []) as unknown as LinkedIndicator[]);
    }

    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <LoadingSpinner />;
  if (!project) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Project not found</p>
        <button onClick={() => navigate('/projects')} className="btn-secondary mt-4">Back to Projects</button>
      </div>
    );
  }

  const uniqueIndicators = Array.from(
    indicators.reduce((map, item) => {
      const existing = map.get(item.indicator_id);
      if (!existing || item.value > existing.value) {
        map.set(item.indicator_id, item);
      }
      return map;
    }, new Map<string, LinkedIndicator>()).values()
  );

  const statusCounts = {
    draft: submissions.filter(s => s.status === 'draft').length,
    submitted: submissions.filter(s => s.status === 'submitted').length,
    approved: submissions.filter(s => s.status === 'approved').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/projects')} className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
            <StatusBadge status={project.status} />
          </div>
          <p className="text-sm text-gray-500 mt-0.5">{project.code}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="card p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-brand-50 text-brand-700 flex items-center justify-center">
            <FolderKanban size={18} />
          </div>
          <div>
            <p className="text-xs text-gray-500">Programme</p>
            <p className="text-sm font-medium text-gray-900">{project.programmes?.name ?? '-'}</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
            <Building2 size={18} />
          </div>
          <div>
            <p className="text-xs text-gray-500">Entity</p>
            <p className="text-sm font-medium text-gray-900">{project.entities?.name ?? '-'}</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
            <DollarSign size={18} />
          </div>
          <div>
            <p className="text-xs text-gray-500">Budget</p>
            <p className="text-sm font-medium text-gray-900">R {project.budget?.toLocaleString() ?? '0'}</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
            <Calendar size={18} />
          </div>
          <div>
            <p className="text-xs text-gray-500">Timeline</p>
            <p className="text-sm font-medium text-gray-900">
              {project.start_date ? new Date(project.start_date).toLocaleDateString('en-ZA', { month: 'short', year: 'numeric' }) : '-'}
              {project.end_date ? ` - ${new Date(project.end_date).toLocaleDateString('en-ZA', { month: 'short', year: 'numeric' })}` : ''}
            </p>
          </div>
        </div>
      </div>

      {project.description && (
        <div className="card p-5">
          <p className="text-sm text-gray-600 leading-relaxed">{project.description}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ClipboardList size={15} className="text-gray-400" />
              <h2 className="text-sm font-semibold text-gray-900">Recent Submissions</h2>
            </div>
            <div className="flex gap-2 text-xs">
              <span className="text-gray-500">{statusCounts.draft} draft</span>
              <span className="text-blue-600">{statusCounts.submitted} submitted</span>
              <span className="text-emerald-600">{statusCounts.approved} approved</span>
            </div>
          </div>
          {submissions.length === 0 ? (
            <p className="p-6 text-center text-sm text-gray-400">No submissions yet</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {submissions.map(sub => (
                <Link
                  key={sub.id}
                  to={`/data-collection/${sub.id}`}
                  className="flex items-center justify-between px-4 py-3 hover:bg-gray-50/50 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">{sub.reporting_periods?.name ?? '-'}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {new Date(sub.created_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <StatusBadge status={sub.status} />
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="px-4 py-3 border-b border-gray-200 flex items-center gap-2">
            <TrendingUp size={15} className="text-gray-400" />
            <h2 className="text-sm font-semibold text-gray-900">Indicator Performance</h2>
          </div>
          {uniqueIndicators.length === 0 ? (
            <p className="p-6 text-center text-sm text-gray-400">No indicator data yet</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {uniqueIndicators.slice(0, 8).map(item => {
                const ind = item.indicators;
                if (!ind) return null;
                const pct = ind.target_value > 0 ? Math.min(100, Math.round((item.value / ind.target_value) * 100)) : 0;
                const pillarCfg = getPillarConfig(ind.pillar);
                return (
                  <div key={item.id} className="px-4 py-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-gray-400">{ind.code}</span>
                      <span className={`inline-flex items-center rounded px-1 py-0.5 text-[10px] font-medium ${pillarCfg.color} ${pillarCfg.bgColor}`}>
                        {pillarCfg.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-900 mb-1.5">{ind.name}</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${pct >= 100 ? 'bg-emerald-500' : pct >= 50 ? 'bg-brand-500' : 'bg-amber-500'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 w-20 text-right">
                        {item.value.toLocaleString()} / {ind.target_value.toLocaleString()} {ind.unit}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {project.entities && (
        <div className="card">
          <div className="px-4 py-3 border-b border-gray-200 flex items-center gap-2">
            <MapPin size={15} className="text-gray-400" />
            <h2 className="text-sm font-semibold text-gray-900">Linked Farms</h2>
          </div>
          {farms.length === 0 ? (
            <p className="p-6 text-center text-sm text-gray-400">No farms linked to this entity</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-2.5">Farm</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-2.5">Crop</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-2.5">Region</th>
                    <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-2.5">Size (ha)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {farms.map(farm => (
                    <tr key={farm.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-2.5 text-sm font-medium text-gray-900">{farm.name}</td>
                      <td className="px-4 py-2.5 text-sm text-gray-600">{farm.crop_type}</td>
                      <td className="px-4 py-2.5 text-sm text-gray-600">{farm.region}</td>
                      <td className="px-4 py-2.5 text-sm text-gray-900 text-right tabular-nums">{farm.size_hectares}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
