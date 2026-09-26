# SHIMBUN 新聞 - warm-paper editorial print system

A newspaper desk as an interface: warm paper ground, one vermilion spot color,
oversized tight headlines, hairline rules, and mono annotations. Type does the
talking - decoration is almost entirely rules, kickers, and one poster scrim.

Status: Derived from a shipped page (`recently-finished-anime-report`,
documented from its live CSS 2026-09-26). Direction: editorial print, not
neumorphism.

## Tokens

Light theme (default) / dark theme (`prefers-color-scheme: dark`):

| Token | Light | Dark | Role |
|---|---|---|---|
| `--bg` | `#f2f0ea` | `#0a0d12` | Page ground: warm paper gray |
| `--surface` | `#fbfaf6` | `#12171d` | Card ground, a half-step up from bg |
| `--surface-strong` | `#ffffff` | `#181e25` | Dialog ground, the brightest plate |
| `--ink` | `#111318` | `#f4f0e7` | All body text; near-black, never pure black in light |
| `--muted` | `#5e625f` | `#a7adaf` | Secondary text |
| `--line` | `#c9c6bd` | `#343b42` | Hairline: card borders, fine separators |
| `--line-strong` | `#111318` | `#e9e4d9` | Heavy rule (2px): masthead base, footer crown; mirrors ink |
| `--accent` | `#f04438` | `#ff6358` | Vermilion spot color: kickers, headline span, final tags |
| `--accent-2` | `#007f8c` | `#53c3ca` | Teal second accent: focus ring, watch-channel ink |
| `--badge` | `#dfdbcf` | `#252c33` | Tag plate |
| `--watch-bg` / `--watch-ink` | `#e8f2ef` / `#075c62` | `#153034` / `#8fdde1` | "Has Chinese stream" info block |
| `--scrim` | `rgba(9,11,15,.76)` | `rgba(0,0,0,.82)` | Dialog veil |
| `--shadow` | `0 18px 55px rgba(24,22,17,.14)` | `0 22px 70px rgba(0,0,0,.44)` | The one large shadow, dialogs only |

Radii: `--r-tag: 2px`, `--r-card: 4px`, `--r-dialog: 6px` (dialogs go
full-bleed square on mobile), `--r-pill: 999px`. Nothing bubbly - the system
caps roundness at 6px except pills.

Type: three stacks, each with a fixed job.

- `--font-cn: "Noto Sans SC", sans-serif` - Chinese body and headlines, 400-900.
- `--font-lat: "Archivo", "Noto Sans SC", sans-serif` - Latin display: giant
  numbers, English subtitles. Tight tracking is the signature.
- `--font-mono: "IBM Plex Mono", monospace` - every meta annotation: issue
  numbers, kickers, counts, ranks, tags, dates, button microcopy.

Scale: h1 `clamp(44px, 8vw, 104px)` / 900 / `letter-spacing: -.065em` /
`line-height: .92`, with the second line set in `--accent`. The masthead
counter is `--font-lat` 800 at `clamp(72px, 10vw, 144px)`,
`letter-spacing: -.08em`. Collection h2: `clamp(30px, 4vw, 54px)`,
`-.045em`. Category h3: `clamp(22px, 2.6vw, 32px)`, `-.035em`. Card titles:
`clamp(21px, 2.2vw, 29px)` / 800 / `-.035em`. Dialog titles:
`clamp(34px, 5vw, 62px)`, `-.055em`. Kickers: 11-12px mono, `+.08em`,
`--accent`.

Spacing: page container max 1440px, horizontal padding
`clamp(18px, 4vw, 64px)`; catalog grids use `clamp(14px, 2vw, 28px)` gaps.

## The paper rule (the signature)

One ground, two inks, hairlines between everything. Verbatim recipes:

```css
/* the heavy rule - masthead base, footer crown */
border-bottom: 2px solid var(--line-strong);

/* a card at rest */
border: 1px solid var(--line);
border-radius: var(--r-card);
box-shadow: none;

/* a card on hover - the only lift in the system */
transform: translateY(-3px);
border-color: var(--line-strong);
box-shadow: 0 12px 26px rgba(26, 25, 22, .12);
```

- Cards are flat at rest. The hover lift (`.18s ease` on transform, border,
  shadow) is the only shadow a card ever gets.
- The only large shadow is `--shadow`, reserved for dialogs.
- Decoration is restricted to: the 2px heavy rule, hairlines, vermilion
  kickers, and the poster scrim (image legibility only).
- `--accent` carries headlines and meta marks; `--accent-2` carries focus and
  functional teal blocks. No other saturated color exists.

## Contrast rules (as shipped)

- `--ink` on `--bg` / `--surface`: ~15:1 - body text anywhere.
- `--muted` on `--bg`: ~5.5:1 - smallest allowed secondary text.
- `--accent` kickers (11-12px mono) on `--bg`: ~4:1 - permitted for meta
  marks only, never body copy.
- `.tag.final`: white on `--accent` - bold 10px mono, passes at this size.
- `--watch-ink` on `--watch-bg`: ~7:1 - the teal info block.
- Poster overlays: white mono on the scrim (`rgba(0,0,0,.62)` gradient) with
  text-shadow - legibility comes from the gradient, not the badge alone.
- Focus: `outline: 3px solid var(--focus)` - the one permitted outline.

## Motif vocabulary

- **Masthead** - two-column grid: giant tight headline left (second line in
  `--accent`), giant `--font-lat` counter right-aligned; 2px
  `--line-strong` base. The front door of every page.
- **Kicker** - 11-12px `--font-mono`, `--accent`, `letter-spacing: .08em`.
  Issue numbers, eyebrows, collection kickers - all meta information speaks
  in this voice.
- **Category head** - subject left, mono count right ("N 部"), 14px margin
  below. The index-card divider of the catalog.
- **Poster** - cover image with `::after` bottom scrim: transparent at 55%,
  `rgba(0,0,0,.62)` at 100%. Rank badge top-left: `rgba(8,10,14,.82)`,
  white 11px mono. End-date bottom-left: white with text-shadow.
- **Name-row** - three columns: 104px mono label / value / copy button.
  The spec-sheet line of the detail view.
- **Method footer** - grid: label left, body right, 2px `--line-strong`
  crown. How the page signs its methodology.
- **Detail dialog** - two columns (art `.82fr` / text `1.35fr`),
  `--surface-strong` ground, `--shadow`, backdrop `blur(3px)`; mobile goes
  full-bleed and drops radius and border.

## Components and states

- **Card** - hairline border, 4px radius, flat; hover lifts 3px and turns the
  border to `--line-strong`. The poster's image scales `1.025` (`.35s ease`).
- **Filter pill** - `border-radius: 999px`, 1px `--line` border; active is
  inverted: background and border become `--ink`, text becomes
  `--surface-strong`.
- **Search** - radius 2px, hairline border, inline SVG magnifier.
- **Tag** - 10px `--font-mono`, `--badge` plate, 2px radius; `.final`
  ("story complete") is `--accent` with white text.
- **Arrow button** - 28px circle, hairline border (card corner action).
  **Close button** - 40px circle, hairline border (dialog). **Copy button** -
  small rect, 2px radius, hairline border.
- **Toast** - bottom floating dark bar; fades and slides in (`.18s ease`).
- **Focus** - `outline: 3px solid var(--focus); outline-offset: 2px`.
- **Watch block** - `--watch-bg` plate with `--watch-ink` text: the "has a
  Chinese stream" channel card.

## Motion

Print doesn't move much:

- `scroll-behavior: smooth` on the page.
- Hover lift and image zoom only (`.18s` / `.35s ease`).
- Toast: opacity + translateY `.18s ease`.
- Dialog backdrop: `blur(3px)`.
- `prefers-reduced-motion: reduce` collapses every transition to `.01ms`.

## Do / Don't

- DO let type carry the page: huge tight headlines, mono annotations,
  hairlines. Ink on paper.
- DO keep the palette to paper + two accents. Vermilion is the voice,
  teal is the tool.
- DO use both themes: the dark tokens mirror the warm paper, not invert it
  into cold black.
- DON'T add gradients except the poster scrim (legibility, never decoration).
- DON'T add shadows except the dialog's `--shadow` and the card hover lift.
- DON'T use pure black or pure white as grounds in light theme - every
  neutral is warm.
- DON'T round past 6px (pills excepted); nothing here is soft or bubbly.
- DON'T decorate with icons or illustrations where a kicker and a rule
  would do.
