import { useEffect, useState } from 'react';
import { EDUCATION, EXPERIENCE, PROFILE, SOCIALS } from '../../data/content';
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

function LinkedIn() {
  return (
    <div className="social social-linkedin">
      <div className="social-scroll">
        <div className="li-card">
          <div className="li-banner" />
          <Avatar className="li-avatar" />
          <div className="li-body">
            <h2>{PROFILE.name}</h2>
            <p className="li-headline">{PROFILE.title}. {PROFILE.summary}</p>
            <p className="social-muted">{PROFILE.location}</p>
            <Open label="LinkedIn">View full profile</Open>
          </div>
        </div>
        <div className="li-card li-list">
          <h3>Experience</h3>
          {EXPERIENCE.map((e) => (
            <div key={e.company} className="li-item">
              <span className="li-logo" aria-hidden="true">
                {e.company[0]}
              </span>
              <div>
                <strong>{e.role}</strong>
                <p>{e.company}</p>
                <p className="social-muted">{e.date}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="li-card li-list">
          <h3>Education</h3>
          {EDUCATION.map((e) => (
            <div key={e.degree} className="li-item">
              <span className="li-logo" aria-hidden="true">
                B
              </span>
              <div>
                <strong>{e.school}</strong>
                <p>{e.degree}</p>
                <p className="social-muted">{e.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Twitter() {
  return (
    <div className="social social-x">
      <div className="social-scroll">
        <div className="x-banner" />
        <div className="x-body">
          <Avatar className="x-avatar" />
          <Open label="Twitter">Follow on X</Open>
          <h2>{PROFILE.name}</h2>
          <p className="social-muted">@{twitterUser}</p>
          <p>
            {PROFILE.summary} {PROFILE.title}.
          </p>
          <p className="social-muted">📍 {PROFILE.location}</p>
        </div>
        <div className="x-empty">
          <AppIcon id="twitter" />
          <p>Posts live on X. Open the profile to read them.</p>
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
