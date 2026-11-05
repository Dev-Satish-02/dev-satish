import { createContext, useEffect, useRef } from 'react';
import ScenePhoto from './ScenePhoto';

// Seasons the stage provides; Scene.jsx leaves its own illustration out for these.
export const StageContext = createContext(null);
export const STAGED = ['summer', 'autumn', 'winter', 'night'];

// The order the seasons play in down the home page, the section each belongs to, and its
// photograph (see design/ASSETS.md).
const ACTS = [
  { season: 'summer', section: 'experience', photo: 'summer-crossing' },
  { season: 'autumn', section: 'projects', photo: 'autumn-corridor' },
  { season: 'winter', section: 'skills', photo: 'winter-school' },
  { season: 'night', section: 'blog', photo: 'library-stacks' },
];

const clamp = (v) => Math.min(1, Math.max(0, v));
const smooth = (t) => t * t * (3 - 2 * t);

/* One fixed backdrop behind the home page's episodes. Each season is a graded photograph;
   as a section comes up the screen its photograph dissolves in over the last, and while a
   section scrolls, its photograph drifts very slowly, as if the camera were tracking. At the
   top, the flat blue the staircase fall ends on holds, then clears to the summer crossing. */
export default function SceneStage() {
  const layers = useRef([]);
  const blue = useRef(null);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const vh = window.innerHeight;
      const rects = ACTS.map(({ section }) => document.getElementById(section)?.getBoundingClientRect());
      // p[i]: how far act i has dissolved in, from its section's top entering the bottom of
      // the screen to it reaching the top fifth
      const p = rects.map((r) => (r ? smooth(clamp((vh - r.top) / (vh * 0.8))) : 0));
      // the landing: the blue holds until the hero has all but left (it shows the same blue)
      const land = rects[0] ? smooth(clamp((vh * 0.25 - rects[0].top) / (vh * 0.7))) : 1;
      if (blue.current) blue.current.style.opacity = String(1 - land);
      ACTS.forEach((_, i) => {
        const el = layers.current[i];
        if (!el) return;
        const shown = i === 0 ? 1 : p[i];
        const covered = i + 1 < ACTS.length && p[i + 1] >= 1;
        el.style.opacity = String(shown);
        el.style.visibility = shown <= 0 || covered ? 'hidden' : 'visible';
        const r = rects[i];
        const drift = r ? clamp((vh - r.top) / (r.height + vh)) : 0;
        el.style.setProperty('--drift', drift.toFixed(4));
      });
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <div className="stage" aria-hidden="true">
      {ACTS.map(({ season, photo }, i) => (
        <div key={season} ref={(el) => (layers.current[i] = el)} className={`stage-act stage-act--${season}`}>
          <div className="stage-frame">
            <ScenePhoto name={photo} eager={i === 0} />
          </div>
          <div className="stage-grade" />
        </div>
      ))}
      <div ref={blue} className="stage-blue" />
    </div>
  );
}
