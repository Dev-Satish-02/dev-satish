import { Link, useParams } from 'react-router-dom';
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
      <section className="title-card title-card--red">
        <div className="title-card-inner">
          <p className="scene-tag mono">
            <span>Interlude</span>
            <span>{selected ? selected.category : 'All chapters'}</span>
          </p>
          <h1 className="title-card-title">Writing</h1>
          <p className="title-card-lede">Notes on product, strategy and the books I read.</p>
          <nav className="filters" aria-label="Categories">
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
        </div>
      </section>
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
