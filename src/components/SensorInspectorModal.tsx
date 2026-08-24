import React, { useState } from 'react';
import {
  SensorStation,
  MetricData,
} from '../types';
import {
  X,
  Sliders,
  Activity,
  Battery,
  Wifi,
  MapPin,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';

interface SensorInspectorModalProps {
  sensor: SensorStation | null;
  onClose: () => void;
  onUpdateMetric: (stationId: string, metricKey: string, newValue: number) => void;
}

export const SensorInspectorModal: React.FC<SensorInspectorModalProps> = ({
  sensor,
  onClose,
  onUpdateMetric,
}) => {
  if (!sensor) return null;

  const [activeMetricKey, setActiveMetricKey] = useState(sensor.primaryMetricKey);
  const currentMetric = sensor.metrics[activeMetricKey] || Object.values(sensor.metrics)[0];
  const [sliderVal, setSliderVal] = useState(currentMetric?.value || 0);

  const handleSliderChange = (newVal: number) => {
    setSliderVal(newVal);
    onUpdateMetric(sensor.id, activeMetricKey, newVal);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Modal Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-blue-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-slate-400">{sensor.code}</span>
                <span className="text-slate-600">•</span>
                <span className="text-xs text-blue-400 font-mono font-bold">{sensor.type}</span>
              </div>
              <h3 className="text-base font-bold text-white">{sensor.name}</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5">
          {/* Metadata Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-500 block">Sector Zone</span>
              <span className="text-slate-200 font-bold truncate block">{sensor.location.sector}</span>
            </div>
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-500 block">Altitude / Depth</span>
              <span className="text-slate-200 font-bold">
                {sensor.location.elevationMeters >= 0 ? `+${sensor.location.elevationMeters}m MSL` : `${sensor.location.elevationMeters}m Subsea`}
              </span>
            </div>
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-500 block">Signal Latency</span>
              <span className="text-emerald-400 font-bold">{sensor.signalLatencyMs}ms (Optical)</span>
            </div>
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-500 block">Hardware Battery</span>
              <span className="text-blue-400 font-bold">{sensor.batteryPercent}% LiFePO4</span>
            </div>
          </div>

          {/* Metric Selector Tabs */}
          <div>
            <label className="text-xs text-slate-400 block mb-2 font-medium">Select Telemetry Metric Channel:</label>
            <div className="flex flex-wrap gap-2">
              {(Object.entries(sensor.metrics) as [string, MetricData][]).map(([key, m]) => (
                <button
                  key={key}
                  onClick={() => {
                    setActiveMetricKey(key);
                    setSliderVal(m.value);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition flex items-center gap-2 ${
                    activeMetricKey === key
                      ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-950'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                  }`}
                >
                  <span>{m.label}:</span>
                  <strong className="text-white">
                    {m.value} {m.unit}
                  </strong>
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Calibration & Anomaly Slider */}
          {currentMetric && (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 font-mono">Live Injected Reading:</span>
                  <div className="text-2xl font-black text-white font-mono flex items-baseline gap-1.5">
                    <span
                      className={
                        sliderVal >= currentMetric.thresholdCrit
                          ? 'text-red-400 animate-pulse'
                          : sliderVal >= currentMetric.thresholdWarn
                          ? 'text-orange-400'
                          : 'text-emerald-400'
                      }
                    >
                      {sliderVal}
                    </span>
                    <span className="text-xs text-slate-400 font-normal">{currentMetric.unit}</span>
                  </div>
                </div>

                <div className="text-right text-xs font-mono">
                  <span className="text-slate-500 block">Baseline Value:</span>
                  <span className="text-slate-300 font-bold">{currentMetric.baseline} {currentMetric.unit}</span>
                </div>
              </div>

              {/* Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-400 font-medium">
                  <span>Adjust Sensor Level:</span>
                  <span className="text-slate-500 font-mono">
                    Crit Threshold: {currentMetric.thresholdCrit} {currentMetric.unit}
                  </span>
                </div>
                <input
                  type="range"
                  min={Math.floor(currentMetric.baseline * 0.5)}
                  max={Math.ceil(currentMetric.thresholdCrit * 2.2)}
                  step={currentMetric.unit.includes('Mw') ? 0.1 : 1}
                  value={sliderVal}
                  onChange={(e) => handleSliderChange(parseFloat(e.target.value))}
                  className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>

              {/* Threshold status indicators */}
              <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-mono pt-2 border-t border-slate-800/80">
                <div className={`p-2 rounded border ${sliderVal < currentMetric.thresholdWarn ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300 font-bold' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
                  Nominal Range
                </div>
                <div className={`p-2 rounded border ${sliderVal >= currentMetric.thresholdWarn && sliderVal < currentMetric.thresholdCrit ? 'bg-orange-950/60 border-orange-800 text-orange-300 font-bold' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
                  Warning Alert (≥{currentMetric.thresholdWarn})
                </div>
                <div className={`p-2 rounded border ${sliderVal >= currentMetric.thresholdCrit ? 'bg-red-950/60 border-red-800 text-red-300 font-bold animate-pulse' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
                  Critical Breach (≥{currentMetric.thresholdCrit})
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition"
          >
            Apply & Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
