import { useEffect, useRef, useState } from 'react';
import { EXPERIENCE, PROFILE, PROJECTS } from '../../data/content';
import { SearchGlyph } from '../icons';

/* Messages. The pinned chat is with Dev: write to him and your mail app opens with the message
   ready to send. The other threads are Dev's own recaps of each role and project. */

const initials = (s) =>
  s
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

const THREADS = [
  {
    id: 'dev',
    name: PROFILE.name,
    short: 'Dev',
    pinned: true,
    time: 'now',
    messages: [
      'hey, thanks for stopping by 👋',
      "I'm Dev. I study at BITS Pilani; most recently I built an AI research workspace at Callistra AI that processes 10,000+ documents, and on campus I launched the Yearbook Portal (INR 7L+ in revenue).",
      "if you're hiring for product, strategy or engineering, or just want to talk, send me a message here.",
    ],
  },
  ...EXPERIENCE.map((e) => ({
    id: e.company,
    name: e.company,
    short: e.company.split(' ')[0],
    pinned: e === EXPERIENCE[0],
    time: e.date.split(' to ')[1] || e.date,
    about: `${e.role}, ${e.date}`,
    messages: [`quick recap of my time at ${e.company}, as ${e.role} 👇`, ...e.bullets],
  })),
  ...PROJECTS.map((p) => ({
    id: p.name,
    name: p.name,
    short: p.name.replace(/^BITS /, '').split(' ')[0],
    pinned: p === PROJECTS[0],
    time: p.metric,
    about: p.metric,
    messages: [`${p.name}: ${p.kind.toLowerCase()} 👇`, ...(p.bullets || [p.blurb]), ...p.links.map((l) => `${l.label}: ${l.href}`)],
  })),
];

function mailto(body, thread) {
  const subject = encodeURIComponent(thread.id === 'dev' ? 'Hello from your portfolio' : `About ${thread.name}`);
  return `mailto:${PROFILE.email}?subject=${subject}&body=${encodeURIComponent(body)}`;
}

function Linkified({ text }) {
  const m = text.match(/(https?:\/\/\S+)/);
  if (!m) return text;
  const [before, after] = text.split(m[1]);
  return (
    <>
      {before}
      <a href={m[1]} target="_blank" rel="noreferrer">
        {m[1]}
      </a>
      {after}
    </>
  );
}

function Chat({ thread, sent, onSend, phone, onBack }) {
  const [draft, setDraft] = useState('');
  const end = useRef(null);
  const mine = sent[thread.id] || [];

  useEffect(() => {
    end.current?.scrollIntoView({ block: 'end' });
  }, [thread.id, mine.length]);

  const send = (e) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setDraft('');
    onSend(thread.id, text);
    window.location.href = mailto(text, thread);
  };

  return (
    <div className="chat">
      <header className="chat-head">
        {phone && (
          <button type="button" className="ph-back" onClick={onBack} aria-label="Back to conversations">
            <span aria-hidden="true">‹</span>
          </button>
        )}
        <span className="chat-to-label">To:</span>
        <span className="chat-to">{phone ? thread.name : PROFILE.name}</span>
        {thread.about && <span className="chat-about">{phone ? thread.about : `${thread.name}, ${thread.about}`}</span>}
      </header>
      <ol className="bubbles" aria-live="polite">
        {thread.messages.map((t, i) => (
          <li key={i} className="bubble from-dev">
            <Linkified text={t} />
          </li>
        ))}
        {mine.map((t, i) => [
          <li key={`y${i}`} className="bubble from-you">
            {t}
          </li>,
          <li key={`r${i}`} className="bubble from-dev">
            opening your mail app with this, so it lands in my inbox 📬
            <a className="bubble-link" href={mailto(t, thread)}>
              Didn&apos;t open? Email it instead
            </a>
          </li>,
        ])}
        {mine.length > 0 && <li className="bubble-status">Delivered</li>}
        <li ref={end} aria-hidden="true" />
      </ol>
      <form className="compose" onSubmit={send}>
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="iMessage"
          aria-label={`Message to ${PROFILE.name}`}
        />
        <button type="submit" className="send" aria-label="Send" disabled={!draft.trim()}>
          ↑
        </button>
      </form>
    </div>
  );
}

export default function MessagesApp({ layout, onClose }) {
  const phone = layout === 'phone';
  const [current, setCurrent] = useState(phone ? null : 'dev');
  const [sent, setSent] = useState({});
  const [q, setQ] = useState('');
  const onSend = (id, text) => setSent((s) => ({ ...s, [id]: [...(s[id] || []), text] }));

  const thread = THREADS.find((t) => t.id === current);
  const shown = THREADS.filter((t) => !q || `${t.name} ${t.messages.join(' ')}`.toLowerCase().includes(q.toLowerCase()));
  const pinned = shown.filter((t) => t.pinned);
  const rest = shown.filter((t) => !t.pinned);
  // the line a conversation shows in the list: what you sent last, else the gist of the thread
  const last = (t) => (sent[t.id]?.length ? sent[t.id][sent[t.id].length - 1] : t.id === 'dev' ? t.messages[t.messages.length - 1] : t.messages[1]);

  if (phone && thread) {
    return (
      <div className="ph-app ph-messages">
        <Chat thread={thread} sent={sent} onSend={onSend} phone onBack={() => setCurrent(null)} />
      </div>
    );
  }

  const list = (
    <aside className="messages-side">
      {phone && (
        <>
          <div className="ph-nav">
            <button type="button" className="ph-back" onClick={onClose} aria-label="Back">
              <span aria-hidden="true">‹</span>
            </button>
          </div>
          <h1 className="ph-large-title">Messages</h1>
        </>
      )}
      <label className="notes-search">
        <SearchGlyph />
        <input type="search" placeholder="Search" aria-label="Search conversations" value={q} onChange={(e) => setQ(e.target.value)} />
      </label>
      <div className="msg-scroll">
        {pinned.length > 0 && (
          <ul className="pins" aria-label="Pinned">
            {pinned.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  className={`pin${t.id === current ? ' is-current' : ''}`}
                  onClick={() => setCurrent(t.id)}
                >
                  <span className="pin-peek" aria-hidden="true">
                    {t.messages[0]}
                  </span>
                  <span className="avatar avatar-pin" aria-hidden="true">
                    {initials(t.name)}
                  </span>
                  <span className="pin-name">{t.short}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
        <ul className="convos" aria-label="Conversations">
          {rest.map((t) => (
            <li key={t.id}>
              <button type="button" className={`convo${t.id === current ? ' is-current' : ''}`} onClick={() => setCurrent(t.id)}>
                <span className="avatar" aria-hidden="true">
                  {initials(t.name)}
                </span>
                <span className="convo-text">
                  <span className="convo-top">
                    <strong>{t.name}</strong>
                    <span>{t.time}</span>
                  </span>
                  <span className="convo-last">{last(t)}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );

  if (phone) return <div className="ph-app ph-messages-list">{list}</div>;

  return (
    <div className="messages">
      {list}
      {thread && <Chat thread={thread} sent={sent} onSend={onSend} />}
    </div>
  );
}
