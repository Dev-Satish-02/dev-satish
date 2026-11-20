import { useMemo, useState } from 'react';
import { HOME, makeFS } from '../lib/fs';
import { AppIcon, Folder, SearchGlyph } from '../icons';

/* Finder, laid out like the real one: a sidebar of places and tags, a toolbar, a grid of files
   and a status bar. Double-click (or Enter) opens a file in the app it belongs to. */

const SIDEBAR = [
  [null, ['Recents']],
  ['Favourites', ['Applications', 'Desktop', 'Documents', 'Downloads']],
  ['Tags', ['Portfolio', 'Important', 'Ideas']],
  ['Locations', ['iCloud Drive', HOME, 'AirDrop', 'Bin']],
];
const TAG = { Portfolio: '#0a84ff', Important: '#ff453a', Ideas: '#ffd60a' };
const GLYPH = { Recents: '🕘', Applications: '🅰︎', Desktop: '🖥', Documents: '📄', Downloads: '⬇︎', 'iCloud Drive': '☁︎', [HOME]: '⌂', AirDrop: '◎', Bin: '🗑' };
const APP_ICON = { spotify: 'spotify', weather: 'weather', github: 'github', linkedin: 'linkedin', twitter: 'twitter' };

function ItemIcon({ item }) {
  if (item.type === 'dir') return <Folder />;
  if (item.type === 'app') return <AppIcon id={APP_ICON[item.app] || item.app} />;
  if (item.ext === 'pdf') return <AppIcon id="resume" />;
  if (item.ext === 'note') return <AppIcon id="notes" />;
  return <AppIcon id="readme" />;
}

export default function FinderApp({ start = 'Recents', resume, onOpen }) {
  const fs = useMemo(() => makeFS(resume), [resume]);
  const [trail, setTrail] = useState([{ place: start }]);
  const [at, setAt] = useState(0);
  const [picked, setPicked] = useState(null);
  const [view, setView] = useState('grid');
  const [q, setQ] = useState('');

  const here = trail[at];
  const items = here.dir ? here.dir.children : fs.places[here.place] || [];
  const shown = items.filter((it) => !q || it.name.toLowerCase().includes(q.toLowerCase()));
  const title = here.dir ? here.dir.name : here.place;

  const go = (next) => {
    setTrail((t) => [...t.slice(0, at + 1), next]);
    setAt(at + 1);
    setPicked(null);
    setQ('');
  };
  const open = (it) => (it.type === 'dir' ? go({ dir: it }) : onOpen(it));

  return (
    <div className="finder">
      <aside className="finder-side">
        {SIDEBAR.map(([group, places]) => (
          <div key={group || 'top'}>
            {group && <p className="finder-side-title">{group}</p>}
            {places.map((p) => (
              <button key={p} type="button" className={here.place === p && !here.dir ? 'is-current' : undefined} onClick={() => go({ place: p })}>
                {TAG[p] ? (
                  <span className="tag-dot" style={{ background: TAG[p] }} aria-hidden="true" />
                ) : (
                  <span className="finder-glyph" aria-hidden="true">
                    {GLYPH[p]}
                  </span>
                )}
                {p}
              </button>
            ))}
          </div>
        ))}
      </aside>
      <div className="finder-main">
        <header className="finder-head">
          <button type="button" className="finder-nav" disabled={at === 0} onClick={() => setAt(at - 1)} aria-label="Back">
            ‹
          </button>
          <button type="button" className="finder-nav" disabled={at >= trail.length - 1} onClick={() => setAt(at + 1)} aria-label="Forward">
            ›
          </button>
          <strong>{title}</strong>
          <span className="finder-views" role="group" aria-label="View">
            <button type="button" className={view === 'grid' ? 'is-on' : undefined} onClick={() => setView('grid')} aria-label="Icons">
              ▦
            </button>
            <button type="button" className={view === 'list' ? 'is-on' : undefined} onClick={() => setView('list')} aria-label="List">
              ☰
            </button>
          </span>
          <label className="finder-search">
            <SearchGlyph />
            <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" aria-label={`Search ${title}`} />
          </label>
        </header>
        {here.place === 'AirDrop' ? (
          <p className="finder-empty">
            <span aria-hidden="true">◎</span>
            AirDrop lets you share instantly with people nearby.
            <br />
            Nobody is nearby right now.
          </p>
        ) : shown.length === 0 ? (
          <p className="finder-empty">
            <Folder className="finder-empty-icon" />
            {q ? `No results for “${q}”` : 'This folder is empty.'}
          </p>
        ) : (
          <ul className={view === 'grid' ? 'finder-grid' : 'finder-list'}>
            {shown.map((it) => (
              <li key={`${it.name}-${it.note || it.app || it.ext || 'dir'}`}>
                <button
                  type="button"
                  className={`finder-item${picked === it ? ' is-picked' : ''}`}
                  onClick={() => setPicked(it)}
                  onDoubleClick={() => open(it)}
                  onKeyDown={(e) => e.key === 'Enter' && open(it)}
                  title="Double-click to open"
                >
                  <ItemIcon item={it} />
                  <span>{it.type === 'file' && it.ext !== 'note' && !it.name.includes('.') ? `${it.name}.${it.ext}` : it.name}</span>
                  {view === 'list' && <em>{it.type === 'dir' ? 'Folder' : it.type === 'app' ? 'Application' : it.ext === 'note' ? 'Note' : it.ext.toUpperCase()}</em>}
                </button>
              </li>
            ))}
          </ul>
        )}
        <footer className="finder-status">
          {shown.length} {shown.length === 1 ? 'item' : 'items'}
        </footer>
      </div>
    </div>
  );
}
