import { EDUCATION, SCENES, SKILL_GROUPS } from '../data/content';
import { useReveal } from '../hooks/useReveal';

/* Winter, in the classroom. The skills are chalked up on the blackboard the camera walks
   toward; here they are again, readable, on the hero's card, with the education filed as a
   ruled record beside them. */
export default function Skills() {
  const { season } = SCENES.skills;
  const open = useReveal();
  const record = useReveal();
  const board = useReveal();
  return (
    <section id="skills" className="ep ep-school" aria-labelledby="skills-title">
      <div ref={open} className="ep-card ep-open">
        <p className="ep-tag mono">{season}</p>
        <h2 id="skills-title" className="ep-title">
          Skills &amp; education
        </h2>
        <p className="ep-role">BITS Pilani, dual degree</p>
      </div>
      <div className="school">
        <article ref={record} className="ep-card record" aria-labelledby="record-title">
          <h3 id="record-title" className="record-title">
            Education
          </h3>
          <table className="record-table">
            <thead>
              <tr>
                <th scope="col">Programme</th>
                <th scope="col">Institution</th>
                <th scope="col">Since</th>
              </tr>
            </thead>
            <tbody>
              {EDUCATION.map((e) => (
                <tr key={e.degree}>
                  <th scope="row">{e.degree}</th>
                  <td>{e.school}</td>
                  <td>{e.date.replace('Since ', '')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>
        <div ref={board} className="ep-card classes" role="group" aria-labelledby="classes-title">
          <h3 id="classes-title" className="record-title">
            Skills
          </h3>
          <div className="classes-grid">
            {SKILL_GROUPS.map((g) => (
              <section key={g.title} aria-label={g.title}>
                <h4 className="class-head">{g.title}</h4>
                <ul className="class-list">
                  {g.items.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
