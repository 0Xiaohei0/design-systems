# SPROUT - design spec

A pixel-prop UI kit: every control is a small physical object - a baked piece,
a wooden plank, a painted sign - drawn on a 3px pixel grid over a flat board.

Status: Exploration. Catalog: `index.html`. Tokens and components:
`css/sprout-core.css`. Everything is original CSS and inline SVG rect-art.

## Thesis

Two things to hold on to:

1. **Everything is a whole number of units.** Size, corner, edge, bevel, gap
   and every step of motion is an integer multiple of `--px`. Rescoping
   `--px` on a wrapper rescales the geometry inside as one object.
2. **Pieces are objects, not paint.** At night the ground goes dark, but a
   piece keeps its baked colour, dimmed as if lamplit. It never inverts.

## Tokens

`--px: 3px` is the unit. Colour tokens are roles. Day is the default; night
applies under `prefers-color-scheme: dark` unless `data-theme="light"` is set,
and always under `data-theme="dark"`.

| Token | Day | Night | Role |
|---|---|---|---|
| `--ground` | `#b8cf70` | `#141d16` | The board. Sections sit directly on it. |
| `--ground-inset` | `#a3bd5c` | `#0d140f` | Recessed plates: trays, stages. No outline. |
| `--ground-ink` | `#4f3b31` | `#eadfc4` | Text and glyphs set straight on the ground. |
| `--piece` | `#ecd7ab` | `#d2b98b` | Face of every raised control. |
| `--piece-hi` | `#f6ead0` | `#e2cfa6` | Top bevel, hover face, sheet face. |
| `--piece-lo` | `#d9b98a` | `#b89c6c` | Bottom bevel, pressed face, field lip. |
| `--piece-edge` | `#b08d62` | `#94754f` | The 1-unit outline. Never small text. |
| `--glint` | `#fdfdf5` | `#fbf3df` | Brightest pixel: hover bevel, sprite highlight, text on alt and accent. |
| `--alt` | `#6b5346` | `#80654f` | The counter-piece: secondary button, toggle track, rail, dashes, chosen seed. |
| `--alt-hi` | `#7d6252` | `#927561` | Top bevel and hover face of an alt piece. |
| `--alt-lo` | `#554136` | `#654f3f` | Bottom bevel and outline of an alt piece. |
| `--alt-glint` | `#8f7361` | `#a58772` | Hover top bevel of an alt piece. |
| `--ink` | `#6b5346` | `#4a372c` | Text and glyphs on a piece or a sheet. |
| `--ink-soft` | `#7c6455` | `#65503f` | Placeholder and secondary text, sheet face only. |
| `--accent` | `#9ac059` | `#5f8a34` | The on state; heading-sign face. |
| `--accent-lo` | `#7da644` | `#4d7629` | Sign edge and shade, tendrils. |
| `--disabled` | `#e7decb` | `#4a4840` | Face of a disabled piece. |
| `--disabled-hi` | `#f1ebdd` | `#57554c` | Its top bevel. |
| `--disabled-lo` | `#d2c7ae` | `#3d3b35` | Its bottom bevel; disabled track. |
| `--disabled-edge` | `#c4b499` | `#33312c` | Its outline; disabled knob. |
| `--disabled-ink` | `#b08d62` | `#928c7b` | Label on a disabled piece. |
| `--focus` | `#6b5346` | `#80654f` | The 2px focus ring. |

By day `--ink`, `--alt` and `--focus` share one value. They are separate roles
because at night they must part: text on a lamplit piece stays dark, while a
track or focus ring has to clear 3:1 against a dark board and a light sheet at
once.

Type: `--font-pixel` ("Silkscreen", monospace), `--font-body` (system-ui
stack), `--font-code` (ui-monospace stack, documentation only). Sizes:
`--fs-hero` 40px, `--fs-title` 30px, `--fs-heading` 20px, `--fs-label` 15px,
`--fs-caption` 10px, `--fs-body` 14px. Pixel text is always uppercase.

Motion: `--t-hop` 0.2s (toggle knob, `steps(2)`), `--t-sway` 2.6s (one hold of
the tendril sway, `steps(1)`).

## Construction rule (the signature)

- `border-radius` is banned. Corners are `clip-path` staircases (`--clip-px`)
  stepping 2 units in, 1 unit per step (`--c1: 1u`, `--c2: 2u`); plates,
  panels, stages and the big sign use `.spr-clip-lg` stride (`2u / 4u`).
- An outline is an outer layer, not a border: the edge colour, clipped to the
  same staircase, with `padding: var(--px)` around a clipped face. A border
  would be sliced open at every step.
- Depth is a one-unit bevel as two inset shadows on the face:
  `inset 0 var(--px) 0 0 <hi>, inset 0 calc(-1 * var(--px)) 0 0 <lo>`.
  Zero blur, always.
- Signs and panels carry one extra unit of edge at the bottom: the shade.
- Pressed: bevel removed, content shifts down one unit; the outline stays.
- Decorative art is inline SVG of integer rects with
  `shape-rendering: crispEdges`, on 16-cell and 8-cell grids.
- Focus is `2px solid var(--focus)`, offset 2px, always on an unclipped
  wrapper - a clip-path would cut the ring away.

## Components

Biscuit button (sm / default / lg / icon / alt; rest, hover, pressed,
disabled), painted sign (with tendrils; `--big`), panel (sheet, title, rows
that swap sprites with their toggle, docked close), toggle, checkbox, seed-dot
radio and pagination, segment bar, horizontal and vertical sliders with
stepper buttons, tooltip (pinned or on hover/focus, with a stepped tail that
is a sibling of the clipped shell), field, D-pad, swatch packet, pixel
sprites. Check and radio labels inherit the ink of the surface they sit on.

## Motion

Toy motion, `steps()` only - nothing eases, fades or blurs.

- Press: instant, one-unit drop.
- Toggle knob: hops across in two steps (`transform var(--t-hop) steps(2)`).
- Tendrils: one unit left for one hold, one unit right for one hold, written
  as explicit keyframe holds (`steps(1)`, cycle of two holds). The right
  tendril runs one hold behind the left. `alternate` is not used: a one-step
  timing played in reverse never leaves its first keyframe.
- `prefers-reduced-motion`: the sway stops and the knob jumps; state changes
  stay instant.

## Screen: furrow field (`js/furrow.js`)

Optional WebGL2 surface. The board resolves into 12px (4u) cells in mown
stripes of `--ground` / `--ground-inset` (4 cells wide), with tufts (4.5% of
cells) flicking between `--accent` and `--accent-lo` on an eight-tick cycle.
Under the pointer, rings of cells lift in a Manhattan-distance pixel diamond,
3 cells apart, moving outward one whole cell per tick (8 ticks per second),
reaching up to 10 cells; the pointer cell is `--glint`. The pointer is followed
on a spring (k 58 / d 9), then snapped to a whole cell.

Each cell picks one of five token colours and never blends two, so the
no-gradient rule holds by construction. It redraws only when a whole step
changes, reads its colours from the live tokens (re-read on theme change),
stops off screen, draws one settled frame under reduced motion, and is
transparent until its first frame; the CSS stripes underneath are the complete
fallback. It belongs in empty states and title frames, never behind text or
controls.

## Contrast floor (measured, day / night)

- `--ink` on `--piece`: 5.0 / 5.9. On `--piece-hi`: 6.0 / 7.3.
- `--ink-soft` on `--piece-hi`: 4.6 / 4.9 - sheet face only.
- `--ground-ink` on `--ground`: 6.1 / 13.0. On `--ground-inset`: 5.0 / 14.1.
- `--glint` on `--alt`: 7.0 / 4.9.
- `--glint` on `--accent`: 2.0 / 3.7 - large display only (sign text, 20px
  bold and up). Small text never sits on green.
- `--alt` and `--focus` on `--ground`: 4.1 / 3.2 (non-text, 3:1 floor).
- `--disabled-ink` on `--disabled`: 2.3 / 2.7 - deliberately faint.

## Refusals

- No `border-radius`, no smooth curves.
- No gradients, no blur, no shadow with any blur radius.
- No eased motion; `steps()` only.
- No half units or one-off sizes; no raw hex outside the token block.
- No `--piece-edge` as small text; no small glint text on the accent.
- No inverting a piece for night: the ground goes dark, the piece is lamplit.
- No pixel face at `rem` or in-between sizes, and none for running text.
- No furrow field behind text or controls.
