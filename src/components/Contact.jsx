import { PROFILE, SOCIALS } from '../data/content';
import { PHOTO_CREDITS } from '../data/credits';
import useResume from '../hooks/useResume';
import { useReveal } from '../hooks/useReveal';

/* The finale, staged as the next-episode card that closes each episode: a flat red field,
   the title set as large as the screen allows, and the ways to reach me underneath. The
   title lines rise out of their own masks as the card arrives. */
export default function Contact() {
  const resume = useResume();
  const ref = useReveal();
  return (
    <section id="contact" className="ep ep-finale" aria-labelledby="contact-title">
      <div ref={ref} className="finale-card">
        <p className="ep-label">Scene 005 — Next episode</p>
        <h2 id="contact-title" className="finale-headline">
          <span className="finale-line">
            <span>Next episode:</span>
          </span>
          <span className="finale-line finale-line--ink">
            <span>we build something.</span>
          </span>
        </h2>
        <a href={`mailto:${PROFILE.email}`} className="finale-address">
          {PROFILE.email}
        </a>
        <ul className="finale-links">
          {resume && (
            <li>
              <a href={resume} target="_blank" rel="noreferrer">
                Résumé
              </a>
            </li>
          )}
          {SOCIALS.map((s) => (
            <li key={s.label}>
              <a href={s.href} target="_blank" rel="noreferrer">
                {s.label}
              </a>
            </li>
          ))}
          <li>
            <a href={PROFILE.phoneHref}>{PROFILE.phone}</a>
          </li>
        </ul>
        <p className="finale-credits">
          Photographs:{' '}
          {PHOTO_CREDITS.map((c, i) => (
            <span key={c.source}>
              {i > 0 && '; '}
              <a href={c.source} target="_blank" rel="noreferrer">
                {c.subject}
              </a>{' '}
              by {c.author},{' '}
              <a href={c.licenseUrl} target="_blank" rel="noreferrer">
                {c.license}
              </a>
            </span>
          ))}
          . Cropped and colour-graded for this site.
        </p>
      </div>
    </section>
  );
}
