import { useState } from 'react';
import { EDUCATION, EXPERIENCE, PROFILE, PROJECTS, SKILL_GROUPS, SOCIALS } from '../../data/content';
import { SearchGlyph } from '../icons';

/* System Settings, filled with Dev instead of a Mac: About is his spec sheet, Software Update
   his latest role, Storage his skills, Wi-Fi his profiles, Bluetooth the tools he pairs with. */

const COLORS = ['#0a84ff', '#30d158', '#ff9f0a', '#bf5af2', '#ff375f'];
const TOOLS = [...new Set([...EXPERIENCE.flatMap((e) => e.tags), ...PROJECTS.flatMap((p) => p.stack)])];

function Glyph({ id }) {
  const bg = { appearance: '#1c1c1e', wifi: '#0a84ff', bluetooth: '#0a84ff', general: '#8e8e93', about: '#8e8e93', update: '#8e8e93', storage: '#8e8e93' }[id];
  const ch = { appearance: '◐', wifi: '◠', bluetooth: 'ᛒ', general: '⚙', about: 'i', update: '↻', storage: '▤' }[id];
  return (
    <span className="set-glyph" style={{ background: bg }} aria-hidden="true">
      {ch}
    </span>
  );
}

function Rows({ rows }) {
  return (
    <ul className="set-rows">
      {rows.map(([k, v]) => (
        <li key={k}>
          <span>{k}</span>
          <span className="set-val">{v}</span>
        </li>
      ))}
    </ul>
  );
}

function About({ resume }) {
  return (
    <>
      <div className="set-hero">
        <span className="avatar avatar-xl" aria-hidden="true">
          DS
        </span>
        <h3>{PROFILE.name}</h3>
        <p>{PROFILE.title}</p>
      </div>
      <Rows
        rows={[
          ['Studying', EDUCATION.map((e) => e.degree).join(', ')],
          ['At', `${EDUCATION[0].school}, since 2023`],
          ['Location', PROFILE.location],
          ['Internships', String(EXPERIENCE.length)],
          ['Projects shipped', String(PROJECTS.length)],
          ['Email', <a key="e" href={`mailto:${PROFILE.email}`}>{PROFILE.email}</a>],
          ...(resume ? [['Résumé', <a key="r" href={resume} target="_blank" rel="noreferrer">resume.pdf</a>]] : []),
        ]}
      />
    </>
  );
}

function Update() {
  const [now, ...before] = EXPERIENCE;
  return (
    <>
      <div className="set-hero">
        <span className="set-big-glyph" aria-hidden="true">
          ✓
        </span>
        <h3>Dev is up to date</h3>
        <p>
          Latest: {now.role} at {now.company}, {now.date}
        </p>
      </div>
      <ul className="set-notes">
        {now.bullets.map((b) => (
          <li key={b}>{b}</li>
        ))}
      </ul>
      <p className="set-caption">Earlier versions</p>
      <Rows rows={before.map((e) => [`${e.company}, ${e.role}`, e.date])} />
    </>
  );
}

function Storage() {
  const total = SKILL_GROUPS.reduce((n, g) => n + g.items.length, 0);
  return (
    <>
      <p className="set-caption">
        {PROFILE.name}: {total} skills in {SKILL_GROUPS.length} groups
      </p>
      <div className="set-bar" role="img" aria-label="Skills by group">
        {SKILL_GROUPS.map((g, i) => (
          <span key={g.title} style={{ flex: g.items.length, background: COLORS[i % COLORS.length] }} />
        ))}
      </div>
      <ul className="set-legend">
        {SKILL_GROUPS.map((g, i) => (
          <li key={g.title}>
            <span className="dot" style={{ background: COLORS[i % COLORS.length] }} aria-hidden="true" />
            <span>
              <strong>{g.title}</strong>
              <span>{g.items.join(', ')}</span>
            </span>
          </li>
        ))}
      </ul>
    </>
  );
}

function Wifi() {
  return (
    <>
      <Rows rows={[['Wi-Fi', <span key="o" className="set-toggle is-on" aria-label="On" />]]} />
      <p className="set-caption">Known networks</p>
      <ul className="set-rows">
        {SOCIALS.map((s) => (
          <li key={s.href}>
            <a href={s.href} target="_blank" rel="noreferrer" className="set-link">
              <span>{s.label}</span>
              <span className="set-val">{s.href.replace(/^https?:\/\/(www\.)?/, '')} ›</span>
            </a>
          </li>
        ))}
      </ul>
    </>
  );
}

function Bluetooth() {
  const [on, setOn] = useState(true);
  return (
    <>
      <ul className="set-rows">
        <li>
          <span>Bluetooth</span>
          <button type="button" className={`set-toggle${on ? ' is-on' : ''}`} aria-pressed={on} aria-label="Bluetooth" onClick={() => setOn(!on)} />
        </li>
      </ul>
      <p className="set-caption">{on ? 'My devices: tools Dev has paired with on real work' : 'Bluetooth is off.'}</p>
      {on && <Rows rows={TOOLS.map((t) => [t, 'Connected'])} />}
    </>
  );
}

function Account() {
  return (
    <>
      <div className="set-hero">
        <span className="avatar avatar-xl" aria-hidden="true">
          DS
        </span>
        <h3>{PROFILE.name}</h3>
        <p>{PROFILE.email}</p>
      </div>
      <Rows
        rows={[
          ['Name, phone, email', <a key="p" href={PROFILE.phoneHref}>{PROFILE.phone}</a>],
          ['Sign-in & security', 'Portfolio account'],
          ['Media & purchases', `${EXPERIENCE.length} internships, ${PROJECTS.length} projects`],
          ['iCloud', `${EDUCATION.length} degrees in progress`],
        ]}
      />
    </>
  );
}

const ACCENTS = [
  ['Blue', '#0a84ff'],
  ['Purple', '#bf5af2'],
  ['Pink', '#ff375f'],
  ['Orange', '#ff9f0a'],
  ['Green', '#30d158'],
  ['Graphite', '#8e8e93'],
];

function Appearance() {
  const [accent, setAccent] = useState(() => getComputedStyle(document.documentElement).getPropertyValue('--blue').trim());
  const pick = (c) => {
    document.documentElement.style.setProperty('--blue', c);
    setAccent(c);
  };
  return (
    <>
      <ul className="set-rows">
        <li>
          <span>Appearance</span>
          <span className="set-val">Dark</span>
        </li>
      </ul>
      <p className="set-caption">Accent colour</p>
      <div className="set-accents" role="radiogroup" aria-label="Accent colour">
        {ACCENTS.map(([name, c]) => (
          <button
            key={name}
            type="button"
            role="radio"
            aria-checked={accent === c}
            aria-label={name}
            className={accent === c ? 'is-on' : undefined}
            style={{ background: c }}
            onClick={() => pick(c)}
          />
        ))}
      </div>
    </>
  );
}

const PAGES = {
  account: { title: 'Account', Body: Account },
  wifi: { title: 'Wi-Fi', Body: Wifi },
  appearance: { title: 'Appearance', Body: Appearance },
  bluetooth: { title: 'Bluetooth', Body: Bluetooth },
  general: { title: 'General' },
  about: { title: 'About', Body: About, parent: 'general' },
  update: { title: 'Software Update', Body: Update, parent: 'general' },
  storage: { title: 'Storage', Body: Storage, parent: 'general' },
};

function General({ go }) {
  return (
    <ul className="set-rows set-nav">
      {['about', 'update', 'storage'].map((id) => (
        <li key={id}>
          <button type="button" onClick={() => go(id)}>
            <Glyph id={id} />
            <span>{PAGES[id].title}</span>
            <span className="set-val">›</span>
          </button>
        </li>
      ))}
    </ul>
  );
}

export default function SettingsApp({ layout, onClose, resume, start }) {
  const phone = layout === 'phone';
  const [page, setPage] = useState(start || (phone ? null : 'general'));
  const [q, setQ] = useState('');
  const P = page && PAGES[page];
  const side = ['wifi', 'bluetooth', 'general', 'appearance'].filter((id) => PAGES[id].title.toLowerCase().includes(q.toLowerCase()));

  const pane = P && (
    <div className="set-pane">
      <header className="set-head">
        {(P.parent || phone) && (
          <button type="button" className="set-back" onClick={() => setPage(P.parent || null)} aria-label="Back">
            ‹
          </button>
        )}
        <h2>{P.title}</h2>
      </header>
      <div className="set-body">{P.Body ? <P.Body resume={resume} /> : <General go={setPage} />}</div>
    </div>
  );

  if (phone && P) return <div className="ph-app ph-settings">{pane}</div>;

  const sidebar = (
    <aside className="set-side">
      {phone && (
        <>
          <div className="ph-nav">
            <button type="button" className="ph-back" onClick={onClose}>
              <span aria-hidden="true">‹</span> Home
            </button>
          </div>
          <h1 className="ph-large-title">Settings</h1>
        </>
      )}
      <label className="notes-search">
        <SearchGlyph />
        <input type="search" placeholder="Search" aria-label="Search settings" value={q} onChange={(e) => setQ(e.target.value)} />
      </label>
      <button type="button" className={`set-account${page === 'account' ? ' is-current' : ''}`} onClick={() => setPage('account')}>
        <span className="avatar" aria-hidden="true">
          DS
        </span>
        <span>
          <strong>{PROFILE.name}</strong>
          <span>Account</span>
        </span>
      </button>
      <ul className="set-side-list">
        {side.map((id) => (
          <li key={id}>
            <button
              type="button"
              className={page === id || PAGES[page]?.parent === id ? 'is-current' : undefined}
              onClick={() => setPage(id)}
            >
              <Glyph id={id} />
              {PAGES[id].title}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );

  if (phone) return <div className="ph-app ph-settings">{sidebar}</div>;

  return (
    <div className="settings">
      {sidebar}
      {pane}
    </div>
  );
}
