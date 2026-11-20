import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { EDUCATION, EXPERIENCE, PROFILE, PROJECTS, SOCIALS } from '../data/content';
import { AppIcon, AppleLogo, Battery, Bluetooth, ControlCentre, Mirror, Sound, Wifi } from './icons';
import { README } from './lib/fs';
import { describe, useWeather } from './lib/weather';
import WeatherApp from './apps/WeatherApp';
import Window from './Window';
import Wallpaper from './Wallpaper';
import NotesApp from './apps/NotesApp';
import MessagesApp from './apps/MessagesApp';
import TerminalApp from './apps/TerminalApp';
import ClaudeApp from './apps/ClaudeApp';
import SettingsApp from './apps/SettingsApp';
import FinderApp from './apps/FinderApp';
import SocialApp from './apps/SocialApp';

const NAMES = {
  finder: 'Finder',
  notes: 'Notes',
  messages: 'Messages',
  claude: 'Claude',
  settings: 'System Settings',
  terminal: 'Terminal',
  github: 'GitHub',
  linkedin: 'LinkedIn',
  twitter: 'X',
  weather: 'Weather',
  aboutmac: 'About This Mac',
  readme: 'TextEdit',
};
const CAPTIONS = { terminal: 'dev: zsh' };

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
    claude: { x: -8, y: Math.round(H * 0.6), w: Math.round(W * 0.46), h: Math.round(H * 0.4) - 92 },
    finder: { x: Math.round(W * 0.2), y: 120, w: 720, h: 440 },
    terminal: { x: Math.round(W * 0.25), y: 160, w: Math.min(680, W - 160), h: 400 },
    readme: { x: W - 540, y: 110, w: 440, h: 360 },
    github: { x: Math.round(W * 0.3), y: 90, w: Math.min(760, W - 80), h: Math.min(640, H - 190) },
    linkedin: { x: Math.round(W * 0.34), y: 70, w: Math.min(820, W - 80), h: Math.min(680, H - 170) },
    twitter: { x: Math.round(W * 0.38), y: 80, w: Math.min(600, W - 80), h: Math.min(640, H - 180) },
    weather: { x: Math.round(W * 0.42), y: 64, w: Math.min(820, W - 80), h: Math.min(600, H - 170) },
    aboutmac: { x: Math.round(W / 2 - 170), y: Math.round(H * 0.18), w: 340, h: 470 },
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

// the real battery level and charging state, for the battery popover
function useBattery() {
  const [b, setB] = useState(null);
  useEffect(() => {
    let bat;
    const read = () => setB({ level: Math.round(bat.level * 100), charging: bat.charging });
    navigator.getBattery?.().then((x) => {
      bat = x;
      read();
      x.addEventListener('levelchange', read);
      x.addEventListener('chargingchange', read);
    });
    return () => {
      bat?.removeEventListener('levelchange', read);
      bat?.removeEventListener('chargingchange', read);
    };
  }, []);
  return b;
}

// the panels that drop from the menu bar's status icons
function StatusPanel({ kind, weather, battery, openApp }) {
  const now = useNow();
  const [volume, setVolume] = useState(70);
  const [wifi, setWifi] = useState(true);
  const pilani = weather.cities?.[0];
  if (kind === 'clock') {
    return (
      <div className="status-panel">
        <strong className="status-title">{now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</strong>
        <button type="button" className="status-row" onClick={() => openApp('weather')}>
          Weather: {pilani ? `${Math.round(pilani.current.temperature_2m)}° and ${describe(pilani.current.weather_code).label.toLowerCase()} in Pilani` : 'open forecast'}
        </button>
        <button type="button" className="status-row" onClick={() => openApp('messages')}>
          Messages: a note from Dev is waiting
        </button>
      </div>
    );
  }
  if (kind === 'battery') {
    return (
      <div className="status-panel">
        <strong className="status-title">Battery {battery ? `${battery.level}%` : ''}</strong>
        <p className="status-row">Power source: {battery ? (battery.charging ? 'Power Adapter' : 'Battery') : 'unknown'}</p>
        <p className="status-row status-muted">No apps using significant energy</p>
      </div>
    );
  }
  if (kind === 'sound') {
    return (
      <div className="status-panel">
        <strong className="status-title">Sound</strong>
        <input type="range" min="0" max="100" value={volume} onChange={(e) => setVolume(+e.target.value)} aria-label="Volume" className="status-slider" />
        <p className="status-caption">Output</p>
        <p className="status-row">✓ MacBook Air Speakers</p>
        <p className="status-row status-muted">AirPods Pro</p>
      </div>
    );
  }
  if (kind === 'wifi') {
    return (
      <div className="status-panel">
        <span className="status-title status-split">
          Wi-Fi
          <button type="button" className={`set-toggle${wifi ? ' is-on' : ''}`} aria-pressed={wifi} aria-label="Wi-Fi" onClick={() => setWifi(!wifi)} />
        </span>
        {wifi && (
          <>
            <p className="status-caption">Known network</p>
            <p className="status-row">◉ BITS-Pilani</p>
            <p className="status-caption">Other networks</p>
            {SOCIALS.map((x) => (
              <a key={x.href} className="status-row" href={x.href} target="_blank" rel="noreferrer">
                {x.label}
              </a>
            ))}
          </>
        )}
      </div>
    );
  }
  return null;
}

// About This Mac, if the Mac were Dev
function AboutMac() {
  return (
    <div className="aboutmac">
      <span className="avatar avatar-xl" aria-hidden="true">
        DS
      </span>
      <h2>{PROFILE.name}</h2>
      <p className="aboutmac-sub">{PROFILE.title}</p>
      <dl>
        <dt>Chip</dt>
        <dd>{EDUCATION[0].school}, dual degree</dd>
        <dt>Memory</dt>
        <dd>{EXPERIENCE.length} internships</dd>
        <dt>Startup disk</dt>
        <dd>{PROJECTS[0].name}</dd>
        <dt>Serial number</dt>
        <dd>{PROFILE.email}</dd>
        <dt>macOS</dt>
        <dd>Sierra</dd>
      </dl>
    </div>
  );
}

// sleep, shut down and the lock screen, as screens laid over the whole desk
function Overlay({ kind, onWake }) {
  const now = useNow();
  useEffect(() => {
    if (kind === 'restart') {
      const t = setTimeout(() => window.location.reload(), 2600);
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
      {kind === 'restart' && (
        <span className="boot" aria-hidden="true">
          <AppleLogo size={72} />
          <span className="boot-bar">
            <i />
          </span>
        </span>
      )}
    </div>
  );
}

// the confirmation a Mac asks before restarting or shutting down; restarts by itself after 60s
function Confirm({ kind, onYes, onNo }) {
  const [left, setLeft] = useState(60);
  useEffect(() => {
    if (left <= 0) {
      onYes();
      return undefined;
    }
    const t = setTimeout(() => setLeft(left - 1), 1000);
    return () => clearTimeout(t);
  }, [left, onYes]);
  const verb = kind === 'restart' ? 'restart' : 'shut down';
  return (
    <div className="confirm-back">
      <div className="confirm" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title">
        <AppleLogo size={34} />
        <h2 id="confirm-title">Are you sure you want to {verb} your computer now?</h2>
        <p>
          This dialog will {verb} automatically in {left} seconds.
        </p>
        <button type="button" className="confirm-yes" onClick={onYes} autoFocus>
          {kind === 'restart' ? 'Restart' : 'Shut Down'}
        </button>
        <button type="button" onClick={onNo}>
          Cancel
        </button>
      </div>
    </div>
  );
}

function TextEdit({ file }) {
  return (
    <div className="textedit">
      {file.text.split('\n\n').map((para, i) => (
        <p key={i}>{para}</p>
      ))}
    </div>
  );
}

const DOCK = [
  { id: 'finder', app: 'finder' },
  { id: 'notes', app: 'notes' },
  { id: 'claude', app: 'claude' },
  ...SOCIALS.map((s) => ({ id: s.label.toLowerCase(), app: s.label.toLowerCase() })),
  { id: 'messages', app: 'messages' },
  { id: 'weather', app: 'weather' },
  { id: 'mail', label: 'Mail', href: `mailto:${PROFILE.email}` },
  { id: 'terminal', app: 'terminal' },
  { id: 'settings', app: 'settings' },
  { sep: true },
  { id: 'trash', label: 'Bin', app: 'finder', folder: 'Bin' },
];

// The dock, magnified the way a Mac's is. The curve is the one PuruVJ/macos-web uses (twice the
// width under the pointer, easing to normal six icons away); a spring from Motion smooths every
// change, so the icons glide rather than jump. An app bounces as it opens.
const BASE = 54;
const LIMIT = BASE * 6;
const DISTANCE = [-LIMIT, -LIMIT / 1.25, -LIMIT / 2, 0, LIMIT / 2, LIMIT / 1.25, LIMIT];
const WIDTH = [BASE, BASE * 1.1, BASE * 1.414, BASE * 2, BASE * 1.414, BASE * 1.1, BASE];

function DockItem({ d, mouseX, label, open, onLaunch }) {
  const ref = useRef(null);
  const [bounce, setBounce] = useState(0);
  const distance = useTransform(mouseX, (x) => {
    const r = ref.current?.getBoundingClientRect();
    return r ? x - (r.left + r.width / 2) : LIMIT + 1;
  });
  const target = useTransform(distance, DISTANCE, WIDTH, { clamp: true });
  const width = useSpring(target, { mass: 0.1, stiffness: 170, damping: 12 });

  const launch = () => {
    if (d.app && !open) setBounce((n) => n + 1);
    onLaunch();
  };

  const inner = (
    <>
      <motion.span
        key={bounce}
        className="dock-lift"
        initial={false}
        animate={bounce ? { y: [0, -34, 0, -16, 0] } : { y: 0 }}
        transition={{ duration: 0.95, ease: 'easeInOut' }}
      >
        <AppIcon id={d.id} />
      </motion.span>
      <span className="dock-tip">{label}</span>
      {d.app && !d.folder && open && <span className="dock-dot" aria-hidden="true" />}
    </>
  );
  return d.href ? (
    <motion.a ref={ref} className="dock-item" style={{ width }} href={d.href} aria-label={label} {...(d.external ? { target: '_blank', rel: 'noreferrer' } : {})}>
      {inner}
    </motion.a>
  ) : (
    <motion.button ref={ref} type="button" className="dock-item" style={{ width }} onClick={launch} aria-label={label}>
      {inner}
    </motion.button>
  );
}

function Dock({ wins, onApp }) {
  const mouseX = useMotionValue(Infinity);
  const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  return (
    <nav
      className="dock"
      aria-label="Dock"
      onMouseMove={(e) => !reduce && mouseX.set(e.clientX)}
      onMouseLeave={() => mouseX.set(Infinity)}
    >
      {DOCK.map((d, i) =>
        d.sep ? (
          <span key={`sep${i}`} className="dock-sep" aria-hidden="true" />
        ) : (
          <DockItem
            key={d.id}
            d={d}
            mouseX={mouseX}
            label={d.label || NAMES[d.app]}
            open={!!(d.app && wins[d.app]?.open)}
            onLaunch={() => onApp(d.app, d.folder)}
          />
        )
      )}
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
      claude: { open: roomy, z: 4 },
      notes: { open: true, z: 5 },
      finder: { open: false, z: 1 },
      weather: { open: false, z: 1 },
      aboutmac: { open: false, z: 1 },
      terminal: { open: false, z: 1 },
      readme: { open: false, z: 1 },
      github: { open: false, z: 1 },
      linkedin: { open: false, z: 1 },
      twitter: { open: false, z: 1 },
    };
  });
  const [folder, setFolder] = useState('Documents');
  const [menu, setMenu] = useState(null);
  const [overlay, setOverlay] = useState(null);
  const [settingsPage, setSettingsPage] = useState('general');
  const [confirm, setConfirm] = useState(null);
  const [panel, setPanel] = useState(null);
  const [textFile, setTextFile] = useState({ name: 'read-me.txt', text: README });
  const weather = useWeather();
  const battery = useBattery();

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
    if (app === 'finder') setFolder(f || 'Recents');
    focus(app);
  };
  // a file from Finder or Terminal opens in the app it belongs to
  const openFile = (it) => {
    if (it.app) onApp(it.app);
    else if (it.note) showNote(it.note);
    else if (it.href) window.open(it.href, '_blank', 'noreferrer');
    else if (it.text) {
      setTextFile({ name: it.name, text: it.text });
      focus('readme');
    }
  };

  useEffect(() => {
    const onResize = () => setFrames(initialFrames());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (!menu && !panel) return undefined;
    const close = (e) => {
      if (!e.target.closest('.menu')) setMenu(null);
      if (!e.target.closest('.status')) setPanel(null);
    };
    const key = (e) => {
      if (e.key !== 'Escape') return;
      setMenu(null);
      setPanel(null);
    };
    window.addEventListener('pointerdown', close);
    window.addEventListener('keydown', key);
    return () => {
      window.removeEventListener('pointerdown', close);
      window.removeEventListener('keydown', key);
    };
  }, [menu, panel]);

  const apps = {
    finder: <FinderApp key={folder} start={folder} resume={resume} onOpen={openFile} />,
    notes: <NotesApp layout="desktop" noteId={noteId} onOpen={showNote} resume={resume} />,
    messages: <MessagesApp layout="desktop" />,
    claude: <ClaudeApp layout="desktop" />,
    settings: <SettingsApp key={settingsPage} layout="desktop" resume={resume} start={settingsPage} />,
    terminal: <TerminalApp layout="desktop" openNote={showNote} openApp={onApp} openFile={openFile} resume={resume} />,
    readme: <TextEdit file={textFile} />,
    weather: <WeatherApp />,
    aboutmac: <AboutMac />,
    github: <SocialApp network="github" />,
    linkedin: <SocialApp network="linkedin" />,
    twitter: <SocialApp network="twitter" />,
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
      item('About This Mac', () => focus('aboutmac')),
      item('System Settings…', () => {
        setSettingsPage('general');
        focus('settings');
      }),
      <li key="s1" className="menu-sep" role="separator" />,
      item('Sleep', () => setOverlay('sleep')),
      item('Restart…', () => setConfirm('restart')),
      item('Shut Down…', () => setConfirm('off')),
      <li key="s2" className="menu-sep" role="separator" />,
      item('Lock Screen', () => setOverlay('lock')),
      item(`Log Out ${PROFILE.name}…`, () => {
        setWins((w) => Object.fromEntries(Object.entries(w).map(([k, v]) => [k, { ...v, open: false, zoomed: false }])));
        setOverlay('lock');
      }),
    ],
    File: [
      item('New Message', () => focus('messages')),
      item('Open read-me.txt', () => openFile({ name: 'read-me.txt', text: README })),
      item('Close Window', () => focused && patch(focused, { open: false, zoomed: false })),
    ],
    Edit: [item('Copy Email Address', () => navigator.clipboard?.writeText(PROFILE.email))],
    View: [
      item('Zoom Window', () => focused && patch(focused, { zoomed: !wins[focused].zoomed })),
      item('Show All Windows', () => Object.keys(NAMES).forEach((a) => a !== 'readme' && focus(a))),
    ],
    Window: Object.keys(NAMES).map((a) => item(`${wins[a].open && !wins[a].min ? '✓ ' : ''}${a === 'readme' ? textFile.name : NAMES[a]}`, () => onApp(a))),
    Help: [item('Read me', () => openFile({ name: 'read-me.txt', text: README })), item('Ask Claude about Dev', () => focus('claude'))],
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
          {menuButton('mark', <AppleLogo size={15} />, { className: 'menu-mark', 'aria-label': 'Apple menu' })}
          <strong className="menubar-app">{NAMES[focused] || 'Finder'}</strong>
          {['File', 'Edit', 'View', 'Window', 'Help'].map((m) => menuButton(m))}
        </div>
        <div className="menubar-right">
          {weather.cities && (
            <button type="button" className="status" onClick={() => onApp('weather')} aria-label="Weather">
              {describe(weather.cities[0].current.weather_code).icon} {Math.round(weather.cities[0].current.temperature_2m)}°C
            </button>
          )}
          {[
            ['sound', <Sound key="s" />, 'Sound'],
            [null, <Mirror key="m" />, 'Screen mirroring'],
            ['wifi', <Wifi key="w" />, 'Wi-Fi'],
            [null, <Bluetooth key="b" />, 'Bluetooth', () => { setSettingsPage('bluetooth'); focus('settings'); }],
            ['battery', <BatteryLevel key="bt" />, 'Battery'],
            [null, <ControlCentre key="c" />, 'Control Centre', () => { setSettingsPage('general'); focus('settings'); }],
            ['clock', <Clock key="k" />, 'Date and time'],
          ].map(([kind, glyph, label, run], i) => (
            <div className="status" key={label}>
              <button
                type="button"
                aria-label={label}
                aria-expanded={kind ? panel === kind : undefined}
                className={panel && panel === kind ? 'is-open' : undefined}
                onClick={() => (kind ? setPanel(panel === kind ? null : kind) : run?.())}
              >
                {glyph}
              </button>
              {kind && panel === kind && (
                <StatusPanel kind={kind} weather={weather} battery={battery} openApp={(a) => { setPanel(null); onApp(a); }} />
              )}
            </div>
          ))}
        </div>
      </header>

      <div className="desk-icons">
        <button
          type="button"
          className="desk-icon"
          onDoubleClick={() => openFile({ name: 'read-me.txt', text: README })}
          onKeyDown={(e) => e.key === 'Enter' && openFile({ name: 'read-me.txt', text: README })}
        >
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
            title={app === 'readme' ? textFile.name : NAMES[app]}
            caption={app === 'readme' ? textFile.name : CAPTIONS[app]}
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
      {confirm && (
        <Confirm
          kind={confirm}
          onNo={() => setConfirm(null)}
          onYes={() => {
            setConfirm(null);
            setOverlay(confirm);
          }}
        />
      )}
      {overlay && <Overlay kind={overlay} onWake={() => setOverlay(null)} />}
    </div>
  );
}
