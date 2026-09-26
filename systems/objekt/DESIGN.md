# OBJEKT - design spec

## Thesis

Every UI element is a printed label on paper stock: stickers, stamps, barcodes,
serial plates and spec sheets laid out on a concrete sheet inside a black press
frame. Print, not screen - depth exists only as the hard offset shadow of a
lifted sticker, and colour exists only as material.

Two things to hold on to:

- **Colour is material.** Four stocks and their inks are the whole palette.
  There is no accent hue, not even for errors.
- **Depth is a hard offset shadow.** A label rests on the sheet, or it is
  peeled up toward you. Zero blur either way.

Status: Documented 2026-09-26. Catalog: `index.html`. Tokens and components:
`css/objekt-core.css`.

## Tokens

Day sheet (default) / night sheet (OS preference, or the catalog's toggle).
Both are hand-authored. Names are roles: on the night sheet the lead stock is
the palest label on the page, and it is still the lead.

| Token | Day | Night | Role |
|---|---|---|---|
| `--ground` | `#d7d5d0` | `#1f1e1b` | The sheet every label is stuck to |
| `--frame` | `#0e0e0e` | `#080808` | Press frame; every hard lift shadow |
| `--shade` | `#bcbab4` | `#0a0a09` | Resting shadow a label casts on the sheet |
| `--frame-ink` | `#b9b5aa` | `#8f8b81` | Registration marks and captions on the frame |
| `--stock-lead` | `#161616` | `#e6e2d8` | Loudest label: section strips, primary stamps, error stamps |
| `--stock-mark` | `#c7ac83` | `#4f412e` | Marking stock: tags, secondary stamps, notes |
| `--stock-plate` | `#a4a8ab` | `#3c4044` | Plate stock: technical and serial labels |
| `--stock-base` | `#edeae2` | `#35342f` | Base stock: forms, tables, reading surfaces |
| `--ink` | `#1a1a1a` | `#ece8de` | Ink on mark, plate, base and ground |
| `--ink-2` | `#34312b` | `#bdb8ac` | Secondary step of the same ink |
| `--ink-dis` | `#989791` | `#7a776e` | Disabled ink on base stock (solid, no opacity) |
| `--ink-dis-mark` | `#7e7059` | `#837154` | Disabled ink on mark stock |
| `--ink-dis-plate` | `#6d7072` | `#71757a` | Disabled ink on plate stock |
| `--ink-on-lead` | `#eae7df` | `#161616` | Ink on lead stock |
| `--ink-on-lead-2` | `#b9b5aa` | `#3e3a33` | Secondary ink on lead stock |
| `--ink-on-lead-dis` | `#6b6a66` | `#8a877f` | Disabled ink on lead stock |

Non-colour tokens: `--rule-w: 3px`, `--lift: 4px 4px 0 var(--frame)`,
`--frame-w: 28px` (20px under 900px, 14px under 720px), `--t-lift: 120ms`,
`--ease-lift: cubic-bezier(0.2, 0.9, 0.2, 1)`.

Contextual tokens, set by the stock classes rather than by hand:
`--c-ink-2` (secondary ink for the current stock) and `--c-ink-dis` (disabled
ink for the current stock).

## The four stocks

| Class | Background | Ink | Secondary ink | Disabled ink |
|---|---|---|---|---|
| `.stock-lead` | `--stock-lead` | `--ink-on-lead` | `--ink-on-lead-2` | `--ink-on-lead-dis` |
| `.stock-mark` | `--stock-mark` | `--ink` | `--ink-2` | `--ink-dis-mark` |
| `.stock-plate` | `--stock-plate` | `--ink` | `--ink-2` | `--ink-dis-plate` |
| `.stock-base` | `--stock-base` | `--ink` | `--ink-2` | `--ink-dis` |

Contrast floor: every body and secondary ink is at least 4.5:1 on its stock on
both sheets. The tightest pair is `--ink-2` on `--stock-mark` (6.0:1 day,
5.0:1 night). Disabled inks sit at 2.1 - 3.3:1 and are always paired with a
dashed edge, so the state never rests on contrast alone.

## Type voices

- **Display** - `--font-display`: "Anton", fallback "Arial Narrow", Impact.
  Ultra-heavy condensed uppercase, weight 400, tracking -0.01em. Strip words
  `clamp(56px, 7.2vw, 92px)`, section strips `clamp(20px, 3vw, 30px)`, stamp
  buttons 14px at +0.01em. Often set vertically (`.v-text`:
  `writing-mode: vertical-rl` + `rotate(180deg)`) to run up a strip.
- **Data** - `--font-mono`: the platform mono. Uppercase, wide tracking:
  data 10px / 0.12em, field values 13px / 0.08em, labels and badges 9px /
  0.14em, barcode digits 9px / 0.28em.
- **Fine print** - `--font-fine`: condensed sans ("Arial Narrow" stack). Body
  14px / 1.45; the justified fine-print band 10.5px / 1.5.

Small type opens up and large type closes in - the stamped word and the
machine-typed data, as on a real label.

## Space and form

- Measure 1120px, centred on the sheet. Sheet padding
  `clamp(16px, 4vw, 56px)` at the sides. Plates pad 16px, strips 14px.
- Steps in use: 4, 6, 8, 10, 12, 14, 16, 24px. Sections are
  `clamp(40px, 6vw, 72px)` apart and open on a lead strip.
- Radius 0 everywhere, inputs included.
- Line weights: 1px (rows, badges), 1.5px (index stamps, serial plates),
  2px (button edges, field underline, checkbox, focus), 3px (`--rule-w`: thick
  rule, table tops, error underline). Dashed means disabled.
- Shadows: `6px 6px 0 var(--shade)` for a resting strip, `4px 4px 0
  var(--shade)` for a resting plate, `--lift` for a peeled-up sticker.

## Motif vocabulary

- **Barcode** - SVG rects of irregular widths in currentColor, mono digits
  beneath.
- **Index stamp** - small bordered box, `01/004` style.
- **Serial plate** - stacked mono rows, one rotated 90deg.
- **Technical drawing** - inline SVG patent-style line art (twin reels,
  exploded enclosure, rotor, spring), 1.4px strokes in currentColor, fill none.
- **Registration marks** - `+` crosses at frame corners; rotated micro captions
  along the frame edges.
- **Thick rule** - 3px solid divider with small `I` end ticks.
- **Strip label (card primitive)** - tall narrow column in one stock, stacked
  top to bottom: giant vertical display word, thick rule, revision and volume
  tag, rotated data column, technical drawing, barcode, index stamp.

Every motif is drawn in currentColor, so it follows the stock and the sheet.

## Components and states

- **Stamp button** (`.btn`) - solid lead-stock label, Anton uppercase. Hover
  lifts: `translate(-2px, -2px)` + `--lift`. Active presses flat. Focus: 2px
  solid outline in `--ink`, offset 2px - drawn in the surface's ink, not the
  stamp's. Disabled: disabled ink + dashed edge. Variants `.btn-base` and
  `.btn-mark` carry a 2px ink border.
- **Text field** (`.field`) - on base stock: mono micro label, 2px ruled
  underline, mono value. Focus outlines. Error (`.is-error`): 3px underline +
  a lead-stock REJECTED stamp naming the problem and the range. Disabled:
  disabled ink, dashed underline.
- **Badge** (`.badge`) - small stock chip, mono micro, 1px ink border on the
  light-inked stocks; dashed when disabled.
- **Spec table** (`.spec-table`) - thick top rule, thin row rules, keys bold in
  the fine voice, mono values right-aligned.
- **Checkbox** (`.check`) - stamp box; checked is a struck X; disabled is a
  dashed box in disabled ink. Real `<input>`, keyboard operable.

## Motion

Print-like restraint. The single authored moment is the sticker lift on hover
(`--t-lift` 120ms, `--ease-lift`, transform and box-shadow only). The checkbox
X is stamped instantly. `prefers-reduced-motion` removes the transition;
states still change.

## Screen: the thermal head (optional)

`js/thermal.js` is a WebGL2 surface treatment. A sheet of die-cut labels feeds
slowly out of a printer, already carrying an index block, data rows and a
barcode. The pointer is the print head, followed on a spring (k 60 / d 10):
where it passes, the stock burns in square dots through a 4x4 ordered dither,
dwelling burns solid, and what it printed rides up with the paper and cools.

- Dot pitch 4px, labels 34 x 22 dots, feed 3 dots/s, head reach 0.075 stage
  heights (squeezed 2.2x along the feed), 32 head samples every 45ms, heat 0.34
  per sample cooling on a 0.9s time constant.
- Colours are read from `--stock-base`, `--ink` and `--ink-dis` at runtime and
  re-read when the theme changes. The shader can emit only those three -
  no gradient, blur or hue is possible.
- Enhancement only: the canvas is transparent until its first frame, and the
  static fallback is the unprinted die-cut sheet in CSS. Stops off screen;
  one settled frame under reduced motion.
- Where it belongs: an empty state, a printing moment, a bare hero. Never
  behind body text or a form.

## Refusals

- No gradients. No border-radius. No blur or soft shadows.
- No transparency or opacity effects - disabled inks are pre-mixed solids.
- No accent hue, not even for errors. Errors are stamps.
- No mid-grey text on mark or plate stock; use the stock's own secondary ink.
- No token named for a hue or a material.
- No glows, glass, rounded chrome or decorative motion.
