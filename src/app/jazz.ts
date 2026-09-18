// Goofy jazz sting played when the gift box is opened: a swung walking bass,
// honking comp chords, brush hats, and a random slide-whistle squeal.

const BASS = [
  [43, 45, 46, 48],
  [48, 50, 52, 53],
  [41, 43, 45, 46],
  [50, 48, 46, 45],
];
const CHORDS = [
  [62, 65, 69, 72],
  [64, 67, 70, 74],
  [60, 64, 69, 71],
  [62, 65, 69, 72],
];
const BEAT = 0.34;
const SWING = BEAT * 0.64;

const mtof = (midi: number) => 440 * Math.pow(2, (midi - 69) / 12);

export type JazzPlayer = {
  start: () => void;
  stop: () => void;
};

export function createJazzPlayer(): JazzPlayer {
  let ctx: AudioContext | null = null;
  let master: GainNode | null = null;
  let playing = false;
  let loopId: number | undefined;
  let bar = 0;
  let next = 0;

  const tone = (midi: number, at: number, dur: number, type: OscillatorType, vol: number) => {
    if (!ctx || !master) return;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.value = mtof(midi);
    g.gain.setValueAtTime(0.0001, at);
    g.gain.linearRampToValueAtTime(vol, at + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0008, at + dur);
    o.connect(g);
    g.connect(master);
    o.start(at);
    o.stop(at + dur + 0.06);
  };

  const honk = (midi: number, at: number, dur: number, vol: number) => {
    if (!ctx || !master) return;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    const f = ctx.createBiquadFilter();
    o.type = "sawtooth";
    o.frequency.setValueAtTime(mtof(midi) * 0.94, at);
    o.frequency.linearRampToValueAtTime(mtof(midi), at + 0.05);
    f.type = "lowpass";
    f.frequency.value = 1700;
    g.gain.setValueAtTime(0.0001, at);
    g.gain.linearRampToValueAtTime(vol, at + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0008, at + dur);
    o.connect(f);
    f.connect(g);
    g.connect(master);
    o.start(at);
    o.stop(at + dur + 0.05);
  };

  const squeal = (at: number) => {
    if (!ctx || !master) return;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(880, at);
    o.frequency.exponentialRampToValueAtTime(320, at + 0.34);
    g.gain.setValueAtTime(0.0001, at);
    g.gain.linearRampToValueAtTime(0.16, at + 0.03);
    g.gain.exponentialRampToValueAtTime(0.0008, at + 0.36);
    o.connect(g);
    g.connect(master);
    o.start(at);
    o.stop(at + 0.4);
  };

  const hat = (at: number, vol: number) => {
    if (!ctx || !master) return;
    const len = 0.05;
    const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * len), ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const hp = ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 7200;
    const g = ctx.createGain();
    g.gain.value = vol;
    src.connect(hp);
    hp.connect(g);
    g.connect(master);
    src.start(at);
  };

  const schedule = () => {
    if (!playing || !ctx) return;

    while (next < ctx.currentTime + 0.8) {
      const b = bar % 4;
      for (let i = 0; i < 4; i++) {
        const t = next + i * BEAT;
        tone(BASS[b][i], t, BEAT * 0.85, "triangle", 0.5);
        hat(t, 0.09);
        hat(t + SWING, 0.2);
        if (i === 0 || i === 2) {
          const off = i === 0 ? 0 : SWING * 0.4;
          CHORDS[b].forEach((m) => honk(m, t + off, BEAT * 0.9, 0.09));
        }
        if (i === 3 && bar % 4 === 3) tone(BASS[b][i] + 12, t + SWING, BEAT * 0.5, "square", 0.12);
      }
      if (bar % 8 === 7) squeal(next + BEAT * 3.2);
      next += BEAT * 4;
      bar++;
    }

    loopId = window.setTimeout(schedule, 180);
  };

  return {
    start() {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC || playing) return;
      ctx = ctx ?? new AC();
      if (ctx.state === "suspended") ctx.resume();
      master = ctx.createGain();
      master.gain.value = 0.24;
      master.connect(ctx.destination);
      playing = true;
      bar = 0;
      next = ctx.currentTime + 0.06;
      schedule();
    },
    stop() {
      playing = false;
      window.clearTimeout(loopId);
      if (master && ctx) {
        const m = master;
        try {
          m.gain.setTargetAtTime(0, ctx.currentTime, 0.05);
        } catch {
          // ignore — context may already be closing
        }
        window.setTimeout(() => {
          try {
            m.disconnect();
          } catch {
            // ignore
          }
        }, 400);
        master = null;
      }
    },
  };
}
