import { Link } from 'react-router-dom';
import { CHAPTERS } from '../data/content';
import { categoryStyle, formatDate } from '../lib/blog';

// A novel's table of contents (目次): one row per post.
export default function PostList({ posts }) {
  return (
    <ol className="toc">
      {posts.map((post, i) => (
        <li key={`${post.categorySlug}/${post.slug}`} className="toc-item reveal">
          <Link to={`/blog/${post.categorySlug}/${post.slug}`}>
            <span className="toc-no">{CHAPTERS[i] || `其ノ${i + 1}`}</span>
            <span className="toc-cat">{categoryStyle(post.categorySlug).kanji}</span>
            <span className="toc-main">
              <span className="toc-title" style={{ display: 'block' }}>
                {post.title}
              </span>
              {post.summary && (
                <span className="toc-summary" style={{ display: 'block' }}>
                  {post.summary}
                </span>
              )}
            </span>
            <span className="toc-date">{formatDate(post.date)}</span>
          </Link>
        </li>
      ))}
    </ol>
  );
}
