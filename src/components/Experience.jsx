import { useEffect, useRef, useState } from 'react';
import { EXPERIENCE } from '../data/content';
import { useFullMotion } from '../lib/store';

// The line runs in time order: the first internship is the first station, the latest is
// the terminus. EXPERIENCE is stored newest first.
const STOPS = [...EXPERIENCE].reverse();

/* Summer. A local line through the crossing. The section pins and the scroll drives a train
   left to right along the route map at the top of the frame; at each station the platform
   sign changes to that internship, and the timetable board beneath it lists the work. */
export default function Experience() {
  const motion = useFullMotion();
  const section = useRef(null);
  const train = useRef(null);
  const platform = useRef(null);
  const [at, setAt] = useState(0);

  useEffect(() => {
    if (!motion) return undefined;
    let raf = 0;
    let shown = -1;
    const update = () => {
      raf = 0;
      const r = section.current.getBoundingClientRect();
      const span = Math.max(1, r.height - window.innerHeight);
      const p = Math.min(1, Math.max(0, -r.top / span));
      // the train dwells at each station for most of its stretch, then runs to the next
      const seg = p * STOPS.length;
      const i = Math.min(STOPS.length - 1, Math.floor(seg));
      const t = seg - i;
      const run = i < STOPS.length - 1 ? Math.max(0, (t - 0.72) / 0.28) : 0;
      const ease = run * run * (3 - 2 * run);
      const x = (i + 0.5 + ease) / STOPS.length;
      train.current.style.setProperty('--x', x.toFixed(4));
      const station = run > 0.5 ? i + 1 : i;
      if (station !== shown) {
        shown = station;
        setAt(station);
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    // the stations stand on top of one another, so the platform takes the tallest one's height
    const measure = () => {
      const tallest = Math.max(...[...platform.current.children].map((el) => el.offsetHeight));
      platform.current.style.height = `${tallest}px`;
      onScroll();
    };
    measure();
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', measure);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', measure);
      platform.current?.style.removeProperty('height');
    };
  }, [motion]);

  return (
    <section
      ref={section}
      id="experience"
      className={`ep ep-line${motion ? ' is-riding' : ''}`}
      style={motion ? { '--stops': STOPS.length } : undefined}
      aria-labelledby="experience-title"
    >
      <div className="line-pin">
        <header className="ep-head">
          <p className="ep-label">Scene 002 — Summer</p>
          <h2 id="experience-title" className="ep-title">
            Experience
          </h2>
        </header>

        {/* the route map, as it hangs above the doors inside the carriage */}
        <ol ref={train} className="route" aria-label="Internships in order">
          {STOPS.map((s, i) => (
            <li key={s.company} className={`route-stop${i === at ? ' is-here' : ''}${i < at ? ' is-past' : ''}`}>
              <span className="route-name">{s.company}</span>
              <span className="route-date">{s.date.split(' – ')[0]}</span>
            </li>
          ))}
          <li className="route-train" aria-hidden="true" />
        </ol>

        <div ref={platform} className="platform">
          {STOPS.map((s, i) => (
            <article
              key={s.company}
              className={`station${!motion || i === at ? ' is-here' : ''}${motion && i < at ? ' is-gone' : ''}`}
              aria-hidden={motion && i !== at ? true : undefined}
            >
              <div className="station-sign">
                <h3 className="station-name">{s.company}</h3>
                <p className="station-role">{s.role}</p>
                <div className="station-band">
                  <span className="station-prev">{STOPS[i - 1]?.company ?? 'Start of the line'}</span>
                  <span className="station-next">{STOPS[i + 1]?.company ?? 'Terminus'}</span>
                </div>
              </div>
              <dl className="timetable">
                <div>
                  <dt>Period</dt>
                  <dd>{s.date}</dd>
                </div>
                <div>
                  <dt>Work</dt>
                  <dd>
                    <ul>
                      {s.bullets.map((b) => (
                        <li key={b}>{b}</li>
                      ))}
                    </ul>
                  </dd>
                </div>
                <div>
                  <dt>Tools</dt>
                  <dd>{s.tags.join(', ')}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
