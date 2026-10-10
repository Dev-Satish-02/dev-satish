import { Link, useParams } from 'react-router-dom';
import PostList from '../components/PostList';
import { categoryStyle, getCategories, getPostsByCategory } from '../lib/blog';
import { useScrollReveal } from '../hooks/usePortfolioEffects';

export default function Blog() {
  const { category } = useParams();
  const categories = getCategories();
  const posts = getPostsByCategory(category);
  const selected = categories.find((item) => item.categorySlug === category);
  const style = selected ? categoryStyle(selected.categorySlug) : { kanji: '目次', color: 'ink' };

  useScrollReveal(category || 'all');

  return (
    <main>
      <section className={`page-card tone-${style.color}`}>
        <div className="page-card-kanji" aria-hidden="true">
          {style.kanji}
        </div>
        <div className="page-card-inner">
          <p className="eyebrow">第四話 · {selected ? selected.category : 'Notebook Arc'}</p>
          <h1 className="page-title">「かくノート」</h1>
          <p className="page-lede">
            Essays, reviews and strategy notes, one chapter at a time.
            {selected ? ` Showing ${selected.category.toLowerCase()} only.` : ''}
          </p>
          <nav className="filters" aria-label="Categories">
            <Link to="/blog" className={`filter${!category ? ' active' : ''}`}>
              <span>全</span>All
            </Link>
            {categories.map((item) => (
              <Link
                key={item.categorySlug}
                to={`/blog/${item.categorySlug}`}
                className={`filter${category === item.categorySlug ? ' active' : ''}`}
              >
                <span>{categoryStyle(item.categorySlug).kanji}</span>
                {item.category} · {item.count}
              </Link>
            ))}
          </nav>
        </div>
      </section>

      <section className="page-body">
        <div className="page-body-inner">
          {posts.length ? (
            <PostList posts={posts} />
          ) : (
            <p className="serif" style={{ fontSize: 22 }}>
              Nothing here yet. This chapter hasn&apos;t been written.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
