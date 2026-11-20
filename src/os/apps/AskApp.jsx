import { useEffect, useRef, useState } from 'react';
import { EDUCATION, EXPERIENCE, PROFILE, PROJECTS, SKILL_GROUPS, SOCIALS } from '../../data/content';
import { getAllPosts } from '../../lib/blog';

/* Ask: a chat about Dev, answered from the portfolio's own content. No model behind it, just
   matching the question to what the site knows, so every answer is true. */

const SUGGESTIONS = ['Why should you hire him?', "What's he built?", 'Where has he worked?', 'How do I reach him?'];

const list = (xs) => (xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`);

const ANSWERS = [
  {
    keys: ['hire', 'why', 'good', 'fit', 'strength', 'best'],
    text: () =>
      `Three reasons. He ships: a campus mess portal that reached ${PROJECTS[0].metric.replace(' in 7 days', '')} in its first week, and Readmebot at ${PROJECTS[1].metric}. He has range: ${EXPERIENCE.length} internships across ${list(EXPERIENCE.map((e) => e.domain.toLowerCase()))}. And he works where product, strategy and engineering meet, so he can decide what to build and then build it.`,
  },
  {
    keys: ['built', 'build', 'project', 'made', 'ship', 'portfolio'],
    text: () => PROJECTS.map((p) => `${p.name}: ${p.blurb} (${p.metric})`).join('\n\n'),
  },
  {
    keys: ['work', 'experience', 'intern', 'job', 'company', 'worked'],
    text: () => EXPERIENCE.map((e) => `${e.company}, ${e.role} (${e.date}). ${e.bullets[0]}`).join('\n\n'),
  },
  {
    keys: ['reach', 'contact', 'email', 'mail', 'phone', 'talk', 'call'],
    text: () => `Email ${PROFILE.email}, or call ${PROFILE.phone}. He's also on ${list(SOCIALS.map((s) => s.label))}. Messages on this desk will write the email for you.`,
  },
  {
    keys: ['skill', 'stack', 'know', 'language', 'tech', 'tools'],
    text: () => SKILL_GROUPS.map((g) => `${g.title}: ${g.items.join(', ')}.`).join('\n'),
  },
  {
    keys: ['study', 'education', 'college', 'degree', 'bits', 'university', 'school'],
    text: () => `${list(EDUCATION.map((e) => `${e.degree} at ${e.school}`))}, both since August 2023.`,
  },
  {
    keys: ['write', 'writing', 'blog', 'read', 'post'],
    text: () => `He writes about product and strategy. Most recent: ${list(getAllPosts().slice(0, 3).map((p) => `“${p.title}”`))}. They're in Notes, under Writing.`,
  },
  {
    keys: ['who', 'about', 'dev', 'he', 'him'],
    text: () => `${PROFILE.name}. ${PROFILE.summary} ${PROFILE.title}, based at ${PROFILE.location}.`,
  },
];

function answer(q) {
  const words = q.toLowerCase().match(/[a-z]+/g) || [];
  let best = null;
  let score = 0;
  for (const a of ANSWERS) {
    const s = a.keys.filter((k) => words.some((w) => w.startsWith(k))).length;
    if (s > score) {
      score = s;
      best = a;
    }
  }
  return best
    ? best.text()
    : "I only know what's on this site: his work, projects, skills, education, writing and how to reach him. Try asking about one of those.";
}

export default function AskApp({ layout, onClose }) {
  const phone = layout === 'phone';
  const [turns, setTurns] = useState([]);
  const [draft, setDraft] = useState('');
  const [typing, setTyping] = useState(null);
  const end = useRef(null);

  useEffect(() => {
    end.current?.scrollIntoView({ block: 'end' });
  }, [turns, typing]);

  // the answer arrives a few words at a time
  useEffect(() => {
    if (!typing) return undefined;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const words = typing.full.split(/(\s+)/);
    if (reduce || typing.at >= words.length) {
      setTurns((t) => [...t, { who: 'bot', text: typing.full }]);
      setTyping(null);
      return undefined;
    }
    const id = setTimeout(() => setTyping((x) => ({ ...x, at: x.at + 4 })), 30);
    return () => clearTimeout(id);
  }, [typing]);

  const ask = (q) => {
    const text = q.trim();
    if (!text || typing) return;
    setDraft('');
    setTurns((t) => [...t, { who: 'you', text }]);
    setTyping({ full: answer(text), at: 0 });
  };

  const partial = typing ? typing.full.split(/(\s+)/).slice(0, typing.at).join('') : '';
  const empty = turns.length === 0 && !typing;

  return (
    <div className={`ask${phone ? ' ph-app ph-ask' : ''}`}>
      {phone ? (
        <div className="ph-nav">
          <button type="button" className="ph-back" onClick={onClose}>
            <span aria-hidden="true">‹</span> Home
          </button>
        </div>
      ) : (
        <aside className="ask-side">
          <button type="button" className="ask-new" onClick={() => { setTurns([]); setTyping(null); }}>
            ✎ New chat
          </button>
          <p className="ask-side-title">Try asking</p>
          {SUGGESTIONS.map((s) => (
            <button key={s} type="button" className="ask-side-item" onClick={() => ask(s)}>
              {s}
            </button>
          ))}
        </aside>
      )}
      <div className="ask-main">
        <header className="ask-head">
          Ask <span>about Dev</span>
        </header>
        <div className="ask-log" aria-live="polite">
          {empty && <h2 className="ask-hello">Where should we begin?</h2>}
          {turns.map((t, i) => (
            <p key={i} className={`ask-turn from-${t.who}`}>
              {t.text}
            </p>
          ))}
          {typing && <p className="ask-turn from-bot">{partial}▍</p>}
          <div ref={end} />
        </div>
        <form
          className="ask-form"
          onSubmit={(e) => {
            e.preventDefault();
            ask(draft);
          }}
        >
          <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Ask anything about Dev" aria-label="Ask about Dev" />
          <button type="submit" className="send" aria-label="Ask" disabled={!draft.trim() || !!typing}>
            ↑
          </button>
        </form>
        {empty && (
          <div className="ask-chips">
            {SUGGESTIONS.map((s) => (
              <button key={s} type="button" onClick={() => ask(s)}>
                {s}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
