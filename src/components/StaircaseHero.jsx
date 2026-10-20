import { useEffect, useRef, useState } from 'react';
import HeroBlossom from './HeroBlossom';
import { PROFILE } from '../data/content';
import { stageProgress, useFullMotion } from '../lib/store';

const smoothstep = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

// Scene 001: a still spiral stairwell. Scrolling drops you down it (Hitagi Crab, episode 1)
// until the well washes out into the summer sky where Experience begins.
export default function StaircaseHero() {
  const motion = useFullMotion();
  const section = useRef(null);
  const holder = useRef(null);
  const copy = useRef(null);
  const wash = useRef(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let stair;
    let alive = true;
    const onFrame = (p) => {
      if (copy.current) copy.current.style.opacity = String(1 - smoothstep(0.015, 0.11, p));
    };
    const onScroll = () => {
      if (!stair || !section.current) return;
      const r = section.current.getBoundingClientRect();
      const span = r.height - window.innerHeight;
      const raw = span > 0 ? Math.min(1, Math.max(0, -r.top / span)) : 0;
      // the fall finishes at 90% of the section; the blue wash follows the scrollbar directly,
      // so even a fast scroll never shows the stairwell sliding away mid-fall
      stair.setProgress(raw / 0.9);
      if (wash.current) wash.current.style.opacity = String(smoothstep(0.76, 0.9, raw));
    };

    import('../three/staircase')
      .then(({ createStaircase }) => {
        if (!alive) return;
        stair = createStaircase(holder.current, { onReady: () => stageProgress.set(1), onFrame });
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll);
      })
      .catch((err) => {
        console.warn('[staircase] falling back to the blossom hero', err);
        if (alive) setFailed(true);
        stageProgress.set(1);
      });

    return () => {
      alive = false;
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      stair?.dispose();
    };
  }, []);

  if (failed) return <HeroBlossom />;

  return (
    <section
      ref={section}
      id="about"
      className={`stair-hero${motion ? '' : ' is-still'}`}
      data-season="spring"
      aria-labelledby="about-title"
    >
      <div className="stair-pin">
        <div ref={holder} className="stair-canvas" aria-hidden="true" />
        <div ref={wash} className="stair-wash" aria-hidden="true" />
        <div ref={copy} className="stair-copy">
          <h1 id="about-title" className="hero-name hero-in" style={{ '--i': 1 }}>
            {PROFILE.name}
          </h1>
          <p className="hero-role hero-in" style={{ '--i': 2 }}>
            {PROFILE.title}
          </p>
          <p className="hero-summary hero-in" style={{ '--i': 3 }}>
            {PROFILE.summary}
          </p>
        </div>
      </div>
    </section>
  );
}
