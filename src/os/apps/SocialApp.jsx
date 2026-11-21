import { useEffect, useMemo, useState } from 'react';
import { marked } from 'marked';
import { AVATAR, EDUCATION, EXPERIENCE, GITHUB, LINKEDIN, PROFILE, SKILL_GROUPS, SOCIALS, X_PROFILE } from '../../data/content';
import { AppIcon } from '../icons';

/* Dev's profiles, opened as windows on the desk. GitHub is live (its public API allows it); the
   others show what's on the profile and link through, since those sites can't be embedded. */

const href = (label) => SOCIALS.find((s) => s.label === label)?.href;
const githubUser = href('GitHub')?.split('/').filter(Boolean).pop();
const twitterUser = href('Twitter')?.split('/').filter(Boolean).pop();
const avatar = `${import.meta.env.BASE_URL}${AVATAR}`;

function Avatar({ className = '' }) {
  const [ok, setOk] = useState(true);
  return ok ? (
    <img className={`social-avatar ${className}`} src={avatar} alt="" onError={() => setOk(false)} />
  ) : (
    <span className={`social-avatar avatar ${className}`} aria-hidden="true">
      DS
    </span>
  );
}

function Open({ label, children }) {
  return (
    <a className="social-open" href={href(label)} target="_blank" rel="noreferrer">
      {children} ↗
    </a>
  );
}

// GitHub's public API and a public contributions feed, fetched once per visit. Without a key
// GitHub allows 60 requests an hour per visitor; this window makes at most five.
const api = (path) => fetch(`https://api.github.com${path}`).then((r) => (r.ok ? r.json() : Promise.reject(new Error(r.status))));
let cache;
function loadGitHub() {
  cache ||= Promise.allSettled([
    api(`/users/${githubUser}`),
    api(`/users/${githubUser}/repos?per_page=100&sort=updated`),
    fetch(`https://raw.githubusercontent.com/${githubUser}/${githubUser}/main/README.md`).then((r) => (r.ok ? r.text() : Promise.reject())),
    fetch(`https://github-contributions-api.jogruber.de/v4/${githubUser}?y=last`).then((r) => (r.ok ? r.json() : Promise.reject())),
    fetch(`https://api.github.com/users/${githubUser}/starred?per_page=1`).then((r) => {
      const last = (r.headers.get('link') || '').match(/[?&]page=(\d+)>; rel="last"/);
      return last ? +last[1] : r.ok ? r.json().then((x) => x.length) : Promise.reject();
    }),
  ]).then(async ([user, repos, readme, contrib, stars]) => {
    const all = repos.status === 'fulfilled' ? repos.value : [];
    const pinned = GITHUB.pinned.map((name) => all.find((r) => r.name === name)).filter(Boolean);
    // a fork's card names where it came from, which only the repository's own page says
    const forks = await Promise.allSettled(pinned.filter((r) => r.fork).map((r) => api(`/repos/${githubUser}/${r.name}`)));
    const parent = Object.fromEntries(forks.filter((f) => f.status === 'fulfilled').map((f) => [f.value.name, f.value.parent?.full_name]));
    return {
      user: user.status === 'fulfilled' ? user.value : null,
      pinned: pinned.map((r) => ({ ...r, parent: parent[r.name] })),
      readme: readme.status === 'fulfilled' ? readme.value : null,
      contrib: contrib.status === 'fulfilled' ? contrib.value : null,
      stars: stars.status === 'fulfilled' ? stars.value : null,
    };
  });
  return cache;
}

const LANG = { TypeScript: '#3178c6', JavaScript: '#f1e05a', Python: '#3572a5', CSS: '#663399', HTML: '#e34c26', 'C++': '#f34b7d', Java: '#b07219', Shell: '#89e051' };

// the README, rendered the way GitHub does, with every link opening in a new tab
function Readme({ text }) {
  const html = useMemo(() => {
    const out = marked.parse(text, { gfm: true, breaks: false });
    return out.replace(/<a /g, '<a target="_blank" rel="noreferrer" ');
  }, [text]);
  // the README is Dev's own, from his own repository
  return <article className="gh-readme" dangerouslySetInnerHTML={{ __html: html }} />;
}

function Contributions({ data }) {
  const days = data.contributions;
  const pad = new Date(days[0].date).getDay();
  const cells = [...Array(pad).fill(null), ...days];
  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  const months = weeks.map((w, i) => {
    const first = w.find((d) => d && +d.date.slice(8) <= 7);
    return first && (i === 0 || !weeks[i - 1].some((d) => d && d.date.slice(5, 7) === first.date.slice(5, 7)))
      ? new Date(first.date).toLocaleDateString('en-US', { month: 'short' })
      : '';
  });
  return (
    <section className="gh-contrib">
      <h3 className="gh-section">{data.total.lastYear} contributions in the last year</h3>
      <div className="gh-graph">
        <div className="gh-months">
          {months.map((m, i) => (
            <span key={i}>{m}</span>
          ))}
        </div>
        <div className="gh-weeks">
          <span className="gh-daynames" aria-hidden="true">
            <i />
            <i>Mon</i>
            <i />
            <i>Wed</i>
            <i />
            <i>Fri</i>
            <i />
          </span>
          {weeks.map((w, i) => (
            <span key={i} className="gh-week">
              {w.map((d, j) => (d ? <i key={j} className={`lv${d.level}`} title={`${d.count} contributions on ${d.date}`} /> : <i key={j} className="none" />))}
            </span>
          ))}
        </div>
        <p className="gh-legend">
          Less <i className="lv0" />
          <i className="lv1" />
          <i className="lv2" />
          <i className="lv3" />
          <i className="lv4" /> More
        </p>
      </div>
    </section>
  );
}

function GitHub() {
  const [data, setData] = useState(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let alive = true;
    loadGitHub()
      .then((d) => alive && setData(d))
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
    };
  }, []);
  const user = data?.user;
  const link = (label) => SOCIALS.find((x) => x.label === label)?.href;
  return (
    <div className="social social-github">
      <nav className="gh-tabs" aria-label="GitHub profile">
        <a className="is-on" href={href('GitHub')} target="_blank" rel="noreferrer">
          📖 Overview
        </a>
        <a href={`${href('GitHub')}?tab=repositories`} target="_blank" rel="noreferrer">
          ▤ Repositories {user && <b>{user.public_repos}</b>}
        </a>
        <a href={`${href('GitHub')}?tab=projects`} target="_blank" rel="noreferrer">
          ▦ Projects
        </a>
        <a href={`${href('GitHub')}?tab=packages`} target="_blank" rel="noreferrer">
          ⬡ Packages
        </a>
        <a href={`${href('GitHub')}?tab=stars`} target="_blank" rel="noreferrer">
          ☆ Stars {data?.stars != null && <b>{data.stars}</b>}
        </a>
      </nav>
      <div className="social-scroll gh-page">
        <aside className="gh-side">
          <Avatar className="gh-avatar" />
          <h2>{user?.name || PROFILE.name}</h2>
          <p className="gh-login">{githubUser}</p>
          <a className="gh-follow" href={href('GitHub')} target="_blank" rel="noreferrer">
            Follow
          </a>
          {user?.bio && <p className="gh-bio">{user.bio}</p>}
          {user && user.followers + user.following > 0 && (
            <p className="gh-people">
              👥 <b>{user.followers}</b> followers · <b>{user.following}</b> following
            </p>
          )}
          <ul className="gh-links">
            <li>
              🔗{' '}
              <a href={GITHUB.website} target="_blank" rel="noreferrer">
                {GITHUB.website.replace(/^https:\/\//, '')}
              </a>
            </li>
            <li>
              in{' '}
              <a href={link('LinkedIn')} target="_blank" rel="noreferrer">
                in/{link('LinkedIn')?.split('/').filter(Boolean).pop()}
              </a>
            </li>
            <li>
              𝕏{' '}
              <a href={link('Twitter')} target="_blank" rel="noreferrer">
                @{twitterUser}
              </a>
            </li>
          </ul>
          <h3 className="gh-side-title">Achievements</h3>
          <div className="gh-badges">
            {GITHUB.achievements.map(([name, icon, c]) => (
              <span key={name} className="gh-badge" style={{ background: c }} title={name}>
                <span aria-hidden="true">{icon}</span>
                <span className="sr-only">{name}</span>
              </span>
            ))}
          </div>
          <h3 className="gh-side-title">Highlights</h3>
          <p className="gh-pro">
            ☆ <span>PRO</span>
          </p>
        </aside>
        <div className="gh-main">
          {!data && !failed && <p className="social-muted">Loading profile…</p>}
          {failed && <p className="social-muted">GitHub didn&apos;t answer just now. The profile is one click away.</p>}
          {data?.readme && (
            <div className="gh-box">
              <p className="gh-box-path">
                {githubUser} / README<span>.md</span>
              </p>
              <Readme text={data.readme} />
            </div>
          )}
          {data?.pinned.length > 0 && (
            <>
              <h3 className="gh-section">Popular repositories</h3>
              <ul className="gh-repos">
                {data.pinned.map((r) => (
                  <li key={r.id}>
                    <span className="gh-repo-top">
                      <a href={r.html_url} target="_blank" rel="noreferrer">
                        {r.name}
                      </a>
                      <span className="gh-public">Public</span>
                    </span>
                    {r.parent && <p className="gh-fork">Forked from {r.parent}</p>}
                    {r.description && <p>{r.description}</p>}
                    <p className="gh-meta">
                      {r.language && (
                        <span>
                          <i className="gh-lang" style={{ background: LANG[r.language] || '#8d96a0' }} /> {r.language}
                        </span>
                      )}
                      {r.stargazers_count > 0 && <span>☆ {r.stargazers_count}</span>}
                    </p>
                  </li>
                ))}
              </ul>
            </>
          )}
          {data?.contrib && <Contributions data={data.contrib} />}
        </div>
      </div>
    </div>
  );
}

const certs = SKILL_GROUPS.find((g) => g.title === 'Certifications')?.items || [];
const skills = SKILL_GROUPS.filter((g) => g.title !== 'Certifications').flatMap((g) => g.items);
const issuer = (c) => (c.match(/\(([^)]+)\)/) || [])[1] || (c.startsWith('AWS') ? 'Amazon Web Services' : '');

function LinkedIn() {
  const base = import.meta.env.BASE_URL;
  return (
    <div className="social social-linkedin">
      <header className="li-top">
        <span className="li-mark" aria-hidden="true">
          in
        </span>
        <span>LinkedIn</span>
        <a href={href('LinkedIn')} target="_blank" rel="noreferrer">
          View profile ↗
        </a>
      </header>
      <div className="social-scroll">
        <div className="li-card">
          <div className="li-banner" style={{ backgroundImage: `url(${base}${LINKEDIN.banner})` }}>
            <a className="li-credit" href={LINKEDIN.bannerCredit.href} target="_blank" rel="noreferrer">
              {LINKEDIN.bannerCredit.text}
            </a>
          </div>
          <Avatar className="li-avatar" />
          <div className="li-body">
            <div className="li-intro">
              <div>
                <h2>
                  {PROFILE.name} <span className="li-badge" title="Verified" aria-label="Verified">✓</span>{' '}
                  <small>{LINKEDIN.pronouns}</small>
                </h2>
                <p className="li-headline">{LINKEDIN.headline}</p>
                <p className="social-muted">
                  {LINKEDIN.location} ·{' '}
                  <a className="li-blue" href={`mailto:${PROFILE.email}`}>
                    Contact info
                  </a>
                </p>
                <p className="li-blue li-strong">{LINKEDIN.connections}</p>
              </div>
              <div className="li-org">
                <span className="li-logo li-logo-sm" aria-hidden="true">
                  B
                </span>
                <strong>{LINKEDIN.school}</strong>
              </div>
            </div>
            <div className="li-actions">
              <a className="li-btn li-btn-primary" href={href('LinkedIn')} target="_blank" rel="noreferrer">
                Open on LinkedIn
              </a>
              <a className="li-btn" href={`mailto:${PROFILE.email}`}>
                Message
              </a>
            </div>
          </div>
        </div>

        <section className="li-card li-list">
          <h3>About</h3>
          <p>
            {PROFILE.summary} I work where product, strategy and engineering meet: {EXPERIENCE.length} internships across{' '}
            {EXPERIENCE.map((e) => e.domain.toLowerCase()).join(', ')}, and campus products used by thousands of students.
          </p>
        </section>

        <section className="li-card li-list">
          <h3>Experience</h3>
          {EXPERIENCE.map((e) => (
            <div key={e.company} className="li-item">
              <span className="li-logo" aria-hidden="true">
                {e.company[0]}
              </span>
              <div>
                <strong>{e.role}</strong>
                <p>{e.company} · Internship</p>
                <p className="social-muted">{e.date}</p>
                <ul>
                  {e.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
                <p className="li-skills">◆ {e.tags.join(' · ')}</p>
              </div>
            </div>
          ))}
        </section>

        <section className="li-card li-list">
          <h3>Education</h3>
          {EDUCATION.map((e) => (
            <div key={e.degree} className="li-item">
              <span className="li-logo" aria-hidden="true">
                B
              </span>
              <div>
                <strong>{LINKEDIN.school}</strong>
                <p>{e.degree}</p>
                <p className="social-muted">{e.date}</p>
              </div>
            </div>
          ))}
        </section>

        {certs.length > 0 && (
          <section className="li-card li-list">
            <h3>Licenses &amp; certifications</h3>
            {certs.map((c) => (
              <div key={c} className="li-item">
                <span className="li-logo" aria-hidden="true">
                  {c[0]}
                </span>
                <div>
                  <strong>{c.replace(/\s*\([^)]*\)/, '')}</strong>
                  {issuer(c) && <p>{issuer(c)}</p>}
                </div>
              </div>
            ))}
          </section>
        )}

        <section className="li-card li-list">
          <h3>Skills</h3>
          <ul className="li-skill-list">
            {skills.map((k) => (
              <li key={k}>{k}</li>
            ))}
          </ul>
        </section>

        <a className="li-full" href={href('LinkedIn')} target="_blank" rel="noreferrer">
          See the full profile on LinkedIn ↗
        </a>
      </div>
    </div>
  );
}

const X_TABS = ['Posts', 'Replies', 'Reposts', 'Videos'];
const X_NAV = [
  ['⌂', 'Home'],
  ['⌕', 'Explore'],
  ['🔔', 'Notifications'],
  ['✉', 'Chat'],
  ['👤', 'Profile'],
];

function Twitter() {
  const [tab, setTab] = useState('Posts');
  const base = import.meta.env.BASE_URL;
  const x = href('Twitter');
  return (
    <div className="social social-x">
      <nav className="x-rail" aria-label="X">
        <span className="x-logo">
          <AppIcon id="twitter" />
        </span>
        {X_NAV.map(([icon, label]) => (
          <a key={label} href={label === 'Profile' ? x : 'https://x.com/home'} target="_blank" rel="noreferrer" className={label === 'Profile' ? 'is-on' : undefined}>
            <span aria-hidden="true">{icon}</span>
            <span className="x-rail-label">{label}</span>
          </a>
        ))}
      </nav>
      <div className="social-scroll x-col">
        <header className="x-top">
          <strong>{X_PROFILE.name}</strong>
          <span>0 posts</span>
        </header>
        <div className="x-banner" style={{ backgroundImage: `url(${base}${LINKEDIN.banner})` }} />
        <div className="x-body">
          <div className="x-head-row">
            <Avatar className="x-avatar" />
            <div className="x-buttons">
            <a className="x-btn" href={x} target="_blank" rel="noreferrer">
              Open on X ↗
            </a>
            <a className="x-btn x-btn-light" href={x} target="_blank" rel="noreferrer">
              Follow
            </a>
            </div>
          </div>
          <h2>{X_PROFILE.name}</h2>
          <p className="social-muted">@{twitterUser}</p>
          <p className="social-muted x-meta">
            <span>📅 Joined {X_PROFILE.joined}</span>
          </p>
          <p className="x-counts">
            <a href={`${x}/following`} target="_blank" rel="noreferrer">
              <b>{X_PROFILE.following}</b> Following
            </a>
            <a href={`${x}/followers`} target="_blank" rel="noreferrer">
              <b>{X_PROFILE.followers}</b> Follower{X_PROFILE.followers === 1 ? '' : 's'}
            </a>
          </p>
        </div>
        <nav className="x-tabs" aria-label="Profile tabs">
          {X_TABS.map((t) => (
            <button key={t} type="button" className={t === tab ? 'is-on' : undefined} onClick={() => setTab(t)}>
              {t}
            </button>
          ))}
        </nav>
        <div className="x-empty">
          <strong>
            @{twitterUser} hasn&apos;t posted{tab === 'Posts' ? '' : ` ${tab.toLowerCase()}`} yet
          </strong>
          <p>When they do, it&apos;ll show up here.</p>
          <a className="x-link" href={x} target="_blank" rel="noreferrer">
            See the profile on x.com ↗
          </a>
        </div>
      </div>
    </div>
  );
}

export default function SocialApp({ network, layout, onClose }) {
  const body = network === 'github' ? <GitHub /> : network === 'linkedin' ? <LinkedIn /> : <Twitter />;
  if (layout !== 'phone') return body;
  // on a phone the profile fills the screen, under a back button home
  return (
    <div className={`ph-app ph-social ph-${network}`}>
      <div className="ph-nav">
        <button type="button" className="ph-back" onClick={onClose}>
          <span aria-hidden="true">‹</span> Home
        </button>
      </div>
      {body}
    </div>
  );
}
