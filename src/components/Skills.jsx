import Scene from './Scene';
import { EDUCATION, SKILL_GROUPS } from '../data/content';

// Winter. Skills and education on a single shoji screen at the foot of the shrine steps.
export default function Skills() {
  return (
    <Scene id="skills" season="winter" title="Skills & education">
      <div className="shoji reveal">
        <section className="shoji-edu" aria-labelledby="edu-title">
          <h3 id="edu-title" className="sr-only">
            Education
          </h3>
          {EDUCATION.map((e) => (
            <p key={e.degree} className="shoji-degree">
              <strong>{e.degree}</strong>
              <span>
                {e.school}, {e.date}
                {e.note ? `. ${e.note}` : ''}
              </span>
            </p>
          ))}
        </section>
        <div className="shoji-groups">
          {SKILL_GROUPS.map((g) => (
            <section key={g.title} aria-label={g.title}>
              <h3 className="shoji-title">{g.title}</h3>
              <ul className="shoji-list">
                {g.items.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </Scene>
  );
}
