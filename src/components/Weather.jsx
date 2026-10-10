import { useEffect, useRef } from 'react';
import { AMBIENT, ParticleField } from '../lib/particles';
import { activeSeason, useFullMotion } from '../lib/store';

// Ambient weather for whichever season is on screen. Sits behind the content.
export default function Weather() {
  const ref = useRef(null);
  const motion = useFullMotion();

  useEffect(() => {
    if (!motion) return undefined;
    const field = new ParticleField(ref.current);
    const apply = (season) => field.setAmbient(AMBIENT[season] || null);
    apply(activeSeason.get());
    const unsub = activeSeason.subscribe(apply);
    const onResize = () => field.resize();
    window.addEventListener('resize', onResize);
    let raf;
    const loop = () => {
      if (!document.hidden) field.step();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      unsub();
      window.removeEventListener('resize', onResize);
    };
  }, [motion]);

  if (!motion) return null;
  return <canvas ref={ref} className="weather" aria-hidden="true" />;
}
