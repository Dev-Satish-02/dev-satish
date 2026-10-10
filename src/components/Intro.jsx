import { useCallback, useEffect, useState } from 'react';
import { PROFILE } from '../data/content';

// The opening: rapid single-colour text cards, like the series' cold opens.
// Plays once per browser session; skipped entirely for reduced-motion users.
const CARDS = [
  { tone: 'ink', body: <div className="intro-big">黒</div>, ms: 260 },
  { tone: 'red', body: <div className="intro-big">開発物語</div>, ms: 520 },
  {
    tone: 'paper',
    body: (
      <>
        <div className="intro-mid" style={{ textTransform: 'uppercase' }}>{PROFILE.name}</div>
        <div className="eyebrow">{PROFILE.kana}</div>
      </>
    ),
    ms: 520,
  },
  { tone: 'red', body: <div className="intro-big">赤</div>, ms: 160 },
  {
    tone: 'ink',
    body: (
      <>
        <div className="intro-mid">第零話</div>
        <div className="serif" style={{ fontSize: 'clamp(18px,3vw,28px)', fontWeight: 700, letterSpacing: '0.2em' }}>
          「かいはつモノガタリ」
        </div>
      </>
    ),
    ms: 700,
  },
];

const KEY = 'devmonogatari:intro-seen';

function shouldPlay() {
  try {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
    return !sessionStorage.getItem(KEY);
  } catch {
    return false;
  }
}

export default function Intro() {
  const [index, setIndex] = useState(() => (shouldPlay() ? 0 : -1));
  const [leaving, setLeaving] = useState(false);

  const finish = useCallback(() => {
    try {
      sessionStorage.setItem(KEY, '1');
    } catch {
      /* storage blocked: the intro will simply play again next visit */
    }
    setLeaving(true);
    setTimeout(() => setIndex(-1), 350);
  }, []);

  useEffect(() => {
    if (index < 0 || leaving) return undefined;
    const t = setTimeout(() => {
      if (index + 1 < CARDS.length) setIndex(index + 1);
      else finish();
    }, CARDS[index].ms);
    return () => clearTimeout(t);
  }, [index, leaving, finish]);

  useEffect(() => {
    if (index < 0) return undefined;
    const onKey = () => finish();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [index, finish]);

  if (index < 0) return null;
  const card = CARDS[index];

  return (
    <div className={`intro tone-${card.tone}${leaving ? ' leaving' : ''}`} onClick={finish} role="presentation">
      <div className="intro-card">
        {card.body}
        <span className="intro-corner" style={{ top: 24, left: 'var(--gutter)' }}>
          {String(index + 1).padStart(3, '0')}
        </span>
      </div>
      <button type="button" className="intro-skip" onClick={finish}>
        Skip ▸
      </button>
    </div>
  );
}
