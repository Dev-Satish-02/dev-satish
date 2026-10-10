import { Link, useParams } from 'react-router-dom';
import { MDXProvider } from '@mdx-js/react';
import MDXComponents from '../components/MDXComponents';
import { categoryStyle, formatDate, getAdjacentPosts, getPost } from '../lib/blog';

export default function Post() {
  const { category, slug } = useParams();
  const post = getPost(category, slug);

  if (!post) {
    return (
      <main>
        <section className="page-card tone-ink">
          <div className="page-card-kanji" aria-hidden="true">
            無
          </div>
          <div className="page-card-inner">
            <p className="eyebrow">404 · Missing chapter</p>
            <h1 className="page-title">This chapter doesn&apos;t exist.</h1>
            <div style={{ marginTop: 32 }}>
              <Link to="/blog" className="btn btn--paper">
                ← Back to the notes
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  const style = categoryStyle(post.categorySlug);
  const { newer, older } = getAdjacentPosts(post.categorySlug, post.slug);

  return (
    <main>
      <section className={`page-card tone-${style.color}`}>
        <div className="page-card-kanji" aria-hidden="true">
          {style.kanji}
        </div>
        <div className="page-card-inner">
          <Link to={`/blog/${post.categorySlug}`} className="back-link">
            ← {style.kanji} · {post.category}
          </Link>
          <h1 className="page-title">{post.title}</h1>
          {post.summary && <p className="page-lede">{post.summary}</p>}
          <div className="post-meta">
            <span>{formatDate(post.date)}</span>
            {post.tags.map((tag) => (
              <span key={tag}>#{tag}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="page-body">
        <div className="post-layout">
          <aside className="post-aside" aria-hidden="true">
            <span className="vertical">{style.kanji}</span>
          </aside>
          <div>
            <article className="prose">
              <MDXProvider components={MDXComponents}>
                <post.Component />
              </MDXProvider>
            </article>

            <div className="post-end">
              <div className="post-end-mark">（終）</div>
            </div>

            <nav className="post-nav" aria-label="More notes">
              {older ? (
                <Link to={`/blog/${older.categorySlug}/${older.slug}`}>
                  <span className="eyebrow">← Previous chapter</span>
                  <span className="t">{older.title}</span>
                </Link>
              ) : (
                <span className="empty" />
              )}
              {newer ? (
                <Link to={`/blog/${newer.categorySlug}/${newer.slug}`}>
                  <span className="eyebrow">Next chapter →</span>
                  <span className="t">{newer.title}</span>
                </Link>
              ) : (
                <Link to="/blog">
                  <span className="eyebrow">目次 →</span>
                  <span className="t">All notes</span>
                </Link>
              )}
            </nav>
          </div>
        </div>
      </section>
    </main>
  );
}
