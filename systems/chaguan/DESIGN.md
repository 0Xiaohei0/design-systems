# CHAGUAN (茶馆) - design system spec

Plain, task-first interface dressed in literati ink-painting clothes. Brush
display type, solid-ink still lifes over a flat disc, and a vermilion seal set
the mood; tiles, pills, rows and tabs stay instantly scannable. Legibility on
the working surface always beats decoration.

Two things to hold on to:

1. **The decoration never enters the working surface.** Brush type and ink art
   live in posters and empty states. Anything a thumb operates is UI sans with
   a 2px line icon.
2. **The seal is the only hot colour, and it is punctuation.** At most two per
   surface; its only other job is the live count badge.

## Tokens

All tokens live in `css/chaguan-core.css`. Light is "daylight" (cream paper on
a caramel mount); dark is "lamplight" (brown-silk paper on a near-black mount,
pale ink). Dark is reachable by OS preference or by the catalog's toggle, and
an explicit `data-theme` wins in both directions.

| Token | Light | Dark | Role |
|---|---|---|---|
| `--mount` | `#b08d63` | `#17110c` | Page ground everything is pinned to |
| `--paper` | `#f0e8d3` | `#262019` | Posters, panels, the default stage |
| `--card` | `#e8ddc4` | `#30281f` | Recessed fills: tiles, fields, chips at rest |
| `--sheet` | `#fbf8f0` | `#3a3026` | Raised sheets: lists, notice bar, tab bar |
| `--ink` | `#2a2620` | `#efe6d2` | Text, brush art, display type |
| `--primary` | `#4a3421` | `#d8b98a` | The deep fill: buttons, selected states, captions |
| `--primary-press` | `#38271a` | `#c4a372` | Primary fill while held |
| `--on-primary` | `#f0e8d3` | `#241a10` | Text and icons on a primary fill |
| `--disc` | `#c9a35f` | `#7d6234` | The disc behind art; never carries text |
| `--seal` | `#b5442c` | `#b84a31` | Seals and live badges |
| `--on-seal` | `#fbf8f0` | `#fbf8f0` | The mark inside a seal or badge |
| `--alt-ground` | `#5c6b46` | `#3f4a33` | The alternate stage ground |
| `--alt-paper` | `#edeeda` | `#2a2f22` | `--paper` inside the alternate ground |
| `--alt-card` | `#e2e3c8` | `#333a2a` | `--card` inside the alternate ground |
| `--alt-sheet` | `#f6f4e6` | `#3c4433` | `--sheet` inside the alternate ground |
| `--on-alt` | `#f6f4e6` | `#eef0dc` | Type set straight on the alternate ground |
| `--frame` | `#241c14` | `#0b0806` | Bezel of a composed column |

Derived with `color-mix`, so they follow the live theme:

| Token | Value | Role |
|---|---|---|
| `--stage` | `var(--paper)` | Ground inside a frame; `.cg-alt` points it at `--alt-ground` |
| `--muted` | ink 72% | Secondary text |
| `--ink-faint` | ink 34% | Ink art in an empty state |
| `--primary-soft` | primary 80% | Idle tabs, placeholders, small captions |
| `--primary-line` | primary 40% | Idle outlines: toggle track, table heads |
| `--primary-wash` | primary 12% | Press wash under outlined controls |
| `--rule` | primary 14% | Hairline between rows |
| `--disc-wash` | disc 36% | A washed disc |

Shape: `--radius-seal 2px`, `--radius-block 14px`, `--radius-stage 20px`,
`--radius-frame 28px`, `--radius-pill 999px`; the tab bar uses 18px on its top
corners. Elevation: `--shadow-frame` (a composed column on the mount) and
`--shadow-float` (the action bar). Everything else is flat. Motion:
`--t-press 100ms`, `--ease ease`, `--t-marquee 20s`.

### Why the names are roles

After dark the deep fill and its text trade places: `--primary` becomes a pale
tan carrying dark text, the disc becomes a dim moon behind pale ink. A token
named for its daylight hue ("coffee", "white", "olive") would be a lie in the
other theme.

### Contrast (measured)

| Pair | Light | Dark |
|---|---|---|
| `--ink` on `--paper` | 12.3 | 13.0 |
| `--ink` on `--mount` | 4.9 | 15.1 |
| `--primary` on `--mount` | 3.8 (large text only) | 10.0 |
| `--primary` on `--paper` / `--card` / `--sheet` | 9.5 / 8.6 / 11.0 | 8.6 / 7.7 / 6.9 |
| `--on-primary` on `--primary` | 9.5 | 9.1 |
| `--muted` on `--paper` / `--card` | 5.4 / 5.1 | 7.4 / 6.8 |
| `--on-seal` on `--seal` | 5.2 | 4.9 |
| `--on-alt` on `--alt-ground` | 5.2 | 8.1 |

- Small text on the mount is always `--ink`. `--primary` on the light mount is
  for large titles only.
- Small text never sits in `--disc` or `--seal`.

## Type voices

1. **Brush display** - `--font-brush: "Ma Shan Zheng", "Kaiti SC", "STKaiti",
   cursive`, weight 400. Poster titles (2.35rem vertical, 2.1rem horizontal),
   banner mark 1.7rem, empty-state line 1.25rem, poster aside 1.05rem. The face
   carries both CJK and Latin; vertical setting uses `writing-mode:
   vertical-rl`. Never below 1rem, never task-critical.
2. **Tracked caption** - `--font-caption: Georgia, "Times New Roman", serif`,
   10px uppercase at `letter-spacing: 0.3em`; 8-9px at 0.18-0.25em under tile
   and banner labels and inside buttons. Labels a thing; never carries it.
3. **UI sans** - `--font-ui`, the platform sans with PingFang SC / Noto Sans SC
   for CJK. Body 15px / 1.6; labels 13-14px / 600; sub-lines 11px; tab labels
   and badges 10px. Everything that is operated or counted.

## Motif vocabulary

- **Ink still lifes** - inline SVG, solid `--ink` fills, brushy outlines,
  tapered ends, small white gaps (`fill-rule: evenodd` slits). Six subjects:
  teapot, bowl with steam, plum branch, bamboo, flask and cup, bowl with
  sticks. 60-150px. Draw new subjects in the same hand.
- **Disc** - a flat `--disc` circle behind art or a title: full, washed
  (`--disc-wash`), halved, or pushed past an edge. Never carries text.
- **Seal** - a `--seal` square with a 2px corner: a carved border
  (`.is-blank`), a single glyph, or a two-letter monogram (`.is-duo`). At most
  two per surface.
- **Poster** - a `--paper` block: brush title, disc and ink art, a caption
  between thin rules, one seal. `.is-flush` makes it the top of the stage.
- **Caption rule** - a tracked caption between two hairlines.
- **Frame** - a 312px column with a 9px `--frame` bezel around a 20px-radius
  stage; the width every component is drawn for.

## Components and states

- **Primary button** (`.cg-btn`) - `--primary` pill, `--on-primary` text;
  press darkens to `--primary-press` and drops 1px; `disabled` at 45%.
- **Secondary button** (`.cg-btn-ghost`) - 2px `--primary` outline; press adds
  `--primary-wash` and the same 1px drop.
- **Chip** (`.cg-chip`) - `--card` pill; selected (`.is-on`) fills with
  `--primary`.
- **Tile** (`.cg-tile`) - 14px `--card` block, line icon, label and caption;
  pressed fills with `--primary`. Badge (`.cg-badge`) is a `--seal` pill.
- **Notice bar** (`.cg-notice`) - `--sheet` pill, bell icon, a line that
  scrolls on a 20s loop and pauses on hover and focus.
- **Row** (`.cg-row` in a `.cg-sheet`) - name, sub-line, one value
  (`.cg-row-value`), one round action (`.cg-round`). With a quantity the action
  becomes a stepper: outlined minus (`.is-outline`, disabled at zero), count,
  filled plus.
- **Search** (`.cg-search`) - `--card` pill with a real input; focus rings the
  pill.
- **Toggle** (`.cg-toggle`) - a real checkbox: `--card` track with a
  `--primary-line` edge; on fills with `--primary`.
- **Tab bar** (`.cg-tabbar`) - `--sheet`, four tabs, line icons and 10px
  labels; idle `--primary-soft`, active `--primary` with a dot beneath.
  `.is-floating` rounds all four corners.
- **Banner** (`.cg-banner`) - `--primary` block with a faint 115° hairline
  weave, a brush mark, copy, and an inverted ghost button.
- **Summary** (`.cg-summary`) - a sheet with a title left and one stat right.
- **Action bar** (`.cg-actionbar`) - the one floating control: `--primary`
  pill, `--shadow-float`, badge, sum, and an inverted button. One per surface.
- **Empty state** (`.cg-empty`) - ink art at `--ink-faint`, a brush line, a
  caption, one quiet action.
- **Focus** - `:focus-visible` is a 2px `--primary` outline, offset 2px; on
  primary surfaces it flips to `--on-primary`.

There is no hover state: the system is drawn for touch, and the press is the
feedback.

## The alternate ground

One class, `.cg-alt`, on a container swaps `--stage`, `--paper`, `--card` and
`--sheet` for their `--alt-*` values; type set straight on the ground takes
`--on-alt`. Everything else keeps the same grammar. Use it for at most one
surface in a composition - it is a variant, not a second theme.

## Motion

Restrained. A press darkens and drops 1px over 100ms `ease`; the notice line
scrolls on a slow linear loop. Nothing else moves. `prefers-reduced-motion`
removes the transitions and stops the scroll.

## Screen: ink wash (optional)

`js/inkwash.js` is a WebGL2 surface treatment: three ridges of ink wash drift
in front of the disc on absorbent paper, and the pointer is a loaded brush that
blooms ink into the fibres with a frayed rim and a tidemark. It reads
`--paper`, `--disc` and `--ink` at runtime and ends on
`mix(mix(uPaper, uDisc, disc), uInk, ink)`, so it cannot emit a colour outside
the palette. It is enhancement only (transparent until its first frame, with a
CSS fallback built from the same tokens), stops off screen, and renders one
settled frame under reduced motion. It belongs behind a poster or an empty
state - never behind a list, a field, or running text.

## Refusals

- **Don't** use brush illustrations as icons in rows, tiles or tabs.
- **Don't** put text on the disc.
- **Don't** use more than two seals on a surface.
- **Don't** set values, counts or states in brush or caption.
- **Don't** add borders to surfaces or a third shadow; blocks separate by fill.
- **Don't** use the alternate ground on more than one surface of a composition.
- **Don't** run the ink wash behind working content.
- **Don't** name a token for a hue or a first use.
- Legibility beats decoration - if a motif crowds a control, the motif loses.
