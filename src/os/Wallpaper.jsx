/* macOS Sierra's wallpaper (from Stephen Hackett's 6K archive at 512pixels.net), at 2K or 4K
   depending on the screen, with a portrait crop centred on the lit peak for phones. */
const base = import.meta.env.BASE_URL;

export default function Wallpaper() {
  return (
    <picture>
      <source media="(max-width: 760px)" srcSet={`${base}images/wallpaper-phone.jpg`} />
      <img
        className="wallpaper"
        src={`${base}images/wallpaper-2k.jpg`}
        srcSet={`${base}images/wallpaper-2k.jpg 2048w, ${base}images/wallpaper.jpg 3840w`}
        sizes="100vw"
        alt=""
        decoding="async"
      />
    </picture>
  );
}
