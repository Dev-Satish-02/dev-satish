import { useEffect, useId, useRef } from 'react';
import { Branches, Canopy, Cloud, Layer, Linear, Pylon, Radial, Svg, canopy, growTree, rng } from './common';
import { fullMotion } from '../../lib/store';

/* ── SUMMER · Experience: the crossing at midday ──
   Built in planes, far to near: a deep sky laced with overhead wires drawn as
   white line-art; hazy blocks on the horizon; an elevated viaduct the train runs
   along; trees and a ribbed warehouse; the road receding to the crossing; the
   signal in the foreground, rim-lit by a sun high on the right, its shadow and
   an off-screen building's shadow laid long across the asphalt. */

const clamp = (x) => Math.min(1, Math.max(0, x));
const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);

const HORIZON = 600;
const VP = { x: 1010, y: HORIZON };
const r = rng(5);

const CITY = [];
for (let x = -20; x < 1620; ) {
  const w = 40 + r() * 110;
  CITY.push({ x, w, h: 24 + r() * 74, lit: r() < 0.5 });
  x += w + 2;
}
const TREES = [
  { x: 180, h: 120, seed: 61 },
  { x: 330, h: 150, seed: 62 },
  { x: 470, h: 110, seed: 63 },
  { x: 860, h: 120, seed: 64 },
].map((t) => {
  const tree = growTree({ x: t.x, y: 640, length: t.h * 0.5, width: 10, depth: 4, seed: t.seed, spread: 0.6 });
  return { ...t, tree, leaves: canopy(tree.tips, { seed: t.seed + 9, radius: 20, count: 6, jitter: 30 }) };
});

/* A commuter car seen from the side at mid-distance: pale body, roof shade, a blue
   line, dark glazing with a reflection, bogies. `nose` rounds the leading end. */
function Car({ x, nose }) {
  const W = 290;
  return (
    <g transform={`translate(${x} 0)`}>
      <path
        d={nose ? `M0 446 H${W - 34} Q${W} 446 ${W + 6} 478 V502 H0 Z` : `M0 446 H${W} V502 H0 Z`}
        fill="url(#train-body)"
      />
      <rect x="0" y="446" width={nose ? W - 30 : W} height="7" fill="#8796ab" />
      <rect x="0" y="484" width={nose ? W + 4 : W} height="4" fill="#2456b0" />
      {[18, 62, 106, 150, 194, 238].map((wx) => (
        <g key={wx}>
          <rect x={wx} y="459" width="32" height="17" rx="2" fill="url(#train-glass)" />
          <line x1={wx + 3} y1="473" x2={wx + 14} y2="461" stroke="#c9dbf1" strokeWidth="1.2" opacity="0.7" />
        </g>
      ))}
      {nose && <path d={`M${W - 22} 459 H${W - 6} Q${W + 2} 466 ${W + 2} 476 H${W - 22} Z`} fill="url(#train-glass)" />}
      <rect x="40" y="502" width="56" height="7" fill="#1b2433" />
      <rect x={W - 96} y="502" width="56" height="7" fill="#1b2433" />
      {!nose && (
        <path d={`M120 446 L140 428 L160 446 M128 438 H152`} stroke="#3a4558" strokeWidth="1.6" fill="none" />
      )}
    </g>
  );
}

// `live`: tied to scroll, the crossing starts signalling as the section arrives and a
// train passes along the viaduct. `signalling`: lamps alternate regardless (the intro).
export function SummerScene({ className, align = 'xMidYMid', live = false, signalling = false }) {
  const id = useId();
  const root = useRef(null);
  const train = useRef(null);
  const u = (n) => `${id}-${n}`;

  useEffect(() => {
    if (!live || !fullMotion()) return undefined;
    const g = root.current;
    const section = g.closest('section');
    let goal = -1700;
    let x = -1700;
    let raf;
    const onScroll = () => {
      const rect = section.getBoundingClientRect();
      // 0 as the scene pins, 1 as it lets go (the seam after it picks up from a quiet crossing)
      const q = clamp(-rect.top / Math.max(1, rect.height - window.innerHeight));
      g.classList.toggle('is-signalling', q > 0.04 && q < 0.8);
      goal = -1700 + ease(clamp((q - 0.12) / 0.5)) * 3400;
    };
    const loop = () => {
      x += (goal - x) * 0.14;
      train.current.setAttribute('transform', `translate(${x.toFixed(1)} 0)`);
      raf = requestAnimationFrame(loop);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
    };
  }, [live]);

  return (
    <Svg className={className} align={align}>
      <g ref={root} className={signalling ? 'is-signalling' : undefined}>
        <defs>
          <Linear id={u('sky')} stops={[[0, '#0f47c2'], [0.45, '#2f7ddb'], [0.8, '#86c1ee'], [1, '#cfe6f6']]} />
          <Radial id={u('sun')} cx={0.92} cy={0.02} r={0.7} stops={[[0, '#fffbe8', 0.85], [0.35, '#fff1c9', 0.25], [1, '#fff1c9', 0]]} />
          <Linear id={u('ground')} stops={[[0, '#a9bccd'], [0.35, '#7c8fa4'], [1, '#41526a']]} />
          <Linear id={u('road')} stops={[[0, '#9aa9ba'], [1, '#2e3b4f']]} />
          <Linear id={u('deck')} stops={[[0, '#7f9cc2'], [1, '#5b7aa6']]} />
          <Linear id={u('haze')} stops={[[0, '#d6e8f6', 0], [1, '#d6e8f6', 0.85]]} />
          <Linear id={u('pole')} x2={1} y2={0} stops={[[0, '#16233b'], [0.7, '#22324f'], [1, '#c9dcf2']]} />
          <Linear id="train-body" stops={[[0, '#f2f5f9'], [0.6, '#dde5ee'], [1, '#aebdcf']]} />
          <Linear id="train-glass" stops={[[0, '#1d2b42'], [1, '#4d6688']]} />
          <Radial id={u('lamp')} stops={[[0, '#ff4a55', 0.75], [1, '#ff4a55', 0]]} />
          <pattern id={u('stripe')} width="44" height="16" patternUnits="userSpaceOnUse">
            <rect width="22" height="16" fill="#f3c316" />
            <rect x="22" width="22" height="16" fill="#18233a" />
          </pattern>
          <pattern id={u('ribs')} width="14" height="10" patternUnits="userSpaceOnUse">
            <rect width="14" height="10" fill="#9fb6d1" />
            <rect width="5" height="10" fill="#b9cce2" />
          </pattern>
        </defs>

        {/* sky, sun glow, clouds banked on the horizon */}
        <Layer d={0}>
          <rect width="1600" height="1000" fill={`url(#${u('sky')})`} />
          <rect width="1600" height="1000" fill={`url(#${u('sun')})`} />
        </Layer>
        <Layer d={0.08}>
          <Cloud x={260} y={520} s={1.3} base="#b9d2ea" mid="#d9e9f7" top="#ffffff" />
          <Cloud x={1280} y={505} s={1.6} base="#b4cde6" mid="#d6e7f6" top="#ffffff" />
          <Cloud x={760} y={548} s={0.8} base="#c2d8ec" mid="#ddebf7" top="#f7fbff" />
        </Layer>

        {/* overhead wires and pylons as line-art */}
        <Layer d={0.15}>
          <g stroke="#ffffff" fill="none" opacity="0.7">
            <path d="M-20 120 Q 800 210 1620 96" strokeWidth="1.6" />
            <path d="M-20 150 Q 800 250 1620 128" strokeWidth="1.3" />
            <path d="M-20 196 Q 800 300 1620 176" strokeWidth="1.1" />
            <path d="M-20 246 Q 820 330 1620 236" strokeWidth="0.9" />
            <path d="M520 168 L1010 600 M1180 168 L1010 600" strokeWidth="0.8" opacity="0.5" />
          </g>
          <Pylon x={520} top={150} base={590} stroke="#ffffff" />
          <Pylon x={1180} top={150} base={590} w={40} stroke="#ffffff" />
        </Layer>

        {/* the horizon: hazy blocks */}
        <Layer d={0.25}>
          <g fill="#a9c6e2">
            {CITY.map((b, i) => (
              <rect key={i} x={b.x} y={HORIZON - b.h} width={b.w} height={b.h} />
            ))}
          </g>
          <g fill="#d3e4f4">
            {CITY.filter((b) => b.lit).map((b, i) => (
              <rect key={i} x={b.x + 6} y={HORIZON - b.h + 8} width={b.w - 12} height="3" />
            ))}
          </g>
          <rect y={HORIZON - 90} width="1600" height="90" fill={`url(#${u('haze')})`} />
        </Layer>

        {/* the viaduct and the train that runs along it */}
        <Layer d={0.4}>
          <rect x="0" y="526" width="1600" height="12" fill="#4f6d98" opacity="0.6" />
          <g>
            {Array.from({ length: 10 }, (_, i) => 40 + i * 176).map((x) => (
              <g key={x}>
                <rect x={x} y="528" width="26" height={HORIZON - 528} fill="#7593bd" />
                <rect x={x + 18} y="528" width="8" height={HORIZON - 528} fill="#5d7caa" />
              </g>
            ))}
          </g>
          <g ref={train} transform="translate(-1700 0)" style={{ display: live ? undefined : 'none' }}>
            {[0, 1, 2, 3, 4].map((c) => (
              <Car key={c} x={c * 298} nose={c === 4} />
            ))}
          </g>
          <rect x="0" y="504" width="1600" height="24" fill={`url(#${u('deck')})`} />
          <rect x="0" y="502" width="1600" height="3" fill="#eef5fc" />
          <g stroke="#e4eef9" strokeWidth="1.2" opacity="0.8">
            <line x1="0" y1="492" x2="1600" y2="492" />
            {Array.from({ length: 54 }, (_, i) => i * 30).map((x) => (
              <line key={x} x1={x} y1="492" x2={x} y2="503" />
            ))}
          </g>
        </Layer>

        {/* trees and the warehouse */}
        <Layer d={0.55}>
          <g>
            <rect x="1060" y="470" width="560" height="170" fill={`url(#${u('ribs')})`} />
            <rect x="1060" y="462" width="560" height="10" fill="#c8d9ec" />
            <rect x="1060" y="470" width="44" height="170" fill="#7f99ba" />
            <rect x="1200" y="560" width="120" height="80" fill="#6f89ab" />
          </g>
          {TREES.map((t) => (
            <g key={t.seed}>
              <Branches strokes={t.tree.strokes} color="#14263a" />
              <Canopy dots={t.leaves} shadow="#173040" mid="#24484f" light="#4f7f74" />
            </g>
          ))}
        </Layer>

        {/* ground, road, rails, shadows */}
        <Layer d={0.75}>
          <rect y={HORIZON} width="1600" height="400" fill={`url(#${u('ground')})`} />
          <polygon points={`${VP.x - 24},${HORIZON} ${VP.x + 24},${HORIZON} 1560,1000 360,1000`} fill={`url(#${u('road')})`} />
          <g fill="#e9eef4" opacity="0.75">
            {[0, 1, 2, 3, 4, 5].map((i) => {
              const t0 = 0.08 + i * 0.16;
              const t1 = t0 + 0.07;
              const yA = HORIZON + (1000 - HORIZON) * t0 * t0;
              const yB = HORIZON + (1000 - HORIZON) * t1 * t1;
              const xA = VP.x + (960 - VP.x) * t0 * t0;
              const xB = VP.x + (960 - VP.x) * t1 * t1;
              const wA = 2 + 10 * t0 * t0;
              const wB = 2 + 10 * t1 * t1;
              return <polygon key={i} points={`${xA - wA},${yA} ${xA + wA},${yA} ${xB + wB},${yB} ${xB - wB},${yB}`} />;
            })}
          </g>
          {/* the tracks crossing the road */}
          <rect y="712" width="1600" height="64" fill="#4f5f74" />
          <g fill="#3a4659">
            {Array.from({ length: 64 }, (_, i) => i * 26).map((x) => (
              <rect key={x} x={x} y="716" width="12" height="56" />
            ))}
          </g>
          <g>
            <rect y="724" width="1600" height="6" fill="#c7d3e2" />
            <rect y="758" width="1600" height="6" fill="#c7d3e2" />
            <rect y="729" width="1600" height="2" fill="#56677d" />
            <rect y="763" width="1600" height="2" fill="#56677d" />
          </g>
          {/* sunlit patch on the crossing, and the long shadows */}
          <polygon points="760,700 1240,700 1340,790 700,790" fill="#e8f0f8" opacity="0.18" />
          <polygon points="0,780 520,1000 0,1000" fill="#0b1a33" opacity="0.42" />
          <polygon points="1372,820 1406,820 960,1000 860,1000" fill="#0b1a33" opacity="0.32" />
        </Layer>

        {/* the crossing signal, near and rim-lit */}
        <Layer d={0.95}>
          <rect x="1018" y="682" width="372" height="14" fill={`url(#${u('stripe')})`} />
          <rect x="1376" y="672" width="34" height="34" fill="#18233a" />
          <rect x="1382" y="300" width="18" height="520" fill={`url(#${u('pole')})`} />
          <rect x="1382" y="640" width="18" height="180" fill={`url(#${u('stripe')})`} opacity="0.95" />
          <g transform="translate(1391 330)">
            {[30, -30].map((rot) => (
              <g key={rot} transform={`rotate(${rot})`}>
                <rect x="-104" y="-13" width="208" height="26" fill="#f3c316" />
                <rect x="-104" y="-13" width="208" height="5" fill="#fff0a8" />
                <rect x="-104" y="8" width="208" height="5" fill="#b9910c" />
              </g>
            ))}
          </g>
          <rect x="1318" y="420" width="146" height="14" fill="#18233a" />
          {[1336, 1446].map((cx, i) => (
            <g key={cx}>
              <circle className={`xing-light ${i ? 'xing-b' : 'xing-a'}`} cx={cx} cy="476" r="64" fill={`url(#${u('lamp')})`} />
              <circle cx={cx} cy="476" r="36" fill="#18233a" />
              <circle cx={cx + 2} cy="474" r="36" fill="none" stroke="#c9dcf2" strokeWidth="1.5" opacity="0.6" />
              <circle className={`xing-light ${i ? 'xing-b' : 'xing-a'}`} cx={cx} cy="476" r="24" fill="#ff2e3d" />
              <path d={`M${cx - 30} 450 Q ${cx} 432 ${cx + 30} 450`} fill="#18233a" />
            </g>
          ))}
        </Layer>
      </g>
    </Svg>
  );
}
