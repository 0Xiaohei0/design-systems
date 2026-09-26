# KONBINI

A pixel-art travel-poster design system. Every surface is a poster: one
vertical sky falling into snow-white paper, heavy display type floating in the
sky, small type resting on the paper, and one carefully built rect-only pixel
scene as the centrepiece. The dark theme is the same poster at night.

**Status: Documented.**

## Provenance

The language began as a single travel-poster study and was grown into a kit of
tokens, components and motifs. This folder is the whole system - there is no
upstream file to keep in sync.

## In this folder

- `DESIGN.md` - the spec: tokens (day and night), the pixel rule, the
  one-gradient rule, type voices, motifs, component states, and the refusals.
  Read this first.
- `index.html` - the catalog, following [`STANDARD.md`](../../STANDARD.md):
  colour, type, space, form, motion, screen, components, motifs, one composed
  specimen, and the rules. Day / night toggle in the masthead.
- `css/konbini-core.css` - tokens (day on `:root`, night by OS preference or
  toggle), primitives, components, and the catalog's own spec furniture at the
  bottom.
- `css/portal-card.css` - the system's card on the root portal.
- `js/pixel-sky.js` - the optional pixel-sky shader. Enhancement only,
  token-coloured, visibility-gated, and silent under reduced motion.

The hero scene (176 x 104 grid) and the pixel icons (16 x 16) are drawn
rect by rect and inlined in `index.html` as SVG, filled only with the
`--art-*` inks so they follow the theme.

## Fonts

Platform fonts only, nothing to download or vendor: a neutral grotesque stack
("Helvetica Neue", Helvetica, Arial) and a system CJK stack for kana display.
