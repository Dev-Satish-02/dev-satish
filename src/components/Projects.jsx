import { useEffect, useRef, useState } from 'react';
import { PROJECTS, SCENES } from '../data/content';
import { useFullMotion } from '../lib/store';

/* Autumn, in the cram school, among the piles of chairs. The section holds while you scroll
   and the camera walks the colonnade from one pile to the next; each project is set straight
   over the scene, in the series' manner, as its pile comes into view. With reduced motion the
   projects are simply listed. */
export default function Projects() {
  const { season } = SCENES.projects;
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
      setAt(Math.min(PROJECTS.length - 1, Math.floor(p * PROJECTS.length)));
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

  const shown = motion ? [PROJECTS[at]] : PROJECTS;
  return (
    <section
      ref={section}
      id="projects"
      className={`ep ep-cases${motion ? ' is-riding' : ''}`}
      style={{ '--cases': PROJECTS.length }}
      aria-labelledby="projects-title"
    >
      <div className="case-view">
        <header className="case-head">
          <p className="ep-tag mono">{season}</p>
          <h2 id="projects-title" className="case-title">
            Projects
          </h2>
        </header>
        {shown.map((p) => {
          return (
            <article key={p.name} className="case-text" aria-label={p.name}>
              <h3 className="case-name">{p.name}</h3>
              <p className="ep-role">{p.metric}</p>
              {p.shot && (
                <figure className="case-shot">
                  <img src={`${import.meta.env.BASE_URL}${p.shot.src}`} alt={p.shot.alt} loading="lazy" decoding="async" />
                </figure>
              )}
              <p className="case-blurb">{p.blurb}</p>
              {p.role && (
                <p className="case-line">
                  <span className="mono">Role</span> {p.role}
                </p>
              )}
              <p className="case-line">
                <span className="mono">Built with</span> {p.stack.join(', ')}
              </p>
              {p.links.length > 0 && (
                <p className="case-line">
                  <span className="mono">Open</span>{' '}
                  {p.links.map((l) => (
                    <a key={l.href} href={l.href} target="_blank" rel="noreferrer">
                      {l.label}
                    </a>
                  ))}
                </p>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
