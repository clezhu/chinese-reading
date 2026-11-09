# Prompt set — v1

Tool: `codex_image` (native generation), not CLI fallback. Review-only. Requested scene sizes 1536×1024; favicon 1024×1024. See manifest for actual output sizes.

## Shared scenic direction

Original mature painterly digital artwork for Hanzi Garden; neither photography nor childish cartoon. Calm Chinese mountains, tranquil lake, traditional Chinese pavilion-temple architecture, restrained cherry blossoms, pale dusty-pink fog, atmospheric depth. Palette: blue-grey slate, warm ivory, dusty rose. No text, UI, watermark, people, logo or borders. Supplied stock reference is direction only, never a source for extraction or reuse.

## Generation sequence and per-asset prompts

1. **Homepage anchor (no image input):** wide lake scene, temple on rocky shore in left third; layered mountains, warm ivory sky, blossoms framing upper-left/lower-right. Horizontal fog between depth planes. Quiet pale centre-right x48–85%, y22–60% for eventual charcoal headline/CTA; mostly clear upper 12% for navigation. New mountain silhouettes and architecture, no recreation of stock. Distinct background, building and foreground planes for later separation.
2. **Background (anchor = edit target):** preserve canvas/camera/mountains/sky/lake/copy space; remove temple, island, trees, reflection, framing flowers/rocks and prominent fog ribbons. Inpaint plausible distant mountains/lake. Opaque full-bleed bottom plate, subtle natural haze retained.
3. **Temple (anchor = edit target):** extract only temple, rocky left island, immediate small trees, fading lake reflection. Same full-frame coordinates and scale, do not centre/enlarge. Remove distant environment and framing branches. Genuine transparent exterior and fine edges, not white/checkerboard. Approximate intended occupancy x0–44%, y36–97%.
4. **Blossoms (anchor = edit target):** extract only upper-left and lower-right foreground branches and tiny lower-right rock edge. Preserve positions/scale/canvas. Remove temple, island, distant environment and left-island trees. Genuine transparency between twigs and across empty canvas; clear middle/headline space.
5. **Fog (anchor = style/alignment reference):** only soft pale dusty-pink translucent horizontal mist ribbons, mainly y43–69%, gaps of transparency, no opaque cloud wall; few marks in upper third. Genuine zero-alpha background, smooth alpha falloff. No landscape, flowers, buildings or lake. Intended for eventual slow motion between background and temple.
6. **Login (anchor = style/palette reference):** much paler static ivory scene, 80% quiet empty space, small lower-left pavilion, restrained upper-left/lower-right blossom sprigs, extremely faint grey bottom mountain hint. Decorations confined to outer 20%; blank central x30–70%, y15–90% for future white form. No card/form/UI painted in.
7. **Signup (anchor = style/palette/architecture reference):** immersive but quieter mountain lake fog scene, temple far lower-left, corner blossoms, diffuse ivory light. Quiet pale central x30–70%, y10–92% for tall future white form. Buildings/branches outside centre; no form/card painted in.
8. **Lesson list (anchor = style reference):** neutral ivory field, 90% visually blank, ultra-delicate dusty-blush twigs only far upper-right/lower-left, faint grey stems and few petals. Static, low contrast behind future grid. No buildings, mountains, lake, fog, cards or UI; not an in-lesson reader background.
9. **Favicon (no image input):** exactly five broad round petals, subtle tiny petal-tip notches, connected solid centre, compact silhouette, one solid charcoal #30343A. Genuine alpha exterior, 12% margins; recognisable 16/32px. No interior marks, holes, stamens, stem, leaves, texture, shading, gradients, shadow, book, letters, mascot or wordmark.

The generated scene anchored every scenic variation. Alpha and exact alignment requests were aspirational generation constraints; verification and known deviations are documented in `MANIFEST.md`, rather than assumed from prompts.
