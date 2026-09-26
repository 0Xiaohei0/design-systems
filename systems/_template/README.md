# System template

Copy this folder to `systems/<name>/` to start a new design system, then add a
card for it in the root `index.html` portal.

## What belongs where

- `systems/<name>/` - everything that defines the system: tokens, component CSS,
  exploration pages, and its `DESIGN.md` spec.
- `shared/portal/` - portal chrome only. Never put system tokens here: a design
  system's identity *is* its tokens, so they stay inside its own folder.

## Files

- `index.html` - the front door: the system catalog (tokens, type voices, marks,
  components). Add more pages beside it; the dev server picks them up.
- `css/tokens.css` - the palette, type scale, spacing and radii. Start here.
- `css/portal-card.css` - how this system dresses its own card on the root
  portal. Scope everything to the card's `.sys-<name>` class so it cannot leak
  into the neutral chrome.
- `DESIGN.md` - the spec in prose: the thesis, what the system refuses, and how
  a new component should be derived.

## Conventions worth keeping

- **One world per folder.** A system never imports another system's CSS. If two
  systems want the same component, they each get their own version of it.
- **The card is a specimen.** The portal card should be a real material sample
  of the system, not a neutral tile with a label.
- **Write CSS the port target can accept.** If the system is headed for a
  non-browser UI runtime, stay inside that runtime's subset (Unity UI Toolkit,
  for example, has no `gap`, `text-transform`, `rem`/`em` or `inherit`).
