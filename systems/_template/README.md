# System template

Copy this folder to `systems/<name>/` to start a new design system, then add a
card for it in the root `index.html` portal.

**Read [`STANDARD.md`](../../STANDARD.md) first.** It defines what a system in
this repo must contain and, more importantly, what must stay out of it. This
folder is that standard as a working skeleton - `index.html` already carries the
section spine as comments.

## What belongs where

- `systems/<name>/` - everything that defines the system: tokens, component CSS,
  the catalog page, and its `DESIGN.md` spec.
- `shared/portal/` - portal chrome only. Never put system tokens here: a design
  system's identity *is* its tokens, so they stay inside its own folder.

## Files

- `index.html` - the catalog. Follow the spine in `STANDARD.md` §1.
- `css/tokens.css` - the palette, type scale, spacing and radii. Start here.
- `css/portal-card.css` - how this system dresses its own card on the root
  portal. Scope everything to the card's `.sys-<name>` class so it cannot leak
  into the neutral chrome.
- `DESIGN.md` - the spec in prose: the thesis, what the system refuses, and how
  a new component should be derived.

## The two rules people break

- **No product content.** The catalog documents the system, not the app the
  system came from. No product names, no app copy, no screenshots, no internal
  paths. `STANDARD.md` §2 has the full list and the reasoning.
- **Tokens are roles.** A name must survive being used for something completely
  different. `--note-bg` passes; `--watch-bg` and `--green-100` do not.
