# ENJOY - design spec

Personal computing as a warm hobby: the whole UI is a lovingly riced retro desktop,
where every element is a window or a desk object drawn with a chunky ink outline over
a sunny cream ground with big lazy aqua waves. One mono typeface does everything and
scale does the work; depth is a small hard offset shadow, never a blur.

Status: Exploration. Client-pinned direction (reference: 2000s-Mac-meets-unixporn
ricing screenshot). Source of truth for tokens and components: `css/enjoy-core.css`.

## Tokens

| Token | Value | Role |
|---|---|---|
| `--desk` | `#f2ecdc` | cream desktop ground |
| `--wave` | `#bcdfe1` | pastel aqua: wallpaper waves, meter fills, active rows |
| `--paper` | `#faf6ea` | window and panel fill |
| `--ink` | `#22201c` | every outline, every glyph, every letter |
| `--peach` | `#f2cdaa` | secondary fill: meters, highlights, markers |
| `--player` | `#2b7bc7` | THE one saturated field, reserved for a hero content pane |
| `--record` | `#d0472e` | tiny live/record dots only |
| `--shadow-win` | `3px 3px 0 rgba(34,32,28,0.9)` | window depth |
| `--shadow-ctl` | `2px 2px 0 var(--ink)` | control depth (buttons, chips, cards) |
| `--line` | `2px` | the one outline weight |
| `--r-win` | `10px` | window corner radius |
| `--r-ctl` | `8px` | control corner radius |

## The one-typeface rule

Everything is mono: `ui-monospace, "SF Mono", Menlo, Consolas, monospace`.
There is no second face; hierarchy comes from size, weight, and case.

| Step | Size | Use |
|---|---|---|
| label | 11px | meter labels, state tags, tiny annotations |
| title | 12px | window titles (centered), menu clock |
| body | 13px | default body, buttons, chips, sidebar |
| ui | 14px | emphasized body, card headings |
| display-s | 22px | secondary display lines |
| display | 28px | lyrics / hero display voice, line-height 1.6 |

Case: lowercase for buttons and handles ("play", "@github"); Title Case for icon
labels and song titles; never all-caps.

## Window anatomy

1. Frame: `--line` ink outline, `--r-win` radius, `--paper` fill, `--shadow-win`.
2. Title bar: separated from the body by a `--line` ink rule; three small outlined
   circles (traffic dots) on the left; centered mono title in the path voice,
   e.g. `/home/fun - qutebrowser`.
3. Body: 13-14px mono on paper.
4. Dark chrome variant (player only): frame and title bar filled `--ink`, cream
   dots and title; interior separators are cream at low alpha.

## Motif vocabulary

- **Window** - the master container; everything on the desk is one.
- **Menu bar** - slim full-width strip: glyph + "Play Edit Video Window Enjoy"
  left, static "Sat Oct 16 11:28 AM" right. Collapses to glyph + clock on small
  screens.
- **Pill meter** - 3ch lowercase label + outlined pill track, fill in `--wave` or
  `--peach`, rounded ends. vol / cpu / ram.
- **Desktop icon** - 44px outlined line glyph (retro computer, folder with papers,
  ear, jam jar) with a Title Case mono label beneath.
- **Now-playing chip** - tiny album square + truncating title + prev/pause/next
  ink glyphs.
- **Info card** - small window of stacked mono lines (track / artist - album).
- **Search field** - outlined rounded input, placeholder "Search".
- **Wave wallpaper** - 2-3 huge slow `--wave` shapes behind everything.

## Component states

- **Button** (outlined rounded rect, lowercase): rest `--shadow-ctl`; hover lifts
  1px and grows the shadow to 3px; press sinks flat (translate to the shadow's
  corner, shadow removed); disabled = dashed outline + 50% ink + no shadow.
- **Handle chip** - pill button, same states, "@handle" copy.
- **Icon button** - 36px round outlined glyph button, same states.
- **Sidebar row** - hover fills `--desk`; active fills `--wave`; the "On Record"
  row carries the only `--record` dot.
- **Transport** - prev/play/next icon buttons, 2px ink progress line with a knob,
  mono timecode, mini volume meter.
- **Toggle** - outlined pill, square-ish knob (6px radius); on fills the track
  `--wave`.
- **Tooltip** - small ink-filled bubble, cream text, square caret.
- **Focus** - every interactive element: 2px solid `--ink` outline, offset 2px.

## Motion

Cozy and tiny. The clock's colon blinks at 1s steps; buttons lift and sink.
Nothing else animates. `prefers-reduced-motion` kills the blink.

## Do / Don't

- Do keep `--player` for exactly one hero content pane per screen. Never use it
  for chrome, buttons, or accents.
- Do keep every shadow a hard offset (2-3px, zero blur). Never a blurred shadow.
- Do keep every outline `--line` (2px) ink. No hairlines, no 1px borders.
- No gradients, anywhere. Flat fills only.
- No second typeface, no all-caps, no gray-on-blue small text (cream on
  `--player` is about 4.2:1, fine at display sizes only - lyrics never set
  below 24px).
- `--record` is a dot, never a fill or a text color.
- Never use the em dash character; use "-".
