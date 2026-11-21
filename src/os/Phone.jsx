import { useEffect, useRef, useState } from 'react';
import { PROFILE, SOCIALS, SPOTIFY } from '../data/content';
import { NOTES } from './notes';
import { AppIcon, Battery, SearchGlyph, Signal, Wifi } from './icons';
import { describe, useWeather } from './lib/weather';
import Wallpaper from './Wallpaper';
import NotesApp from './apps/NotesApp';
import MessagesApp from './apps/MessagesApp';
import ClaudeApp from './apps/ClaudeApp';
import SettingsApp from './apps/SettingsApp';
import SpotifyApp from './apps/SpotifyApp';
import WeatherApp from './apps/WeatherApp';
import SocialApp from './apps/SocialApp';
import PreviewApp from './apps/PreviewApp';

/* On a phone the desk becomes an iPhone home screen: widgets and apps up top, four apps in the
   dock below. Each app opens full screen out of its icon and has its own way back home. */

const base = import.meta.env.BASE_URL;
const firstPost = NOTES.find((n) => n.group === 'Writing')?.id;
const NAMES = { preview: 'Résumé', notes: 'Notes', messages: 'Messages', claude: 'Claude', settings: 'Settings', spotify: 'Spotify', weather: 'Weather', github: 'GitHub', linkedin: 'LinkedIn', twitter: 'X' };

function useTime() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 15000);
    return () => clearInterval(t);
  }, []);
  return now;
}

function WeatherWidget({ onOpen }) {
  const { cities } = useWeather();
  const c = cities?.[0];
  const d = c && describe(c.current.weather_code);
  return (
    <button type="button" className="wd wd-weather" onClick={onOpen} aria-label="Weather in Pilani">
      <strong>Pilani</strong>
      <b>{c ? `${Math.round(c.current.temperature_2m)}°` : '--°'}</b>
      <span>
        {d ? `${d.icon} ${d.label}` : 'Forecast'}
        <br />
        {c ? `H:${Math.round(c.daily.temperature_2m_max[0])}° L:${Math.round(c.daily.temperature_2m_min[0])}°` : ''}
      </span>
    </button>
  );
}

function SpotifyWidget({ onOpen }) {
  return (
    <button type="button" className="wd wd-spotify" onClick={onOpen} aria-label="Dev's playlists on Spotify">
      <span className="wd-sp-head">
        <AppIcon id="spotify" />
        <span>
          <strong>Spotify</strong>
          <em>{SPOTIFY.playlists.length} playlists</em>
        </span>
      </span>
      <span className="wd-covers">
        {SPOTIFY.playlists.slice(0, 3).map((p) => (
          <img key={p.id} src={`${base}images/spotify/${p.id}.jpg`} alt="" />
        ))}
      </span>
    </button>
  );
}

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

  // Notes' "View résumé" (and anything else) can open an app by name
  useEffect(() => {
    const open = (e) => {
      setOrigin('50% 50%');
      setLeaving(false);
      setApp(e.detail);
    };
    window.addEventListener('open-app', open);
    return () => window.removeEventListener('open-app', open);
  }, []);

  const time = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

  const grid = [
    { id: 'notes', label: 'Notes', go: (e) => launch(e, 'notes', null) },
    { id: 'claude', label: 'Claude', go: (e) => launch(e, 'claude') },
    { id: 'spotify', label: 'Spotify', go: (e) => launch(e, 'spotify') },
    { id: 'weather', label: 'Weather', go: (e) => launch(e, 'weather') },
    { id: 'experience', label: 'Experience', go: (e) => launch(e, 'notes', 'experience') },
    { id: 'projects', label: 'Projects', go: (e) => launch(e, 'notes', 'projects') },
    { id: 'skills', label: 'Skills and education', go: (e) => launch(e, 'notes', 'skills') },
    { id: 'writing', label: 'Writing', go: (e) => launch(e, 'notes', firstPost) },
    ...SOCIALS.map((s) => ({ id: s.label.toLowerCase(), label: s.label === 'Twitter' ? 'X' : s.label, go: (e) => launch(e, s.label.toLowerCase()) })),
    { id: 'settings', label: 'Settings', go: (e) => launch(e, 'settings') },
  ];
  const dock = [
    { id: 'phone', label: 'Phone', href: PROFILE.phoneHref },
    { id: 'mail', label: 'Mail', href: `mailto:${PROFILE.email}` },
    { id: 'messages', label: 'Messages', go: (e) => launch(e, 'messages') },
    resume
      ? { id: 'cv', label: 'Résumé', go: (e) => launch(e, 'preview') }
      : { id: 'contacts', label: 'About Dev', go: (e) => launch(e, 'notes', 'about') },
  ];

  // icons carry no visible label, as asked; the name is still there for screen readers
  const icon = (a) =>
    a.href ? (
      <a
        key={a.id}
        className="ph-icon"
        href={a.href}
        aria-label={a.label}
        download={a.download}
        {...(a.external ? { target: '_blank', rel: 'noreferrer' } : {})}
      >
        <AppIcon id={a.id} />
      </a>
    ) : (
      <button key={a.id} type="button" className="ph-icon" onClick={a.go} aria-label={a.label}>
        <AppIcon id={a.id} />
      </button>
    );

  return (
    <div className="phone">
      <Wallpaper />
      <div className="ph-status" aria-hidden="true">
        <span className="ph-time">{time}</span>
        <span className="ph-island" />
        <span className="ph-glyphs">
          <Signal />
          <Wifi />
          <Battery />
        </span>
      </div>

      <main className="ph-home" aria-label="Home screen" inert={app ? true : undefined}>
        <div className="ph-page">
          <div className="ph-widgets">
            <WeatherWidget onOpen={(e) => launch(e, 'weather')} />
            <SpotifyWidget onOpen={(e) => launch(e, 'spotify')} />
          </div>
          <div className="ph-grid">{grid.map(icon)}</div>
        </div>
        <button type="button" className="ph-search" onClick={(e) => launch(e, 'notes', null, true)}>
          <SearchGlyph /> Search
        </button>
        <nav className="ph-dock" aria-label="Dock">
          {dock.map(icon)}
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
          aria-label={NAMES[app]}
          onKeyDown={(e) => e.key === 'Escape' && home()}
        >
          {app === 'notes' && (
            <NotesApp layout="phone" noteId={noteId} onOpen={openNote} onClose={home} resume={resume} searchFirst={searchFirst} />
          )}
          {app === 'messages' && <MessagesApp layout="phone" onClose={home} />}
          {app === 'claude' && <ClaudeApp layout="phone" onClose={home} />}
          {app === 'settings' && <SettingsApp layout="phone" onClose={home} resume={resume} />}
          {app === 'spotify' && <SpotifyApp layout="phone" onClose={home} />}
          {app === 'weather' && <WeatherApp layout="phone" onClose={home} />}
          {app === 'preview' && <PreviewApp layout="phone" onClose={home} />}
          {['github', 'linkedin', 'twitter'].includes(app) && <SocialApp network={app} layout="phone" onClose={home} />}
        </div>
      )}
    </div>
  );
}
