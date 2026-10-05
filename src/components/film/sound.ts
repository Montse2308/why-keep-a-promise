/**
 * Plays the film's score (src/lib/film/sound.ts) with Web Audio. Nothing sounds until the visitor
 * presses the sound button, the gesture browsers ask for before a page may play; pressing it again
 * fades the sound out and suspends it. The choice is not stored: every visit starts silent.
 */
import { MASTER_GAIN, SCORE, SILENT, envelopePoints, type Cue, type Voice } from '../../lib/film/sound';

export interface Sound {
  readonly on: boolean;
  /** Turns the sound on or off; returns whether it is on now. */
  toggle(): boolean;
  /** Plays a cue now, or `after` seconds from now, if the sound is on. */
  play(cue: Cue, after?: number): void;
}

type AudioContextClass = typeof AudioContext;

/** The player, or null where the browser has no Web Audio: the button then stays hidden. */
export function createSound(): Sound | null {
  const Context: AudioContextClass | undefined = window.AudioContext ?? (window as unknown as { webkitAudioContext?: AudioContextClass }).webkitAudioContext;
  if (!Context) return null;

  let ctx: AudioContext | null = null;
  let master: GainNode | null = null;
  let noise: AudioBuffer | null = null;
  let on = false;

  const voice = (audio: AudioContext, out: AudioNode, v: Voice, start: number): void => {
    const gain = audio.createGain();
    const [[t0, g0], [t1, g1], [t2, g2]] = envelopePoints(v) as [[number, number], [number, number], [number, number]];
    gain.gain.setValueAtTime(g0, start + t0);
    gain.gain.linearRampToValueAtTime(g1, start + t1);
    gain.gain.exponentialRampToValueAtTime(g2, start + t2);
    gain.connect(out);
    const end = start + v.at + v.duration + 0.02;
    if (v.kind === 'tone') {
      const osc = audio.createOscillator();
      osc.type = v.wave;
      osc.frequency.setValueAtTime(v.from, start + v.at);
      if (v.to) osc.frequency.exponentialRampToValueAtTime(v.to, start + v.at + v.duration);
      osc.connect(gain);
      osc.start(start + v.at);
      osc.stop(end);
      osc.onended = () => gain.disconnect();
    } else {
      const source = audio.createBufferSource();
      source.buffer = noise;
      const filter = audio.createBiquadFilter();
      filter.type = v.filter;
      filter.frequency.value = v.frequency;
      filter.Q.value = v.q;
      source.connect(filter).connect(gain);
      source.start(start + v.at);
      source.stop(end);
      source.onended = () => {
        filter.disconnect();
        gain.disconnect();
      };
    }
  };

  return {
    get on() {
      return on;
    },
    toggle() {
      on = !on;
      if (on) {
        if (!ctx) {
          ctx = new Context();
          master = ctx.createGain();
          master.connect(ctx.destination);
          // One second of white noise: every burst of the score is shorter than that.
          noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
          const data = noise.getChannelData(0);
          for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
        }
        const now = ctx.currentTime;
        master?.gain.cancelScheduledValues(now);
        master?.gain.setValueAtTime(MASTER_GAIN, now);
        void ctx.resume();
      } else if (ctx && master) {
        const now = ctx.currentTime;
        const audio = ctx;
        master.gain.cancelScheduledValues(now);
        master.gain.setValueAtTime(master.gain.value, now);
        master.gain.exponentialRampToValueAtTime(SILENT, now + 0.15);
        setTimeout(() => {
          if (!on) void audio.suspend();
        }, 200);
      }
      return on;
    },
    play(cue, after = 0) {
      if (!on || !ctx || !master) return;
      const start = ctx.currentTime + 0.01 + after;
      for (const v of SCORE[cue]) voice(ctx, master, v, start);
    },
  };
}
