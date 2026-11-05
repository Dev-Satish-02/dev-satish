import { useLayoutEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { chooseVolume, pickVolume } from './SceneStage';
import { formatDate, getAllPosts } from '../lib/blog';
import { useReveal } from '../hooks/useReveal';

/* The interlude, in the library. The posts are the four volumes on the right-hand shelf,
   their titles on the spines. Pointing at one draws it out and names it; choosing it opens
   the post. Keyboard users get the same volumes as a list of links. */
export default function Writing() {
  const all = getAllPosts();
  const posts = all.slice(0, 4);
  const open = useReveal();
  const navigate = useNavigate();
  const [hover, setHover] = useState(-1);
  const label = useRef(null);
  const pointer = useRef([0, 0]);
  const href = (post) => `/blog/${post.categorySlug}/${post.slug}`;
  const placeLabel = () => {
    const [x, y] = pointer.current;
    if (label.current) label.current.style.transform = `translate(${x + 18}px, ${y + 14}px)`;
  };
  // the caption mounts with the first volume pointed at; put it by the pointer straight away
  useLayoutEffect(placeLabel, [hover]);

  const onMove = (e) => {
    const onText = e.target instanceof Element && e.target.closest('.ep-card, a, button');
    const i = onText ? -1 : pickVolume(e.clientX, e.clientY);
    pointer.current = [e.clientX, e.clientY];
    placeLabel();
    if (i !== hover) {
      setHover(i);
      chooseVolume(i);
    }
  };
  const leave = () => {
    setHover(-1);
    chooseVolume(-1);
  };

  return (
    <section
      id="blog"
      className={`ep ep-library${hover >= 0 ? ' is-pointing' : ''}`}
      aria-labelledby="blog-title"
      onPointerMove={onMove}
      onPointerLeave={leave}
      onClick={(e) => {
        // a tap has no hover before it, so ask the shelf what is under the finger
        const onText = e.target instanceof Element && e.target.closest('.ep-card, a, button');
        const i = hover >= 0 ? hover : onText ? -1 : pickVolume(e.clientX, e.clientY);
        if (i >= 0) navigate(href(posts[i]));
      }}
    >
      <div ref={open} className="ep-card ep-open">
        <p className="scene-tag mono">
          <span>Interlude</span>
          <span>The library</span>
        </p>
        <h2 id="blog-title" className="ep-title">
          Writing
        </h2>
        <p className="ep-summary">Notes on product, strategy and the books I read. Take a volume from the shelf to read it.</p>
      </div>

      <div className="shelf-zone">
        <ol className="shelf-index" aria-label="Volumes on the shelf">
          {posts.map((post, i) => (
            <li key={href(post)}>
              <Link to={href(post)} onFocus={() => chooseVolume(i)} onBlur={() => chooseVolume(-1)}>
                Vol. {all.length - i}: {post.title}
              </Link>
            </li>
          ))}
        </ol>
        <Link to="/blog" className="shelf-more mono">
          The whole catalogue
        </Link>
      </div>

      {hover >= 0 && (
        <div ref={label} className="spine-label" aria-hidden="true">
          <span className="spine-label-vol mono">
            Vol. {all.length - hover}, {posts[hover].category}, {formatDate(posts[hover].date)}
          </span>
          <span className="spine-label-title">{posts[hover].title}</span>
        </div>
      )}
    </section>
  );
}
