# Sprout

Pixel-prop UI kit. Every control is a small physical prop - baked-piece
buttons, plank sliders, painted signs with curling tendrils - drawn on a 3px
pixel grid over a flat board. No border-radius anywhere: corners are clip-path
staircases, depth is a one-unit bevel, icons are integer SVG rects, motion is
`steps()` only. Day and night themes, both hand-authored.

**Status: Exploration.**

## Provenance

Sprout began as a study of the cosy pixel-art interface style. Everything here
is original CSS and inline SVG rect-art drawn for this kit; no third-party
assets were used. This folder is the whole system.

## In this folder

- `DESIGN.md` - the spec: thesis, role tokens for both themes, the
  construction rule, type, motion, contrast floor, and the refusals. Read this
  first.
- `index.html` - the catalog, following [`STANDARD.md`](../../STANDARD.md):
  colour, type, space, form, motion, screen, components, motifs, one composed
  specimen, and the rules. Day / night toggle in the masthead.
- `css/sprout-core.css` - all tokens (day and night) and every component.
  This file is the kit.
- `css/catalog.css` - the catalog page's own spec furniture, set in the kit's
  language. Not part of the kit.
- `css/portal-card.css` - the system's card on the root portal.
- `js/furrow.js` - the optional furrow-field shader. Enhancement only,
  token-coloured, visibility-gated, and silent under reduced motion.

## Fonts

Silkscreen (display), SIL Open Font License, loaded from Google Fonts by URL.
Body text uses the platform's own system sans. Nothing is vendored.
