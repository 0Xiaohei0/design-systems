# SHIMBUN 新聞

Warm-paper editorial print system. A newspaper desk as an interface: warm
paper ground, one vermilion spot color, oversized tight headlines, hairline
rules, and mono annotations. Chinese-first labels, three type stacks
(Noto Sans SC / Archivo / IBM Plex Mono), light + dark paper themes.

Status: **Documented** 2026-09-26, extracted from a shipped page's live CSS.
This folder is the whole system - there is no upstream file to keep in sync.

## Contents

- `DESIGN.md` - the spec: tokens, the paper rule, contrast rules, motif
  vocabulary, component states, do/don't. Read this first.
- `index.html` - the catalog, following [`STANDARD.md`](../../STANDARD.md):
  colour, type, space, paper and form, motion, components, motifs, one composed
  specimen, and the rules. Theme toggle in the masthead.
- `css/tokens.css` - palette (light + dark, both reachable by toggle), type
  stacks, radii, the kicker voice, focus and reduced-motion rules.
- `css/shimbun.css` - the catalog page, set in the system itself.
- `css/portal-card.css` - the system's card on the root portal.

## Fonts

Noto Sans SC, Archivo and IBM Plex Mono, all Google Fonts under the SIL Open
Font License and loaded by URL - nothing is vendored into this repo.
