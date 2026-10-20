import Scene from './Scene';
import { EXPERIENCE } from '../data/content';
import { listSentence } from '../lib/text';

// Summer. Each internship is a station on the line, signed the way Japanese platforms are:
// the station's name large, and on the coloured band beneath it the stations either side,
// so the signs read as a route from the first job to the latest.
export default function Experience() {
  return (
    <Scene
      id="experience"
      season="summer"
      title="Experience"
      lede="Four internships across fintech, industrial machine learning and web tooling."
      artProps={{ live: true }}
    >
      <ol className="line" reversed>
        {EXPERIENCE.map((job, i) => {
          const earlier = EXPERIENCE[i + 1]?.company ?? 'BITS Pilani';
          const later = EXPERIENCE[i - 1]?.company;
          return (
            <li key={job.company} className="station reveal">
              <article className="sign">
                <div className="sign-board">
                  <h3 className="sign-name">{job.company}</h3>
                  <p className="sign-role">
                    {job.role}, {job.domain.toLowerCase()}
                  </p>
                </div>
                <div className="sign-band">
                  <span className="sign-prev" aria-label={`Before: ${earlier}`}>
                    {earlier}
                  </span>
                  <time className="sign-date">{job.date}</time>
                  <span className="sign-next" aria-label={later ? `After: ${later}` : undefined}>
                    {later}
                  </span>
                </div>
                <div className="sign-notes">
                  {job.bullets.map((b) => (
                    <p key={b}>{b}</p>
                  ))}
                  <p className="sign-stack">Worked in {listSentence(job.tags)}.</p>
                </div>
              </article>
            </li>
          );
        })}
      </ol>
    </Scene>
  );
}
