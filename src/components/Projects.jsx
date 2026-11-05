import { useReveal } from '../hooks/useReveal';
import { PROJECTS } from '../data/content';

/* Autumn. The projects are case files, opened one at a time in the old classroom: each gets a
   frame of its own, with the name set large, the result in red, and the file itself laid
   beside it. The frames alternate and shift, so no two read alike. */
export default function Projects() {
  return (
    <section id="projects" className="ep ep-cases" aria-labelledby="projects-title">
      <header className="ep-head">
        <p className="ep-label">Scene 003 — Autumn</p>
        <h2 id="projects-title" className="ep-title">
          Projects
        </h2>
        <p className="ep-lede">Four things I built and shipped, opened one file at a time.</p>
      </header>
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
    <li ref={ref} className={`case case--${index % 4}`}>
      <p className="case-no" aria-hidden="true">
        {no}
      </p>
      <div className="case-title">
        <p className="case-kind">
          Case {no}, {p.kind.toLowerCase()}
        </p>
        <h3 className="case-name">
          <span>{p.name}</span>
        </h3>
        <p className="case-result">{p.metric}</p>
      </div>
      <div className="case-file">
        {p.shot && (
          <figure className="case-shot">
            <img src={`${import.meta.env.BASE_URL}${p.shot.src}`} alt={p.shot.alt} loading="lazy" decoding="async" />
          </figure>
        )}
        <dl>
          <div>
            <dt>What it is</dt>
            <dd>{p.blurb}</dd>
          </div>
          {p.role && (
            <div>
              <dt>My role</dt>
              <dd>{p.role}</dd>
            </div>
          )}
          <div>
            <dt>Built with</dt>
            <dd>{p.stack.join(', ')}</dd>
          </div>
          {p.links.length > 0 && (
            <div>
              <dt>Open</dt>
              <dd className="case-links">
                {p.links.map((l) => (
                  <a key={l.href} href={l.href} target="_blank" rel="noreferrer">
                    {l.label}
                  </a>
                ))}
              </dd>
            </div>
          )}
        </dl>
      </div>
    </li>
  );
}
