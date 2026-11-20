/* The wallpaper, with a portrait crop centred on the lit peak for phones. */
const base = import.meta.env.BASE_URL;

export default function Wallpaper() {
  return (
    <picture>
      <source media="(max-width: 760px)" srcSet={`${base}images/wallpaper-phone.jpg`} />
      <img className="wallpaper" src={`${base}images/wallpaper.jpg`} alt="" decoding="async" />
    </picture>
  );
}
