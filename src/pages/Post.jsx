import { Link, useParams } from 'react-router-dom';
import { MDXProvider } from '@mdx-js/react';
import MDXComponents from '../components/MDXComponents';
import { formatDate, getAdjacentPosts, getAllPosts, getPost, seasonFor } from '../lib/blog';
import { useScrollReveal } from '../hooks/usePortfolioEffects';

export default function Post() {
  const { category, slug } = useParams();
  const post = getPost(category, slug);
  useScrollReveal(`${category}/${slug}`);

  if (!post) {
    return (
      <main id="main">
        <section className="title-card title-card--ink">
          <div className="title-card-inner">
            <p className="scene-tag mono">
              <span>Interlude</span>
              <span>Missing chapter</span>
            </p>
            <h1 className="title-card-title">This chapter doesn&apos;t exist.</h1>
            <Link to="/blog" className="btn btn--paper" style={{ marginTop: 28 }}>
              All writing
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const all = getAllPosts();
  const chapter = all.length - all.indexOf(post);
  const { newer, older } = getAdjacentPosts(post.categorySlug, post.slug);

  return (
    <main id="main">
      <section className={`title-card season-${seasonFor(post.categorySlug)}`}>
        <div className="title-card-inner">
          <p className="scene-tag mono">
            <Link to={`/blog/${post.categorySlug}`} className="back-link">
              ← {post.category}
            </Link>
            <span>Chapter {String(chapter).padStart(2, '0')}</span>
          </p>
          <h1 className="title-card-title title-card-title--post">{post.title}</h1>
          {post.summary && <p className="title-card-lede">{post.summary}</p>}
          <p className="post-meta mono">
            <time>{formatDate(post.date)}</time>
            {post.tags.map((t) => (
              <span key={t}>#{t}</span>
            ))}
          </p>
        </div>
      </section>
      <section className="paper-section">
        <article className="prose">
          <MDXProvider components={MDXComponents}>
            <post.Component />
          </MDXProvider>
          <p className="post-end">To be continued</p>
        </article>
        <nav className="post-nav" aria-label="More writing">
          {older ? (
            <Link to={`/blog/${older.categorySlug}/${older.slug}`}>
              <span className="mono">← Previous chapter</span>
              <strong>{older.title}</strong>
            </Link>
          ) : (
            <span />
          )}
          <Link to={newer ? `/blog/${newer.categorySlug}/${newer.slug}` : '/blog'} className="post-nav-next">
            <span className="mono">{newer ? 'Next chapter →' : 'All writing →'}</span>
            <strong>{newer ? newer.title : 'Writing'}</strong>
          </Link>
        </nav>
      </section>
    </main>
  );
}
