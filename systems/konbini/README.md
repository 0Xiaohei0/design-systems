# KONBINI

A pixel-art travel-poster design system. Every surface is a poster: a winter
sky gradient, snow-white paper, heavy white Helvetica display, cobalt captions
and giant katakana, and one meticulously detailed rect-only pixel scene (the
Seimart konbini) as the centerpiece.

**Status: Exploration.**

## Contents

- `DESIGN.md` - the durable spec: tokens, the pixel rule, the one-gradient
  rule, type voices, motifs, component states, do/don't.
- `index.html` - the catalog page: hero poster, foundations, the pixel rule,
  motifs, components, and an "in application" Seimart page.
- `css/konbini-core.css` - tokens, primitives, and components (plain CSS).
- `css/portal-card.css` - the system's card on the root portal (owned by the
  portal task).

Start with `DESIGN.md`; the catalog demonstrates everything it specifies.
The hero scene and pixel icons are generated rect-by-rect on integer grids
(scene 176x104, icons 16x16) and baked into `index.html` as inline SVG.
