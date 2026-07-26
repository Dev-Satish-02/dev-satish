import { Link, useParams } from 'react-router-dom';
import { getAllPosts, getCategories, getPostsByCategory } from '../lib/blog';

export default function Blog() {
  const { category } = useParams();
  const categories = getCategories();
  const posts = category ? getPostsByCategory(category) : getAllPosts();
  const selectedCategory = categories.find((item) => item.categorySlug === category);

  return (
    <main className="blog-page" style={{ padding: 'clamp(64px, 8vw, 90px) clamp(16px, 5vw, 64px)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '20px', marginBottom: '40px' }}>
          <div style={{ maxWidth: '680px' }}>
            <h1 style={{ fontFamily: "'Anybody',sans-serif", fontSize: 'clamp(42px, 6vw, 66px)', lineHeight: 1, marginBottom: '16px' }}>
              Blog
            </h1>
            <p style={{ maxWidth: '640px', fontSize: '16px', lineHeight: 1.8, color: '#5c3f42' }}>
              A library of essays, reviews, and strategy notes organized by category.
              {selectedCategory ? ` Showing ${selectedCategory.category} posts.` : ' Browse the categories to find an article that fits your interests.'}
            </p>
          </div>
          <Link to="/" className="nbtn" style={{ background: '#e51152', color: '#fff' }}>
            Back Home
          </Link>
        </div>

        <div className="blog-categories">
          <Link to="/blog" className={`tag ${!category ? 'nav-active' : ''}`}>
            All
          </Link>
          {categories.map((item) => (
            <Link
              key={item.categorySlug}
              to={`/blog/${item.categorySlug}`}
              className={`tag ${category === item.categorySlug ? 'nav-active' : ''}`}
              style={{ marginLeft: '10px' }}
            >
              {item.category}
            </Link>
          ))}
        </div>

        <div className="blog-grid" style={{ marginTop: '32px' }}>
          {posts.map((post) => (
            <Link key={post.slug} to={`/blog/${post.categorySlug}/${post.slug}`} className="blog-card">
              {post.coverImage && (
                <img src={post.coverImage} alt={post.title} className="blog-card-image" />
              )}
              <div style={{ padding: '24px' }}>
                <span className="sticker" style={{ background: '#fcf8f9', color: '#1b1b1c', borderColor: '#1b1b1c' }}>
                  {post.category}
                </span>
                <p className="blog-card-date" style={{ margin: '16px 0 8px', color: '#5c3f42' }}>{new Date(post.date).toLocaleDateString()}</p>
                <h2 className="blog-title" style={{ fontFamily: "'Anybody',sans-serif", fontSize: 'clamp(22px, 3vw, 32px)', marginBottom: '16px' }}>
                  {post.title}
                </h2>
                <p style={{ color: '#5c3f42', lineHeight: 1.7 }}>{post.summary}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '18px' }}>
                  {post.tags.map((tag) => (
                    <span key={tag} className="tag" style={{ background: '#fff' }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
