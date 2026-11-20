/* The wallpaper: dusk over the Thar dunes outside Pilani. Drawn, not photographed, so it scales
   to any screen and weighs nothing. */
export default function Wallpaper() {
  return (
    <svg className="wallpaper" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="wp-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1b1640" />
          <stop offset="0.38" stopColor="#5a2f6b" />
          <stop offset="0.62" stopColor="#c4566a" />
          <stop offset="0.78" stopColor="#f39a5c" />
          <stop offset="0.9" stopColor="#ffd08a" />
        </linearGradient>
        <radialGradient id="wp-sun" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fff3d1" />
          <stop offset="0.55" stopColor="#ffd38a" stopOpacity="0.9" />
          <stop offset="1" stopColor="#ff9a5a" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="wp-d1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d9764f" />
          <stop offset="1" stopColor="#9c4636" />
        </linearGradient>
        <linearGradient id="wp-d2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a8483f" />
          <stop offset="1" stopColor="#6b2a35" />
        </linearGradient>
        <linearGradient id="wp-d3" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6e2b3c" />
          <stop offset="1" stopColor="#2c1530" />
        </linearGradient>
        <linearGradient id="wp-d4" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3a1a35" />
          <stop offset="1" stopColor="#140b1d" />
        </linearGradient>
      </defs>
      <rect width="1600" height="1000" fill="url(#wp-sky)" />
      {[
        [120, 80], [260, 150], [410, 60], [560, 190], [720, 110], [880, 40], [1010, 170], [1180, 90],
        [1320, 200], [1460, 70], [1540, 160], [340, 250], [960, 260], [1250, 280], [80, 220],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i % 3 ? 1.2 : 1.8} fill="#fff" opacity={0.35 + (i % 4) * 0.12} />
      ))}
      <circle cx="1060" cy="700" r="230" fill="url(#wp-sun)" />
      <circle cx="1060" cy="700" r="62" fill="#fff1cf" opacity="0.95" />
      <path d="M0 720 C 220 650, 420 690, 620 660 S 1000 610, 1200 660 S 1480 690, 1600 650 V1000 H0z" fill="url(#wp-d1)" />
      <path d="M0 790 C 180 730, 360 760, 560 740 S 900 690, 1120 760 S 1450 800, 1600 740 V1000 H0z" fill="url(#wp-d2)" />
      <path d="M0 860 C 260 800, 520 850, 760 820 S 1180 780, 1380 840 S 1540 870, 1600 850 V1000 H0z" fill="url(#wp-d3)" />
      <path d="M0 940 C 300 890, 640 930, 900 910 S 1360 880, 1600 925 V1000 H0z" fill="url(#wp-d4)" />
      <path d="M560 740 S 900 690, 1120 760" stroke="#ffd7a1" strokeOpacity="0.25" strokeWidth="2" fill="none" />
      <path d="M620 660 S 1000 610, 1200 660" stroke="#ffe3b8" strokeOpacity="0.3" strokeWidth="2" fill="none" />
    </svg>
  );
}
