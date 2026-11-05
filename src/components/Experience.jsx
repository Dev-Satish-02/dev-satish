import { useEffect, useRef, useState } from 'react';
import { SCENES } from '../data/content';
import { useFullMotion } from '../lib/store';
import { STOPS } from './SceneStage';

/* Summer, at the crossing. The section pins while the camera walks up the road to the
   crossing and a train runs through; the card (the hero's own card) carries one internship at
   a time as you scroll. With reduced motion they are simply listed. */
export default function Experience() {
  const { season } = SCENES.experience;
  const motion = useFullMotion();
  const section = useRef(null);
  const [at, setAt] = useState(0);

  useEffect(() => {
    if (!motion) return undefined;
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = section.current.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - window.innerHeight)));
      setAt(Math.min(STOPS.length - 1, Math.floor(p * STOPS.length)));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
    };
  }, [motion]);

  const shown = motion ? [STOPS[at]] : STOPS;
  return (
    <section
      ref={section}
      id="experience"
      className={`ep ep-line${motion ? ' is-riding' : ''}`}
      style={{ '--stops': STOPS.length }}
      aria-labelledby="experience-title"
    >
      <div className="line-pin">
        <div className="ep-card line-card">
          <p className="ep-tag mono">{season}</p>
          <h2 id="experience-title" className="ep-title">
            Experience
          </h2>
          {shown.map((s) => {
            return (
              <article key={s.company} className="stop" aria-label={`${s.company}, ${s.role}`}>
                <p className="stop-count mono">{s.date}</p>
                <h3 className="stop-name">{s.company}</h3>
                <p className="ep-role">{s.role}</p>
                <ul className="stop-work">
                  {s.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
                <p className="stop-tools">
                  <span className="mono">Tools</span> {s.tags.join(', ')}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
