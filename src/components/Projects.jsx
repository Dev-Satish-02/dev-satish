import Scene from './Scene';
import { PROJECTS, SCENES } from '../data/content';
import { ArrowIcon } from './Icons';

// Autumn. Each project is a pane in the classroom's wall of windows.
export default function Projects() {
  const { no, season } = SCENES.projects;
  return (
    <Scene id="projects" season="autumn" no={no} label={season} title="Projects" lede="Things I've built and shipped.">
      <div className="panes">
        {PROJECTS.map((p, i) => (
          <article key={p.name} className="pane reveal">
            <div className="pane-top">
              <span className="pane-no mono">{String(i + 1).padStart(2, '0')}</span>
              <span className="pane-kind mono">{p.kind}</span>
            </div>
            <p className="pane-metric">{p.metric}</p>
            <h3 className="pane-name">{p.name}</h3>
            <p className="pane-blurb">{p.blurb}</p>
            <ul className="chips chips--dark" aria-label="Tech used">
              {p.stack.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
            {p.links.length > 0 && (
              <div className="pane-links">
                {p.links.map((l) => (
                  <a key={l.href} href={l.href} target="_blank" rel="noreferrer" className="link-arrow">
                    {l.label} <ArrowIcon />
                  </a>
                ))}
              </div>
            )}
          </article>
        ))}
      </div>
    </Scene>
  );
}
