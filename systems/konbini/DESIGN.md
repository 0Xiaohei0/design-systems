# KONBINI - design spec

A travel-poster series about quiet everyday places, drawn in pixels. Every
surface is a poster: enormous margins, few elements, one lovingly detailed
pixel-art scene as the centerpiece, heavy white type floating in a winter sky,
cobalt captions resting on snow. Calm, cold air, soft nostalgia.

Status: exploration. Direction pinned by a client reference poster
("HOKKAIDO / Japan", pixel konbini scene, cobalt katakana on snow).

## Tokens

| Token | Value | Role |
|---|---|---|
| `--sky-deep` | `#5fb2dd` | top of the sky gradient |
| `--sky` | `#8ecbe9` | middle of the sky gradient |
| `--sky-pale` | `#c9e6f4` | horizon; distant haze |
| `--snow` | `#f4f8fa` | lower ground, the poster's paper |
| `--white` | `#ffffff` | display type on sky, snow caps, plates |
| `--cobalt` | `#2563eb` | ALL text on snow; katakana graphics; links |
| `--navy` | `#2b3a55` | pixel outlines, windows, dark details, hover text |
| `--sign` | `#f08c1e` | konbini sign-band orange; tiny warm accents only |
| `--ice` | `#a8cede` | distant silhouettes, pixel shadows, disabled |

## The pixel rule (the system's signature)

All illustration is pixel art on a fixed integer grid.

- Inline SVG, axis-aligned `<rect>` elements only; integer x/y/width/height.
- `shape-rendering="crispEdges"` on every illustration SVG.
- No curves, no strokes, no anti-aliasing, no path elements.
- Scaling happens in integer steps: CSS width is always a whole multiple of
  the viewBox grid (1x, 2x, 3x, 4x). Never fractional.
- Scene grid is 176x104; icons are 16x16.

## The one-gradient rule

Exactly one gradient exists in the system: the vertical sky,
`linear-gradient(180deg, --sky-deep 0%, --sky 55%, --sky-pale 100%)`.
It is always vertical and always a sky. Nothing else may grade: no gradient
text, no gradient buttons, no radial anything. Bands, plates, and shadows are
flat fills.

## Type voices

- **Display**: "Helvetica Neue", Helvetica, Arial, sans-serif; weight 700-800;
  tight tracking (-0.03em); WHITE when floating on sky; giant
  (clamp up to 8rem). Poster display on sky is a large-type-only voice
  (>= 32px bold); it never carries body copy.
- **Caption / body / footnote**: the same face in cobalt at small sizes.
  Captions are lowercase. Footnotes are ragged right, max 24ch, with a page
  number tucked in the corner.
- **CJK display**: giant katakana/kana set in cobalt as pure graphic shapes;
  weight 700; system CJK stack ("Hiragino Kaku Gothic ProN", "Hiragino Sans",
  "Yu Gothic", "Noto Sans JP").
- No monospace anywhere except pixel-art coordinates. This system is a poster,
  not a terminal.

## Motif vocabulary

- **Hero scene**: the pixel konbini "Seimart" (snow-capped roof, two AC units,
  orange sign band with white pixel-font store name, dark glass storefront
  with door and window posters, vending machine, traffic cone, white kei truck
  in the foreground, distant ice-blue buildings, power poles with sagging
  lines, birds on the wire, one drifting cloud).
- **Pixel icons** (16 grid): power pole, vending machine, traffic cone,
  AC unit, kei truck, snowflake, onigiri, hot drink can.
- **Caption row**: three short lowercase phrases spread across the full width.
- **Katakana block**: one or two giant cobalt kana columns/rows used as
  graphic texture.
- **Footnote**: small cobalt paragraph, max 24ch, page number in the corner.
- **Sign band**: white/orange/white fascia stripe with navy hairlines;
  used as a section divider.
- **Sky field**: the vertical gradient block that display type floats in.

## Components and states

- **Link**: cobalt, thin underline; hover = navy with 2px underline;
  focus-visible = 2px cobalt outline, 2px offset (global rule).
- **Button**: snow plate, cobalt text, 2px navy pixel-step border (edge
  box-shadows leaving notched corners), 4px ice pixel shadow. Primary: solid
  cobalt plate, white text. Hover shifts the plate up-left one 2px step and
  the shadow grows one step; active sits flat on the shadow; disabled is
  ice-colored with no shadow. State changes snap; nothing eases.
- **Chip**: tiny sign-band stripe (orange top/bottom rules on a white plate),
  cobalt lowercase text; selected = cobalt plate, white text; disabled = ice.
- **Pagination**: page numbers as poster folios, "28 / 32"; current cobalt,
  total navy; disabled arrows ice.
- **Input**: white field on snow, navy 2px bottom rule, cobalt caret and
  placeholder, navy value text; focus = cobalt rule; disabled = ice field.

## Motion

Almost none: posters do not move. The single authored moment lives in the
hero: the pixel birds on the power line hop/blink every few seconds with
steps() timing, and one pixel cloud drifts very slowly in integer steps.
`prefers-reduced-motion` freezes both. Component states snap with no
transitions.

## Do / don't

- Do keep margins enormous and elements few; one centerpiece per poster.
- Do snap everything visual to the pixel grid (2px steps in CSS).
- Don't draw curves, circles, or strokes in illustration; rects only.
- Don't use shadows except flat pixel-step offsets (no blur, ever).
- Don't put text on orange; the sign carries pixel-art lettering inside
  illustration only. Orange is decoration: sign stripes, cones, price marks.
- Don't set body text in ice; body text is cobalt or navy.
- Don't add gradients beyond the one sky.
- Don't animate anything except the hero birds and cloud.

## Contrast floor (verified)

- cobalt on snow ~4.8:1 (body ok); cobalt on white ~5.1:1 (ok).
- navy on snow ~10.8:1 (ok); white on cobalt ~5.1:1 (button text ok).
- white on sky-deep is poster display only: always >= 32px bold, never body.
- ice never carries text; orange never carries text.
