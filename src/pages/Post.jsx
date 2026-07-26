import { useParams, Link } from 'react-router-dom';
import { MDXProvider } from '@mdx-js/react';
import MDXComponents from '../components/MDXComponents';
import { getPost } from '../lib/blog';

export default function Post() {
  const { category, slug } = useParams();
  const post = getPost(category, slug);

  if (!post) {
    return (
      <main className="blog-page" style={{ padding: 'clamp(64px, 8vw, 90px) clamp(16px, 5vw, 64px)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <p>Post not found.</p>
          <Link
            to="/blog"
            className="nbtn"
            style={{
              marginTop: '24px',
              display: 'inline-flex',
              lineHeight: 1,
              padding: '10px 16px',
            }}
          >
            Back to Blog
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="blog-page" style={{ padding: 'clamp(64px, 8vw, 90px) clamp(16px, 5vw, 64px)' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '18px', marginBottom: '30px' }}>
          <div>
            <span className="sticker" style={{ background: '#fcf8f9', color: '#1b1b1c' }}>{post.category}</span>
            <h1 style={{ fontFamily: "'Anybody',sans-serif", fontSize: 'clamp(42px, 6vw, 66px)', lineHeight: 1, marginTop: '18px' }}>
              {post.title}
            </h1>
            <p style={{ color: '#5c3f42', marginTop: '16px' }}>{new Date(post.date).toLocaleDateString()}</p>
          </div>
          <Link
            to="/blog"
            className="nbtn"
            style={{
              background: '#e51152',
              color: '#fff',
              lineHeight: 1,
              padding: '10px 16px',
            }}
          >
            Back to Blog
          </Link>
        </div>

        {post.coverImage && (
          <img src={post.coverImage} alt={post.title} style={{ width: '100%', marginBottom: '32px', border: '3px solid #1b1b1c' }} />
        )}

        <article className="blog-post-content" style={{ color: '#1b1b1c', lineHeight: 1.8 }}>
          <MDXProvider components={MDXComponents}>
            <post.Component />
          </MDXProvider>
        </article>
      </div>
    </main>
  );
}
