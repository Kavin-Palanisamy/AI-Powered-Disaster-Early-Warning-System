import React, { useState } from 'react';
import {
  InfrastructureDirective,
  EvacuationShelter,
  EvacuationRoute,
} from '../types';
import {
  ShieldAlert,
  Train,
  Flame,
  Zap,
  Navigation,
  CheckCircle2,
  AlertTriangle,
  Play,
  Check,
  Building,
  Users,
  MapPin,
} from 'lucide-react';

interface EmergencyActionPlanProps {
  directives: InfrastructureDirective[];
  shelters: EvacuationShelter[];
  routes: EvacuationRoute[];
  evacuationRecommendations: string[];
}

export const EmergencyActionPlan: React.FC<EmergencyActionPlanProps> = ({
  directives,
  shelters,
  routes,
  evacuationRecommendations,
}) => {
  const [executedActions, setExecutedActions] = useState<Record<number, boolean>>({
    0: true, // Default high-speed rail executed
  });

  const [checklistCompleted, setChecklistCompleted] = useState<Record<number, boolean>>({});

  const handleToggleDirective = (idx: number) => {
    setExecutedActions((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const getSystemIcon = (systemName: string) => {
    const s = systemName.toLowerCase();
    if (s.includes('rail') || s.includes('train')) return <Train className="w-4 h-4 text-blue-400" />;
    if (s.includes('gas') || s.includes('valve') || s.includes('pipeline')) return <Flame className="w-4 h-4 text-orange-400" />;
    if (s.includes('power') || s.includes('grid') || s.includes('substation')) return <Zap className="w-4 h-4 text-amber-400" />;
    return <Building className="w-4 h-4 text-emerald-400" />;
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority.toUpperCase()) {
      case 'IMMEDIATE':
        return <span className="px-2 py-0.5 bg-red-950 text-red-400 border border-red-800 rounded font-mono text-[10px] font-bold">IMMEDIATE</span>;
      case 'HIGH':
        return <span className="px-2 py-0.5 bg-orange-950 text-orange-400 border border-orange-800 rounded font-mono text-[10px] font-bold">HIGH</span>;
      default:
        return <span className="px-2 py-0.5 bg-amber-950 text-amber-400 border border-amber-800 rounded font-mono text-[10px]">MEDIUM</span>;
    }
  };

  const getRouteRiskBadge = (risk: string) => {
    switch (risk) {
      case 'SAFE':
        return <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded font-mono text-[10px] font-bold">OPTIMAL ROUTE</span>;
      case 'CAUTION':
        return <span className="px-2 py-0.5 bg-amber-950 text-amber-400 border border-amber-800 rounded font-mono text-[10px] font-bold">CONGESTED</span>;
      default:
        return <span className="px-2 py-0.5 bg-red-950 text-red-400 border border-red-800 rounded font-mono text-[10px] font-bold">HIGH HAZARD</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Infrastructure Automation Directives */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 md:p-5 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-400" />
              Automated Critical Infrastructure Interlocks (SCADA)
            </h2>
            <p className="text-xs text-slate-400">
              Immediate autonomous commands triggered during the early warning lead-time window to prevent catastrophic fires & derailments.
            </p>
          </div>
          <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-1 rounded">
            SCADA Automation: ONLINE
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {directives.map((dir, idx) => {
            const isExecuted = executedActions[idx];

            return (
              <div
                key={idx}
                className={`rounded-xl border p-3.5 transition flex flex-col justify-between ${
                  isExecuted
                    ? 'bg-slate-950 border-emerald-800/60 shadow-sm'
                    : 'bg-slate-950/80 border-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                        {getSystemIcon(dir.system)}
                      </div>
                      <span className="font-bold text-xs text-white">{dir.system}</span>
                    </div>
                    {getPriorityBadge(dir.priority)}
                  </div>
                  <p className="text-xs text-slate-300 font-mono mb-3 bg-slate-900/60 p-2 rounded border border-slate-800/80">
                    {dir.action}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                  <span className="text-[11px] font-mono flex items-center gap-1.5">
                    {isExecuted ? (
                      <span className="text-emerald-400 flex items-center gap-1 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        COMMAND EXECUTED
                      </span>
                    ) : (
                      <span className="text-amber-400 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        PENDING ACTUATION
                      </span>
                    )}
                  </span>

                  <button
                    onClick={() => handleToggleDirective(idx)}
                    className={`px-3 py-1 rounded text-xs font-semibold transition ${
                      isExecuted
                        ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                        : 'bg-red-600 hover:bg-red-500 text-white shadow-md shadow-red-950'
                    }`}
                  >
                    {isExecuted ? 'Override Status' : 'Trigger Command'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Evacuation Corridors & Shelters */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recommended Corridors */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 md:p-5 shadow-xl space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Navigation className="w-4 h-4 text-emerald-400" />
              Dynamic Evacuation Corridors
            </h3>
            <p className="text-xs text-slate-400">
              AI-optimized escape routes routing civilians away from low-lying surge zones and liquefaction corridors.
            </p>
          </div>

          <div className="space-y-3">
            {routes.map((rt) => (
              <div key={rt.id} className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-xs text-white">{rt.name}</span>
                  {getRouteRiskBadge(rt.riskLevel)}
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 font-mono">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Origin:</span>
                    {rt.originSector}
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Destination:</span>
                    {rt.destinationShelter}
                  </div>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/80 font-mono">
                  <span>Est Transit: <strong className="text-white">{rt.transitTimeMin} mins</strong></span>
                  <span className="text-emerald-400">{rt.capacityRate}</span>
                </div>
              </div>
            ))}
          </div>

          {/* AI Specific Directives */}
          {evacuationRecommendations.length > 0 && (
            <div className="bg-blue-950/40 border border-blue-800/50 rounded-lg p-3 space-y-1.5">
              <span className="text-[11px] font-bold text-blue-300 uppercase tracking-wider block">
                AI Evacuation Guidelines
              </span>
              <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                {evacuationRecommendations.map((rec, i) => (
                  <li key={i}>{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* High-Ground Emergency Shelters */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 md:p-5 shadow-xl space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Building className="w-4 h-4 text-purple-400" />
              High-Ground Resiliency Shelters
            </h3>
            <p className="text-xs text-slate-400">
              Reinforced reception centers equipped with emergency power, triage medicine, and high elevation protection.
            </p>
          </div>

          <div className="space-y-3">
            {shelters.map((shl) => {
              const occPercent = Math.round((shl.occupied / shl.capacity) * 100);

              return (
                <div key={shl.id} className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-xs text-white">{shl.name}</h4>
                      <span className="text-[11px] text-slate-400">{shl.sector}</span>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded font-mono text-[10px] font-bold">
                      +{shl.altitudeMeters}m MSL
                    </span>
                  </div>

                  <div className="space-y-1 text-[11px] font-mono">
                    <div className="flex justify-between text-slate-300">
                      <span>Occupancy:</span>
                      <span>
                        {shl.occupied.toLocaleString()} / {shl.capacity.toLocaleString()} ({occPercent}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          occPercent > 90 ? 'bg-red-500' : occPercent > 70 ? 'bg-amber-500' : 'bg-purple-500'
                        }`}
                        style={{ width: `${occPercent}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 pt-1">
                    {shl.amenities.map((am, i) => (
                      <span key={i} className="px-1.5 py-0.5 bg-slate-900 border border-slate-800 text-slate-400 text-[10px] rounded">
                        {am}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
