import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { NAV_LINKS } from '../data/content';
import SiteLink from './NavLink';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => setMenuOpen(false), [location]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  return (
    <>
      <header className={`site-header${menuOpen ? ' menu-open' : ''}`}>
        <Link to="/" className="brand" aria-label="Dev Satish, home">
          <span className="brand-kanji">
            開発<b>物語</b>
          </span>
          <span className="brand-latin">DEVMONOGATARI</span>
        </Link>
        <nav className="desktop-nav" aria-label="Main">
          {NAV_LINKS.map((item) => {
            const active = item.to && location.pathname.startsWith(item.to);
            return (
              <SiteLink key={item.label} item={item} className={`nav-link${active ? ' nav-active' : ''}`}>
                <span>{item.kanji}</span>
                {item.label}
              </SiteLink>
            );
          })}
        </nav>
        <button
          type="button"
          className="hamburger"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
        >
          {menuOpen ? '閉' : '目'}
        </button>
      </header>

      <div className={`mobile-menu${menuOpen ? ' open' : ''}`} aria-hidden={!menuOpen}>
        {NAV_LINKS.map((item) => (
          <SiteLink key={item.label} item={item} className="mobile-nav-link" onClick={() => setMenuOpen(false)}>
            <span>{item.kanji}</span>
            {item.label}
          </SiteLink>
        ))}
      </div>
    </>
  );
}
