# CHAGUAN (茶馆) - design system spec

A neo-Chinese teahouse mini-app system: modern storefront task UI (order, pick up,
member) wearing literati ink-painting clothes. Brush calligraphy, solid-ink
illustrations, and a gold sun disc set the mood; tiles, bars, and tabs stay
instantly scannable - Operate legibility always beats decoration.

Status: exploration. Style homage to Lulu's mini-program design sharing sheet
(eight teahouse / dessert / tavern storefront screens on a caramel mount).

## Tokens

| Token | Value | Role |
|---|---|---|
| `--mount` | `#b08d63` | page ground, the caramel mount the screens pin to |
| `--paper` | `#f0e8d3` | hero poster cream, default screen ground |
| `--card` | `#e8ddc4` | service tile and field fill |
| `--white` | `#fbf8f0` | sheet cards, notice bars, tab bar |
| `--coffee` | `#4a3421` | deep brown blocks, primary buttons, tab bar accents |
| `--coffee-press` | `#38271a` | pressed state of coffee fills |
| `--ink` | `#2a2620` | brush art and CJK display text |
| `--sun` | `#c9a35f` | gold disc behind hero objects; 30-40% alpha washes allowed |
| `--seal` | `#b5442c` | vermilion seal stamps and tiny live badges only |
| `--olive` | `#5c6b46` | the one alternate theme ground, shown as a variant |

Derived, established by the first build: `--olive-paper #edeeda`, `--olive-card
#e2e3c8`, `--olive-white #f6f4e6` (light surfaces inside the olive variant),
`--frame #241c14` (phone frame), `--radius-tile 14px`, `--radius-frame 28px`.

### Contrast (measured)

- `--coffee` on `--paper` 9.5, on `--card` 8.6, on `--white` 11.0 - all strong.
- `--paper` on `--coffee` 9.5. `--ink` on `--paper` 12.3, on `--mount` 4.9.
- `--coffee` on `--mount` is 3.8: large text only (section titles). Small text
  on the mount is always `--ink`. Never white small text on the mount.
- On `--olive`: `--white` small text (5.4), `--paper` large text (4.7).
  `--ink` and `--coffee` are too dark for olive - do not put them on it except
  as art over a `--sun` disc.
- Small text never in `--sun` or `--seal`. `--seal` text only as large brush
  accents; white marks inside a seal are fine (5.2).

## Type voices

1. **Brush display** - `"Ma Shan Zheng", "Kaiti SC", "STKaiti", cursive`.
   Shop names and section titles, 2-3.5rem, `--ink` (or `--paper` on coffee /
   olive). Vertical when the poster calls for it (`writing-mode: vertical-rl`).
2. **Tracked Latin caption** - `Georgia, "Times New Roman", serif`, 10px,
   uppercase, `letter-spacing: 0.3em`. "WELCOME TO CHAGUAN" lines, flanked by
   thin rules. Never for task-critical text.
3. **UI sans** - `-apple-system, "PingFang SC", "Noto Sans SC", sans-serif`,
   13-15px. Tiles, lists, buttons, prices - everything the thumb reads.

Label things bilingually: CJK first, small Latin under or beside it.

## Motif vocabulary

- **Ink-brush illustrations** - inline SVG, solid `--ink` fills with brushy
  irregular outlines, tapered stroke ends, small white gaps (`fill-rule:
  evenodd` slits). Six canonical subjects: teapot, tea bowl with steam, plum
  branch, bamboo, wine bottle with cup, noodle bowl with chopsticks. 60-120px.
  These are the system's soul; draw new ones in the same hand.
- **Sun disc** - large `--sun` circle behind a brush illustration or title;
  may be halved or offset past an edge. The disc never carries text.
- **Seal stamp** - small `--seal` square, 2px radius, white negative
  CJK-suggestive mark. At most one or two per screen.
- **Hero poster** - `--paper` block: vertical or horizontal brush title, sun
  disc + ink art, tiny Latin caption between thin rules, one seal.
- **Service tile** - 14px-radius `--card` square, `--coffee` 2px line icon
  (teapot, scooter, bag, crown), CJK + Latin label. Pressed = `--coffee` fill
  with `--paper` icon and text. Badge = small `--seal` dot, white count.
- **Notice bar** - slim rounded `--white` bar, bell icon, slow-scrolling text.
- **Tab bar** - `--white`, 4 tabs, 2px line icons + tiny labels; active tab
  `--coffee` with a small dot beneath. Safe-area bottom padding.
- **Phone frame** - 28px-radius dark frame, simple status bar (time, signal /
  wifi / battery glyphs) so compositions read as mini-app screens.
- **VIP strip** - wide `--coffee` banner, brush "VIP", faint diagonal
  thin-line pattern, `--paper` text.

## Components and states

- **Primary button** - `--coffee` fill, `--paper` text; pressed darkens to
  `--coffee-press` and translates down 1px; disabled 45% opacity.
- **Secondary button** - 2px `--coffee` outline on paper/transparent; pressed
  gains a faint coffee wash and the same 1px translate.
- **Chips** - `--card` pill; selected = `--coffee` fill, `--paper` text.
- **List row** - `--white` sheet row: name + sub-line, price, round `--coffee`
  "+" add button. With quantity, the add button becomes a stepper.
- **Stepper** - outline "-", quantity, filled "+" (round, 24px).
- **Search field** - rounded `--card` fill, coffee line icon, real input.
- **Toggle** - `--card` track, `--white` thumb; on = `--coffee` track.
- **Empty state** - faint ink bowl (34% `--ink`), bilingual caption,
  secondary button.
- **Focus** - `:focus-visible` = 2px solid `--coffee` outline, offset 2px;
  on coffee surfaces the outline flips to `--paper`.

## Olive variant rule

One class (`.cg-olive`) on a container swaps the scheme: screen ground becomes
`--olive`, light surfaces become the olive-tinted derivatives, brush titles on
the ground flip to `--paper`, captions to `--white`. Ink art on olive sits on a
`--sun` disc (never bare - too dark on dark). Everything else - tiles, sheets,
tab bar, buttons - keeps the same grammar. Use it for at most one screen per
composition: it is the variant, not a second theme.

## Motion

Restrained. The notice bar text scrolls on a slow linear loop, pauses on hover
and focus; presses translate 1px with 100ms ease. Nothing else moves.
`prefers-reduced-motion` freezes the scroll entirely.

## Do / don't

- Do keep brush art in hero posters and empty states; **don't** use brush
  illustrations as icons inside task rows - task rows get 2px line icons.
- Do put the sun disc behind art or titles; **don't** put text on the disc.
- At most two seals per screen; a seal is punctuation, not a pattern.
- Do keep prices, counts, and states in UI sans; **don't** set task-critical
  text in the brush or caption voices.
- Operate legibility beats decoration - if a motif crowds a control, the
  motif loses.
