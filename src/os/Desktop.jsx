import { useEffect, useRef, useState } from 'react';
import { PROFILE, SOCIALS } from '../data/content';
import { AppIcon, Battery, Bluetooth, ControlCentre, Mirror, Sound, Wifi } from './icons';
import Window from './Window';
import Wallpaper from './Wallpaper';
import NotesApp from './apps/NotesApp';
import MessagesApp from './apps/MessagesApp';
import TerminalApp from './apps/TerminalApp';
import AskApp from './apps/AskApp';
import SettingsApp from './apps/SettingsApp';
import FinderApp from './apps/FinderApp';

const NAMES = {
  finder: 'Finder',
  notes: 'Notes',
  messages: 'Messages',
  ask: 'Ask',
  settings: 'System Settings',
  terminal: 'Terminal',
  readme: 'TextEdit',
};
const CAPTIONS = { terminal: 'dev: zsh', readme: 'read-me.txt' };

// where each window sits when the desk first opens, like a desk someone has been working at
function initialFrames() {
  const W = window.innerWidth;
  const H = window.innerHeight;
  const roomy = W >= 1180;
  const nw = roomy ? Math.min(1000, Math.round(W * 0.53)) : Math.min(960, W - 60);
  const nh = Math.min(roomy ? 700 : 760, Math.round(H * (roomy ? 0.64 : 0.8)));
  return {
    notes: { x: 14, y: 44, w: nw, h: nh },
    messages: { x: Math.round(W * 0.535), y: 68, w: Math.min(820, Math.round(W * 0.93 - W * 0.535)), h: Math.round(H * 0.56) },
    settings: { x: Math.round(W * 0.79), y: Math.round(H * 0.14), w: Math.min(640, Math.round(W * 0.36)), h: Math.round(H * 0.6) },
    ask: { x: -8, y: Math.round(H * 0.6), w: Math.round(W * 0.46), h: Math.round(H * 0.4) - 92 },
    finder: { x: Math.round(W * 0.2), y: 120, w: 720, h: 440 },
    terminal: { x: Math.round(W * 0.25), y: 160, w: Math.min(680, W - 160), h: 400 },
    readme: { x: W - 540, y: 110, w: 440, h: 360 },
    roomy,
  };
}

function useNow() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return now;
}

function Clock() {
  const now = useNow();
  const day = now.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
  const time = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit' });
  return (
    <time dateTime={now.toISOString()}>
      {day} {time}
    </time>
  );
}

// the real battery level where the browser shares it
function BatteryLevel() {
  const [level, setLevel] = useState(null);
  useEffect(() => {
    let bat;
    const read = () => setLevel(Math.round(bat.level * 100));
    navigator.getBattery?.().then((b) => {
      bat = b;
      read();
      b.addEventListener('levelchange', read);
    });
    return () => bat?.removeEventListener('levelchange', read);
  }, []);
  return (
    <span className="menubar-bat">
      {level !== null && <span>{level}%</span>}
      <Battery />
    </span>
  );
}

// sleep, shut down and the lock screen, as screens laid over the whole desk
function Overlay({ kind, onWake }) {
  const now = useNow();
  useEffect(() => {
    if (kind === 'restart') {
      const t = setTimeout(() => window.location.reload(), 1600);
      return () => clearTimeout(t);
    }
    const key = (e) => {
      if (kind === 'sleep') onWake();
      else if (kind === 'lock' && e.key === 'Enter') onWake();
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [kind, onWake]);

  if (kind === 'lock') {
    return (
      <div className="overlay overlay-lock" role="dialog" aria-modal="true" aria-label="Lock screen">
        <Wallpaper />
        <div className="lock-time">
          <p>{now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
          <strong>{now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</strong>
        </div>
        <div className="lock-user">
          <span className="avatar avatar-xl" aria-hidden="true">
            DS
          </span>
          <strong>{PROFILE.name}</strong>
          <button type="button" className="lock-go" onClick={onWake} autoFocus>
            Click to unlock
          </button>
        </div>
      </div>
    );
  }
  return (
    <div
      className={`overlay overlay-${kind}`}
      role="button"
      tabIndex={0}
      aria-label={kind === 'off' ? 'Start up' : kind === 'sleep' ? 'Wake' : 'Restarting'}
      onClick={kind === 'off' ? () => window.location.reload() : kind === 'sleep' ? onWake : undefined}
    >
      {kind === 'off' && <span>Click anywhere to start up</span>}
      {kind === 'restart' && <span className="spinner" aria-hidden="true" />}
    </div>
  );
}

function ReadMe() {
  return (
    <div className="textedit">
      <p>Hi, and welcome to Dev&apos;s desk.</p>
      <p>Everything about me is in Notes: who I am, where I&apos;ve worked, what I&apos;ve shipped, and what I&apos;ve written. Finder has the same things as files.</p>
      <p>Messages writes me an email. Ask answers questions about me from what&apos;s on this site. System Settings is me, as a computer. Terminal takes typed commands, start with help.</p>
      <p>Windows drag by their top edge. The dock opens apps and brings them back; its links go to my profiles.</p>
      <p>On a phone, all of this is an iPhone.</p>
    </div>
  );
}

const DOCK = [
  { id: 'finder', app: 'finder' },
  { id: 'notes', app: 'notes' },
  { id: 'ask', app: 'ask' },
  ...SOCIALS.map((s) => ({ id: s.label.toLowerCase(), label: s.label, href: s.href, external: true })),
  { id: 'messages', app: 'messages' },
  { id: 'mail', label: 'Mail', href: `mailto:${PROFILE.email}` },
  { id: 'terminal', app: 'terminal' },
  { id: 'settings', app: 'settings' },
  { sep: true },
  { id: 'trash', label: 'Trash', app: 'finder', folder: 'Trash' },
];

// the dock magnifies under the pointer like a Mac's: the icon you're on doubles, its
// neighbours swell less the further away they are, and an app bounces as it opens
const BASE = 54;
const PEAK = 108;
const REACH = 230;

function Dock({ wins, onApp }) {
  const items = useRef([]);
  const centres = useRef([]);
  const [sizes, setSizes] = useState(null);
  const [bouncing, setBouncing] = useState(null);
  const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // measure resting centres once the pointer arrives, so growing icons don't shift the maths
  const enter = () => {
    centres.current = items.current.map((el) => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return r.left + r.width / 2;
    });
  };
  const move = (e) => {
    if (reduce) return;
    if (!centres.current.length) enter();
    setSizes(
      centres.current.map((c) => {
        if (c == null) return BASE;
        const d = Math.abs(e.clientX - c);
        if (d >= REACH) return BASE;
        return BASE + (PEAK - BASE) * (Math.cos((d / REACH) * Math.PI) + 1) / 2;
      })
    );
  };
  const leave = () => {
    centres.current = [];
    setSizes(null);
  };
  const launch = (d) => {
    if (!reduce && d.app && !wins[d.app]?.open) {
      setBouncing(d.id);
      setTimeout(() => setBouncing(null), 1300);
    }
    onApp(d.app, d.folder);
  };

  return (
    <nav className={`dock${sizes ? ' is-magnified' : ''}`} aria-label="Dock" onMouseEnter={enter} onMouseMove={move} onMouseLeave={leave}>
      {DOCK.map((d, i) => {
        if (d.sep) return <span key={`sep${i}`} className="dock-sep" aria-hidden="true" />;
        const label = d.label || NAMES[d.app];
        const style = { width: sizes?.[i] ?? BASE };
        const cls = `dock-item${bouncing === d.id ? ' is-bouncing' : ''}`;
        const inner = (
          <>
            <AppIcon id={d.id} />
            <span className="dock-tip">{label}</span>
            {d.app && !d.folder && wins[d.app]?.open && <span className="dock-dot" aria-hidden="true" />}
          </>
        );
        return d.href ? (
          <a key={d.id} ref={(el) => (items.current[i] = el)} className={cls} style={style} href={d.href} aria-label={label} {...(d.external ? { target: '_blank', rel: 'noreferrer' } : {})}>
            {inner}
          </a>
        ) : (
          <button key={d.id} ref={(el) => (items.current[i] = el)} type="button" className={cls} style={style} onClick={() => launch(d)} aria-label={label}>
            {inner}
          </button>
        );
      })}
    </nav>
  );
}

export default function Desktop({ noteId, openNote, resume }) {
  const [frames, setFrames] = useState(initialFrames);
  const z = useRef(20);
  const [wins, setWins] = useState(() => {
    const roomy = frames.roomy;
    return {
      messages: { open: true, z: 2 },
      settings: { open: roomy, z: 3 },
      ask: { open: roomy, z: 4 },
      notes: { open: true, z: 5 },
      finder: { open: false, z: 1 },
      terminal: { open: false, z: 1 },
      readme: { open: false, z: 1 },
    };
  });
  const [folder, setFolder] = useState('Documents');
  const [menu, setMenu] = useState(null);
  const [overlay, setOverlay] = useState(null);
  const [settingsPage, setSettingsPage] = useState('general');

  const visible = Object.entries(wins).filter(([, w]) => w.open && !w.min);
  const focused = [...visible].sort((a, b) => b[1].z - a[1].z)[0]?.[0] || null;

  const patch = (app, p) => setWins((w) => ({ ...w, [app]: { ...w[app], ...p } }));
  const focus = (app) => {
    z.current += 1;
    patch(app, { open: true, min: false, z: z.current });
  };
  const showNote = (id) => {
    openNote(id);
    focus('notes');
  };
  const onApp = (app, f) => {
    if (app === 'finder') setFolder(f || 'Documents');
    focus(app);
  };

  useEffect(() => {
    const onResize = () => setFrames(initialFrames());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (!menu) return undefined;
    const close = (e) => !e.target.closest('.menu') && setMenu(null);
    const key = (e) => e.key === 'Escape' && setMenu(null);
    window.addEventListener('pointerdown', close);
    window.addEventListener('keydown', key);
    return () => {
      window.removeEventListener('pointerdown', close);
      window.removeEventListener('keydown', key);
    };
  }, [menu]);

  const apps = {
    finder: <FinderApp key={folder} start={folder} openNote={showNote} openApp={focus} resume={resume} />,
    notes: <NotesApp layout="desktop" noteId={noteId} onOpen={showNote} resume={resume} />,
    messages: <MessagesApp layout="desktop" />,
    ask: <AskApp layout="desktop" />,
    settings: <SettingsApp key={settingsPage} layout="desktop" resume={resume} start={settingsPage} />,
    terminal: <TerminalApp layout="desktop" openNote={showNote} openApp={focus} />,
    readme: <ReadMe />,
  };

  const item = (label, run) => (
    <li role="none" key={label}>
      <button
        type="button"
        role="menuitem"
        onClick={() => {
          setMenu(null);
          run();
        }}
      >
        {label}
      </button>
    </li>
  );

  const MENUS = {
    mark: [
      item(`About ${PROFILE.name}`, () => {
        setSettingsPage('about');
        focus('settings');
      }),
      item('System Settings…', () => {
        setSettingsPage('general');
        focus('settings');
      }),
      <li key="s1" className="menu-sep" role="separator" />,
      item('Sleep', () => setOverlay('sleep')),
      item('Restart…', () => setOverlay('restart')),
      item('Shut Down…', () => setOverlay('off')),
      <li key="s2" className="menu-sep" role="separator" />,
      item('Lock Screen', () => setOverlay('lock')),
      item(`Log Out ${PROFILE.name}…`, () => {
        setWins((w) => Object.fromEntries(Object.entries(w).map(([k, v]) => [k, { ...v, open: false, zoomed: false }])));
        setOverlay('lock');
      }),
    ],
    File: [
      item('New Message', () => focus('messages')),
      item('Open read-me.txt', () => focus('readme')),
      item('Close Window', () => focused && patch(focused, { open: false, zoomed: false })),
    ],
    Edit: [item('Copy Email Address', () => navigator.clipboard?.writeText(PROFILE.email))],
    View: [
      item('Zoom Window', () => focused && patch(focused, { zoomed: !wins[focused].zoomed })),
      item('Show All Windows', () => Object.keys(NAMES).forEach((a) => a !== 'readme' && focus(a))),
    ],
    Window: Object.keys(NAMES).map((a) => item(`${wins[a].open && !wins[a].min ? '✓ ' : ''}${a === 'readme' ? 'read-me.txt' : NAMES[a]}`, () => onApp(a))),
    Help: [item('Read me', () => focus('readme')), item('Ask about Dev', () => focus('ask'))],
  };

  const menuButton = (name, label = name, extra = {}) => (
    <div className="menu" key={name}>
      <button type="button" aria-haspopup="menu" aria-expanded={menu === name} onClick={() => setMenu(menu === name ? null : name)} {...extra}>
        {label}
      </button>
      {menu === name && (
        <ul className="menu-list" role="menu">
          {MENUS[name]}
        </ul>
      )}
    </div>
  );

  return (
    <div className="desktop">
      <Wallpaper />

      <header className="menubar">
        <div className="menubar-left">
          {menuButton('mark', '◆', { className: 'menu-mark', 'aria-label': 'Dev menu' })}
          <strong className="menubar-app">{NAMES[focused] || 'Finder'}</strong>
          {['File', 'Edit', 'View', 'Window', 'Help'].map((m) => menuButton(m))}
        </div>
        <div className="menubar-right" aria-hidden="true">
          <Sound />
          <Mirror />
          <Wifi />
          <Bluetooth />
          <BatteryLevel />
          <ControlCentre />
          <Clock />
        </div>
      </header>

      <div className="desk-icons">
        <button type="button" className="desk-icon" onDoubleClick={() => focus('readme')} onKeyDown={(e) => e.key === 'Enter' && focus('readme')}>
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
            title={app === 'readme' ? 'read-me.txt' : NAMES[app]}
            caption={CAPTIONS[app]}
            frame={frames[app]}
            z={w.z}
            zoomed={w.zoomed}
            focused={focused === app}
            onFocus={() => focused !== app && focus(app)}
            onMove={(f) => setFrames((x) => ({ ...x, [app]: f }))}
            onClose={() => patch(app, { open: false, zoomed: false })}
            onMinimize={() => patch(app, { min: true })}
            onZoom={() => patch(app, { zoomed: !w.zoomed })}
          >
            {apps[app]}
          </Window>
        ) : null
      )}

      <Dock wins={wins} onApp={onApp} />
      {overlay && <Overlay kind={overlay} onWake={() => setOverlay(null)} />}
    </div>
  );
}
