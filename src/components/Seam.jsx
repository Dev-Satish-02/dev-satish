import { useEffect, useRef } from "react";
import { SCENE_BY_SEASON } from "./scenes/Scenes";
import { rng } from "./scenes/common";
import { useFullMotion } from "../lib/store";

/* The cut between two seasons. A seam is its own pinned stretch of scroll that overlaps one
   screen of the section before it and one of the section after: it opens on the exact last
   frame of one scene, plays a transition, and closes on the exact first frame of the next.
   Both sections' content scrolls over it, so nothing is hidden.
     train  — a commuter train passes close to the camera; after it, the season has turned
     leaves — a gust of ginkgo leaves, paling to snow as the next scene comes up through mist
     dusk   — night comes down from the top of the frame */

// Scene.jsx drifts parallax planes from 120px (section start) to 0 (section end). While a
// seam scrolls in over the end of one section, or off the start of the next, its copies of
// their illustrations follow the same drift, so the two never disagree.
function drift(section) {
  if (!section) return 0;
  const r = section.getBoundingClientRect();
  const q = Math.min(
    1,
    Math.max(0, -r.top / Math.max(1, r.height - window.innerHeight)),
  );
  return (1 - q) * 120;
}

export default function Seam({ from, to, kind }) {
  const motion = useFullMotion();
  const el = useRef(null);
  const fromLayer = useRef(null);
  const toLayer = useRef(null);
  const stage = useRef(null);
  const From = SCENE_BY_SEASON[from];
  const To = SCENE_BY_SEASON[to];

  useEffect(() => {
    if (!motion) return undefined;
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.current.getBoundingClientRect();
      const span = r.height - window.innerHeight;
      const t = Math.min(1, Math.max(0, -r.top / span));
      el.current.style.setProperty("--t", t.toFixed(4));
      // keep the picture fixed to the viewport while the pin slides in or out, so the seam
      // covers its neighbours with exactly what they already show
      const pinTop =
        r.top > 0 ? r.top : Math.min(0, r.bottom - window.innerHeight);
      stage.current.style.transform = pinTop
        ? `translateY(${(-pinTop).toFixed(1)}px)`
        : "";
      fromLayer.current.style.setProperty(
        "--sp",
        `${drift(el.current.previousElementSibling).toFixed(1)}px`,
      );
      toLayer.current.style.setProperty(
        "--sp",
        `${drift(el.current.nextElementSibling).toFixed(1)}px`,
      );
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
  }, [motion]);

  if (!motion) return null;
  return (
    <div ref={el} className={`seam seam--${kind}`} aria-hidden="true">
      <div className="seam-pin">
        <div ref={stage} className="seam-stage">
          <div ref={fromLayer} className="seam-layer seam-from">
            <From className="scene-art" />
          </div>
          <div ref={toLayer} className="seam-layer seam-to">
            <To className="scene-art" />
          </div>
          {kind === "train" && <CloseTrain />}
          {kind === "leaves" && <Gust />}
          {kind === "dusk" && <div className="seam-dusk" />}
        </div>
      </div>
    </div>
  );
}

/* Three cars seen from the platform edge, filling the frame. Each car is 1800×1000 user
   units, drawn at 180vh × 100vh. */
const CAR = 1800;
function CloseTrain() {
  return (
    <svg
      className="seam-train"
      viewBox={`0 0 ${CAR * 3} 1000`}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="ct-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c7ced8" />
          <stop offset="0.35" stopColor="#e9edf1" />
          <stop offset="0.7" stopColor="#cfd6df" />
          <stop offset="1" stopColor="#8c97a6" />
        </linearGradient>
        <linearGradient id="ct-glass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#334761" />
          <stop offset="0.55" stopColor="#1a2537" />
          <stop offset="1" stopColor="#2b3d57" />
        </linearGradient>
        {/* the evening coming in: a warm wash that strengthens as the train passes */}
        <linearGradient id="ct-warm" x1="1" y1="0" x2="0" y2="0">
          <stop offset="0" stopColor="#ff9a4d" stopOpacity="0" />
          <stop offset="1" stopColor="#ff8a3d" stopOpacity="0.38" />
        </linearGradient>
      </defs>
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(${i * CAR} 0)`}>
          <rect width={CAR} height="1000" fill="url(#ct-body)" />
          <rect width={CAR} height="54" fill="#7d8898" />
          <rect y="54" width={CAR} height="6" fill="#f4f6f8" opacity="0.8" />
          {/* windows, with a reflected sky streak across each */}
          {[360, 750, 1140].map((x) => (
            <g key={x}>
              <rect
                x={x}
                y="220"
                width="300"
                height="330"
                rx="22"
                fill="#6f7b8c"
              />
              <rect
                x={x + 10}
                y="230"
                width="280"
                height="310"
                rx="16"
                fill="url(#ct-glass)"
              />
              <polygon
                points={`${x + 40},540 ${x + 120},230 ${x + 170},230 ${x + 90},540`}
                fill="#9fb6d3"
                opacity="0.18"
              />
              <polygon
                points={`${x + 190},540 ${x + 230},380 ${x + 250},380 ${x + 210},540`}
                fill="#9fb6d3"
                opacity="0.12"
              />
            </g>
          ))}
          {/* doors at either end */}
          {[40, 1480].map((x) => (
            <g key={x}>
              <rect
                x={x}
                y="120"
                width="260"
                height="880"
                fill="none"
                stroke="#8a95a4"
                strokeWidth="6"
              />
              <line
                x1={x + 130}
                y1="120"
                x2={x + 130}
                y2="1000"
                stroke="#8a95a4"
                strokeWidth="5"
              />
              <rect
                x={x + 26}
                y="200"
                width="84"
                height="320"
                rx="10"
                fill="url(#ct-glass)"
              />
              <rect
                x={x + 150}
                y="200"
                width="84"
                height="320"
                rx="10"
                fill="url(#ct-glass)"
              />
            </g>
          ))}
          <rect y="640" width={CAR} height="40" fill="#2456b0" />
          <rect y="684" width={CAR} height="8" fill="#163b80" />
          <rect y="910" width={CAR} height="90" fill="#59636f" />
          {/* gangway bellows between cars */}
          <rect x={CAR - 30} width="60" height="1000" fill="#20252c" />
          {[0, 20, 40].map((dx) => (
            <rect
              key={dx}
              x={CAR - 26 + dx}
              width="6"
              height="1000"
              fill="#333a44"
            />
          ))}
        </g>
      ))}
      <rect width={CAR * 3} height="1000" fill="url(#ct-warm)" />
      {/* speed: long faint streaks */}
      <g fill="#ffffff" opacity="0.16">
        <rect x="300" y="590" width="2600" height="3" />
        <rect x="1900" y="780" width="2900" height="2" />
        <rect x="700" y="860" width="1800" height="2" />
      </g>
    </svg>
  );
}

/* Ginkgo leaves on a gust, and the same leaves as snow. Each leaf drifts by its own
   vector as the seam scrolls (--t), so the gust has depth: big near leaves move fast. */
const g = rng(31);
const GUST = Array.from({ length: 110 }, () => {
  const near = g() ** 2;
  return {
    x: g() * 1900 - 500,
    y: g() * 1500 - 700,
    s: 6 + near * 26,
    dx: 500 + near * 900 + g() * 300,
    dy: 700 + near * 700 + g() * 400,
    rot: (g() - 0.5) * 900,
    c: ["#f4a52f", "#e8862a", "#ffc955", "#c9611f"][Math.floor(g() * 4)],
  };
});
function Gust() {
  return (
    <svg
      className="seam-gust"
      viewBox="0 0 1600 1000"
      preserveAspectRatio="xMidYMid slice"
    >
      {GUST.map((l, i) => (
        <g
          key={i}
          className="gust-leaf"
          style={{
            "--dx": `${l.dx}px`,
            "--dy": `${l.dy}px`,
            "--rot": `${l.rot}deg`,
          }}
        >
          {/* a ginkgo fan; its snow twin sits on top and takes over */}
          <path className="gust-fan" d={fan(l.x, l.y, l.s)} fill={l.c} />
          <circle
            className="gust-flake"
            cx={l.x}
            cy={l.y}
            r={Math.max(2, l.s * 0.22)}
            fill="#f4f8f6"
          />
        </g>
      ))}
    </svg>
  );
}
function fan(x, y, s) {
  return `M${x} ${y + s * 0.6} L${x - s * 0.62} ${y - s * 0.25} Q${x} ${y - s * 0.75} ${x + s * 0.62} ${y - s * 0.25} Z`;
}
