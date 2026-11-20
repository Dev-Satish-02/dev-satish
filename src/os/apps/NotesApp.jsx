import { useEffect, useRef, useState } from 'react';
import { GROUPS, NOTES, findNote, matches } from '../notes';
import { SearchGlyph } from '../icons';

function Search({ value, onChange, inputRef }) {
  return (
    <label className="notes-search">
      <SearchGlyph />
      <input
        ref={inputRef}
        type="search"
        placeholder="Search"
        aria-label="Search notes"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function NoteList({ q, current, onOpen, phone }) {
  const shown = NOTES.filter((n) => matches(n, q));
  if (!shown.length) return <p className="notes-empty">No notes match &ldquo;{q}&rdquo;.</p>;
  return GROUPS.map((g) => {
    const items = shown.filter((n) => n.group === g);
    if (!items.length) return null;
    return (
      <section key={g} className="notes-group" aria-label={g}>
        <h2 className="notes-group-title">{g}</h2>
        <ul className={phone ? 'notes-inset' : undefined}>
          {items.map((n) => (
            <li key={n.id}>
              <button
                type="button"
                className={`notes-item${n.id === current ? ' is-current' : ''}`}
                aria-current={n.id === current ? 'true' : undefined}
                onClick={() => onOpen(n.id)}
              >
                <span className="notes-item-title">
                  <span aria-hidden="true">{n.emoji}</span> {n.title}
                </span>
                <span className="notes-item-meta">
                  <span>{n.meta}</span> {n.preview}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>
    );
  });
}

function NoteBody({ note, onOpen, resume }) {
  const { Body } = note;
  return (
    <article className="note" aria-labelledby={`note-${note.id}`}>
      <p className="note-meta">{note.meta}</p>
      <h1 id={`note-${note.id}`} className="note-title">
        <span aria-hidden="true">{note.emoji}</span> {note.title}
      </h1>
      <div className="note-body">
        <Body open={onOpen} resume={resume} post={note.post} />
      </div>
    </article>
  );
}

/* Notes, laid out as a Mac window (sidebar beside the open note) or as the phone app (a list
   that pushes the note on top of itself). */
export default function NotesApp({ layout, noteId, onOpen, onClose, resume, searchFirst }) {
  const [q, setQ] = useState('');
  const pane = useRef(null);
  const search = useRef(null);
  const phone = layout === 'phone';
  const note = noteId ? findNote(noteId) : null;

  useEffect(() => {
    pane.current?.scrollTo(0, 0);
  }, [noteId]);

  useEffect(() => {
    if (searchFirst) search.current?.focus();
  }, [searchFirst]);

  if (phone) {
    if (note) {
      return (
        <div className="ph-app ph-notes" ref={pane}>
          <div className="ph-nav">
            <button type="button" className="ph-back" onClick={() => onOpen(null)}>
              <span aria-hidden="true">‹</span> Notes
            </button>
          </div>
          <NoteBody note={note} onOpen={onOpen} resume={resume} />
        </div>
      );
    }
    return (
      <div className="ph-app ph-notes" ref={pane}>
        <div className="ph-nav">
          <button type="button" className="ph-back" onClick={onClose}>
            <span aria-hidden="true">‹</span> Home
          </button>
        </div>
        <h1 className="ph-large-title">Notes</h1>
        <Search value={q} onChange={setQ} inputRef={search} />
        <NoteList q={q} current={null} onOpen={onOpen} phone />
        <p className="ph-count">{NOTES.length} notes</p>
      </div>
    );
  }

  return (
    <div className="notes">
      <aside className="notes-side">
        <Search value={q} onChange={setQ} inputRef={search} />
        <nav className="notes-list" aria-label="Notes">
          <NoteList q={q} current={note?.id} onOpen={onOpen} />
        </nav>
      </aside>
      <div className="notes-pane" ref={pane}>
        {note && <NoteBody note={note} onOpen={onOpen} resume={resume} />}
      </div>
    </div>
  );
}
