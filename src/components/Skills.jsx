import { useReveal } from '../hooks/useReveal';
import { EDUCATION, SKILL_GROUPS } from '../data/content';

/* Winter. An empty classroom after the last bell. Education is filed as the school's own
   record, a ruled sheet; the skills are classified on the blackboard behind it. */
export default function Skills() {
  const record = useReveal();
  const board = useReveal();
  return (
    <section id="skills" className="ep ep-school" aria-labelledby="skills-title">
      <header className="ep-head">
        <p className="ep-label">Scene 004 — Winter</p>
        <h2 id="skills-title" className="ep-title">
          Skills &amp; education
        </h2>
      </header>
      <div className="school">
        <article ref={record} className="record" aria-labelledby="record-title">
          <h3 id="record-title" className="record-title">
            Academic record
          </h3>
          <table className="record-table">
            <thead>
              <tr>
                <th scope="col">Programme</th>
                <th scope="col">Institution</th>
                <th scope="col">Period</th>
              </tr>
            </thead>
            <tbody>
              {EDUCATION.map((e) => (
                <tr key={e.degree}>
                  <th scope="row">{e.degree}</th>
                  <td>{e.school}</td>
                  <td>{e.date.replace(' · Dual degree', '')}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {EDUCATION.some((e) => e.date.includes('Dual degree')) && (
            <p className="record-note">
              <span className="record-stamp">Dual degree</span>
            </p>
          )}
        </article>

        <div ref={board} className="board" role="group" aria-label="Skills">
          {SKILL_GROUPS.map((g) => (
            <section key={g.title} className="board-group" aria-label={g.title}>
              <h3 className="board-head">{g.title}</h3>
              <ul className="board-list">
                {g.items.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </section>
  );
}
