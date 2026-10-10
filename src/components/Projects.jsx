import { CHAPTERS, PROJECTS } from '../data/content';
import Episode from './Episode';

function ProjectLink({ href, children }) {
  if (!href) return null;
  const external = href.startsWith('http');
  return (
    <a href={href} className="btn btn--sm" {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}>
      {children}
    </a>
  );
}

export default function Projects() {
  return (
    <Episode id="projects" tone="ink">
      <div className="frames">
        {PROJECTS.map((project, i) => (
          <article key={project.name} className="frame reveal">
            <div className="frame-still">
              <span className="frame-num">{CHAPTERS[i]}</span>
              {project.badge && <span className="frame-badge">{project.badge}</span>}
              {project.terminal ? (
                <div className="frame-terminal">
                  {project.terminal.map((line) => (
                    <div key={line}>
                      <span>{line.slice(0, 1)}</span>
                      {line.slice(1)}
                    </div>
                  ))}
                </div>
              ) : (
                <span className="frame-glyph" aria-hidden="true">
                  {project.glyph}
                </span>
              )}
              <span className="frame-reading">{project.terminal ? `${project.glyph} · ${project.reading}` : project.reading}</span>
            </div>
            <div className="frame-body">
              <h3 className="frame-title">{project.name}</h3>
              <p className="frame-blurb">{project.blurb}</p>
              <div className="tags">
                {project.stack.map((tag) => (
                  <span key={tag} className="tag">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="frame-foot">
                <div className="frame-stat">
                  <div className="eyebrow">{project.stat.label}</div>
                  <div className="frame-stat-value">{project.stat.value}</div>
                </div>
                <div className="frame-links">
                  <ProjectLink href={project.demo}>{project.demoLabel || 'Demo'} ↗</ProjectLink>
                  <ProjectLink href={project.github}>Code</ProjectLink>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </Episode>
  );
}
