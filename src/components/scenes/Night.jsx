import { useId } from 'react';
import { Layer, Linear, Pylon, Radial, Svg, rng } from './common';

/* ── NIGHT · Writing: the old cram school ──
   Two lights and nothing else: the moon, high on the left, edging every left-facing
   surface in cold blue; and one street lamp in the foreground, warm, pooling on a wet
   road. The building has a front and a side; most of its windows are broken or boarded,
   one on the third floor is still lit and spills onto the wall around it. */

const WALL = '#2a2f3d';
const DARK = '#090b12';
const PLANK = '#5b4a36';
const HORIZON = 760;
const r = rng(57);

const FRONT = { x0: 560, x1: 1180, top: 210, base: 800 };
const SIDE = { x: 1360, top: 268, base: 770 }; // the right side, receding
const ROWS = [250, 390, 530, 670];
const COLS = [600, 700, 800, 900, 1000, 1100];
const LIT = { row: 1, col: 3 };
const WINDOWS = ROWS.flatMap((y, ri) =>
  COLS.map((x, ci) => {
    if (ri === LIT.row && ci === LIT.col) return { x, y, kind: 'lit' };
    const n = r();
    return { x, y, kind: n < 0.35 ? 'broken' : n < 0.6 ? 'boarded' : 'dark', a: (r() - 0.5) * 20 };
  })
);
const TOWN_FAR = [];
const TOWN_NEAR = [];
for (let x = -20; x < 1620; ) {
  const w = 40 + r() * 90;
  TOWN_FAR.push({ x, w, h: 40 + r() * 110 });
  x += w + 3;
}
for (let x = -20; x < 1620; ) {
  const w = 70 + r() * 130;
  TOWN_NEAR.push({ x, w, h: 30 + r() * 90, lit: [r() < 0.3, r() < 0.2, r() < 0.25] });
  x += w + 8;
}
const STAINS = Array.from({ length: 16 }, () => ({ x: FRONT.x0 + 20 + r() * (FRONT.x1 - FRONT.x0 - 40), y: 230 + r() * 520, h: 40 + r() * 120 }));
const WEEDS = Array.from({ length: 130 }, (_, i) => ({ x: i * 12.5 + r() * 8, h: 12 + r() * 38, lean: (r() - 0.5) * 16 }));

function Window({ w }) {
  if (w.kind === 'lit') {
    return (
      <g>
        <rect x={w.x} y={w.y} width="72" height="92" fill="#f6d77a" />
        {Array.from({ length: 8 }, (_, i) => (
          <rect key={i} x={w.x} y={w.y + 6 + i * 11} width="72" height="3" fill="#cfa84f" />
        ))}
        <rect x={w.x + 34} y={w.y} width="4" height="92" fill={WALL} />
      </g>
    );
  }
  return (
    <g>
      <rect x={w.x} y={w.y} width="72" height="92" fill={DARK} />
      {w.kind === 'broken' && (
        <g fill="#3b4560">
          <polygon points={`${w.x},${w.y} ${w.x + 30},${w.y} ${w.x + 8},${w.y + 28}`} />
          <polygon points={`${w.x + 72},${w.y + 92} ${w.x + 42},${w.y + 92} ${w.x + 72},${w.y + 52}`} />
        </g>
      )}
      {w.kind === 'boarded' && (
        <g fill={PLANK}>
          <rect x={w.x - 6} y={w.y + 28} width="84" height="12" transform={`rotate(${w.a.toFixed(1)} ${w.x + 36} ${w.y + 34})`} />
          <rect x={w.x - 6} y={w.y + 58} width="84" height="12" transform={`rotate(${(-w.a).toFixed(1)} ${w.x + 36} ${w.y + 64})`} />
        </g>
      )}
      <rect x={w.x + 34} y={w.y} width="4" height="92" fill={WALL} />
      {/* moonlight catches the left jamb */}
      <rect x={w.x - 3} y={w.y} width="3" height="92" fill="#6f7fa8" opacity="0.6" />
    </g>
  );
}

export function NightScene({ className, align = 'xMidYMid' }) {
  const id = useId();
  const u = (n) => `${id}-${n}`;
  return (
    <Svg className={className} align={align}>
      <defs>
        <Linear id={u('sky')} stops={[[0, '#05070f'], [0.55, '#111a30'], [1, '#26324f']]} />
        <Radial id={u('halo')} cx={0.16} cy={0.15} r={0.32} stops={[[0, '#cdd8ff', 0.45], [1, '#cdd8ff', 0]]} />
        <Linear id={u('front')} stops={[[0, '#353b4b'], [1, '#22262f']]} />
        <Linear id={u('side')} x2={1} y2={0} stops={[[0, '#1c1f28'], [1, '#12141b']]} />
        <Linear id={u('road')} stops={[[0, '#1b2130'], [1, '#07080d']]} />
        <Linear id={u('cone')} stops={[[0, '#f6d77a', 0.45], [1, '#f6d77a', 0]]} />
        <Radial id={u('spill')} stops={[[0, '#f6d77a', 0.45], [1, '#f6d77a', 0]]} />
        <Radial id={u('pool')} stops={[[0, '#f6d77a', 0.42], [1, '#f6d77a', 0]]} />
        <Linear id={u('haze')} stops={[[0, '#2b3758', 0], [1, '#2b3758', 0.85]]} />
        <pattern id={u('mesh')} width="22" height="22" patternUnits="userSpaceOnUse">
          <path d="M0 0 L22 22 M22 0 L0 22" stroke="#5c6584" strokeWidth="1.3" />
        </pattern>
        <mask id={u('moon')}>
          <rect width="1600" height="1000" fill="#fff" />
          <circle cx="278" cy="132" r="44" fill="#000" />
        </mask>
      </defs>

      <Layer d={0}>
        <rect width="1600" height="1000" fill={`url(#${u('sky')})`} />
        <rect width="1600" height="1000" fill={`url(#${u('halo')})`} />
        <circle cx="256" cy="148" r="48" fill="#ece6d4" mask={`url(#${u('moon')})`} />
      </Layer>

      {/* clouds edged by the moon */}
      <Layer d={0.08}>
        {[
          [80, 196, 460, 16],
          [180, 230, 300, 10],
          [880, 110, 560, 14],
          [1060, 148, 380, 10],
        ].map(([x, y, w, h]) => (
          <g key={`${x}-${y}`}>
            <rect x={x} y={y} width={w} height={h} rx={h / 2} fill="#1b2440" />
            <rect x={x + 20} y={y} width={w - 60} height="3" rx="1.5" fill="#5e6e9c" opacity="0.8" />
          </g>
        ))}
      </Layer>

      <Layer d={0.15}>
        <g stroke="#8fa0c8" fill="none" opacity="0.35">
          <path d="M-20 300 Q 800 380 1620 280" strokeWidth="1.2" />
          <path d="M-20 330 Q 800 420 1620 312" strokeWidth="1" />
        </g>
        <Pylon x={1490} top={300} base={740} stroke="#8fa0c8" opacity={0.35} />
      </Layer>

      {/* two bands of town, the far one fainter */}
      <Layer d={0.22}>
        <g fill="#1c2540">
          {TOWN_FAR.map((b, i) => (
            <rect key={i} x={b.x} y={HORIZON - 40 - b.h} width={b.w} height={b.h + 40} />
          ))}
        </g>
        <rect y={HORIZON - 200} width="1600" height="200" fill={`url(#${u('haze')})`} />
        <g fill="#141a2b">
          {TOWN_NEAR.map((b, i) => (
            <rect key={i} x={b.x} y={HORIZON - b.h} width={b.w} height={b.h} />
          ))}
        </g>
        <g fill="#f3c969" opacity="0.75">
          {TOWN_NEAR.flatMap((b, i) =>
            b.lit.map((on, j) => (on ? <rect key={`${i}-${j}`} x={b.x + 10 + j * 18} y={HORIZON - b.h + 12} width="8" height="9" /> : null))
          )}
        </g>
      </Layer>

      {/* the building: moonlit front, a side receding into shadow */}
      <Layer d={0.4}>
        <polygon points={`${FRONT.x1},${FRONT.top} ${SIDE.x},${SIDE.top} ${SIDE.x},${SIDE.base} ${FRONT.x1},${FRONT.base}`} fill={`url(#${u('side')})`} />
        <path d={`M${FRONT.x0} ${FRONT.top} H${FRONT.x1 - 80} L${FRONT.x1 - 50} ${FRONT.top + 26} L${FRONT.x1 - 24} ${FRONT.top + 6} L${FRONT.x1} ${FRONT.top + 20} V${FRONT.base} H${FRONT.x0} Z`} fill={`url(#${u('front')})`} />
        <rect x={FRONT.x0} y={FRONT.top} width="3" height={FRONT.base - FRONT.top} fill="#7f8db5" opacity="0.8" />
        <rect x={FRONT.x0} y={FRONT.top - 2} width={FRONT.x1 - FRONT.x0 - 80} height="3" fill="#8e9cc4" opacity="0.8" />
        {[360, 500, 640].map((y) => (
          <rect key={y} x={FRONT.x0} y={y} width={FRONT.x1 - FRONT.x0} height="10" fill="#1d212b" />
        ))}
        <g fill="#181b23" opacity="0.8">
          {STAINS.map((s, i) => (
            <rect key={i} x={s.x} y={s.y} width="5" height={s.h} />
          ))}
        </g>
        {/* a dead rooftop sign: faded board, peeling, one corner moonlit */}
        <rect x="660" y="130" width="300" height="64" fill="#1c2233" />
        <rect x="676" y="146" width="190" height="12" fill="#3a4360" opacity="0.7" />
        <rect x="676" y="166" width="120" height="10" fill="#3a4360" opacity="0.5" />
        <polygon points="900,130 960,130 960,170" fill="#11151f" />
        <g stroke="#4b3b31" strokeWidth="4" fill="none">
          <rect x="660" y="130" width="300" height="64" />
          <line x1="690" y1="194" x2="690" y2="210" />
          <line x1="930" y1="194" x2="930" y2="210" />
        </g>
        {/* the lit window spills onto the wall around it */}
        <ellipse cx="936" cy="436" rx="150" ry="120" fill={`url(#${u('spill')})`} />
        {WINDOWS.map((w, i) => (
          <Window key={i} w={w} />
        ))}
        {/* fire escape on the side, in thin line */}
        <g stroke="#3c4458" strokeWidth="3" fill="none">
          {[350, 490, 630].map((y, i) => (
            <g key={y}>
              <line x1={FRONT.x1 + 24} y1={y + 6} x2={SIDE.x - 30} y2={y + 18} strokeWidth="5" />
              <line x1={i % 2 ? FRONT.x1 + 40 : SIDE.x - 40} y1={y + 8} x2={i % 2 ? SIDE.x - 40 : FRONT.x1 + 40} y2={y + 150} />
            </g>
          ))}
        </g>
        <rect x="820" y="720" width="90" height="80" fill={DARK} />
      </Layer>

      {/* the fence, its posts, the weeds */}
      <Layer d={0.6}>
        <rect y="700" width="1600" height="140" fill={`url(#${u('mesh')})`} opacity="0.85" />
        <g fill="#3a4258">
          {Array.from({ length: 11 }, (_, i) => i * 160).map((x) => (
            <rect key={x} x={x} y="690" width="8" height="150" />
          ))}
          <rect y="696" width="1600" height="4" />
        </g>
        <g fill="#7b8ab3" opacity="0.6">
          {Array.from({ length: 11 }, (_, i) => i * 160).map((x) => (
            <rect key={x} x={x} y="690" width="2" height="150" />
          ))}
        </g>
        <g>
          <rect x="1180" y="760" width="86" height="52" fill="#d9b23a" />
          <rect x="1180" y="798" width="86" height="14" fill="#11131b" />
          <rect x="1190" y="768" width="66" height="20" fill="#11131b" />
        </g>
        <g stroke="#0c120f" strokeWidth="3" strokeLinecap="round">
          {WEEDS.map((g, i) => (
            <line key={i} x1={g.x} y1="842" x2={g.x + g.lean} y2={842 - g.h} />
          ))}
        </g>
      </Layer>

      {/* the street, wet, receding */}
      <Layer d={0.78}>
        <rect y="838" width="1600" height="162" fill={`url(#${u('road')})`} />
        <rect x="928" y="846" width="18" height="150" fill="#f6d77a" opacity="0.12" />
        <rect x="300" y="846" width="26" height="154" fill="#f6d77a" opacity="0.18" />
        <g fill="#0a0c13" opacity="0.7">
          {[0, 160, 480, 640].map((x) => (
            <polygon key={x} points={`${x},840 ${x + 8},840 ${x + 8 + (x - 312) * 0.9},1000 ${x + (x - 312) * 0.9},1000`} />
          ))}
        </g>
      </Layer>

      {/* the lamp in the foreground */}
      <Layer d={0.95}>
        <polygon points="282,232 342,232 520,990 120,990" fill={`url(#${u('cone')})`} />
        <ellipse cx="316" cy="930" rx="240" ry="34" fill={`url(#${u('pool')})`} />
        <rect x="306" y="220" width="12" height="780" fill="#0b0d14" />
        <rect x="307" y="220" width="3" height="780" fill="#7f8db5" opacity="0.5" />
        <rect x="268" y="208" width="88" height="16" fill="#0b0d14" />
        <rect x="280" y="224" width="64" height="6" fill="#f6d77a" />
      </Layer>
    </Svg>
  );
}
