import { MDXProvider } from '@mdx-js/react';
import MDXComponents from '../components/MDXComponents';
import { ACHIEVEMENTS, EDUCATION, EXPERIENCE, POSITIONS, PROFILE, PROJECTS, SKILL_GROUPS, SOCIALS } from '../data/content';
import { formatDate, getAllPosts } from '../lib/blog';
import { viewResume } from './apps/PreviewApp';

/* Every section of the portfolio is a note. The desktop's Notes window, the phone's Notes app,
   the terminal and the home-screen shortcuts all read this one list. */

function Go({ to, open, children }) {
  return (
    <button type="button" className="note-link" onClick={() => open(to)}>
      {children}
    </button>
  );
}

// the résumé, as a real download a recruiter can save
export function ResumeButton({ resume }) {
  if (!resume) return null;
  return (
    <span className="note-resume-row">
      <button type="button" className="note-resume" onClick={viewResume}>
        View résumé
      </button>
      <a className="note-resume note-resume-ghost" href={resume} download="Dev_Satish_Resume.pdf">
        ⬇ Download
      </a>
    </span>
  );
}

function About({ open, resume }) {
  return (
    <>
      <p>
        Hi, I&apos;m Dev. I&apos;m at BITS Pilani on a dual degree, mechanical engineering and biological
        sciences, and I spend most of my time building things for other people to use.
      </p>
      <p>
        Most recently I was an AI Engineering Intern at Callistra AI, building a research workspace that
        processes 10,000+ documents for financial analysts. Before that, trading systems in Python at Sysstra,
        operations at Aditya Birla Group and the founder&apos;s office at Anitum. On campus I coordinate placements for 700+ students and launched the
        Yearbook Portal, which brought in INR 7L+.
      </p>
      <ResumeButton resume={resume} />
      <h3>What I&apos;m after</h3>
      <p>
        Work where product, strategy and engineering meet: figuring out what to build, why it matters, and then
        shipping it.
      </p>
      <h3>Where to go next</h3>
      <p>
        The work: <Go to="experience" open={open}>💼 experience</Go>, <Go to="projects" open={open}>🛠️ projects</Go>{' '}
        and <Go to="skills" open={open}>🎓 skills &amp; education</Go>. If you&apos;d rather talk,{' '}
        <Go to="contact" open={open}>💬 say hi</Go>.
      </p>
      <p className="note-elsewhere">
        Elsewhere:{' '}
        {SOCIALS.map((s, i) => (
          <span key={s.href}>
            {i > 0 && ', '}
            <a href={s.href} target="_blank" rel="noreferrer">
              {s.label}
            </a>
          </span>
        ))}
        .
      </p>
    </>
  );
}

function Experience() {
  return (
    <>
      <p>Internships, most recent first, then positions of responsibility.</p>
      {[...EXPERIENCE, ...POSITIONS].map((e, i) => (
        <section key={e.company} className="note-block">
          {i === EXPERIENCE.length && <h3 className="note-group">Positions of responsibility</h3>}
          <h3>{e.company}</h3>
          <p className="note-sub">
            {e.role} <span className="note-when">{e.date}</span>
          </p>
          {e.about && <p className="note-about">{e.about}</p>}
          <ul>
            {e.bullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
          {e.tags?.length > 0 && <p className="note-tags">{e.tags.map((t) => <span key={t}>{t}</span>)}</p>}
        </section>
      ))}
    </>
  );
}

function Projects() {
  return (
    <>
      <p>From my latest résumé: what I built, and what happened when people used it.</p>
      {PROJECTS.map((p) => (
        <section key={p.name} className="note-block">
          <h3>{p.name}</h3>
          <p className="note-sub">
            {p.kind} <span className="note-when">{p.metric}</span>
          </p>
          {p.shot && (
            <img
              className="note-img"
              src={`${import.meta.env.BASE_URL}${p.shot.src}`}
              alt={p.shot.alt}
              loading="lazy"
              decoding="async"
            />
          )}
          {p.bullets ? (
            <ul>
              {p.bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          ) : (
            <p>{p.blurb}</p>
          )}
          {p.stack.length > 0 && <p className="note-tags">{p.stack.map((t) => <span key={t}>{t}</span>)}</p>}
          {p.links.length > 0 && (
            <p>
              {p.links.map((l) => (
                <a key={l.href} href={l.href} target="_blank" rel="noreferrer">
                  Open on {l.label}
                </a>
              ))}
            </p>
          )}
        </section>
      ))}
    </>
  );
}

function Skills() {
  return (
    <>
      <h3>Education</h3>
      <ul>
        {EDUCATION.map((e) => (
          <li key={e.degree}>
            {e.degree}, {e.school}. {e.date}.
          </li>
        ))}
      </ul>
      <h3>Achievements</h3>
      <ul>
        {ACHIEVEMENTS.map(([who, what]) => (
          <li key={who}>
            <strong>{who}</strong>: {what}
          </li>
        ))}
      </ul>
      {SKILL_GROUPS.map((g) => (
        <section key={g.title}>
          <h3>{g.title}</h3>
          <ul className="checklist">
            {g.items.map((s) => (
              <li key={s}>
                <span className="check" aria-hidden="true" />
                {s}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </>
  );
}

function Contact({ resume }) {
  return (
    <>
      <p>
        I like talking to people: about products, about strategy, about something you&apos;re building. If
        you&apos;re hiring or just want to swap notes, write to me.
      </p>
      <ul className="note-contact">
        <li>
          <span>Email</span>
          <a href={`mailto:${PROFILE.email}`}>{PROFILE.email}</a>
        </li>
        <li>
          <span>Phone</span>
          <a href={PROFILE.phoneHref}>{PROFILE.phone}</a>
        </li>
        {SOCIALS.map((s) => (
          <li key={s.href}>
            <span>{s.label}</span>
            <a href={s.href} target="_blank" rel="noreferrer">
              {s.href.replace(/^https?:\/\/(www\.)?/, '')}
            </a>
          </li>
        ))}
        {resume && (
          <li>
            <span>Résumé</span>
            <a href={resume} download="Dev_Satish_Resume.pdf">
              Dev_Satish_Resume.pdf
            </a>
          </li>
        )}
      </ul>
      <ResumeButton resume={resume} />
    </>
  );
}

function Post({ post }) {
  return (
    <>
      {post.summary && <p className="note-lede">{post.summary}</p>}
      <div className="prose">
        <MDXProvider components={MDXComponents}>
          <post.Component />
        </MDXProvider>
      </div>
    </>
  );
}

const posts = getAllPosts();

export const NOTES = [
  {
    id: 'about',
    group: 'Pinned',
    emoji: '👋',
    title: 'About me',
    meta: 'BITS Pilani',
    preview: PROFILE.summary,
    Body: About,
  },
  {
    id: 'experience',
    group: 'Work',
    emoji: '💼',
    title: 'Experience',
    meta: `${EXPERIENCE.length + POSITIONS.length} roles`,
    preview: EXPERIENCE.map((e) => e.company).join(', '),
    Body: Experience,
  },
  {
    id: 'projects',
    group: 'Work',
    emoji: '🛠️',
    title: 'Projects',
    meta: `${PROJECTS.length} projects`,
    preview: PROJECTS.map((p) => p.name).join(', '),
    Body: Projects,
  },
  {
    id: 'skills',
    group: 'Work',
    emoji: '🎓',
    title: 'Skills & education',
    meta: 'Since 2023',
    preview: `BITS Pilani, achievements, ${SKILL_GROUPS.map((g) => g.title).join(', ')}`,
    Body: Skills,
  },
  ...posts.map((p) => ({
    id: `post:${p.categorySlug}/${p.slug}`,
    group: 'Writing',
    emoji: '✍️',
    title: p.title,
    meta: formatDate(p.date),
    preview: p.summary || p.category,
    path: `/blog/${p.categorySlug}/${p.slug}`,
    post: p,
    Body: Post,
  })),
  {
    id: 'contact',
    group: 'Elsewhere',
    emoji: '💬',
    title: 'Say hi',
    meta: 'Email',
    preview: 'Hiring, building something, or just want to swap notes? Write to me.',
    Body: Contact,
  },
];

export const GROUPS = ['Pinned', 'Work', 'Writing', 'Elsewhere'];

export function findNote(id) {
  return NOTES.find((n) => n.id === id) || NOTES[0];
}

// a note that matches a typed query anywhere in its title, preview or group
export function matches(note, q) {
  if (!q) return true;
  const hay = `${note.title} ${note.preview} ${note.group}`.toLowerCase();
  return q
    .toLowerCase()
    .split(/\s+/)
    .every((w) => hay.includes(w));
}
