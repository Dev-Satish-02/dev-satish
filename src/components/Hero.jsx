import Scene from './Scene';
import Portal from './Portal';
import Petals from './Petals';
import { PROFILE, SCENES, SOCIALS } from '../data/content';
import useResume from '../hooks/useResume';
import { ArrowIcon, FileIcon, MailIcon } from './Icons';

export default function Hero() {
  const resume = useResume();
  const { no, season } = SCENES.hero;
  const linkedin = SOCIALS.find((s) => s.label === 'LinkedIn');

  const toExperience = () => document.getElementById('experience')?.scrollIntoView();

  return (
    <Scene id="about" season="spring" no={no} label={season} className="hero" backdrop={<Petals />}>
      <div className="hero-grid">
        <div className="hero-copy">
          <p className="scene-tag mono hero-in" style={{ '--i': 0 }}>
            <span>Scene {no}</span>
            <span>{season}</span>
          </p>
          <h1 className="hero-name hero-in" style={{ '--i': 1 }}>
            Dev <em>Satish</em>
          </h1>
          <p className="hero-role hero-in" style={{ '--i': 2 }}>
            {PROFILE.title}
          </p>
          <p className="hero-summary hero-in" style={{ '--i': 3 }}>
            {PROFILE.summary} {PROFILE.education}
          </p>
          <ul className="hero-facts hero-in" style={{ '--i': 4 }}>
            {PROFILE.facts.map((f) => (
              <li key={f.label}>
                <strong>{f.value}</strong> {f.label}
              </li>
            ))}
          </ul>
          <p className="hero-status hero-in" style={{ '--i': 5 }}>
            <span className="dot" aria-hidden="true" />
            {PROFILE.availability}
          </p>
          <div className="hero-cta hero-in" style={{ '--i': 6 }}>
            <a href={`mailto:${PROFILE.email}`} className="btn btn--lg">
              <MailIcon /> Email me
            </a>
            {resume && (
              <a href={resume} className="btn btn--lg btn--ghost" target="_blank" rel="noreferrer">
                <FileIcon /> Résumé
              </a>
            )}
            <a href={linkedin.href} target="_blank" rel="noreferrer" className="link-arrow">
              LinkedIn <ArrowIcon />
            </a>
          </div>
        </div>
        <div className="hero-in" style={{ '--i': 3 }}>
          <Portal />
        </div>
      </div>
      <button type="button" className="scroll-cue mono" onClick={toExperience}>
        <span /> Scroll
      </button>
    </Scene>
  );
}
