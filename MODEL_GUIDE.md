# 3D model guide

The hero (Scene 001 · Spring) has a rectangular **portal**: a frame over the sun. When a model exists, a live 3D rendering plays inside that frame. The site looks for these files, in order:

1. `public/models/hero.vrm`
2. `public/models/hero.glb`

If neither exists, the portal stays an empty frame and **Three.js is never downloaded**, so the site stays light. Drop your file in, run `npm run dev`, and it appears. No code changes are needed.

Settings live in `MODEL` in `src/data/content.js`. The portal's size and shape are `.portal` in `src/index.css` (4:5, up to 420px wide).

---

## What fits the theme: ideas

The portal sits over a big crimson sun on a pink sky, with a black staircase climbing past it. The rendering is transparent, so the sun shows through behind your model: a strong silhouette reads best. Think of the series' figures against a red sunset.

| # | Idea | Why it fits | Effort | Format |
|---|------|-------------|--------|--------|
| 1 | **Anime avatar of you** in VRoid Studio (blazer + glasses, like your portrait) | Looks like it belongs in the show. You get the Shaft head tilt on the real neck bone, plus blinking and eyes that follow the cursor, for free. **Recommended.** | ~1–2 h, no 3D skills needed | `.vrm` |
| 2 | **Stylised bust of you** in Blender, flat colours, low-poly | More "designed", fully yours. Tilt works if you name the head node `Head`. | 4–10 h | `.glb` |
| 3 | **Your desk, as a diorama**: laptop, a box of doughnuts, a stapler, a cat figurine | Quiet nods for fans (Shinobu's doughnuts, Senjougahara's stapler, Hanekawa's cat) that still read as "developer's desk" to a recruiter. | 3–6 h | `.glb` |
| 4 | **Railway-crossing signal** with two red lamps | The most iconic object of the series' empty towns. Name the lamps `Blink_L` / `Blink_R` and the site alternates them. | 1–3 h | `.glb` |
| 5 | **A lone staircase + street lamp** with you sitting on the steps | Echoes the staircase in the hero art and the first episode. | 4–8 h | `.glb` |

Whichever you choose, keep it **flat-coloured** (base colours, few textures). The site re-shades it as cel animation with ink outlines, so detailed PBR texturing is wasted.

---

## Format spec

### Option A: VRM (from VRoid Studio)

1. Make the avatar in [VRoid Studio](https://vroid.com/en/studio) (free; Windows/macOS).
2. **Export → Export VRM**. Choose VRM 1.0 if offered; 0.x also works.
3. In the export dialog, reduce polygons/materials if the file is over **15 MB**. Aim for **< 10 MB**:
   - Texture atlas resolution: 2048 or 1024
   - "Reduce polygons" on hair and body
   - Combine materials: on
4. Save as `public/models/hero.vrm`.

The site then automatically:
- lowers the arms out of the T-pose
- breathes (spine), blinks (`blink` expression) and looks at the cursor (`lookAt`)
- tilts the head ~41° on hover and now and then on its own (neck + head bones)

Tip: in `content.js` set `MODEL.frame = 'upper'` to frame from the waist up instead of the whole body.

### Option B: glTF binary (`.glb`) from Blender or anything else

| Requirement | Value |
|---|---|
| Format | glTF 2.0 binary, `.glb` (Blender: File → Export → glTF 2.0, format "glTF Binary") |
| File size | **< 8 MB** ideal, 15 MB max |
| Triangles | **< 60k** (fine for a phone) |
| Textures | ≤ 2048 px, PNG or JPEG; flat base colours preferred |
| Materials | Principled BSDF / standard. They're converted to cel shading (`MODEL.toon: true`). Set `toon: false` to keep your own shading. |
| Up axis / facing | +Y up, the model **faces +Z** (towards the camera). Blender's exporter handles this with "+Y Up" ticked. |
| Scale | Anything. The site scales the model so its height equals `MODEL.height` (1.75 by default) and puts its feet on the floor. |
| Origin | Doesn't matter; the model is recentred. |
| Compression | Optional. **Meshopt** is supported: `npx @gltf-transform/cli optimize in.glb out.glb --compress meshopt`. Don't use Draco (the decoder isn't bundled). |

#### Named nodes the site looks for (all optional)

| Node name | What happens |
|---|---|
| `Head` (change via `MODEL.headNode`) | Tilts on hover and turns towards the cursor. **Put its pivot/origin at the base of the neck**, or the head will swing around its centre. With an armature, name the head **bone** `Head`. |
| `Blink…` (e.g. `Blink_L`, `Blink_R`) | Alternate on/off about twice a second, like crossing lamps. Give them an emissive red material. |
| `Float…` | Bob gently up and down (good for a floating doughnut or petals). |

If there's no `Head` node, the whole model leans into the tilt instead.

#### Animation (optional)

- A looping clip named **`Idle`** (change via `MODEL.idleClip`) plays automatically. 2–4 s of subtle breathing or swaying is plenty.
- If there's no `Idle`, the first clip in the file plays.
- Don't animate the `Head` rotation in the clip; the site drives it.

---

## Checking it

```bash
npm run dev
# open http://localhost:5173/dev-satish/
```

- Hover the model: the head should tilt.
- Move the mouse around: it should follow.
- The intro's flashing "SCENE 001" card holds until the model has loaded (up to ~3 s extra), so a heavy file makes the intro feel stuck. Keep it small.
- If something's wrong, the browser console shows `[stage] could not load …/models/hero.glb` and the portal stays empty.

Then deploy as usual: `npm run deploy-build`, commit, push.
