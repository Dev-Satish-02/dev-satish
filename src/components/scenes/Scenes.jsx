import { useId } from 'react';

// Original backgrounds in the series' visual vocabulary: flat colour fields, a lone sun,
// empty staircases, power lines, a railway crossing, a dusk classroom, a snowed-in shrine.
// Each is a full-bleed SVG; `align` picks which side survives cropping on narrow screens.

const INK = '#1b1115';

function Svg({ align = 'xMidYMid', className, children }) {
  return (
    <svg
      className={className}
      viewBox="0 0 1600 1000"
      preserveAspectRatio={`${align} slice`}
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

function steps(x0, y0, x1, y1, n) {
  const dx = (x1 - x0) / n;
  const dy = (y1 - y0) / n;
  let d = `M${x0} 1000 V${y0}`;
  for (let i = 0; i < n; i += 1) {
    d += ` H${x0 + dx * (i + 1)} V${y0 + dy * (i + 1)}`;
  }
  return `${d} V1000 Z`;
}

/* ── SPRING: pink sky, crimson sun, a staircase climbing into it, cherry branches ── */
export function SpringScene({ className, align = 'xMaxYMid' }) {
  const id = useId();
  const sky = `${id}-sky`;
  return (
    <Svg className={className} align={align}>
      <defs>
        <linearGradient id={sky} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f8dadd" />
          <stop offset="0.65" stopColor="#f4bcc6" />
          <stop offset="1" stopColor="#ec9cac" />
        </linearGradient>
      </defs>
      <rect width="1600" height="1000" fill={`url(#${sky})`} />
      <circle cx="1120" cy="420" r="260" fill="#d21f3c" />
      {/* banded lower edge of the sun, like a woodblock print */}
      {[
        [560, 8],
        [600, 11],
        [636, 14],
        [668, 18],
      ].map(([y, h]) => (
        <rect key={y} x="800" y={y} width="640" height={h} fill="#f2b3bf" />
      ))}
      {/* distant blocks */}
      <g fill="#e48ea0" opacity="0.75">
        <rect x="0" y="780" width="120" height="220" />
        <rect x="130" y="730" width="80" height="270" />
        <rect x="220" y="800" width="150" height="200" />
        <rect x="380" y="760" width="60" height="240" />
        <rect x="450" y="820" width="140" height="180" />
        <rect x="600" y="770" width="90" height="230" />
      </g>
      {/* the staircase */}
      <path d={steps(640, 940, 1600, 560, 14)} fill={INK} />
      <g stroke={INK} strokeWidth="5" fill="none">
        <line x1="630" y1="860" x2="1600" y2="476" />
        {[700, 860, 1020, 1180, 1340, 1500].map((x) => {
          const y = 940 - ((x - 640) / 960) * 380;
          return <line key={x} x1={x} y1={y - 4} x2={x} y2={y - 80} />;
        })}
      </g>
      {/* lamp post at the top */}
      <g fill={INK}>
        <rect x="1452" y="250" width="10" height="340" />
        <rect x="1400" y="246" width="70" height="8" />
        <rect x="1394" y="254" width="30" height="16" />
      </g>
      {/* cherry branch, reaching in from the top right across the sun */}
      <g transform="translate(1600 0) scale(-1 1)">
      <g stroke={INK} strokeLinecap="round" fill="none">
        <path d="M-20 90 C 120 110, 220 160, 330 150 S 520 120, 610 170" strokeWidth="16" />
        <path d="M200 140 C 240 210, 300 240, 380 250" strokeWidth="9" />
        <path d="M420 140 C 460 90, 520 70, 580 60" strokeWidth="7" />
        <path d="M80 100 C 90 170, 70 230, 110 290" strokeWidth="7" />
      </g>
      <g>
        {[
          [330, 150, 34],
          [380, 250, 28],
          [610, 170, 30],
          [580, 60, 26],
          [110, 290, 26],
          [250, 190, 22],
          [480, 120, 24],
          [160, 120, 20],
          [530, 200, 18],
          [20, 80, 24],
        ].map(([x, y, r]) => (
          <g key={`${x}-${y}`}>
            <circle cx={x} cy={y} r={r} fill="#f7c5cf" />
            <circle cx={x - r * 0.45} cy={y + r * 0.3} r={r * 0.62} fill="#fbe2e7" />
            <circle cx={x + r * 0.35} cy={y - r * 0.35} r={r * 0.45} fill="#ea93a7" />
          </g>
        ))}
      </g>
      </g>
    </Svg>
  );
}

function Pole({ x, top, base = 1000, color }) {
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

/* ── SUMMER: cobalt sky, cumulus, power lines and a railway crossing ── */
export function SummerScene({ className, align = 'xMidYMid' }) {
  const id = useId();
  const sky = `${id}-sky`;
  const stripe = `${id}-stripe`;
  const navy = '#0b1a3a';
  return (
    <Svg className={className} align={align}>
      <defs>
        <linearGradient id={sky} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0f47c2" />
          <stop offset="0.55" stopColor="#3f97ea" />
          <stop offset="1" stopColor="#a6dbf8" />
        </linearGradient>
        <pattern id={stripe} width="60" height="20" patternUnits="userSpaceOnUse">
          <rect width="30" height="20" fill="#f5c400" />
          <rect x="30" width="30" height="20" fill={navy} />
        </pattern>
      </defs>
      <rect width="1600" height="1000" fill={`url(#${sky})`} />
      {/* cumulus */}
      <g fill="#ffffff">
        {[
          [200, 780, 150],
          [360, 700, 190],
          [560, 760, 150],
          [80, 860, 120],
          [1240, 640, 120],
          [1380, 600, 160],
          [1530, 680, 140],
        ].map(([x, y, r]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r={r} />
        ))}
      </g>
      <g fill="#dceefb">
        <rect x="0" y="860" width="700" height="140" />
        <rect x="1150" y="720" width="450" height="280" />
      </g>
      {/* wires */}
      <g stroke={navy} strokeWidth="3" fill="none">
        <path d="M-20 140 Q 180 230 300 136" />
        <path d="M300 136 Q 640 260 960 166" />
        <path d="M300 152 Q 640 300 960 182" />
        <path d="M960 166 Q 1300 280 1620 190" />
        <path d="M960 182 Q 1300 320 1620 210" />
        <path d="M-20 60 Q 800 240 1620 80" strokeWidth="2" />
      </g>
      <Pole x={300} top={120} color={navy} />
      <Pole x={960} top={150} color={navy} />
      {/* road */}
      <rect x="0" y="930" width="1600" height="70" fill={navy} />
      <rect x="0" y="960" width="1600" height="6" fill="#f5c400" opacity="0.8" />
      {/* traffic mirror */}
      <g>
        <rect x="644" y="560" width="10" height="380" fill="#e8742a" />
        <circle cx="649" cy="540" r="52" fill="#e8742a" />
        <circle cx="649" cy="540" r="40" fill="#bfe3f8" />
        <path d="M620 528 Q 649 500 680 530" stroke="#ffffff" strokeWidth="6" fill="none" opacity="0.8" />
      </g>
      {/* railway crossing */}
      <g>
        <rect x="1346" y="420" width="16" height="520" fill={`url(#${stripe})`} />
        <g transform="translate(1354 400)">
          <rect x="-110" y="-14" width="220" height="28" fill="#f5c400" stroke={navy} strokeWidth="6" transform="rotate(28)" />
          <rect x="-110" y="-14" width="220" height="28" fill="#f5c400" stroke={navy} strokeWidth="6" transform="rotate(-28)" />
        </g>
        <rect x="1270" y="500" width="168" height="20" fill={navy} />
        <circle cx="1294" cy="560" r="40" fill={navy} />
        <circle cx="1414" cy="560" r="40" fill={navy} />
        <circle className="xing-light xing-a" cx="1294" cy="560" r="28" fill="#ff2b3f" />
        <circle className="xing-light xing-b" cx="1414" cy="560" r="28" fill="#ff2b3f" />
        <rect x="900" y="742" width="460" height="22" fill={`url(#${stripe})`} />
        <rect x="1330" y="732" width="40" height="42" fill={navy} />
      </g>
    </Svg>
  );
}

/* ── AUTUMN: a classroom at dusk, a wall of windows, a clock that has stopped ── */
export function AutumnScene({ className, align = 'xMidYMid' }) {
  const id = useId();
  const sky = `${id}-sky`;
  const frame = '#24090a';
  return (
    <Svg className={className} align={align}>
      <defs>
        <linearGradient id={sky} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f7a440" />
          <stop offset="0.6" stopColor="#e85a26" />
          <stop offset="1" stopColor="#a8261a" />
        </linearGradient>
      </defs>
      <rect width="1600" height="1000" fill="#3c130b" />
      <rect x="90" y="110" width="1420" height="540" fill={`url(#${sky})`} />
      <circle cx="1180" cy="560" r="100" fill="#ffe08a" />
      <g fill="#7f1e12">
        <rect x="90" y="560" width="200" height="90" />
        <rect x="300" y="520" width="120" height="130" />
        <rect x="430" y="580" width="260" height="70" />
        <rect x="700" y="540" width="110" height="110" />
        <rect x="1320" y="530" width="190" height="120" />
      </g>
      {/* window frames */}
      <g fill={frame}>
        <rect x="80" y="100" width="1440" height="18" />
        <rect x="80" y="372" width="1440" height="14" />
        <rect x="80" y="640" width="1440" height="22" />
        {[80, 435, 790, 1145, 1500].map((x) => (
          <rect key={x} x={x} y="100" width="20" height="560" />
        ))}
        {[257, 612, 967, 1322].map((x) => (
          <rect key={x} x={x} y="118" width="8" height="522" />
        ))}
      </g>
      {/* the clock */}
      <g>
        <circle cx="800" cy="56" r="34" fill="#f3e6cf" stroke={frame} strokeWidth="6" />
        <line x1="800" y1="56" x2="800" y2="34" stroke={frame} strokeWidth="5" />
        <line x1="800" y1="56" x2="818" y2="66" stroke={frame} strokeWidth="4" />
      </g>
      {/* floor and the light thrown across it */}
      <rect x="0" y="662" width="1600" height="338" fill="#4d1a0c" />
      <g fill="#f08a3a" opacity="0.55">
        <polygon points="120,662 440,662 300,1000 -60,1000" />
        <polygon points="470,662 790,662 650,1000 290,1000" />
        <polygon points="825,662 1145,662 1005,1000 645,1000" />
        <polygon points="1180,662 1500,662 1360,1000 1000,1000" />
      </g>
      {/* desks */}
      <g fill="#1b0704">
        {[160, 400, 640, 880, 1120, 1360].map((x) => (
          <g key={`a${x}`}>
            <rect x={x} y="760" width="120" height="14" />
            <rect x={x + 8} y="774" width="8" height="60" />
            <rect x={x + 104} y="774" width="8" height="60" />
          </g>
        ))}
        {[40, 360, 680, 1000, 1320].map((x) => (
          <g key={`b${x}`}>
            <rect x={x} y="880" width="190" height="20" />
            <rect x={x + 12} y="900" width="12" height="100" />
            <rect x={x + 166} y="900" width="12" height="100" />
          </g>
        ))}
      </g>
    </Svg>
  );
}

/* ── WINTER: a night shrine in snow, stone steps up to a red gate, lanterns ── */
export function WinterScene({ className, align = 'xMidYMid' }) {
  const id = useId();
  const sky = `${id}-sky`;
  const glow = `${id}-glow`;
  return (
    <Svg className={className} align={align}>
      <defs>
        <linearGradient id={sky} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#060b1f" />
          <stop offset="0.6" stopColor="#14214b" />
          <stop offset="1" stopColor="#2b3c72" />
        </linearGradient>
        <radialGradient id={glow}>
          <stop offset="0" stopColor="#ffd27a" stopOpacity="0.9" />
          <stop offset="1" stopColor="#ffd27a" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="1600" height="1000" fill={`url(#${sky})`} />
      <g fill="#ffffff">
        {[
          [120, 80], [260, 150], [420, 60], [560, 190], [700, 90], [940, 70], [1060, 170],
          [1210, 60], [1350, 140], [1500, 90], [1560, 220], [80, 240], [880, 210],
        ].map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="2.2" opacity="0.8" />
        ))}
      </g>
      <circle cx="1300" cy="200" r="70" fill="#f1ede2" />
      <path d="M0 620 L260 420 L520 600 L760 400 L1040 610 L1300 430 L1600 620 V1000 H0 Z" fill="#101a3d" />
      {/* cedars */}
      <g fill="#0a1230">
        {[60, 170, 280, 1330, 1440, 1550].map((x, i) => (
          <polygon key={x} points={`${x},${330 + (i % 3) * 30} ${x - 70},820 ${x + 70},820`} />
        ))}
      </g>
      {/* steps up to the gate */}
      <polygon points="430,1000 1170,1000 860,500 740,500" fill="#1c2a5a" />
      <g stroke="#e9eef9" opacity="0.75">
        {Array.from({ length: 13 }, (_, i) => {
          const t = i / 12;
          const y = 1000 - (500 * (1 - Math.pow(1 - t, 1.6)));
          const half = 370 - 310 * t;
          return <line key={i} x1={800 - half} y1={y} x2={800 + half} y2={y} strokeWidth={4 - t * 3} />;
        })}
      </g>
      {/* gate */}
      <g fill="#c8102e">
        <rect x="712" y="390" width="18" height="120" />
        <rect x="870" y="390" width="18" height="120" />
        <rect x="690" y="410" width="220" height="12" />
        <path d="M660 372 Q 800 392 940 372 L 936 390 Q 800 404 664 390 Z" fill="#0b0f1f" />
        <rect x="676" y="388" width="248" height="10" />
      </g>
      {/* lanterns */}
      {[
        [520, 760, 1],
        [1080, 760, 1],
        [640, 600, 0.6],
        [960, 600, 0.6],
      ].map(([x, y, s]) => (
        <g key={`${x}-${y}`} transform={`translate(${x} ${y}) scale(${s})`}>
          <circle cx="0" cy="-40" r="90" fill={`url(#${glow})`} />
          <rect x="-26" y="-80" width="52" height="10" fill="#0b0f1f" />
          <rect x="-18" y="-70" width="36" height="36" fill="#ffcf7a" />
          <rect x="-30" y="-34" width="60" height="10" fill="#0b0f1f" />
          <rect x="-10" y="-24" width="20" height="70" fill="#0b0f1f" />
          <rect x="-26" y="46" width="52" height="12" fill="#0b0f1f" />
        </g>
      ))}
      {/* snow banks */}
      <path d="M0 880 Q 200 840 420 900 L 430 1000 H0 Z" fill="#dfe6f5" />
      <path d="M1170 1000 L1180 900 Q 1400 840 1600 880 V1000 Z" fill="#dfe6f5" />
    </Svg>
  );
}

export const SCENE_BY_SEASON = {
  spring: SpringScene,
  summer: SummerScene,
  autumn: AutumnScene,
  winter: WinterScene,
};
