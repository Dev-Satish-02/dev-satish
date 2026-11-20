import { useId } from 'react';

/* App icons, drawn here: a rounded tile with a gradient and one plain glyph each. */

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
  github: ['#3b3f46', '#16181c'],
  linkedin: ['#2f8fe0', '#0a62c2'],
  twitter: ['#2a2a2a', '#000000'],
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
      return (
        <path
          transform="translate(12 12) scale(1.5)"
          fill="#fff"
          d="M12 .5C5.7.5.5 5.7.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.3.8-.6v-2c-3.2.7-3.9-1.4-3.9-1.4-.5-1.3-1.3-1.7-1.3-1.7-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.2 1.2a11 11 0 0 1 5.8 0c2.2-1.5 3.2-1.2 3.2-1.2.6 1.6.2 2.8.1 3.1.8.8 1.2 1.9 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6 4.6-1.5 7.9-5.8 7.9-10.9C23.5 5.7 18.3.5 12 .5z"
        />
      );
    case 'linkedin':
      return (
        <>
          <rect x="16" y="25" width="6" height="19" fill="#fff" />
          <circle cx="19" cy="18.5" r="3.6" fill="#fff" />
          <path d="M26 25h5.8v2.7c1-1.8 3-3.2 6-3.2 5 0 6.2 3.2 6.2 7.6V44h-6V33.6c0-2.3-.6-3.9-2.8-3.9-2.4 0-3.2 1.7-3.2 4V44h-6z" fill="#fff" />
        </>
      );
    case 'twitter':
      return (
        <path
          transform="translate(16 16) scale(1.17)"
          fill="#fff"
          d="M18.2 2.2h3.4l-7.4 8.5L23 21.8h-6.8l-5.3-7-6.1 7H1.4l7.9-9L1 2.2h7l4.8 6.4zm-1.2 17.6h1.9L7.1 4.1H5.1z"
        />
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
  const [a, b] = TILES[id] || TILES.notes;
  const doc = id === 'resume' || id === 'readme';
  const u = useId().replace(/:/g, '');
  return (
    <svg className={`app-icon ${className}`} viewBox="0 0 60 60" aria-hidden="true">
      <defs>
        <linearGradient id={`g${u}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={a} />
          <stop offset="1" stopColor={b} />
        </linearGradient>
        <clipPath id={`c${u}`}>
          <rect width="60" height="60" rx="13.5" />
        </clipPath>
      </defs>
      {doc ? (
        <Glyph id={id} />
      ) : (
        <g clipPath={`url(#c${u})`}>
          <rect width="60" height="60" fill={`url(#g${u})`} />
          <Glyph id={id} />
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
