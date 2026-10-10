import { PROFILE, SOCIALS } from '../data/content';
import { PowerLines } from './Scenery';

export default function Hero() {
  const github = SOCIALS.find((s) => s.label === 'GitHub');
  const [first, ...rest] = PROFILE.name.split(' ');

  return (
    <section id="hero" className="hero">
      <div className="hero-text">
        <PowerLines className="hero-scenery" />
        <div className="hero-episode reveal">
          <span className="chapter">第零話</span>
          <span className="arc">「かいはつモノガタリ」</span>
        </div>
        <h1 className="hero-name reveal">
          {first}
          <br />
          <span className="red">{rest.join(' ')}</span>
        </h1>
        <p className="hero-kana reveal">{PROFILE.kana}</p>
        <p className="hero-role reveal">{PROFILE.title}.</p>
        <p className="hero-intro reveal">{PROFILE.intro}</p>
        <div className="hero-actions reveal">
          <a href="#contact" className="btn">
            Get in touch
          </a>
          <a href={github.href} target="_blank" rel="noreferrer" className="btn btn--ghost">
            GitHub ↗
          </a>
        </div>
        <span className="scroll-cue">Scroll · 下へ</span>
      </div>

      <div className="hero-plate">
        <span className="hero-plate-kanji vertical" aria-hidden="true">
          開発物語
        </span>
        <figure className="portrait" tabIndex={0}>
          <img src={`${import.meta.env.BASE_URL}${PROFILE.portrait}`} alt={`Pixel-art portrait of ${PROFILE.name}`} />
          <figcaption className="portrait-caption">
            <span>No. 001</span>
            <span className="tilt-hint">hover · 首傾げ</span>
          </figcaption>
        </figure>
        <div className="hero-plate-meta">
          {PROFILE.location}
          <br />
          Status · building
        </div>
      </div>
    </section>
  );
}
