import { useRef } from 'react';

/* A Mac window: drag it by the top strip, close / minimise / zoom with the three lights.
   The top 44px of every window is the drag strip; apps leave that space clear. */
export default function Window({ app, title, caption, frame, z, focused, zoomed, onFocus, onMove, onClose, onMinimize, onZoom, children }) {
  const drag = useRef(null);

  const down = (e) => {
    if (e.button !== 0 || e.target.closest('button, input, a')) return;
    onFocus();
    if (zoomed) return;
    drag.current = { x: e.clientX - frame.x, y: e.clientY - frame.y };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const move = (e) => {
    if (!drag.current) return;
    const x = e.clientX - drag.current.x;
    const y = Math.max(28, e.clientY - drag.current.y);
    onMove({ ...frame, x, y });
  };
  const up = () => {
    drag.current = null;
  };

  const style = zoomed
    ? { zIndex: z }
    : { zIndex: z, left: frame.x, top: frame.y, width: frame.w, height: frame.h };

  return (
    <section
      className={`win win-${app}${focused ? ' is-focused' : ''}${zoomed ? ' is-zoomed' : ''}`}
      style={style}
      aria-label={title}
      onPointerDown={onFocus}
    >
      <div className="win-bar" onPointerDown={down} onPointerMove={move} onPointerUp={up} onDoubleClick={onZoom}>
        <div className="lights">
          <button type="button" className="light light-close" aria-label={`Close ${title}`} onClick={onClose}>
            <span aria-hidden="true">✕</span>
          </button>
          <button type="button" className="light light-min" aria-label={`Minimise ${title}`} onClick={onMinimize}>
            <span aria-hidden="true">−</span>
          </button>
          <button type="button" className="light light-zoom" aria-label={`Zoom ${title}`} onClick={onZoom}>
            <span aria-hidden="true">+</span>
          </button>
        </div>
        <span className="win-title">{caption}</span>
      </div>
      <div className="win-body">{children}</div>
    </section>
  );
}
