import { useId } from 'react';
import { Layer, Linear, Radial, Svg, rng } from './common';

/* ── WINTER · Skills: the bamboo stair to the shrine ──
   One-point perspective: stone steps climb between walls of bamboo to a pale gate at
   the end of the path, where the light is. Bamboo comes in three depths: far stalks
   thin and lost in the haze, near stalks broad and almost white at the root, darkening
   to the teal of the canopy. Stalk shadows lie across the steps; pale leaves cover the
   moss. Cool, still, the season turning. */

const GATE = { x: 980, y: 300 };
const PATH = { bl: 520, br: 1300, tl: 950, tr: 1010 }; // path edges at y = 1000 and y = GATE.y
const r = rng(77);

function pathX(edge, y) {
  const t = (y - GATE.y) / (1000 - GATE.y);
  return edge === 'l' ? PATH.tl + (PATH.bl - PATH.tl) * t : PATH.tr + (PATH.br - PATH.tr) * t;
}

const N_STEPS = 30;
const STEPS = Array.from({ length: N_STEPS }, (_, i) => {
  const t0 = (i / N_STEPS) ** 1.9;
  const t1 = ((i + 1) / N_STEPS) ** 1.9;
  return { y0: GATE.y + (1000 - GATE.y) * t0, y1: GATE.y + (1000 - GATE.y) * t1, t: t0 };
});

// stalks avoid the path: pick an x outside the path at their base height
function stalks(count, { minW, maxW, baseMin, baseMax, seed }) {
  const rr = rng(seed);
  const out = [];
  let guard = 0;
  while (out.length < count && guard < count * 20) {
    guard += 1;
    const base = baseMin + rr() * (baseMax - baseMin);
    const w = minW + rr() * (maxW - minW);
    const x = rr() * 1640 - 20;
    const margin = w + 10;
    if (x > pathX('l', base) - margin && x < pathX('r', base) + margin) continue;
    out.push({ x, w, base, lean: (rr() - 0.5) * 5, nodes: 110 + rr() * 70, phase: rr() * 100 });
  }
  return out.sort((a, b) => a.w - b.w);
}

const FAR = stalks(70, { minW: 3, maxW: 7, baseMin: 380, baseMax: 560, seed: 1 });
const MID = stalks(44, { minW: 9, maxW: 17, baseMin: 600, baseMax: 860, seed: 2 });
const NEAR = stalks(22, { minW: 24, maxW: 62, baseMin: 1000, baseMax: 1080, seed: 3 });

const LEAVES = Array.from({ length: 380 }, () => {
  const y = GATE.y + 40 + r() ** 0.7 * (1000 - GATE.y - 40);
  const side = r() < 0.5 ? 'l' : 'r';
  const edge = pathX(side, y);
  const x = side === 'l' ? edge - r() * (edge + 20) : edge + r() * (1620 - edge);
  const k = (y - GATE.y) / (1000 - GATE.y);
  return { x, y, s: 2 + k * 9, rot: r() * 180, c: r() < 0.6 ? '#e6eee5' : '#c6d6cb' };
});
const STONE = Array.from({ length: N_STEPS }, () => r());
// a little snow: drifts on the moss and a few flakes in the air
const FLAKES = Array.from({ length: 90 }, () => ({ x: r() * 1600, y: r() * 1000, s: 1.2 + r() ** 3 * 4 }));
const PATH_LEAVES = Array.from({ length: 60 }, () => {
  const y = GATE.y + 120 + r() * (1000 - GATE.y - 120);
  const x = pathX('l', y) + r() * (pathX('r', y) - pathX('l', y));
  const k = (y - GATE.y) / (1000 - GATE.y);
  return { x, y, s: 2 + k * 8, rot: r() * 180 };
});

function Stalk({ s, fill, node, shade }) {
  const top = -40;
  const h = s.base - top;
  const marks = [];
  for (let y = s.base - s.nodes * 0.6 - (s.phase % s.nodes); y > top; y -= s.nodes) marks.push(y);
  return (
    <g transform={`rotate(${s.lean.toFixed(2)} ${s.x.toFixed(1)} ${s.base.toFixed(1)})`}>
      <rect x={s.x} y={top} width={s.w} height={h} fill={fill} />
      {shade && <rect x={s.x + s.w * 0.68} y={top} width={s.w * 0.32} height={h} fill={shade} />}
      {shade && <rect x={s.x + s.w * 0.18} y={top} width={Math.max(1, s.w * 0.08)} height={h} fill="#ffffff" opacity="0.35" />}
      {marks.map((y) => (
        <rect key={y} x={s.x - 0.5} y={y} width={s.w + 1} height={Math.max(1.2, s.w * 0.07)} fill={node} />
      ))}
    </g>
  );
}

export function BambooScene({ className, align = 'xMidYMid' }) {
  const id = useId();
  const u = (n) => `${id}-${n}`;
  return (
    <Svg className={className} align={align}>
      <defs>
        <Linear id={u('sky')} stops={[[0, '#082824'], [0.4, '#114a42'], [0.72, '#2a7563'], [1, '#7fae98']]} />
        <Radial id={u('glow')} cx={0.61} cy={0.28} r={0.42} stops={[[0, '#eef7ef', 0.95], [0.4, '#cfe6d8', 0.45], [1, '#cfe6d8', 0]]} />
        <Linear id={u('far')} stops={[[0, '#123f37', 0.85], [0.6, '#3f7b67', 0.8], [1, '#8db8a3', 0.75]]} />
        <Linear id={u('mid')} stops={[[0, '#0e3a32'], [0.55, '#4e8a73'], [1, '#c4dccf']]} />
        <Linear id={u('near')} stops={[[0, '#0b322b'], [0.35, '#3f7e69'], [0.75, '#c3dccf'], [1, '#f5f8f2']]} />
        <Linear id={u('nearShade')} stops={[[0, '#06241f', 0.7], [1, '#7f9f92', 0.35]]} />
        <Linear id={u('moss')} stops={[[0, '#55836a'], [0.4, '#3d6a52'], [1, '#2c5240']]} />
        <Linear id={u('mist')} stops={[[0, '#dcefe3', 0], [0.3, '#dcefe3', 0.6], [1, '#dcefe3', 0]]} />
        <Linear id={u('haze')} stops={[[0, '#dcefe3', 0], [0.5, '#dcefe3', 0.32], [1, '#dcefe3', 0]]} />
      </defs>

      {/* the canopy above and the light at the end of the path */}
      <Layer d={0}>
        <rect width="1600" height="1000" fill={`url(#${u('sky')})`} />
        <rect width="1600" height="1000" fill={`url(#${u('glow')})`} />
      </Layer>

      {/* far bamboo, lost in haze */}
      <Layer d={0.2}>
        {FAR.map((s, i) => (
          <Stalk key={i} s={s} fill={`url(#${u('far')})`} node="#0d342d" />
        ))}
        <rect y="200" width="1600" height="420" fill={`url(#${u('haze')})`} />
      </Layer>

      {/* the gate, the moss and the steps */}
      <Layer d={0.4}>
        <polygon points={`0,${GATE.y + 40} ${PATH.tl},${GATE.y} ${PATH.bl},1000 0,1000`} fill={`url(#${u('moss')})`} />
        <polygon points={`1600,${GATE.y + 40} ${PATH.tr},${GATE.y} ${PATH.br},1000 1600,1000`} fill={`url(#${u('moss')})`} />
        {STEPS.map((st, i) => {
          const riser = Math.max(1.5, (st.y1 - st.y0) * 0.42);
          // nearer steps darker, far ones fade into the haze; each stone a little different
          const tone = 0.2 + 0.8 * (1 - st.t) + (STONE[i] - 0.5) * 0.08;
          const tread = `rgb(${Math.round(150 + 64 * tone)}, ${Math.round(166 + 60 * tone)}, ${Math.round(159 + 58 * tone)})`;
          const face = `rgb(${Math.round(62 + 70 * tone)}, ${Math.round(82 + 66 * tone)}, ${Math.round(78 + 64 * tone)})`;
          const l0 = pathX('l', st.y0);
          const r0 = pathX('r', st.y0);
          const l1 = pathX('l', st.y1);
          const r1 = pathX('r', st.y1);
          const ym = st.y1 - riser;
          const lm = pathX('l', ym);
          const rm = pathX('r', ym);
          return (
            <g key={i}>
              <polygon points={`${l0},${st.y0} ${r0},${st.y0} ${rm},${ym} ${lm},${ym}`} fill={tread} />
              <polygon points={`${lm},${ym} ${rm},${ym} ${r1},${st.y1} ${l1},${st.y1}`} fill={face} />
              {/* snow lying on the front edge of each tread */}
              <polygon points={`${lm},${ym - riser * 0.35} ${rm},${ym - riser * 0.35} ${rm},${ym} ${lm},${ym}`} fill="#f4f8f4" opacity={0.35 + 0.4 * (1 - st.t)} />
            </g>
          );
        })}
        {/* mist where the moss meets the light, so the ridge has no hard edge */}
        <rect y={GATE.y - 60} width="1600" height="240" fill={`url(#${u('mist')})`} />
        {/* bamboo shadows fall across the steps from the left, in irregular bands */}
        <g fill="#0f2c27" opacity="0.2">
          <polygon points="560,905 1250,955 1262,985 540,935" />
          <polygon points="590,820 1220,850 1228,872 580,846" />
          <polygon points="700,700 1140,722 1146,736 694,716" />
          <polygon points="780,610 1090,622 1094,632 776,620" />
          <polygon points="850,520 1050,527 1052,533 848,526" />
        </g>
        <g fill="#e9f0e7" opacity="0.85">
          {PATH_LEAVES.map((l, i) => (
            <ellipse key={i} cx={l.x} cy={l.y} rx={l.s} ry={l.s * 0.32} transform={`rotate(${l.rot.toFixed(0)} ${l.x.toFixed(0)} ${l.y.toFixed(0)})`} />
          ))}
        </g>
        {/* the gate */}
        <g>
          <rect x={GATE.x - 46} y={GATE.y - 76} width="92" height="76" fill="#eef6ee" opacity="0.5" />
          <rect x={GATE.x - 34} y={GATE.y - 70} width="8" height="70" fill="#f4f3ec" />
          <rect x={GATE.x + 26} y={GATE.y - 70} width="8" height="70" fill="#f4f3ec" />
          <rect x={GATE.x - 30} y={GATE.y - 70} width="3" height="70" fill="#cfdad3" />
          <rect x={GATE.x + 30} y={GATE.y - 70} width="3" height="70" fill="#cfdad3" />
          <rect x={GATE.x - 44} y={GATE.y - 58} width="88" height="6" fill="#f4f3ec" />
          <path d={`M${GATE.x - 56} ${GATE.y - 76} Q ${GATE.x} ${GATE.y - 70} ${GATE.x + 56} ${GATE.y - 76} L ${GATE.x + 52} ${GATE.y - 68} Q ${GATE.x} ${GATE.y - 64} ${GATE.x - 52} ${GATE.y - 68} Z`} fill="#f7f6ef" />
          <rect x={GATE.x - 4} y={GATE.y - 66} width="8" height="9" fill="#dfe8e1" />
        </g>
      </Layer>

      {/* middle bamboo and the leaves on the moss */}
      <Layer d={0.55}>
        <g>
          {LEAVES.map((l, i) => (
            <ellipse key={i} cx={l.x} cy={l.y} rx={l.s} ry={l.s * 0.3} fill={l.c} transform={`rotate(${l.rot.toFixed(0)} ${l.x.toFixed(0)} ${l.y.toFixed(0)})`} />
          ))}
        </g>
        <g fill="#eef4ef" opacity="0.55">
          <ellipse cx="300" cy="760" rx="160" ry="16" />
          <ellipse cx="1420" cy="720" rx="140" ry="12" />
          <ellipse cx="640" cy="560" rx="60" ry="5" />
          <ellipse cx="1180" cy="600" rx="80" ry="7" />
        </g>
        <g fill="#566561">
          <ellipse cx="470" cy="930" rx="70" ry="34" />
          <ellipse cx="1340" cy="960" rx="56" ry="26" />
        </g>
        <g fill="#8fa29c">
          <ellipse cx="458" cy="918" rx="44" ry="14" />
          <ellipse cx="1332" cy="950" rx="34" ry="10" />
        </g>
        {MID.map((s, i) => (
          <Stalk key={i} s={s} fill={`url(#${u('mid')})`} node="#123c33" />
        ))}
      </Layer>

      {/* near bamboo, broad and pale at the root */}
      <Layer d={0.9}>
        {NEAR.map((s, i) => (
          <Stalk key={i} s={s} fill={`url(#${u('near')})`} node="#24483e" shade={`url(#${u('nearShade')})`} />
        ))}
        <g fill="#f7faf6" opacity="0.8">
          {FLAKES.map((f, i) => (
            <circle key={i} cx={f.x} cy={f.y} r={f.s} />
          ))}
        </g>
      </Layer>
    </Svg>
  );
}

// the skills section's season
export const WinterScene = BambooScene;
