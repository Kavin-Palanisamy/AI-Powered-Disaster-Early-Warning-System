import React, { useState } from 'react';
import {
  BroadcastPackage,
  ThreatLevel,
} from '../types';
import {
  Radio,
  Smartphone,
  Tv,
  Globe2,
  Volume2,
  Send,
  CheckCircle2,
  Copy,
  Check,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { playEASTwoTone, playPulsedWarningSiren } from '../utils/audioAlert';

interface PublicAlertBroadcastProps {
  broadcast: BroadcastPackage | null;
  threatLevel: ThreatLevel;
  hazardType: string;
  leadTimeSeconds: number;
  onGenerateBroadcast: () => void;
  isGenerating: boolean;
}

export const PublicAlertBroadcast: React.FC<PublicAlertBroadcastProps> = ({
  broadcast,
  threatLevel,
  hazardType,
  leadTimeSeconds,
  onGenerateBroadcast,
  isGenerating,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isDispatched, setIsDispatched] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<'Spanish' | 'French' | 'Japanese'>('Spanish');

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDispatch = () => {
    setIsDispatched(true);
    if (threatLevel === 'CRITICAL') {
      playPulsedWarningSiren(3.0);
    } else {
      playEASTwoTone(2.5);
    }
    setTimeout(() => {
      setIsDispatched(false);
    }, 4000);
  };

  const defaultBroadcast: BroadcastPackage = {
    easTitle: `EMERGENCY ACTION NOTIFICATION - ${hazardType.toUpperCase()} WARNING`,
    weaShortSms: `EMERGENCY ALERT: Severe ${hazardType} detected in Metro Coast. Seek high ground or structural cover now!`,
    weaDetailedSms: `CIVIL EMERGENCY MESSAGE: Destructive ${hazardType} shock & inundation wavefront expected in ${leadTimeSeconds || 45}s. Evacuate coastlines & low-lying floodplains. Proceed along Corridor Blue toward Highland Civic Center. Avoid bridges and elevators.`,
    radioBroadcastScript: `Attention, attention. The National Disaster Early Warning System has issued an immediate Emergency Action Notification for all coastal and delta sectors. A major ${hazardType} has been detected. Ground shaking and water surge will begin in under one minute. Drop, cover, and hold on or move to upper floors away from windows. Stand by for EAS updates on this station.`,
    sirenCadence: 'Wailing 3-Minute High-Low Frequency Modulation (Standard Evacuation Cadence)',
    multilingualAlerts: {
      Spanish: `ALERTA DE EMERGENCIA: Se detectó ${hazardType} inminente en su sector. Busque refugio en terrenos altos de inmediato. Siga las rutas de evacuación designadas.`,
      French: `ALERTE D'URGENCE: ${hazardType} majeur détecté. Évacuez immédiatement les zones côtières et basses. Rejoignez les abris sécurisés.`,
      Japanese: `緊急警報: 大規模な ${hazardType} が検知されました。直ちに高台や指定避難所へ避難してください。エレベーターは使用しないでください。`,
    },
  };

  const pkg = broadcast || defaultBroadcast;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 md:p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-rose-400 animate-pulse" />
            <h2 className="text-sm sm:text-base font-bold text-white">
              Multi-Channel Emergency Alert Dispatcher (EAS / WEA / CAP)
            </h2>
            <span className="px-2 py-0.5 bg-rose-950 text-rose-300 border border-rose-800 rounded text-[10px] font-mono">
              COMMON ALERTING PROTOCOL v1.2
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Automated multi-carrier cellular broadcast, siren cadence protocol, and multilingual civil defense dissemination.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-regen-broadcast"
            onClick={onGenerateBroadcast}
            disabled={isGenerating}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Generating...' : 'Re-Synthesize Broadcast'}</span>
          </button>

          <button
            id="btn-dispatch-alerts"
            onClick={handleDispatch}
            disabled={isDispatched}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white rounded-lg text-xs font-bold shadow-lg shadow-red-950/60 transition"
          >
            {isDispatched ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-300 animate-bounce" />
                <span>BROADCAST TRANSMITTING...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>TRANSMIT EMERGENCY BROADCAST</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Broadcast Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* WEA Mobile Cell Broadcast */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 md:p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">Wireless Emergency Alerts (WEA Cell Broadcast)</h3>
            </div>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-2 py-0.5 rounded">
              3GPP 4G/5G Cell Broadcast
            </span>
          </div>

          {/* Short 90-char SMS Card */}
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-slate-400">Primary Headline (90 Characters Max):</span>
              <button
                onClick={() => handleCopy(pkg.weaShortSms, 'weaShort')}
                className="text-slate-400 hover:text-white flex items-center gap-1 text-[10px]"
              >
                {copiedKey === 'weaShort' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedKey === 'weaShort' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <p className="text-xs text-white font-mono bg-slate-900 p-2.5 rounded border border-slate-800">
              {pkg.weaShortSms}
            </p>
          </div>

          {/* Detailed 360-char SMS Card */}
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-slate-400">Detailed Action Guidance (360 Characters):</span>
              <button
                onClick={() => handleCopy(pkg.weaDetailedSms, 'weaDetailed')}
                className="text-slate-400 hover:text-white flex items-center gap-1 text-[10px]"
              >
                {copiedKey === 'weaDetailed' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedKey === 'weaDetailed' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <p className="text-xs text-slate-200 font-mono bg-slate-900 p-2.5 rounded border border-slate-800">
              {pkg.weaDetailedSms}
            </p>
          </div>
        </div>

        {/* EAS Broadcast System & Radio Announcer */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 md:p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Tv className="w-4 h-4 text-rose-400" />
              <h3 className="text-sm font-bold text-white">Emergency Alert System (EAS TV / Radio Crawler)</h3>
            </div>
            <span className="text-[10px] font-mono text-rose-400 bg-rose-950/60 border border-rose-800/60 px-2 py-0.5 rounded">
              EAS Dual-Tone 853Hz+960Hz
            </span>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-slate-400">TV Crawler Headline:</span>
              <button
                onClick={() => handleCopy(pkg.easTitle, 'easTitle')}
                className="text-slate-400 hover:text-white flex items-center gap-1 text-[10px]"
              >
                {copiedKey === 'easTitle' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedKey === 'easTitle' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <p className="text-xs text-red-400 font-bold font-mono bg-slate-900 p-2 rounded border border-red-950">
              {pkg.easTitle}
            </p>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-slate-400">Live Radio Broadcast Announcer Script:</span>
              <button
                onClick={() => handleCopy(pkg.radioBroadcastScript, 'radioScript')}
                className="text-slate-400 hover:text-white flex items-center gap-1 text-[10px]"
              >
                {copiedKey === 'radioScript' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedKey === 'radioScript' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-900 p-2.5 rounded border border-slate-800 italic">
              "{pkg.radioBroadcastScript}"
            </p>
          </div>
        </div>
      </div>

      {/* Multilingual Dissemination & Siren Protocols */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Multilingual Translations */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 md:p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <Globe2 className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Multilingual Civil Defense Translations</h3>
            </div>
            <div className="flex items-center gap-1">
              {(['Spanish', 'French', 'Japanese'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setSelectedLanguage(lang)}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono transition ${
                    selectedLanguage === lang
                      ? 'bg-emerald-600 text-white font-bold'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
            <div className="flex items-center justify-between text-[11px] font-mono mb-1 text-slate-400">
              <span>{selectedLanguage} Public Notice:</span>
              <button
                onClick={() => handleCopy(pkg.multilingualAlerts[selectedLanguage], selectedLanguage)}
                className="text-slate-400 hover:text-white flex items-center gap-1 text-[10px]"
              >
                {copiedKey === selectedLanguage ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedKey === selectedLanguage ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <p className="text-xs text-slate-200 bg-slate-900 p-2.5 rounded border border-slate-800 leading-relaxed font-sans">
              {pkg.multilingualAlerts[selectedLanguage]}
            </p>
          </div>
        </div>

        {/* Outdoor Warning Siren Cadence */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 md:p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white">Acoustic Outdoor Siren Specification</h3>
            </div>
            <span className="text-[10px] font-mono text-amber-400 bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded">
              High-Power Array 130dB
            </span>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-2">
            <span className="text-[11px] text-slate-400 font-mono block">Cadence Modulation:</span>
            <p className="text-xs font-mono text-amber-300 bg-slate-900 p-2.5 rounded border border-slate-800 font-semibold">
              {pkg.sirenCadence}
            </p>
            <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-400">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>Broadcasts across 42 high-elevation siren towers in coastal districts.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
