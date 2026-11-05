import { Link, useParams } from 'react-router-dom';
import Catalogue from '../components/Catalogue';
import LibraryBackdrop from '../components/LibraryBackdrop';
import { getAllPosts, getCategories, getPostsByCategory } from '../lib/blog';
import '../styles/episodes.css';

/* The full catalogue, in the same library as the home page's Writing section: the aisle behind,
   the category filters as shelf marks, and every volume on the card. */
export default function Blog() {
  const { category } = useParams();
  const categories = getCategories();
  const all = getAllPosts();
  const posts = getPostsByCategory(category);

  // volumes count up from the oldest post, so a post keeps its number when filtered
  const volumeOf = (post) => all.length - all.indexOf(post);

  return (
    <main id="main" className="library-page">
      <LibraryBackdrop />
      <section id="writing" className="ep ep-library ep-library--page" aria-labelledby="writing-title">
        <div className="ep-card ep-open is-in">
          <p className="scene-tag mono">
            <span>Interlude</span>
            <span>The library</span>
          </p>
          <h1 id="writing-title" className="ep-title">
            Writing
          </h1>
          <p className="ep-summary">Notes on product, strategy and the books I read.</p>
          <nav className="shelf-marks mono" aria-label="Categories">
            <Link to="/blog" className={!category ? 'is-active' : undefined} aria-current={!category ? 'page' : undefined}>
              All <span>{all.length}</span>
            </Link>
            {categories.map((c) => (
              <Link
                key={c.categorySlug}
                to={`/blog/${c.categorySlug}`}
                className={category === c.categorySlug ? 'is-active' : undefined}
                aria-current={category === c.categorySlug ? 'page' : undefined}
              >
                {c.category} <span>{c.count}</span>
              </Link>
            ))}
          </nav>
        </div>
        <div className="ep-card shelf-card is-in">
          {posts.length ? <Catalogue posts={posts} volumeOf={volumeOf} /> : <p className="ep-summary">Nothing on this shelf yet.</p>}
        </div>
      </section>
    </main>
  );
}
