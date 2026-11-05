# Asset manifest

**There are no image assets after the hero.** Every environment is built in code, in the same
way and with the same rendering settings as the staircase (`src/three/staircase.js`). The
reference behind each one is in `ART_DIRECTION.md`.

| Set | Built in | Made from | Section |
|---|---|---|---|
| Iogi platform, Seibu Shinjuku Line | `src/three/episodes.js` (`buildSummer`) | Instanced boxes for track, sleepers, platforms, catenary, town; canvas textures for the station-name signs (your internships), the crossbuck stripes, the footbridge glazing and the Seibu 2000-series car sides; a canvas sky gradient | Experience |
| The cram school after Yamanashi Bunka Kaikan | `buildAutumn` | Instanced cylinders with a canvas concrete-and-slit-window texture, deep beams, slabs; instanced desks; cones for Fuji in the haze | Projects |
| A Naoetsu High classroom | `buildWinter` | Instanced desks, chairs, window frames and fittings; canvas textures for the floorboards and the blackboard (your skills, chalked) | Skills & education |
| The library aisle | `buildNight` | Instanced shelving and several thousand individual spines; canvas window; four featured volumes (your posts) | Writing, and the blog pages |

**Shared across all four:**
- the staircase's light rig: a hemisphere fill and one shadow-casting sun from one side
- its additive shaft and dust helpers
- ACES filmic tone mapping, PCF shadows, FogExp2 haze, and bloom at 0.28 / 0.5 / 0.88

**Fonts** are those already on the site: Shippori Mincho B1, Inter and JetBrains Mono. The
canvas textures draw with the same faces.

## Still needed from you

| Need | For | Notes |
|---|---|---|
| Product screenshots, one per project, about 1600px wide | Projects case files | Add `shot: { src, alt }` to the project in `src/data/content.js` and put the file in `public/`. |
| Your role on each project, one line | Projects case files | Add `role` to the project. It is left out rather than guessed. |
| Résumé PDF at `public/resume.pdf` | Contact | The Résumé link appears once the file exists. |
