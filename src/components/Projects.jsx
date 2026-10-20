import { Fragment } from 'react';
import Scene from './Scene';
import { PROJECTS } from '../data/content';
import { listSentence } from '../lib/text';

// Autumn. The projects are written up on the classroom blackboard.
export default function Projects() {
  return (
    <Scene id="projects" season="autumn" title="Projects" lede="Things I've built and shipped.">
      <div className="board reveal">
        <ul className="board-list">
          {PROJECTS.map((p) => (
            <li key={p.name} className="board-item">
              <h3 className="board-name">{p.name}</h3>
              <p className="board-metric">{p.metric}</p>
              <p className="board-blurb">{p.blurb}</p>
              <p className="board-stack">
                Built with {listSentence(p.stack)}.
                {p.links.map((l) => (
                  <Fragment key={l.href}>
                    {' '}
                    <a href={l.href} target="_blank" rel="noreferrer">
                      View on {l.label}
                    </a>
                  </Fragment>
                ))}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </Scene>
  );
}
