# Design Systems

An open collection of UI design systems. Each one is a complete world - its own
tokens, components, type voices and written spec - built to be read, forked, or
raided for a single idea. One dev server serves all of them, and the root portal
is a specimen drawer: every door is dressed in its own system's clothes.

## Run

```sh
npm install
npm run dev
```

That serves the portal at `/` and every system's pages. Node 20+. No framework,
no build step to understand: these are plain HTML and CSS files.

## Systems

Every system ships a catalog page on the same spine (see [`STANDARD.md`](STANDARD.md)),
both a light and a dark theme with a toggle, and one interactive WebGL2 surface
treatment built for its own material.

- **[SDPG-HUD](systems/sdpg-hud/)** - monochrome arcade targeting-HUD. Two
  grounds (blueprint and CRT), no chroma anywhere: emphasis is a filled block,
  and status is encoded in form rather than color. Shader: phosphor sweep.
- **[Objekt](systems/objekt/)** - brutalist industrial label system: four paper
  stocks, condensed display type set vertically, barcodes, stamps, spec sheets.
  Shader: thermal print head.
- **[Stratos](systems/stratos/)** - sci-fi FUI signal-overlay kit: one ink and
  one signal hue on black glass, `underscore_labels`, hazard stripes, segmented
  bars. Shader: interference contours.
- **[Enjoy](systems/enjoy/)** - cozy retro-desktop system: chunky outlined
  windows over a desk with pastel waves, mono type, pill meters, one saturated
  feature field. Shader: wallpaper tide.
- **[Mochi](systems/mochi/)** - soft neumorphic widget system: one warm material
  shaped by light (raised or pressed), pastel plates, flip clocks, no borders.
  Shader: dough press.
- **[Konbini](systems/konbini/)** - pixel-art poster system: rect-only pixel
  scenes on an integer grid, giant white poster type in a sky field, quiet
  captions on snow-white paper. Shader: pixel sky.
- **[Benran](systems/benran/)** - stationery of emptiness: ink silhouettes on
  hairline horizons, upright vertical type, one seal, emptiness as the primary
  material. Shader: still water.
- **[Sprout](systems/sprout/)** - pixel-prop UI kit: biscuit buttons with
  pixel-step corners and one-pixel bevels, wooden signs, a flat board,
  `steps()` motion only. Shader: furrow field.
- **[Chaguan](systems/chaguan/)** - literati ink-painting clothes on plain
  task-first UI: brush display type, solid-ink still lifes over a flat disc, a
  seal as punctuation. Shader: ink wash.
- **[Shimbun](systems/shimbun/)** - warm-paper editorial print system: one
  vermilion spot color, oversized tight headlines, hairline rules, mono
  annotations. Shader: halftone press.

## Layout

```
STANDARD.md         what a system must contain, and what must stay out of it
index.html          portal: a card per design system, each card in its system's style
shared/
  portal/           portal chrome only (system-neutral by design)
systems/
  <name>/
    index.html      the system catalog: tokens, type voices, marks, components
    DESIGN.md       the spec in prose: thesis, refusals, how to derive a component
    css/
      tokens.css    palette, type scale, spacing, radii
      portal-card.css   how this system dresses its own door on the portal
  _template/        skeleton for starting a new system
vite.config.js      multi-page: discovers every .html automatically
```

## Using one of these

Copy the system's folder into your project and link its CSS, or copy just
`css/tokens.css` and build your own components on those tokens. There is no
package to install and nothing to configure - that is deliberate. MIT licensed,
so attribution is appreciated but not required.

## Adding a system

**Read [`STANDARD.md`](STANDARD.md) first.** It defines the section spine every
catalog follows and the content rules that keep these systems reusable - chiefly
that a system documents *itself*, never the product it came from. No product
names, no app copy, no internal paths, no third-party material, and token names
that are roles rather than use cases.

Copy `systems/_template` to `systems/<name>/`, rename it, and add a card to the
root `index.html`. Give the card a `systems/<name>/css/portal-card.css` (linked
from the portal head) so the entrance wears the system's own clothes while the
portal chrome stays neutral. No build config changes are needed - the Vite config
discovers `.html` entries by walking the tree.

Two boundaries worth keeping:

- **Tokens never go in `shared/`.** A design system's identity is its tokens, so
  everything visual lives under its own folder - including the portal card: the
  neutral shell is `shared/portal/portal.css`, the card's look is the system's
  own `portal-card.css`.
- **One world per folder.** A system never imports another system's CSS. If two
  systems want the same component, each gets its own version.

## Deploying

These are plain static files - there is no build step to deploy. GitHub Pages
serves the repo as-is:

1. Settings -> Pages -> Source: **Deploy from a branch**, branch `main`, folder
   `/ (root)`.
2. That is it. The site appears at `https://<user>.github.io/design-systems/`.

Two things keep it working under that subpath, so do not undo them:

- **Every link is relative**, never rooted at `/`. A link like
  `/systems/objekt/index.html` resolves to the domain root and 404s when the
  site is served from a subdirectory.
- **`.nojekyll` is committed.** Without it GitHub runs Jekyll, which silently
  drops any directory starting with an underscore - `systems/_template/` would
  vanish from the published site.

`npm run build` exists for anyone who wants a minified bundle, but deployment
does not use it.

## License

[MIT](LICENSE).
