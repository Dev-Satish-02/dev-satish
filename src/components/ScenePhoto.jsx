// A graded environment photograph from public/scenes, at two widths. See design/ASSETS.md
// for where each one comes from and how it may be used.
const BASE = `${import.meta.env.BASE_URL}scenes/`;

export default function ScenePhoto({ name, position = '50% 50%', className = '', eager = false }) {
  return (
    <picture className={`scene-photo ${className}`}>
      <source
        type="image/webp"
        srcSet={`${BASE}${name}-1280.webp 1280w, ${BASE}${name}-2560.webp 2560w`}
        sizes="100vw"
      />
      <img
        src={`${BASE}${name}-1280.jpg`}
        alt=""
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        style={{ objectPosition: position }}
      />
    </picture>
  );
}
