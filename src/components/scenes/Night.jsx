import { useId } from 'react';
import { Streaks, Svg, rng } from './common';

/* ── NIGHT · Interlude: the old cram school ──
   An abandoned four-storey building behind a chain-link fence. Most windows are
   broken or boarded; one on the third floor is still lit, where someone is writing. */

const WALL = '#2b303d';
const DARK = '#0a0c13';
const IRON = '#11131b';
const PLANK = '#5b4a36';

const r = rng(57);
const ROWS = [250, 400, 550, 700];
const COLS = [680, 788, 896, 1004, 1112, 1220];
const LIT = { row: 1, col: 3 };
const WINDOWS = ROWS.flatMap((y, ri) =>
  COLS.map((x, ci) => {
    if (ri === LIT.row && ci === LIT.col) return { x, y, kind: 'lit' };
    const n = r();
    return { x, y, kind: n < 0.35 ? 'broken' : n < 0.6 ? 'boarded' : 'dark', a: (r() - 0.5) * 20 };
  })
);
const TOWN = [];
for (let x = 0; x < 1600; ) {
  const w = 50 + r() * 110;
  TOWN.push({ x, w, h: 50 + r() * 120, lit: Array.from({ length: 3 }, () => r() < 0.25) });
  x += w + 6;
}
const STAINS = Array.from({ length: 18 }, () => ({ x: 650 + r() * 680, y: 230 + r() * 560, h: 40 + r() * 120 }));
const WEEDS = Array.from({ length: 120 }, (_, i) => ({ x: i * 13.5 + r() * 8, h: 14 + r() * 40, lean: (r() - 0.5) * 16 }));
const IVY = Array.from({ length: 34 }, () => ({ x: 640 + r() * 120, y: 520 + r() * 340, r: 10 + r() * 18 }));

function Window({ w }) {
  if (w.kind === 'lit') {
    return (
      <g>
        <rect x={w.x} y={w.y} width="84" height="100" fill="#f6d77a" />
        {Array.from({ length: 9 }, (_, i) => (
          <rect key={i} x={w.x} y={w.y + 6 + i * 10.5} width="84" height="3" fill="#d1ac52" />
        ))}
        <rect x={w.x + 40} y={w.y} width="4" height="100" fill={WALL} />
      </g>
    );
  }
  return (
    <g>
      <rect x={w.x} y={w.y} width="84" height="100" fill={DARK} />
      {w.kind === 'broken' && (
        <g fill="#3a4258">
          <polygon points={`${w.x},${w.y} ${w.x + 34},${w.y} ${w.x + 10},${w.y + 30}`} />
          <polygon points={`${w.x + 84},${w.y + 100} ${w.x + 50},${w.y + 100} ${w.x + 84},${w.y + 58}`} />
          <polygon points={`${w.x + 84},${w.y} ${w.x + 70},${w.y} ${w.x + 84},${w.y + 22}`} />
        </g>
      )}
      {w.kind === 'boarded' && (
        <g fill={PLANK}>
          <rect x={w.x - 6} y={w.y + 30} width="96" height="14" transform={`rotate(${w.a.toFixed(1)} ${w.x + 42} ${w.y + 37})`} />
          <rect x={w.x - 6} y={w.y + 64} width="96" height="14" transform={`rotate(${(-w.a).toFixed(1)} ${w.x + 42} ${w.y + 71})`} />
        </g>
      )}
      <rect x={w.x + 40} y={w.y} width="4" height="100" fill={WALL} />
    </g>
  );
}

export function NightScene({ className, align = 'xMidYMid' }) {
  const id = useId();
  const sky = `${id}-sky`;
  const cone = `${id}-cone`;
  const mesh = `${id}-mesh`;
  const moonCut = `${id}-moon`;
  return (
    <Svg className={className} align={align}>
      <defs>
        <linearGradient id={sky} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#070912" />
          <stop offset="0.7" stopColor="#141b2e" />
          <stop offset="1" stopColor="#20283f" />
        </linearGradient>
        <linearGradient id={cone} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f6d77a" stopOpacity="0.5" />
          <stop offset="1" stopColor="#f6d77a" stopOpacity="0" />
        </linearGradient>
        <pattern id={mesh} width="22" height="22" patternUnits="userSpaceOnUse">
          <path d="M0 0 L22 22 M22 0 L0 22" stroke="#59607a" strokeWidth="1.4" />
        </pattern>
        <mask id={moonCut}>
          <rect width="1600" height="1000" fill="#fff" />
          <circle cx="1482" cy="126" r="46" fill="#000" />
        </mask>
      </defs>

      <rect width="1600" height="1000" fill={`url(#${sky})`} />
      <circle cx="1460" cy="140" r="50" fill="#ece6d4" mask={`url(#${moonCut})`} />
      <Streaks fill="#1e2640" items={[[1240, 158, 420, 16], [1320, 194, 300, 10], [300, 110, 520, 14], [420, 146, 300, 9]]} />

      {/* the town behind */}
      <g fill="#161c2e">
        {TOWN.map((b, i) => (
          <rect key={i} x={b.x} y={780 - b.h} width={b.w} height={b.h + 20} />
        ))}
      </g>
      <g fill="#f3c969">
        {TOWN.flatMap((b, i) =>
          b.lit.map((on, j) => (on ? <rect key={`${i}-${j}`} x={b.x + 10 + j * 16} y={800 - b.h + 18} width="8" height="10" /> : null))
        )}
      </g>

      {/* the building, its broken corner and an empty signboard on the roof */}
      <g>
        <path d="M640 200 H1260 L1290 226 L1312 206 L1340 230 V860 H640 Z" fill={WALL} />
        <g stroke="#4d5468" strokeWidth="3">
          <line x1="1272" y1="214" x2="1262" y2="180" />
          <line x1="1296" y1="214" x2="1302" y2="176" />
          <line x1="1318" y1="214" x2="1330" y2="186" />
        </g>
        {[370, 520, 670].map((y) => (
          <rect key={y} x="640" y={y} width="700" height="12" fill="#232733" />
        ))}
        <g fill="#1d212b" opacity="0.8">
          {STAINS.map((s, i) => (
            <rect key={i} x={s.x} y={s.y} width="6" height={s.h} />
          ))}
        </g>
        <g stroke="#3d2c25" strokeWidth="5" fill="none">
          <rect x="760" y="120" width="360" height="74" />
          <line x1="790" y1="194" x2="790" y2="200" />
          <line x1="1090" y1="194" x2="1090" y2="200" />
          <line x1="760" y1="157" x2="1120" y2="157" strokeWidth="3" />
        </g>
        {WINDOWS.map((w, i) => (
          <Window key={i} w={w} />
        ))}
        <rect x="900" y="780" width="96" height="80" fill={DARK} />
        <g fill="#1c2b23">
          {IVY.map((v, i) => (
            <circle key={i} cx={v.x} cy={v.y} r={v.r} />
          ))}
        </g>
      </g>

      {/* fire escape */}
      <g stroke={IRON} strokeWidth="5" fill="none">
        {[360, 510, 660].map((y, i) => (
          <g key={y}>
            <line x1="1340" y1={y} x2="1440" y2={y} strokeWidth="8" />
            <line x1="1440" y1={y} x2="1440" y2={y - 40} />
            <line x1="1340" y1={y - 40} x2="1440" y2={y - 40} strokeWidth="3" />
            <line x1={i % 2 ? 1350 : 1430} y1={y} x2={i % 2 ? 1430 : 1350} y2={y + 150} />
          </g>
        ))}
      </g>

      {/* street lamp */}
      <polygon points="248,312 312,312 470,900 90,900" fill={`url(#${cone})`} />
      <rect x="276" y="300" width="10" height="600" fill={IRON} />
      <rect x="240" y="290" width="84" height="16" fill={IRON} />
      <rect x="252" y="306" width="60" height="6" fill="#f6d77a" />

      {/* the fence, its warning sign, and the weeds */}
      <rect x="0" y="740" width="1600" height="160" fill={`url(#${mesh})`} />
      <g fill="#3b4152">
        {Array.from({ length: 11 }, (_, i) => i * 160).map((x) => (
          <rect key={x} x={x} y="728" width="8" height="172" />
        ))}
        <rect x="0" y="736" width="1600" height="5" />
      </g>
      <g>
        <rect x="484" y="800" width="92" height="56" fill="#f5c400" />
        <rect x="484" y="842" width="92" height="14" fill={IRON} />
        <rect x="494" y="810" width="72" height="22" fill={IRON} />
      </g>
      <rect x="0" y="900" width="1600" height="100" fill="#090b11" />
      <g stroke="#0e140f" strokeWidth="3" strokeLinecap="round">
        {WEEDS.map((g, i) => (
          <line key={i} x1={g.x} y1="904" x2={g.x + g.lean} y2={904 - g.h} />
        ))}
      </g>
      <ellipse cx="280" cy="930" rx="200" ry="20" fill="#f6d77a" opacity="0.18" />
      <rect x="272" y="910" width="16" height="90" fill="#f6d77a" opacity="0.12" />
    </Svg>
  );
}
