# Asset manifest

Every photograph on the site is listed here: what it is, where it is used, how large it is,
where it comes from, and what its licence allows. All are freely licensed works from
Wikimedia Commons. They were downloaded at 3200–3840px, cropped to 16:9, colour-graded and
exported by the pipeline described below.

No anime frames, official artwork or fan art are used in the deployed site. Monogatari is a
reference for composition, camera angle, colour and typography only (see `ART_DIRECTION.md`).

## Photographs in use

| File (in `public/scenes/`) | Section | Delivered sizes | Subject | Author | Licence | Source |
|---|---|---|---|---|---|---|
| `summer-crossing-{2560,1280}.webp`, `-1280.jpg` | Experience (Summer) | 2560×1440, 1280×720 | Nakaizawa level crossing on the JR Iida Line: crossbuck, overhead lines, traffic mirror | 先従隗始 | CC0 1.0 (public domain dedication) | [Commons](https://commons.wikimedia.org/wiki/File:JR_Iida_line_Nakaizawa_Level_Crossing_20200224.jpg) |
| `autumn-corridor-{2560,1280}.webp`, `-1280.jpg` | Projects (Autumn) | 2560×1440, 1280×720 | Corridor of the old Meika Elementary School building, Bunkyō, Tokyo | Kohsuke Kawaguchi | CC BY 2.0 | [Commons](https://commons.wikimedia.org/wiki/File:%E6%96%87%E4%BA%AC%E5%8C%BA%E7%AB%8B%E6%98%8E%E5%8C%96%E5%B0%8F%E5%AD%A6%E6%A0%A1_%E6%97%A7%E6%A0%A1%E8%88%8E_%E5%BB%8A%E4%B8%8B_Nov_12,_2022.jpg) |
| `winter-school-{2560,1280}.webp`, `-1280.jpg` | Skills & education (Winter) | 2560×1440, 1280×720 | Wooden classroom with blackboard, Twenty-Four Eyes film village, Shōdoshima | 663highland | CC BY 2.5 | [Commons](https://commons.wikimedia.org/wiki/File:Twenty-four_eyes01s3200.jpg) |
| `library-stacks-{2560,1280}.webp`, `-1280.jpg` | Writing (Interlude), blog pages | 2560×1440, 1280×720 | Stacks of the University of Tokyo General Library, floor-to-ceiling shelving in one-point perspective | 末広橋 | CC BY-SA 4.0 (adapted version shared under CC BY-SA 4.0) | [Commons](https://commons.wikimedia.org/wiki/File:%E6%9D%B1%E4%BA%AC%E5%A4%A7%E5%AD%A6%E7%B7%8F%E5%90%88%E5%9B%B3%E6%9B%B8%E9%A4%A8%E6%9B%B8%E5%BA%AB%E6%9B%B8%E6%9E%B6.jpg) |

**What the licences allow.**
- **CC0:** use without conditions.
- **CC BY:** use and adaptation, including commercial, with credit to the author, a link to the
  licence, and a note that the image was changed.
- **CC BY-SA:** the same as CC BY, and adapted versions must be shared under the same licence.
  The graded crops of the CC BY-SA photograph are therefore offered under CC BY-SA 4.0.

The credits are shown at the foot of the Contact section and kept in `src/data/credits.js`.

## Pipeline

1. **Search.** Wikimedia Commons, JPEG, at least 2400px wide. Licences limited to CC0, public
   domain, CC BY or CC BY-SA.
2. **Download.** A 3200px rendition, or the original where it is smaller.
3. **Crop.** The largest 16:9 window, centred on the subject. The classroom is tightened slightly
   to leave a passer-by out of frame.
4. **Grade.** The season's grade is baked into the file, so no CSS filters run on full-screen
   images during scroll:
   - Summer: saturated, slightly lifted blacks.
   - Autumn: desaturated warm amber, raised gamma.
   - Winter: 45% saturation, cooled.
   - Night: amber highlights, deep shadows.
5. **Export.** WebP at 2560 and 1280 wide (quality 78), with a 1280 JPEG fallback, served
   through `<picture>` with `srcset`.
6. **On the page.** A soft scroll-linked drift, a readability shade per section
   (`src/styles/episodes.css`) and one shared film grain.

## Still needed

These were not sourced, because nothing suitable exists that could be used honestly. Nothing
has been substituted for them.

| Need | For | Notes |
|---|---|---|
| Product screenshots, one per project, about 1600px wide, PNG or WebP | Projects case files | Each case file shows a screenshot when `shot: { src, alt }` is added to the project in `src/data/content.js` (the file goes in `public/`). |
| Your role on each project, one line | Projects case files | Shown as "My role" when `role` is added to the project. Left out rather than guessed. |
| Résumé PDF at `public/resume.pdf` | Contact | The Résumé link appears once the file exists. |
| A dusk railway platform or station photograph (optional) | A second Summer frame | Only if the journey is later split across two environments. |
