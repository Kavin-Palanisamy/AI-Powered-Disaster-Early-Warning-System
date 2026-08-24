import React, { useState } from 'react';
import {
  SimulationScenario,
  HazardType,
} from '../types';
import {
  RefreshCw,
  Zap,
  Activity,
  Waves,
  CloudRain,
  Flame,
  Wind,
  Sliders,
  Sparkles,
  Play,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';
import { PRESET_SCENARIOS } from '../data/mockSensors';

interface ScenarioSimulatorProps {
  onInjectScenario: (scenario: SimulationScenario) => void;
  onResetGrid: () => void;
  isSimulating: boolean;
  activeScenarioId?: string;
}

export const ScenarioSimulator: React.FC<ScenarioSimulatorProps> = ({
  onInjectScenario,
  onResetGrid,
  isSimulating,
  activeScenarioId,
}) => {
  const [customType, setCustomType] = useState<HazardType>('EARTHQUAKE');
  const [customIntensity, setCustomIntensity] = useState<number>(4);
  const [isGeneratingAiScenario, setIsGeneratingAiScenario] = useState(false);

  const getScenarioIcon = (cat: HazardType) => {
    switch (cat) {
      case 'EARTHQUAKE':
        return <Activity className="w-4 h-4 text-rose-400" />;
      case 'TSUNAMI':
        return <Waves className="w-4 h-4 text-cyan-400" />;
      case 'CYCLONE':
        return <Wind className="w-4 h-4 text-indigo-400" />;
      case 'FLASH_FLOOD':
        return <CloudRain className="w-4 h-4 text-blue-400" />;
      case 'WILDFIRE':
        return <Flame className="w-4 h-4 text-orange-400" />;
      default:
        return <Zap className="w-4 h-4 text-amber-400" />;
    }
  };

  const handleGenerateAiScenario = async () => {
    setIsGeneratingAiScenario(true);
    try {
      const res = await fetch('/api/gemini/generate-scenario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenarioType: customType,
          intensity: customIntensity,
        }),
      });

      const data = await res.json();
      if (data && data.name) {
        const syntheticScenario: SimulationScenario = {
          id: `SCEN-AI-${Date.now()}`,
          name: data.name,
          category: customType,
          threatLevel: data.threatLevel || 'CRITICAL',
          leadTimeSeconds: data.leadTimeSeconds || 45,
          description: data.description,
          epicenter: data.epicenter,
          affectedPopulation: data.affectedPopulationEst || 1500000,
          sensorModifiers: (data.anomalies || []).map((a: any) => ({
            stationId: a.stationId,
            primaryValue: a.value,
            status: a.status || 'CRITICAL',
          })),
        };
        onInjectScenario(syntheticScenario);
      }
    } catch (e) {
      console.error('Failed to generate AI scenario:', e);
    } finally {
      setIsGeneratingAiScenario(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 md:p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-indigo-400" />
            <h2 className="text-sm sm:text-base font-bold text-white">
              Extreme Disaster Scenario Simulation & Stress Lab
            </h2>
            <span className="px-2 py-0.5 bg-indigo-950 text-indigo-300 border border-indigo-800 rounded text-[10px] font-mono">
              STRESS TEST HARNESS
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Inject synthetic multi-sensor anomalies to test the AI Early Warning algorithm's detection latency, lead-time calculations, and automated SCADA triggers.
          </p>
        </div>

        <button
          id="btn-reset-nominal"
          onClick={onResetGrid}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition"
        >
          <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
          <span>Reset Grid to Nominal Baseline</span>
        </button>
      </div>

      {/* Preset Scenarios Grid */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" />
          Pre-Configured High-Risk Disaster Scenarios
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PRESET_SCENARIOS.map((scen) => {
            const isActive = activeScenarioId === scen.id;

            return (
              <div
                key={scen.id}
                className={`bg-slate-900 rounded-xl border p-4 transition flex flex-col justify-between ${
                  isActive
                    ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-gradient-to-b from-indigo-950/20 to-slate-900'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-slate-800 border border-slate-700">
                        {getScenarioIcon(scen.category)}
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-slate-400 block">{scen.category}</span>
                        <h4 className="text-sm font-bold text-white">{scen.name}</h4>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 bg-red-950 text-red-400 border border-red-800 rounded font-mono text-[10px] font-bold">
                      {scen.threatLevel}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed mb-3">{scen.description}</p>

                  <div className="bg-slate-950/80 rounded-lg p-2.5 border border-slate-800/80 text-[11px] font-mono space-y-1 mb-3">
                    <div className="flex justify-between text-slate-400">
                      <span>Epicenter / Source:</span>
                      <span className="text-slate-200">{scen.epicenter.name}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Affected Population:</span>
                      <span className="text-amber-400 font-bold">{(scen.affectedPopulation / 1000000).toFixed(1)}M citizens</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Early Warning Window:</span>
                      <span className="text-red-400 font-bold">{scen.leadTimeSeconds} seconds</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onInjectScenario(scen)}
                  className={`w-full py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${
                    isActive
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                  }`}
                >
                  <Play className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{isActive ? 'Scenario Active in Grid' : 'Inject Disaster Scenario'}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Synthetic Scenario Generator */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 md:p-5 shadow-xl space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <h3 className="text-sm font-bold text-white">AI Synthetic Disaster Scenario Generator</h3>
          <span className="text-[10px] font-mono text-purple-400 bg-purple-950/60 border border-purple-800/60 px-2 py-0.5 rounded">
            Gemini 3.7 Dynamic Inject
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-slate-400 block mb-1.5 font-medium">Hazard Category:</label>
            <select
              value={customType}
              onChange={(e) => setCustomType(e.target.value as HazardType)}
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-indigo-500 font-mono"
            >
              <option value="EARTHQUAKE">Subduction Megaquake</option>
              <option value="TSUNAMI">Oceanic Tsunami Surge</option>
              <option value="FLASH_FLOOD">Cloudburst Dam Overspill</option>
              <option value="CYCLONE">Super Typhoon / Hurricane</option>
              <option value="WILDFIRE">Pyroconvective Wildfire</option>
              <option value="LANDSLIDE">Massive Slope Failure / Lahar</option>
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5 font-medium">
              <span>Severity Intensity Scale:</span>
              <span className="text-amber-400 font-mono font-bold">Level {customIntensity} / 5</span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={customIntensity}
              onChange={(e) => setCustomIntensity(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
              <span>1 (Moderate)</span>
              <span>3 (Severe)</span>
              <span>5 (Catastrophic)</span>
            </div>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleGenerateAiScenario}
              disabled={isGeneratingAiScenario}
              className="w-full py-2 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-lg text-xs font-bold shadow-lg shadow-purple-950 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Sparkles className={`w-4 h-4 ${isGeneratingAiScenario ? 'animate-spin' : ''}`} />
              <span>{isGeneratingAiScenario ? 'Synthesizing Scenario...' : 'Generate & Inject Scenario'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
