import { useRef } from 'react';

const MIN_W = 340;
const MIN_H = 220;

/* A Mac window: drag it by the top strip, resize it from any edge or corner, and close /
   minimise / zoom with the three lights.
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

  // resizing from any edge or corner; edges are named by the sides they move (n, e, s, w)
  const size = useRef(null);
  const grab = (edge) => (e) => {
    if (e.button !== 0 || zoomed) return;
    e.stopPropagation();
    onFocus();
    size.current = { edge, x: e.clientX, y: e.clientY, f: frame };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const stretch = (e) => {
    const s = size.current;
    if (!s) return;
    const dx = e.clientX - s.x;
    const dy = e.clientY - s.y;
    let { x, y, w, h } = s.f;
    if (s.edge.includes('e')) w = Math.max(MIN_W, s.f.w + dx);
    if (s.edge.includes('s')) h = Math.max(MIN_H, s.f.h + dy);
    if (s.edge.includes('w')) {
      w = Math.max(MIN_W, s.f.w - dx);
      x = s.f.x + s.f.w - w;
    }
    if (s.edge.includes('n')) {
      h = Math.max(MIN_H, s.f.h - dy);
      y = Math.max(28, s.f.y + s.f.h - h);
      h = s.f.y + s.f.h - y;
    }
    onMove({ ...frame, x, y, w, h });
  };
  const release = () => {
    size.current = null;
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
      {!zoomed &&
        ['n', 'e', 's', 'w', 'ne', 'nw', 'se', 'sw'].map((edge) => (
          <span
            key={edge}
            className={`grip grip-${edge}`}
            onPointerDown={grab(edge)}
            onPointerMove={stretch}
            onPointerUp={release}
            aria-hidden="true"
          />
        ))}
    </section>
  );
}
