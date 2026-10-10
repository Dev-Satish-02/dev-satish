// Original line art in the series' "empty town" vocabulary: utility poles,
// sagging power lines and a staircase that climbs out of frame.
// Drawn with currentColor so the parent decides the tone.

function Pole({ x, h, base }) {
  const top = base - h;
  return (
    <g>
      <rect x={x - 5} y={top} width="10" height={h} />
      <rect x={x - 46} y={top + 26} width="92" height="7" />
      <rect x={x - 32} y={top + 62} width="64" height="6" />
      {[-40, -14, 14, 40].map((dx) => (
        <rect key={dx} x={x + dx - 3} y={top + 16} width="6" height="12" />
      ))}
      <rect x={x + 6} y={top + 110} width="22" height="34" />
    </g>
  );
}

function Wire({ x1, y1, x2, y2, sag }) {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2 + sag;
  return <path d={`M${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`} fill="none" stroke="currentColor" strokeWidth="2" />;
}

export function PowerLines({ className }) {
  const base = 900;
  const poles = [
    { x: 140, h: 760 },
    { x: 760, h: 640 },
    { x: 1240, h: 540 },
  ];
  const arms = [-40, -14, 14, 40];
  return (
    <svg className={className} viewBox="0 0 1400 900" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <g fill="currentColor">
        {poles.map((p) => (
          <Pole key={p.x} x={p.x} h={p.h} base={base} />
        ))}
      </g>
      {poles.slice(0, -1).map((p, i) => {
        const next = poles[i + 1];
        return arms.map((dx, j) => (
          <Wire
            key={`${i}-${dx}`}
            x1={p.x + dx}
            y1={base - p.h + 18}
            x2={next.x + dx}
            y2={base - next.h + 18}
            sag={70 + j * 12}
          />
        ));
      })}
      <Wire x1={-20} y1={170} x2={100} y2={base - 760 + 18} sag={30} />
      <Wire x1={1280} y1={base - 540 + 18} x2={1420} y2={400} sag={30} />
      <Wire x1={-20} y1={90} x2={1420} y2={250} sag={150} />
    </svg>
  );
}

export function Staircase({ className, steps = 14 }) {
  const w = 600;
  const h = 600;
  const sw = w / steps;
  const sh = h / steps;
  let d = `M0 ${h}`;
  for (let i = 0; i < steps; i += 1) {
    d += ` V${h - (i + 1) * sh} H${(i + 1) * sw}`;
  }
  d += ` V${h} Z`;
  return (
    <svg className={className} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="xMaxYMax meet" aria-hidden="true">
      <path d={d} fill="currentColor" />
      <rect x={w * 0.62} y={0} width="4" height={h} fill="currentColor" opacity="0.6" />
    </svg>
  );
}
