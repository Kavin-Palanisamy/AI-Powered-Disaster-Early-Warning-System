import React, { useState } from 'react';
import {
  SensorStation,
  DisasterEvent,
  EvacuationShelter,
  EvacuationRoute,
  SensorType,
} from '../types';
import {
  Activity,
  Layers,
  MapPin,
  Shield,
  Navigation,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Waves,
  Flame,
  CloudRain,
  Mountain,
  Gauge,
  Radio,
} from 'lucide-react';

interface InteractiveDisasterMapProps {
  sensors: SensorStation[];
  activeEvent: DisasterEvent | null;
  shelters: EvacuationShelter[];
  routes: EvacuationRoute[];
  onSelectSensor: (sensor: SensorStation) => void;
  selectedSensorId?: string;
}

export const InteractiveDisasterMap: React.FC<InteractiveDisasterMapProps> = ({
  sensors,
  activeEvent,
  shelters,
  routes,
  onSelectSensor,
  selectedSensorId,
}) => {
  const [activeLayers, setActiveLayers] = useState({
    waves: true,
    dangerZones: true,
    sensors: true,
    shelters: true,
    routes: true,
    grid: true,
  });

  const [filterType, setFilterType] = useState<string>('ALL');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [selectedShelter, setSelectedShelter] = useState<EvacuationShelter | null>(null);

  // Map geographic bounding box to SVG coordinate system [0, 800] x [0, 520]
  // Lat: 36.8 to 38.8 (North-South)
  // Lng: -123.3 to -121.2 (West-East)
  const minLat = 36.8;
  const maxLat = 38.8;
  const minLng = -123.3;
  const maxLng = -121.2;

  const projectCoord = (lat: number, lng: number): { x: number; y: number } => {
    const x = ((lng - minLng) / (maxLng - minLng)) * 800;
    const y = ((maxLat - lat) / (maxLat - minLat)) * 520;
    return { x, y };
  };

  const filteredSensors = sensors.filter((s) => {
    if (filterType === 'ALL') return true;
    return s.type === filterType;
  });

  const epicenterPt = activeEvent ? projectCoord(activeEvent.epicenter.lat, activeEvent.epicenter.lng) : { x: 380, y: 260 };

  const getSensorIcon = (type: SensorType) => {
    switch (type) {
      case 'SEISMIC':
        return <Activity className="w-3.5 h-3.5" />;
      case 'OCEAN_DART':
        return <Waves className="w-3.5 h-3.5" />;
      case 'HYDROLOGICAL':
        return <CloudRain className="w-3.5 h-3.5" />;
      case 'METEOROLOGICAL':
        return <Radio className="w-3.5 h-3.5" />;
      case 'GEOTECHNICAL':
        return <Mountain className="w-3.5 h-3.5" />;
      case 'THERMAL_INFRARED':
        return <Flame className="w-3.5 h-3.5" />;
      default:
        return <Gauge className="w-3.5 h-3.5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CRITICAL':
        return { fill: '#ef4444', ring: 'rgba(239, 68, 68, 0.4)', text: 'text-red-400' };
      case 'WARNING':
        return { fill: '#f97316', ring: 'rgba(249, 115, 22, 0.4)', text: 'text-orange-400' };
      case 'ELEVATED':
        return { fill: '#eab308', ring: 'rgba(234, 179, 8, 0.4)', text: 'text-amber-400' };
      default:
        return { fill: '#10b981', ring: 'rgba(16, 185, 129, 0.4)', text: 'text-emerald-400' };
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl flex flex-col">
      {/* Map Control Bar */}
      <div className="p-3 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Layer Filters */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-slate-400 font-medium flex items-center gap-1 mr-1">
            <Layers className="w-3.5 h-3.5 text-blue-400" />
            Layers:
          </span>
          <button
            id="btn-layer-waves"
            onClick={() => setActiveLayers({ ...activeLayers, waves: !activeLayers.waves })}
            className={`px-2 py-1 rounded transition ${
              activeLayers.waves ? 'bg-red-950/60 text-red-300 border border-red-800/60' : 'bg-slate-850 text-slate-500 border border-slate-800'
            }`}
          >
            Shockwaves
          </button>
          <button
            id="btn-layer-danger"
            onClick={() => setActiveLayers({ ...activeLayers, dangerZones: !activeLayers.dangerZones })}
            className={`px-2 py-1 rounded transition ${
              activeLayers.dangerZones ? 'bg-amber-950/60 text-amber-300 border border-amber-800/60' : 'bg-slate-850 text-slate-500 border border-slate-800'
            }`}
          >
            Hazard Zones
          </button>
          <button
            id="btn-layer-sensors"
            onClick={() => setActiveLayers({ ...activeLayers, sensors: !activeLayers.sensors })}
            className={`px-2 py-1 rounded transition ${
              activeLayers.sensors ? 'bg-blue-950/60 text-blue-300 border border-blue-800/60' : 'bg-slate-850 text-slate-500 border border-slate-800'
            }`}
          >
            Sensor Nodes ({filteredSensors.length})
          </button>
          <button
            id="btn-layer-routes"
            onClick={() => setActiveLayers({ ...activeLayers, routes: !activeLayers.routes })}
            className={`px-2 py-1 rounded transition ${
              activeLayers.routes ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60' : 'bg-slate-850 text-slate-500 border border-slate-800'
            }`}
          >
            Evacuation Corridors
          </button>
          <button
            id="btn-layer-shelters"
            onClick={() => setActiveLayers({ ...activeLayers, shelters: !activeLayers.shelters })}
            className={`px-2 py-1 rounded transition ${
              activeLayers.shelters ? 'bg-purple-950/60 text-purple-300 border border-purple-800/60' : 'bg-slate-850 text-slate-500 border border-slate-800'
            }`}
          >
            Shelters ({shelters.length})
          </button>
        </div>

        {/* Filter Type & Zoom */}
        <div className="flex items-center gap-2">
          <select
            id="select-sensor-filter"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-200 rounded px-2 py-1 text-xs outline-none focus:border-blue-500"
          >
            <option value="ALL">All Sensor Modalities</option>
            <option value="SEISMIC">Seismic & P-Wave</option>
            <option value="OCEAN_DART">Deep-Sea DART Buoys</option>
            <option value="HYDROLOGICAL">River Flow & Dams</option>
            <option value="METEOROLOGICAL">Doppler & Barometer</option>
            <option value="GEOTECHNICAL">Slope Inclinometer</option>
            <option value="THERMAL_INFRARED">Orbital Thermal IR</option>
          </select>

          <div className="flex items-center bg-slate-800 rounded border border-slate-700 p-0.5">
            <button
              id="btn-zoom-in"
              onClick={() => setZoomLevel(Math.min(zoomLevel + 0.2, 1.8))}
              className="p-1 text-slate-300 hover:text-white transition"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              id="btn-zoom-out"
              onClick={() => setZoomLevel(Math.max(zoomLevel - 0.2, 0.8))}
              className="p-1 text-slate-300 hover:text-white transition"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              id="btn-zoom-reset"
              onClick={() => setZoomLevel(1)}
              className="p-1 text-slate-300 hover:text-white transition"
              title="Reset Zoom"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* SVG Canvas Map */}
      <div className="relative w-full aspect-[16/10] bg-slate-950 overflow-hidden select-none">
        <svg
          id="svg-disaster-map"
          viewBox="0 0 800 520"
          className="w-full h-full object-cover transition-transform duration-300"
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
        >
          <defs>
            {/* Map Gradients */}
            <radialGradient id="oceanGradient" cx="20%" cy="50%" r="70%">
              <stop offset="0%" stopColor="#081b2e" />
              <stop offset="100%" stopColor="#030c17" />
            </radialGradient>

            <linearGradient id="landGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0f172a" />
              <stop offset="50%" stopColor="#131e33" />
              <stop offset="100%" stopColor="#0e1726" />
            </linearGradient>

            <radialGradient id="epicenterGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(239, 68, 68, 0.8)" />
              <stop offset="40%" stopColor="rgba(239, 68, 68, 0.3)" />
              <stop offset="100%" stopColor="rgba(239, 68, 68, 0)" />
            </radialGradient>

            <radialGradient id="highHazardGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(239, 68, 68, 0.45)" />
              <stop offset="60%" stopColor="rgba(239, 68, 68, 0.15)" />
              <stop offset="100%" stopColor="rgba(239, 68, 68, 0)" />
            </radialGradient>

            <radialGradient id="modHazardGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(249, 115, 22, 0.25)" />
              <stop offset="70%" stopColor="rgba(249, 115, 22, 0.08)" />
              <stop offset="100%" stopColor="rgba(249, 115, 22, 0)" />
            </radialGradient>

            <pattern id="gisGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(51, 65, 85, 0.25)" strokeWidth="0.5" />
            </pattern>
          </defs>

          {/* Background Ocean Layer */}
          <rect width="800" height="520" fill="url(#oceanGradient)" />

          {/* Landmass Terrain Geometry */}
          <path
            d="M 190 0 
               Q 220 80, 240 140 
               Q 270 210, 310 260 
               Q 360 320, 390 390 
               Q 410 450, 440 520 
               L 800 520 
               L 800 0 
               Z"
            fill="url(#landGradient)"
            stroke="#1e293b"
            strokeWidth="1.5"
          />

          {/* Bay and Delta Inundation Estuary */}
          <path
            d="M 310 260 
               Q 350 250, 390 280 
               Q 430 310, 480 290 
               Q 530 270, 580 285 
               Q 540 330, 470 340 
               Q 410 350, 360 320 
               Z"
            fill="#081c30"
            stroke="#1e3a5f"
            strokeWidth="1"
            opacity="0.85"
          />

          {/* Major Fault Line Fault System */}
          <path
            d="M 180 0 Q 250 160, 320 280 T 460 520"
            fill="none"
            stroke="#dc2626"
            strokeWidth="1.8"
            strokeDasharray="5,4"
            opacity="0.75"
          />
          <text x="210" y="70" fill="#ef4444" fontSize="9" fontFamily="monospace" opacity="0.8">
            SAN ANDREAS SUBDUCTION MEGATHRUST
          </text>

          {/* River Basin Channel */}
          <path
            d="M 720 40 Q 640 120, 580 210 T 480 290"
            fill="none"
            stroke="#0284c7"
            strokeWidth="2.5"
            opacity="0.6"
          />
          <text x="610" y="140" fill="#38bdf8" fontSize="8" fontFamily="monospace" opacity="0.7">
            SACRAMENTO RIVER GORGE DRAINAGE
          </text>

          {/* Topographic Elevation Contours */}
          <path
            d="M 520 80 Q 560 140, 600 200 T 680 340"
            fill="none"
            stroke="#334155"
            strokeWidth="1"
            strokeDasharray="2,3"
          />
          <path
            d="M 580 60 Q 630 130, 670 190 T 740 320"
            fill="none"
            stroke="#334155"
            strokeWidth="1"
            strokeDasharray="2,3"
          />

          {/* GIS Coordinate Grid Overlay */}
          {activeLayers.grid && <rect width="800" height="520" fill="url(#gisGrid)" pointerEvents="none" />}

          {/* Hazard Danger Buffer Zones */}
          {activeLayers.dangerZones && activeEvent && (
            <g id="danger-zones" pointerEvents="none">
              {/* Moderate Impact Buffer (Zone 2) */}
              <circle
                cx={epicenterPt.x}
                cy={epicenterPt.y}
                r={160}
                fill="url(#modHazardGradient)"
                stroke="#f97316"
                strokeWidth="1"
                strokeDasharray="4,4"
                opacity="0.6"
              />
              <text x={epicenterPt.x + 10} y={epicenterPt.y - 145} fill="#fb923c" fontSize="8" fontFamily="monospace">
                ZONE 2: MODERATE HAZARD PERIMETER (RADIUS: 95KM)
              </text>

              {/* High Impact Buffer (Zone 1) */}
              <circle
                cx={epicenterPt.x}
                cy={epicenterPt.y}
                r={95}
                fill="url(#highHazardGradient)"
                stroke="#ef4444"
                strokeWidth="1.5"
                opacity="0.8"
              />
              <text x={epicenterPt.x + 8} y={epicenterPt.y - 82} fill="#f87171" fontSize="9" fontWeight="bold" fontFamily="monospace">
                ZONE 1: HIGH CASUALTY & INUNDATION CORE
              </text>
            </g>
          )}

          {/* Expanding Shockwaves (P-Wave & S-Wave) */}
          {activeLayers.waves && activeEvent && (
            <g id="epicenter-shockwaves" pointerEvents="none">
              {/* Primary P-Wave Fast Propagation */}
              <circle cx={epicenterPt.x} cy={epicenterPt.y} r="65" fill="none" stroke="#38bdf8" strokeWidth="2" opacity="0.85">
                <animate attributeName="r" from="20" to="240" dur="4s" repeatCount="indefinite" />
                <animate attributeName="opacity" from="0.9" to="0" dur="4s" repeatCount="indefinite" />
              </circle>
              {/* Secondary S-Wave Destructive Shear Wave */}
              <circle cx={epicenterPt.x} cy={epicenterPt.y} r="40" fill="none" stroke="#ef4444" strokeWidth="3" opacity="0.95">
                <animate attributeName="r" from="10" to="150" dur="3s" repeatCount="indefinite" />
                <animate attributeName="opacity" from="1" to="0" dur="3s" repeatCount="indefinite" />
              </circle>
              <circle cx={epicenterPt.x} cy={epicenterPt.y} r="25" fill="url(#epicenterGlow)" />
            </g>
          )}

          {/* Epicenter Pin Marker */}
          {activeEvent && (
            <g id="epicenter-pin" transform={`translate(${epicenterPt.x}, ${epicenterPt.y})`}>
              <circle r="12" fill="#ef4444" opacity="0.3" className="animate-ping" />
              <circle r="7" fill="#b91c1c" stroke="#ffffff" strokeWidth="2" />
              <rect x="-6" y="-6" width="12" height="12" fill="#ef4444" transform="rotate(45)" />
              <text x="14" y="4" fill="#fecaca" fontSize="10" fontWeight="bold" fontFamily="sans-serif">
                ★ EPICENTER ({activeEvent.magnitude ? `M${activeEvent.magnitude}` : 'ACTIVE'})
              </text>
            </g>
          )}

          {/* Evacuation Corridors Routes */}
          {activeLayers.routes && (
            <g id="evac-routes">
              {/* Route 1: Safe Escapeway */}
              <path
                d="M 330 270 Q 380 250, 460 210 T 540 180"
                fill="none"
                stroke="#10b981"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeDasharray="6,4"
              />
              {/* Route 2: Caution Bypass */}
              <path
                d="M 360 300 Q 420 330, 490 310 T 560 300"
                fill="none"
                stroke="#eab308"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="5,4"
              />
              {/* Route 3: Hazardous River Corridor */}
              <path
                d="M 580 210 Q 520 280, 470 340"
                fill="none"
                stroke="#ef4444"
                strokeWidth="2.5"
                strokeDasharray="4,4"
                opacity="0.8"
              />
            </g>
          )}

          {/* Safe Evacuation Shelters */}
          {activeLayers.shelters &&
            shelters.map((shl) => {
              const pt = projectCoord(shl.lat, shl.lng);
              const isSelected = selectedShelter?.id === shl.id;
              const occPercent = Math.round((shl.occupied / shl.capacity) * 100);

              return (
                <g
                  key={shl.id}
                  id={`shelter-node-${shl.id}`}
                  transform={`translate(${pt.x}, ${pt.y})`}
                  className="cursor-pointer group"
                  onClick={() => setSelectedShelter(shl)}
                >
                  <circle
                    r={isSelected ? '14' : '10'}
                    fill="#1e1b4b"
                    stroke="#a855f7"
                    strokeWidth={isSelected ? '3' : '2'}
                  />
                  <Shield className="w-4 h-4 text-purple-300 pointer-events-none" x="-7" y="-7" />
                  <g className="opacity-80 group-hover:opacity-100 transition">
                    <rect x="12" y="-12" width="130" height="24" rx="4" fill="#0f172a" stroke="#475569" strokeWidth="0.8" />
                    <text x="16" y="2" fill="#e2e8f0" fontSize="8.5" fontWeight="bold">
                      {shl.name.substring(0, 18)}...
                    </text>
                    <text x="16" y="9" fill="#a855f7" fontSize="7" fontFamily="monospace">
                      CAP: {occPercent}% | ALT: {shl.altitudeMeters}m
                    </text>
                  </g>
                </g>
              );
            })}

          {/* Sensor Stations Nodes */}
          {activeLayers.sensors &&
            filteredSensors.map((sensor) => {
              const pt = projectCoord(sensor.location.lat, sensor.location.lng);
              const colorInfo = getStatusColor(sensor.status);
              const isSelected = selectedSensorId === sensor.id;
              const primaryMetric = sensor.metrics[sensor.primaryMetricKey];

              return (
                <g
                  key={sensor.id}
                  id={`sensor-node-${sensor.id}`}
                  transform={`translate(${pt.x}, ${pt.y})`}
                  className="cursor-pointer group"
                  onClick={() => onSelectSensor(sensor)}
                >
                  {/* Pulsing ring for warnings */}
                  {(sensor.status === 'CRITICAL' || sensor.status === 'WARNING') && (
                    <circle r="16" fill="none" stroke={colorInfo.fill} strokeWidth="1.5" opacity="0.6">
                      <animate attributeName="r" from="8" to="24" dur="1.8s" repeatCount="indefinite" />
                      <animate attributeName="opacity" from="0.8" to="0" dur="1.8s" repeatCount="indefinite" />
                    </circle>
                  )}

                  <circle
                    r={isSelected ? '12' : '9'}
                    fill="#0f172a"
                    stroke={colorInfo.fill}
                    strokeWidth={isSelected ? '3' : '2'}
                  />
                  <circle r="4" fill={colorInfo.fill} />

                  {/* Sensor Name Label Banner */}
                  <g className="transition-all duration-200">
                    <rect
                      x="12"
                      y="-14"
                      width="120"
                      height="26"
                      rx="4"
                      fill="#020617"
                      stroke={isSelected ? '#38bdf8' : '#334155'}
                      strokeWidth={isSelected ? '1.5' : '1'}
                      opacity="0.9"
                    />
                    <text x="16" y="-1" fill="#f8fafc" fontSize="8" fontWeight="bold">
                      {sensor.code}: {sensor.name.substring(0, 14)}..
                    </text>
                    <text x="16" y="8" fill={colorInfo.fill} fontSize="7.5" fontFamily="monospace" fontWeight="600">
                      {primaryMetric ? `${primaryMetric.value} ${primaryMetric.unit}` : sensor.status}
                    </text>
                  </g>
                </g>
              );
            })}
        </svg>

        {/* Map Legend Overlay */}
        <div className="absolute bottom-3 left-3 bg-slate-950/90 backdrop-blur-md border border-slate-800 rounded-lg p-2.5 text-[11px] text-slate-300 shadow-xl max-w-xs pointer-events-auto">
          <div className="font-bold text-xs text-white mb-1.5 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-red-400" />
            GIS Legend & Alert Status
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 font-mono text-[10px]">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
              <span>Critical Breach</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
              <span>Warning Level</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span>Nominal Baseline</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
              <span>High Ground Shelter</span>
            </div>
          </div>
        </div>

        {/* Selected Shelter Details Popover */}
        {selectedShelter && (
          <div className="absolute top-3 right-3 bg-slate-950/95 backdrop-blur-md border border-purple-500/50 rounded-xl p-3 text-xs text-slate-200 shadow-2xl max-w-xs z-20">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-1.5 text-purple-400 font-bold">
                <Shield className="w-4 h-4" />
                <span>{selectedShelter.name}</span>
              </div>
              <button
                onClick={() => setSelectedShelter(null)}
                className="text-slate-400 hover:text-white text-xs px-1"
              >
                ✕
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mb-2">{selectedShelter.sector}</p>
            <div className="space-y-1.5 font-mono text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-400">Elevation:</span>
                <span className="text-emerald-400 font-bold">+{selectedShelter.altitudeMeters}m MSL (Safe from Surge)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Occupancy:</span>
                <span>
                  {selectedShelter.occupied} / {selectedShelter.capacity} ({Math.round((selectedShelter.occupied / selectedShelter.capacity) * 100)}%)
                </span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-purple-500 h-full rounded-full"
                  style={{ width: `${(selectedShelter.occupied / selectedShelter.capacity) * 100}%` }}
                ></div>
              </div>
              <div className="pt-1">
                <span className="text-slate-400 text-[10px] block mb-1">Available Facilities:</span>
                <div className="flex flex-wrap gap-1">
                  {selectedShelter.amenities.map((am, i) => (
                    <span key={i} className="px-1.5 py-0.5 bg-purple-950/60 border border-purple-800/40 text-purple-300 rounded text-[9.5px]">
                      {am}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
