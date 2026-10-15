import { useEffect, useRef, useState } from 'react';
import { useFullMotion } from '../lib/store';

const INTERACTIVE = 'a, button, [role="button"], input, textarea, select, label';

// A small crimson diamond with a ring that fills red over anything clickable.
export default function Cursor() {
  const motion = useFullMotion();
  const [fine, setFine] = useState(() => window.matchMedia('(pointer: fine)').matches);
  const dot = useRef(null);
  const ring = useRef(null);

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
    const pos = { x: -100, y: -100 };
    const lag = { x: -100, y: -100 };
    let hover = false;
    let raf;
    const onMove = (e) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
      const isHover = e.target instanceof Element && Boolean(e.target.closest(INTERACTIVE));
      if (isHover !== hover) {
        hover = isHover;
        ring.current.classList.toggle('is-hover', hover);
      }
    };
    const onLeave = () => {
      pos.x = -100;
      pos.y = -100;
    };
    const loop = () => {
      lag.x += (pos.x - lag.x) * 0.25;
      lag.y += (pos.y - lag.y) * 0.25;
      dot.current.style.transform = `translate(${pos.x}px, ${pos.y}px) rotate(45deg)`;
      ring.current.style.transform = `translate(${lag.x}px, ${lag.y}px)`;
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener('pointermove', onMove);
    document.addEventListener('pointerleave', onLeave);
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      document.documentElement.classList.remove('custom-cursor');
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
    };
  }, [enabled]);

  if (!enabled) return null;
  return (
    <div aria-hidden="true">
      <div ref={ring} className="cursor-ring" />
      <div ref={dot} className="cursor-dot" />
    </div>
  );
}
