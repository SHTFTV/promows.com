import { useEffect, useRef, useState } from "react";
import truckPoster from "@/assets/promows-hero-square-clean.png";

const scenes = [
  { label: "ProMows truck concept", src: "", poster: truckPoster },
  { label: "Lawn mowing in a green yard", src: "/media/lawn-care.mp4", poster: "/media/lawn-care.jpg" },
  { label: "Landscaped lawns and garden beds", src: "/media/landscaped-garden.mp4", poster: "/media/landscaped-garden.jpg" },
] as const;

export function YardHeroSequence() {
  const [scene, setScene] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const video = useRef<HTMLVideoElement>(null);
  const current = scenes[scene];
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => { setReduced(preference.matches); if (preference.matches) { setScene(0); setPaused(true); } };
    update(); preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    if (scene !== 0 || paused || reduced) return;
    const timer = window.setTimeout(() => setScene(1), 6000);
    return () => window.clearTimeout(timer);
  }, [scene, paused, reduced]);
  useEffect(() => {
    if (!video.current) return;
    if (paused || reduced) video.current.pause();
    else void video.current.play().catch(() => setPaused(true));
  }, [scene, paused, reduced]);
  const next = () => setScene(value => (value + 1) % scenes.length);
  return <>
    <div className="pm-hero-media" aria-label="ProMows trucks, then two yard scenes">
      {scene === 0 ? <img className="pm-hero-scene" src={truckPoster} alt="Illustrated ProMows truck and mowing equipment beside a landscaped lawn" fetchPriority="high" /> : <video key={current.src} ref={video} className="pm-hero-scene" src={current.src} poster={current.poster} muted playsInline preload="metadata" onEnded={next} onError={next} aria-label={current.label} />}
    </div>
    <div className="pm-loop-controls"><span aria-live="off">{scene + 1} / 3 · {current.label}</span><button type="button" disabled={reduced} aria-pressed={paused || reduced} onClick={() => setPaused(value => !value)}>{reduced ? "Reduced motion" : paused ? "Play scenes" : "Pause scenes"}</button></div>
  </>;
}
