# KONBINI - design spec

A travel-poster series about quiet everyday places, drawn in pixels. Every
surface is a poster: enormous margins, few elements, one carefully built
pixel-art scene as the centrepiece, heavy display type floating in a winter
sky, small type resting on snow-white paper. Calm, cold air, soft nostalgia.

The dark theme is not an inversion. It is the same poster at night: the sky
goes to ink, the paper to blue snow, and the storefront glass becomes the
brightest thing on the street.

Status: documented. This folder is the whole system.

## Tokens

Day sits on bare `:root`. Night is reached by `prefers-color-scheme: dark`
(unless `data-theme="light"` is set) or by `data-theme="dark"`.

### UI roles

| Token | Day | Night | Role |
|---|---|---|---|
| `--field-top` | `#5fb2dd` | `#0a1430` | Top stop of the one gradient |
| `--field-mid` | `#8ecbe9` | `#1b2d5a` | Middle stop, at 55% |
| `--field-low` | `#c9e6f4` | `#3d5590` | Horizon stop |
| `--paper` | `#f4f8fa` | `#0e1629` | The page, and the ground under every scene |
| `--plate` | `#ffffff` | `#17223d` | Raised plates: buttons, fields, chips, frames |
| `--lit` | `#ffffff` | `#f1f5fb` | Whatever catches light: display type on the field |
| `--ink` | `#2563eb` | `#8db3ff` | Every word on paper; links; the primary plate |
| `--ink-strong` | `#2b3a55` | `#dbe5f4` | Strongest ink: pixel-step borders, labels, hover |
| `--accent` | `#f08c1e` | `#ff9b3d` | The sign's warm stripe. Marks, never words |
| `--recede` | `#a8cede` | `#34466f` | Whatever is far away: flat shadows, disabled |

`--lit` and `--plate` match by day and part at night; that is why they are two
roles and not one "white".

### Art ramp

Pixel illustration never fills with a UI role directly.

| Token | Day | Night | Role |
|---|---|---|---|
| `--art-lit` | = `--lit` | = `--lit` | Snow caps, lit faces |
| `--art-line` | `#2b3a55` | `#506596` | Outlines, frames, dark detail. Authored per theme |
| `--art-far` | = `--recede` | = `--recede` | Distant silhouettes |
| `--art-haze` | = `--field-low` | = `--field-low` | Haze near the horizon |
| `--art-ground` | = `--paper` | = `--paper` | The scene's ground strip |
| `--art-detail` | = `--ink` | = `--ink` | Painted detail, posters, poles |
| `--art-accent` | = `--accent` | = `--accent` | Sign band, cone, marks |
| `--art-glass` | = `--field-top` | = `--lit` | Glass: reflects the sky by day, lit at night |

`--art-line` is authored on its own because an outline dark enough to sit beside
text disappears around a silhouette against a night sky.

### Type and layout

- `--font-display`: "Helvetica Neue", Helvetica, Arial, sans-serif.
- `--font-cjk`: "Hiragino Kaku Gothic ProN", "Hiragino Sans", "Yu Gothic",
  "Noto Sans JP", sans-serif.
- `--page-max: 1180px`, `--page-pad: clamp(1.25rem, 5vw, 4rem)`,
  `--measure: 62ch`, `--measure-note: 24ch`.
- `--scene-px`: 3px by default, 4px at >= 1500px, 2px at <= 700px. Whole
  numbers only.

## The pixel rule (the system's signature)

All illustration is pixel art on a fixed integer grid.

- Inline SVG, axis-aligned `<rect>` elements only; integer x/y/width/height.
- `shape-rendering="crispEdges"` on every illustration SVG.
- No curves, no strokes, no anti-aliasing, no path elements.
- Fills are `--art-*` inks only, never raw hex.
- Scaling happens in integer steps: CSS width is always a whole multiple of
  the viewBox grid (1x, 2x, 3x, 4x). Never fractional.
- Scene grid is 176x104; icons are 16x16.

## The one-gradient rule

Exactly one gradient exists in the system: the vertical field,
`linear-gradient(180deg, --field-top 0%, --field-mid 55%, --field-low 100%)`.
It is always vertical and always the sky behind display type. Nothing else may
grade: no gradient text, no gradient buttons, no radial anything. Bands, plates
and shadows are flat fills.

## Type voices

- **Display** (`.poster-title`, clamp(3.25rem, 12vw, 8rem), 800, -0.03em):
  `--lit` on the field. Poster size only - at least 32px bold, never body copy.
- **Section** (`.spread-head h2`, clamp(1.75rem, 4vw, 2.5rem), 800), **sub-head**
  (1.0625rem, 800), **folio** (`.k-pageno`, 1.375rem, 800).
- **Body** (1rem, 400, max `--measure`), **caption** (0.9375rem, 700,
  lowercase), **spaced** (`.poster-sub`, 0.28em - the only voice that opens
  up), **footnote** (0.8125rem, ragged right, max `--measure-note`), **label**
  (0.75rem, 700, lowercase).
- **Kana display** (`.poster-kana`, clamp(3.5rem, 16vw, 10rem), 700): kana set
  in ink as pure graphic shape. Scenery, never navigation.
- Small type on the field is `--ink-strong`, never `--lit`.
- No monospace. This system is a poster, not a terminal.

## Form

- Radius 0 everywhere.
- Border: four 2px box-shadow edges with the corners left empty (a rectangle
  drawn in pixels, not a CSS border).
- Shadows are flat offset plates in `--recede`, zero blur: 4px at rest, 6px on
  hover lift, none when pressed, 8px for a whole poster frame.
- Sign band: 24px with 6px lit stripes (thin: 14px / 4px), 2px `--art-line`
  hairlines.
- Every distance is a multiple of the 2px step.

## Motif vocabulary

- **Pixel scene**: one quiet everyday place (a small corner store on a snowy
  street: snow-capped roof, air-conditioning units, sign band, glass
  storefront, vending machine, cone, small truck, power poles with sagging
  lines and birds, distant buildings, one cloud). One per page.
- **Pixel icons** (16 grid): power pole, vending machine, traffic cone, air
  conditioner, small truck, snowflake, rice ball, drink can.
- **Caption row**: three short lowercase phrases across the full width.
- **Katakana block**: a giant kana column or row as graphic texture.
- **Sign band**: lit/accent/lit fascia stripe; the section divider.
- **Field**: the gradient block that display type floats in.
- **Footnote and folio**: a small ragged paragraph with a page number.

## Components and states

All states are live on the catalog page.

- **Link**: ink, 1px underline; hover = ink-strong with 2px underline;
  focus-visible = 2px ink outline, 2px offset (global rule).
- **Button** (`.k-btn`): plate, ink text, 2px ink-strong pixel-step edge, 4px
  recede shadow. Primary: ink plate, plate-coloured text. Hover lifts one 2px
  step and the shadow grows one step; active lands exactly on the shadow;
  disabled is paper with recede text and edge, no shadow.
- **Chip** (`.k-chip`, a toggle button): plate with 3px accent top and bottom
  stripes, ink lowercase text; `aria-pressed="true"` = ink plate,
  plate-coloured text; disabled = recede.
- **Pagination** (`.k-pagination`): folios, "3 / 7"; current ink, total
  ink-strong; arrows are buttons, truly disabled (recede) at either end.
- **Entry** (`.k-entry` + `.k-input`): plate field, 2px ink-strong bottom rule,
  ink caret and placeholder, ink-strong value; focus = ink rule; disabled =
  recede field.

## Motion

Almost none: posters do not move. The authored moments live in the hero: three
birds on the wire (9s, 13s, 17s loops, `steps(1, end)`) and one cloud drifting
28 grid pixels over 160s in `steps(28)`. `prefers-reduced-motion` freezes them.
Component states have no transitions; they snap.

## Screen: the pixel sky (optional)

`js/pixel-sky.js` is a WebGL2 treatment for a field block. It cuts the sky into
whole cells (`uPx` 4 CSS px, rounded to device pixels), ordered-dithers the
three field stops into each other with a 4x4 Bayer matrix (`uSpread` 3.0 keeps
the dither to the seams), and drops snow one cell at a time in two layers
(`uDensity` 0.012, `uFall` 7 cells/s). The pointer is a lamp that lifts the sky
toward the horizon stop (`uRadius` 0.42, `uLift` 0.55) and sets the wind
(14 cells/s at the edge, 1.5 at rest), both on a spring (k 58, d 9).

It can only emit `--field-top`, `--field-mid`, `--field-low` and `--lit`, read
from the live tokens and re-read on any theme change. Enhancement only: the
canvas sits on the static field gradient and is transparent until its first
frame; it stops off screen; under reduced motion it draws one settled frame.
It belongs in a field block behind display type or in an empty poster frame -
never behind body text, never in the hero scene, never twice on a page.

## Refusals

- No curves, circles or strokes in illustration; rects only.
- No shadows except flat pixel-step offsets. No blur, ever.
- No text on the accent. It is stripes, cones and marks.
- No body text in `--recede`; it is for distance and disabled.
- No gradient beyond the one field.
- No fractional pixel scale.
- No motion beyond the hero birds and cloud, and the optional pixel sky.
- No badges, counters or alerts in the vocabulary: a poster that shouts is an
  advertisement.
- No token named for a hue. Both posters have to keep every name true.

## Contrast floor

| Pair | Day | Night |
|---|---|---|
| `--ink` on `--paper` | 4.8:1 | 8.6:1 |
| `--ink` on `--plate` | 5.2:1 | 7.5:1 |
| `--ink-strong` on `--paper` | 10.7:1 | 14.2:1 |
| `--ink-strong` on `--field-mid` | 6.5:1 | 10.5:1 |
| `--lit` on `--field-top` | 2.4:1 | 16.6:1 |
| `--art-line` on `--paper` | 10.7:1 | 3.1:1 |
| `--recede` on `--paper` | 1.6:1 | 1.9:1 |

Lit on the daytime field is poster display only (>= 32px bold, never body).
Recede never carries readable text; the accent never carries text at all.
