import { Link, useParams } from 'react-router-dom';
import Scene from '../components/Scene';
import TitleCard from '../components/TitleCard';
import { getAllPosts, getCategories, getPostsByCategory } from '../lib/blog';
import { useScrollReveal } from '../hooks/usePortfolioEffects';

export default function Blog() {
  const { category } = useParams();
  const categories = getCategories();
  const all = getAllPosts();
  const posts = getPostsByCategory(category);
  const selected = categories.find((c) => c.categorySlug === category);

  useScrollReveal(category || 'all');

  // chapters count up from the oldest post, so a post keeps its number when filtered
  const chapterOf = (post) => all.length - all.indexOf(post);

  return (
    <main id="main">
      <Scene
        id="writing"
        season="night"
        no="—"
        label={selected ? selected.category : 'Interlude'}
        title="Writing"
        lede="Notes on product, strategy and the books I read."
        className="page-head"
      >
        <nav className="filters reveal" aria-label="Categories">
          <Link to="/blog" className={`filter${!category ? ' is-active' : ''}`} aria-current={!category ? 'page' : undefined}>
            All <span>{all.length}</span>
          </Link>
          {categories.map((c) => (
            <Link
              key={c.categorySlug}
              to={`/blog/${c.categorySlug}`}
              className={`filter${category === c.categorySlug ? ' is-active' : ''}`}
              aria-current={category === c.categorySlug ? 'page' : undefined}
            >
              {c.category} <span>{c.count}</span>
            </Link>
          ))}
        </nav>
      </Scene>
      <section className="paper-section">
        <div className="paper-inner">
          {posts.length ? (
            <div className="tcard-grid">
              {posts.map((post) => (
                <TitleCard key={`${post.categorySlug}/${post.slug}`} post={post} chapter={chapterOf(post)} />
              ))}
            </div>
          ) : (
            <p className="empty">Nothing here yet.</p>
          )}
        </div>
      </section>
    </main>
  );
}
