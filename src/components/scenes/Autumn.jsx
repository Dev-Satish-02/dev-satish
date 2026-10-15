import { useId } from 'react';
import { Branches, Canopy, Pole, Streaks, Svg, Wire, canopy, growTree, rng } from './common';

/* ── AUTUMN · Scene 003: the school at dusk ──
   The building backlit by a low sun, every window a small sunset, the tower clock
   stopped, ginkgo trees turning in front of the gate. */

const SHADE = '#4a1d32';
const DEEP = '#2a0f1e';

const r = rng(23);
const ROWS = [362, 472, 582, 692];
const COLS = [];
for (let x = 170; x < 1440; x += 76) {
  if (x > 700 && x < 880) continue; // the tower has its own stair windows
  COLS.push(x);
}
const WINDOWS = ROWS.flatMap((y) =>
  COLS.map((x) => {
    const n = r();
    return { x, y, kind: n < 0.6 ? 'glow' : n < 0.88 ? 'dark' : 'lit', curtain: r() < 0.3 ? 8 + r() * 18 : 0 };
  })
);

const TREES = [
  { x: 40, h: 110, seed: 31, depth: 3 },
  { x: 470, h: 120, seed: 32, depth: 4 },
  { x: 1150, h: 130, seed: 33, depth: 4 },
  { x: 1545, h: 200, seed: 34, depth: 4 },
].map((t) => {
  const tree = growTree({ x: t.x, y: 880, length: t.h, width: 16, depth: t.depth, seed: t.seed, spread: 0.55 });
  return { ...t, tree, leaves: canopy(tree.tips, { seed: t.seed + 100, radius: 26, count: 4, jitter: 26 }) };
});

const LEAVES = Array.from({ length: 46 }, () => ({ x: r() * 1600, y: 890 + r() * 104, rot: r() * 180, c: r() < 0.5 ? '#f2a541' : '#e2601f' }));

function clockHand(cx, cy, len, turns) {
  const a = turns * Math.PI * 2 - Math.PI / 2;
  return `M${cx} ${cy} L${(cx + Math.cos(a) * len).toFixed(1)} ${(cy + Math.sin(a) * len).toFixed(1)}`;
}

export function AutumnScene({ className, align = 'xMidYMid' }) {
  const id = useId();
  const sky = `${id}-sky`;
  const glow = `${id}-glow`;
  const pane = `${id}-pane`;
  return (
    <Svg className={className} align={align}>
      <defs>
        <linearGradient id={sky} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2c1742" />
          <stop offset="0.32" stopColor="#7b2a4c" />
          <stop offset="0.6" stopColor="#e2603a" />
          <stop offset="0.78" stopColor="#f6a24a" />
          <stop offset="1" stopColor="#f9c97c" />
        </linearGradient>
        <radialGradient id={glow}>
          <stop offset="0" stopColor="#ffd98a" stopOpacity="0.85" />
          <stop offset="1" stopColor="#ffd98a" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={pane} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffbf63" />
          <stop offset="1" stopColor="#e2603a" />
        </linearGradient>
      </defs>

      <rect width="1600" height="1000" fill={`url(#${sky})`} />
      <circle cx="1300" cy="600" r="320" fill={`url(#${glow})`} />
      <circle cx="1300" cy="610" r="104" fill="#ffe6a8" />
      <Streaks
        fill="#f08458"
        opacity={0.75}
        items={[
          [-40, 170, 620, 14],
          [200, 206, 380, 10],
          [880, 236, 760, 16],
          [1140, 276, 520, 10],
        ]}
      />
      <Streaks fill="#a8365a" opacity={0.6} items={[[400, 120, 600, 12], [1100, 96, 560, 10]]} />

      {/* the school */}
      <g>
        <rect x="140" y="336" width="1320" height="500" fill={SHADE} />
        <rect x="720" y="218" width="160" height="130" fill={SHADE} />
        <rect x="712" y="212" width="176" height="12" fill={DEEP} />
        <rect x="132" y="326" width="1336" height="14" fill={DEEP} />
        {/* rim light from the low sun */}
        <rect x="132" y="324" width="1336" height="3" fill="#ffb35c" />
        <rect x="712" y="210" width="176" height="3" fill="#ffb35c" />
        {[450, 560, 670, 780].map((y) => (
          <rect key={y} x="140" y={y} width="1320" height="8" fill="#5c2640" />
        ))}
        {/* roof fence and water tank */}
        <g stroke={DEEP} strokeWidth="2">
          <line x1="140" y1="300" x2="700" y2="300" />
          <line x1="900" y1="300" x2="1460" y2="300" />
          {Array.from({ length: 96 }, (_, i) => 144 + i * 14)
            .filter((x) => x < 700 || x > 900)
            .map((x) => (
              <line key={x} x1={x} y1="300" x2={x} y2="326" />
            ))}
        </g>
        <g fill={DEEP}>
          <rect x="1214" y="250" width="110" height="46" />
          <rect x="1224" y="296" width="6" height="30" />
          <rect x="1308" y="296" width="6" height="30" />
        </g>
        {/* classroom windows */}
        {WINDOWS.map((w, i) => (
          <g key={i}>
            <rect
              x={w.x}
              y={w.y}
              width="56"
              height="78"
              fill={w.kind === 'glow' ? `url(#${pane})` : w.kind === 'lit' ? '#ffe08a' : DEEP}
            />
            {w.curtain > 0 && <rect x={w.x} y={w.y} width={w.curtain} height="78" fill="#f6dcb4" opacity="0.85" />}
            <rect x={w.x + 26} y={w.y} width="4" height="78" fill={SHADE} />
            <rect x={w.x} y={w.y + 36} width="56" height="4" fill={SHADE} />
          </g>
        ))}
        {/* tower: stair windows, the stopped clock, the entrance */}
        {[362, 472, 582].map((y) => (
          <rect key={y} x="782" y={y} width="36" height="88" fill={`url(#${pane})`} />
        ))}
        <circle cx="800" cy="272" r="42" fill="#f7e6c6" stroke={DEEP} strokeWidth="6" />
        <g stroke={DEEP} strokeLinecap="round">
          <path d={clockHand(800, 272, 22, 4.73 / 12)} strokeWidth="5" />
          <path d={clockHand(800, 272, 32, 44 / 60)} strokeWidth="3.5" />
        </g>
        <rect x="748" y="700" width="104" height="136" fill="#ffd98a" />
        <rect x="798" y="700" width="4" height="136" fill={SHADE} />
      </g>

      {/* gate wall */}
      <rect x="0" y="826" width="1600" height="56" fill={DEEP} />
      <g fill="#3a1528">
        {[0, 240, 480, 1100, 1340, 1580].map((x) => (
          <rect key={x} x={x} y="812" width="26" height="70" />
        ))}
      </g>

      {/* power lines, the same as the summer street */}
      <g>
        <Wire x1={-20} y1={150} x2={1000} y2={176} sag={70} color={DEEP} />
        <Wire x1={1000} y1={176} x2={1620} y2={140} sag={50} color={DEEP} />
        <Wire x1={-20} y1={170} x2={1000} y2={192} sag={90} color={DEEP} />
        <Wire x1={1000} y1={192} x2={1620} y2={160} sag={60} color={DEEP} />
      </g>
      <Pole x={1000} top={160} base={890} color={DEEP} />

      {/* ginkgo trees */}
      {TREES.map((t) => (
        <g key={t.seed}>
          <Branches strokes={t.tree.strokes} color={DEEP} />
          <Canopy dots={t.leaves} shadow="#c4561b" mid="#f2a541" light="#ffd27a" />
        </g>
      ))}

      {/* the street, long shadows and fallen leaves */}
      <rect x="0" y="880" width="1600" height="120" fill="#1e0a16" />
      <g fill="#120510" opacity="0.8">
        {TREES.map((t) => (
          <polygon key={t.seed} points={`${t.x - 10},880 ${t.x + 20},880 ${t.x - 320},1000 ${t.x - 420},1000`} />
        ))}
        <polygon points="990,880 1012,880 700,1000 640,1000" />
      </g>
      <g>
        {LEAVES.map((l, i) => (
          <ellipse key={i} cx={l.x} cy={l.y} rx="7" ry="3.5" fill={l.c} transform={`rotate(${l.rot.toFixed(0)} ${l.x.toFixed(0)} ${l.y.toFixed(0)})`} />
        ))}
      </g>
    </Svg>
  );
}
