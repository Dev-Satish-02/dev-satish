import { Link } from 'react-router-dom';
import { formatDate, seasonFor } from '../lib/blog';

/* The library's catalogue: every post a volume, numbered in the order it was written. On the
   home page, choosing a volume (`onChoose`) brings its spine forward on the shelf behind. */
export default function Catalogue({ posts, volumeOf, onChoose }) {
  return (
    <ol className="catalogue">
      {posts.map((post, i) => (
        <li key={`${post.categorySlug}/${post.slug}`}>
          <Link
            to={`/blog/${post.categorySlug}/${post.slug}`}
            className={`volume shelf-${seasonFor(post.categorySlug)}`}
            onMouseEnter={onChoose ? () => onChoose(i) : undefined}
            onMouseLeave={onChoose ? () => onChoose(-1) : undefined}
            onFocus={onChoose ? () => onChoose(i) : undefined}
            onBlur={onChoose ? () => onChoose(-1) : undefined}
          >
            <span className="volume-no">
              <span className="volume-word mono">Vol.</span>
              {volumeOf(post)}
            </span>
            <span className="volume-body">
              <span className="volume-title">{post.title}</span>
              {post.summary && <span className="volume-summary">{post.summary}</span>}
            </span>
            <span className="volume-meta mono">
              <span>{post.category}</span>
              <time dateTime={post.date.toISOString().slice(0, 10)}>{formatDate(post.date)}</time>
            </span>
          </Link>
        </li>
      ))}
    </ol>
  );
}
