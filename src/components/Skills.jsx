import Scene from './Scene';
import { EDUCATION, SCENES, SKILL_GROUPS } from '../data/content';

// Winter. Snow on the shrine steps; skills and education on frosted panels.
export default function Skills() {
  const { no, season } = SCENES.skills;
  return (
    <Scene id="skills" season="winter" no={no} label={season} title="Skills & education">
      <div className="frost-grid">
        <section className="frost frost--wide reveal" aria-labelledby="edu-title">
          <h3 id="edu-title" className="frost-title mono">Education</h3>
          <ul className="edu">
            {EDUCATION.map((e) => (
              <li key={e.degree}>
                <strong>{e.degree}</strong>
                <span>
                  {e.school} · {e.date}
                </span>
              </li>
            ))}
          </ul>
        </section>
        {SKILL_GROUPS.map((g) => (
          <section key={g.title} className="frost reveal" aria-label={g.title}>
            <h3 className="frost-title mono">{g.title}</h3>
            <ul className="skill-list">
              {g.items.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </Scene>
  );
}
