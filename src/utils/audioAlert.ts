// Web Audio API based Emergency Audio Tone Generator

let audioCtx: AudioContext | null = null;
let activeOscillators: OscillatorNode[] = [];
let activeGainNodes: GainNode[] = [];

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function stopAlertAudio() {
  activeOscillators.forEach((osc) => {
    try {
      osc.stop();
      osc.disconnect();
    } catch {
      // ignore
    }
  });
  activeGainNodes.forEach((g) => {
    try {
      g.disconnect();
    } catch {
      // ignore
    }
  });
  activeOscillators = [];
  activeGainNodes = [];
}

/**
 * Plays standard EAS Dual-Tone Emergency Alert (853 Hz + 960 Hz)
 */
export function playEASTwoTone(durationSeconds = 2.5) {
  const ctx = getAudioContext();
  if (!ctx) return;

  stopAlertAudio();

  const now = ctx.currentTime;
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0.01, now);
  masterGain.gain.exponentialRampToValueAtTime(0.18, now + 0.08);
  masterGain.gain.setValueAtTime(0.18, now + durationSeconds - 0.1);
  masterGain.gain.exponentialRampToValueAtTime(0.001, now + durationSeconds);
  masterGain.connect(ctx.destination);
  activeGainNodes.push(masterGain);

  // 853 Hz Tone
  const osc1 = ctx.createOscillator();
  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(853, now);
  osc1.connect(masterGain);
  osc1.start(now);
  osc1.stop(now + durationSeconds);
  activeOscillators.push(osc1);

  // 960 Hz Tone
  const osc2 = ctx.createOscillator();
  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(960, now);
  osc2.connect(masterGain);
  osc2.start(now);
  osc2.stop(now + durationSeconds);
  activeOscillators.push(osc2);
}

/**
 * Plays Pulsed Emergency Siren Tone (High Urgency Early Warning)
 */
export function playPulsedWarningSiren(durationSeconds = 3) {
  const ctx = getAudioContext();
  if (!ctx) return;

  stopAlertAudio();

  const now = ctx.currentTime;
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0.01, now);
  masterGain.gain.linearRampToValueAtTime(0.15, now + 0.05);
  masterGain.gain.setValueAtTime(0.15, now + durationSeconds - 0.1);
  masterGain.gain.linearRampToValueAtTime(0.001, now + durationSeconds);
  masterGain.connect(ctx.destination);
  activeGainNodes.push(masterGain);

  const osc = ctx.createOscillator();
  osc.type = 'sawtooth';
  
  // Modulate frequency between 600Hz and 1200Hz
  for (let t = 0; t < durationSeconds; t += 0.8) {
    osc.frequency.setValueAtTime(600, now + t);
    osc.frequency.exponentialRampToValueAtTime(1250, now + t + 0.4);
    osc.frequency.exponentialRampToValueAtTime(600, now + t + 0.8);
  }

  osc.connect(masterGain);
  osc.start(now);
  osc.stop(now + durationSeconds);
  activeOscillators.push(osc);
}

/**
 * Plays short acknowledgment ping
 */
export function playTelemetryPing() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.08, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
  gain.connect(ctx.destination);

  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(1046.5, now); // C6 tone
  osc.connect(gain);
  osc.start(now);
  osc.stop(now + 0.25);
}
