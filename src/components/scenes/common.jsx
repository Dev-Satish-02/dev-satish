// Shared drawing kit for the season scenes: every scene is the same town, drawn flat and
// side-on like the summer crossing, at 1600×1000.

export const W = 1600;
export const H = 1000;
export const INK = '#1b1115';

export function Svg({ align = 'xMidYMid', className, children }) {
  return (
    <svg
      className={className}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio={`${align} slice`}
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

// Seeded random numbers, so the scenery is identical on every load.
export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function Pole({ x, top, base = 1000, color }) {
  return (
    <g fill={color}>
      <rect x={x - 7} y={top} width="14" height={base - top} />
      <rect x={x - 60} y={top + 30} width="120" height="9" />
      <rect x={x - 42} y={top + 78} width="84" height="7" />
      {[-52, -18, 18, 52].map((dx) => (
        <rect key={dx} x={x + dx - 4} y={top + 16} width="8" height="16" />
      ))}
      <rect x={x + 8} y={top + 150} width="30" height="44" />
    </g>
  );
}

// A sagging wire between two points.
export function Wire({ x1, y1, x2, y2, sag = 60, color, width = 3 }) {
  return (
    <path
      d={`M${x1} ${y1} Q ${(x1 + x2) / 2} ${(y1 + y2) / 2 + sag} ${x2} ${y2}`}
      stroke={color}
      strokeWidth={width}
      fill="none"
    />
  );
}

/* A branching tree: returns trunk/branch strokes and the tips where foliage goes. */
export function growTree({ x, y, length, angle = -Math.PI / 2, width, depth, seed, spread = 0.55, lean = 0 }) {
  const r = rng(seed);
  const strokes = [];
  const tips = [];
  function branch(bx, by, len, ang, w, d) {
    const ex = bx + Math.cos(ang) * len;
    const ey = by + Math.sin(ang) * len;
    // a slight bend makes the limbs read as wood, not wire
    const bend = (r() - 0.5) * len * 0.35;
    const cx = (bx + ex) / 2 + Math.cos(ang + Math.PI / 2) * bend;
    const cy = (by + ey) / 2 + Math.sin(ang + Math.PI / 2) * bend;
    strokes.push({ d: `M${bx.toFixed(1)} ${by.toFixed(1)} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}`, w });
    if (d === 0) {
      tips.push([ex, ey]);
      return;
    }
    const kids = r() < 0.35 ? 3 : 2;
    for (let i = 0; i < kids; i += 1) {
      const t = kids === 1 ? 0 : i / (kids - 1) - 0.5;
      const a = ang + t * spread * 2 + (r() - 0.5) * 0.35 + lean;
      branch(ex, ey, len * (0.68 + r() * 0.16), a, w * 0.66, d - 1);
    }
  }
  branch(x, y, length, angle, width, depth);
  return { strokes, tips };
}

export function Branches({ strokes, color }) {
  return (
    <g stroke={color} strokeLinecap="round" fill="none">
      {strokes.map((s, i) => (
        <path key={i} d={s.d} strokeWidth={s.w} />
      ))}
    </g>
  );
}

/* Foliage or blossom: overlapping discs in three tones, shadow below, light above. */
export function canopy(tips, { seed, radius = 34, count = 5, jitter = 40 }) {
  const r = rng(seed);
  const dots = [];
  tips.forEach(([tx, ty]) => {
    for (let i = 0; i < count; i += 1) {
      dots.push({
        x: tx + (r() - 0.5) * jitter * 2,
        y: ty + (r() - 0.5) * jitter * 1.4,
        r: radius * (0.55 + r() * 0.6),
      });
    }
  });
  return dots;
}

export function Canopy({ dots, shadow, mid, light, extra }) {
  return (
    <g>
      <g fill={shadow}>
        {dots.map((d, i) => (
          <circle key={i} cx={d.x + 4} cy={d.y + d.r * 0.32} r={d.r} />
        ))}
      </g>
      <g fill={mid}>
        {dots.map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r={d.r * 0.9} />
        ))}
      </g>
      <g fill={light}>
        {dots.map((d, i) => (
          <circle key={i} cx={d.x - d.r * 0.28} cy={d.y - d.r * 0.3} r={d.r * 0.48} />
        ))}
      </g>
      {extra && (
        <g fill={extra}>
          {dots
            .filter((_, i) => i % 7 === 0)
            .map((d, i) => (
              <circle key={i} cx={d.x + d.r * 0.3} cy={d.y - d.r * 0.1} r={d.r * 0.22} />
            ))}
        </g>
      )}
    </g>
  );
}

// Long, flat cloud streaks in the woodblock-print manner.
export function Streaks({ items, fill, opacity = 1 }) {
  return (
    <g fill={fill} opacity={opacity}>
      {items.map(([x, y, w, h = 14], i) => (
        <rect key={i} x={x} y={y} width={w} height={h} rx={h / 2} />
      ))}
    </g>
  );
}
