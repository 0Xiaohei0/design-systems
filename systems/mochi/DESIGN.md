# MOCHI - soft neumorphic kawaii widget system

The phone as a plush desk toy: every widget is a soft pillow extruded from one
warm greige material, and depth comes from light, never from lines. Muted pastel
plates, big friendly rounded numbers, and bilingual labels (Chinese first,
English nearby) make it read like a lovingly themed home screen.

Status: Exploration. Direction pinned by the client from a reference home screen,
2026-08-03.

## Tokens

| Token | Value | Role |
|---|---|---|
| `--ground` | `#ece9e2` | Page AND widget material - the same warm greige |
| `--plate` | `#f7f5f0` | Inner plates: clock-digit tiles, list wells, inputs |
| `--ink` | `#5d574e` | All body text; soft warm dark, never pure black |
| `--ink-soft` | `#6b665c` | Secondary text, captions, placeholders (derived; 4.7:1 on ground) |
| `--blue` | `#93a9cb` | Pastel fill |
| `--rose` | `#d698a0` | Pastel fill; page-dot active, blush |
| `--sage` | `#8fb5a4` | Pastel fill; toggle-on |
| `--peach` | `#e5c39c` | Pastel fill |
| `--blue-deep` | `#6d87b1` | Deepened blue - the only blue that carries white text |
| `--rose-deep` | `#bd747f` | Deepened rose - white-text plate (music card, gauges) |
| `--sage-deep` | `#679181` | Deepened sage - white-text plate |
| `--blue-lt` `--rose-lt` `--sage-lt` `--peach-lt` | `#c9d4e6` `#eccfd3` `#cfdfd7` `#f2dfc8` | Light tints - the pastels that carry small `--ink` text |
| `--deep` | `#3e5c68` | Deep teal: analog clock face, rare dark plates, focus ring |
| `--gold` | `#d4a94e` | Clock hour dots, tiny accents only |
| `--white` | `#fbfaf7` | Text on `--deep` and deepened pastels; hands, knobs |

Note: the client's reference deepened pastels (`#c9848f` `#7f97bd` `#7aa392`)
measured 2.7-2.9:1 under white text. Per the pinned fix rule - deepen the plate,
never shrink the text - they were deepened one more step to the values above
(3.4-3.5:1).

Radii: `--r-sm: 18px`, `--r-md: 22px`, `--r-lg: 28px`; the phone shell uses 44px.
Corners are always large squircles, 18-28px on components.

Type: `ui-rounded, "SF Pro Rounded", "Hiragino Maru Gothic ProN", "Yuanti SC",
"PingFang SC", sans-serif`. Big friendly numbers (48-72px, tabular), 15-17px
body, 12-13px labels. Bilingual by default: Chinese label with English nearby.

## The material rule (the signature)

One material, two states. Verbatim recipes - do not restyle:

```css
/* raised (rest) */
box-shadow: -6px -6px 14px rgba(255,255,255,0.85), 7px 7px 16px rgba(166,158,144,0.42);

/* pressed / inset (active) */
box-shadow: inset -4px -4px 10px rgba(255,255,255,0.8), inset 5px 5px 12px rgba(166,158,144,0.4);
```

- Every interactive element is raised at rest and pressed (inset) when active.
- Raised and pressed surfaces are ALWAYS `--ground` - the same color as the
  page. If the fill differs, it is a plate, not the material.
- Pastel plates sit INSIDE raised widgets as flat fills with soft-blurred,
  small shadows: `box-shadow: 3px 3px 8px rgba(166,158,144,0.28)`.
- Light source is fixed top-left. Never flip the shadow direction.

## Contrast rules (verified 2026-08-03)

- `--ink` on `--ground` / `--plate`: 5.9:1 / 6.6:1 - body text anywhere.
- `--ink-soft` on `--ground` / `--plate`: 4.7:1 / 5.2:1 - smallest allowed
  secondary text and placeholders.
- `--white` text ONLY on `--deep` (6.9:1), or on deepened pastels
  (`--*-deep`, 3.4-3.5:1) at large-bold sizes: >= 19px, or >= 14px bold.
- Never small white text on a light pastel.
- Small text on pastel plates uses `--ink` on the LIGHT tints (`--*-lt`,
  4.8-5.5:1). The saturated pastels (`--rose` etc.) are ~3:1 under ink -
  fills and decoration only, no small text.
- Disabled: flat material, 45% ink (exempt from contrast).

## Motif vocabulary

- **Widget** - raised squircle of ground material, padded, optionally holding
  pastel or plate fills. The only container.
- **Flip-clock** - two `--plate` tiles with huge digits and a soft center seam;
  a blinking colon dot pair between them; below, a date row
  ("07月25日 星期四") and a small pressed pill ("Wednesday").
- **Pill gauge** - tall vertical pill: pressed track, pastel liquid rising from
  the bottom in a deepened pastel, white bold label on the liquid
  ("100% 电量剩余").
- **Analog clock** - circular `--deep` face inside a raised squircle; `--gold`
  hour dots, `--white` hands, small center cap. Set to 10:08.
- **Ring gauge** - countdown ring in `--blue` on a soft track, rounded caps,
  center text "生日倒计时 / 0124 天".
- **Kawaii face plate** - wide `--sage-lt` plate with a ">u<" face: closed
  happy eyes, small mouth, two `--rose` blush ovals. Blush fades in on hover.
- **App squircle** - 56-64px raised squircle, pastel-filled, with a simple cute
  inline-SVG glyph (penguin, flower, camera, phone handset, chat bubbles) in
  2-3 muted colors, rounded strokes.
- **Music card** - `--rose-deep` plate with a music-note roundel and
  "网易云音乐 Netease Cloud" in white bold.
- **Page dots** - one `--rose` dot plus inactive greige dots.

## Components and states

- **Button** - raised at rest; pressed (inset) on `:active` / `.is-pressed`;
  disabled = flat (no shadow), 45% ink. Primary variant is a `--deep` plate
  with white text.
- **Toggle** - pressed pill track, raised `--white` knob; track fills `--sage`
  when on.
- **Slider** - pressed track, pastel fill from the left, raised round thumb.
- **List rows** - divider-free rows inside a widget; active row is a light
  pastel plate; chevrons are soft ink glyphs.
- **Chip** - small raised pill; selected = pressed with `--sage-lt` fill.
- **Tooltip** - tiny raised plate, small ink text.
- **Input** - pressed field, `--ink-soft` placeholder, focus shows the ring.
- **Focus** - `outline: 2px solid var(--deep); outline-offset: 3px` - the one
  permitted outline in the whole system.

## Motion

Soft and small, nothing else:

- Colon blinks at 1s `steps(1)`.
- Press transitions 120ms ease-out, on `box-shadow` (plus background where a
  fill changes).
- The kawaii blush fades in on hover (240ms).
- `prefers-reduced-motion`: colon stays lit, blush stays visible, transitions
  removed.

## Do / Don't

- DO mold everything from `--ground`; depth comes from light.
- DO keep labels bilingual: Chinese first, English nearby.
- DON'T use borders or outlines anywhere - ever - except the focus ring.
- DON'T use pure black or pure gray; every neutral is warm.
- DON'T use hard shadows; both shadow recipes are soft and offset.
- DON'T add a second dark plate color: `--deep` only, used sparingly.
- DON'T put small white text on any pastel, or small ink text on a saturated
  pastel - use the light tints.
