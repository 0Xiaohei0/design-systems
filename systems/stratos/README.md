# STRATOS

Sci-fi FUI signal-overlay kit: dense instrument readouts on glass, one ink plus
one signal hue, flat marks only - no glow, no blur, no radius, no gradient
fades. Two hand-authored grounds: black glass (the default) and daylight glass.

Status: **Exploration**, documented to the repository standard. This folder is
the whole system - there is no upstream file to keep in sync.

## Provenance

Explored as a standalone direction for instrument-overlay interfaces, built from
a reference sheet of film-style FUI readouts. All specimen data is synthetic.

## Contents

- `DESIGN.md` - the spec: tokens, type voices, naming grammar, motif
  vocabulary, component states, motion, and the refusals. Read this first.
- `index.html` - the catalog, following [`STANDARD.md`](../../STANDARD.md):
  colour, type, space, form, motion, screen, components, motifs, one composed
  specimen, and the rules. Theme toggle in the masthead.
- `css/stratos-core.css` - the kit: role tokens for both grounds, type voices,
  marks, components, and the two motion moments.
- `css/catalog.css` - the catalog page's own furniture (masthead, brief, token
  tables, swatches, callouts, screen panels). Not part of the kit.
- `css/portal-card.css` - the system's card on the root portal.
- `js/interference.js` - the optional interference-contours shader. Enhancement
  only, token-coloured, visibility-gated, and silent under reduced motion.

## Fonts

System stacks only, nothing to download: Helvetica Neue / Helvetica / Arial for
display, the platform `ui-monospace` stack for everything else.
