import { Link, useParams } from 'react-router-dom';
import { MDXProvider } from '@mdx-js/react';
import Scene from '../components/Scene';
import MDXComponents from '../components/MDXComponents';
import { formatDate, getAdjacentPosts, getPost, seasonFor } from '../lib/blog';
import { useScrollReveal } from '../hooks/usePortfolioEffects';

export default function Post() {
  const { category, slug } = useParams();
  const post = getPost(category, slug);
  useScrollReveal(`${category}/${slug}`);

  if (!post) {
    return (
      <main id="main">
        <Scene id="missing" season="rain" label="Interlude" title="This post doesn't exist." className="page-head">
          <Link to="/blog" className="btn btn--paper">
            Back to all posts
          </Link>
        </Scene>
      </main>
    );
  }

  const { newer, older } = getAdjacentPosts(post.categorySlug, post.slug);

  return (
    <main id="main">
      <Scene id="post" season="rain" label={post.category} className={`page-head post-head season-${seasonFor(post.categorySlug)}`}>
        <div className="post-head-inner">
          <Link to={`/blog/${post.categorySlug}`} className="back-link mono">
            ← {post.category}
          </Link>
          <h1 className="post-title">{post.title}</h1>
          {post.summary && <p className="post-summary">{post.summary}</p>}
          <p className="post-meta mono">
            <time>{formatDate(post.date)}</time>
            {post.tags.map((t) => (
              <span key={t}>#{t}</span>
            ))}
          </p>
        </div>
      </Scene>
      <section className="paper-section" data-season="none">
        <article className="prose">
          <MDXProvider components={MDXComponents}>
            <post.Component />
          </MDXProvider>
          <p className="post-end">End</p>
        </article>
        <nav className="post-nav" aria-label="More posts">
          {older ? (
            <Link to={`/blog/${older.categorySlug}/${older.slug}`}>
              <span className="mono">← Previous</span>
              <strong>{older.title}</strong>
            </Link>
          ) : (
            <span />
          )}
          <Link to={newer ? `/blog/${newer.categorySlug}/${newer.slug}` : '/blog'} className="post-nav-next">
            <span className="mono">{newer ? 'Next →' : 'All posts →'}</span>
            <strong>{newer ? newer.title : 'Writing'}</strong>
          </Link>
        </nav>
      </section>
    </main>
  );
}
