import { useId } from 'react';
import { Svg, rng } from './common';

/* ── WINTER · Scene 004: the shrine on the hill, snowing ──
   Stone steps climb the slope to a red gate and a shrine with a lit doorway.
   Cedars hold snow on every tier; footprints lead to the first step. */

const NIGHT = '#0e1838';
const STONE = '#2b3762';
const SNOW = '#e6ecf8';
const SNOW_SHADE = '#b7c3e0';
const RED = '#c8102e';

const r = rng(41);
const STARS = Array.from({ length: 70 }, () => ({ x: r() * 1600, y: r() * 430, s: 0.7 + r() * 1.6, o: 0.4 + r() * 0.6 }));
const FLAKES = Array.from({ length: 90 }, () => ({ x: r() * 1600, y: r() * 1000, s: 1.2 + r() * 2.4 }));

const STEP_N = 17;
const STAIR = { x0: 590, y0: 960, x1: 1070, y1: 470 };
const STEPS = Array.from({ length: STEP_N }, (_, i) => {
  const dx = (STAIR.x1 - STAIR.x0) / STEP_N;
  const dy = (STAIR.y1 - STAIR.y0) / STEP_N;
  return { x: STAIR.x0 + dx * i, y: STAIR.y0 + dy * (i + 1), w: dx, h: -dy };
});

function stairPath() {
  let d = `M${STAIR.x0} 1000 V${STAIR.y0}`;
  STEPS.forEach((s) => {
    d += ` V${s.y.toFixed(1)} H${(s.x + s.w).toFixed(1)}`;
  });
  return `${d} V1000 Z`;
}

function cedar(x, base, h, w, seed) {
  const rr = rng(seed);
  const tiers = 5;
  const parts = [];
  for (let i = 0; i < tiers; i += 1) {
    const t = i / tiers;
    const top = base - h * (0.25 + t * 0.75);
    const bottom = base - h * t * 0.78;
    const half = w * (1 - t * 0.78) * (0.9 + rr() * 0.2);
    parts.push({ top, bottom, half });
  }
  return { x, base, h, parts };
}

const CEDARS = [
  cedar(70, 960, 520, 120, 1),
  cedar(210, 990, 420, 100, 2),
  cedar(360, 1000, 300, 80, 3),
  cedar(920, 640, 260, 70, 4),
  cedar(1460, 480, 300, 80, 5),
  cedar(1580, 500, 380, 96, 6),
];

const PRINTS = Array.from({ length: 12 }, (_, i) => ({ x: 150 + i * 38, y: 958 - i * 1.5 + (i % 2) * 10 }));

function Cedar({ c }) {
  return (
    <g>
      <rect x={c.x - 5} y={c.base - c.h * 0.3} width="10" height={c.h * 0.3} fill="#070c22" />
      {c.parts.map((p, i) => (
        <g key={i}>
          <polygon points={`${c.x},${p.top} ${c.x - p.half},${p.bottom} ${c.x + p.half},${p.bottom}`} fill="#08102a" />
          <path
            d={`M${c.x} ${p.top} L${c.x - p.half} ${p.bottom} L${c.x - p.half * 0.55} ${p.bottom - 6} L${c.x - 4} ${p.top + 14} Z`}
            fill={SNOW}
            opacity="0.5"
          />
        </g>
      ))}
    </g>
  );
}

function Lantern({ x, y, s = 1, glow }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <circle cx="0" cy="-46" r="70" fill={`url(#${glow})`} />
      <rect x="-22" y="-82" width="44" height="9" fill="#060a1c" />
      <rect x="-24" y="-86" width="48" height="5" fill={SNOW} />
      <rect x="-15" y="-73" width="30" height="28" fill="#ffd27a" />
      <rect x="-26" y="-45" width="52" height="8" fill="#060a1c" />
      <rect x="-8" y="-37" width="16" height="37" fill="#060a1c" />
    </g>
  );
}

export function WinterScene({ className, align = 'xMidYMid' }) {
  const id = useId();
  const sky = `${id}-sky`;
  const halo = `${id}-halo`;
  const glow = `${id}-glow`;
  return (
    <Svg className={className} align={align}>
      <defs>
        <linearGradient id={sky} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#050a1e" />
          <stop offset="0.6" stopColor="#14234f" />
          <stop offset="1" stopColor="#2b3f7a" />
        </linearGradient>
        <radialGradient id={halo}>
          <stop offset="0" stopColor="#c9d5ff" stopOpacity="0.45" />
          <stop offset="1" stopColor="#c9d5ff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={glow}>
          <stop offset="0" stopColor="#ffcf7a" stopOpacity="0.75" />
          <stop offset="1" stopColor="#ffcf7a" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="1600" height="1000" fill={`url(#${sky})`} />
      <g fill="#ffffff">
        {STARS.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={s.s} opacity={s.o} />
        ))}
      </g>
      <circle cx="1180" cy="170" r="230" fill={`url(#${halo})`} />
      <circle cx="1180" cy="170" r="58" fill="#f2eee2" />

      {/* mountains, snow on the ridges */}
      <path d="M0 610 L180 470 L330 560 L520 420 L700 560 L860 470 L1040 600 L1600 600 V1000 H0 Z" fill="#22356b" />
      <path d="M180 470 L222 503 L200 500 L176 520 L150 494 Z M520 420 L566 456 L540 452 L512 474 L486 448 Z M860 470 L896 500 L872 498 L850 516 L828 496 Z" fill="#c9d4ef" />
      <path d="M0 680 L240 600 L460 668 L640 610 L820 690 L1600 690 V1000 H0 Z" fill="#17254f" />

      {/* the hill, the steps, the gate and the shrine */}
      <path d={`M520 1000 L${STAIR.x0 - 30} ${STAIR.y0} L${STAIR.x1 + 10} ${STAIR.y1} L1600 ${STAIR.y1} V1000 Z`} fill={NIGHT} />
      <path d={stairPath()} fill={STONE} />
      <g fill={SNOW}>
        {STEPS.map((s, i) => (
          <rect key={i} x={s.x} y={s.y - 3} width={s.w + 1} height="6" />
        ))}
      </g>
      <rect x={STAIR.x1} y={STAIR.y1 - 4} width="540" height="10" fill={SNOW} />

      <Cedar c={CEDARS[4]} />
      <Cedar c={CEDARS[5]} />

      {/* shrine hall */}
      <g>
        <rect x="1330" y="392" width="230" height="80" fill="#0a1129" />
        <rect x="1420" y="412" width="54" height="60" fill="#ffcf7a" />
        <rect x="1445" y="412" width="4" height="60" fill="#0a1129" />
        <path d="M1300 396 L1590 396 L1550 340 Q1445 318 1340 340 Z" fill="#060a1c" />
        <path d="M1340 340 Q1445 318 1550 340 L1560 352 Q1445 330 1330 352 Z" fill={SNOW} />
      </g>

      {/* the gate */}
      <g>
        <rect x="1126" y="330" width="16" height="142" fill={RED} />
        <rect x="1222" y="330" width="16" height="142" fill={RED} />
        <rect x="1108" y="350" width="148" height="11" fill={RED} />
        <rect x="1104" y="320" width="156" height="10" fill={RED} />
        <path d="M1088 318 Q1182 330 1276 318 L1282 304 Q1182 318 1082 304 Z" fill="#060a1c" />
        <path d="M1082 304 Q1182 318 1282 304 L1278 298 Q1182 310 1086 298 Z" fill={SNOW} />
        <rect x="1172" y="326" width="20" height="24" fill="#060a1c" />
      </g>
      <Lantern x={1090} y={472} s={0.7} glow={glow} />
      <Lantern x={1280} y={472} s={0.7} glow={glow} />

      {/* lanterns up the steps */}
      {[3, 8, 13].map((i) => (
        <Lantern key={i} x={STEPS[i].x - 26} y={STEPS[i].y + 4} s={0.55} glow={glow} />
      ))}

      <Cedar c={CEDARS[3]} />

      {/* foreground: cedars and snow, footprints to the first step */}
      <path d="M0 900 Q 160 860 330 905 Q 460 880 600 960 L600 1000 H0 Z" fill={SNOW} />
      <path d="M0 950 Q 200 920 400 960 Q 500 950 600 990 L600 1000 H0 Z" fill={SNOW_SHADE} opacity="0.7" />
      <g fill={SNOW_SHADE}>
        {PRINTS.map((p, i) => (
          <ellipse key={i} cx={p.x} cy={p.y - 40} rx="7" ry="4" />
        ))}
      </g>
      {CEDARS.slice(0, 3).map((c, i) => (
        <Cedar key={i} c={c} />
      ))}

      <g fill="#ffffff" opacity="0.75">
        {FLAKES.map((f, i) => (
          <circle key={i} cx={f.x} cy={f.y} r={f.s} />
        ))}
      </g>
    </Svg>
  );
}
