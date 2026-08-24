/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  SensorStation,
  DisasterEvent,
  PredictionAnalysis,
  BroadcastPackage,
  EvacuationShelter,
  EvacuationRoute,
  SimulationScenario,
  ThreatLevel,
} from './types';
import {
  INITIAL_SENSOR_STATIONS,
  INITIAL_ACTIVE_EVENT,
  EVACUATION_SHELTERS,
  EVACUATION_ROUTES,
} from './data/mockSensors';
import { Navbar } from './components/Navbar';
import { InteractiveDisasterMap } from './components/InteractiveDisasterMap';
import { LiveTelemetryGrid } from './components/LiveTelemetryGrid';
import { PredictiveAiPanel } from './components/PredictiveAiPanel';
import { EmergencyActionPlan } from './components/EmergencyActionPlan';
import { PublicAlertBroadcast } from './components/PublicAlertBroadcast';
import { ScenarioSimulator } from './components/ScenarioSimulator';
import { AiTacticalAssistant } from './components/AiTacticalAssistant';
import { SensorInspectorModal } from './components/SensorInspectorModal';
import {
  Activity,
  AlertTriangle,
  Radio,
  Sparkles,
  Shield,
  Layers,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export default function App() {
  const [sensors, setSensors] = useState<SensorStation[]>(INITIAL_SENSOR_STATIONS);
  const [activeEvent, setActiveEvent] = useState<DisasterEvent | null>(INITIAL_ACTIVE_EVENT);
  const [shelters, setShelters] = useState<EvacuationShelter[]>(EVACUATION_SHELTERS);
  const [routes, setRoutes] = useState<EvacuationRoute[]>(EVACUATION_ROUTES);
  const [activeTab, setActiveTab] = useState<'overview' | 'sensors' | 'map' | 'actions' | 'broadcast' | 'simulation' | 'copilot'>('overview');

  const [leadTimeSeconds, setLeadTimeSeconds] = useState<number>(INITIAL_ACTIVE_EVENT.leadTimeSeconds);
  const [isSimulating, setIsSimulating] = useState(false);
  const [activeScenarioId, setActiveScenarioId] = useState<string | undefined>('SCEN-QUAKE-TSUNAMI');
  const [selectedSensor, setSelectedSensor] = useState<SensorStation | null>(null);

  const [analysis, setAnalysis] = useState<PredictionAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [broadcast, setBroadcast] = useState<BroadcastPackage | null>(null);
  const [isGeneratingBroadcast, setIsGeneratingBroadcast] = useState(false);

  // 1. Lead-Time Countdown Timer
  useEffect(() => {
    if (!activeEvent || leadTimeSeconds <= 0) return;

    const timer = setInterval(() => {
      setLeadTimeSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [activeEvent, leadTimeSeconds]);

  // 2. Real-time Telemetry Micro-jitter stream
  useEffect(() => {
    const telemetryInterval = setInterval(() => {
      setSensors((prevSensors) =>
        prevSensors.map((sensor) => {
          const primaryKey = sensor.primaryMetricKey;
          const currentMetric = sensor.metrics[primaryKey];
          if (!currentMetric) return sensor;

          // Minor organic jitter (-1.5% to +1.5%)
          const jitterPercent = (Math.random() - 0.5) * 0.03;
          const newValue = Math.max(0, Number((currentMetric.value * (1 + jitterPercent)).toFixed(1)));

          const updatedHistory = [
            ...sensor.history.slice(1),
            { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), value: newValue },
          ];

          return {
            ...sensor,
            metrics: {
              ...sensor.metrics,
              [primaryKey]: {
                ...currentMetric,
                value: newValue,
              },
            },
            history: updatedHistory,
            signalLatencyMs: Math.floor(18 + Math.random() * 16),
            lastPing: 'Just now',
          };
        })
      );
    }, 4000);

    return () => clearInterval(telemetryInterval);
  }, []);

  // 3. Trigger AI Hazard Prediction via Backend API
  const handleTriggerAiAnalysis = useCallback(async () => {
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/gemini/analyze-telemetry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sensors,
          activeDisaster: activeEvent,
          scenarioContext: `Active monitoring across ${sensors.length} seismic, oceanic, hydrological, and geotechnical stations.`,
        }),
      });

      const data = await response.json();
      if (data && !data.error) {
        setAnalysis(data);
        if (data.leadTimeSeconds && activeEvent) {
          setLeadTimeSeconds(data.leadTimeSeconds);
        }
      }
    } catch (e) {
      console.error('Error fetching AI analysis:', e);
    } finally {
      setIsAnalyzing(false);
    }
  }, [sensors, activeEvent]);

  // 4. Generate Multi-Channel Emergency Broadcast via Backend API
  const handleGenerateBroadcast = useCallback(async () => {
    setIsGeneratingBroadcast(true);
    try {
      const response = await fetch('/api/gemini/generate-broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          threatLevel: activeEvent?.threatLevel || 'CRITICAL',
          hazardType: activeEvent?.type || 'Earthquake & Tsunami',
          targetLocation: 'Metropolitan Coastal & Valley Sectors',
          leadTimeSec: leadTimeSeconds,
          instructions: 'Proceed immediately to inland high ground or sturdy structural cover.',
        }),
      });

      const data = await response.json();
      if (data && !data.error) {
        setBroadcast(data);
      }
    } catch (e) {
      console.error('Error generating broadcast:', e);
    } finally {
      setIsGeneratingBroadcast(false);
    }
  }, [activeEvent, leadTimeSeconds]);

  // Initial analysis on load
  useEffect(() => {
    handleTriggerAiAnalysis();
  }, []);

  // 5. Sensor metric manual update & status recalculation
  const handleUpdateSensorMetric = (stationId: string, metricKey: string, newValue: number) => {
    setSensors((prev) =>
      prev.map((s) => {
        if (s.id !== stationId) return s;

        const targetMetric = s.metrics[metricKey];
        if (!targetMetric) return s;

        const updatedMetric = { ...targetMetric, value: newValue };
        const updatedMetrics = { ...s.metrics, [metricKey]: updatedMetric };

        // Determine new status based on primary metric
        let newStatus = s.status;
        if (metricKey === s.primaryMetricKey) {
          if (newValue >= targetMetric.thresholdCrit) {
            newStatus = 'CRITICAL';
          } else if (newValue >= targetMetric.thresholdWarn) {
            newStatus = 'WARNING';
          } else if (newValue > targetMetric.baseline * 1.3) {
            newStatus = 'ELEVATED';
          } else {
            newStatus = 'NORMAL';
          }
        }

        return {
          ...s,
          status: newStatus,
          metrics: updatedMetrics,
        };
      })
    );
  };

  // 6. Inject Anomaly Spike on a specific sensor
  const handleTriggerAnomaly = (stationId: string) => {
    setSensors((prev) =>
      prev.map((s) => {
        if (s.id !== stationId) return s;
        const pKey = s.primaryMetricKey;
        const pMetric = s.metrics[pKey];
        const spikeValue = Math.round(pMetric.thresholdCrit * 1.35);

        return {
          ...s,
          status: 'CRITICAL',
          metrics: {
            ...s.metrics,
            [pKey]: {
              ...pMetric,
              value: spikeValue,
            },
          },
          history: [...s.history.slice(1), { time: 'NOW', value: spikeValue }],
        };
      })
    );
    handleTriggerAiAnalysis();
  };

  // 7. Inject Simulation Scenario
  const handleInjectScenario = (scenario: SimulationScenario) => {
    setIsSimulating(true);
    setActiveScenarioId(scenario.id);

    // Update active event
    setActiveEvent({
      id: `EVT-${Date.now()}`,
      title: scenario.name,
      type: scenario.category,
      threatLevel: scenario.threatLevel,
      epicenter: scenario.epicenter,
      magnitude: scenario.magnitude,
      leadTimeSeconds: scenario.leadTimeSeconds,
      initialLeadTimeSeconds: scenario.leadTimeSeconds,
      radiusKm: 95,
      timestamp: new Date().toISOString(),
      status: 'WARNING_ACTIVE',
      affectedPopulation: scenario.affectedPopulation,
    });

    setLeadTimeSeconds(scenario.leadTimeSeconds);

    // Apply sensor modifiers
    setSensors((prev) =>
      prev.map((s) => {
        const modifier = scenario.sensorModifiers.find((m) => m.stationId === s.id);
        if (!modifier) return s;

        const pKey = s.primaryMetricKey;
        const pMetric = s.metrics[pKey];

        return {
          ...s,
          status: modifier.status,
          metrics: {
            ...s.metrics,
            [pKey]: {
              ...pMetric,
              value: modifier.primaryValue,
            },
          },
          history: [...s.history.slice(1), { time: 'INJECT', value: modifier.primaryValue }],
        };
      })
    );

    setTimeout(() => {
      handleTriggerAiAnalysis();
      handleGenerateBroadcast();
    }, 200);
  };

  // 8. Reset Grid to Baseline
  const handleResetGrid = () => {
    setIsSimulating(false);
    setActiveScenarioId(undefined);
    setSensors(INITIAL_SENSOR_STATIONS.map((s) => {
      const pKey = s.primaryMetricKey;
      const pMetric = s.metrics[pKey];
      return {
        ...s,
        status: 'NORMAL',
        metrics: {
          ...s.metrics,
          [pKey]: {
            ...pMetric,
            value: pMetric.baseline,
          },
        },
      };
    }));
    setActiveEvent({
      ...INITIAL_ACTIVE_EVENT,
      threatLevel: 'NOMINAL',
      status: 'CONTAINED',
      leadTimeSeconds: 0,
    });
    setLeadTimeSeconds(0);
    handleTriggerAiAnalysis();
  };

  const threatLevel: ThreatLevel = activeEvent?.threatLevel || 'NOMINAL';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col selection:bg-red-500 selection:text-white">
      {/* Global Navigation Bar */}
      <Navbar
        threatLevel={threatLevel}
        leadTimeSeconds={leadTimeSeconds}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isSimulating={isSimulating}
        onTriggerAiAnalysis={handleTriggerAiAnalysis}
        isAnalyzing={isAnalyzing}
      />

      {/* Main Container Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* VIEW 1: SITUATION ROOM OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Active Hazard Headline Bar */}
            {activeEvent && (
              <div
                id="active-incident-banner"
                className={`rounded-xl p-4 border flex flex-wrap items-center justify-between gap-4 shadow-lg ${
                  threatLevel === 'CRITICAL'
                    ? 'bg-gradient-to-r from-red-950/90 via-slate-900 to-red-950/80 border-red-500/60 shadow-red-950/40'
                    : threatLevel === 'HIGH'
                    ? 'bg-gradient-to-r from-orange-950/90 via-slate-900 to-orange-950/80 border-orange-500/60'
                    : 'bg-slate-900 border-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-red-950 border border-red-800 text-red-400">
                    <AlertTriangle className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-red-900/50 text-red-300 border border-red-700/50">
                        {activeEvent.type} ALERT ACTIVE
                      </span>
                      <span className="text-xs text-slate-400 font-mono">ID: {activeEvent.id}</span>
                    </div>
                    <h2 className="text-base sm:text-lg font-bold text-white leading-tight">
                      {activeEvent.title}
                    </h2>
                    <p className="text-xs text-slate-300">
                      Epicenter: <strong className="text-white">{activeEvent.epicenter.name}</strong> • Affected Pop: {(activeEvent.affectedPopulation / 1000000).toFixed(1)}M
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setActiveTab('broadcast')}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold shadow-md transition"
                  >
                    <Radio className="w-3.5 h-3.5" />
                    <span>View Public Broadcast</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('actions')}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition"
                  >
                    <Shield className="w-3.5 h-3.5 text-emerald-400" />
                    <span>SCADA Interlocks</span>
                  </button>
                </div>
              </div>
            )}

            {/* Predictive AI Forecasting Panel */}
            <PredictiveAiPanel
              analysis={analysis}
              activeEvent={activeEvent}
              leadTimeSeconds={leadTimeSeconds}
              isAnalyzing={isAnalyzing}
              onRefreshAnalysis={handleTriggerAiAnalysis}
            />

            {/* GIS Radar & Live Telemetry Dual Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Interactive GIS Map */}
              <div className="lg:col-span-7 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <Layers className="w-4 h-4 text-emerald-400" />
                    Live GIS Hazard & Radar Layer
                  </h3>
                  <button
                    onClick={() => setActiveTab('map')}
                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-mono"
                  >
                    <span>Full Map View</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
                <InteractiveDisasterMap
                  sensors={sensors}
                  activeEvent={activeEvent}
                  shelters={shelters}
                  routes={routes}
                  onSelectSensor={(sensor) => setSelectedSensor(sensor)}
                  selectedSensorId={selectedSensor?.id}
                />
              </div>

              {/* Right Column: Key Infrastructure & Shelter Quick Monitor */}
              <div className="lg:col-span-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <Shield className="w-4 h-4 text-blue-400" />
                    Priority SCADA Actions & Shelters
                  </h3>
                  <button
                    onClick={() => setActiveTab('actions')}
                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-mono"
                  >
                    <span>Full Protocol</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
                  <span className="text-[11px] font-bold text-slate-400 block font-mono">
                    CRITICAL AUTOMATION STATUS:
                  </span>
                  {(analysis?.infrastructureDirectives || [
                    { system: 'High-Speed Rail Line Alpha', action: 'Emergency Automatic Brake Trigger', priority: 'IMMEDIATE' },
                    { system: 'Municipal Gas Main', action: 'Sector Isolation Shutoff', priority: 'IMMEDIATE' },
                    { system: 'Power Transmission Grid', action: 'Substation Islanding', priority: 'HIGH' },
                  ]).slice(0, 3).map((dir, idx) => (
                    <div key={idx} className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-white block">{dir.system}</span>
                        <span className="text-[11px] text-slate-400 font-mono">{dir.action}</span>
                      </div>
                      <span className="px-2 py-0.5 bg-red-950 text-red-400 border border-red-800 rounded font-mono text-[9px] font-bold">
                        {dir.priority}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Shelter Quick Status */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2.5">
                  <span className="text-[11px] font-bold text-slate-400 block font-mono">
                    HIGH GROUND SHELTER CAPACITY:
                  </span>
                  {shelters.slice(0, 2).map((shl) => (
                    <div key={shl.id} className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-xs space-y-1">
                      <div className="flex justify-between font-medium">
                        <span className="text-white">{shl.name}</span>
                        <span className="text-emerald-400 font-mono">+{shl.altitudeMeters}m MSL</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-purple-500 h-full rounded-full"
                          style={{ width: `${(shl.occupied / shl.capacity) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Telemetry Sensor Row Preview */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  Live Sensor Network Array
                </h3>
                <button
                  onClick={() => setActiveTab('sensors')}
                  className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-mono"
                >
                  <span>View All Telemetry Nodes</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
              <LiveTelemetryGrid
                sensors={sensors}
                onSelectSensor={(sensor) => setSelectedSensor(sensor)}
                selectedSensorId={selectedSensor?.id}
                onUpdateSensorMetric={handleUpdateSensorMetric}
                onTriggerAnomaly={handleTriggerAnomaly}
              />
            </div>
          </div>
        )}

        {/* VIEW 2: GIS HAZARD RADAR */}
        {activeTab === 'map' && (
          <div className="space-y-4">
            <InteractiveDisasterMap
              sensors={sensors}
              activeEvent={activeEvent}
              shelters={shelters}
              routes={routes}
              onSelectSensor={(sensor) => setSelectedSensor(sensor)}
              selectedSensorId={selectedSensor?.id}
            />
          </div>
        )}

        {/* VIEW 3: SENSOR TELEMETRY ARRAY */}
        {activeTab === 'sensors' && (
          <div className="space-y-4">
            <LiveTelemetryGrid
              sensors={sensors}
              onSelectSensor={(sensor) => setSelectedSensor(sensor)}
              selectedSensorId={selectedSensor?.id}
              onUpdateSensorMetric={handleUpdateSensorMetric}
              onTriggerAnomaly={handleTriggerAnomaly}
            />
          </div>
        )}

        {/* VIEW 4: ACTION PROTOCOL & SHELTERS */}
        {activeTab === 'actions' && (
          <div className="space-y-4">
            <EmergencyActionPlan
              directives={
                analysis?.infrastructureDirectives || [
                  { system: 'High-Speed Rail Line Alpha', action: 'Emergency Automatic Brake Trigger (EB-01)', priority: 'IMMEDIATE' },
                  { system: 'Municipal Gas Distribution Main', action: 'Actuate Sector Isolation Shutoff Valves', priority: 'IMMEDIATE' },
                  { system: 'Power Transmission Grid', action: 'Initiate Autonomous Substation Islanding', priority: 'HIGH' },
                  { system: 'Major Highway Bridges', action: 'Activate Digital Variable Message Signs (VMS) to Halted', priority: 'HIGH' },
                ]
              }
              shelters={shelters}
              routes={routes}
              evacuationRecommendations={
                analysis?.evacuationRecommendations || [
                  'District 4 & Harbor zones proceed immediately to Inland Sector B high-ground assembly point.',
                  'Avoid underpasses, coastal seawalls, and unreinforced masonry corridors.',
                  'Maintain clear corridors along Highway 101 Northbound for first responder apparatus.',
                ]
              }
            />
          </div>
        )}

        {/* VIEW 5: PUBLIC BROADCASTS (EAS / WEA) */}
        {activeTab === 'broadcast' && (
          <div className="space-y-4">
            <PublicAlertBroadcast
              broadcast={broadcast}
              threatLevel={threatLevel}
              hazardType={activeEvent?.type || 'EARTHQUAKE'}
              leadTimeSeconds={leadTimeSeconds}
              onGenerateBroadcast={handleGenerateBroadcast}
              isGenerating={isGeneratingBroadcast}
            />
          </div>
        )}

        {/* VIEW 6: SCENARIO SIMULATOR */}
        {activeTab === 'simulation' && (
          <div className="space-y-4">
            <ScenarioSimulator
              onInjectScenario={handleInjectScenario}
              onResetGrid={handleResetGrid}
              isSimulating={isSimulating}
              activeScenarioId={activeScenarioId}
            />
          </div>
        )}

        {/* VIEW 7: AI TACTICAL INCIDENT COPILOT */}
        {activeTab === 'copilot' && (
          <div className="space-y-4">
            <AiTacticalAssistant
              activeEvent={activeEvent}
              analysis={analysis}
              systemStateSummary={{
                leadTimeSeconds,
                sensorsCount: sensors.length,
                threatLevel,
              }}
            />
          </div>
        )}
      </main>

      {/* Sensor Deep Inspector Modal */}
      {selectedSensor && (
        <SensorInspectorModal
          sensor={selectedSensor}
          onClose={() => setSelectedSensor(null)}
          onUpdateMetric={handleUpdateSensorMetric}
        />
      )}
    </div>
  );
}
