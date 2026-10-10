import { Link } from 'react-router-dom';
import { formatDate, seasonFor } from '../lib/blog';

export default function PostCard({ post, index }) {
  return (
    <Link to={`/blog/${post.categorySlug}/${post.slug}`} className={`post-card season-${seasonFor(post.categorySlug)} reveal`}>
      <span className="post-card-band" aria-hidden="true">
        <span className="mono">{String(index + 1).padStart(2, '0')}</span>
      </span>
      <span className="post-card-body">
        <span className="post-card-meta mono">
          {post.category} · {formatDate(post.date)}
        </span>
        <span className="post-card-title">{post.title}</span>
        {post.summary && <span className="post-card-summary">{post.summary}</span>}
      </span>
    </Link>
  );
}
