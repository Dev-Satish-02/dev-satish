import { useEffect, useRef, useState } from 'react';
import { PROFILE, SOCIALS } from '../data/content';
import { NOTES } from './notes';
import { AppIcon, Battery, Wifi } from './icons';
import Window from './Window';
import Wallpaper from './Wallpaper';
import NotesApp from './apps/NotesApp';
import MessagesApp from './apps/MessagesApp';
import TerminalApp from './apps/TerminalApp';

const NAMES = { notes: 'Notes', messages: 'Messages', terminal: 'Terminal', readme: 'TextEdit' };
const TITLES = { notes: '', messages: '', terminal: 'dev: zsh', readme: 'read-me.txt' };

function initialFrames() {
  const W = window.innerWidth;
  const H = window.innerHeight;
  const top = 44;
  const bottom = 96; // the dock
  const nh = Math.min(720, H - top - bottom);
  const nw = Math.min(1000, W - 120);
  const nx = Math.max(24, Math.round((W - nw) / 2) - 120);
  return {
    notes: { x: nx, y: top, w: nw, h: nh },
    messages: { x: Math.min(W - 420, nx + nw - 180), y: top + 26, w: 380, h: Math.min(560, nh - 40) },
    terminal: { x: nx + 80, y: top + 110, w: Math.min(680, W - 160), h: 400 },
    readme: { x: W - 520, y: top + 70, w: 440, h: 360 },
  };
}

function Clock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 15000);
    return () => clearInterval(t);
  }, []);
  const day = now.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
  const time = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  return (
    <time dateTime={now.toISOString()}>
      {day} {time}
    </time>
  );
}

function ReadMe() {
  return (
    <div className="textedit">
      <p>Hi, and welcome to Dev&apos;s desk.</p>
      <p>Everything about me is in Notes: who I am, where I&apos;ve worked, what I&apos;ve shipped, and what I&apos;ve written.</p>
      <p>Messages sends me a note straight to my inbox. Terminal takes typed commands, start with help.</p>
      <p>Windows drag by their top edge. The dock opens and brings back apps; the links in it go to my profiles.</p>
      <p>On a phone, all of this is an iPhone.</p>
    </div>
  );
}

const DOCK = [
  { id: 'notes', label: 'Notes', app: 'notes' },
  { id: 'messages', label: 'Messages', app: 'messages' },
  { id: 'terminal', label: 'Terminal', app: 'terminal' },
  { id: 'writing', label: 'Writing', note: NOTES.find((n) => n.group === 'Writing')?.id },
  { sep: true },
  { id: 'mail', label: 'Mail', href: `mailto:${PROFILE.email}` },
  ...SOCIALS.map((s) => ({ id: s.label.toLowerCase(), label: s.label, href: s.href, external: true })),
];

export default function Desktop({ noteId, openNote, resume }) {
  const [frames, setFrames] = useState(initialFrames);
  const z = useRef(10);
  const [wins, setWins] = useState({
    messages: { open: true, min: false, z: 2, zoomed: false },
    notes: { open: true, min: false, z: 3, zoomed: false },
    terminal: { open: false, min: false, z: 1, zoomed: false },
    readme: { open: false, min: false, z: 1, zoomed: false },
  });
  const [menu, setMenu] = useState(null);

  const visible = Object.entries(wins).filter(([, w]) => w.open && !w.min);
  const focused = visible.sort((a, b) => b[1].z - a[1].z)[0]?.[0] || null;

  const patch = (app, p) => setWins((w) => ({ ...w, [app]: { ...w[app], ...p } }));
  const focus = (app) => {
    if (focused === app && wins[app].open && !wins[app].min) return;
    z.current += 1;
    patch(app, { open: true, min: false, z: z.current });
  };

  // a note opened from anywhere (a link, the terminal, the dock) brings Notes forward
  const showNote = (id) => {
    openNote(id);
    focus('notes');
  };

  useEffect(() => {
    const onResize = () => setFrames(initialFrames());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (!menu) return undefined;
    const close = (e) => {
      if (!e.target.closest('.menu')) setMenu(null);
    };
    const key = (e) => e.key === 'Escape' && setMenu(null);
    window.addEventListener('pointerdown', close);
    window.addEventListener('keydown', key);
    return () => {
      window.removeEventListener('pointerdown', close);
      window.removeEventListener('keydown', key);
    };
  }, [menu]);

  const apps = {
    notes: <NotesApp layout="desktop" noteId={noteId} onOpen={showNote} resume={resume} />,
    messages: <MessagesApp layout="desktop" />,
    terminal: <TerminalApp layout="desktop" openNote={showNote} openApp={focus} />,
    readme: <ReadMe />,
  };

  const dockClick = (d) => {
    if (d.note) showNote(d.note);
    else if (d.app) focus(d.app);
  };

  return (
    <div className="desktop">
      <Wallpaper />

      <header className="menubar">
        <div className="menubar-left">
          <div className="menu">
            <button type="button" className="menu-mark" aria-label="About this desk" onClick={() => setMenu(menu === 'mark' ? null : 'mark')}>
              ◆
            </button>
            {menu === 'mark' && (
              <ul className="menu-list" role="menu">
                <li role="none">
                  <button type="button" role="menuitem" onClick={() => { setMenu(null); showNote('about'); }}>
                    About {PROFILE.name}
                  </button>
                </li>
                <li role="none">
                  <button type="button" role="menuitem" onClick={() => { setMenu(null); showNote('contact'); }}>
                    Contact
                  </button>
                </li>
              </ul>
            )}
          </div>
          <strong className="menubar-app">{NAMES[focused] || 'Finder'}</strong>
          <div className="menu">
            <button type="button" onClick={() => setMenu(menu === 'window' ? null : 'window')}>
              Window
            </button>
            {menu === 'window' && (
              <ul className="menu-list" role="menu">
                {Object.keys(NAMES).map((app) => (
                  <li role="none" key={app}>
                    <button type="button" role="menuitem" onClick={() => { setMenu(null); focus(app); }}>
                      {wins[app].open && !wins[app].min ? '✓ ' : ''}
                      {NAMES[app] === 'TextEdit' ? 'read-me.txt' : NAMES[app]}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="menu">
            <button type="button" onClick={() => { setMenu(null); focus('readme'); }}>
              Help
            </button>
          </div>
        </div>
        <div className="menubar-right">
          <Wifi />
          <Battery />
          <Clock />
        </div>
      </header>

      <div className="desk-icons">
        <button type="button" className="desk-icon" onClick={() => focus('readme')}>
          <AppIcon id="readme" />
          <span>read-me.txt</span>
        </button>
        {resume && (
          <a className="desk-icon" href={resume} target="_blank" rel="noreferrer">
            <AppIcon id="resume" />
            <span>resume.pdf</span>
          </a>
        )}
      </div>

      {Object.entries(wins).map(([app, w]) =>
        w.open && !w.min ? (
          <Window
            key={app}
            app={app}
            title={NAMES[app] === "TextEdit" ? "read-me.txt" : NAMES[app]}
            caption={TITLES[app]}
            frame={frames[app]}
            z={w.z}
            zoomed={w.zoomed}
            focused={focused === app}
            onFocus={() => focus(app)}
            onMove={(f) => setFrames((x) => ({ ...x, [app]: f }))}
            onClose={() => patch(app, { open: false, zoomed: false })}
            onMinimize={() => patch(app, { min: true })}
            onZoom={() => patch(app, { zoomed: !w.zoomed })}
          >
            {apps[app]}
          </Window>
        ) : null
      )}

      <nav className="dock" aria-label="Dock">
        {DOCK.map((d, i) =>
          d.sep ? (
            <span key={`sep${i}`} className="dock-sep" aria-hidden="true" />
          ) : d.href ? (
            <a key={d.id} className="dock-item" href={d.href} {...(d.external ? { target: '_blank', rel: 'noreferrer' } : {})} aria-label={d.label}>
              <AppIcon id={d.id} />
              <span className="dock-tip">{d.label}</span>
            </a>
          ) : (
            <button key={d.id} type="button" className="dock-item" onClick={() => dockClick(d)} aria-label={d.label}>
              <AppIcon id={d.id} />
              <span className="dock-tip">{d.label}</span>
              {d.app && wins[d.app].open && <span className="dock-dot" aria-hidden="true" />}
            </button>
          )
        )}
      </nav>
    </div>
  );
}
