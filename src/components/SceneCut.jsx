import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { activeSeason, fullMotion, introDone } from '../lib/store';

// Tracks which season is under the middle of the viewport (for weather and cursor) and,
// the first time a new scene arrives, cuts to a full-screen title card like the series does.
// Two cards of 360 ms each: well under three flashes a second.

const CARD_MS = 360;

export default function SceneCut() {
  const { pathname } = useLocation();
  const [cut, setCut] = useState(null);
  const seen = useRef(new Set());

  useEffect(() => {
    seen.current = new Set(['001']);
    const els = document.querySelectorAll('[data-season]');
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          activeSeason.set(el.dataset.season);
          const no = el.dataset.sceneNo;
          if (!no || seen.current.has(no)) return;
          seen.current.add(no);
          if (introDone.get() && fullMotion()) {
            setCut({ no, label: el.dataset.sceneLabel, season: el.dataset.season, step: 0 });
          }
        });
      },
      { rootMargin: '-50% 0px -50% 0px' }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname]);

  useEffect(() => {
    if (!cut) return undefined;
    const t = setTimeout(() => setCut(cut.step === 0 ? { ...cut, step: 1 } : null), CARD_MS);
    return () => clearTimeout(t);
  }, [cut]);

  if (!cut) return null;
  return (
    <div className={`cut cut--${cut.season} cut--step${cut.step}`} aria-hidden="true">
      {cut.step === 0 ? (
        <div className="cut-text">
          <small>Scene</small>
          {cut.no}
        </div>
      ) : (
        <div className="cut-text cut-label">{cut.label}</div>
      )}
    </div>
  );
}
