import { useId } from 'react';
import { Branches, Canopy, Layer, Linear, Pole, Pylon, Radial, Svg, Wire, canopy, growTree, rng } from './common';

/* ── AUTUMN · Projects: the school at dusk ──
   The sun sits low behind the school, so everything facing us is in shadow and every
   edge that faces the sun is lit: the roofline, the ginkgos, the pole in the
   foreground. The building has a side as well as a front, the yard recedes toward it,
   and the long shadows of the trees come forward to meet the viewer. */

const HORIZON = 720;
const r = rng(23);

const FRONT = { x0: 420, x1: 1420, top: 400, base: HORIZON }; // the face we see square-on
const SIDE = { x: 250, top: 452, base: 700 }; // the left side, receding
const TOWER = { x0: 860, x1: 980, top: 300 };

const ROWS = [430, 510, 590];
const COLS = [];
for (let x = FRONT.x0 + 26; x < FRONT.x1 - 40; x += 72) {
  if (x > TOWER.x0 - 50 && x < TOWER.x1 + 10) continue;
  COLS.push(x);
}
const WINDOWS = ROWS.flatMap((y) => COLS.map((x) => ({ x, y, lit: r() < 0.12, curtain: r() < 0.3 ? 6 + r() * 14 : 0 })));

const CITY = [];
for (let x = -20; x < 1620; ) {
  const w = 50 + r() * 120;
  CITY.push({ x, w, h: 30 + r() * 80 });
  x += w + 4;
}

const TREES = [
  { x: 120, y: 760, h: 150, seed: 31 },
  { x: 1530, y: 770, h: 170, seed: 34 },
  { x: 640, y: 735, h: 90, seed: 32 },
  { x: 1240, y: 738, h: 96, seed: 33 },
].map((t) => {
  const tree = growTree({ x: t.x, y: t.y, length: t.h * 0.45, width: 12, depth: 4, seed: t.seed, spread: 0.6 });
  return { ...t, tree, leaves: canopy(tree.tips, { seed: t.seed + 100, radius: 22, count: 6, jitter: 30 }) };
});

const LEAVES = Array.from({ length: 140 }, () => {
  const y = HORIZON + 12 + r() ** 0.8 * (1000 - HORIZON - 12);
  const k = (y - HORIZON) / (1000 - HORIZON);
  return { x: r() * 1600, y, s: 2 + k * 8, rot: r() * 180, c: r() < 0.5 ? '#f2a541' : '#d9531c' };
});

function hand(cx, cy, len, turns) {
  const a = turns * Math.PI * 2 - Math.PI / 2;
  return `M${cx} ${cy} L${(cx + Math.cos(a) * len).toFixed(1)} ${(cy + Math.sin(a) * len).toFixed(1)}`;
}

export function AutumnScene({ className, align = 'xMidYMid' }) {
  const id = useId();
  const u = (n) => `${id}-${n}`;
  return (
    <Svg className={className} align={align}>
      <defs>
        <Linear id={u('sky')} stops={[[0, '#2a163f'], [0.3, '#6e2749'], [0.56, '#d75a3a'], [0.72, '#f39a48'], [1, '#ffd18a']]} />
        <Radial id={u('sun')} cx={0.78} cy={0.66} r={0.5} stops={[[0, '#fff1c4', 0.95], [0.18, '#ffd48a', 0.6], [0.5, '#f7944a', 0.2], [1, '#f7944a', 0]]} />
        <Linear id={u('haze')} stops={[[0, '#ffc98a', 0], [1, '#ffc98a', 0.75]]} />
        <Linear id={u('front')} stops={[[0, '#6c2a42'], [1, '#3e1729']]} />
        <Linear id={u('side')} stops={[[0, '#3f1528'], [1, '#26101c']]} />
        <Linear id={u('pane')} stops={[[0, '#ffc777'], [0.6, '#f0803c'], [1, '#b8452a']]} />
        <Linear id={u('yard')} stops={[[0, '#b9643a'], [0.3, '#7d3a26'], [1, '#2c1117']]} />
      </defs>

      <Layer d={0}>
        <rect width="1600" height="1000" fill={`url(#${u('sky')})`} />
        <rect width="1600" height="1000" fill={`url(#${u('sun')})`} />
        <circle cx="1250" cy="650" r="84" fill="#ffe7ad" />
      </Layer>

      {/* streak clouds, lit from below */}
      <Layer d={0.08}>
        {[
          [-40, 150, 640, 18],
          [700, 120, 820, 14],
          [180, 236, 520, 12],
          [960, 268, 640, 16],
          [420, 330, 380, 10],
        ].map(([x, y, w, h]) => (
          <g key={`${x}-${y}`}>
            <rect x={x} y={y} width={w} height={h} rx={h / 2} fill="#7a2c4c" opacity="0.85" />
            <rect x={x + 30} y={y + h - 4} width={w - 60} height="4" rx="2" fill="#f7a05c" opacity="0.9" />
          </g>
        ))}
      </Layer>

      {/* wires and a pylon in line-art */}
      <Layer d={0.15}>
        <g stroke="#ffd9b0" fill="none" opacity="0.55">
          <path d="M-20 170 Q 700 250 1620 150" strokeWidth="1.4" />
          <path d="M-20 205 Q 700 290 1620 186" strokeWidth="1.1" />
          <path d="M-20 250 Q 720 330 1620 238" strokeWidth="0.9" />
        </g>
        <Pylon x={250} top={190} base={690} stroke="#ffd9b0" opacity={0.55} />
      </Layer>

      {/* the town on the horizon, in haze */}
      <Layer d={0.25}>
        <g fill="#b14d58" opacity="0.85">
          {CITY.map((b, i) => (
            <rect key={i} x={b.x} y={HORIZON - 40 - b.h} width={b.w} height={b.h + 40} />
          ))}
        </g>
        <rect y={HORIZON - 160} width="1600" height="160" fill={`url(#${u('haze')})`} />
      </Layer>

      {/* the school: a side and a front, rim-lit from behind */}
      <Layer d={0.4}>
        <polygon points={`${SIDE.x},${SIDE.top} ${FRONT.x0},${FRONT.top} ${FRONT.x0},${FRONT.base} ${SIDE.x},${SIDE.base}`} fill={`url(#${u('side')})`} />
        {[0, 1, 2].map((row) => {
          const t0 = row / 3 + 0.08;
          const t1 = t0 + 0.2;
          const at = (t, x) => {
            const k = (x - SIDE.x) / (FRONT.x0 - SIDE.x);
            const top = SIDE.top + (FRONT.top - SIDE.top) * k;
            const base = SIDE.base + (FRONT.base - SIDE.base) * k;
            return top + (base - top) * t;
          };
          return [300, 350].map((x) => (
            <polygon
              key={`${row}-${x}`}
              points={`${x},${at(t0, x)} ${x + 36},${at(t0, x + 36)} ${x + 36},${at(t1, x + 36)} ${x},${at(t1, x)}`}
              fill="#8a3a2c"
              opacity="0.7"
            />
          ));
        })}
        <rect x={FRONT.x0} y={FRONT.top} width={FRONT.x1 - FRONT.x0} height={FRONT.base - FRONT.top} fill={`url(#${u('front')})`} />
        <rect x={TOWER.x0} y={TOWER.top} width={TOWER.x1 - TOWER.x0} height={FRONT.top - TOWER.top + 4} fill={`url(#${u('front')})`} />
        {/* rim light along every edge that faces the low sun */}
        <g fill="#ffb35c">
          <rect x={FRONT.x0} y={FRONT.top - 3} width={FRONT.x1 - FRONT.x0} height="3" />
          <rect x={TOWER.x0} y={TOWER.top - 3} width={TOWER.x1 - TOWER.x0} height="3" />
          <rect x={FRONT.x1 - 3} y={FRONT.top} width="3" height={FRONT.base - FRONT.top} opacity="0.8" />
          <polygon points={`${SIDE.x},${SIDE.top} ${FRONT.x0},${FRONT.top} ${FRONT.x0},${FRONT.top + 2} ${SIDE.x},${SIDE.top + 2}`} />
        </g>
        <g stroke="#ffcf9a" strokeWidth="1.2" opacity="0.5">
          <line x1={FRONT.x0} y1={FRONT.top - 26} x2={FRONT.x1} y2={FRONT.top - 26} />
          {Array.from({ length: 72 }, (_, i) => FRONT.x0 + i * 14)
            .filter((x) => x < TOWER.x0 || x > TOWER.x1)
            .map((x) => (
              <line key={x} x1={x} y1={FRONT.top - 26} x2={x} y2={FRONT.top} />
            ))}
        </g>
        {[495, 575, 655].map((y) => (
          <rect key={y} x={FRONT.x0} y={y} width={FRONT.x1 - FRONT.x0} height="5" fill="#7a3048" />
        ))}
        {WINDOWS.map((w, i) => (
          <g key={i}>
            <rect x={w.x} y={w.y} width="48" height="58" fill={w.lit ? '#ffe39a' : `url(#${u('pane')})`} />
            {w.curtain > 0 && <rect x={w.x} y={w.y} width={w.curtain} height="58" fill="#f6d6aa" opacity="0.8" />}
            <rect x={w.x + 22} y={w.y} width="4" height="58" fill="#4a1b30" />
            <rect x={w.x} y={w.y + 26} width="48" height="3" fill="#4a1b30" />
            <rect x={w.x} y={w.y + 52} width="48" height="6" fill="#2c0f1d" opacity="0.5" />
          </g>
        ))}
        {/* the tower, its stopped clock and the lit entrance */}
        {[440, 520].map((y) => (
          <rect key={y} x={TOWER.x0 + 44} y={y} width="32" height="62" fill={`url(#${u('pane')})`} />
        ))}
        <circle cx={(TOWER.x0 + TOWER.x1) / 2} cy="350" r="34" fill="#f7e2bd" stroke="#2c0f1d" strokeWidth="5" />
        <g stroke="#2c0f1d" strokeLinecap="round">
          <path d={hand(920, 350, 18, 4.73 / 12)} strokeWidth="4.5" />
          <path d={hand(920, 350, 26, 44 / 60)} strokeWidth="3" />
        </g>
        <rect x={TOWER.x0 + 20} y="626" width="80" height="94" fill="#ffd98a" />
        <rect x={TOWER.x0 + 58} y="626" width="4" height="94" fill="#4a1b30" />
      </Layer>

      {/* the yard wall and the ginkgos, edged in light */}
      <Layer d={0.6}>
        <rect y="700" width="1600" height="28" fill="#3a1424" />
        <rect y="698" width="1600" height="3" fill="#f49a54" opacity="0.7" />
        {TREES.map((t) => (
          <g key={t.seed}>
            <Branches strokes={t.tree.strokes} color="#1f0b14" />
            <Canopy dots={t.leaves} shadow="#2b0f18" mid="#5a2420" light="#d8783a" />
          </g>
        ))}
      </Layer>

      {/* the yard, the shadows coming forward, the fallen leaves */}
      <Layer d={0.78}>
        <rect y="726" width="1600" height="274" fill={`url(#${u('yard')})`} />
        <g fill="#1b0910" opacity="0.55">
          {TREES.map((t) => (
            <polygon key={t.seed} points={`${t.x - 14},${Math.max(t.y, 730)} ${t.x + 14},${Math.max(t.y, 730)} ${t.x - 160},1000 ${t.x - 330},1000`} />
          ))}
          <polygon points={`${FRONT.x0},728 ${FRONT.x1},728 ${FRONT.x1 - 120},800 ${FRONT.x0 - 180},800`} opacity="0.5" />
        </g>
        <polygon points="980,728 1500,728 1600,840 1600,1000 1240,1000" fill="#ffb366" opacity="0.12" />
        <g>
          {LEAVES.map((l, i) => (
            <ellipse key={i} cx={l.x} cy={l.y} rx={l.s} ry={l.s * 0.45} fill={l.c} opacity="0.9" transform={`rotate(${l.rot.toFixed(0)} ${l.x.toFixed(0)} ${l.y.toFixed(0)})`} />
          ))}
        </g>
      </Layer>

      {/* the pole in the foreground, its wires, its rim light */}
      <Layer d={0.95}>
        <Wire x1={-20} y1={250} x2={92} y2={210} sag={14} color="#1a0a12" />
        <Wire x1={92} y1={210} x2={1620} y2={300} sag={110} color="#1a0a12" width={2.5} />
        <Wire x1={92} y1={232} x2={1620} y2={330} sag={130} color="#1a0a12" width={2} />
        <Pole x={92} top={190} base={1000} color="#1a0a12" />
        <rect x="96" y="190" width="3" height="810" fill="#ff9d55" opacity="0.7" />
      </Layer>
    </Svg>
  );
}
