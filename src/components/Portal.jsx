import { lazy, Suspense, useEffect, useState } from 'react';
import { MODEL } from '../data/content';
import { stageProgress } from '../lib/store';
import { fileExists } from '../hooks/usePortfolioEffects';

const HeroStage = lazy(() => import('../three/HeroStage'));

// A rectangular portal in the hero. When a model exists in public/models/, a 3D rendering
// plays inside it; until then it's an empty frame. Three.js is only downloaded if needed.
export default function Portal() {
  const [url, setUrl] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      for (const candidate of MODEL.candidates) {
        const full = `${import.meta.env.BASE_URL}${candidate}`;
        // eslint-disable-next-line no-await-in-loop
        if (await fileExists(full)) {
          if (alive) setUrl(full);
          return;
        }
      }
      stageProgress.set(1); // nothing to load: let the intro finish
    })();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div
      className="portal"
      {...(url
        ? { tabIndex: 0, role: 'img', 'aria-label': '3D scene. Hover or focus to interact.' }
        : { 'aria-hidden': true })}
    >
      {url && (
        <Suspense fallback={null}>
          <HeroStage url={url} />
        </Suspense>
      )}
    </div>
  );
}
