# SPROUT - design spec

Cozy farm-game pixel UI kit: every control is a hand-baked game prop - a biscuit,
a wooden plank, a sprout - drawn on a 3px pixel grid on a warm matcha board.
An original CSS/SVG homage to the Sprout Lands UI asset pack by Cup Nooble;
the vibe is recreated, the assets are not copied.

Status: Exploration. Catalog: `index.html`. Tokens + components: `css/sprout-core.css`.

## Tokens

| Token | Value | Role |
|---|---|---|
| `--px` | `3px` | The pixel unit at 1x. Every size, corner step, bevel, and icon cell is an integer multiple. Rescale a subtree by scoping `--px`. |
| `--matcha` | `#b8cf70` | Page ground (the board) |
| `--matcha-deep` | `#a3bd5c` | Board inset plates / stripes |
| `--biscuit` | `#ecd7ab` | Button face |
| `--cream` | `#f6ead0` | Button top bevel, panel face |
| `--biscuit-shade` | `#d9b98a` | Button bottom bevel, pressed face |
| `--crust` | `#b08d62` | Outlines of biscuit pieces. Never small text. |
| `--cocoa` | `#6b5346` | Dark buttons, slider tracks, segment dashes, text on light |
| `--leaf` | `#9ac059` | Toggle-on, sign plate |
| `--leaf-deep` | `#7da644` | Sign border/shade, tendrils |
| `--snow` | `#fdfdf5` | Pixel icons, cursor, sign text |

Derived shades (verified for contrast or bevels, not for new hues):

| Token | Value | Role |
|---|---|---|
| `--cocoa-deep` | `#4f3b31` | Small text on matcha grounds (>= 5:1 on both greens) |
| `--cocoa-soft` | `#7c6455` | Placeholder / secondary text on cream only (>= 4.5:1) |
| `--cocoa-light` | `#7d6252` | Top bevel + hover face on cocoa pieces |
| `--cocoa-dark` | `#554136` | Bottom bevel / outline on cocoa pieces |

## Construction rule (the signature)

Components are built from pixel steps, not CSS curves.

- `border-radius` is BANNED. Rounded pixel corners are made with clip-path step
  polygons or stacked box-shadow pixels at `--px` increments. Corners step in
  2 pixel-units, never smooth radius: the standard corner clip insets the edge
  2 units, stepping 1 unit at a time (`--c1: 1u`, `--c2: 2u`); large plates scale
  the same staircase (`--c1: 2u`, `--c2: 4u`).
- Every outline is a solid `--crust` or `--leaf-deep` edge one `--px` thick,
  built as an outer layer (outline color + corner clip + `padding: var(--px)`)
  wrapping a clipped face.
- Depth is a one-`--px` bottom bevel: lighter top edge, darker bottom edge,
  as two inset box-shadows on the face:
  `inset 0 var(--px) 0 0 <light>, inset 0 calc(-1 * var(--px)) 0 0 <dark>`.
- Pressed states remove the bevel and shift content down one `--px`.
- All decorative art is inline SVG of axis-aligned integer rects with
  `shape-rendering="crispEdges"`. Icon grids: 16 cells (sprites, 1 cell = 1
  `--px` at default size) and 8 cells (control glyphs).

## Type voices

- Display: "Silkscreen" (Google Fonts, fallback monospace), uppercase. Button
  labels, sign text, headings, spec captions. Integer px sizes only: 10 / 15 /
  20 / 30 / 40. No anti-alias tricks.
- Body: system-ui sans, 13-14px. `--cocoa` on biscuit/cream, `--cocoa-deep` on
  matcha grounds.

## Motif vocabulary

- Biscuit button: rounded-pixel square or wide rect. Default cream top bevel;
  hover face lightens to `--cream` (top bevel `--snow`); pressed face
  `--biscuit-shade`, bevel removed, content down 1 `--px`; disabled desaturated
  with `--crust` text. Cocoa variant for dark controls (D-pad, cancel).
- Wooden sign: `--leaf` plate, `--snow` pixel border, `--leaf-deep` outer edge
  and bottom shade, Silkscreen snow text, two curling sprout tendrils (SVG
  rect-art) off the top corners. Section headers.
- Settings panel: large cream panel, `--crust` outline, rounded pixel corners,
  biscuit X close button docked top-right.
- Toggle: pixel pill. On = `--leaf` track, biscuit knob right; off = `--cocoa`
  track, knob left. Knob is a rounded-pixel circle with crust outline; track
  outline is cocoa.
- Checkbox: biscuit square, cocoa pixel check. Radio and pagination: seed dots.
- Segment bar: row of small vertical pixel dashes; filled = solid `--cocoa`,
  empty = `--cocoa` outline only.
- Sliders: horizontal + vertical `input[type=range]`; cocoa rounded-pixel
  track, biscuit pill thumb, pixel minus/plus biscuit buttons at the ends.
- Tooltip: tiny biscuit plate with a pixel-step tail built from stacked
  box-shadow pixels.
- Input: biscuit-outlined cream field, cocoa caret, `--cocoa-soft` placeholder.
- Board: page ground is `--matcha`; sections sit directly on it or on
  `--matcha-deep` inset plates (rounded pixel corners, no outline).

## Component states

Every interactive piece ships default / hover / pressed-or-checked / disabled /
focus-visible. Focus-visible is `2px solid --cocoa` outline, offset 2px, always
on an UNCLIPPED wrapper (clip-path would clip the outline away).

## Motion

Toy motion, `steps()` only - nothing eases:

- Pressed shift: instant 1 `--px` drop.
- Toggle knob: hops across in 2 steps (`transform .2s steps(2)`).
- Sign tendrils: sway one pixel left/right on a slow loop
  (`steps(1)` alternate, animating the `translate` property so the
  `scaleX(-1)` mirror transform is untouched).
- `prefers-reduced-motion`: sway stops, state changes stay instant.

## Contrast floor (verified)

- `--cocoa` on `--biscuit` ~5.0:1 - the standard text pair.
- `--cocoa` on `--cream` ~6.0:1.
- `--cocoa-deep` on `--matcha` ~6.1:1, on `--matcha-deep` ~5.0:1 - use for all
  small text on greens (plain `--cocoa` on `--matcha` is ~4.1:1, below AA).
- `--snow` on `--leaf` ~2.1:1 - sign text is large display only (>= 19px
  Silkscreen bold equivalent). Small text on green uses cocoa inks.
- Never `--crust` as small text color.

## Do / don't

- Do: flat fills, 1-unit edges, step corners, integer sizes, chunky icons.
- Don't: border-radius, smooth curves, gradients, blur, drop shadows with blur,
  anti-aliased decoration, eased motion, `--crust` body text, small snow text
  on leaf.
