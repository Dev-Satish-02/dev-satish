import { useEffect, useRef, useState } from 'react';
import { PROFILE } from '../../data/content';

/* Messages: one conversation, with Dev. What you type and send opens your mail app with the
   message already written, so it actually reaches him. */

const OPENING = [
  { from: 'dev', text: 'hey, thanks for stopping by 👋' },
  {
    from: 'dev',
    text: "I'm Dev. I study at BITS Pilani and build products: a mess portal 2,000 students used in its first week, and a README generator with 500+ downloads a week.",
  },
  { from: 'dev', text: "if you're hiring for product, strategy or engineering, or just want to talk, send me a message here." },
];

function mailto(body) {
  const subject = encodeURIComponent('Hello from your portfolio');
  return `mailto:${PROFILE.email}?subject=${subject}&body=${encodeURIComponent(body)}`;
}

export default function MessagesApp({ layout, onClose }) {
  const [thread, setThread] = useState(OPENING);
  const [draft, setDraft] = useState('');
  const end = useRef(null);
  const phone = layout === 'phone';

  useEffect(() => {
    end.current?.scrollIntoView({ block: 'end' });
  }, [thread]);

  const send = (e) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setDraft('');
    setThread((t) => [
      ...t,
      { from: 'you', text },
      { from: 'dev', text: 'opening your mail app with this message, so it lands in my inbox 📬', mail: text },
    ]);
    window.location.href = mailto(text);
  };

  const last = thread[thread.length - 1];
  const lastYou = thread.map((m) => m.from).lastIndexOf('you');

  const chat = (
    <div className="chat">
      <header className="chat-head">
        {phone && (
          <button type="button" className="ph-back" onClick={onClose}>
            <span aria-hidden="true">‹</span>
          </button>
        )}
        <span className="avatar" aria-hidden="true">
          DS
        </span>
        <span className="chat-to">{PROFILE.name}</span>
      </header>
      <ol className="bubbles" aria-live="polite">
        {thread.map((m, i) => [
          <li key={i} className={`bubble from-${m.from}`}>
            {m.text}
            {m.mail && (
              <a className="bubble-link" href={mailto(m.mail)}>
                Didn&apos;t open? Email it instead
              </a>
            )}
          </li>,
          i === lastYou && (
            <li key={`s${i}`} className="bubble-status">
              Delivered
            </li>
          ),
        ])}
        <li ref={end} aria-hidden="true" />
      </ol>
      <form className="compose" onSubmit={send}>
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Message"
          aria-label={`Message to ${PROFILE.name}`}
        />
        <button type="submit" className="send" aria-label="Send" disabled={!draft.trim()}>
          ↑
        </button>
      </form>
    </div>
  );

  if (phone) return <div className="ph-app ph-messages">{chat}</div>;

  return (
    <div className="messages">
      <aside className="messages-side">
        <ul>
          <li className="convo is-current">
            <span className="avatar" aria-hidden="true">
              DS
            </span>
            <span className="convo-text">
              <strong>{PROFILE.name}</strong>
              <span>{last.text}</span>
            </span>
          </li>
        </ul>
      </aside>
      {chat}
    </div>
  );
}
