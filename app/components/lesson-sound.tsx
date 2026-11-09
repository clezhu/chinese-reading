import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { createLessonAudio, type LessonSound } from "../lib/lesson-audio";

export const SOUND_STORAGE_KEY = "hanzi-garden:sound";
const silent = { enabled: true, toggle: () => {}, prime: () => {}, play: (_sound: LessonSound) => {} };
const SoundContext = createContext(silent);

export function LessonSoundProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(true);
  const preference = useRef(true);
  const audio = useRef<ReturnType<typeof createLessonAudio> | null>(null);

  useEffect(() => {
    const player = createLessonAudio();
    audio.current = player;
    try { preference.current = localStorage.getItem(SOUND_STORAGE_KEY) !== "off"; } catch { /* Optional storage. */ }
    player.setEnabled(preference.current);
    setEnabled(preference.current);
    const sync = (event: StorageEvent) => {
      if (event.key !== SOUND_STORAGE_KEY && event.key !== null) return;
      preference.current = event.newValue !== "off";
      player.setEnabled(preference.current);
      setEnabled(preference.current);
    };
    window.addEventListener("storage", sync);
    return () => { window.removeEventListener("storage", sync); player.dispose(); audio.current = null; };
  }, []);

  const toggle = useCallback(() => {
    preference.current = !preference.current;
    audio.current?.setEnabled(preference.current);
    setEnabled(preference.current);
    try { localStorage.setItem(SOUND_STORAGE_KEY, preference.current ? "on" : "off"); } catch { /* Remember in memory for this visit. */ }
    if (preference.current) audio.current?.prime();
  }, []);
  const prime = useCallback(() => { audio.current?.prime(); }, []);
  const play = useCallback((sound: LessonSound) => { audio.current?.play(sound); }, []);
  const value = useMemo(() => ({ enabled, toggle, prime, play }), [enabled, toggle, prime, play]);
  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>;
}

export const useLessonSound = () => useContext(SoundContext);

export function SoundToggle() {
  const { enabled, toggle } = useLessonSound();
  return <button type="button" className="sound-toggle secondary" aria-label="Sound" aria-pressed={enabled}
    title={enabled ? "Mute sound" : "Unmute sound"} onClick={toggle}
    style={{ width: 44, height: 44, minWidth: 44, minHeight: 44, padding: 10, flexShrink: 0 }}>
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
      <path d="M3 9h4l5-4v14l-5-4H3z" fill="currentColor" />
      {enabled ? <g stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><path d="M16 8a6 6 0 0 1 0 8M19 5a10 10 0 0 1 0 14" /></g>
        : <path d="m16 9 6 6m0-6-6 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />}
    </svg>
  </button>;
}

/** Mounted only for this tab's acknowledged Finish. No sound in mount effects:
 * chimes are issued once by the Finish callback, never by route revalidation.
 * Web Animations keeps this short effect self-contained (no global CSS needed).
 */
export function CompletionConfetti() {
  const container = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const host = container.current;
    if (!host) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motion.matches || typeof Element.prototype.animate !== "function") return;
    const animations: Animation[] = [];
    const clear = () => { animations.forEach((animation) => animation.cancel()); host.replaceChildren(); };
    const onMotion = () => { if (motion.matches) clear(); };
    motion.addEventListener("change", onMotion);
    for (let index = 0; index < 16; index++) {
      const particle = document.createElement("span");
      particle.className = "confetti-particle";
      Object.assign(particle.style, {
        position: "absolute", left: `${5 + (index * 37) % 91}%`, top: `${8 + (index * 23) % 79}%`,
        width: "7px", height: "12px", background: index % 2 ? "#b5b9af" : "#777d73",
      });
      host.appendChild(particle);
      animations.push(particle.animate([
        { transform: `translateY(-60px) rotate(${index * 29}deg)`, opacity: 0 },
        { opacity: 0.75, offset: 0.15 },
        { transform: `translate(${index % 2 ? 24 : -24}px, 100px) rotate(${index * 29 + 130}deg)`, opacity: 0 },
      ], { duration: 950 + (index % 3) * 50, easing: "ease-out", fill: "forwards" }));
    }
    const timer = window.setTimeout(clear, 1100);
    return () => { window.clearTimeout(timer); motion.removeEventListener("change", onMotion); clear(); };
  }, []);
  return <div ref={container} className="completion-confetti" aria-hidden="true"
    style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 20 }} />;
}
