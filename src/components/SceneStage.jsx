import { createContext, useEffect, useRef } from 'react';
import { EDUCATION, EXPERIENCE, SKILL_GROUPS } from '../data/content';
import { getAllPosts, seasonFor } from '../lib/blog';
import { fullMotion } from '../lib/store';

// Seasons the stage provides; Scene.jsx leaves its own illustration out for these.
export const StageContext = createContext(null);
export const STAGED = ['summer', 'autumn', 'winter', 'night'];

// The order the sets play in, the section each belongs to, and the colour each one is cut in
// through. The first is the staircase's own final blue, so the fall lands in the summer sky.
const ACTS = [
  { set: 'summer', section: 'experience', cut: '#0f47c2', pinned: true },
  { set: 'autumn', section: 'projects', cut: '#c9844b' },
  { set: 'winter', section: 'skills', cut: '#dfe6ef' },
  { set: 'night', section: 'blog', cut: '#5c2418' },
  // the end card: the library thickens into its red, so the card arrives out of its own colour
  { set: null, section: 'contact', cut: '#d21f3c' },
];

// the line runs in time order, first internship to latest
export const STOPS = [...EXPERIENCE].reverse();

const clamp = (v) => Math.min(1, Math.max(0, v));
const smooth = (a, b, x) => {
  const t = clamp((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

// the running stage, for the sections that talk to it directly
let live = null;

// Writing asks the library to bring a volume forward
export function chooseVolume(i) {
  live?.choose(i);
}
// and which volume is under the pointer
export function pickVolume(x, y) {
  return live ? live.pick(x, y) : -1;
}
// Projects moves the camera to the pile of chairs by a case
export function openCase(i) {
  live?.setCase(i);
}

/* The fixed stage behind the episodes: one WebGL canvas (src/three/episodes.js) and a flat
   field of colour over it for the cuts. As the next section rises, the current set's haze
   thickens toward that section's colour, the frame goes flat, and the next set clears out of
   it. Without WebGL the flat fields still carry the seasons. */
export default function SceneStage() {
  const holder = useRef(null);
  const field = useRef(null);

  useEffect(() => {
    let stage;
    let alive = true;
    let raf = 0;
    const still = !fullMotion();

    const update = () => {
      raf = 0;
      const vh = window.innerHeight;
      const rects = ACTS.map(({ section }) => document.getElementById(section)?.getBoundingClientRect());
      if (!rects[0]) return;
      // t[i]: how far section i has risen, from its top at the bottom of the screen (0) to the top (1)
      const t = rects.map((r) => (r ? clamp((vh - r.top) / vh) : 0));
      let active = 0;
      for (let i = 1; i < ACTS.length; i += 1) if (t[i] >= 0.5) active = i;

      // the field: opaque while the hero leaves, then cleared; flat again at every cut
      let alpha;
      let colour;
      let haze = 0;
      const landing = smooth(0, 1, (vh * 0.25 - rects[0].top) / (vh * 0.4));
      if (active === 0 && (ACTS.length < 2 || t[1] < 0.02)) {
        alpha = 1 - landing;
        colour = ACTS[0].cut;
        haze = 1 - landing;
      } else {
        const next = active + 1 < ACTS.length ? t[active + 1] : 0;
        if (next > 0) {
          // leaving: thicken toward the next colour
          colour = ACTS[active + 1].cut;
          haze = smooth(0, 0.5, next);
          alpha = smooth(0.32, 0.5, next);
        } else if (!ACTS[active].set) {
          // the end card: held at its red
          colour = ACTS[active].cut;
          alpha = 1;
          haze = 1;
        } else {
          // arriving: clear out of this set's colour
          colour = ACTS[active].cut;
          const since = active === 0 ? landing : t[active];
          haze = active === 0 ? 1 - landing : 1 - smooth(0.5, 0.85, since);
          alpha = active === 0 ? 1 - landing : 1 - smooth(0.5, 0.7, since);
        }
      }
      field.current.style.background = colour;
      field.current.style.opacity = String(alpha);
      holder.current.parentElement.style.setProperty('--stage-bg', colour);

      if (!stage) return;
      const r = rects[active];
      const act = ACTS[active];
      // past the last set: the frame is the end card's red, and nothing needs drawing
      if (!act.set) {
        stage.setActive(false);
        return;
      }
      let p;
      if (still) p = 0.5;
      else if (act.pinned) p = clamp(-r.top / Math.max(1, r.height - vh));
      else p = clamp((vh - r.top) / (r.height + vh));
      stage.setActive(rects[0].top < vh);
      stage.setView(act.set, p);
      stage.setHaze(colour, haze);
      // build the next set ahead of its cut, so the switch never stalls
      if (ACTS[active + 1]?.set) stage.prepare(ACTS[active + 1].set);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    import('../three/episodes')
      .then(({ createEpisodes }) => {
        if (!alive) return;
        const posts = getAllPosts()
          .slice(0, 4)
          .map((p) => ({ title: p.title, season: seasonFor(p.categorySlug) }));
        stage = createEpisodes(holder.current, {
          stations: STOPS.map((s) => ({ name: s.company, role: s.role })),
          skills: SKILL_GROUPS,
          education: EDUCATION,
          posts,
        });
        stage.setStill(still);
        live = stage;
        update();
      })
      .catch((err) => {
        console.warn('[episodes] staying with flat colour fields', err);
      });

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (live === stage) live = null;
      stage?.dispose();
    };
  }, []);

  return (
    <div className="stage" aria-hidden="true">
      <div ref={holder} className="stage-canvas" />
      <div ref={field} className="stage-field" />
    </div>
  );
}
