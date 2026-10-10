import { EPISODES, PROFILE, SOCIALS } from '../data/content';

// The contact section is staged as the series' 次回予告 (next-episode preview).
export default function Contact() {
  const ep = EPISODES.find((e) => e.id === 'contact');

  return (
    <section id="contact" className="episode tone-red preview">
      <div className="episode-inner">
        <div className="episode-spine reveal" aria-hidden="true">
          <span className="vertical">次回予告</span>
          <span className="vertical small">{ep.no}</span>
        </div>
        <div>
          <p className="eyebrow reveal" style={{ opacity: 0.7 }}>
            Next episode · {ep.label}
          </p>
          <h2 className="preview-title reveal" style={{ marginTop: 14 }}>
            「{ep.arc}」
          </h2>
          <div className="preview-lines reveal">
            <p className="preview-line">
              <span className="who">You</span>
              <span>So, are you open to work?</span>
            </p>
            <p className="preview-line">
              <span className="who">Dev</span>
              <span>Internships, collaborations, interesting problems. I reply to everything.</span>
            </p>
            <p className="preview-line">
              <span className="who">You</span>
              <span>Everything?</span>
            </p>
            <p className="preview-line">
              <span className="who">Dev</span>
              <span>I don&apos;t know everything. I just answer my email.</span>
            </p>
          </div>
          <a href={`mailto:${PROFILE.email}`} className="preview-mail reveal">
            {PROFILE.email}
          </a>
          <div className="preview-links reveal">
            {SOCIALS.map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noreferrer" className="btn btn--sm">
                {s.label} ↗
              </a>
            ))}
            <a href={PROFILE.phoneHref} className="btn btn--sm">
              {PROFILE.phone}
            </a>
          </div>
          <p className="status reveal">Available for opportunities</p>
        </div>
      </div>
    </section>
  );
}
