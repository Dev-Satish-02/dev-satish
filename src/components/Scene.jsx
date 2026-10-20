import { useEffect, useRef } from 'react';
import { SCENE_BY_SEASON } from './scenes/Scenes';
import { fullMotion } from '../lib/store';

// A full-bleed section whose season illustration stays pinned while its content scrolls
// over it. As the section scrolls, the illustration's planes drift at different rates
// (near ones further), which is what gives the flat drawings their depth.
export default function Scene({ id, season, title, lede, align, className = '', children, art = true, backdrop, artProps }) {
  const Art = SCENE_BY_SEASON[season];
  const section = useRef(null);
  const pin = useRef(null);

  useEffect(() => {
    if (!art || !Art || !fullMotion()) return undefined;
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = section.current.getBoundingClientRect();
      // 0 when the illustration pins, 1 when it lets go; seams rely on these end frames
      const span = Math.max(1, r.height - window.innerHeight);
      const q = Math.min(1, Math.max(0, -r.top / span));
      // planes only ever drift down, so no plane uncovers the bottom of the frame
      pin.current.style.setProperty('--sp', `${((1 - q) * 120).toFixed(1)}px`);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
    };
  }, [art, Art]);

  return (
    <section ref={section} id={id} className={`scene scene--${season} ${className}`} data-season={season} aria-labelledby={title ? `${id}-title` : undefined}>
      {art && Art && (
        <div className="scene-bg" aria-hidden="true">
          <div ref={pin} className="scene-bg-pin">
            <Art className="scene-art" align={align} {...artProps} />
          </div>
        </div>
      )}
      {backdrop}
      <div className="scene-body">
        {title && (
          <header className="scene-head reveal">
            <h2 id={`${id}-title`} className="scene-title">
              {title}
            </h2>
            {lede && <p className="scene-lede">{lede}</p>}
          </header>
        )}
        {children}
      </div>
    </section>
  );
}
