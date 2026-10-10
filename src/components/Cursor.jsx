import { useEffect, useRef, useState } from 'react';
import { ParticleField, TRAIL } from '../lib/particles';
import { activeSeason, useFullMotion } from '../lib/store';

const INTERACTIVE = 'a, button, [role="button"], input, textarea, select, label, [data-cursor]';

// A crimson diamond with a lagging ring that becomes a red sun over anything clickable,
// shedding the current season's weather as it moves.
export default function Cursor() {
  const motion = useFullMotion();
  const [fine, setFine] = useState(() => window.matchMedia('(pointer: fine)').matches);
  const dot = useRef(null);
  const ring = useRef(null);
  const label = useRef(null);
  const trail = useRef(null);

  useEffect(() => {
    const mq = window.matchMedia('(pointer: fine)');
    const onChange = () => setFine(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const enabled = motion && fine;

  useEffect(() => {
    if (!enabled) return undefined;
    document.documentElement.classList.add('custom-cursor');
    const field = new ParticleField(trail.current);
    const pos = { x: -100, y: -100 };
    const lag = { x: -100, y: -100 };
    let last = 0;
    let hover = false;
    let raf;

    const onMove = (e) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
      const now = performance.now();
      if (now - last > 45) {
        last = now;
        field.emit(TRAIL[activeSeason.get()] || 'petal', pos.x, pos.y);
      }
      const target = e.target instanceof Element ? e.target.closest(INTERACTIVE) : null;
      const isHover = Boolean(target);
      if (isHover !== hover) {
        hover = isHover;
        ring.current.classList.toggle('is-hover', hover);
      }
      label.current.textContent = target?.dataset?.cursor || '';
    };
    const onDown = () => ring.current.classList.add('is-down');
    const onUp = () => ring.current.classList.remove('is-down');
    const onLeave = () => {
      pos.x = -100;
      pos.y = -100;
    };
    const onResize = () => field.resize();

    const loop = () => {
      lag.x += (pos.x - lag.x) * 0.2;
      lag.y += (pos.y - lag.y) * 0.2;
      dot.current.style.transform = `translate(${pos.x}px, ${pos.y}px) rotate(45deg)`;
      ring.current.style.transform = `translate(${lag.x}px, ${lag.y}px)`;
      field.step();
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('pointerup', onUp);
    document.addEventListener('pointerleave', onLeave);
    window.addEventListener('resize', onResize);
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      document.documentElement.classList.remove('custom-cursor');
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      document.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('resize', onResize);
    };
  }, [enabled]);

  if (!enabled) return null;
  return (
    <div className="cursor" aria-hidden="true">
      <canvas ref={trail} className="cursor-trail" />
      <div ref={ring} className="cursor-ring">
        <span ref={label} className="cursor-label" />
      </div>
      <div ref={dot} className="cursor-dot" />
    </div>
  );
}
