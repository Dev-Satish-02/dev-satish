import { Link } from 'react-router-dom';
import Scene from './Scene';
import PostCard from './PostCard';
import { getAllPosts } from '../lib/blog';

// The blog teaser: a rainy-night interlude between winter and the finale.
export default function Writing() {
  const posts = getAllPosts().slice(0, 3);
  return (
    <Scene id="blog" season="rain" label="Interlude" title="Writing" lede="Notes on product, strategy and books.">
      <div className="post-grid">
        {posts.map((post, i) => (
          <PostCard key={`${post.categorySlug}/${post.slug}`} post={post} index={i} />
        ))}
      </div>
      <Link to="/blog" className="btn btn--paper reveal" style={{ marginTop: 28 }}>
        All posts
      </Link>
    </Scene>
  );
}
