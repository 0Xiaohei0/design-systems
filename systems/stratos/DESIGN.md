# STRATOS - design spec

A signal-overlay kit: every element is a self-contained instrument readout that
could be composited over footage and still hold. Flat graphic marks in one ink
and one signal hue - no glow, no blur, no gradient fades, no radius, no shadow,
no 3D.

Status: Exploration, documented to the repository standard. Mode: Read
(catalog). This folder is the whole system.

## Thesis

Two things to hold on to:

1. **There is exactly one hue, and it means live.** `--signal` marks what is
   active, selected, focused or alarming - never what is merely decorative. The
   hazard stripe and the wordmark square are the only standing exceptions, and
   both are rationed.
2. **Every mark is flat.** A 1px line, a solid block, a square corner. A glow
   or a soft shadow assumes a known backdrop; over footage it turns into a grey
   smear. A readout either holds or flips.

## Tokens

Black glass is the authored default and sits on bare `:root`. Daylight glass is
a hand-authored second ground, reached by an OS light preference
(`:root:not([data-theme="dark"])` inside `prefers-color-scheme: light`) or by an
explicit `data-theme`, which wins in both directions.

| Token | Black glass | Daylight | Role |
|---|---|---|---|
| `--ground` | `#0b0b0b` | `#f4f2ee` | The glass itself; every mark is drawn on it |
| `--panel` | `#151515` | `#e8e5de` | Raised block and hover fill - the only lift |
| `--ink` | `#f4f2ee` | `#0b0b0b` | Primary ink: text, filled cells, solid chips, brackets |
| `--ink-dim` | `#9b9b9b` | `#595959` | Secondary ink; the dimmest text allowed |
| `--signal` | `#ff6a00` | `#b84300` | The one hue: live, selected, focused, alarming |
| `--hairline` | `rgba(244,242,238,.22)` | `rgba(11,11,11,.22)` | Ink at 22%: rules, outlines, leaders, schematic strokes |
| `--on-ink` | `#0b0b0b` | `#f4f2ee` | Text on a solid ink block |
| `--on-signal` | `#0b0b0b` | `#f4f2ee` | Text on a signal block |

The neutrals swap between grounds; the signal hue is **re-cut**, because
`#ff6a00` falls to about 2.6:1 on a light ground. That is also why
`--on-signal` flips polarity.

Contrast floor (black glass / daylight):

| Pair | Black glass | Daylight |
|---|---|---|
| `--ink` on `--ground` | 17.6:1 | 17.6:1 |
| `--ink` on `--panel` | 16.3:1 | 15.7:1 |
| `--ink-dim` on `--ground` | 7.1:1 | 6.3:1 |
| `--ink-dim` on `--panel` | 6.6:1 | 5.6:1 |
| `--signal` on `--ground` | 6.9:1 | 4.9:1 |
| `--signal` on `--panel` | 6.4:1 | 4.4:1 |
| `--on-signal` on `--signal` | 6.9:1 | 4.9:1 |
| `--on-ink` on `--ink` | 17.6:1 | 17.6:1 |

Signal text is held to 14px bold or larger on both grounds.

Layout: `--measure: 1240px`, `--gutter: 24px`, `--section-gap: 64px`;
breakpoints 720px (stack clusters) and 480px (tighten frame padding). Inside a
mark the steps are pixel-grid values - 3, 4, 6, 7, 8, 12, 14, 18 - because a
9px cell with a 3px gap is a 12px pitch and a 9px cross needs its stroke on
pixel 4.

Motion: `--t-blink: 1.4s` (with `steps(1, end)`), `--t-scan: 8s` (linear).

## Type voices

| Voice | Stack | Spec |
|---|---|---|
| Display | `--font-display`: "Helvetica Neue", Helvetica, Arial, sans-serif | 700-800, -0.02em. `.v-display-xl` clamp(56px, 9vw, 96px), `-lg` clamp(30px, 5vw, 44px), `-md` 24px / 700 |
| Readout | `--font-display` | 800, -0.02em, tabular, line-height 0.9. `--num-xl` clamp(64px, 9vw, 116px), `--num-lg` 56px, `--num-md` 44px |
| Input | `--font-mono`: ui-monospace stack | 12px, +0.04em, uppercase |
| Data | `--font-mono` | 11px, values and feed rows |
| Label | `--font-mono` | 10px uppercase, +0.08em |
| Micro | `--font-mono` | 9px uppercase, +0.02em, `--ink-dim`. The floor |

The display closes in and the mono opens up; that is the whole hierarchy.

## Naming grammar

- Labels: `UPPERCASE_UNDERSCORE` - underscores, never spaces. `SOURCE_TRACKING`,
  `BLOCK_PROCESS`, `LIVE_FEED`, `END_OF_TRANSMISSION`.
- Lockups: `WORD.DIGIT` or `ABBREV-NUMBER` - `UNIT.3`, `CH.40`, `ACTIVE.B`,
  `UI-12`, `REF - 10040`.
- Feed values: bare figures with a unit suffix - `42.08HZ`, `64PCT`, `118MS`.
- Chip prefixes: `> ` marks a live pointer, `+ ` marks an addable item.

## Motif vocabulary

- **Tag chip** - label on a block: ink, signal, outline, or ghost.
- **Hazard stripe** - -45deg repeating signal/ground strips, 8px each, hard
  stops; 10px or 6px tall. Marks the extent of a block.
- **Segmented bar** - 9x14px cells with a 3px gap; filled = solid ink or signal.
- **Big numeric readout** - bare 2-5 digit numerals in heavy display.
- **Corner brackets** - four 12px, 1px corner marks framing a block; end-cap
  ticks on rules.
- **Crosses and markers** - 9px registration crosses, 8px squares, solid
  triangles as pointers.
- **Schematic placeholder** - hairline rect crossed with an X, 8px signal pip in
  a corner, mono caption beneath.
- **Feed row** - marker, label, dotted leader, value.

## Components and states

- **Status chip** - ACTIVE is signal with a blinking dot, READY is ink,
  INACTIVE is ghost.
- **Button, bracket** - `[ LABEL ]`; hover adds a `--panel` fill and an ink
  edge (the edge is reserved at rest, so the flip is layout-stable).
- **Button, solid** - ink block, `--on-ink` label; hover flips the block to
  signal and the label to `--on-signal`.
- **Press** - every button moves 1px down on `:active`.
- **Toggle pair** - checked = filled signal tick + ink text; unchecked =
  hairline tick + dim text. Focus rings the tick.
- **Feed / list row** - hover is a flat `--panel` fill; `.is-hot` pins it.
- **Input** - underlined mono field; focus turns the underline ink, caret is
  signal. Disabled is dim ink with a dashed underline.
- **Disabled buttons** - dim ink, 1px dashed hairline, no fill.
- **Focus** - `outline: 2px solid var(--signal); outline-offset: 2px`.

## Motion

Instruments, not decoration. Two authored moments: the `--t-blink` stepped blink
on live dots and the caret, and one flat scan column that crosses a hero frame
in the first 32% of each `--t-scan` cycle. Every other state change is an
instant flip - there is no transition and no easing curve in the kit.
`prefers-reduced-motion` stops the blink and removes the scan.

## Screen (optional)

`js/interference.js` - interference contours. Two slow emitters ring outward;
their interference is drawn as hairline contours, with a registration cross on
each emitter. The pointer is a third emitter: inside a bracketed reach the field
is read out as segmented-bar cells (signal where it peaks, outline where it does
not). Colours are read from `--ground`, `--ink`, `--signal` and `--hairline` at
runtime and re-read on every theme change; the shader can emit nothing but
those. Visibility-gated, transparent until the first frame, one settled frame
under reduced motion. The static fallback is two sets of hard-stop hairline
rings. It belongs in an empty hero frame or schematic slot, never behind
readouts or body text.

## Do / Don't

- Do spend the signal hue on live things only.
- Do keep every mark flat: 1px lines, solid blocks, square corners.
- Do keep text at `--ink-dim` or brighter; there is no darker grey.
- Do keep the naming grammar everywhere, specimen data included.
- Do change one property per state, and flip it instantly.
- Do check both grounds; daylight is hand-authored, not derived.
- Don't add a second hue. With two, neither means live.
- Don't add glow, blur, shadow, radius or a gradient fade. The hazard stripe's
  hard-stop strips are the only gradient.
- Don't set signal text below 14px bold, on either ground.
- Don't ease a state change or animate for flavour.
- Don't name a token after its hue - on daylight the signal is a different cut
  and the ink is black.
- Don't run the interference contours behind readouts or text.
