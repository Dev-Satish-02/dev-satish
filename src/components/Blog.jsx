import { Link } from 'react-router-dom';
import { getAllPosts } from '../lib/blog';

export default function Blog() {
  const posts = getAllPosts().slice(0, 3);

  return (
    <section
      id="blog"
      style={{
        padding: 'clamp(48px,8vw,80px) clamp(16px,5vw,64px)',
        background: '#f0edee',
        borderTop: '3px solid #1b1b1c',
        borderBottom: '3px solid #1b1b1c',
      }}
    >
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div className="reveal" style={{ marginBottom: '48px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          <div>
            <h2 className="s-banner" style={{ fontSize: 'clamp(18px,3.5vw,30px)' }}>
              THE BLOG
            </h2>
          </div>
          <Link to="/blog" className="nbtn" style={{ background: '#fff', color: '#1b1b1c', padding: '10px 20px', fontSize: '12px' }}>
            View all blogs →
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(min(100%,320px),1fr))', gap: '24px' }}>
          {posts.map((post) => (
            <Link
              key={post.slug}
              to={`/blog/${post.categorySlug}/${post.slug}`}
              className="ncard blog-card reveal"
              style={{ padding: 0, overflow: 'hidden', textDecoration: 'none', color: 'inherit', transition: 'transform .15s' }}
            >
              <div style={{ background: '#fff', borderBottom: '3px solid #1b1b1c', padding: '20px', position: 'relative' }}>
                <div className="sticker" style={{ background: '#fcf8f9', color: '#1b1b1c', fontSize: '10px', position: 'absolute', top: '14px', right: '14px' }}>
                  {post.category}
                </div>
                <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '8px', color: '#5c3f42' }}>
                  {new Date(post.date).toLocaleDateString()}
                </p>
                <h3 className="blog-title" style={{ fontFamily: "'Anybody',sans-serif", fontWeight: 900, fontSize: '18px', textTransform: 'uppercase', lineHeight: 1.2, color: '#1b1b1c' }}>
                  {post.title}
                </h3>
              </div>
              <div style={{ padding: '20px' }}>
                <p style={{ fontSize: '12px', lineHeight: 1.7, color: '#5c3f42', marginBottom: '16px' }}>{post.summary}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {post.tags.map((tag) => (
                      <span key={tag} className="tag" style={tag.bg ? { background: tag.bg } : undefined}>
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span className="nbtn" style={{ background: '#1b1b1c', color: '#fff', padding: '7px 14px', fontSize: '10px' }}>
                    Read →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
