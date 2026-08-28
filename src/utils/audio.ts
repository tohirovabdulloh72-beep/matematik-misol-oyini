// Web Audio API sound synthesizer for gaming effects

let audioCtx: AudioContext | null = null;
let isMuted = false;
let currentSongRotationIndex = 0;
let activeSongNodes: { osc: OscillatorNode; gain: GainNode }[] = [];
let activeSongTimeouts: number[] = [];

export interface SongInfo {
  index: number;
  name: string;
  emoji: string;
  duration: number;
}

export const SONGS_LIST: { name: string; emoji: string }[] = [
  { name: "Yulduzli Raqs (Star Dance)", emoji: "⭐" },
  { name: "G'alaba Marsi (Victory March)", emoji: "🏆" },
  { name: "Elektron Ritmlar (Electro Beat)", emoji: "⚡" },
  { name: "Quvnoq Sarguzasht (Joyful Adventure)", emoji: "🎉" },
  { name: "Sehrli Ohang (Magic Melody)", emoji: "✨" },
];

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function setMuted(muted: boolean) {
  isMuted = muted;
  if (muted) {
    stopCurrentSong();
  }
  if (typeof window !== 'undefined') {
    localStorage.setItem('math_game_muted', JSON.stringify(muted));
  }
}

export function getMuted(): boolean {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('math_game_muted');
    if (saved !== null) {
      try {
        isMuted = JSON.parse(saved);
      } catch {
        isMuted = false;
      }
    }
  }
  return isMuted;
}

export function stopCurrentSong() {
  activeSongTimeouts.forEach((t) => clearTimeout(t));
  activeSongTimeouts = [];

  activeSongNodes.forEach(({ osc, gain }) => {
    try {
      gain.gain.setValueAtTime(0.001, audioCtx ? audioCtx.currentTime : 0);
      osc.stop();
      osc.disconnect();
      gain.disconnect();
    } catch {
      // already stopped
    }
  });
  activeSongNodes = [];
}

export function playClick() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(600, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.05);

  gain.gain.setValueAtTime(0.12, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.05);
}

// Helper to play a scheduled note in 5s song
function scheduleSongNote(
  ctx: AudioContext,
  freq: number,
  startTime: number,
  duration: number,
  type: OscillatorType = 'triangle',
  volume = 0.15
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime);

  gain.gain.setValueAtTime(0.001, startTime);
  gain.gain.linearRampToValueAtTime(volume, startTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(startTime);
  osc.stop(startTime + duration + 0.05);

  activeSongNodes.push({ osc, gain });
}

// 5-second rich multi-voice song synthesizer with rotation
export function playNextVictorySong(): SongInfo | null {
  if (isMuted) return null;
  const ctx = getAudioContext();
  if (!ctx) return null;

  // Stop previous song to prevent overlapping noise
  stopCurrentSong();

  const songIdx = currentSongRotationIndex % SONGS_LIST.length;
  currentSongRotationIndex = (currentSongRotationIndex + 1) % SONGS_LIST.length;

  const songData = SONGS_LIST[songIdx];
  const now = ctx.currentTime;

  // Frequencies
  const C4 = 261.63, D4 = 293.66, E4 = 329.63, F4 = 349.23, G4 = 392.00, A4 = 440.00, B4 = 493.88;
  const C5 = 523.25, D5 = 587.33, E5 = 659.25, F5 = 698.46, G5 = 783.99, A5 = 880.00, B5 = 987.77;
  const C6 = 1046.50, D6 = 1174.66, E6 = 1318.51, G6 = 1567.98;
  const C3 = 130.81, G3 = 196.00, A3 = 220.00, F3 = 174.61, E3 = 164.81;

  if (songIdx === 0) {
    // 🌟 Song 1: "Yulduzli Raqs" (Star Dance - 5s upbeat electro chiptune)
    const melody = [
      { f: C5, t: 0.0, d: 0.22 },
      { f: E5, t: 0.25, d: 0.22 },
      { f: G5, t: 0.5, d: 0.22 },
      { f: C6, t: 0.75, d: 0.4 },
      { f: B5, t: 1.25, d: 0.22 },
      { f: G5, t: 1.5, d: 0.22 },
      { f: A5, t: 1.75, d: 0.22 },
      { f: C6, t: 2.0, d: 0.45 },
      { f: D6, t: 2.5, d: 0.22 },
      { f: C6, t: 2.75, d: 0.22 },
      { f: E6, t: 3.0, d: 0.35 },
      { f: D6, t: 3.4, d: 0.25 },
      { f: C6, t: 3.7, d: 0.3 },
      { f: G5, t: 4.05, d: 0.25 },
      { f: C6, t: 4.35, d: 0.6 },
    ];

    melody.forEach((note) => {
      scheduleSongNote(ctx, note.f, now + note.t, note.d, 'triangle', 0.16);
      scheduleSongNote(ctx, note.f * 0.5, now + note.t, note.d, 'sine', 0.09);
    });

    // Rhythm bass pulses across 5 seconds
    const bass = [
      { f: C3, t: 0.0 }, { f: G3, t: 0.6 }, { f: A3, t: 1.25 }, { f: F3, t: 1.85 },
      { f: C3, t: 2.5 }, { f: G3, t: 3.1 }, { f: A3, t: 3.7 }, { f: C3, t: 4.3 }
    ];
    bass.forEach((b) => scheduleSongNote(ctx, b.f, now + b.t, 0.45, 'sawtooth', 0.07));

  } else if (songIdx === 1) {
    // 🏆 Song 2: "G'alaba Marsi" (Victory March - 5s Triumphant Fanfare)
    const melody = [
      { f: G4, t: 0.0, d: 0.18 },
      { f: C5, t: 0.2, d: 0.18 },
      { f: E5, t: 0.4, d: 0.18 },
      { f: G5, t: 0.6, d: 0.45 },
      { f: E5, t: 1.15, d: 0.2 },
      { f: G5, t: 1.4, d: 0.5 },
      { f: A5, t: 2.0, d: 0.25 },
      { f: B5, t: 2.3, d: 0.25 },
      { f: C6, t: 2.6, d: 0.5 },
      { f: E6, t: 3.2, d: 0.35 },
      { f: D6, t: 3.6, d: 0.3 },
      { f: C6, t: 4.0, d: 0.9 },
    ];

    melody.forEach((note) => {
      scheduleSongNote(ctx, note.f, now + note.t, note.d, 'sine', 0.18);
      scheduleSongNote(ctx, note.f * 1.5, now + note.t, note.d * 0.8, 'triangle', 0.08);
    });

    const chords = [
      { f: C4, t: 0.0, d: 0.9 },
      { f: G4, t: 1.15, d: 0.8 },
      { f: A4, t: 2.0, d: 0.9 },
      { f: C4, t: 3.2, d: 1.7 },
    ];
    chords.forEach((c) => scheduleSongNote(ctx, c.f, now + c.t, c.d, 'triangle', 0.09));

  } else if (songIdx === 2) {
    // ⚡ Song 3: "Elektron Ritmlar" (Electro Beat - 5s energetic dance groove)
    const melody = [
      { f: E5, t: 0.0, d: 0.15 },
      { f: G5, t: 0.18, d: 0.15 },
      { f: A5, t: 0.36, d: 0.22 },
      { f: B5, t: 0.65, d: 0.28 },
      { f: D6, t: 1.0, d: 0.22 },
      { f: B5, t: 1.28, d: 0.22 },
      { f: A5, t: 1.55, d: 0.22 },
      { f: G5, t: 1.85, d: 0.35 },
      { f: E5, t: 2.3, d: 0.18 },
      { f: G5, t: 2.5, d: 0.18 },
      { f: A5, t: 2.7, d: 0.25 },
      { f: B5, t: 3.0, d: 0.25 },
      { f: E6, t: 3.3, d: 0.45 },
      { f: D6, t: 3.8, d: 0.3 },
      { f: E6, t: 4.2, d: 0.75 },
    ];

    melody.forEach((note) => {
      scheduleSongNote(ctx, note.f, now + note.t, note.d, 'sawtooth', 0.12);
      scheduleSongNote(ctx, note.f * 0.5, now + note.t, note.d, 'triangle', 0.12);
    });

    // Sub pulses
    for (let i = 0; i < 10; i++) {
      scheduleSongNote(ctx, i % 2 === 0 ? 110 : 165, now + i * 0.5, 0.2, 'sine', 0.1);
    }

  } else if (songIdx === 3) {
    // 🎉 Song 4: "Quvnoq Sarguzasht" (Joyful Adventure - 5s bouncy melody)
    const melody = [
      { f: C5, t: 0.0, d: 0.2 },
      { f: D5, t: 0.22, d: 0.2 },
      { f: E5, t: 0.45, d: 0.3 },
      { f: G5, t: 0.8, d: 0.2 },
      { f: A5, t: 1.05, d: 0.2 },
      { f: G5, t: 1.3, d: 0.35 },
      { f: E5, t: 1.75, d: 0.2 },
      { f: D5, t: 2.0, d: 0.2 },
      { f: C5, t: 2.25, d: 0.4 },
      { f: G5, t: 2.75, d: 0.25 },
      { f: C6, t: 3.05, d: 0.4 },
      { f: A5, t: 3.55, d: 0.3 },
      { f: G5, t: 3.9, d: 0.25 },
      { f: C6, t: 4.25, d: 0.7 },
    ];

    melody.forEach((note) => {
      scheduleSongNote(ctx, note.f, now + note.t, note.d, 'triangle', 0.16);
      scheduleSongNote(ctx, note.f * 1.25, now + note.t, note.d * 0.6, 'sine', 0.07);
    });

    // Bass line
    const bass = [
      { f: C3, t: 0.0 }, { f: E3, t: 0.8 }, { f: A3, t: 1.6 },
      { f: F3, t: 2.4 }, { f: G3, t: 3.2 }, { f: C3, t: 4.1 }
    ];
    bass.forEach((b) => scheduleSongNote(ctx, b.f, now + b.t, 0.6, 'sine', 0.12));

  } else {
    // ✨ Song 5: "Sehrli Ohang" (Magic Melody - 5s Sparkling Chimes)
    const melody = [
      { f: F5, t: 0.0, d: 0.2 },
      { f: A5, t: 0.22, d: 0.2 },
      { f: C6, t: 0.45, d: 0.35 },
      { f: E6, t: 0.85, d: 0.4 },
      { f: D6, t: 1.3, d: 0.25 },
      { f: C6, t: 1.6, d: 0.25 },
      { f: A5, t: 1.9, d: 0.35 },
      { f: C6, t: 2.3, d: 0.25 },
      { f: D6, t: 2.6, d: 0.3 },
      { f: G6, t: 3.0, d: 0.45 },
      { f: E6, t: 3.55, d: 0.35 },
      { f: C6, t: 4.0, d: 0.95 },
    ];

    melody.forEach((note) => {
      scheduleSongNote(ctx, note.f, now + note.t, note.d, 'sine', 0.2);
      scheduleSongNote(ctx, note.f * 2, now + note.t, note.d * 0.4, 'triangle', 0.06);
    });

    const bells = [C4, F4, A4, C5, G4, C5];
    bells.forEach((freq, idx) => {
      scheduleSongNote(ctx, freq, now + idx * 0.8, 0.7, 'triangle', 0.08);
    });
  }

  // Auto clean up active nodes after 5.2s
  const cleanupTimeout = window.setTimeout(() => {
    stopCurrentSong();
  }, 5200);
  activeSongTimeouts.push(cleanupTimeout);

  return {
    index: songIdx + 1,
    name: songData.name,
    emoji: songData.emoji,
    duration: 5,
  };
}

export function playCorrect() {
  return playNextVictorySong();
}

export function playCombo(streak: number) {
  // Always trigger the rotating 5-second victory song
  return playNextVictorySong();
}

export function playWrong() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  // Stop any playing music so wrong buzzer is distinct
  stopCurrentSong();

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(220, now);
  osc.frequency.linearRampToValueAtTime(110, now + 0.35);

  gain.gain.setValueAtTime(0.22, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.38);
}

export function playLevelUp() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  stopCurrentSong();
  const now = ctx.currentTime;
  const notes = [440, 554.37, 659.25, 880, 1108.73, 1318.51]; // A major arpeggio
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.18, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
  gain.connect(ctx.destination);

  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now + i * 0.09);
    osc.connect(gain);
    osc.start(now + i * 0.09);
    osc.stop(now + 0.8);
  });
}

export function playGameOver() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  stopCurrentSong();
  const now = ctx.currentTime;
  const notes = [440, 392, 349.23, 293.66]; // Descending
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.2, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
  gain.connect(ctx.destination);

  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now + i * 0.16);
    osc.connect(gain);
    osc.start(now + i * 0.16);
    osc.stop(now + 0.9);
  });
}

export function playTick() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(900, now);
  gain.gain.setValueAtTime(0.08, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.04);
}

