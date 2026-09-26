# MOCHI - soft neumorphic widget system

Every surface is a soft pillow pressed from one warm material, the same colour
as the page, and depth comes from light - never from lines. Colour sits inside
the material as flat plates; it is never the material itself. Big friendly
rounded numbers and a few cute motifs (flip digits, pill gauges, a blushing
face) give it its character.

Status: Documented 2026-09-26. This folder is the whole system.

## Thesis

1. **The material has exactly two states**: raised at rest, pressed when
   active. There is no third depth - no hover lift, no floating.
2. **Colour sits inside the material, never instead of it.** A raised or
   pressed surface is always `--ground`. If the fill differs, it is a plate,
   and a plate lies flat inside a widget with a small shadow.

## Tokens

Light theme (default) / dark theme (OS preference, or the catalog's toggle).
Dark is the same mochi dusted in roasted sesame: warm, never cold black.

### The material

| Token | Light | Dark | Role |
|---|---|---|---|
| `--ground` | `#ece9e2` | `#2d2926` | Page AND every widget - one material |
| `--plate` | `#f7f5f0` | `#36322e` | Neutral inner plates: digit tiles, callouts |
| `--seam` | `#efece5` | `#2f2b28` | The soft fold across a digit tile |
| `--light` | `#ffffff` | `#45403b` | The lit side of every shadow recipe |
| `--shade` | `#a69e90` | `#0d0b09` | The shaded side of every shadow recipe |
| `--track` | `#d6d1c5` | `#45403a` | Empty tracks, idle page dots |

### Ink

| Token | Light | Dark | Role |
|---|---|---|---|
| `--ink` | `#5d574e` | `#ebe4d8` | All body text; soft warm dark, never black |
| `--ink-soft` | `#6b665c` | `#b3ab9e` | Secondary text, captions, placeholders |
| `--on-deep` | `#fbfaf7` | `#f6f1e8` | Text and dial hands on `--anchor` and `-deep` plates |
| `--lit` | `#fbfaf7` | `#e4ddd1` | The brightest body: toggle knobs, slider thumbs |

### Anchor, glint, focus

| Token | Light | Dark | Role |
|---|---|---|---|
| `--anchor` | `#3e5c68` | `#3b6170` | The one deep plate: primary button, dial face |
| `--glint` | `#d4a94e` | `#d9b566` | Tiny sparks only: dial marks, glyph details |
| `--focus` | `#3e5c68` | `#93c3cf` | The focus ring - the only outline in the system |

### Fill roles

Each role is a plain fill (colour only, no text), a `-deep` plate (carries
`--on-deep` at large-bold sizes) and a `-tint` plate (carries `--ink` at any
size). Names are jobs, not hues, so they stay true in both themes.

| Role | Fill | Deep | Tint | Job |
|---|---|---|---|---|
| `--level` | `#93a9cb` / `#8398ba` | `#6d87b1` / `#56709a` | `#c9d4e6` / `#3a4150` | Quantity: slider fill, ring arc, gauge liquid |
| `--cue` | `#d698a0` / `#c98f98` | `#bd747f` / `#a25f6b` | `#eccfd3` / `#4a3a3c` | "Look here": colon, active dot, blush, feature plate |
| `--active` | `#8fb5a4` / `#84a998` | `#679181` / `#4f7b6b` | `#cfdfd7` / `#34443d` | Switched on: toggle track, selected chip, active row |
| `--decor` | `#e5c39c` / `#cfae88` | - | `#f2dfc8` / `#4a4033` | Decoration only - means nothing, on purpose |

(Values are light / dark.)

### Form, type, motion

- Radii: `--r-sm: 18px`, `--r-md: 22px`, `--r-lg: 28px`, `--r-shell: 44px`
  (36px below 420px). Small parts sit at 12-20px, sized to their height.
- Type: `--font: ui-rounded, "SF Pro Rounded", "Hiragino Maru Gothic ProN",
  "Yuanti SC", "PingFang SC", sans-serif` - system fonts only. Display
  clamp(44-64px)/700; digits clamp(46-62px)/700 tabular; section 26/700;
  gauge numbers 21-22/700 tabular; lead 17/400; title 16/700; body 15/400
  at 1.55; label 13/600; caption floor 12/600. `--font-code` for token names.
- Motion: `--press-ease: 120ms ease-out` (raised to pressed, fills, knob,
  tooltip); `--fade-ease: 240ms ease-out` (blush, canvas reveal); the digit
  colon blinks at 1s `steps(1)`.

## The material rule (the signature)

The recipes are written once, in terms of `--light` and `--shade`. A theme
changes the two lights, never the recipe:

```css
--raised: -6px -6px 14px color-mix(in srgb, var(--light) 85%, transparent),
  7px 7px 16px color-mix(in srgb, var(--shade) 42%, transparent);
--pressed: inset -4px -4px 10px color-mix(in srgb, var(--light) 80%, transparent),
  inset 5px 5px 12px color-mix(in srgb, var(--shade) 40%, transparent);
--plate-shadow: -3px -3px 8px color-mix(in srgb, var(--light) 55%, transparent),
  3px 3px 8px color-mix(in srgb, var(--shade) 30%, transparent);
```

Plus `--knob-shadow`, `--thumb-shadow`, and `--deep-inset` (the inner shade of
the anchor plate).

- Every interactive element is raised at rest and pressed when active.
- Raised and pressed surfaces are always `--ground`.
- Light comes from the top-left. Never flip a shadow.
- The smallest gap between two raised things is 14px, set by the shadow blur.

## Contrast rules

| Pair | Light | Dark | Allowed for |
|---|---|---|---|
| `--ink` on `--ground` / `--plate` | 5.9 / 6.6 | 11.4 / 10.1 | Body text anywhere |
| `--ink-soft` on `--ground` / `--plate` | 4.7 / 5.2 | 6.3 / 5.6 | The floor for secondary text |
| `--ink` on `-tint` plates | 4.8 - 5.5 | 8.0 - 8.5 | Small text on colour |
| `--on-deep` on `--anchor` | 6.9 | 6.0 | Any size |
| `--on-deep` on `-deep` plates | 3.4 - 3.5 | 4.3 - 4.5 | Large bold only: >= 19px, or >= 14px bold |
| `--ink` on a plain fill | about 3.0 | about 2.1 | Never text |
| `--focus` on `--ground` | 5.9 | 7.5 | The focus ring |

The deep plates were darkened until light text cleared 3:1: deepen the plate,
never shrink the text. Disabled is flat material at 45% ink (exempt).

## Motifs

- **Widget** - raised squircle of ground material. The only container.
- **Flip digits** - two `--plate` tiles with a soft `--seam`, a ticking
  `--cue` colon, a caption row with a small pressed pill.
- **Pill gauge** - pressed track, a `-deep` liquid rising from the bottom,
  bold `--on-deep` value and label on the liquid.
- **Dial** - `--anchor` face as a dish (`--deep-inset`), `--glint` marks,
  `--on-deep` hands and cap.
- **Ring gauge** - `--level` arc on a `--track` ring, rounded caps, value in
  the centre.
- **Face plate** - an `--active-tint` plate with a ">u<" face; `--cue` blush
  fades in on hover.
- **Squircle** - 60px raised squircle with a fill role and a glyph in 2-3
  token colours, rounded strokes.
- **Feature plate** - a `--cue-deep` plate with a roundel and large bold
  `--on-deep` text. One per board.
- **Page dots** - one `--cue` pill, the rest `--track`.
- **Bilingual label** - when a product is bilingual, the CJK label leads and
  the Latin gloss follows in `--ink-soft`.
- **Shell and board** - a `--r-shell` raised shell holding a 4-column board
  of widgets spanning 2 or 4, with a pressed shelf of squircles.

## Components and states

- **Button** - raised at rest; pressed on `:active` / `.is-pressed`; disabled
  is flat at 45% ink. `.btn-primary` is the `--anchor` plate. `.btn-sm`,
  `.btn-round`.
- **Toggle** - pressed track, raised `--lit` knob; track fills `--active` when on.
- **Slider** - pressed track, `--level` fill from the left (or `--cue`),
  raised `--lit` thumb; disabled fill drops to `--track`.
- **List rows** - divider-free rows in a tray; the selected row is an
  `--active-tint` plate.
- **Chip** - small raised pill; selected is pressed with `--active-tint`.
- **Tooltip** - tiny raised plate on hover or focus.
- **Input** - pressed field, `--ink-soft` placeholder; disabled is flat.
- **Focus** - `outline: 2px solid var(--focus); outline-offset: 3px`.
- **Hover** changes nothing but the cursor - a hover state would need a third
  depth.

## Screen (optional)

`js/dough.js` - a WebGL2 dough press: one pillow of `--ground`, lit from the
top-left, breathing slightly. A resting pointer touches it; holding the button
presses a dimple that swells a ring around it and blushes toward `--cue`.
Colours are read from `--ground`, `--light`, `--shade` and `--cue` at runtime.
Enhancement only (a CSS pillow is the fallback), visibility-gated, one settled
frame under reduced motion. It belongs in an empty state or a hero - never
behind text or controls.

## Do / Do not

- DO mould everything from `--ground`; depth comes from light.
- DO keep the light top-left in both themes.
- DO put colour on plates inside widgets.
- DO use a `-tint` plate for small text on colour, a `-deep` plate for large
  bold light text.
- DO spend `--cue` in small doses.
- DON'T draw a border or outline anywhere, except the focus ring.
- DON'T use pure black, pure white or a cold grey.
- DON'T use a hard shadow, or write a new shadow instead of the recipes.
- DON'T add a second deep plate colour: `--anchor` only.
- DON'T put small light text on any pastel, or any text on a plain fill.
- DON'T add a third depth: no hover lift, no floating.
- DON'T run the dough press behind text or controls.
