import Scene from './Scene';
import { PROFILE, SCENES, SOCIALS } from '../data/content';
import useResume from '../hooks/useResume';
import { ArrowIcon, FileIcon, MailIcon } from './Icons';

// The finale: staged as the series' next-episode preview.
export default function Contact() {
  const { no, season } = SCENES.contact;
  const resume = useResume();
  return (
    <Scene id="contact" season="finale" no={no} label={season} art={false}>
      <div className="finale">
        <p className="scene-tag mono reveal">
          <span>Scene {no}</span>
          <span>{season}</span>
        </p>
        <h2 className="finale-title reveal">
          Next episode:
          <br />
          <em>we build something.</em>
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
            <a key={s.label} href={s.href} target="_blank" rel="noreferrer" className="link-arrow link-arrow--light">
              {s.label} <ArrowIcon />
            </a>
          ))}
          <a href={PROFILE.phoneHref} className="link-arrow link-arrow--light">
            {PROFILE.phone}
          </a>
        </div>
      </div>
    </Scene>
  );
}
