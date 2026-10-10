import { PROFILE, SOCIALS } from '../data/content';
import { Wordmark } from './Header';

export default function Footer() {
  return (
    <footer className="site-footer" data-season="finale">
      <div className="footer-top">
        <p className="footer-tbc">To be continued</p>
        <nav className="footer-links" aria-label="Elsewhere">
          {SOCIALS.map((s) => (
            <a key={s.label} href={s.href} target="_blank" rel="noreferrer">
              {s.label}
            </a>
          ))}
          <a href={`mailto:${PROFILE.email}`}>Email</a>
        </nav>
      </div>
      <div className="footer-base mono">
        <Wordmark small />
        <span>
          © {new Date().getFullYear()} {PROFILE.name}
        </span>
      </div>
    </footer>
  );
}
