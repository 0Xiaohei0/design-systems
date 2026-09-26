# ENJOY

Cozy retro-desktop design system: personal computing as a warm hobby. Every
element is a window or a desk object - 2px ink outlines, surface fills, hard
offset shadows, one mono typeface - sitting on a sunny desk under big lazy
waves. One saturated field, `--feature`, is spent on a single content pane per
screen. Light and dark themes, both hand-authored.

Status: **Documented** 2026-09-26. This folder is the whole system - there is
no upstream file to keep in sync.

## Provenance

The language began as an exploration of hobbyist "riced" desktop setups - the
chunky outlined windows and pastel wallpapers people build for their own
machines. The tokens and components here are the whole of it.

## Contents

- `DESIGN.md` - the spec: thesis, tokens for both themes, the one-typeface rule,
  window anatomy, motifs, component states, the shader, and the refusals. Read
  this first.
- `index.html` - the catalog, following [`STANDARD.md`](../../STANDARD.md):
  colour, type, space, form, motion, screen, components, motifs, one composed
  specimen, and the rules. Every section is a window on the desk; the theme
  toggle is in the menu bar.
- `css/enjoy-core.css` - tokens (light + dark), primitives, components, and the
  catalog's own spec furniture at the bottom. Plain CSS.
- `css/portal-card.css` - the system's card on the root portal.
- `js/tide.js` - the optional wallpaper-tide shader. Enhancement only,
  token-coloured, flat-fill only, visibility-gated, and silent under reduced
  motion.

## Fonts

None to download. The whole system is set in the platform's own monospace:
`ui-monospace, "SF Mono", Menlo, Consolas, monospace`.
