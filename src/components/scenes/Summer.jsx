import { useId } from 'react';
import { Pole, Svg } from './common';

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
