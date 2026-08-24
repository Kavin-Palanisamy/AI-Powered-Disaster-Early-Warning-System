import React from 'react';
import {
  PredictionAnalysis,
  DisasterEvent,
} from '../types';
import {
  Sparkles,
  AlertOctagon,
  Clock,
  ShieldAlert,
  GitCommit,
  ArrowRight,
  RefreshCw,
  TrendingUp,
  Cpu,
} from 'lucide-react';

interface PredictiveAiPanelProps {
  analysis: PredictionAnalysis | null;
  activeEvent: DisasterEvent | null;
  leadTimeSeconds: number;
  isAnalyzing: boolean;
  onRefreshAnalysis: () => void;
}

export const PredictiveAiPanel: React.FC<PredictiveAiPanelProps> = ({
  analysis,
  activeEvent,
  leadTimeSeconds,
  isAnalyzing,
  onRefreshAnalysis,
}) => {
  const getSeverityBadge = (sev: string) => {
    switch (sev.toUpperCase()) {
      case 'CRITICAL':
        return <span className="px-2 py-0.5 bg-red-950 text-red-400 border border-red-800 rounded font-mono text-[10px] font-bold">CRITICAL</span>;
      case 'HIGH':
        return <span className="px-2 py-0.5 bg-orange-950 text-orange-400 border border-orange-800 rounded font-mono text-[10px] font-bold">HIGH</span>;
      case 'MEDIUM':
        return <span className="px-2 py-0.5 bg-amber-950 text-amber-400 border border-amber-800 rounded font-mono text-[10px] font-bold">MEDIUM</span>;
      default:
        return <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded font-mono text-[10px]">LOW</span>;
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 md:p-5 shadow-xl space-y-5">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-950">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-white">
                Predictive AI Hazard & Early Warning Engine
              </h2>
              <span className="px-2 py-0.5 bg-indigo-950/80 text-indigo-300 border border-indigo-700/50 rounded text-[10px] font-mono">
                GEMINI 3.7 FLASH
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Deep anomaly triangulation & cascading multi-hazard impact modeling
            </p>
          </div>
        </div>

        <button
          id="btn-refresh-prediction"
          onClick={onRefreshAnalysis}
          disabled={isAnalyzing}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md transition disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
          <span>{isAnalyzing ? 'Processing Telemetry...' : 'Re-Forecast Risk'}</span>
        </button>
      </div>

      {/* Hero Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono">
        {/* Early Warning Lead Time */}
        <div className="bg-slate-950/90 border border-red-500/40 rounded-xl p-3.5 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-red-400" />
              Impact Lead Time
            </span>
            <span className="text-[10px] text-red-400 font-bold animate-pulse">COUNTDOWN</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-red-400 tracking-tight">
            {leadTimeSeconds > 0 ? (
              <>
                {Math.floor(leadTimeSeconds / 60)
                  .toString()
                  .padStart(2, '0')}
                :{(leadTimeSeconds % 60).toString().padStart(2, '0')}
                <span className="text-xs text-red-500 ml-1 font-normal">sec</span>
              </>
            ) : (
              <span className="text-xl text-red-300">WAVEFRONT ARRIVED</span>
            )}
          </div>
          <p className="text-[10px] text-slate-500 mt-1 font-sans">
            Window to trigger automated civil cutoffs & warnings
          </p>
        </div>

        {/* AI Confidence */}
        <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-3.5">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5 text-blue-400" />
              AI Model Confidence
            </span>
            <span className="text-[10px] text-blue-400">BAYESIAN ENSEMBLE</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-blue-400">
            {analysis?.aiConfidence || 96}%
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1.5">
            <div
              className="bg-blue-500 h-full rounded-full"
              style={{ width: `${analysis?.aiConfidence || 96}%` }}
            ></div>
          </div>
        </div>

        {/* Impact Probability */}
        <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-3.5">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="flex items-center gap-1">
              <AlertOctagon className="w-3.5 h-3.5 text-amber-400" />
              Impact Probability
            </span>
            <span className="text-[10px] text-amber-400">CRITICAL RADIUS</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-400">
            {analysis?.impactProbability || 91}%
          </div>
          <p className="text-[10px] text-slate-500 mt-1 font-sans">
            Targeting {activeEvent?.affectedPopulation ? `${(activeEvent.affectedPopulation / 1000000).toFixed(1)}M residents` : 'High Density Metro'}
          </p>
        </div>

        {/* Affected Hazard Radius */}
        <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-3.5">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
              Impact Perimeter
            </span>
            <span className="text-[10px] text-purple-400">GIS BUFFER</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-purple-400">
            {analysis?.affectedRadiusKm || 95} <span className="text-sm font-normal text-slate-400">km</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1 font-sans">
            Primary ground shaking & inundation footprint
          </p>
        </div>
      </div>

      {/* AI Synthesis Summary Card */}
      <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
          <ShieldAlert className="w-4 h-4 text-rose-400" />
          <span>TACTICAL SITUATIONAL ASSESSMENT</span>
        </div>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          {analysis?.summary ||
            'Multi-station telemetry shows synchronous threshold breach across primary acoustic and seismic sensors with secondary tsunami surge propagation detected in offshore DART buoys.'}
        </p>
      </div>

      {/* Cascading Hazard Timeline Chain */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-200 flex items-center gap-2 uppercase tracking-wider">
            <GitCommit className="w-4 h-4 text-emerald-400" />
            Predicted Cascading Hazard Chain
          </h3>
          <span className="text-[11px] text-slate-500 font-mono">Multi-Hazard Compounding Sequence</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {(
            analysis?.cascadingHazards || [
              { hazard: 'Secondary S-Wave Arrival', delayMinutes: 1, probability: 95, severity: 'CRITICAL' },
              { hazard: 'Structural Resonance & Liquefaction', delayMinutes: 4, probability: 78, severity: 'HIGH' },
              { hazard: 'Coastal Surge / Tsunami Threat', delayMinutes: 18, probability: 62, severity: 'MEDIUM' },
            ]
          ).map((cascade, idx) => (
            <div
              key={idx}
              className="bg-slate-950 border border-slate-800 rounded-lg p-3 relative overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-[10px] font-mono text-slate-500">STAGE {idx + 1}</span>
                  {getSeverityBadge(cascade.severity)}
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-white mb-2">{cascade.hazard}</h4>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-500" />
                  +{cascade.delayMinutes} min delay
                </span>
                <span className="text-blue-400 font-bold">{cascade.probability}% prob</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
