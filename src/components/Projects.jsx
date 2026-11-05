import { useRef, useState } from 'react';
import { PROJECTS, SCENES } from '../data/content';
import { useReveal } from '../hooks/useReveal';
import { openCase } from './SceneStage';

/* Autumn, in the cram school, among the piles of chairs. One project at a time, set straight
   over the scene in the series' manner rather than on a card; Previous and Next (or the
   arrow keys) move the camera to the next pile and cut to its project. */
export default function Projects() {
  const { no, season } = SCENES.projects;
  const open = useReveal();
  const [i, setI] = useState(0);
  const swipe = useRef([0, 0]);
  const go = (n) => {
    const next = (n + PROJECTS.length) % PROJECTS.length;
    setI(next);
    openCase(next);
  };
  const p = PROJECTS[i];
  const num = String(i + 1).padStart(2, '0');
  return (
    <section id="projects" className="ep ep-cases" aria-labelledby="projects-title">
      <div ref={open} className="ep-card ep-open">
        <p className="scene-tag mono">
          <span>Scene {no}</span>
          <span>{season}</span>
        </p>
        <h2 id="projects-title" className="ep-title">
          Projects
        </h2>
        <p className="ep-summary">Things I built and shipped.</p>
      </div>

      <div
        className="case-view"
        role="group"
        aria-roledescription="carousel"
        aria-label="Projects"
        tabIndex={-1}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') go(i + 1);
          if (e.key === 'ArrowLeft') go(i - 1);
        }}
        // on a phone the scene itself is the control: swipe it left or right
        onTouchStart={(e) => {
          swipe.current = [e.touches[0].clientX, e.touches[0].clientY];
        }}
        onTouchEnd={(e) => {
          const [x0, y0] = swipe.current;
          const dx = e.changedTouches[0].clientX - x0;
          const dy = e.changedTouches[0].clientY - y0;
          if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) go(dx < 0 ? i + 1 : i - 1);
        }}
      >
        <p className="case-no" aria-hidden="true">
          {num}
        </p>
        <article key={p.name} className="case-text" aria-live="polite" aria-label={`Case ${i + 1} of ${PROJECTS.length}: ${p.name}`}>
          <p className="scene-tag mono">
            <span>Case {num}</span>
            <span>{p.kind}</span>
          </p>
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
        <div className="case-nav">
          <button type="button" onClick={() => go(i - 1)} aria-label="Previous case">
            <span aria-hidden="true">◀</span> Previous
          </button>
          <span className="case-count mono" aria-hidden="true">
            {num} / {String(PROJECTS.length).padStart(2, '0')}
          </span>
          <span className="case-swipe mono" aria-hidden="true">
            Swipe the scene
          </span>
          <button type="button" onClick={() => go(i + 1)} aria-label="Next case">
            Next <span aria-hidden="true">▶</span>
          </button>
        </div>
      </div>
    </section>
  );
}
