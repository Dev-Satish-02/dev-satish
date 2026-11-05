# Art direction: the episodes after the staircase

The site runs as one episode in six scenes, a season each: Spring (the staircase, finished and
protected), Summer (Experience), Autumn (Projects), Winter (Skills & education), the Interlude
(Writing) and the Next episode (Contact). This document records the audit of the previous
build, the direction for each scene after the hero, and the rules that keep the hero intact.

## 1. Audit of the previous build

**Keep**

- The staircase hero and its fall into flat summer blue. It is the strongest thing on the site
  and is treated as a closed component (see section 4).
- The seasonal order and the one-fixed-stage idea: the sections scroll over a backdrop that
  dissolves from one season to the next, with no hard cuts.
- The red finale. A flat red field with a huge serif line is already a Monogatari end card.
- The type stack: Shippori Mincho B1 for display, Inter for reading, JetBrains Mono for scene
  labels. It is the right pairing for Oishi-style title cards.

**Remove**

- Every SVG environment (the crossing, the school, the snowy shrine, the cram school). They
  are built from rectangles and circles and read as clip art beside the 3D stairwell.
- The white rounded job cards with tag chips, the grid of project tiles, the translucent
  "frost" boxes and the blog title-card grid. They are the generic portfolio kit with an
  anime skin over it.
- Decorative numbering and labels that carry no information.

**Redesign**

- Backgrounds become graded photographs of real places: a level crossing under overhead
  lines, an old school corridor, a wooden classroom, a university library's stacks. The
  series' own backgrounds are photo-based and heavily graded (Kizumonogatari's especially),
  so a photographic stage with a strong grade is closer to its look than any illustration.
- Each section's content becomes an object that belongs in its environment: platform signs
  and a departure board, case files, a school record and a blackboard, a library catalogue.

## 2. Direction, scene by scene

### Scene 002, Summer: Experience, "the line"

*References:* the level crossings that keep returning in Bakemonogatari and Nisemonogatari
(the bars down, the lamps alternating, the empty road), the long static shots of overhead
wiring against the sky, and the station platform signs that Shinbo frames flat, dead centre.

- **Environment:** a rural level crossing under overhead lines (CC0 photograph), graded warmer
  in the highlights and cool in the shade, with a dark band at the foot of the frame for type.
- **Structure:** the section pins and becomes a journey. A route map runs across the frame, like
  the line diagram above a train's doors. Scrolling drives a train along it left to right, from
  the first internship to the latest, which is the terminus.
- **Information:** at each stop a platform sign (ekimeihyō) shows the employer large, the role
  beneath, and the neighbouring stations on the line band. Beside it, a departure board lists
  the period, the work and the tools. The sign slides away as the train leaves and the next
  one arrives.

### Scene 003, Autumn: Projects, "case files"

*References:* the abandoned cram school where Oshino receives each case, Bakemonogatari's
title-card captions that name every arc, and Oishi's habit of blowing a single word up across
the frame.

- **Environment:** a pre-war wooden school corridor in low, warm light, graded towards amber
  and brown.
- **Structure:** each project is a case with its own frame of nearly a full screen. There are
  four compositions, used in turn, so no two read alike:
  1. Title left, file right.
  2. File left, title right.
  3. A full-width title with the file beneath.
  4. File first, title offset.
- **Information:** a huge outlined case number (the cases are a real sequence), the name in
  display serif, the measurable result in red, and the file as a ruled sheet of paper. The
  sheet holds what it is, the stack and the links, plus my role and a screenshot once those
  exist (see the asset manifest).
- **Motion:** one entrance per case. The name rises out of its mask, the result wipes in, and
  the file settles.

### Scene 004, Winter: Skills & education, "after the last bell"

*References:* the empty classrooms of Naoetsu High, shot from the back row with the blackboard
square in frame, and the series' use of printed documents and notices as full-screen inserts.

- **Environment:** an old wooden classroom with its blackboard, desaturated and cooled to a
  winter afternoon.
- **Education:** filed as an academic record, a ruled document with programme, institution and
  period, and a red seal for the dual degree.
- **Skills:** classified on a blackboard under the four existing headings (product & strategy,
  data & analysis, engineering, certifications), as chalk-white lists with no chips.

### Interlude: Writing, "the library"

*References:* the library scenes with Hanekawa, and the series' fondness for one-point
perspective down long, symmetrical architecture.

- **Environment:** the stacks of a university library, shelves to the ceiling, receding to a
  single point, graded dark and amber.
- **Structure:** the writing is a catalogue. Every post is a volume, numbered in the order it
  was written, with its title in display serif, its summary, and its shelf (category) and date.
  The newest volume is set larger.
- **Interaction:** choosing a volume pulls its spine forward in the shelf's colour and turns the
  title red, then opens it. The blog page is the same library, with shelf marks as filters.

### Scene 005, Next episode: Contact

- Kept as the flat red card. The headline is set larger and tighter, and its two lines rise out
  of masks as the card arrives. The address is the call to action, with the links beneath it,
  plain and underlined.

## 3. Typography and motion rules

- **Scene labels** are monospaced, uppercase and preceded by a short red rule. They are the
  only uppercase labels on the page.
- **Titles** use the display serif at 8–10vw and are allowed to take the negative space.
- **Red** is kept for one thing per frame: a result, a chosen title, or the finale.
- **Motion** is one entrance per object, or one continuous scroll-driven movement (the train,
  the stage dissolve, the photograph's drift). Nothing floats, bounces or loops.
- **Reduced motion:** with it on, the journey stops pinning (all stations are shown), and every
  entrance and drift is switched off.

## 4. The hero is protected

These files and rules are the Spring hero, and are not edited:

- `src/components/StaircaseHero.jsx`, `src/three/staircase.js`, and the fallback
  `src/components/HeroBlossom.jsx` with its `Petals.jsx` and `lib/particles.js`.
- `src/components/Scene.jsx` and the scene SVGs it renders for the fallback hero.
- The `.stair-*`, `.hero*`, `.petals`, `.scene-tag` and root token rules in `src/index.css`.

All new styling lives in `src/styles/episodes.css`, scoped to the new sections' own class names.
