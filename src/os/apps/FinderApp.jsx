import { useState } from 'react';
import { NOTES } from '../notes';
import { AppIcon } from '../icons';

/* Finder: the same notes, as files in folders. Double-click (or Enter) opens one. */

export default function FinderApp({ start = 'Documents', openNote, openApp, resume }) {
  const [folder, setFolder] = useState(start);
  const [picked, setPicked] = useState(null);

  const FOLDERS = {
    Desktop: [
      { id: 'readme', name: 'read-me.txt', icon: 'readme', open: () => openApp('readme') },
      ...(resume ? [{ id: 'resume', name: 'resume.pdf', icon: 'resume', href: resume }] : []),
    ],
    Documents: NOTES.filter((n) => n.group !== 'Writing').map((n) => ({
      id: n.id,
      name: n.title,
      icon: 'notes',
      open: () => openNote(n.id),
    })),
    Writing: NOTES.filter((n) => n.group === 'Writing').map((n) => ({
      id: n.id,
      name: n.title,
      icon: 'writing',
      open: () => openNote(n.id),
    })),
    Trash: [],
  };
  const items = FOLDERS[folder];

  const go = (it) => {
    if (it.href) window.open(it.href, '_blank', 'noreferrer');
    else it.open();
  };

  return (
    <div className="finder">
      <aside className="finder-side">
        <p className="finder-side-title">Favourites</p>
        {Object.keys(FOLDERS).map((f) => (
          <button
            key={f}
            type="button"
            className={f === folder ? 'is-current' : undefined}
            onClick={() => {
              setFolder(f);
              setPicked(null);
            }}
          >
            <span aria-hidden="true">{f === 'Trash' ? '🗑' : f === 'Desktop' ? '🖥' : '📁'}</span> {f}
          </button>
        ))}
      </aside>
      <div className="finder-main">
        <header className="finder-head">
          <strong>{folder}</strong>
          <span>{items.length ? `${items.length} items` : ''}</span>
        </header>
        {items.length === 0 ? (
          <p className="finder-empty">{folder} is empty</p>
        ) : (
          <ul className="finder-grid">
            {items.map((it) => (
              <li key={it.id}>
                <button
                  type="button"
                  className={`finder-item${picked === it.id ? ' is-picked' : ''}`}
                  onClick={() => setPicked(it.id)}
                  onDoubleClick={() => go(it)}
                  onKeyDown={(e) => e.key === 'Enter' && go(it)}
                  title="Double-click to open"
                >
                  <AppIcon id={it.icon} />
                  <span>{it.name}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
