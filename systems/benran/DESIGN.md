# BENRAN (本然) - design system spec

Tea-ceremony stationery: vast paper-white emptiness in which tiny ink-black tea
objects rest on a single hairline horizon. Content behaves like objects placed on
a shelf in a quiet room - small, precise, and surrounded by air; color exists only
as one seal stamp, a celadon ripple, or a tan roundel.

Status: exploration. Homage to a Sun Zhang tea-brand sheet ("本然 x 東方禪意").

## Tokens

| Token | Value | Role |
|---|---|---|
| `--paper` | `#fcfcfa` | page ground |
| `--card` | `#ffffff` | poster and bookmark ground |
| `--ink` | `#2a2a28` | silhouettes, primary text |
| `--faint` | `#8a8880` | secondary text; never lighter than this |
| `--hairline` | `#d5d3cd` | rules, card edges, disabled |
| `--celadon` | `#9fc4bd` | thin ripple lines, a single water drop |
| `--seal` | `#c25e4a` | vermilion seal stamp; tiny, at most one per surface |
| `--tan` | `#c9a87c` | roundel outline, secondary ripples |

Fonts: `--font-cjk: "Songti SC", "Noto Serif CJK SC", "SimSun", serif` and
`--font-latin: "Avenir Next", "Futura", "Century Gothic", "Helvetica Neue", Arial, sans-serif`.

## The emptiness rule

- Content occupies at most about one tenth of any surface. When a composition
  feels thin, remove something else rather than enlarging what remains.
- One accent per composition: a single seal stamp, OR a celadon ripple, OR a tan
  roundel may dominate; never all shouting at once. At most one seal per surface.
- Objects SIT on a line. Nothing floats without a horizon, a trail, or a ripple
  anchoring it.

## Type voices

- **CJK display** - vertical (`writing-mode: vertical-rl`), `--font-cjk`,
  15-36px, letter-spacing 0.3-0.5em. Words of the world: 本然, 東方禪意, 香道,
  書道, 茶道, 花道.
- **Latin caption** - 10-11px, weight 300-400, uppercase, letter-spacing 0.35em,
  `--font-latin`. E.g. "BENRAN", "ORIENTAL ZEN", "SUN ZHANG".
- **Body** - 13px / line-height 2, `--font-cjk`, `--ink` (or `--faint` when
  decorative and duplicated).
- **Numbers and dates** - tiny, tracked: "2026 / 8.3".

## Contrast rule (hard floor)

`--ink` on paper carries everything essential. `--faint` (about 3.4:1 on paper)
is used ONLY for text 18px+ or for decorative captions whose content is
duplicated elsewhere; anything smaller and essential uses `--ink`. Celadon, tan,
and hairline never carry text. The white-on-vermilion seal glyph is decorative.

## Motif vocabulary

- **Horizon rule** - 1px `--hairline` line, full or partial width, short angled
  tick marks at both ends (a shelf edge seen in perspective). Objects rest on it.
- **Object silhouettes** - solid `--ink` inline SVG, soft organic bezier
  outlines, small paper cutouts as highlights, 40-80px: tea bowl, donut stone,
  sprout-in-cup on saucer, iron teapot, gourd, plus a single leaf.
- **Roundel** - thin 1px circle (`--tan` or `--ink`) holding an abstract
  2-3 stroke 本 mark, 28-44px.
- **Seal stamp** - tiny filled `--seal` rounded square or circle with a white
  negative glyph. At most one per surface.
- **Dotted trail** - a vertical run of dots fading in size; steam above an
  object, or a path between list entries.
- **Ripple** - 2-3 concentric 1px ellipses, very wide and flat, `--celadon`
  (primary) or `--tan` (secondary), under an object like rings on still water.
- **The x mark** - a small "x" collaboration divider between two vertical
  text columns.
- **Poster card** - tall white card, 1px `--hairline` edge, aspect about 3:4
  (posters) or 1:2.6 (bookmarks); roundel top, vertical CJK center or corner,
  tiny Latin caption, one object, one accent.

## Components and states

- **Text link** - tiny tracked uppercase `--ink`; hover/focus makes a small
  `--seal` dot appear beside it; disabled is `--hairline`.
- **Stamp button** - vertical CJK label in a 1px hairline border; hover fills
  `--ink` with paper text, like an inked stamp; disabled is `--hairline` text
  and border.
- **Chip** - tiny bordered vertical 2-glyph label; selected gets an ink border;
  disabled is `--hairline`.
- **List rows** - dotted-trail entries: an ink dot marker, a dotted vertical
  path between rows.
- **Input** - bare `--hairline` underline, ink caret; focus turns the underline
  ink; placeholder is the Latin caption voice in `--ink`; disabled is hairline.
- **Pagination** - tiny 1px circles; current page filled `--ink`.
- **Focus-visible** - 1px solid `--ink` outline, offset 3px, everywhere.

## Motion

Stillness. The single authored moment: a ripple that slowly expands and fades
under the hero object (7s loop, ease-out, subtle), plus steam dots drifting up
2-3px. `prefers-reduced-motion` freezes both.

## Do / don't

- Do keep every element small; let the paper carry the composition.
- Do anchor objects on a horizon, trail, or ripple.
- Don't fill any area larger than a silhouette; no panels, no washes.
- Don't use bold weights; emphasis comes from placement and isolation.
- Don't use shadows, gradients, or glass.
- Don't round corners except the roundel (circle) and the seal stamp.
- Don't place more than one seal stamp per surface.
- Don't let celadon, tan, or hairline carry text.
- Never use the em dash character; use "-".
