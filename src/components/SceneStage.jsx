import { createContext, useEffect, useRef } from "react";
import {
  SummerScene,
  AutumnScene,
  WinterScene,
  NightScene,
} from "./scenes/Scenes";

// Seasons drawn by the stage; a Scene with one of these leaves its own illustration out.
export const StageContext = createContext(null);
export const STAGED = ["summer", "autumn", "winter", "night"];

// The order the seasons play in down the home page, and the section each one belongs to.
const ACTS = [
  {
    season: "summer",
    section: "experience",
    Art: SummerScene,
    props: { live: true, sectionId: "experience" },
  },
  { season: "autumn", section: "projects", Art: AutumnScene },
  { season: "winter", section: "skills", Art: WinterScene },
  { season: "night", section: "blog", Art: NightScene },
];

const clamp = (v) => Math.min(1, Math.max(0, v));
const smooth = (t) => t * t * (3 - 2 * t);

/* One fixed backdrop behind the home page. The sections scroll over it, and as each new
   section comes up the screen its season dissolves in over the last one, while the old
   season turns towards the new one's light: summer warms into the autumn dusk, autumn
   frosts over into winter, winter darkens into night. At the top, the flat blue the
   staircase fall ends on clears to show the summer crossing. */
export default function SceneStage() {
  const layers = useRef([]);
  const blue = useRef(null);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const vh = window.innerHeight;
      // p[i]: how far act i has dissolved in, from its section's top entering the bottom
      // of the screen to it reaching the top fifth
      const p = ACTS.map(({ section }) => {
        const el = document.getElementById(section);
        if (!el) return 0;
        return smooth(
          clamp((vh - el.getBoundingClientRect().top) / (vh * 0.8)),
        );
      });
      // the landing: the blue holds until the hero has all but left the screen (it shows
      // the same blue), then clears as Experience comes up
      const exp = document.getElementById(ACTS[0].section);
      const land = exp ? smooth(clamp((vh * 0.25 - exp.getBoundingClientRect().top) / (vh * 0.7))) : 1;
      if (blue.current) blue.current.style.opacity = String(1 - land);
      ACTS.forEach((_, i) => {
        const el = layers.current[i];
        if (!el) return;
        const shown = i === 0 ? 1 : p[i];
        // the outgoing season leans towards the next one's light as it goes
        const going = i + 1 < ACTS.length ? p[i + 1] : 0;
        const covered = i + 1 < ACTS.length && p[i + 1] >= 1;
        el.style.opacity = String(shown);
        el.style.visibility = shown <= 0 || covered ? "hidden" : "visible";
        el.style.setProperty("--out", going.toFixed(3));
        el.style.setProperty("--in", shown.toFixed(3));
      });
      // a gentle rise as the summer scene settles in under the falling viewer
      if (layers.current[0])
        layers.current[0].style.setProperty("--land", land.toFixed(3));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div className="stage" aria-hidden="true">
      {ACTS.map(({ season, Art, props }, i) => (
        <div
          key={season}
          ref={(el) => (layers.current[i] = el)}
          className={`stage-act stage-act--${season}`}
        >
          <Art className="scene-art" {...props} />
          <div className="stage-tint" />
        </div>
      ))}
      <div ref={blue} className="stage-blue" />
    </div>
  );
}
