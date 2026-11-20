import { useEffect, useRef, useState } from 'react';
import { EDUCATION, EXPERIENCE, PROFILE, PROJECTS, SKILL_GROUPS, SOCIALS } from '../../data/content';
import { NOTES } from '../notes';

/* A small shell over the same content: for people who would rather type than click. */

const PROMPT = 'dev@bits ~ %';
const social = (label) => SOCIALS.find((s) => s.label.toLowerCase() === label)?.href;

function run(line, { openNote, openApp }) {
  const [cmd, ...rest] = line.trim().split(/\s+/);
  const arg = rest.join(' ').toLowerCase();
  switch ((cmd || '').toLowerCase()) {
    case '':
      return [];
    case 'help':
      return [
        'about        who I am',
        'experience   where I have worked',
        'projects     what I have shipped',
        'skills       skills and education',
        'writing      what I have written',
        'contact      how to reach me',
        'open <name>  open a note in Notes (about, experience, projects, skills, contact)',
        'github, linkedin, twitter, mail',
        'clear',
      ];
    case 'whoami':
    case 'about':
      return [`${PROFILE.name}. ${PROFILE.summary}`, `${PROFILE.title}. ${PROFILE.location}.`];
    case 'experience':
      return EXPERIENCE.flatMap((e) => [`${e.company.padEnd(20)}${e.role}`, `${''.padEnd(20)}${e.date}`]);
    case 'projects':
      return PROJECTS.map((p) => `${p.name.padEnd(18)}${p.metric}`);
    case 'skills':
      return [
        ...EDUCATION.map((e) => `${e.degree}, ${e.school}`),
        '',
        ...SKILL_GROUPS.map((g) => `${g.title}: ${g.items.join(', ')}`),
      ];
    case 'writing':
    case 'ls':
      return NOTES.filter((n) => n.group === 'Writing').map((n) => `${n.meta.padEnd(14)}${n.title}`);
    case 'contact':
      return [`email  ${PROFILE.email}`, `phone  ${PROFILE.phone}`, ...SOCIALS.map((s) => `${s.label.toLowerCase().padEnd(7)}${s.href}`)];
    case 'open': {
      const note = NOTES.find((n) => n.id === arg || n.title.toLowerCase().startsWith(arg));
      if (!arg || !note) return [`open: no note called "${arg}". Try: about, experience, projects, skills, contact`];
      openNote(note.id);
      return [`opening ${note.title} in Notes`];
    }
    case 'messages':
      openApp('messages');
      return ['opening Messages'];
    case 'github':
    case 'linkedin':
    case 'twitter': {
      const href = social(cmd.toLowerCase());
      window.open(href, '_blank', 'noreferrer');
      return [`opening ${href}`];
    }
    case 'mail':
      window.location.href = `mailto:${PROFILE.email}`;
      return [`opening mail to ${PROFILE.email}`];
    case 'date':
      return [new Date().toString()];
    case 'echo':
      return [rest.join(' ')];
    case 'sudo':
      return ['nice try.'];
    default:
      return [`zsh: command not found: ${cmd}. Type help.`];
  }
}

export default function TerminalApp({ layout, onClose, openNote, openApp }) {
  const [lines, setLines] = useState(() => [
    `Last login: ${new Date().toDateString()} on ttys001`,
    'Type help to see what is here.',
  ]);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([]);
  const [h, setH] = useState(-1);
  const field = useRef(null);
  const end = useRef(null);

  useEffect(() => {
    end.current?.scrollIntoView({ block: 'end' });
  }, [lines]);

  const submit = (e) => {
    e.preventDefault();
    const line = input;
    setInput('');
    setH(-1);
    if (line.trim()) setHistory((x) => [line, ...x]);
    if (line.trim() === 'clear') {
      setLines([]);
      return;
    }
    setLines((x) => [...x, `${PROMPT} ${line}`, ...run(line, { openNote, openApp })]);
  };

  const onKey = (e) => {
    if (e.key === 'ArrowUp' && history.length) {
      e.preventDefault();
      const n = Math.min(history.length - 1, h + 1);
      setH(n);
      setInput(history[n]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const n = h - 1;
      setH(n);
      setInput(n >= 0 ? history[n] : '');
    }
  };

  return (
    <div className={`term${layout === 'phone' ? ' ph-app ph-term' : ''}`} onClick={() => field.current?.focus()}>
      {layout === 'phone' && (
        <div className="ph-nav ph-nav--dark">
          <button type="button" className="ph-back" onClick={onClose}>
            <span aria-hidden="true">‹</span> Home
          </button>
        </div>
      )}
      <div className="term-out" role="log" aria-live="polite">
        {lines.map((l, i) => (
          <pre key={i}>{l || ' '}</pre>
        ))}
        <form onSubmit={submit} className="term-line">
          <label htmlFor="term-in">{PROMPT}</label>
          <input
            id="term-in"
            ref={field}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKey}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck="false"
            autoFocus={layout !== 'phone'}
          />
        </form>
        <div ref={end} />
      </div>
    </div>
  );
}
