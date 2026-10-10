import { Link, useParams } from 'react-router-dom';
import Scene from '../components/Scene';
import PostCard from '../components/PostCard';
import { getCategories, getPostsByCategory } from '../lib/blog';
import { useScrollReveal } from '../hooks/usePortfolioEffects';

export default function Blog() {
  const { category } = useParams();
  const categories = getCategories();
  const posts = getPostsByCategory(category);
  const selected = categories.find((c) => c.categorySlug === category);

  useScrollReveal(category || 'all');

  return (
    <main id="main">
      <Scene id="writing" season="rain" label="Interlude" title="Writing" className="page-head"
        lede={selected ? `${selected.category}: ${selected.count} post${selected.count === 1 ? '' : 's'}.` : 'Notes on product, strategy and books.'}
      >
        <nav className="filters reveal" aria-label="Categories">
          <Link to="/blog" className={`filter${!category ? ' is-active' : ''}`} aria-current={!category ? 'page' : undefined}>
            All
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
      <section className="paper-section" data-season="none">
        <div className="paper-inner">
          {posts.length ? (
            <div className="post-grid post-grid--list">
              {posts.map((post, i) => (
                <PostCard key={`${post.categorySlug}/${post.slug}`} post={post} index={i} />
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
