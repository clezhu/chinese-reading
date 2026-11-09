export type LessonSound = "reveal" | "got-it" | "not-yet" | "complete";

type Note = { frequency: number; offset: number; duration: number };
const notes: Record<LessonSound, readonly Note[]> = {
  reveal: [{ frequency: 660, offset: 0, duration: 0.09 }],
  "got-it": [{ frequency: 740, offset: 0, duration: 0.1 }, { frequency: 988, offset: 0.045, duration: 0.1 }],
  "not-yet": [{ frequency: 440, offset: 0, duration: 0.1 }],
  complete: [{ frequency: 523.25, offset: 0, duration: 0.22 }, { frequency: 659.25, offset: 0.1, duration: 0.22 }, { frequency: 783.99, offset: 0.2, duration: 0.25 }],
};

/** No AudioContext is created until prime() is called by a user gesture.
 * Async completion may play only through that already-unlocked context. Audio
 * is optional: missing APIs, blocked resume and closed contexts never affect UI.
 */
export function createLessonAudio() {
  let context: AudioContext | null = null;
  let ready: Promise<boolean> = Promise.resolve(false);
  let enabled = true;
  let disposed = false;
  let generation = 0;
  const voices = new Set<OscillatorNode>();

  const stop = () => {
    generation++;
    for (const voice of voices) {
      try { voice.stop(); } catch { /* Already ended. */ }
      voice.disconnect();
    }
    voices.clear();
  };

  return {
    prime() {
      if (!enabled || disposed || typeof window === "undefined") return;
      try {
        const Audio = window.AudioContext ?? (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!Audio) return;
        context ??= new Audio();
        // Invoke resume synchronously within the click/keyboard activation.
        ready = context.state === "running" ? Promise.resolve(true)
          : context.resume().then(() => context?.state === "running", () => false);
      } catch { ready = Promise.resolve(false); }
    },
    play(sound: LessonSound) {
      if (!enabled || disposed || !context) return;
      const currentGeneration = generation;
      void ready.then((unlocked) => {
        if (!unlocked || !enabled || disposed || generation !== currentGeneration || context?.state !== "running") return;
        try {
          const now = context.currentTime;
          for (const note of notes[sound]) {
            const voice = context.createOscillator();
            const gain = context.createGain();
            const start = now + note.offset;
            voice.type = "sine";
            voice.frequency.setValueAtTime(note.frequency, start);
            gain.gain.setValueAtTime(0, start);
            gain.gain.linearRampToValueAtTime(0.035, start + 0.012);
            gain.gain.exponentialRampToValueAtTime(0.0001, start + note.duration);
            voice.connect(gain);
            gain.connect(context.destination);
            voices.add(voice);
            voice.onended = () => { voices.delete(voice); voice.disconnect(); gain.disconnect(); };
            voice.start(start);
            voice.stop(start + note.duration + 0.01);
          }
        } catch { /* Sound must never interrupt a learning or save action. */ }
      }).catch(() => { /* Unavailable audio stays silent. */ });
    },
    setEnabled(value: boolean) { enabled = value; if (!value) stop(); },
    dispose() {
      disposed = true;
      stop();
      if (context) { try { void context.close().catch(() => {}); } catch { /* Already closed. */ } }
      context = null;
    },
  };
}
