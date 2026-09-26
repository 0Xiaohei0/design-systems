# OBJEKT - design spec

## Idea

Every UI element is a printed label on paper stock: stickers, stamps, barcodes,
serial plates, and spec sheets laid out on a concrete-gray sheet inside a black
press frame. Print, not screen - depth exists only as the hard offset shadow of
a lifted sticker, and color exists only as material.

Status: Exploration. Catalog page: `index.html`. Tokens and components:
`css/objekt-core.css`.

## Tokens

| Token | Value | Role |
|---|---|---|
| `--stock-black` | `#161616` | Black stock (labels, section strips, primary buttons) |
| `--stock-kraft` | `#c7ac83` | Kraft stock (warm utility labels) |
| `--stock-steel` | `#a4a8ab` | Steel stock (cool utility labels) |
| `--stock-bone` | `#edeae2` | Bone stock (forms, tables, reading surfaces) |
| `--ground` | `#d7d5d0` | The paper sheet everything sits on |
| `--frame` | `#0e0e0e` | Page frame, deepest black, hard shadows |
| `--ink` | `#1a1a1a` | Ink on kraft, steel, bone, ground |
| `--ink-2` | `#34312b` | Secondary step of the same ink (still >= 4.5:1 on all light stocks) |
| `--ink-40` | `#989791` | 40% ink on bone, disabled only (solid mix, no opacity) |
| `--ink-on-dark` | `#eae7df` | Ink on black stock |
| `--ink-on-dark-2` | `#b9b5aa` | Secondary ink on black stock |
| `--ink-on-dark-40` | `#6b6a66` | 40% ink on black, disabled only |
| `--rule-w` | `3px` | Thick rule weight |
| `--lift` | `4px 4px 0 var(--frame)` | The sticker-lift shadow: hard offset, zero blur |

No accent hue anywhere. Never mid-gray text on kraft or steel - secondary text
is always a darker or lighter step of the stock's own ink.

## The four stocks and their inks

| Stock | Background | Ink | Secondary ink |
|---|---|---|---|
| BLACK | `#161616` | `#eae7df` | `#b9b5aa` |
| KRAFT | `#c7ac83` | `#1a1a1a` | `#34312b` |
| STEEL | `#a4a8ab` | `#1a1a1a` | `#34312b` |
| BONE | `#edeae2` | `#1a1a1a` | `#34312b` |

## Type voices

- **Display** - "Anton", fallback "Arial Narrow", Impact, sans-serif. Ultra-heavy
  condensed uppercase grotesque, tracking -0.01em. Often set vertically
  (`writing-mode: vertical-rl` + `rotate(180deg)`) to run up a strip.
- **Data** - ui-monospace stack, tiny uppercase, wide tracking (0.12em).
  Serials, capacities, binary strings: `SERIAL: 88-301`, `CAPACITY: 4000`,
  `0100 1100 0010`.
- **Fine print** - very small condensed sans ("Arial Narrow" stack), justified
  micro-text blocks, like the legal band on a shipping label.

## Motif vocabulary

- **Barcode** - SVG rects of irregular widths in currentColor, mono digits
  beneath (`5 8 8 9 1 8 - 0 6 8 0 7`).
- **Index stamp** - small bordered box, `01/007` style.
- **Serial plate** - stacked mono rows, some rotated 90deg.
- **Technical drawing** - inline SVG patent-style line art (tape reels, exploded
  enclosure, rotor, damper), 1.25-1.5px strokes in currentColor, fill none.
- **Registration marks** - `+` crosses and crop ticks at frame corners; rotated
  micro captions along the frame edges.
- **Thick rule** - 3-4px solid divider with small `I` end ticks.
- **Strip label (card primitive)** - tall narrow column in one stock, stacked
  top to bottom: giant vertical display word, thick rule, REV/VOL tag, rotated
  data column, technical drawing, barcode, index stamp.

## Components and states

- **Stamp button** (`.btn`) - solid black label, uppercase condensed. Hover
  lifts: `translate(-2px,-2px)` + hard 4px offset shadow, no blur. Active
  presses flat (no shadow). Focus: 2px solid outline in the stock's ink,
  offset 2px. Disabled: 40% ink + dashed edge. Variants: `.btn-bone`,
  `.btn-kraft` carry a 2px ink border.
- **Text field** (`.field`) - on bone stock: mono micro label, 2px ruled
  underline, mono value. Focus thickens nothing - it outlines. Error: 3px
  underline + a black `REJECTED` stamp naming the problem and range.
  Disabled: 40% ink, dashed underline.
- **Badge** (`.badge`) - small stock chip, mono micro, 1px ink border on light
  stocks.
- **Spec table** (`.spec-table`) - thick top rule, thin row rules, mono values
  right-aligned.
- **Checkbox** (`.check`) - stamp box, checked state is a struck X; disabled is
  40% ink with dashed edge. Real `<input>`, keyboard operable.

## Motion

Print-like restraint. The single authored moment is the sticker lift on hover
(translate + hard shadow, 120ms ease-out). `prefers-reduced-motion` removes the
transition; states still change instantly.

## Do / Don't

- Do: hard edges, hard offset shadows, solid fills, currentColor SVG.
- Don't: gradients. Don't: border-radius. Don't: blur or soft shadows.
- Don't: transparency or opacity effects (disabled uses pre-mixed solid colors).
- Don't: any accent hue. Don't: mid-gray text on kraft or steel.
- Don't: glows, glass, rounded chrome, decorative motion.
