import { Link } from 'react-router-dom';
import { formatDate, seasonFor } from '../lib/blog';

// A post as an episode title card: a flat colour field, a chapter number and a big serif title.
// On hover it cuts to black with red type, the series' red/black swap.
export default function TitleCard({ post, chapter }) {
  return (
    <Link to={`/blog/${post.categorySlug}/${post.slug}`} className={`tcard season-${seasonFor(post.categorySlug)} reveal`}>
      <span className="tcard-top mono">
        <span>Chapter {String(chapter).padStart(2, '0')}</span>
        <span>{post.category}</span>
      </span>
      <span className="tcard-title">{post.title}</span>
      <span className="tcard-foot mono">
        <time>{formatDate(post.date)}</time>
        <span aria-hidden="true">Read →</span>
      </span>
    </Link>
  );
}
