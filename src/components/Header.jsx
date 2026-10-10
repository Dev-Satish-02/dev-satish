import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { NAV_LINKS, PROFILE } from '../data/content';
import { motionPref, setMotion, useStore } from '../lib/store';
import useResume from '../hooks/useResume';
import { FileIcon, MotionIcon } from './Icons';

function NavItem({ item, className, onClick }) {
  const to = item.to || { pathname: '/', hash: `#${item.hash}` };
  return (
    <Link to={to} className={className} onClick={onClick} data-hash={item.hash}>
      {item.label}
    </Link>
  );
}

export function Wordmark({ small }) {
  return (
    <span className={`wordmark${small ? ' wordmark--small' : ''}`}>
      DEVOGATARI<i aria-hidden="true" />
    </span>
  );
}

export default function Header() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const motion = useStore(motionPref);
  const resume = useResume();

  useEffect(() => setOpen(false), [location]);
  useEffect(() => {
    document.documentElement.classList.toggle('menu-open', open);
  }, [open]);

  const toggleMotion = () => setMotion(motion === 'on' ? 'off' : 'on');

  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <header className={`site-header${open ? ' is-open' : ''}`}>
        <Link to="/" className="brand" aria-label="Devogatari, Dev Satish's portfolio, home">
          <Wordmark />
        </Link>
        <nav className="nav" aria-label="Main">
          {NAV_LINKS.map((item) => (
            <NavItem
              key={item.label}
              item={item}
              className={`nav-link${item.to && location.pathname.startsWith(item.to) ? ' is-active' : ''}`}
            />
          ))}
        </nav>
        <div className="header-actions">
          <button
            type="button"
            className="icon-btn"
            onClick={toggleMotion}
            aria-pressed={motion === 'on'}
            title={motion === 'on' ? 'Turn off animations' : 'Turn on animations'}
          >
            <MotionIcon on={motion === 'on'} />
            <span className="sr-only">Animations {motion === 'on' ? 'on' : 'off'}</span>
          </button>
          {resume && (
            <a href={resume} className="btn btn--ghost btn--sm hide-sm" target="_blank" rel="noreferrer">
              <FileIcon /> Résumé
            </a>
          )}
          <a href={`mailto:${PROFILE.email}`} className="btn btn--sm hide-sm">
            Hire me
          </a>
          <button
            type="button"
            className="menu-btn"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
          >
            {open ? 'Close' : 'Menu'}
          </button>
        </div>
      </header>
      <div id="mobile-menu" className={`mobile-menu${open ? ' is-open' : ''}`} hidden={!open}>
        {NAV_LINKS.map((item) => (
          <NavItem key={item.label} item={item} className="mobile-link" onClick={() => setOpen(false)} />
        ))}
        <div className="mobile-actions">
          <a href={`mailto:${PROFILE.email}`} className="btn">
            Email me
          </a>
          {resume && (
            <a href={resume} className="btn btn--ghost" target="_blank" rel="noreferrer">
              Résumé
            </a>
          )}
        </div>
      </div>
    </>
  );
}
