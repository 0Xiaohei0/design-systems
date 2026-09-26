# SDPG-HUD

Monochrome arcade/targeting-HUD design system from the SDPromptGen project.
One visual world on two grounds: a light "blueprint" theme and a dark "CRT"
theme. No chroma anywhere - emphasis comes from a filled/inverted block, and
status is encoded in form (filled = active, outline = idle, dashed = disabled
or in-flux).

## Provenance

Extracted from SDPromptGen, a Stable Diffusion prompt-generator app where this
language was first designed and shipped. This folder is the standalone spec: the
tokens and components here are the whole system, no upstream file needed.

## In this folder

- `index.html` - the ported spec page (hero poster, foundations, controls,
  operator console, in-application preview), with the theme toggle inline.
- `css/hud-core.css` - all tokens and component styles, extracted from the
  original inline style block.
- `mascot.png` - hero mascot image, copied from the source repo.
