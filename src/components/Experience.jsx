import Scene from './Scene';
import { EXPERIENCE, SCENES } from '../data/content';

// Summer. The internships run down a railway line; each job is a stop with a crossing light.
export default function Experience() {
  const { no, season } = SCENES.experience;
  return (
    <Scene
      id="experience"
      season="summer"
      no={no}
      label={season}
      title="Experience"
      lede="Four internships across fintech, industrial machine learning and web tooling."
    >
      <ol className="track">
        {EXPERIENCE.map((job) => (
          <li key={job.company} className="stop reveal">
            <span className="stop-light" aria-hidden="true" />
            <article className="job">
              <header className="job-head">
                <div>
                  <h3 className="job-role">{job.role}</h3>
                  <p className="job-company">{job.company}</p>
                </div>
                <div className="job-meta">
                  <time className="mono">{job.date}</time>
                  <span className="pill">{job.domain}</span>
                </div>
              </header>
              <ul className="job-points">
                {job.bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
              <ul className="chips" aria-label="Tech used">
                {job.tags.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </article>
          </li>
        ))}
      </ol>
    </Scene>
  );
}
