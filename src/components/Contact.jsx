import Scene from './Scene';
import { PROFILE, SOCIALS } from '../data/content';
import useResume from '../hooks/useResume';
import { FileIcon, MailIcon } from './Icons';

// The finale: staged as the series' next-episode preview.
export default function Contact() {
  const resume = useResume();
  return (
    <Scene id="contact" season="finale" art={false}>
      <div className="finale">
        <h2 className="finale-title reveal">
          Next episode:
          <br />
          we build something.
        </h2>
        <a href={`mailto:${PROFILE.email}`} className="finale-mail reveal">
          {PROFILE.email}
        </a>
        <div className="finale-actions reveal">
          <a href={`mailto:${PROFILE.email}`} className="btn btn--lg btn--paper">
            <MailIcon /> Email me
          </a>
          {resume && (
            <a href={resume} className="btn btn--lg btn--ghost-light" target="_blank" rel="noreferrer">
              <FileIcon /> Résumé
            </a>
          )}
          {SOCIALS.map((s) => (
            <a key={s.label} href={s.href} target="_blank" rel="noreferrer" className="link-plain">
              {s.label}
            </a>
          ))}
          <a href={PROFILE.phoneHref} className="link-plain">
            {PROFILE.phone}
          </a>
        </div>
      </div>
    </Scene>
  );
}
