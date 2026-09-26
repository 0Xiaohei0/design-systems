# What a system in this repo must contain

Every system here is published for strangers to read, fork, and steal from. That
sets a bar that an internal design document does not have to clear: a reader has
no access to the product the system came from, no way to ask what a label meant,
and no obligation to care about it.

So a system in this repo documents **itself**, not the thing it was built for.
This file is the standard. It applies to every system, including the ones that
predate it, and `systems/_template/` is its working skeleton.

---

## 1. The spine

Sections in this order. Skip one only when the system genuinely has nothing to
put in it - a flat system with no motion has no Motion section, and that is an
honest omission, not a gap to pad.

| # | Section | What goes in it |
|---|---------|-----------------|
| 0 | **Masthead** | Sticky. Section index, and a theme toggle. Nothing else. |
| 1 | **Read this first** | The short list of rules an implementer must obey. See §4. |
| 2 | **Thesis** | `h1` plus two or three sentences: what this system is, and the one or two things a reader must hold on to before reading further. |
| 3 | **Colour** | Every role token, **both themes visible at once**, plus the contrast floor. |
| 4 | **Typography** | Every type token, rendered at its real size. Not a list of numbers. |
| 5 | **Space and layout** | The spacing scale, the content measure, the breakpoints. |
| 6 | **Form** | Radii, borders, elevation - whatever gives the system its silhouette. |
| 7 | **Motion** | Durations, easing, what is allowed to move and what is not. |
| 7.5 | **Screen** *(optional)* | An interactive surface treatment, if the system has one. Held to the contract in §3. |
| 8 | **Components** | Every component, every state, **live**. |
| 9 | **Motifs** | The signature shapes. What makes this system recognisable at a glance. |
| 10 | **Composition** | The parts assembled into one neutral specimen. See §5 - this is the section people get wrong. |
| 11 | **Rules** | Do / Do not. The refusals matter more than the permissions. |

Each section opens with a heading and one lede paragraph, then shows the thing
itself, then explains the **why** in a callout. A number with no reason attached
is a number the next person will change.

---

## 2. Content rules

These are the rules this repo exists to enforce. They are the difference between
a design system and a screenshot of an app.

### R1 - No product content

The specimen content must be **neutral**. A card shows a card, not a product's
card with the product's data in it.

Concretely, none of these belong on the page: real product or feature names,
real user-facing copy lifted from an app, screenshots, domain-specific field
labels, or a walkthrough of a flow. If a reader can tell what the app *did* from
reading the design system, the system has leaked.

> **Why it matters beyond tidiness.** Product content makes the system look
> narrower than it is. A reader who sees a card filled with one industry's
> catalogue entries concludes the system is *for* that industry and closes the
> tab - when what they were actually looking at was a perfectly general card.

### R2 - No project details

Nothing that points at a codebase the reader cannot open. No internal file paths
(`../app/styles/colors.ts`), no repo names, no "the source of truth lives in
X", no internal preview URLs, no ticket numbers, no team or client names.

A system's folder **is** the source of truth. If it was extracted from somewhere,
one sentence of provenance is enough, and it names no paths.

### R3 - No third-party material

No real brand names, product titles, company names, or logos other than the
system's own. No licensed font binaries - link a webfont or declare a system
stack, and name the licence. No copied imagery.

This repo is MIT and public. Everything in it must be yours to give away.

### R4 - Tokens are roles, not use cases

A token is named for the job it does, never for the first place it was used and
never for its hue.

```
--watch-bg      the block where the watch link goes      use case -> wrong
--green-100     a light green                            hue      -> wrong
--note-bg       a quiet informational block              role     -> right
```

The test: **if this system were used to build something completely different,
would the name still be true?** `--rank-chip` fails. `--index-chip` passes.

Hue names fail for a second reason - they become lies the moment the dark theme
inverts them.

### R5 - Both themes, and a toggle

If the system has a dark theme it is hand-authored, and the spec page carries a
**visible toggle** so a reader can check it without changing their OS settings.
A dark theme that only `prefers-color-scheme` can reach is a dark theme nobody
will review.

### R6 - States are live

Hover states hover. Disabled states are actually disabled. Toggles flip. A
reader must be able to point at any state on the page and see it happen. A
screenshot of a hover state is not documentation of a hover state.

### R7 - Documentation is in English

**Every word written to be read is English**: headings, ledes, table
descriptions, callouts, rules, component notes, code comments, `DESIGN.md`,
`README.md`.

The exception is *shown* text rather than *written* text. A system whose
identity includes a non-Latin script keeps that script exactly where it is being
demonstrated - the wordmark, and the type specimen that exists to show the
stack. SHIMBUN is the worked example: it is a CJK-first editorial system, and
CJK survives in precisely two places on its page.

Specimen copy elsewhere - card titles, field labels, placeholder values - is
English too, and neutral per R1.

> **Why.** These systems are published for strangers. A reader who cannot read
> the documentation cannot evaluate the system, and will not fork it. Keeping
> the script where it is being *documented* loses nothing: the specimen still
> proves the stack renders.

### R8 - Self-contained

The page must work from a `file://` open with no build step: relative links,
webfonts by URL or a system stack, no imports from outside the system's folder.
No system imports another system's CSS - if two want the same component, each
gets its own.

---

## 3. Shaders and live surfaces

A system may ship an interactive surface treatment - a shader behind a hero, a
generative field in an empty frame. Both SDPG-HUD and SHIMBUN have one, and they
are held to the same contract. If you add one, it must:

1. **Be enhancement only.** What sits underneath is the complete static design.
   The canvas is transparent until its first frame, so a machine without WebGL2
   loses nothing. Say so on the page, and show the fallback next to the live one.
2. **Read its colours from tokens at runtime**, never from hardcoded hex. This
   is what lets the treatment survive a theme flip, and it is also how a system
   with a colour rule can make that rule structural - SDPG-HUD's shader ends on
   `mix(uGround, uInk, ink)`, so it is incapable of emitting a hue.
3. **Stop when off screen.** Gate it on an `IntersectionObserver`. A decorative
   surface has no claim on a frame budget nobody is watching.
4. **Collapse under `prefers-reduced-motion`.** Render one settled frame and
   never start a loop.
5. **Be documented like anything else.** A uniform table with real values and a
   sentence on what each one does, plus an explicit statement of *where it
   belongs* - which, for every shader so far, has meant "not behind body text".
6. **Stay inside the system's folder.** `systems/<name>/js/`. No shared shader
   library: two systems wanting a similar effect each get their own, because the
   moment they share one, neither can change it.

Interaction should have weight. Follow the pointer on a spring rather than
binding to it directly - it costs four lines and is the difference between a
treatment that feels like a material and one that feels like a mouse trail.

---

## 4. The "read this first" block

Near the top, before the specimens, a short numbered list addressed to whoever
implements against the system - increasingly an agent rather than a person.

It should say, in the system's own terms:

1. These values are the system. Do not invent parallel ones.
2. Search for an existing component before building a second one.
3. No ad-hoc values - no raw hex, no one-off sizes, no new easing curves.
4. Token names are roles. Read what a token is *for*.
5. Whatever else this particular system will not forgive.

Keep it to five or six items. It is a contract, not a manual.

---

## 5. The Composition section

This is the section that breaks the standard most often, because the natural
thing to do is paste in a real screen - and a real screen is precisely what R1
forbids.

**Compose the system into a specimen, not into a product.**

A good Composition section assembles real components into one arrangement that
shows how they sit together: how surfaces alternate, how a header relates to its
content, where the accent is spent, what the rhythm between blocks is. It uses
placeholder copy, and it is followed by an anatomy table that names each part
and says why it is that way.

A bad one is a page from the app with the logo swapped out.

The useful question: **would this section still make sense to someone in a
completely different industry?** If it only makes sense to someone who knows the
product, rebuild it.

---

## 6. Checklist

Before adding or updating a system:

- [ ] Every section of the spine is present, or honestly absent
- [ ] No product names, user copy, screenshots, or flow walkthroughs
- [ ] No internal paths, repo names, or URLs a reader cannot open
- [ ] No third-party brands, titles, logos, or licensed font binaries
- [ ] Every token name survives being used for a different product
- [ ] All documentation in English; non-Latin script only where it is demonstrated
- [ ] Both themes authored, and a toggle on the page
- [ ] Any shader is enhancement-only, token-coloured, visibility-gated, and
      collapses under reduced motion
- [ ] Every state is live and reachable
- [ ] Opens from `file://` with no build step
- [ ] `DESIGN.md` states the thesis and, explicitly, the refusals
- [ ] A portal card exists and is a real material specimen of the system
