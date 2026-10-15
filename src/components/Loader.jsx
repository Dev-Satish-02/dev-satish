import { useCallback, useEffect, useRef, useState } from 'react';
import { SpringScene, SummerScene, AutumnScene, WinterScene } from './scenes/Scenes';
import { introDone, stageProgress, useFullMotion } from '../lib/store';
import { PROFILE } from '../data/content';

// The cold open. Plays once when the site is opened, and can be skipped at any moment.
// Every card holds ≥ 350 ms so the cuts stay under 3 flashes a second (WCAG 2.3.1).

const WORD = PROFILE.name.toUpperCase();

const FULL = [
  { id: 'open', ms: 1000 },
  { id: 'cut', ms: 420, tone: 'paper', text: 'This is', pos: 'tl' },
  { id: 'cut', ms: 420, tone: 'red', text: 'a story', pos: 'br' },
  { id: 'cut', ms: 420, tone: 'ink', text: 'about building', pos: 'c' },
  { id: 'cut', ms: 420, tone: 'paper', text: 'things.', pos: 'tr', accent: true },
  { id: 'season', ms: 520, Scene: SpringScene, name: 'Spring', ink: '#17111a' },
  { id: 'season', ms: 520, Scene: SummerScene, name: 'Summer', ink: '#ffffff' },
  { id: 'season', ms: 520, Scene: AutumnScene, name: 'Autumn', ink: '#fff1dc' },
  { id: 'season', ms: 520, Scene: WinterScene, name: 'Winter', ink: '#ffffff' },
  { id: 'train', ms: 1600 },
  { id: 'title', ms: 2000 },
  { id: 'scene', ms: 400, flash: 0 },
  { id: 'scene', ms: 400, flash: 1 },
  { id: 'scene', ms: 400, flash: 0 },
  { id: 'scene', ms: 400, flash: 1, hold: true },
  { id: 'handoff', ms: 900 },
];

const CALM = [
  { id: 'title', ms: 1800, calm: true },
  { id: 'handoff', ms: 700 },
];

const MAX_WAIT = 3200; // how long SCENE 001 keeps flashing while the model finishes loading

// A commuter train sliding through the summer crossing.
function Train() {
  const cars = [0, 1, 2, 3];
  return (
    <svg className="ld-train" viewBox="0 0 1600 220" aria-hidden="true">
      {cars.map((c) => (
        <g key={c} transform={`translate(${c * 400} 0)`}>
          <rect x="6" y="20" width="388" height="170" rx={c === 3 ? 60 : 8} fill="#0b1a3a" />
          <rect x="6" y="150" width="388" height="10" fill="#f5c400" />
          {[30, 120, 210, 300].map((x) => (
            <rect key={x} x={x} y="50" width="70" height="60" fill="#a6dbf8" />
          ))}
          <circle cx="80" cy="200" r="18" fill="#05060a" />
          <circle cx="320" cy="200" r="18" fill="#05060a" />
        </g>
      ))}
    </svg>
  );
}

function Card({ step, index }) {
  switch (step.id) {
    case 'open':
      return (
        <div className="ld-card tone-ink">
          <div className="ld-line" />
          <div className="ld-corner ld-tl mono">Scene 000</div>
        </div>
      );
    case 'cut':
      return (
        <div className={`ld-card tone-${step.tone}`}>
          <div className={`ld-cut ld-pos-${step.pos}${step.accent ? ' is-accent' : ''}`}>{step.text}</div>
          <div className="ld-corner ld-tl mono">Cut {String(index).padStart(2, '0')}</div>
        </div>
      );
    case 'season': {
      const { Scene } = step;
      return (
        <div className="ld-card ld-season">
          <Scene className="ld-season-art" align="xMidYMid" />
          <div className="ld-season-name" style={{ color: step.ink }}>
            {step.name}
          </div>
        </div>
      );
    }
    case 'train':
      return (
        <div className="ld-card ld-season">
          <SummerScene className="ld-season-art" />
          <Train />
        </div>
      );
    case 'title':
      return (
        <div className={`ld-card tone-ink ld-title${step.calm ? ' is-calm' : ''}`}>
          <div className="ld-word" aria-label={WORD}>
            {WORD.split('').map((ch, i) => (
              <span key={i} style={{ animationDelay: `${120 + i * 70}ms` }}>
                {ch === ' ' ? '\u00a0' : ch}
              </span>
            ))}
            <i className="ld-seal">物語</i>
          </div>
          <div className="ld-rule" />
          <div className="ld-sub">
            {PROFILE.name} · {PROFILE.title}
          </div>
          <div className="ld-corner ld-bl mono">A portfolio in four seasons</div>
        </div>
      );
    case 'scene':
      return (
        <div className={`ld-card ${step.flash ? 'tone-ink' : 'tone-red'}`}>
          <div className={`ld-scene${step.flash ? ' is-red' : ''}`}>
            <small>Scene</small>
            001
          </div>
        </div>
      );
    case 'handoff':
      return (
        <div className="ld-card ld-handoff">
          <SpringScene className="ld-season-art" />
          <div className="ld-handoff-text">
            <small>Scene 001</small>
            Spring
          </div>
        </div>
      );
    default:
      return null;
  }
}

export default function Loader() {
  const motion = useFullMotion();
  const [steps] = useState(() => (motion ? FULL : CALM));
  const [index, setIndex] = useState(0);
  const [gone, setGone] = useState(false);
  const [pct, setPct] = useState(0);
  const start = useRef(performance.now());
  const waitStart = useRef(0);
  const total = steps.reduce((s, x) => s + x.ms, 0);

  const step = steps[index];
  const handoffIndex = steps.findIndex((s) => s.id === 'handoff');

  const skip = useCallback(() => {
    setIndex((i) => (i < handoffIndex ? handoffIndex : i));
  }, [handoffIndex]);

  // advance through the cards
  useEffect(() => {
    if (gone) return undefined;
    const t = setTimeout(() => {
      if (step.hold && stageProgress.get() < 1) {
        if (!waitStart.current) waitStart.current = performance.now();
        if (performance.now() - waitStart.current < MAX_WAIT) {
          setIndex(index - 1); // keep flashing SCENE 001 until the model is in
          return;
        }
      }
      if (index + 1 < steps.length) setIndex(index + 1);
      else setGone(true);
    }, step.ms);
    return () => clearTimeout(t);
  }, [index, step, steps, gone]);

  // the hero starts entering as the handoff begins, so the two overlap
  useEffect(() => {
    if (step.id === 'handoff') introDone.set(true);
  }, [step]);

  // progress counter: time through the reel, held back by real loading
  useEffect(() => {
    let raf;
    const tick = () => {
      const time = Math.min(1, (performance.now() - start.current) / total);
      setPct(Math.round(100 * Math.min(time, 0.35 + stageProgress.get() * 0.65)));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [total]);

  // keyboard skip, scroll lock
  useEffect(() => {
    if (gone) return undefined;
    const onKey = (e) => {
      if (['Escape', 'Enter', ' ', 'ArrowDown'].includes(e.key)) {
        e.preventDefault();
        skip();
      }
    };
    window.addEventListener('keydown', onKey);
    document.documentElement.classList.add('is-loading');
    return () => {
      window.removeEventListener('keydown', onKey);
      document.documentElement.classList.remove('is-loading');
    };
  }, [gone, skip]);

  useEffect(() => {
    if (gone) introDone.set(true);
  }, [gone]);

  if (gone) return null;
  const leaving = step.id === 'handoff';

  return (
    <div
      className={`loader${leaving ? ' is-leaving' : ''}`}
      style={leaving ? { '--handoff': `${step.ms}ms` } : undefined}
      onClick={skip}
      role="presentation"
    >
      <Card key={index} step={step} index={index} />
      {!leaving && (
        <>
          <div className="ld-progress mono" aria-live="off">
            Loading {String(pct).padStart(3, '0')}
          </div>
          <button
            type="button"
            className="ld-skip mono"
            onClick={(e) => {
              e.stopPropagation();
              skip();
            }}
          >
            Skip intro <span aria-hidden="true">↵</span>
          </button>
        </>
      )}
    </div>
  );
}
