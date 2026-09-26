# Chaguan (茶馆)

Literati ink-painting clothes on plain, task-first interface. Brush display
type, solid-ink still lifes over a flat disc, a vermilion seal as punctuation,
warm paper pinned to a mount - and underneath all of it, a working surface of
tiles, pills, rows and round buttons that stays instantly scannable. Light
"daylight" and dark "lamplight" themes, both hand-authored.

**Status:** Documented.

## Provenance

The language was first drawn for a small storefront-style mobile app. This
folder is the standalone system: the tokens and components here are the whole
of it, with no upstream file to keep in sync.

## In this folder

- `DESIGN.md` - the spec: thesis, tokens for both themes, contrast floor, type
  voices, motifs, component states, the alternate ground, motion, and the
  refusals. Read this first.
- `index.html` - the catalog, following [`STANDARD.md`](../../STANDARD.md):
  colour, type, space, form, motion, screen, components, motifs, one composed
  specimen, and the rules. Theme toggle in the masthead.
- `css/chaguan-core.css` - tokens (light, dark, derived), primitives and
  components, plus the catalog's own spec furniture at the bottom.
- `css/portal-card.css` - the system's card on the root portal.
- `js/inkwash.js` - the optional ink-wash shader. Enhancement only,
  token-coloured, visibility-gated, and still under reduced motion.

## Fonts

Ma Shan Zheng for the brush voice, a Google Font under the SIL Open Font
License, loaded by URL - nothing is vendored into this repo. Captions use
Georgia and the UI uses the platform sans stack (PingFang SC / Noto Sans SC
for CJK).
