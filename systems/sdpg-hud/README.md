# SDPG-HUD

Monochrome arcade targeting-HUD. One visual world on two grounds: a light
"blueprint" theme and a dark "CRT" theme. No chroma anywhere - emphasis comes
from a filled or inverted block, and status is encoded in form (filled = active,
outline = idle, dashed = disabled or in flux).

Because form carries the meaning that colour usually carries, the system stays
legible printed, photocopied, or read by someone who cannot distinguish hues.

## Provenance

The language was first designed and shipped as the interface of a prompt-builder
app. This folder is the standalone system: the tokens and components here are
the whole of it, with no upstream file to keep in sync.

## In this folder

- `index.html` - the catalog, following [`STANDARD.md`](../../STANDARD.md):
  colour, type, space, form, motion, components, motifs, one composed specimen,
  and the rules. Theme toggle in the status bar.
- `css/hud-core.css` - all tokens and component styles, plus the page's own spec
  furniture at the bottom.
- `css/portal-card.css` - the system's card on the root portal.

## Fonts

System stacks only, nothing to download: a condensed heavy face for display
(Arial Black and friends), the platform mono for everything else, and the
platform UI sans for running prose.
