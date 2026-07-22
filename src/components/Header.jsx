import { useState } from 'react';
import { NAV_LINKS } from '../data/content';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen((open) => !open);
  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <header id="top" className="site-header">
        <a href="#hero" className="site-header-brand">
          DEV SATISH
        </a>
        <nav className="desktop-nav">
          {NAV_LINKS.map(({ href, label }) => (
            <a key={href} href={href} className="nav-link">
              {label}
            </a>
          ))}
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
        {NAV_LINKS.map(({ href, label }) => (
          <a key={href} href={href} className="mobile-nav-link" onClick={closeMenu}>
            {label}
          </a>
        ))}
      </div>
    </>
  );
}
