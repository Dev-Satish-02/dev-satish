import { Link } from 'react-router-dom';
import Catalogue from './Catalogue';
import { chooseVolume } from './SceneStage';
import { getAllPosts } from '../lib/blog';
import { useReveal } from '../hooks/useReveal';

/* The interlude, in the library. The posts are four of the spines on the shelf behind; the
   catalogue card lists them, and choosing one brings its spine forward. */
export default function Writing() {
  const all = getAllPosts();
  const open = useReveal();
  const card = useReveal();
  const volumeOf = (post) => all.length - all.indexOf(post);
  return (
    <section id="blog" className="ep ep-library" aria-labelledby="blog-title">
      <div ref={open} className="ep-card ep-open">
        <p className="scene-tag mono">
          <span>Interlude</span>
          <span>The library</span>
        </p>
        <h2 id="blog-title" className="ep-title">
          Writing
        </h2>
        <p className="ep-summary">Notes on product, strategy and the books I read.</p>
      </div>
      <div ref={card} className="ep-card shelf-card">
        <p className="scene-tag mono">
          <span>Catalogue</span>
          <span>{all.length} volumes</span>
        </p>
        <Catalogue posts={all.slice(0, 4)} volumeOf={volumeOf} onChoose={chooseVolume} />
        <Link to="/blog" className="shelf-more mono">
          The whole catalogue
        </Link>
      </div>
    </section>
  );
}
