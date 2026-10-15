import { SCENE_BY_SEASON } from './scenes/Scenes';

// A full-bleed section whose season illustration stays pinned while its content scrolls over it.
export default function Scene({ id, season, no, label, title, lede, align, className = '', children, art = true, backdrop }) {
  const Art = SCENE_BY_SEASON[season];
  return (
    <section
      id={id}
      className={`scene scene--${season} ${className}`}
      data-season={season}
      data-scene-no={no}
      data-scene-label={label}
      aria-labelledby={title ? `${id}-title` : undefined}
    >
      {art && Art && (
        <div className="scene-bg" aria-hidden="true">
          <div className="scene-bg-pin">
            <Art className="scene-art" align={align} />
          </div>
        </div>
      )}
      {backdrop}
      <div className="scene-body">
        {title && (
          <header className="scene-head reveal">
            <p className="scene-tag mono">
              <span>Scene {no}</span>
              <span>{label}</span>
            </p>
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
