import React from 'react';
import {
  SensorStation,
  SensorStatus,
  MetricData,
} from '../types';
import {
  Activity,
  Waves,
  CloudRain,
  Radio,
  Mountain,
  Flame,
  Battery,
  Wifi,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Sliders,
  Sparkles,
} from 'lucide-react';

interface LiveTelemetryGridProps {
  sensors: SensorStation[];
  onSelectSensor: (sensor: SensorStation) => void;
  selectedSensorId?: string;
  onUpdateSensorMetric: (stationId: string, metricKey: string, newValue: number) => void;
  onTriggerAnomaly: (stationId: string) => void;
}

export const LiveTelemetryGrid: React.FC<LiveTelemetryGridProps> = ({
  sensors,
  onSelectSensor,
  selectedSensorId,
  onUpdateSensorMetric,
  onTriggerAnomaly,
}) => {
  const getSensorTypeIcon = (type: string) => {
    switch (type) {
      case 'SEISMIC':
        return <Activity className="w-4 h-4 text-rose-400" />;
      case 'OCEAN_DART':
        return <Waves className="w-4 h-4 text-cyan-400" />;
      case 'HYDROLOGICAL':
        return <CloudRain className="w-4 h-4 text-blue-400" />;
      case 'METEOROLOGICAL':
        return <Radio className="w-4 h-4 text-indigo-400" />;
      case 'GEOTECHNICAL':
        return <Mountain className="w-4 h-4 text-amber-400" />;
      case 'THERMAL_INFRARED':
        return <Flame className="w-4 h-4 text-orange-400" />;
      default:
        return <Activity className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStatusBadge = (status: SensorStatus) => {
    switch (status) {
      case 'CRITICAL':
        return (
          <span className="px-2 py-0.5 bg-red-950/80 border border-red-500/60 text-red-400 font-mono text-[10px] font-bold rounded flex items-center gap-1 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
            CRITICAL BREACH
          </span>
        );
      case 'WARNING':
        return (
          <span className="px-2 py-0.5 bg-orange-950/80 border border-orange-500/60 text-orange-400 font-mono text-[10px] font-bold rounded flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
            WARNING LEVEL
          </span>
        );
      case 'ELEVATED':
        return (
          <span className="px-2 py-0.5 bg-amber-950/80 border border-amber-500/60 text-amber-400 font-mono text-[10px] font-bold rounded flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            ELEVATED
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 bg-emerald-950/80 border border-emerald-500/60 text-emerald-400 font-mono text-[10px] font-bold rounded flex items-center gap-1">
            <CheckCircle2 className="w-2.5 h-2.5" />
            NOMINAL
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-3 rounded-xl">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-400" />
            Real-Time Multi-Modal Sensor Telemetry Array
          </h2>
          <p className="text-xs text-slate-400">
            Continuous sub-second telemetry sampling across seismic, ocean bottom DART buoys, river hydrometry, and inclinometers.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
          <span className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 border border-slate-700 rounded">
            <Wifi className="w-3.5 h-3.5 text-emerald-400" />
            Avg Latency: <strong className="text-white">28ms</strong>
          </span>
          <span className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 border border-slate-700 rounded">
            <Battery className="w-3.5 h-3.5 text-blue-400" />
            Grid Power: <strong className="text-emerald-400">96% Battery Backup</strong>
          </span>
        </div>
      </div>

      {/* Grid of Sensor Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sensors.map((sensor) => {
          const isSelected = selectedSensorId === sensor.id;
          const primaryMetric = sensor.metrics[sensor.primaryMetricKey];
          const isCritical = sensor.status === 'CRITICAL';
          const isWarning = sensor.status === 'WARNING';

          // Generate SVG Sparkline
          const historyValues = sensor.history.map((h) => h.value);
          const minVal = Math.min(...historyValues, primaryMetric?.baseline || 0);
          const maxVal = Math.max(...historyValues, primaryMetric?.thresholdCrit || 100);
          const range = maxVal - minVal || 1;

          const points = sensor.history
            .map((h, idx) => {
              const x = (idx / (sensor.history.length - 1)) * 180;
              const y = 40 - ((h.value - minVal) / range) * 36;
              return `${x},${y}`;
            })
            .join(' ');

          return (
            <div
              key={sensor.id}
              id={`card-sensor-${sensor.id}`}
              className={`bg-slate-900/90 rounded-xl border p-4 transition-all duration-200 flex flex-col justify-between ${
                isSelected
                  ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-lg shadow-blue-950/50'
                  : isCritical
                  ? 'border-red-600/70 bg-gradient-to-b from-red-950/20 to-slate-900'
                  : isWarning
                  ? 'border-orange-500/60'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                {/* Station Title & Status */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-slate-800 border border-slate-700">
                      {getSensorTypeIcon(sensor.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-bold text-slate-400">{sensor.code}</span>
                        <span className="text-slate-600">•</span>
                        <span className="text-[11px] text-slate-400 font-mono">{sensor.type}</span>
                      </div>
                      <h3 className="text-sm font-bold text-white leading-snug">{sensor.name}</h3>
                    </div>
                  </div>
                  <div>{getStatusBadge(sensor.status)}</div>
                </div>

                {/* Location & Elevation */}
                <div className="text-[11px] text-slate-400 flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                  <span>{sensor.location.sector}</span>
                  <span className="font-mono text-slate-500">
                    {sensor.location.elevationMeters >= 0 ? `+${sensor.location.elevationMeters}m` : `${sensor.location.elevationMeters}m MSL`}
                  </span>
                </div>

                {/* Primary Metric Reading & Sparkline */}
                {primaryMetric && (
                  <div className="bg-slate-950/80 rounded-lg p-3 border border-slate-800/80 mb-3">
                    <div className="flex items-end justify-between mb-1.5">
                      <div>
                        <span className="text-[11px] text-slate-400 block">{primaryMetric.label}</span>
                        <div className="flex items-baseline gap-1.5">
                          <span
                            className={`text-xl font-bold font-mono ${
                              isCritical ? 'text-red-400' : isWarning ? 'text-orange-400' : 'text-slate-100'
                            }`}
                          >
                            {primaryMetric.value}
                          </span>
                          <span className="text-xs text-slate-400 font-mono">{primaryMetric.unit}</span>
                        </div>
                      </div>

                      {/* Micro Sparkline */}
                      <div className="w-[120px] h-[36px] overflow-hidden">
                        <svg viewBox="0 0 180 40" className="w-full h-full">
                          <polyline
                            fill="none"
                            stroke={isCritical ? '#ef4444' : isWarning ? '#f97316' : '#38bdf8'}
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            points={points}
                          />
                        </svg>
                      </div>
                    </div>

                    {/* Progress Bar vs Warning & Critical Thresholds */}
                    <div className="space-y-1 text-[10px] font-mono">
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden flex">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            isCritical ? 'bg-red-500' : isWarning ? 'bg-orange-500' : 'bg-blue-500'
                          }`}
                          style={{
                            width: `${Math.min(
                              100,
                              Math.max(8, ((primaryMetric.value - minVal) / range) * 100)
                            )}%`,
                          }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-slate-500">
                        <span>Base: {primaryMetric.baseline}</span>
                        <span className="text-amber-500">Warn: {primaryMetric.thresholdWarn}</span>
                        <span className="text-red-400">Crit: {primaryMetric.thresholdCrit}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Sub-Metrics list */}
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono mb-3">
                  {(Object.entries(sensor.metrics) as [string, MetricData][])
                    .filter(([k]) => k !== sensor.primaryMetricKey)
                    .slice(0, 2)
                    .map(([key, m]) => (
                      <div key={key} className="bg-slate-950/50 p-2 rounded border border-slate-800/60">
                        <span className="text-[10px] text-slate-400 block truncate">{m.label}</span>
                        <span className="font-bold text-slate-200">
                          {m.value} <span className="text-[9px] text-slate-400">{m.unit}</span>
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2 text-xs">
                <button
                  onClick={() => onTriggerAnomaly(sensor.id)}
                  className="flex items-center gap-1 px-2.5 py-1 bg-red-950/40 hover:bg-red-900/50 text-red-300 border border-red-800/50 rounded text-[11px] font-medium transition"
                  title="Inject test spike to simulate rapid anomaly"
                >
                  <AlertTriangle className="w-3 h-3 text-red-400" />
                  <span>Test Spike</span>
                </button>

                <button
                  onClick={() => onSelectSensor(sensor)}
                  className={`flex items-center gap-1 px-3 py-1 rounded text-[11px] font-semibold transition ${
                    isSelected
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                  }`}
                >
                  <Sliders className="w-3 h-3" />
                  <span>Inspect Telemetry</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
