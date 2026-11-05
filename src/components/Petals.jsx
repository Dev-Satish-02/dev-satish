import { useEffect, useRef } from 'react';
import { PetalField } from '../lib/particles';
import { useFullMotion } from '../lib/store';

// A light fall of petals over the hero only. Pauses when the hero is off screen.
export default function Petals({ count = 18 }) {
  const ref = useRef(null);
  const motion = useFullMotion();

  useEffect(() => {
    if (!motion) return undefined;
    const canvas = ref.current;
    const field = new PetalField(canvas, count);
    let visible = true;
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
    });
    io.observe(canvas);
    const ro = new ResizeObserver(() => field.resize());
    ro.observe(canvas);
    let raf;
    const loop = () => {
      if (visible && !document.hidden) field.step();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
    };
  }, [motion, count]);

  if (!motion) return null;
  return <canvas ref={ref} className="petals" aria-hidden="true" />;
}
