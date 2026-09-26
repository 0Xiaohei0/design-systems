# MOCHI

Soft neumorphic widget system. One warm material, every widget a raised
pillow, depth from light instead of lines, muted pastel plates laid inside the
material, and a small cute streak: flip digits, pill gauges, a blushing face.
Light greige and dark roasted-sesame themes, both hand-authored.

Status: **Documented** 2026-09-26. This folder is the whole system - there is
no upstream file to keep in sync.

## Provenance

The language was first explored as a themed widget home screen. This folder is
the standalone system: the tokens and components here are the whole of it.

## Contents

- `DESIGN.md` - the spec: tokens, the material rule, contrast rules, motif
  vocabulary, component states, do / do not. Read this first.
- `index.html` - the catalog, following [`STANDARD.md`](../../STANDARD.md):
  colour, type, space, form, motion, screen, components, motifs, one composed
  specimen, and the rules. Theme toggle in the masthead.
- `css/mochi-core.css` - tokens (light + dark, both reachable by toggle), the
  material primitives, every component and motif, and the catalog's own spec
  furniture at the bottom.
- `css/portal-card.css` - the system's card on the root portal.
- `js/dough.js` - the optional dough-press shader. Enhancement only,
  token-coloured, visibility-gated, and silent under reduced motion.

## Fonts

System stacks only, nothing to download: the platform's rounded UI face
(`ui-rounded`) with rounded CJK faces named before the plain sans fallback.
