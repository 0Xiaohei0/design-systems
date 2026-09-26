# STRATOS - design spec

Movie-grade FUI signal-overlay kit: every element is a self-contained instrument
readout composited over black glass. Flat graphic marks in one ink and one hot
orange - no glow, no blur, no gradient fades, no radius, no 3D.

Status: Exploration. Mode: Read (catalog).

## Tokens

| Token        | Value                    | Role                                      |
|--------------|--------------------------|-------------------------------------------|
| `--void`     | `#0b0b0b`                | page ground (black glass)                 |
| `--panel`    | `#151515`                | raised block ground, hover highlight      |
| `--signal`   | `#f4f2ee`                | primary ink: text, filled cells, chips    |
| `--dim`      | `#9b9b9b`                | secondary ink; the darkest allowed text   |
| `--alert`    | `#ff6a00`                | THE orange; carries ~30% of the surface   |
| `--hairline` | `rgba(244,242,238,0.22)` | rules, cell outlines, schematic strokes   |

Contrast: `--signal` on `--void` ~17.9:1, `--dim` on `--void` ~7.1:1 (and ~6.6:1
on `--panel`), near-black on `--alert` ~6.9:1, on `--signal` ~16:1. Orange text
on black (~6.9:1) is reserved for 14px+ bold or larger.

## Type voices

| Voice   | Stack                                              | Spec                                   |
|---------|----------------------------------------------------|----------------------------------------|
| Display | "Helvetica Neue", Helvetica, Arial, sans-serif     | 700-800, tight (-0.02em), lockups and big numerals |
| Label   | ui-monospace stack                                 | 10px uppercase, tracked +0.08em        |
| Data    | ui-monospace stack                                 | 11px, values and feed rows             |
| Micro   | ui-monospace stack                                 | 9px, telemetry paragraphs, `--dim`     |

## Naming grammar

- Labels: `UPPERCASE_UNDERSCORE` - underscores, never spaces. `SOURCE_TRACKING`,
  `MOUNT_PROCESS`, `LIVE_FEED`, `END_OF_TRANSMISSION`.
- Lockups: `WORD.DIGIT` or `ABBREV-NUMBER` - `SAT.3`, `DB.40`, `ACTIVE.B`,
  `UI-12`, `RB - 10040`.
- Feed values: bare figures with unit suffix - `137.62MHZ`, `409KM`, `77449`.
- Chip prefixes: `> ` marks a live pointer, `+ ` marks an addable/aux item.

## Motif vocabulary

- **Tag chip** - label on a solid block: white/black, orange/black, or outlined.
- **Hazard stripe** - 45deg repeating alert/void strips; divider or attention bar.
- **Segmented bar** - discrete rectangular cells; filled = solid signal or alert.
- **Big numeric readout** - bare 2-5 digit numerals in heavy display, white or orange.
- **Corner brackets** - four 1px corner marks framing a block; end-cap ticks on rules.
- **Crosses and markers** - `+` registration crosses, small filled orange squares,
  solid triangles as pointers.
- **Schematic placeholder** - hairline rect crossed with an X diagonal, small
  orange square in a corner, mono caption beneath.
- **Feed row** - leading marker, label, dotted leader, value.

## Components and states

- **Status chip** - `ACTIVE` solid orange, `READY` solid white, `INACTIVE`
  outline + dim. Live variants carry a blinking dot.
- **Button, bracket** - `[ ENGAGE ]`: mono label between bracket glyphs; hover
  flips ink to orange; `:active` shifts 1px down.
- **Button, solid** - white block, black label; hover flips block to orange;
  `:active` shifts 1px down.
- **Toggle** - UPLOAD/DOWNLOAD paired ticks; checked = filled orange square +
  signal text, unchecked = outlined square + dim text.
- **Feed/list row** - hover highlight is a flat `--panel` fill.
- **Input** - underlined mono field, blinking block caret in `--alert`.
- **Disabled** - dim ink + 1px dashed hairline, no fill.

## Motion

Instruments, not decoration. One authored moment: a 1.4s `steps()` blink on
live-status dots, plus a flat scan highlight sweeping the hero cluster once per
~8s. Every other state change is an instant flip (`steps(1)` or <=120ms).
`prefers-reduced-motion` kills both the blink and the scan.

## Do / Don't

- Do use exactly one hue. Orange means live or alert - never decoration on an
  idle element.
- Do keep every mark flat: no glow, no blur, no border-radius, no gradient
  fades, no shadow. The hazard stripe's repeating-linear-gradient is hard-stop
  solid strips, not a fade.
- Do keep text at `--dim` or brighter; never a darker gray.
- Do keep the naming grammar everywhere, including demo data.
- Don't set orange text on black below 14px bold.
- Don't round, soften, or animate for flavor; a readout either holds or flips.
