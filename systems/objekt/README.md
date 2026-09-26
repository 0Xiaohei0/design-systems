# OBJEKT

Brutalist industrial label system. Every UI element is a printed label:
stickers, stamps, barcodes, serial plates and spec sheets on paper stock, laid
on a concrete sheet inside a black press frame. Four stocks - lead, mark, plate
and base - and their inks are the entire palette; depth exists only as the hard
offset shadow of a lifted sticker. Day and night sheets, both hand-authored.

Status: **Documented** 2026-09-26.

## Provenance

The language began as a design exploration of industrial label print. This
folder is the standalone system: the tokens and components here are the whole
of it, with no upstream file to keep in sync.

## In this folder

- `DESIGN.md` - the spec: thesis, tokens for both sheets, stocks and inks, type
  voices, motifs, component states, and the refusals. Read this first.
- `index.html` - the catalog, following [`STANDARD.md`](../../STANDARD.md):
  colour, type, space, form, motion, screen, components, motifs, one composed
  specimen, and the rules. Sheet toggle in the masthead.
- `css/objekt-core.css` - tokens (day and night sheets), primitives and
  components, plain CSS. This is the system.
- `css/catalog.css` - the catalog page's own furniture (masthead, brief,
  swatches, token tables, callouts), set in the system's vocabulary.
- `css/portal-card.css` - the system's card on the root portal.
- `js/thermal.js` - the optional thermal-head shader. Enhancement only,
  token-coloured, visibility-gated, and a single settled frame under reduced
  motion.

## Fonts

Anton (display) under the SIL Open Font License, loaded from Google Fonts by
URL - nothing is vendored into this repo. Mono and fine print use system
stacks.
