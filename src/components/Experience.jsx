import { CHAPTERS, EXPERIENCE } from '../data/content';
import Episode from './Episode';

export default function Experience() {
  return (
    <Episode id="experience">
      <ol className="chapters" style={{ listStyle: 'none' }}>
        {EXPERIENCE.map((item, i) => (
          <li key={item.company} className="chapter-row reveal">
            <div>
              <div className="chapter-no">{CHAPTERS[i]}</div>
              <div className="chapter-year">{item.year}</div>
            </div>
            <div>
              <h3 className="chapter-company">{item.company}</h3>
              <p className="chapter-role">{item.role}</p>
              <p className="chapter-date">{item.date}</p>
            </div>
            <div>
              <p className="chapter-desc" dangerouslySetInnerHTML={{ __html: item.description }} />
              <div className="tags">
                {item.tags.map((tag) => (
                  <span key={tag} className="tag">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </Episode>
  );
}
