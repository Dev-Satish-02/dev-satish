import { Link } from 'react-router-dom';
import { formatDate, seasonFor } from '../lib/blog';

// A post as an episode title card: a flat colour field, the chapter, a big serif title.
// On hover it cuts to black with red type, the series' red/black swap.
export default function TitleCard({ post, chapter }) {
  return (
    <Link to={`/blog/${post.categorySlug}/${post.slug}`} className={`tcard season-${seasonFor(post.categorySlug)} reveal`}>
      <span className="tcard-top">Chapter {chapter}</span>
      <span className="tcard-title">{post.title}</span>
      <span className="tcard-foot">
        {post.category}, <time>{formatDate(post.date)}</time>
      </span>
    </Link>
  );
}
