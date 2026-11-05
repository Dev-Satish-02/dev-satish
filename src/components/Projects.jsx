import { PROJECTS, SCENES } from '../data/content';
import { useReveal } from '../hooks/useReveal';

/* Autumn, in the cram school. Each project is a case file: the hero's card, set beside a
   case number cut in the staircase's gold, alternating sides as the camera walks the floor
   toward the low sun. */
export default function Projects() {
  const { no, season } = SCENES.projects;
  const open = useReveal();
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
        <p className="ep-role">Four case files</p>
        <p className="ep-summary">Things I built and shipped, opened one at a time.</p>
      </div>
      <ol className="cases">
        {PROJECTS.map((p, i) => (
          <Case key={p.name} project={p} index={i} />
        ))}
      </ol>
    </section>
  );
}

function Case({ project: p, index }) {
  const ref = useReveal();
  const no = String(index + 1).padStart(2, '0');
  return (
    <li ref={ref} className={`case${index % 2 ? ' case--right' : ''}`}>
      <p className="case-no" aria-hidden="true">
        {no}
      </p>
      <article className="ep-card case-card">
        <p className="scene-tag mono">
          <span>Case {no}</span>
          <span>{p.kind}</span>
        </p>
        <h3 className="case-name">{p.name}</h3>
        <p className="ep-role">{p.metric}</p>
        {p.shot && (
          <figure className="case-shot">
            <img src={`${import.meta.env.BASE_URL}${p.shot.src}`} alt={p.shot.alt} loading="lazy" decoding="async" />
          </figure>
        )}
        <p className="ep-summary">{p.blurb}</p>
        <dl className="case-facts">
          {p.role && (
            <div>
              <dt className="mono">Role</dt>
              <dd>{p.role}</dd>
            </div>
          )}
          <div>
            <dt className="mono">Built with</dt>
            <dd>{p.stack.join(', ')}</dd>
          </div>
          {p.links.length > 0 && (
            <div>
              <dt className="mono">Open</dt>
              <dd>
                {p.links.map((l) => (
                  <a key={l.href} href={l.href} target="_blank" rel="noreferrer">
                    {l.label}
                  </a>
                ))}
              </dd>
            </div>
          )}
        </dl>
      </article>
    </li>
  );
}
