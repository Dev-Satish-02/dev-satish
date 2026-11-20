import { useEffect, useRef, useState } from 'react';
import { PROFILE, SOCIALS } from '../data/content';
import { NOTES } from './notes';
import { AppIcon, Battery, Signal, Wifi } from './icons';
import Wallpaper from './Wallpaper';
import NotesApp from './apps/NotesApp';
import MessagesApp from './apps/MessagesApp';
import ClaudeApp from './apps/ClaudeApp';
import SettingsApp from './apps/SettingsApp';

/* On a phone the desk becomes an iPhone: the wallpaper and one dock holding every app. Each app
   opens full screen out of its icon and has its own way back home. */

function useTime() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 15000);
    return () => clearInterval(t);
  }, []);
  return now;
}

const firstPost = NOTES.find((n) => n.group === 'Writing')?.id;

export default function Phone({ noteId, openNote, resume, startApp }) {
  const now = useTime();
  const [app, setApp] = useState(startApp || null);
  const [origin, setOrigin] = useState('50% 50%');
  const [leaving, setLeaving] = useState(false);
  const [searchFirst, setSearchFirst] = useState(false);
  const sheet = useRef(null);

  const launch = (e, name, note = undefined, search = false) => {
    const r = e.currentTarget.getBoundingClientRect();
    setOrigin(`${r.left + r.width / 2}px ${r.top + r.height / 2}px`);
    if (note !== undefined) openNote(note);
    setSearchFirst(search);
    setLeaving(false);
    setApp(name);
  };

  const home = () => {
    if (!app) return;
    setLeaving(true);
  };

  useEffect(() => {
    if (!leaving) return undefined;
    const t = setTimeout(
      () => {
        setApp(null);
        setLeaving(false);
        openNote(null);
      },
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 280
    );
    return () => clearTimeout(t);
  }, [leaving, openNote]);

  useEffect(() => {
    if (app) sheet.current?.focus();
  }, [app]);

  const time = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

  // every app lives in the one dock at the bottom of the screen
  const apps = [
    { id: 'phone', label: 'Phone', href: PROFILE.phoneHref },
    { id: 'mail', label: 'Mail', href: `mailto:${PROFILE.email}` },
    { id: 'messages', label: 'Messages', go: (e) => launch(e, 'messages') },
    { id: 'notes', label: 'Notes', go: (e) => launch(e, 'notes', null) },
    { id: 'claude', label: 'Claude', go: (e) => launch(e, 'claude') },
    { id: 'experience', label: 'Experience', go: (e) => launch(e, 'notes', 'experience') },
    { id: 'projects', label: 'Projects', go: (e) => launch(e, 'notes', 'projects') },
    { id: 'skills', label: 'Skills', go: (e) => launch(e, 'notes', 'skills') },
    { id: 'writing', label: 'Writing', go: (e) => launch(e, 'notes', firstPost) },
    { id: 'settings', label: 'Settings', go: (e) => launch(e, 'settings') },
    ...(resume ? [{ id: 'resume', label: 'Résumé', href: resume, external: true }] : []),
    ...SOCIALS.map((s) => ({ id: s.label.toLowerCase(), label: s.label === 'Twitter' ? 'X' : s.label, href: s.href, external: true })),
  ];

  const icon = (a, withLabel = true) =>
    a.href ? (
      <a key={a.id} className="ph-icon" href={a.href} {...(a.external ? { target: '_blank', rel: 'noreferrer' } : {})}>
        <AppIcon id={a.id} />
        {withLabel ? <span>{a.label}</span> : <span className="sr-only">{a.label}</span>}
      </a>
    ) : (
      <button key={a.id} type="button" className="ph-icon" onClick={a.go}>
        <AppIcon id={a.id} />
        {withLabel ? <span>{a.label}</span> : <span className="sr-only">{a.label}</span>}
      </button>
    );

  return (
    <div className="phone">
      <Wallpaper />
      <div className="ph-status" aria-hidden="true">
        <span className="ph-time">{time}</span>
        <span className="ph-glyphs">
          <Signal />
          <Wifi />
          <Battery />
        </span>
      </div>

      <main className="ph-home" aria-label="Home screen" inert={app ? true : undefined}>
        <nav className="ph-dock" aria-label="Apps">
          {apps.map((a) => icon(a))}
        </nav>
      </main>

      {app && (
        <div
          ref={sheet}
          tabIndex={-1}
          className={`ph-sheet${leaving ? ' is-leaving' : ''}`}
          style={{ transformOrigin: origin }}
          role="dialog"
          aria-modal="true"
          aria-label={{ notes: 'Notes', messages: 'Messages', claude: 'Claude', settings: 'Settings' }[app]}
          onKeyDown={(e) => e.key === 'Escape' && home()}
        >
          {app === 'notes' && (
            <NotesApp layout="phone" noteId={noteId} onOpen={openNote} onClose={home} resume={resume} searchFirst={searchFirst} />
          )}
          {app === 'messages' && <MessagesApp layout="phone" onClose={home} />}
          {app === 'claude' && <ClaudeApp layout="phone" onClose={home} />}
          {app === 'settings' && <SettingsApp layout="phone" onClose={home} resume={resume} />}
        </div>
      )}

    </div>
  );
}
