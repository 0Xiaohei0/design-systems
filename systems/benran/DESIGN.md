# BENRAN 本然 - design system spec

A stationery language built from emptiness. Every surface begins as bare
paper, and the work is deciding how little may enter: small solid ink objects
resting on one hairline horizon, words standing upright in a vertical column,
colour spent one seal at a time.

Two things to hold on to:

1. **Content occupies about a tenth of any surface.** When a composition feels
   thin, remove something rather than enlarge what is left.
2. **Nothing floats.** Every object sits on a horizon, a trail, or a ripple.

Status: exploration. Light is paper by day; dark is the same sheet at night -
the ground goes to inkstone and the silhouettes turn to paper cutouts. Both
are hand-authored and reachable from the catalog's toggle.

## Tokens

All tokens live in `css/benran-core.css`.

### Colour (day / night)

| Token | Day | Night | Role |
|---|---|---|---|
| `--paper` | `#fcfcfa` | `#161614` | The ground. Nine tenths of every surface. |
| `--surface` | `#ffffff` | `#1c1c1a` | Sheet ground: poster, bookmark, composed sheet. |
| `--ink` | `#2a2a28` | `#e6e3da` | Silhouettes and every essential word. |
| `--faint` | `#8a8880` | `#6f6d67` | Dotted trails; text only when 18px+ or duplicated. |
| `--hairline` | `#d5d3cd` | `#393834` | Rules, sheet edges, the disabled state. |
| `--trace` | `#9fc4bd` | `#3e5a55` | Primary linework: ripples, selection. Never text. |
| `--trace-alt` | `#c9a87c` | `#5f4f37` | Secondary linework: roundel, second ripple. Never text. |
| `--accent` | `#c25e4a` | `#c9654f` | The seal and the link dot. At most one seal per surface. |
| `--on-accent` | `#fcfcfa` | `#fcfcfa` | The reversed mark inside a seal. |

Contrast floor (day / night): ink on paper 14.0 / 14.1; faint on paper
3.5 / 3.5; faint on surface 3.6 / 3.3; accent on paper 4.1 / 4.7; trace,
trace-alt and hairline are 1.5-2.4 and never carry text. The night trace
colours were pulled down to roughly the same quietness they have by day, so a
ripple is equally loud in both themes.

### Type

- `--font-serif: "Songti SC", "Palatino Linotype", "Book Antiqua", Palatino,
  "Noto Serif CJK SC", "SimSun", serif` - vertical display, headings, body.
- `--font-sans: "Avenir Next", "Futura", "Century Gothic", "Helvetica Neue",
  Arial, sans-serif` - captions and numbers.
- System fonts only; nothing is vendored.

| Token | Value | Use |
|---|---|---|
| `--fs-display-lg` | 34px | Largest vertical word, one per sheet |
| `--fs-display` | 26px | Wordmark in a title block; a sheet's vertical title |
| `--fs-heading` | 18px, `--track-wide` 0.5em | Section headings, bookmark titles |
| `--fs-label` | 15px, 0.45em | Stamp button label |
| `--fs-body` | 13px, `--lh-body` 2 | Running text, max 36em |
| `--fs-small` | 11px, 0.3em | Chips, list numbers, the x mark |
| `--fs-caption` | 10px / 300, `--track-caption` 0.35em | Captions, links, labels, placeholders |
| `--track-num` | 0.25em | Numbers and dates |
| `--track-vertical` | 0.4em | Vertical display |

Vertical text uses `writing-mode: vertical-rl` with
`text-orientation: upright`, so Latin stands letter over letter like CJK.
There is no bold anywhere.

### Space, form, motion

- `--page-max: 1060px`, `--page-pad: 40px` (22px below 760px),
  `--space-section: 170px` (120px below 760px), `--space-block: 56px`.
  Breakpoints: 900px, 760px.
- `--rule: 1px` (the only line weight), `--tick: 9px` at
  `--tick-angle: 35deg`, `--focus-offset: 3px`. Radius is 0 except true
  circles and the square seal (rx 4 on a 22 box). No elevation.
- `--t-fade: 0.3s`, `--t-ink: 0.35s`, `--ease: ease-out`;
  `--d-ripple: 7s` on `--ease-ripple: cubic-bezier(0.16, 0.84, 0.44, 1)`;
  `--d-steam: 6s` ease-in-out, 3px drift, 0.7s stagger.
  `prefers-reduced-motion` freezes the ripple and steam and drops transitions.

## Motif vocabulary

- **Horizon** - 1px `--hairline` rule with angled end ticks: a shelf edge.
  Objects rest on it.
- **Object silhouettes** - solid `--ink` inline SVG with small cutouts,
  40-80px: bowl, stone, sprout, pot, gourd, leaf.
- **Roundel** - 1px circle holding a three-stroke mark; `--trace-alt` or ink.
- **Seal** - small filled `--accent` rounded square or circle with a reversed
  `--on-accent` mark. At most one per surface.
- **Trail** - a vertical run of dots shrinking upward: steam, or a path
  between list entries.
- **Ripple** - 2-3 flat concentric 1px ellipses under an object, `--trace`
  or `--trace-alt`.
- **The x mark** - a small "x" between two vertical columns: a co-sign.
- **Sheets** - poster (3:4) and bookmark (1:2.6): `--surface`, hairline edge.

## Components and states

- **Text link** - tracked uppercase caption; hover/focus summons a 5px
  `--accent` dot; disabled is hairline.
- **Stamp button** - upright vertical label in a hairline frame; hover inks
  it (ink ground, paper text); disabled is hairline.
- **Chip** - tiny upright label; hover edge goes faint; selected is an ink
  edge; disabled is hairline.
- **List** - dotted-trail entries with an ink dot; disabled is hairline.
- **Input** - bare hairline underline; focus turns it ink; disabled hairline.
- **Pagination** - 7px circles; current filled ink; hover fills hairline.
- **Focus** - 1px ink outline, 3px offset, everywhere.

## Screen - still water (optional)

`js/stillwater.js`: below the horizon the paper becomes still water seen at a
low angle. 1px rings travel out from under the resting object; the pointer
moves the source on a spring (k 34 / d 8) and a press drops one ink ring.
Colours are read from `--paper`, `--trace` and `--ink` at runtime - the shader
has no path to `--accent`. Enhancement only (the static ripple motif sits
underneath), visibility-gated, one settled frame under reduced motion.
Belongs in the empty lower half of a sheet under a resting object; never
behind text or across a whole page.

## Refusals

- No area filled larger than a silhouette: no panels, no washes.
- No bold weights. Emphasis comes from placement and isolation.
- No shadows, gradients, or glass.
- No rounded corners except true circles and the seal.
- Never more than one seal per surface; only one of seal, ripple or roundel
  may lead a composition.
- `--trace`, `--trace-alt` and `--hairline` never carry text; `--faint` only
  carries large or duplicated text.
- No second line weight.
- Never use the em dash character; use "-".

## Provenance

Extracted from a one-page stationery study and rebuilt here as a general
system. This folder is the whole system.
