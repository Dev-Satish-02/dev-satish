import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { NAV_LINKS } from '../data/content';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => setMenuOpen((open) => !open);
  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <header id="top" className="site-header">
        <Link to="/" className="site-header-brand">
          DEV SATISH
        </Link>
        <nav className="desktop-nav">
          {NAV_LINKS.map(({ href, label }) => {
            const isHash = href.includes('#');
            const isRoute = href.startsWith('/') && !isHash;
            const isActive = isRoute && location.pathname.startsWith(href);

            if (isRoute) {
              return (
                <Link key={href} to={href} className={`nav-link${isActive ? ' nav-active' : ''}`}>
                  {label}
                </Link>
              );
            }

            return (
              <a key={href} href={href} className="nav-link">
                {label}
              </a>
            );
          })}
        </nav>
        <a href="mailto:devsatish08@gmail.com" className="nbtn hire-btn">
          HIRE ME →
        </a>
        <button
          type="button"
          className="hamburger"
          onClick={toggleMenu}
          aria-label="menu"
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </header>

      <div id="mobile-menu" className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
        {NAV_LINKS.map(({ href, label }) => {
          const isHash = href.includes('#');
          const isRoute = href.startsWith('/') && !isHash;
          return isRoute ? (
            <Link key={href} to={href} className="mobile-nav-link" onClick={closeMenu}>
              {label}
            </Link>
          ) : (
            <a key={href} href={href} className="mobile-nav-link" onClick={closeMenu}>
              {label}
            </a>
          );
        })}
      </div>
    </>
  );
}
