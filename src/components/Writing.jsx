import { Link } from 'react-router-dom';
import Catalogue from './Catalogue';
import { getAllPosts } from '../lib/blog';
import { useReveal } from '../hooks/useReveal';

// Interlude, in the library: the writing is kept as a catalogue of volumes.
export default function Writing() {
  const all = getAllPosts();
  const ref = useReveal();
  // volumes count up from the oldest post
  const volumeOf = (post) => all.length - all.indexOf(post);
  return (
    <section id="blog" className="ep ep-library" aria-labelledby="blog-title">
      <header className="ep-head">
        <p className="ep-label">Interlude</p>
        <h2 id="blog-title" className="ep-title">
          Writing
        </h2>
        <p className="ep-lede">Notes on product, strategy and the books I read.</p>
      </header>
      <div ref={ref} className="library-shelf">
        <Catalogue posts={all.slice(0, 4)} volumeOf={volumeOf} />
        <Link to="/blog" className="library-more">
          The whole catalogue
        </Link>
      </div>
    </section>
  );
}
