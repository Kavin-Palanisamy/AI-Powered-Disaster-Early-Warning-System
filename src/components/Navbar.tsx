import React from 'react';
import {
  AlertTriangle,
  Radio,
  Volume2,
  VolumeX,
  Activity,
  Layers,
  Sparkles,
  RefreshCw,
  Bell,
  Cpu,
  Clock,
} from 'lucide-react';
import { ThreatLevel } from '../types';
import { playEASTwoTone, playPulsedWarningSiren, stopAlertAudio } from '../utils/audioAlert';

interface NavbarProps {
  threatLevel: ThreatLevel;
  leadTimeSeconds: number;
  activeTab: 'overview' | 'sensors' | 'map' | 'actions' | 'broadcast' | 'simulation' | 'copilot';
  setActiveTab: (tab: 'overview' | 'sensors' | 'map' | 'actions' | 'broadcast' | 'simulation' | 'copilot') => void;
  isSimulating: boolean;
  onTriggerAiAnalysis: () => void;
  isAnalyzing: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  threatLevel,
  leadTimeSeconds,
  activeTab,
  setActiveTab,
  isSimulating,
  onTriggerAiAnalysis,
  isAnalyzing,
}) => {
  const [audioEnabled, setAudioEnabled] = React.useState(true);
  const [currentTime, setCurrentTime] = React.useState('');

  React.useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC');
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleTestAudio = () => {
    if (threatLevel === 'CRITICAL') {
      playPulsedWarningSiren(2.5);
    } else {
      playEASTwoTone(2.0);
    }
  };

  const getThreatBadge = () => {
    switch (threatLevel) {
      case 'CRITICAL':
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-red-500/15 border border-red-500/40 text-red-400 rounded-full text-xs font-semibold tracking-wide animate-pulse">
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            DEFCON 1: CRITICAL ALERT
          </div>
        );
      case 'HIGH':
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-orange-500/15 border border-orange-500/40 text-orange-400 rounded-full text-xs font-semibold tracking-wide">
            <span className="w-2 h-2 rounded-full bg-orange-500"></span>
            DEFCON 2: HIGH THREAT
          </div>
        );
      case 'MEDIUM':
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/15 border border-amber-500/40 text-amber-400 rounded-full text-xs font-semibold tracking-wide">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            DEFCON 3: ELEVATED WATCH
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 rounded-full text-xs font-semibold tracking-wide">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            DEFCON 4: NOMINAL GRID
          </div>
        );
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 text-slate-100">
      {/* Top Banner Ticker */}
      <div className="bg-slate-900/90 border-b border-slate-800/80 px-4 py-1.5 flex flex-wrap items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-emerald-400 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            LIVE TELEMETRY STREAM ONLINE
          </span>
          <span className="hidden sm:inline-block text-slate-600">|</span>
          <span className="hidden sm:flex items-center gap-1 font-mono text-slate-300">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            {currentTime}
          </span>
          {isSimulating && (
            <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 rounded text-[11px] font-medium">
              Simulation Injected
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {leadTimeSeconds > 0 && threatLevel === 'CRITICAL' && (
            <div className="flex items-center gap-2 bg-red-950/60 border border-red-500/50 px-2.5 py-0.5 rounded text-red-300 font-mono font-bold text-xs">
              <span className="text-[10px] text-red-400 tracking-wider uppercase">EARLY WARNING LEAD:</span>
              <span className="text-red-200">
                {Math.floor(leadTimeSeconds / 60)}m {leadTimeSeconds % 60}s
              </span>
            </div>
          )}

          <button
            id="btn-test-siren"
            onClick={handleTestAudio}
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded border border-slate-700 transition"
            title="Test EAS Two-Tone Alert sound"
          >
            <Bell className="w-3 h-3 text-amber-400" />
            <span className="hidden md:inline">Test Alert Audio</span>
          </button>

          <button
            id="btn-toggle-audio"
            onClick={() => {
              if (audioEnabled) {
                stopAlertAudio();
              }
              setAudioEnabled(!audioEnabled);
            }}
            className={`p-1.5 rounded text-xs transition border ${
              audioEnabled
                ? 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
                : 'bg-red-950/40 text-red-400 border-red-800/60'
            }`}
            title={audioEnabled ? 'Audio alerts active' : 'Audio alerts muted'}
          >
            {audioEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 via-rose-700 to-amber-600 p-0.5 shadow-lg shadow-red-950/40 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Radio className="w-5 h-5 text-red-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2">
                AEGIS <span className="text-xs px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-800/50 font-mono font-medium">EWS v3.7</span>
              </h1>
              {getThreatBadge()}
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              AI-Powered Multi-Hazard Disaster Early Warning & Predictive Network
            </p>
          </div>
        </div>

        {/* Global Action Tools */}
        <div className="flex items-center gap-2">
          <button
            id="btn-reanalyze-ai"
            onClick={onTriggerAiAnalysis}
            disabled={isAnalyzing}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-blue-900/30 transition disabled:opacity-50"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
            <span>{isAnalyzing ? 'Synthesizing...' : 'Predictive AI Forecast'}</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-t border-slate-800/80 bg-slate-950/60 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center gap-1 overflow-x-auto py-1.5 scrollbar-none text-xs">
          <button
            id="tab-overview"
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition ${
              activeTab === 'overview'
                ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-blue-400" />
            Situation Room
          </button>

          <button
            id="tab-map"
            onClick={() => setActiveTab('map')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition ${
              activeTab === 'map'
                ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            GIS Hazard Radar
          </button>

          <button
            id="tab-sensors"
            onClick={() => setActiveTab('sensors')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition ${
              activeTab === 'sensors'
                ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            Sensor Telemetry ({'6 Nodes'})
          </button>

          <button
            id="tab-actions"
            onClick={() => setActiveTab('actions')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition ${
              activeTab === 'actions'
                ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            Action Protocol & Shelters
          </button>

          <button
            id="tab-broadcast"
            onClick={() => setActiveTab('broadcast')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition ${
              activeTab === 'broadcast'
                ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-rose-400" />
            Public Broadcasts (EAS/WEA)
          </button>

          <button
            id="tab-simulation"
            onClick={() => setActiveTab('simulation')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition ${
              activeTab === 'simulation'
                ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
            Scenario Simulator
          </button>

          <button
            id="tab-copilot"
            onClick={() => setActiveTab('copilot')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition ${
              activeTab === 'copilot'
                ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            AI Incident Copilot
          </button>
        </div>
      </div>
    </header>
  );
};
