import { useEffect, useRef } from 'react';
import { getAllPosts, seasonFor } from '../lib/blog';
import { fullMotion } from '../lib/store';

/* The blog pages stand in the same library as the home page's Writing section: the night set
   from src/three/episodes.js, held still a little way down the aisle. */
export default function LibraryBackdrop() {
  const holder = useRef(null);
  useEffect(() => {
    let stage;
    let alive = true;
    import('../three/episodes')
      .then(({ createEpisodes }) => {
        if (!alive) return;
        const posts = getAllPosts()
          .slice(0, 4)
          .map((p) => ({ title: p.title, season: seasonFor(p.categorySlug) }));
        stage = createEpisodes(holder.current, { stations: [], skills: [], education: [], posts }, 'night');
        stage.setStill(!fullMotion());
        stage.setView('night', 0.18);
      })
      .catch((err) => console.warn('[library] staying with the flat field', err));
    return () => {
      alive = false;
      stage?.dispose();
    };
  }, []);
  return (
    <div className="library-backdrop" aria-hidden="true">
      <div ref={holder} className="stage-canvas" />
    </div>
  );
}
