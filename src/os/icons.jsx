import { useId } from 'react';
import { siApple, siClaude, siGithub, siSpotify, siX } from 'simple-icons';

/* App icons. The Mac's own apps use their real icons (public/icons, taken from PuruVJ/macos-web);
   everything else is a tile drawn to the same Big Sur proportions, with brand marks from
   simple-icons where a brand has one. */

const base = import.meta.env.BASE_URL;
const REAL = {
  finder: 'finder',
  notes: 'notes',
  messages: 'messages',
  mail: 'mail',
  terminal: 'terminal',
  settings: 'system-preferences',
  contacts: 'contacts',
};

// a 24-unit brand path, centred in the tile at a given size
function Mark({ icon, size = 30 }) {
  const k = size / 24;
  return <path transform={`translate(${30 - size / 2} ${30 - size / 2}) scale(${k})`} d={icon.path} fill="#fff" />;
}

const TILES = {
  notes: ['#fff7d6', '#ffe58a'],
  messages: ['#6ee77f', '#1fbf45'],
  terminal: ['#3a3a3f', '#141416'],
  mail: ['#5fb4ff', '#1a6dff'],
  phone: ['#6ee77f', '#1fbf45'],
  experience: ['#c98a52', '#8a5126'],
  projects: ['#8f7bff', '#5236e0'],
  skills: ['#ff9f6b', '#f0533a'],
  writing: ['#ffbf5f', '#ff8a00'],
  github: ['#2d333b', '#0d1117'],
  linkedin: ['#2f8fe0', '#0a62c2'],
  twitter: ['#2a2a2a', '#000000'],
  finder: ['#6fc3ff', '#1e7bf0'],
  claude: ['#e3876a', '#c96442'],
  settings: ['#a4a4ab', '#5d5d64'],
  trash: ['#e8e9ec', '#b9bcc3'],
  weather: ['#4aa3ff', '#1c5fd6'],
  spotify: ['#1f1f1f', '#0a0a0a'],
  calendar: ['#ffffff', '#f2f2f2'],
  resume: ['#f4f5f7', '#d9dce2'],
  readme: ['#f4f5f7', '#d9dce2'],
};

function Glyph({ id }) {
  switch (id) {
    case 'notes':
      return (
        <>
          <rect x="0" y="0" width="60" height="17" fill="#f6c430" />
          {[27, 35, 43, 51].map((y) => (
            <line key={y} x1="9" x2="51" y1={y} y2={y} stroke="#d9cfa6" strokeWidth="1.4" />
          ))}
          {[12, 20, 28, 36, 44].map((x) => (
            <circle key={x} cx={x + 2} cy="17" r="1.1" fill="#b8901a" />
          ))}
        </>
      );
    case 'messages':
      return (
        <path
          d="M30 14c-10.5 0-19 6.9-19 15.4 0 4.9 2.8 9.2 7.2 12-0.5 2.6-2 5-4.2 6.8 3.8 0 7.2-1.4 9.7-3.6 2 0.5 4.1 0.8 6.3 0.8 10.5 0 19-6.9 19-15.4S40.5 14 30 14z"
          fill="#fff"
        />
      );
    case 'terminal':
      return (
        <>
          <path d="M15 21l9 8-9 8" stroke="#e8e8ea" strokeWidth="3.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="28" x2="43" y1="39" y2="39" stroke="#e8e8ea" strokeWidth="3.2" strokeLinecap="round" />
        </>
      );
    case 'mail':
      return (
        <>
          <rect x="12" y="18" width="36" height="25" rx="3.5" fill="#fff" />
          <path d="M13 20l17 13 17-13" stroke="#1a6dff" strokeWidth="2.4" fill="none" strokeLinejoin="round" />
        </>
      );
    case 'phone':
      return (
        <path
          d="M23.6 15.5c-1-1.1-2.6-1.2-3.8-0.3l-3.3 2.6c-1.5 1.2-2 3.2-1.3 5 3.9 9.6 11.3 17.2 20.8 21.4 1.8 0.8 3.9 0.3 5.1-1.2l2.6-3.2c1-1.2 0.9-2.9-0.2-3.9l-4.6-4c-1-0.9-2.6-0.9-3.6 0l-2.4 2.1c-3.6-2-6.6-5-8.6-8.6l2.1-2.4c0.9-1 0.9-2.6 0-3.6z"
          fill="#fff"
        />
      );
    case 'experience':
      return (
        <>
          <rect x="11" y="21" width="38" height="25" rx="4" fill="#fff4e6" />
          <path d="M23 21v-4a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v4" stroke="#fff4e6" strokeWidth="3" fill="none" />
          <rect x="11" y="30" width="38" height="3" fill="#c98a52" />
          <rect x="27" y="28" width="6" height="7" rx="1.5" fill="#8a5126" />
        </>
      );
    case 'projects':
      return (
        <>
          <rect x="13" y="13" width="15" height="15" rx="3.5" fill="#fff" />
          <rect x="32" y="13" width="15" height="15" rx="3.5" fill="#fff" opacity="0.65" />
          <rect x="13" y="32" width="15" height="15" rx="3.5" fill="#fff" opacity="0.65" />
          <rect x="32" y="32" width="15" height="15" rx="3.5" fill="#fff" />
        </>
      );
    case 'skills':
      return (
        <>
          <path d="M30 15l20 9-20 9-20-9z" fill="#fff" />
          <path d="M19 29v8c0 3 5 6 11 6s11-3 11-6v-8l-11 5z" fill="#fff" opacity="0.85" />
          <line x1="48" x2="48" y1="24" y2="37" stroke="#fff" strokeWidth="2" />
        </>
      );
    case 'writing':
      return (
        <>
          <path d="M14 16c6-1.5 11-0.8 15 2.5v27c-4-3.3-9-4-15-2.5z" fill="#fff" />
          <path d="M46 16c-6-1.5-11-0.8-15 2.5v27c4-3.3 9-4 15-2.5z" fill="#fff" opacity="0.85" />
        </>
      );
    case 'github':
      return <Mark icon={siGithub} size={32} />;
    case 'linkedin':
      return (
        <>
          <rect x="16" y="25" width="6" height="19" fill="#fff" />
          <circle cx="19" cy="18.5" r="3.6" fill="#fff" />
          <path d="M26 25h5.8v2.7c1-1.8 3-3.2 6-3.2 5 0 6.2 3.2 6.2 7.6V44h-6V33.6c0-2.3-.6-3.9-2.8-3.9-2.4 0-3.2 1.7-3.2 4V44h-6z" fill="#fff" />
        </>
      );
    case 'twitter':
      return <Mark icon={siX} size={26} />;
    case 'claude':
      return <Mark icon={siClaude} size={32} />;
    case 'spotify':
      return <path transform="translate(14 14) scale(1.333)" d={siSpotify.path} fill="#1ed760" />;
    case 'weather':
      return (
        <>
          <circle cx="24" cy="24" r="9" fill="#ffd54a" />
          <path d="M22 44h20a8 8 0 0 0 0-16 11 11 0 0 0-21 4 6 6 0 0 0 1 12z" fill="#fff" />
        </>
      );
    case 'trash':
      // the Big Sur bin: a frosted wire basket with a darker rim
      return (
        <>
          <defs>
            <linearGradient id="bin-body" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#c9ccd3" />
              <stop offset="0.5" stopColor="#f4f5f8" />
              <stop offset="1" stopColor="#c2c5cc" />
            </linearGradient>
          </defs>
          <path d="M12 15h36l-3.6 37.5a4 4 0 0 1-4 3.5H19.6a4 4 0 0 1-4-3.5z" fill="url(#bin-body)" opacity="0.92" />
          {[18.5, 24.5, 30, 35.5, 41.5].map((x, i) => (
            <path key={x} d={`M${x} 19 L${30 + (x - 30) * 0.86} 52`} stroke="#9ea2ab" strokeWidth="1.3" opacity="0.8" />
          ))}
          {[24, 31, 38, 45].map((y) => (
            <path key={y} d={`M${12.6 + (y - 15) * 0.096} ${y}H${47.4 - (y - 15) * 0.096}`} stroke="#b4b8c0" strokeWidth="0.8" opacity="0.7" />
          ))}
          <rect x="10" y="11.5" width="40" height="5.5" rx="2.4" fill="#e9ebef" stroke="#a5a9b1" strokeWidth="1" />
          <ellipse cx="30" cy="12.4" rx="17" ry="1.2" fill="#fff" opacity="0.8" />
        </>
      );
    case 'resume':
    case 'readme':
      return (
        <>
          <path d="M17 10h19l9 9v31H17z" fill="#fff" stroke="#c4c8d0" strokeWidth="1.2" />
          <path d="M36 10v9h9" fill="#e9ebef" stroke="#c4c8d0" strokeWidth="1.2" />
          {[26, 31, 36, 41].map((y) => (
            <line key={y} x1="22" x2="40" y1={y} y2={y} stroke="#b7bcc6" strokeWidth="1.6" />
          ))}
          <text x="31" y="48.5" textAnchor="middle" fontSize="6.5" fontWeight="700" fill={id === 'resume' ? '#e5484d' : '#6b7280'} fontFamily="system-ui, sans-serif">
            {id === 'resume' ? 'PDF' : 'TXT'}
          </text>
        </>
      );
    default:
      return null;
  }
}

export function AppIcon({ id, className = '' }) {
  const u = useId().replace(/:/g, '');
  if (REAL[id]) {
    return <img className={`app-icon ${className}`} src={`${base}icons/${REAL[id]}.webp`} alt="" draggable="false" />;
  }
  const [a, b] = TILES[id] || TILES.notes;
  const doc = id === 'resume' || id === 'readme' || id === 'trash';
  return (
    <svg className={`app-icon ${className}`} viewBox="0 0 60 60" aria-hidden="true">
      <defs>
        <linearGradient id={`g${u}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={a} />
          <stop offset="1" stopColor={b} />
        </linearGradient>
        <clipPath id={`c${u}`}>
          <rect width="60" height="60" rx="13.4" />
        </clipPath>
      </defs>
      {doc ? (
        <Glyph id={id} />
      ) : (
        // inset to match the real icons, which leave a margin around the tile
        <g transform="translate(4.6 4.6) scale(0.847)">
          <g clipPath={`url(#c${u})`}>
            <rect width="60" height="60" fill={`url(#g${u})`} />
            <Glyph id={id} />
          </g>
        </g>
      )}
    </svg>
  );
}

/* status-bar glyphs */
export function Wifi() {
  return (
    <svg viewBox="0 0 18 13" className="sb-glyph" aria-hidden="true">
      <path d="M9 12.2l2.3-2.6a3.3 3.3 0 0 0-4.6 0z" fill="currentColor" />
      <path d="M4.6 7.6a6.2 6.2 0 0 1 8.8 0l1.6-1.8a8.7 8.7 0 0 0-12 0z" fill="currentColor" />
      <path d="M1.6 4.2a10.6 10.6 0 0 1 14.8 0L18 2.4a13 13 0 0 0-18 0z" fill="currentColor" />
    </svg>
  );
}

export function Battery() {
  return (
    <svg viewBox="0 0 27 13" className="sb-glyph sb-battery" aria-hidden="true">
      <rect x="0.6" y="0.6" width="23" height="11.8" rx="3.4" fill="none" stroke="currentColor" opacity="0.45" />
      <rect x="2.4" y="2.4" width="17" height="8.2" rx="2" fill="currentColor" />
      <path d="M25 4.4v4.2c.9-.3 1.5-1.1 1.5-2.1S25.9 4.7 25 4.4z" fill="currentColor" opacity="0.45" />
    </svg>
  );
}

export function Signal() {
  return (
    <svg viewBox="0 0 18 12" className="sb-glyph" aria-hidden="true">
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={i * 4.8} y={9 - i * 3} width="3.2" height={3 + i * 3} rx="1" fill="currentColor" />
      ))}
    </svg>
  );
}

export function SearchGlyph() {
  return (
    <svg viewBox="0 0 16 16" className="sb-glyph" aria-hidden="true">
      <circle cx="7" cy="7" r="5" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M11 11l3.6 3.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function Compose() {
  return (
    <svg viewBox="0 0 20 20" className="sb-glyph" aria-hidden="true">
      <path d="M15 3.5l1.5 1.5-7.8 7.8-2.2.7.7-2.2z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M16 11v5.2a.8.8 0 0 1-.8.8H3.8a.8.8 0 0 1-.8-.8V4.8a.8.8 0 0 1 .8-.8H9" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function Sound() {
  return (
    <svg viewBox="0 0 18 14" className="sb-glyph" aria-hidden="true">
      <path d="M1 5h3l4-3.5v11L4 9H1z" fill="currentColor" />
      <path d="M11 4.2a4 4 0 0 1 0 5.6M13.4 2a7 7 0 0 1 0 10" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function Mirror() {
  return (
    <svg viewBox="0 0 18 14" className="sb-glyph" aria-hidden="true">
      <rect x="1" y="1" width="16" height="10" rx="1.6" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5.5 13.5L9 9.5l3.5 4z" fill="currentColor" />
    </svg>
  );
}

export function Bluetooth() {
  return (
    <svg viewBox="0 0 10 16" className="sb-glyph" aria-hidden="true">
      <path d="M1.5 4.5l7 6.5L5 14.5V1.5L8.5 5l-7 6.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

export function ControlCentre() {
  return (
    <svg viewBox="0 0 18 14" className="sb-glyph" aria-hidden="true">
      <rect x="1" y="1" width="16" height="5" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="4" cy="3.5" r="1.6" fill="currentColor" />
      <rect x="1" y="8" width="16" height="5" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="14" cy="10.5" r="1.6" fill="currentColor" />
    </svg>
  );
}

export function AppleLogo({ size = 14 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <path d={siApple.path} fill="currentColor" />
    </svg>
  );
}

// a Finder folder, in the Big Sur blue
export function Folder({ className = '' }) {
  const u = useId().replace(/:/g, '');
  return (
    <svg className={`app-icon ${className}`} viewBox="0 0 60 48" aria-hidden="true">
      <defs>
        <linearGradient id={`f${u}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7cc4f8" />
          <stop offset="1" stopColor="#4a9fe6" />
        </linearGradient>
      </defs>
      <path d="M4 8a4 4 0 0 1 4-4h14l5 5h25a4 4 0 0 1 4 4v4H4z" fill="#3d8fd8" />
      <rect x="4" y="13" width="52" height="31" rx="4" fill={`url(#f${u})`} />
      <rect x="4" y="13" width="52" height="1.5" fill="#a9daff" opacity="0.8" />
    </svg>
  );
}
