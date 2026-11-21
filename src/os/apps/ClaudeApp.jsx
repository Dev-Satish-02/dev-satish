import { siClaude } from 'simple-icons';
import { useEffect, useRef, useState } from 'react';
import { ACHIEVEMENTS, EDUCATION, EXPERIENCE, POSITIONS, PROFILE, PROJECTS, SKILL_GROUPS, SOCIALS } from '../../data/content';
import { getAllPosts } from '../../lib/blog';


/* Claude, about Dev. Questions are answered at once from the portfolio's own content, so every
   answer is true. For anything else, "Ask Claude" opens claude.ai with a short profile of Dev
   and the question already written, so the real model answers with Dev's facts in hand. */

const SUGGESTIONS = ['Why should you hire him?', "What's he built?", 'Where has he worked?', 'How do I reach him?'];

const list = (xs) => (xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`);

const ANSWERS = [
  {
    keys: ['hire', 'why', 'good', 'fit', 'strength', 'best'],
    text: () =>
      `Three reasons. He ships: an AI research workspace at Callistra AI that processes 10,000+ documents and cut analysis time by 40%, and the Yearbook Portal, which reached 80% of his batch and brought in INR 7L+. He has range: AI engineering, plant operations at Aditya Birla Group and a founder's office role at Anitum. And he leads: he coordinates placements for 700+ students and was top 47 of 5k+ in P&G's Spotlight Program.`,

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

// everything Claude needs to answer about Dev, kept short enough to travel in a link
function profile() {
  const posts = getAllPosts().slice(0, 4).map((p) => `- ${p.title}`);
  return [
    `You are answering questions about ${PROFILE.name} for someone visiting his portfolio. Use only these facts; if something isn't covered, say so and suggest emailing him at ${PROFILE.email}.`,
    '',
    `${PROFILE.name}: ${PROFILE.summary} Focus: ${PROFILE.title}. Location: ${PROFILE.location}.`,
    `Education: ${EDUCATION.map((e) => `${e.degree}, ${e.school} (${e.date})`).join('; ')}.`,
    'Experience:',
    ...EXPERIENCE.map((e) => `- ${e.role}, ${e.company} (${e.about}), ${e.date}: ${e.bullets.join(' ')}`),
    'Projects:',
    ...PROJECTS.map((p) => `- ${p.name} (${p.kind}): ${(p.bullets || [p.blurb]).join(' ')}`),
    'Positions of responsibility:',
    ...POSITIONS.map((p) => `- ${p.role}, ${p.company}, ${p.date}: ${p.bullets.join(' ')}`),
    `Achievements: ${ACHIEVEMENTS.map(([a, b]) => `${a}: ${b}`).join(' ')}`,
    `Skills: ${SKILL_GROUPS.map((g) => `${g.title}: ${g.items.join(', ')}`).join('. ')}.`,
    'Writing:',
    ...posts,
    `Links: ${SOCIALS.map((s) => `${s.label} ${s.href}`).join(', ')}.`,
  ].join('\n');
}

export function claudeLink(question) {
  const q = `${profile()}\n\nQuestion: ${question || `Who is ${PROFILE.name}, and why should I hire him?`}`;
  return `https://claude.ai/new?q=${encodeURIComponent(q)}`;
}

function Spark({ size = 28 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <path d={siClaude.path} fill="#d97757" />
    </svg>
  );
}

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
  return best ? { text: best.text(), known: true } : { text: "That isn't on this site. Ask Claude and it'll answer with Dev's profile in hand.", known: false };
}

export default function ClaudeApp({ layout, onClose }) {
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
      setTurns((t) => [...t, { who: 'bot', text: typing.full, q: typing.q }]);
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
    setTyping({ full: answer(text).text, at: 0, q: text });
  };

  const partial = typing ? typing.full.split(/(\s+)/).slice(0, typing.at).join('') : '';
  const empty = turns.length === 0 && !typing;

  return (
    <div className={`ask claude${phone ? ' ph-app ph-ask' : ''}`}>
      {phone ? (
        <div className="ph-nav">
          <button type="button" className="ph-back" onClick={onClose} aria-label="Back">
            <span aria-hidden="true">‹</span>
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
      <div className={`ask-main${empty ? ' is-empty' : ''}`}>
        <header className="ask-head">
          <span>Claude</span>
          <a className="ask-open" href={claudeLink()} target="_blank" rel="noreferrer">
            Open in Claude ↗
          </a>
        </header>
        <div className="ask-log" aria-live="polite">
          {empty && (
            <h2 className="ask-hello">
              <Spark size={34} /> What would you like to know about Dev?
            </h2>
          )}
          {turns.map((t, i) =>
            t.who === 'bot' ? (
              <div key={i} className="ask-turn from-bot">
                <p>{t.text}</p>
                <a className="ask-handoff" href={claudeLink(t.q)} target="_blank" rel="noreferrer">
                  <Spark size={14} /> Ask Claude about this
                </a>
              </div>
            ) : (
              <p key={i} className="ask-turn from-you">
                {t.text}
              </p>
            )
          )}
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
          <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="How can I help you today?" aria-label="Ask Claude about Dev" />
          <button type="submit" className="send" aria-label="Send" disabled={!draft.trim() || !!typing}>
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
