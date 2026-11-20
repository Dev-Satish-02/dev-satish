import { EDUCATION, EXPERIENCE, PROFILE, PROJECTS, SOCIALS } from '../../data/content';
import { NOTES } from '../notes';

/* The desk's files: one small tree that Finder shows and Terminal walks. A file opens as a note,
   an app, a link, or as text in TextEdit. */

export const HOME = 'dev';

export const README = [
  "Hi, and welcome to Dev's desk.",
  '',
  "Everything about me is in Notes: who I am, where I've worked, what I've shipped, and what I've written. Finder has the same things as files.",
  '',
  'Messages writes me an email. Claude answers questions about me, and can hand them to the real Claude with my profile attached. System Settings is me, as a computer. Terminal takes typed commands; start with help.',
  '',
  'Windows drag by their top edge and resize from any edge. The dock opens apps; its profiles open as windows.',
  '',
  'On a phone, all of this is an iPhone.',
].join('\n');

const ABOUT = [
  `${PROFILE.name}`,
  `${PROFILE.title}`,
  '',
  PROFILE.summary,
  '',
  ...EDUCATION.map((e) => `${e.degree}, ${e.school}. ${e.date}.`),
  '',
  `${EXPERIENCE.length} internships: ${EXPERIENCE.map((e) => e.company).join(', ')}.`,
  `Shipped: ${PROJECTS.map((p) => `${p.name} (${p.metric})`).join(', ')}.`,
].join('\n');

const CONTACT = [
  `email     ${PROFILE.email}`,
  `phone     ${PROFILE.phone}`,
  ...SOCIALS.map((s) => `${s.label.toLowerCase().padEnd(10)}${s.href}`),
].join('\n');

const note = (id, name) => ({ name: name || `${NOTES.find((n) => n.id === id)?.title}`, type: 'file', ext: 'note', note: id });
const posts = () => NOTES.filter((n) => n.group === 'Writing').map((n) => ({ name: n.title, type: 'file', ext: 'md', note: n.id }));
const app = (id, name) => ({ name, type: 'app', app: id });

export const APPS = [
  app('finder', 'Finder'),
  app('notes', 'Notes'),
  app('messages', 'Messages'),
  app('claude', 'Claude'),
  app('weather', 'Weather'),
  app('terminal', 'Terminal'),
  app('settings', 'System Settings'),
  app('github', 'GitHub'),
  app('linkedin', 'LinkedIn'),
  app('twitter', 'X'),
];

export function makeFS(resume) {
  const pdf = resume ? [{ name: 'resume.pdf', type: 'file', ext: 'pdf', href: resume }] : [];
  const readme = { name: 'read-me.txt', type: 'file', ext: 'txt', text: README };
  const home = {
    name: HOME,
    type: 'dir',
    children: [
      { name: 'Applications', type: 'dir', children: APPS },
      { name: 'Desktop', type: 'dir', children: [readme, ...pdf] },
      {
        name: 'Documents',
        type: 'dir',
        children: [note('about', 'About me'), note('experience'), note('skills'), note('contact', 'Say hi')],
      },
      { name: 'Downloads', type: 'dir', children: pdf },
      { name: 'Projects', type: 'dir', children: PROJECTS.map((p) => ({ name: p.name, type: 'file', ext: 'note', note: 'projects' })) },
      { name: 'Writing', type: 'dir', children: posts() },
      { name: 'about.txt', type: 'file', ext: 'txt', text: ABOUT },
      { name: 'contact.txt', type: 'file', ext: 'txt', text: CONTACT },
    ],
  };
  const dir = (name) => home.children.find((c) => c.name === name);
  // Finder's sidebar places, each a list of items
  const places = {
    Recents: [readme, note('about', 'About me'), ...posts().slice(0, 2)],
    Applications: APPS,
    Desktop: dir('Desktop').children,
    Documents: dir('Documents').children,
    Downloads: dir('Downloads').children,
    Portfolio: dir('Projects').children,
    Important: [note('about', 'About me'), note('experience'), ...pdf],
    Ideas: posts(),
    'iCloud Drive': [readme, ...posts()],
    [HOME]: home.children.filter((c) => c.type === 'dir' || c.ext === 'txt'),
    AirDrop: [],
    Bin: [],
  };
  return { home, places };
}

// walk a path like "~/Documents" or "../Desktop" from the current directory (an array of names)
export function resolve(home, cwd, path) {
  let parts = path.startsWith('~') ? [] : [...cwd];
  for (const seg of path.replace(/^~\/?/, '').split('/').filter(Boolean)) {
    if (seg === '.') continue;
    if (seg === '..') parts = parts.slice(0, -1);
    else parts.push(seg);
  }
  let node = home;
  for (const p of parts) {
    node = node.children?.find((c) => c.name.toLowerCase() === p.toLowerCase());
    if (!node) return null;
  }
  return { node, parts: parts.map((p, i) => (i === parts.length - 1 ? node.name : p)) };
}
