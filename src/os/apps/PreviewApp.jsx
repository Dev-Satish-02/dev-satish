import { useEffect, useRef, useState } from 'react';
import { PROFILE } from '../../data/content';

/* Preview: the résumé, rendered page by page with pdf.js so it reads the same in every browser,
   phones included (an iframe shows only the first page on iOS). Download is one button away. */

const FILE = 'Dev_Satish_Resume.pdf';
const src = `${import.meta.env.BASE_URL}${PROFILE.resume}`;

let pdfjs;
function loadPdfjs() {
  pdfjs ||= Promise.all([import('pdfjs-dist'), import('pdfjs-dist/build/pdf.worker.min.mjs?url')]).then(([lib, worker]) => {
    lib.GlobalWorkerOptions.workerSrc = worker.default;
    return lib;
  });
  return pdfjs;
}

// ask the desk (or the phone) to open Preview, from anywhere on the site
export function viewResume() {
  window.dispatchEvent(new CustomEvent('open-app', { detail: 'preview' }));
}

export function downloadResume() {
  const a = document.createElement('a');
  a.href = src;
  a.download = FILE;
  a.click();
}

function Page({ pdf, n, scale }) {
  const canvas = useRef(null);
  useEffect(() => {
    let task;
    let dead = false;
    pdf.getPage(n).then((page) => {
      if (dead) return;
      const ratio = window.devicePixelRatio || 1;
      const view = page.getViewport({ scale: scale * ratio });
      const c = canvas.current;
      c.width = view.width;
      c.height = view.height;
      c.style.width = `${view.width / ratio}px`;
      c.style.height = `${view.height / ratio}px`;
      task = page.render({ canvasContext: c.getContext('2d'), viewport: view });
      task.promise.catch(() => {});
    });
    return () => {
      dead = true;
      task?.cancel();
    };
  }, [pdf, n, scale]);
  return <canvas ref={canvas} className="pv-page" aria-label={`Page ${n}`} />;
}

export default function PreviewApp({ layout, onClose }) {
  const phone = layout === 'phone';
  const [pdf, setPdf] = useState(null);
  const [failed, setFailed] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [width, setWidth] = useState(0);
  const pane = useRef(null);

  useEffect(() => {
    let alive = true;
    loadPdfjs()
      .then((lib) => lib.getDocument(src).promise)
      .then((doc) => alive && setPdf(doc))
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
    };
  }, []);

  // pages fit the window's width, then the zoom buttons scale from there
  useEffect(() => {
    const el = pane.current;
    if (!el) return undefined;
    const ro = new ResizeObserver(() => setWidth(el.clientWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const fit = width ? Math.max(0.3, (width - (phone ? 16 : 48)) / 612) : 1;
  const scale = fit * zoom;

  return (
    <div className={`pv${phone ? ' ph-app ph-preview' : ''}`}>
      <header className="pv-bar">
        {phone && (
          <button type="button" className="ph-back" onClick={onClose} aria-label="Back">
            <span aria-hidden="true">‹</span>
          </button>
        )}
        <span className="pv-name">
          {FILE}
          {pdf && <em>{pdf.numPages === 1 ? '1 page' : `${pdf.numPages} pages`}</em>}
        </span>
        {!phone && (
          <span className="pv-zoom" role="group" aria-label="Zoom">
            <button type="button" onClick={() => setZoom((z) => Math.max(0.5, +(z - 0.25).toFixed(2)))} aria-label="Zoom out">
              −
            </button>
            <button type="button" onClick={() => setZoom(1)} aria-label="Fit to width">
              {Math.round(zoom * 100)}%
            </button>
            <button type="button" onClick={() => setZoom((z) => Math.min(3, +(z + 0.25).toFixed(2)))} aria-label="Zoom in">
              +
            </button>
          </span>
        )}
        <a className="pv-download" href={src} download={FILE}>
          ⬇ Download
        </a>
      </header>
      <div className="pv-pages" ref={pane}>
        {failed && (
          <p className="pv-note">
            The résumé couldn&apos;t be shown here.{' '}
            <a href={src} download={FILE}>
              Download it instead
            </a>
            .
          </p>
        )}
        {!pdf && !failed && <p className="pv-note">Opening résumé…</p>}
        {pdf && width > 0 && [...Array(pdf.numPages)].map((_, i) => <Page key={i} pdf={pdf} n={i + 1} scale={scale} />)}
      </div>
    </div>
  );
}
