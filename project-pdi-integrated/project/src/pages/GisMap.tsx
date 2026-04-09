import { useEffect, useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  Layers,
  X,
  Sprout,
  TreePine,
} from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { supabase } from '../lib/supabase';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import StatusBadge from '../components/ui/StatusBadge';

interface MapEntity {
  id: string;
  name: string;
  type: string;
  region: string;
  province: string;
  latitude: number;
  longitude: number;
  is_active: boolean;
  projectCount: number;
  farmCount: number;
}

interface MapFarm {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  hectares: number;
  crop_types: string[];
  region: string;
  entity_name: string;
}

interface MapBlock {
  id: string;
  block_number: string;
  fruit: string;
  variety: string;
  hectares: number;
  tree_count: number;
  planting_year: number;
  latitude: number;
  longitude: number;
  farm_name: string;
}

export default function GisMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);
  const [entities, setEntities] = useState<MapEntity[]>([]);
  const [farms, setFarms] = useState<MapFarm[]>([]);
  const [orchardBlocks, setOrchardBlocks] = useState<MapBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEntity, setSelectedEntity] = useState<MapEntity | null>(null);
  const [layer, setLayer] = useState<'entities' | 'farms' | 'orchards'>('entities');
  const [programmeFilter, setProgrammeFilter] = useState('');
  const [programmes, setProgrammes] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    async function load() {
      const [eRes, fRes, pRes, projRes, obRes] = await Promise.all([
        supabase.from('entities').select('id, name, type, region, province, latitude, longitude, is_active').eq('is_deleted', false),
        supabase.from('farms').select('id, name, latitude, longitude, hectares, crop_types, region, entity_id, entities(name)').eq('is_deleted', false),
        supabase.from('programmes').select('id, name').eq('is_deleted', false).order('name'),
        supabase.from('projects').select('id, entity_id, programme_id').eq('is_deleted', false),
        supabase.from('orchard_blocks').select('id, block_number, fruit, variety, hectares, tree_count, planting_year, latitude, longitude, farm_id, farms(name)').eq('is_deleted', false),
      ]);

      const projects = projRes.data ?? [];
      const entityProjectCount: Record<string, number> = {};
      const entityFarmCount: Record<string, number> = {};
      projects.forEach(p => { if (p.entity_id) entityProjectCount[p.entity_id] = (entityProjectCount[p.entity_id] ?? 0) + 1; });
      (fRes.data ?? []).forEach(f => { if (f.entity_id) entityFarmCount[f.entity_id] = (entityFarmCount[f.entity_id] ?? 0) + 1; });

      const entitiesData = (eRes.data ?? [])
        .filter(e => e.latitude && e.longitude)
        .map(e => ({
          ...e,
          latitude: Number(e.latitude),
          longitude: Number(e.longitude),
          projectCount: entityProjectCount[e.id] ?? 0,
          farmCount: entityFarmCount[e.id] ?? 0,
        }));

      const farmsData = (fRes.data ?? [])
        .filter((f: { latitude: number | null }) => f.latitude)
        .map((f: Record<string, unknown>) => ({
          id: f.id as string,
          name: f.name as string,
          latitude: Number(f.latitude),
          longitude: Number(f.longitude),
          hectares: Number(f.hectares) || 0,
          crop_types: (f.crop_types as string[]) ?? [],
          region: (f.region as string) ?? '',
          entity_name: (f.entities as { name: string } | null)?.name ?? '',
        }));

      const blocksData = (obRes.data ?? [])
        .filter((b: { latitude: number | null }) => b.latitude)
        .map((b: Record<string, unknown>) => ({
          id: b.id as string,
          block_number: (b.block_number as string) ?? '',
          fruit: (b.fruit as string) ?? '',
          variety: (b.variety as string) ?? '',
          hectares: Number(b.hectares) || 0,
          tree_count: Number(b.tree_count) || 0,
          planting_year: Number(b.planting_year) || 0,
          latitude: Number(b.latitude),
          longitude: Number(b.longitude),
          farm_name: (b.farms as { name: string } | null)?.name ?? '',
        }));

      setEntities(entitiesData);
      setFarms(farmsData);
      setOrchardBlocks(blocksData);
      setProgrammes(pRes.data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  useEffect(() => {
    if (loading || !mapRef.current || leafletMap.current) return;
    const map = L.map(mapRef.current, {
      center: [-33.5, 19.5],
      zoom: 8,
      zoomControl: true,
    });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);
    leafletMap.current = map;
    markersRef.current = L.layerGroup().addTo(map);

    return () => { map.remove(); leafletMap.current = null; };
  }, [loading]);

  const updateMarkers = useCallback(() => {
    if (!markersRef.current || !leafletMap.current) return;
    markersRef.current.clearLayers();

    if (layer === 'entities') {
      entities.forEach(e => {
        const icon = L.divIcon({
          className: 'custom-marker',
          html: `<div style="width:28px;height:28px;border-radius:50%;background:${e.is_active ? '#16a34a' : '#9ca3af'};border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;color:white;font-size:11px;font-weight:700;">${e.projectCount}</div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });
        const marker = L.marker([e.latitude, e.longitude], { icon })
          .on('click', () => setSelectedEntity(e));
        markersRef.current!.addLayer(marker);
      });
    } else if (layer === 'farms') {
      farms.forEach(f => {
        const icon = L.divIcon({
          className: 'custom-marker',
          html: `<div style="width:22px;height:22px;border-radius:50%;background:#0ea5e9;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.25);"></div>`,
          iconSize: [22, 22],
          iconAnchor: [11, 11],
        });
        const marker = L.marker([f.latitude, f.longitude], { icon });
        marker.bindPopup(`
          <div style="font-family:Inter,system-ui;min-width:160px">
            <p style="font-weight:600;font-size:13px;margin:0 0 4px">${f.name}</p>
            <p style="font-size:11px;color:#6b7280;margin:0">${f.entity_name}</p>
            <p style="font-size:11px;color:#6b7280;margin:2px 0">${f.hectares} ha &middot; ${f.region}</p>
            ${f.crop_types.length > 0 ? `<p style="font-size:11px;color:#6b7280;margin:2px 0">${f.crop_types.join(', ')}</p>` : ''}
          </div>
        `);
        markersRef.current!.addLayer(marker);
      });
    } else {
      orchardBlocks.forEach(b => {
        const icon = L.divIcon({
          className: 'custom-marker',
          html: `<div style="width:20px;height:20px;border-radius:50%;background:#16a34a;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.25);"></div>`,
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        });
        const marker = L.marker([b.latitude, b.longitude], { icon });
        marker.bindPopup(`
          <div style="font-family:Inter,system-ui;min-width:170px">
            <p style="font-weight:600;font-size:13px;margin:0 0 4px">Block ${b.block_number}</p>
            <p style="font-size:11px;color:#6b7280;margin:0">${b.farm_name}</p>
            <p style="font-size:11px;color:#6b7280;margin:2px 0">${b.fruit} &middot; ${b.variety}</p>
            <p style="font-size:11px;color:#6b7280;margin:2px 0">${b.hectares} ha &middot; ${b.tree_count.toLocaleString()} trees</p>
            ${b.planting_year ? `<p style="font-size:11px;color:#6b7280;margin:2px 0">Planted ${b.planting_year}</p>` : ''}
          </div>
        `);
        markersRef.current!.addLayer(marker);
      });
    }
  }, [layer, entities, farms, orchardBlocks]);

  useEffect(() => { updateMarkers(); }, [updateMarkers]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">GIS Map</h1>
          <p className="text-sm text-gray-500 mt-1">{entities.length} entities, {farms.length} farms, and {orchardBlocks.length} orchard blocks mapped</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={programmeFilter} onChange={e => setProgrammeFilter(e.target.value)} className="input-field w-auto py-1.5 text-xs">
            <option value="">All programmes</option>
            {programmes.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            <button
              onClick={() => setLayer('entities')}
              className={`px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 transition-colors ${layer === 'entities' ? 'bg-brand-50 text-brand-700' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
            >
              <Building2 size={13} /> Entities
            </button>
            <button
              onClick={() => setLayer('farms')}
              className={`px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 transition-colors ${layer === 'farms' ? 'bg-brand-50 text-brand-700' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
            >
              <Sprout size={13} /> Farms
            </button>
            <button
              onClick={() => setLayer('orchards')}
              className={`px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 transition-colors ${layer === 'orchards' ? 'bg-brand-50 text-brand-700' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
            >
              <TreePine size={13} /> Orchards
            </button>
          </div>
        </div>
      </div>

      <div className="relative">
        <div ref={mapRef} className="w-full h-[calc(100vh-220px)] rounded-xl border border-gray-200 shadow-sm z-0" />

        {selectedEntity && (
          <div className="absolute top-4 right-4 w-80 card p-0 shadow-lg z-[1000]">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900">{selectedEntity.name}</h3>
              <button onClick={() => setSelectedEntity(null)} className="p-1 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100">
                <X size={14} />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-gray-500">Type</p>
                  <p className="text-gray-900 font-medium capitalize">{selectedEntity.type}</p>
                </div>
                <div>
                  <p className="text-gray-500">Status</p>
                  <StatusBadge status={selectedEntity.is_active ? 'active' : 'inactive'} />
                </div>
                <div>
                  <p className="text-gray-500">Region</p>
                  <p className="text-gray-900 font-medium">{selectedEntity.region}</p>
                </div>
                <div>
                  <p className="text-gray-500">Province</p>
                  <p className="text-gray-900 font-medium">{selectedEntity.province}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-brand-50 rounded-lg p-2.5 text-center">
                  <p className="text-lg font-bold text-brand-700">{selectedEntity.projectCount}</p>
                  <p className="text-[10px] text-brand-600">Projects</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-2.5 text-center">
                  <p className="text-lg font-bold text-blue-700">{selectedEntity.farmCount}</p>
                  <p className="text-[10px] text-blue-600">Farms</p>
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <Link to={`/benchmarking?entity=${selectedEntity.id}`} className="flex-1 btn-secondary text-xs py-1.5 text-center">
                  Benchmarks
                </Link>
              </div>
            </div>
          </div>
        )}

        <div className="absolute bottom-4 left-4 card p-3 shadow-md z-[1000]">
          <div className="flex items-center gap-2 mb-2">
            <Layers size={13} className="text-gray-400" />
            <span className="text-xs font-medium text-gray-700">Legend</span>
          </div>
          {layer === 'entities' ? (
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <span className="w-3 h-3 rounded-full bg-brand-600 border-2 border-white shadow" />
                Active entity
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <span className="w-3 h-3 rounded-full bg-gray-400 border-2 border-white shadow" />
                Inactive entity
              </div>
            </div>
          ) : layer === 'farms' ? (
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <span className="w-3 h-3 rounded-full bg-sky-500 border-2 border-white shadow" />
              Farm location
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <span className="w-3 h-3 rounded-full bg-green-600 border-2 border-white shadow" />
              Orchard block
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
