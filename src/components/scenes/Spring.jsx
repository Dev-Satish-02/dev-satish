import { useId } from 'react';
import { Branches, Canopy, INK, Streaks, Svg, canopy, growTree, rng } from './common';

/* ── SPRING · Scene 001: the riverside in the morning ──
   A crimson sun over the far bank, its reflection broken into bars on the water,
   a railing along the near walkway and one old cherry tree leaning over it all. */

const SKY_BAND = '#f7cdd4';

const r = rng(11);
const FAR_BLOCKS = [];
for (let x = -20; x < 1620; ) {
  const w = 40 + r() * 90;
  const h = 26 + r() * 90;
  FAR_BLOCKS.push({ x, w, h });
  x += w + 4 + r() * 10;
}
const FAR_TREES = Array.from({ length: 26 }, (_, i) => ({ x: 20 + i * 62 + r() * 20, r: 18 + r() * 12 }));

// A cherry tree spreads wide like an umbrella: a short trunk, then four big limbs fanning out.
const TRUNK = { x: 1470, y: 872, topX: 1440, topY: 620 };
const LIMBS = [
  { angle: -2.75, length: 170, seed: 7 },
  { angle: -2.25, length: 175, seed: 8 },
  { angle: -1.65, length: 150, seed: 9 },
  { angle: -1.05, length: 150, seed: 10 },
].map((l) => growTree({ x: TRUNK.topX, y: TRUNK.topY, length: l.length, angle: l.angle, width: 20, depth: 4, seed: l.seed, spread: 0.42 }));
const TREE = {
  strokes: [{ d: `M${TRUNK.x} ${TRUNK.y} Q${TRUNK.x + 18} ${(TRUNK.y + TRUNK.topY) / 2} ${TRUNK.topX} ${TRUNK.topY}`, w: 36 }, ...LIMBS.flatMap((l) => l.strokes)],
  tips: LIMBS.flatMap((l) => l.tips),
};
const BLOSSOM = canopy(TREE.tips, { seed: 3, radius: 30, count: 3, jitter: 30 });

const REFLECTION = Array.from({ length: 9 }, (_, i) => ({
  y: 724 + i * 11,
  w: 330 - i * 30 + (r() - 0.5) * 40,
  dx: (r() - 0.5) * 30,
}));
const GLINTS = Array.from({ length: 22 }, () => ({ x: r() * 1600, y: 718 + r() * 96, w: 20 + r() * 90 }));
const PETALS = Array.from({ length: 40 }, () => ({ x: r() * 1600, y: 868 + r() * 120, rot: r() * 180 }));
const POSTS = Array.from({ length: 24 }, (_, i) => i * 70 + 10);

export function SpringScene({ className, align = 'xMaxYMid' }) {
  const id = useId();
  const sky = `${id}-sky`;
  const river = `${id}-river`;
  const sunClip = `${id}-sun`;
  return (
    <Svg className={className} align={align}>
      <defs>
        <linearGradient id={sky} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fdeceb" />
          <stop offset="0.5" stopColor="#f8d3d8" />
          <stop offset="0.72" stopColor="#f3bcc7" />
        </linearGradient>
        <linearGradient id={river} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f3bfc9" />
          <stop offset="1" stopColor="#e9a3b3" />
        </linearGradient>
        <clipPath id={sunClip}>
          <circle cx="1120" cy="430" r="215" />
        </clipPath>
      </defs>

      <rect width="1600" height="1000" fill={`url(#${sky})`} />

      {/* sun, banded where it sinks behind the haze */}
      <circle cx="1120" cy="430" r="215" fill="#d6213f" />
      <g clipPath={`url(#${sunClip})`} fill={SKY_BAND}>
        {[
          [548, 7],
          [578, 9],
          [606, 12],
          [632, 15],
        ].map(([y, h]) => (
          <rect key={y} x="880" y={y} width="480" height={h} />
        ))}
      </g>
      <Streaks
        fill="#fdf0f1"
        opacity={0.9}
        items={[
          [-40, 210, 520, 12],
          [120, 246, 300, 9],
          [760, 300, 700, 13],
          [980, 336, 420, 9],
          [1240, 268, 420, 10],
        ]}
      />

      {/* far bank: a low town and a row of cherry trees */}
      <g fill="#eaa4b4">
        {FAR_BLOCKS.map((b, i) => (
          <rect key={i} x={b.x} y={672 - b.h} width={b.w} height={b.h + 10} />
        ))}
        <rect x="318" y="520" width="6" height="162" />
        <path d="M321 520 L300 682 M321 520 L342 682 M306 600 L336 600 M310 640 L332 640" stroke="#eaa4b4" strokeWidth="3" />
      </g>
      <g fill="#f0b3c1">
        {FAR_TREES.map((t, i) => (
          <circle key={i} cx={t.x} cy={680} r={t.r} />
        ))}
      </g>
      <rect x="0" y="682" width="1600" height="30" fill="#e48fa3" />

      {/* river and the sun broken on it */}
      <rect x="0" y="712" width="1600" height="120" fill={`url(#${river})`} />
      <g fill="#d6213f" opacity="0.78">
        {REFLECTION.map((b) => (
          <rect key={b.y} x={1120 - b.w / 2 + b.dx} y={b.y} width={Math.max(30, b.w)} height="5" rx="2.5" />
        ))}
      </g>
      <g fill="#fff4f5" opacity="0.7">
        {GLINTS.map((g, i) => (
          <rect key={i} x={g.x} y={g.y} width={g.w} height="2" rx="1" />
        ))}
      </g>

      {/* near walkway, railing, lamp and a parked bicycle */}
      <rect x="0" y="832" width="1600" height="10" fill="#c76c84" />
      <g stroke={INK} strokeWidth="5">
        <line x1="0" y1="792" x2="1600" y2="792" />
        <line x1="0" y1="826" x2="1600" y2="826" strokeWidth="3" />
        {POSTS.map((x) => (
          <line key={x} x1={x} y1="790" x2={x} y2="860" />
        ))}
      </g>
      <rect x="0" y="858" width="1600" height="142" fill={INK} />

      <g fill={INK}>
        <rect x="726" y="470" width="12" height="392" />
        <path d="M732 476 Q 732 440 776 440 L 812 440 L 812 452 L 776 452 Q 744 452 744 476 Z" />
        <rect x="796" y="452" width="40" height="14" />
      </g>
      <rect x="800" y="466" width="32" height="5" fill="#fdeceb" />

      <g stroke={INK} strokeWidth="5" fill="none" strokeLinecap="round">
        <circle cx="480" cy="822" r="34" />
        <circle cx="586" cy="822" r="34" />
        <path d="M480 822 L520 772 L572 772 L586 822 M520 772 L540 822 L572 772 M480 822 L540 822 M516 760 L532 760 M572 772 L566 752 L584 748" />
      </g>

      {/* the cherry tree */}
      <Branches strokes={TREE.strokes} color={INK} />
      <Canopy dots={BLOSSOM} shadow="#e48ba1" mid="#f6bcc9" light="#fde6eb" extra="#ffffff" />

      {/* fallen petals on the walkway */}
      <g fill="#f6bcc9">
        {PETALS.map((p, i) => (
          <ellipse key={i} cx={p.x} cy={p.y} rx="6" ry="3" transform={`rotate(${p.rot.toFixed(0)} ${p.x.toFixed(0)} ${p.y.toFixed(0)})`} />
        ))}
      </g>
    </Svg>
  );
}
