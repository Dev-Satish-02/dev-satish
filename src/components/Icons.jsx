// Minimal inline icons (stroke = currentColor).
const base = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true };

export const MailIcon = () => (
  <svg {...base}>
    <rect x="3" y="5" width="18" height="14" rx="1" />
    <path d="m3 7 9 6 9-6" />
  </svg>
);
export const FileIcon = () => (
  <svg {...base}>
    <path d="M14 3H6v18h12V7z" />
    <path d="M14 3v4h4M9 13h6M9 17h6" />
  </svg>
);
export const MotionIcon = ({ on }) => (
  <svg {...base}>
    <circle cx="12" cy="12" r="8" />
    {on ? <path d="M12 4a8 8 0 0 1 0 16z" fill="currentColor" /> : <path d="m6 6 12 12" />}
  </svg>
);
