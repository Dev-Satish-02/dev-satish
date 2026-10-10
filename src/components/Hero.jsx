import { lazy, Suspense } from 'react';
import Scene from './Scene';
import { PROFILE, SCENES, SOCIALS } from '../data/content';
import useResume from '../hooks/useResume';
import { ArrowIcon, FileIcon, MailIcon } from './Icons';

const HeroStage = lazy(() => import('../three/HeroStage'));

export default function Hero() {
  const resume = useResume();
  const { no, season } = SCENES.hero;

  return (
    <Scene id="about" season="spring" no={no} label={season} className="hero">
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
            {PROFILE.summary}
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
            {PROFILE.availability} · {PROFILE.location}
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
            {SOCIALS.slice(0, 2).map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noreferrer" className="link-arrow">
                {s.label} <ArrowIcon />
              </a>
            ))}
          </div>
        </div>
        <Suspense fallback={<div className="hero-stage" />}>
          <HeroStage className="hero-stage" />
        </Suspense>
      </div>
      <a href="#experience" className="scroll-cue mono" aria-label="Scroll to experience">
        <span /> Scroll
      </a>
    </Scene>
  );
}
