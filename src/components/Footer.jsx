import { PROFILE, SOCIALS } from '../data/content';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-end">
          つづく
          <small>To be continued</small>
        </div>
        <nav className="footer-links" aria-label="Elsewhere">
          {SOCIALS.map((s) => (
            <a key={s.label} href={s.href} target="_blank" rel="noreferrer" className="footer-link">
              {s.label}
            </a>
          ))}
          <a href={`mailto:${PROFILE.email}`} className="footer-link">
            Email
          </a>
        </nav>
      </div>
      <div className="footer-base">
        <span>© {new Date().getFullYear()} {PROFILE.name} · 開発物語</span>
        <span>A story still being written</span>
      </div>
    </footer>
  );
}
