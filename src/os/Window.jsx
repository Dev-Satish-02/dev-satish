import { useRef, useState } from 'react';

const MIN_W = 340;
const MIN_H = 220;
const SNAP = 6; // a drag that reaches this close to the top of the screen fills it

/* A Mac window: drag it by the top strip, resize it from any edge or corner, and close /
   minimise / full-screen it with the three lights. Dragging to the top edge fills the screen;
   dragging a full-screen window by its top strip brings it back to its floating size under the
   pointer. The top 44px of every window is the drag strip; apps leave that space clear. */

function Glyph({ kind }) {
  // drawn rather than typed, so each mark sits dead centre in its light
  if (kind === 'close') return <path d="M2.2 2.2l3.6 3.6M5.8 2.2L2.2 5.8" />;
  if (kind === 'min') return <path d="M1.6 4h4.8" />;
  return (
    <>
      <path className="fill" d="M1.7 1.7h3.4L1.7 5.1z" />
      <path className="fill" d="M6.3 6.3H2.9l3.4-3.4z" />
    </>
  );
}

export default function Window({ app, title, caption, frame, z, focused, zoomed, onFocus, onMove, onClose, onMinimize, onZoom, onSnap, children }) {
  const drag = useRef(null);
  const [snapping, setSnapping] = useState(false);

  const down = (e) => {
    if (e.button !== 0 || e.target.closest('button, input, a')) return;
    onFocus();
    drag.current = zoomed
      ? { pending: true, sx: e.clientX, sy: e.clientY }
      : { x: e.clientX - frame.x, y: e.clientY - frame.y };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const move = (e) => {
    const d = drag.current;
    if (!d) return;
    if (d.pending) {
      // pulling a full-screen window: once it moves, it drops back to its floating size, keeping
      // the same spot of its title bar under the pointer
      if (Math.hypot(e.clientX - d.sx, e.clientY - d.sy) < 6) return;
      const share = e.clientX / window.innerWidth;
      const x = Math.round(e.clientX - frame.w * share);
      const y = Math.max(28, e.clientY - 18);
      drag.current = { x: e.clientX - x, y: e.clientY - y };
      onSnap(false, { ...frame, x, y });
      return;
    }
    const x = e.clientX - d.x;
    const y = Math.max(28, e.clientY - d.y);
    setSnapping(e.clientY <= SNAP);
    onMove({ ...frame, x, y });
  };
  const up = (e) => {
    const d = drag.current;
    drag.current = null;
    if (snapping || (d && !d.pending && e.clientY <= SNAP)) onSnap(true);
    setSnapping(false);
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

  const style = zoomed ? { zIndex: z } : { zIndex: z, left: frame.x, top: frame.y, width: frame.w, height: frame.h };

  return (
    <>
      {snapping && <div className="snap-ghost" aria-hidden="true" />}
      <section
        className={`win win-${app}${focused ? ' is-focused' : ''}${zoomed ? ' is-zoomed' : ''}`}
        style={style}
        aria-label={title}
        onPointerDown={onFocus}
      >
        <div className="win-bar" onPointerDown={down} onPointerMove={move} onPointerUp={up} onDoubleClick={onZoom}>
          <div className="lights">
            {[
              ['close', onClose, `Close ${title}`],
              ['min', onMinimize, `Minimise ${title}`],
              ['zoom', onZoom, zoomed ? `Restore ${title}` : `Maximise ${title}`],
            ].map(([kind, run, label]) => (
              <button key={kind} type="button" className={`light light-${kind}`} aria-label={label} onClick={run}>
                <svg viewBox="0 0 8 8" aria-hidden="true">
                  <Glyph kind={kind} />
                </svg>
              </button>
            ))}
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
    </>
  );
}
