import { useEffect, useState } from 'react';
import { EDUCATION, EXPERIENCE, LINKEDIN, PROFILE, SKILL_GROUPS, SOCIALS } from '../../data/content';
import { AppIcon } from '../icons';

/* Dev's profiles, opened as windows on the desk. GitHub is live (its public API allows it); the
   others show what's on the profile and link through, since those sites can't be embedded. */

const href = (label) => SOCIALS.find((s) => s.label === label)?.href;
const githubUser = href('GitHub')?.split('/').filter(Boolean).pop();
const twitterUser = href('Twitter')?.split('/').filter(Boolean).pop();
const avatar = `https://github.com/${githubUser}.png?size=240`;

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

let cache; // one request per visit; GitHub allows 60 an hour without a key
function useGitHub() {
  const [data, setData] = useState(cache || null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    if (cache) return undefined;
    let alive = true;
    Promise.all([
      fetch(`https://api.github.com/users/${githubUser}`).then((r) => (r.ok ? r.json() : Promise.reject())),
      fetch(`https://api.github.com/users/${githubUser}/repos?sort=updated&per_page=8`).then((r) => (r.ok ? r.json() : Promise.reject())),
    ])
      .then(([user, repos]) => {
        cache = { user, repos: repos.filter((r) => !r.fork) };
        if (alive) setData(cache);
      })
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
    };
  }, []);
  return { data, failed };
}

function GitHub() {
  const { data, failed } = useGitHub();
  const user = data?.user;
  return (
    <div className="social social-github">
      <div className="social-scroll">
        <header className="gh-head">
          <Avatar className="gh-avatar" />
          <div>
            <h2>{user?.name || PROFILE.name}</h2>
            <p className="gh-login">{githubUser}</p>
            {user?.bio && <p>{user.bio}</p>}
            {user && (
              <p className="gh-stats">
                <b>{user.followers}</b> followers · <b>{user.following}</b> following · <b>{user.public_repos}</b> repositories
              </p>
            )}
            <Open label="GitHub">View on GitHub</Open>
          </div>
        </header>
        <h3 className="gh-section">Recently updated</h3>
        {!data && !failed && <p className="social-muted">Loading repositories…</p>}
        {failed && <p className="social-muted">GitHub didn&apos;t answer just now. The profile is one click away.</p>}
        <ul className="gh-repos">
          {data?.repos.map((r) => (
            <li key={r.id}>
              <a href={r.html_url} target="_blank" rel="noreferrer">
                {r.name}
              </a>
              {r.description && <p>{r.description}</p>}
              <p className="gh-meta">
                {r.language && <span>{r.language}</span>}
                {r.stargazers_count > 0 && <span>★ {r.stargazers_count}</span>}
                <span>Updated {new Date(r.pushed_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </p>
            </li>
          ))}
        </ul>
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

function Twitter() {
  const [tab, setTab] = useState('Posts');
  return (
    <div className="social social-x">
      <div className="social-scroll">
        <header className="x-top">
          <strong>{PROFILE.name}</strong>
        </header>
        <div className="x-banner" />
        <div className="x-body">
          <Avatar className="x-avatar" />
          <div className="x-buttons">
            <a className="x-btn" href={href('Twitter')} target="_blank" rel="noreferrer">
              Open on X ↗
            </a>
            <a className="x-btn x-btn-light" href={href('Twitter')} target="_blank" rel="noreferrer">
              Follow
            </a>
          </div>
          <h2>{PROFILE.name}</h2>
          <p className="social-muted">@{twitterUser}</p>
          <p>
            {PROFILE.title.toLowerCase()} · {EDUCATION[0].school} · building things people use
          </p>
          <p className="social-muted x-meta">
            <span>📍 {PROFILE.location}</span>
            <a href={href('GitHub')} target="_blank" rel="noreferrer">
              🔗 github.com/{githubUser}
            </a>
          </p>
        </div>
        <nav className="x-tabs" aria-label="Profile tabs">
          {['Posts', 'Replies', 'Media'].map((t) => (
            <button key={t} type="button" className={t === tab ? 'is-on' : undefined} onClick={() => setTab(t)}>
              {t}
            </button>
          ))}
        </nav>
        <div className="x-empty">
          <AppIcon id="twitter" />
          <p>{tab} live on X. Open the profile to read them.</p>
          <a className="x-link" href={href('Twitter')} target="_blank" rel="noreferrer">
            See everything on x.com/{twitterUser} ↗
          </a>
        </div>
      </div>
    </div>
  );
}

export default function SocialApp({ network }) {
  if (network === 'github') return <GitHub />;
  if (network === 'linkedin') return <LinkedIn />;
  return <Twitter />;
}
