import { Link } from 'react-router-dom';
import Scene from './Scene';
import TitleCard from './TitleCard';
import { getAllPosts } from '../lib/blog';

export default function Writing() {
  const all = getAllPosts();
  const posts = all.slice(0, 3);
  return (
    <Scene id="blog" season="night" title="Writing" lede="Notes on product, strategy and the books I read.">
      <div className="tcard-grid">
        {posts.map((post, i) => (
          <TitleCard key={`${post.categorySlug}/${post.slug}`} post={post} chapter={all.length - i} />
        ))}
      </div>
      <Link to="/blog" className="btn btn--paper reveal" style={{ marginTop: 28 }}>
        All writing
      </Link>
    </Scene>
  );
}
