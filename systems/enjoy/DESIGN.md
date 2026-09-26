# ENJOY - design spec

Personal computing as a warm hobby: the whole UI is a lovingly customised retro
desktop, where every element is a window or a desk object drawn with a chunky
ink outline over a sunny ground with big lazy waves. One mono typeface does
everything and scale does the work; depth is a small hard offset shadow, never
a blur. Exactly one saturated field per screen.

Status: Documented 2026-09-26. This folder is the whole system; tokens and
components live in `css/enjoy-core.css`.

## Thesis

Two things to hold on to:

1. **Depth is a hard offset, never a blur.** 3px for a window, 2px for a
   control. Hover lifts a control 1px onto a 3px shadow; press sinks it 2px onto
   its own shadow, which disappears. The shadow is a promise about where the
   object lands.
2. **One saturated field per screen.** `--feature` is spent on one content pane.
   Everything else is soft tint on warm surface, so that one pane reads as the
   point of the screen.

## Tokens

Light is the default on bare `:root`. Dark applies under
`prefers-color-scheme: dark` unless the page sets `data-theme="light"`, and
`data-theme="dark"` forces it. The catalog's menu bar has a toggle.

| Token | Light | Dark | Role |
|---|---|---|---|
| `--ground` | `#f2ecdc` | `#24211c` | The desk every window sits on |
| `--surface` | `#faf6ea` | `#2e2a24` | Window, panel and control fill |
| `--ink` | `#22201c` | `#f0e8d6` | Every outline, glyph and letter |
| `--ink-dim` | ink at 0.72 | ink at 0.72 | Secondary text |
| `--ink-off` | ink at 0.5 | ink at 0.5 | Disabled labels only |
| `--ink-faint` | ink at 0.35 | ink at 0.35 | Rails, dotted row rules |
| `--tint` | `#bcdfe1` | `#2f5a5d` | Soft fill: wallpaper, meters, active rows, selection |
| `--tint-2` | `#f2cdaa` | `#6e4a31` | Second soft fill: markers, knobs, notes |
| `--feature` | `#2b7bc7` | `#2566a6` | THE one saturated field, one content pane per screen |
| `--on-feature` | `#faf6ea` | `#faf6ea` | Text on the feature field; pinned in both themes |
| `--live` | `#d0472e` | `#ec6a48` | Tiny live-state dots only |
| `--shadow-ink` | `#22201c` | `#0b0a08` | What every hard shadow is cut from |
| `--shadow-win` | `3px 3px 0 rgba(34,32,28,.9)` | `3px 3px 0 rgba(11,10,8,.9)` | Window depth |
| `--shadow-ctl` | `2px 2px 0 var(--shadow-ink)` | same | Control depth |
| `--shadow-lift` | `3px 3px 0 var(--shadow-ink)` | same | Hovered control |

Form: `--line: 2px` (the one outline weight), `--r-win: 10px`, `--r-ctl: 8px`,
`--r-knob: 6px`, `--r-pill: 999px`.

Space: `--sp-1` to `--sp-8` = 4, 6, 8, 10, 14, 16, 22, 34px. Window padding is
`--sp-6`; windows on the desk are `--sp-8` apart. `--measure: 1140px`,
`--prose: 62ch`. Breakpoints at 1020, 760 and 420px.

Motion: `--t-press: 80ms`, `--ease: ease-out`, `--t-blink: 1s` with
`steps(1, end)`.

The dark theme is the same desk after dark under one warm lamp: brown-charcoal
ground, cream ink, and the soft fills pulled down to deep teal and terracotta so
that cream text sits on them at 6:1 or better. It is hand-authored, not
derived by inversion.

### Contrast floor

| Pair | Light | Dark |
|---|---|---|
| `--ink` on `--ground` | 13.8:1 | 13.2:1 |
| `--ink` on `--surface` | 15.1:1 | 11.7:1 |
| `--ink-dim` on `--surface` | 6.2:1 | 6.8:1 |
| `--ink` on `--tint` / `--tint-2` | 11.5 / 10.9:1 | 6.3 / 6.4:1 |
| `--on-feature` on `--feature` | 4.1:1 | 5.5:1 |

`--on-feature` on `--feature` passes for large text only, so nothing on the
feature field is set below 24px.

## The one-typeface rule

Everything is mono: `ui-monospace, "SF Mono", Menlo, Consolas, monospace`, the
platform's own face, nothing downloaded. There is no second face; hierarchy
comes from size, weight, and case.

| Token | Size | Leading | Use |
|---|---|---|---|
| `--fs-readout` | `clamp(38px, 5vw, 52px)` | 1.1 | The desk numeral; the page `h1` |
| `--fs-display` | 28px | 1.6 | Feature-pane lines (floored at 24px), section headings |
| `--fs-display-s` | 22px | 1.3 | Secondary display line |
| `--fs-ui` | 14px | 1.55 | Emphasised body, ledes, primary info line |
| `--fs-body` | 13px | 1.55 | Default body, buttons, rows, fields |
| `--fs-title` | 12px | 1.55 | Window titles, menu words, icon labels, tooltips |
| `--fs-label` | 11px | 1.55 | Meter labels, state tags, table headers |

Case: lowercase for actions ("save", "@handle"); Title Case for things (icon
labels, item titles); never all-caps.

## Window anatomy

1. Frame: `--line` ink outline, `--r-win` radius, `--surface` fill,
   `--shadow-win`.
2. Title bar: separated from the body by a `--line` ink rule; three small
   outlined circles (traffic dots) on the left; a centred 12px title in the path
   voice, e.g. `~/any/window`.
3. Body: 13-14px mono on the surface, `--sp-6` padding.
4. Inverse chrome (`.window--inverse`): the frame and title bar take `--ink`,
   the dots and title take `--surface`. It announces the feature pane, so it
   appears at most once per screen.

## Motifs

- **Window** - the master container; everything on the desk is one.
- **Menu bar** - a slim window with no title bar, sticky at the top: the mark,
  menu words, and one control on the right.
- **Wave wallpaper** - 2-3 huge slow shapes in `--tint`, flat, fixed to the
  viewport, painted through `currentColor` so they retheme.
- **Readout** - one big numeral at `--fs-readout` with a colon that ticks at
  `--t-blink`, and a quiet `--ink-dim` line beneath.
- **Pill meter** - a 3ch lowercase label and an outlined pill track, fill in
  `--tint` or `--tint-2`.
- **Desktop icon** - a 46px outlined line glyph (computer, folder, ear, jar) with
  a Title Case label beneath.

## Component states

- **Button** (outlined rounded rect, lowercase): rest `--shadow-ctl`; hover
  lifts 1px onto `--shadow-lift`; press translates 2px onto the shadow's corner
  and removes it; disabled is a dashed outline, `--ink-off`, no shadow.
- **Chip** - pill button, same states.
- **Icon button** - 36px round, same states.
- **Field** - outlined, `--r-ctl`; placeholder in `--ink-dim`; disabled dashed.
- **Toggle** - outlined pill, square-ish `--r-knob` knob; on fills the track
  `--tint`; disabled dashed.
- **Tooltip** - ink bubble, surface text, square caret; appears on hover or
  focus within its anchor.
- **Side list row** - hover fills `--ground`; active fills `--tint`; a
  `--live` dot may sit at the row's end.
- **Transport** - prev / play-pause / next icon buttons, a 2px rail in
  `--ink-faint` with an ink done-line and a `--tint-2` knob, a mono time, and a
  small level meter.
- **Tray item** - a tinted thumb square, a clipping title, glyph actions.
- **Info card** - a small window of stacked lines (`--fs-ui` primary,
  `--fs-title` secondary).
- **Desktop icon** - hover tints the label; press inverts it.
- **Focus** - every interactive element: 2px solid `--ink` outline, offset 2px.

## Motion

Cozy and tiny. Controls lift and sink in `--t-press` (80ms) on `--ease`; the
readout's colon ticks at 1s steps. Nothing else animates. Under
`prefers-reduced-motion` the tick stops and transitions are removed.

## Screen: the wallpaper tide (`js/tide.js`)

An optional WebGL2 treatment: the wave wallpaper, alive. Two lazy waves drift,
the front one wears the 2px ink outline, and an outlined `--tint-2` buoy with a
hard 3px shadow rides it. The pointer leans the tide toward itself (on a
spring, k 40 / d 7) and the buoy follows along the crest.

It is built so it cannot draw a gradient: every region is a flat token colour
(`--ground`, half-tint, `--tint`, `--tint-2`, `--ink`, `--shadow-ink`), and the
only in-between pixels are one-pixel antialiased edges.

| Uniform | Value | Does |
|---|---|---|
| `uDrift` | 0.12 | Wave speed |
| `uSwell` | 0.6 | How far the crest leans toward the pointer's height |
| `uReach` | 0.18 | Width of the lean, in stage widths |
| `uBuoy` | 14px | Buoy radius |
| `uLine` | 2px | Outline weight, matching `--line` |
| `uShadow` | 3px | Buoy shadow offset, matching `--shadow-win` |
| `uGround` ... `uShade` | tokens | Read from CSS at runtime, re-read on theme change |

Contract: enhancement only (a static SVG tide sits under the canvas and is the
complete design; the canvas is transparent until its first frame); colours
from tokens; stops rendering off screen (IntersectionObserver); one settled
frame, identical to the SVG, under `prefers-reduced-motion`.

Where it belongs: an empty frame, a hero behind a readout. Not behind body
text, and never on the same screen as a feature pane.

## Refusals

- **No blurred shadow.** Every shadow is a hard offset, 2-3px, zero blur.
- **No gradient**, anywhere - the shader included. Flat fills only.
- **No hairline and no second border weight.** Every outline is `--line` ink.
- **No second typeface, and no all-caps.**
- **`--feature` is never chrome, a button or an accent**, appears once per
  screen, and carries no text below 24px.
- **`--live` is a dot**, never a fill or a text colour.
- **No token named for a hue or a use case.** `--tint` is the soft fill in both
  themes, even though it is aqua in one and deep teal in the other.
- Never use the em dash character; use "-".
