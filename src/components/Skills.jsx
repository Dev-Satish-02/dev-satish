import { EDUCATION, SKILL_CATEGORIES } from '../data/content';
import Episode from './Episode';

const SEALS = ['工', '生'];

export default function Skills() {
  return (
    <Episode id="skills">
      <div className="edu reveal">
        {EDUCATION.map((item, i) => (
          <div key={item.degree} className="edu-item">
            <div className="edu-seal" aria-hidden="true">
              {SEALS[i] || '学'}
            </div>
            <div>
              <div className="eyebrow" style={{ color: 'var(--muted)' }}>
                {item.school}
              </div>
              <h3 className="edu-degree">{item.degree}</h3>
              <p className="edu-meta">
                {item.date} · {item.note}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="skill-wall">
        {SKILL_CATEGORIES.map((group) => (
          <div key={group.title} className="reveal">
            <div className="skill-group-head">
              <span className="skill-group-kanji">{group.kanji}</span>
              <span className="skill-group-title">{group.title}</span>
            </div>
            <ul className="skill-list">
              {group.tags.map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Episode>
  );
}
