/* macOS Sierra's wallpaper (from Stephen Hackett's 6K archive at 512pixels.net), at 2K or 4K
   depending on the screen. Phones get the same picture, cropped to the screen by object-fit and
   centred on the lit peak. It can't be selected, dragged or long-pressed to save. */
const base = import.meta.env.BASE_URL;

export default function Wallpaper() {
  return (
    <img
      className="wallpaper"
      src={`${base}images/wallpaper-2k.jpg`}
      srcSet={`${base}images/wallpaper-2k.jpg 2048w, ${base}images/wallpaper.jpg 3840w`}
      sizes="100vw"
      alt=""
      decoding="async"
      draggable="false"
      onContextMenu={(e) => e.preventDefault()}
    />
  );
}
