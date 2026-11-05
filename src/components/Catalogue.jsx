import { Link } from 'react-router-dom';
import { formatDate, seasonFor } from '../lib/blog';

/* The library's catalogue: every post is a volume, numbered in the order it was written.
   Each entry is a spine laid on its side, coloured by its shelf (category); pointing at one
   pulls it forward, and it opens the post. The newest volume sits open at the top. */
export default function Catalogue({ posts, volumeOf }) {
  return (
    <ol className="catalogue">
      {posts.map((post, i) => (
        <li key={`${post.categorySlug}/${post.slug}`} className={i === 0 ? 'is-latest' : undefined}>
          <Link to={`/blog/${post.categorySlug}/${post.slug}`} className={`volume shelf-${seasonFor(post.categorySlug)}`}>
            <span className="volume-no">
              <span className="volume-word">Vol.</span>
              {volumeOf(post)}
            </span>
            <span className="volume-body">
              <span className="volume-title">{post.title}</span>
              {post.summary && <span className="volume-summary">{post.summary}</span>}
            </span>
            <span className="volume-meta">
              <span>{post.category}</span>
              <time dateTime={post.date.toISOString().slice(0, 10)}>{formatDate(post.date)}</time>
            </span>
          </Link>
        </li>
      ))}
    </ol>
  );
}
