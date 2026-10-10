import { EPISODES } from '../data/content';

// Wraps a home section as an "episode": a sticky vertical kanji spine on the left,
// and the arc title card (第N話 「…」) above the content.
export default function Episode({ id, tone = 'paper', title, children }) {
  const ep = EPISODES.find((e) => e.id === id);

  return (
    <section id={id} className={`episode tone-${tone}`}>
      <div className="episode-inner">
        <div className="episode-spine reveal" aria-hidden="true">
          <span className="vertical">{ep.kanji}</span>
          <span className="vertical small">{ep.no}</span>
        </div>
        <div>
          <header className="episode-head reveal">
            <p className="eyebrow">
              Episode {ep.num} · {ep.label}
            </p>
            <h2 className="episode-title">{title || <>「{ep.arc}」</>}</h2>
            <p className="episode-sub">{ep.arcEn}</p>
          </header>
          {children}
        </div>
      </div>
    </section>
  );
}
