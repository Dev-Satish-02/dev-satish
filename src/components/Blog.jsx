import { Link } from 'react-router-dom';
import { getAllPosts } from '../lib/blog';
import Episode from './Episode';
import PostList from './PostList';

export default function Blog() {
  const posts = getAllPosts().slice(0, 4);

  return (
    <Episode id="blog" tone="paper2">
      <PostList posts={posts} />
      <div className="reveal" style={{ marginTop: 32 }}>
        <Link to="/blog" className="btn">
          All notes · 目次 →
        </Link>
      </div>
    </Episode>
  );
}
