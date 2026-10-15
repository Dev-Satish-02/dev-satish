import { PROFILE, SOCIALS } from '../data/content';

export default function Footer() {
  return (
    <footer className="site-footer">
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
        <span>
          © {new Date().getFullYear()} {PROFILE.name}
        </span>
        <span>{PROFILE.location}</span>
      </div>
    </footer>
  );
}
