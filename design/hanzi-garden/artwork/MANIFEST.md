# Hanzi Garden — REVIEW ONLY, v1

Draft artwork for human approval during the design interview. **Not approved for implementation.** All artwork generated with the `codex_image` tool; no stock pixels reused. The supplied watermarked reference was viewed for direction only and was not passed as an edit target or copied into an asset. Layout references informed negative space only.

## Previews

- [Contact sheet](review/contact-sheet.png): all concepts, layers on neutral grey preview mattes, actual-size 16/32px favicon samples.
- [Original flattened homepage concept](home-concept-v1/image_1794205633226_1536-1024.png).
- [Actual layer assembly test](review/home-layer-composite-draft.png): separate generated assets composited, not the original flattened concept relabelled.

## Asset manifest

Paths are relative to this directory. Generated filenames contain requested dimensions; **actual decoded dimensions below are authoritative**.

| Asset | File | Actual pixels | Transparency / role |
| --- | --- | --- | --- |
| Homepage concept | `home-concept-v1/image_1794205633226_1536-1024.png` | 1672×941 | Opaque; original style/composition anchor |
| Background plate | `home-background-v1/image_1794205712758_1536-1024.png` | 1672×941 | Opaque mountains, sky, lake; no temple or foreground branches |
| Normalized background | `review/home-background-normalized.png` | 1536×1024 | Opaque; centre-cropped to match overlay canvas for assembly test |
| Temple midground | `home-temple-midground-v1/image_1794205722997_1536-1024.png` | 1536×1024 | Genuine RGBA; temple, shore, local trees and reflection |
| Foreground blossoms | `home-foreground-blossoms-v1/image_1794205717699_1536-1024.png` | 1536×1024 | Genuine RGBA; upper-left and lower-right framing branches |
| Pink fog | `home-fog-v1/image_1794205714715_1536-1024.png` | 1536×1024 | Genuine RGBA; separate soft mist ribbons |
| Login | `login-background-v1/image_1794205716131_1536-1024.png` | 1672×941 | Opaque; very pale static corner decoration, blank central form space |
| Signup | `signup-background-v1/image_1794205722109_1536-1024.png` | 1672×941 | Opaque fog scene; blank central form space, background only |
| Lesson LIST | `lesson-list-background-v1/image_1794205709746_1536-1024.png` | 1672×941 | Opaque; very light static corner blossoms, quiet behind future grid |
| Generated favicon source | `favicon-source-v1/image_1794205717295_1024-1024.png` | 1254×1254 | Genuine RGBA; generated five-petal silhouette; slight RGB variation in raw source |
| One-ink favicon master | `review/favicon-one-ink.png` | 1254×1254 | Generated silhouette preserved; RGB normalized to solid `#30343A`, antialiasing via alpha only |
| Small favicon drafts | `review/favicon-16.png`, `review/favicon-32.png` | 16×16, 32×32 | Same one-ink silhouette, true alpha; actual sizes shown in contact sheet |

## Alpha verification and compositing limits

Decoded PNG inspection, not visual assumptions: [alpha audit](review/alpha-audit.json).

- Temple: alpha **0–254**, 1,182,977 fully transparent pixels.
- Blossoms: alpha **0–254**, 1,273,053 fully transparent pixels.
- Fog: alpha **0–242**, 973,320 fully transparent pixels; no fully opaque pixels.
- Generated favicon: alpha **0–255**, 1,038,493 fully transparent pixels.
- All scenic background plates are RGB, **no transparency**. Grey behind overlays in the contact sheet is a display matte only; it is not in the source PNGs. No mock/checkerboard transparency is being represented as genuine alpha.

Assembly order, bottom to top: **normalized background → fog → temple → foreground blossoms**. This places independently movable fog between genuine depth layers. Only one fog overlay is supplied; signup fog remains baked into its separate opaque background.

**Not production-ready:** the generator changed opaque scene output to 1672×941 while overlays are 1536×1024. The assembly uses a centre crop of the background without stretching it. Overlays share coordinates/canvas, but extraction regenerated some geometry and scale: this is approximate composition alignment, not pixel-exact reconstruction of the anchor. Temple/reflection and branches carry soft pale/pink halos; temple/blossom alpha never reaches 255. Reflection blending, edge mattes, perspective alignment, responsive crops and motion overscan/looping require refinement. No animated fog, seamless loop, responsive integration or runtime performance was tested. Keep the original flattened concept as the primary style-approval reference.

## Design boundaries

- Wordmark: **Hanzi Garden**, text only; no symbol alongside. Contact-sheet heading demonstrates separation from the standalone favicon.
- UI outside artwork: neutral white/ivory/grey/charcoal; no pink controls. No UI implementation or form mockup included.
- No text baked into any scenic asset. Homepage has quiet right-side headline/CTA space; auth centres are reserved for future white forms.
- Login and lesson-list decoration is static. **Actual in-lesson reader screens have NO scenery**; no reader background was created.
- Favicon: one connected five-petal blossom, no book, letters, mascot, stem or interior detail. Small raster exports are approval drafts, not an installed favicon.

## Generation / processing provenance

Initial original homepage scene generated first. That generated image was then the sole image input for each scenic variation/layer; favicon was generated separately. The supplied stock and layout references were not image-generation inputs. [Prompt set](PROMPTS.md) records the generation direction and per-asset constraints.

`build-review.py` only inspects/composites/resizes generated images, normalizes favicon ink, and builds the labelled contact sheet; it does not draw substitute artwork. It used an already-installed Pillow library; no dependencies or project configuration were changed. No application files, issues, commits or deployment were created/changed.
