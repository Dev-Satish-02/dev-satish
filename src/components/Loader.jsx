import { useCallback, useEffect, useRef, useState } from 'react';
import { introDone, stageProgress, useFullMotion } from '../lib/store';
import { PROFILE, SKILL_GROUPS } from '../data/content';
import { getAllPosts, seasonFor } from '../lib/blog';

// The cold open, cut the way the series cuts: one-word title cards on flat colour, each
// followed by a shot of the place it names, rendered live from the same sets the page uses
// (src/three/episodes.js). Plays once when the site is opened and can be skipped at any
// moment. Every card holds ≥ 350 ms so the cuts stay under 3 flashes a second (WCAG 2.3.1).

const WORD = PROFILE.name.toUpperCase();

const FULL = [
  { id: 'open', ms: 900 },
  { id: 'cut', ms: 460, tone: 'ink', text: 'Summer', pos: 'br' },
  { id: 'shot', ms: 1700, set: 'summer', from: 0.3, to: 0.64, bg: '#d8e6f4' },
  { id: 'cut', ms: 460, tone: 'red', text: 'Autumn', pos: 'tl' },
  { id: 'shot', ms: 1300, set: 'autumn', from: 0.02, to: 0.24, bg: '#d08a4e' },
  { id: 'cut', ms: 460, tone: 'paper', text: 'Winter', pos: 'tr' },
  { id: 'shot', ms: 1300, set: 'winter', from: 0.1, to: 0.45, bg: '#dfe6ef' },
  { id: 'cut', ms: 460, tone: 'ink', text: 'Interlude', pos: 'bl' },
  { id: 'shot', ms: 1300, set: 'night', from: 0, to: 0.7, bg: '#6b2c1c' },
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

function Card({ step, ready }) {
  switch (step.id) {
    case 'open':
      return (
        <div className="ld-card tone-ink">
          <div className="ld-line" />
        </div>
      );
    case 'cut':
      return (
        <div className={`ld-card tone-${step.tone}`}>
          <div className={`ld-cut ld-pos-${step.pos}`}>{step.text}</div>
        </div>
      );
    case 'shot':
      // the live render shows through; the flat field only stands in until the set is built
      return <div className={`ld-card ld-shot${ready ? ' is-live' : ''}`} style={{ background: step.bg }} />;
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
          <div className="ld-sub">{PROFILE.title}</div>
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
  const waitStart = useRef(0);
  const holder = useRef(null);
  const reel = useRef(null);
  const [ready, setReady] = useState(false);

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

  // the reel's renderer: the page's own sets, built one ahead of the shot that needs them
  useEffect(() => {
    if (!steps.some((x) => x.id === 'shot')) return undefined;
    let alive = true;
    import('../three/episodes')
      .then(({ createEpisodes }) => {
        if (!alive || !holder.current) return;
        const posts = getAllPosts()
          .slice(0, 4)
          .map((p) => ({ title: p.title, season: seasonFor(p.categorySlug) }));
        reel.current = createEpisodes(holder.current, { stations: [], skills: SKILL_GROUPS, education: [], posts }, 'summer');
        setReady(true);
      })
      .catch(() => {});
    return () => {
      alive = false;
      reel.current?.dispose();
      reel.current = null;
    };
  }, [steps]);

  // during a shot, ease its camera through the set; meanwhile build the next one
  useEffect(() => {
    const stage = reel.current;
    if (!stage) return undefined;
    const next = steps.slice(index + 1).find((x) => x.id === 'shot');
    if (step.id !== 'shot') {
      stage.setActive(false);
      if (next) stage.prepare(next.set);
      return undefined;
    }
    stage.setActive(true);
    const t0 = performance.now();
    let raf;
    const run = (now) => {
      const k = Math.min(1, (now - t0) / step.ms);
      const e = k * k * (3 - 2 * k);
      stage.setView(step.set, step.from + (step.to - step.from) * e);
      raf = requestAnimationFrame(run);
    };
    raf = requestAnimationFrame(run);
    return () => cancelAnimationFrame(raf);
  }, [index, step, steps, ready]);

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
      <div ref={holder} className={`ld-stage${step.id === 'shot' && ready ? ' is-on' : ''}`} aria-hidden="true" />
      <Card key={index} step={step} ready={ready} />
      {!leaving && (
        <>
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
