# Lumina — brokerage landing page

Single-page marketing site for **Lumina**, a private real-estate advisory in Amman, Jordan.
Audience: diplomats and foreign buyers arriving with a serious budget and a short timeline.
The page's one job is to get a qualified enquiry into WhatsApp.

## Stack

Static. **No build step, no framework, no package.json.** One HTML file with inline CSS and
one inline IIFE of vanilla JS. Deployed by dragging the folder to Netlify.

Do not introduce a bundler, React, Tailwind, or a CSS framework. If a change seems to need
one, say so and stop rather than adding it.

```
index.html          everything — styles in <style>, script in <script> at the end of <body>
assets/             all media (see provenance below)
README.md           deploy + asset-swap notes for the client
```

## Verify changes with

There is no test suite. Verification is visual:

```bash
python3 -m http.server 8000     # then open http://localhost:8000
```

Check at 1920px, 1024px and 390px widths, and once with reduced motion enabled
(Chrome DevTools → Rendering → Emulate `prefers-reduced-motion`).

## Design tokens — do not substitute

**Re-based 2026-07-28** on the client's "Landing page with elevated effects"
concept. The previous navy/soft-gold set was replaced wholesale at their
request; hardcoded `rgba()` literals throughout the file were swept to match, so
do not reintroduce the old values piecemeal.

| Token | Hex | Use |
|---|---|---|
| `--ink` | `#06080C` | page base |
| `--navy` | `#0D1219` | brand base, panels |
| `--navy-2` / `--navy-3` | `#141B25` / `#1D2632` | raised surfaces |
| `--cream` | `#F4EFE6` | text |
| `--gold` | `#FFB25A` | amber accent — CTA border/fill, kickers, numerals |
| `--gold-lt` | `#FFD7A3` | glow highlights |
| `--gold-dp` | `#B8763A` | hairlines |
| `--plinth` | `#7FD9E8` | cyan plinth glow (hero only) |

Previous set, for reference if a revert is ever wanted: ink `#060C18`, navy
`#0E1729`, navy-2/3 `#16223A`/`#1E2C48`, cream `#F6F1E7`, gold `#D6BF9E`,
gold-lt `#FAE5C8`, gold-dp `#9C8259`.

Type: **Instrument Serif** (display, 400 only) + **Instrument Sans** (body/UI), Google Fonts.
Display type is always `.display`. Never set headlines in the sans.

## Architecture notes that are easy to break

**1. The float system uses two nested elements on purpose.**
`.lev` (CSS keyframe levitation) and `.depth` (cursor parallax) both animate `transform`.
They are deliberately on *separate* elements — `.depth` wrapper outside, `.lev` inside:

```html
<div class="depth" style="--d:22px"><div class="glass fact lev" style="--dur:12s">…</div></div>
```

Putting both classes on one element silently kills the levitation. Every floating panel
follows this pattern. Randomised `--dur`, `--amp`, `--delay`, `--rot` per element is what
stops the group pulsing in unison — keep them uncorrelated when adding panels.

**The collection cards need a third level.** They also carry `.tilt`, whose handler writes
an inline `transform` — and a CSS animation outranks an inline declaration, so `.lev` can
never sit on the card itself. `js/property-card.js` builds them as:

```html
<div class="prop-float rv"><div class="depth"><div class="lev"><article class="card tilt">…
```

`wide` belongs on `.prop-float` now, not `.card` — the grid item is the shell. The six
`--dur/--amp/--delay/--rot` sets live in the `FLOAT` table at the top of that file; they are
hand-picked rather than random so a grid never drifts into sync.

**2a. There is exactly one property card, shared by four pages.**
`js/property-card.js` (`Lumina.buildPropertyCard`) + `css/property-ui.css` are the single
source. `home-collection.js`, `listings.js` and `areas.js` all call it; anything
page-specific goes through `opts` (`wide`, `stagger`, `actions`). Do not fork it — the
listings page previously had its own flat `.listing-card`, and the two drifted immediately.

`css/property-ui.css` scopes **everything**, tokens included, under
`.grid-props`/`.prop-float`/`.pv`, using `--lum-*` names. That is deliberate: `index.html`
and `css/style.css` disagree on `--gold` (`#FFB25A` vs `#C2A35A`) and on type (Instrument
vs Inter), so unscoped tokens would either be overwritten by whichever page loaded them or
leak into that page's own components. It also re-declares the two `@font-face` rules, since
`style.css` never loaded them — re-declaring a face is a no-op, the browser dedupes on URL.

On `listings.html` and the `areas-*` pages, `<link href="css/property-ui.css">` sits **after**
the inline `<style>`. `.grid-props` and `.listings-grid`/`.preview-grid` are the same
specificity, so source order is what decides.

**2b. Cards injected after load need re-binding.** `lumina.js` exposes
`Lumina.refreshReveals()` and `Lumina.bindTilt(scope)`; `property-card.js` exposes
`Lumina.activateCards(scope)`, which calls those when present and installs equivalents
when not (only `index.html` loads `lumina.js`). Call it after every render — the listings
filters replace the whole grid, so first paint is not enough. `bindTilt` marks what it has
bound with `data-tilt`, so a re-scan can't stack duplicate listeners.

`activateCards` also starts a `--px/--py` pointer loop on pages that have no `lumina.js`.
`lumina.js` sets `Lumina.parallax = true` when it installs its own; that flag is the only
thing stopping two loops fighting over the same custom properties.

Its local reveal has a **1500 ms safety net**: if *nothing* has revealed by then it marks
everything `.in`. Cards start at `opacity: 0`, so an observer that never fires means a
blank page — survivable for six cards, not for the portfolio's 124. A partial reveal means
the observer is working and the rest are below the fold, so that case is left alone.

**2c. The property viewer hides with `hidden`, not `visibility`.**
`js/property-viewer.js` opens a semi-fullscreen gallery over the page (`window
.Lumina.openViewer(listing)`). Two things there are load-bearing and look wrong if you
"tidy" them:
- `.pv{display:grid}` outranks the UA `[hidden]` rule, so `.pv[hidden]{display:none}` has
  to be restated. It must be the attribute doing the hiding: `visibility` transitions
  discretely, so it still computes `hidden` on the frame the dialog opens and the
  `focus()` that runs on that frame silently does nothing.
- The open sequence forces a reflow (`void root.offsetWidth`) rather than waiting on a
  `requestAnimationFrame` pair. rAF is throttled to a standstill in a backgrounded tab,
  which left the window mounted but permanently invisible.

Both the stage layers and the thumbnail rail are windowed around the active index — there
are no separate thumbnail files, so every 60×44 thumb is one of the full-size photos and an
unwindowed rail pulls the whole gallery on open.

`listing.__askUrl`, if set, surfaces an extra WhatsApp link in the viewer footer.
`listings.js` sets it so a gallery opened from the portfolio still has an enquiry route;
the landing page and the area previews leave it undefined and the link stays hidden.

**7. Paths in `data/lumina-demo-leads.json` are root-absolute and must be stripped.**
Every `image_url` / `images[]` entry starts with `/`, which resolves fine on a domain root
and 404s under a GitHub Pages project path (`/lumina/`). `Lumina.relPath` does the strip;
`property-card.js`, `property-viewer.js` and `property-details.js` all use it or an inline
equivalent. `fetch()` calls for the JSON itself are relative for the same reason —
`listings.js`, `areas.js` and `property-details.js` each had `/data/...` and each was
broken under a sub-path deploy.

**2. Watch CSS specificity on the section-scoped rules.**
Several bugs were already fixed here: `.hood p` was overriding `.hood .stat`, and `.form>p`
was overriding `.form .fine`. When adding a rule scoped like `.section element`, check it
does not outrank a `.section .class` rule that comes later. Prefer class selectors.

**3. Parallax band bounds.**
`.band-media img` is `scale(1.18)`, giving 9% overflow top and bottom. The scroll handler
translates it ±7%. If you increase the translate, increase the scale first or an edge
will show.

**4. One throttled scroll handler.**
`onScrollBar`, `onScrollSpine` and `onScrollPlx` all run inside a single rAF-gated scroll
listener. Add new scroll work to that loop — do not add another `scroll` listener.

**5. Spine dots map to section ids** via `data-to`. Adding a section means adding a dot,
or scroll progress tracking goes stale through it.

**6. No browser storage.** No `localStorage` or `sessionStorage` anywhere.

## Asset provenance and constraints

All media is the client's own. There is no stock photography and none should be added.

| File | Origin | Constraint |
|---|---|---|
| `lumina-film.mp4` | re-cut 2026-07-27 (see below), video-only h264, faststart, 7.92s @ 1280×600, ~3.3MB | do not re-encode again; quality is already spent. Only used in `#film` now — the hero no longer autoplays it, see below |
| `film-poster.jpg` | frame 0 of that video | must match the video's first frame; used as the `#bandFilm` poster only |
| `hero-lumina.jpg` | added 2026-07-28 from a client-supplied concept render, cropped free of baked-in UI then upscaled 2× to 2088×1280 | **the current hero background**; already upscaled, do not upscale further. See "hero render" below |
| `hero-still.jpg` | added 2026-07-27, frame 0 of the re-cut film, Lanczos-upscaled 2× to 2560×1200 | **no longer used** — superseded by `hero-lumina.jpg` on 2026-07-28. Kept only as a revert path; safe to delete once the new hero is signed off |
| `villa-dabouq.jpg` | crop from the client's mockup, 935×876 | this is the **maximum** clean width — beyond x=935 the mockup's own UI intrudes |
| `villa-band.jpg` | the above, Lanczos-upscaled 2× to 1870×1752 | already upscaled; do not upscale further |
| `advisory.jpg`, `still-01..03.jpg` | re-grabbed 2026-07-27 from the re-cut film at varied timestamps/crops | more frames can be pulled from `lumina-film.mp4` with ffmpeg |
| `villa-detail.jpg` | glazing crop, low-res | only used blurred behind an off-market seal |

**`lumina-film.mp4` was re-cut on 2026-07-27 — read this before touching it again.** The
original 15.04s / 1280×720 file was not clean b-roll: it was a screen recording of an
*earlier* version of this same mockup, with a nav bar ("Lumina." + Properties/
Neighborhoods/About/Contact) baked into every single frame for the full 15s, plus a
fading hero headline/button/panel overlay baked in for the first ~10.3s. That baked-in
chrome visually duplicated our real nav and hero card — it read as broken/ghosted UI,
not a design bug in this repo's own code. Only ~t=11.0–14.95s of the original was fully
clean. The fix: trim to that clean window, crop off the top 120px (removes the nav
strip), and loop it forward+reverse (boomerang) into a seamless 7.92s clip, since 4s
alone was too short/abrupt to loop on its own. `film-poster.jpg` and the four stills were
re-grabbed from this new clean file. The original raw files are preserved outside the
deployable folder, at `../lumina-site-original-assets-backup/`, in case the client wants
the source footage — do not restore them into `assets/` without redoing this crop/trim.

**The hero background was changed from autoplay video to a still image on 2026-07-27,
per client request for a "nicer, higher quality, minimal" look.** `#heroFilm` is gone;
`.hero-media` now holds a plain `<img src="assets/hero-still.jpg">`. Reasoning: the hero
was playing the identical loop as the dedicated `#film` section immediately below it —
redundant, and a compressed/cropped video is inherently softer than a still frame from
the same source. The film section keeps its real video, since showing actual film footage
is that section's whole reason for existing; the hero is now photography-led instead.
`.hero-media video,.hero-media img` share the same scale/parallax/drift treatment, so no
CSS changed. If a future request wants motion back in the hero, prefer reusing
`hero-still.jpg` with a slow CSS Ken Burns drift over reintroducing the video — cheaper,
sharper, and avoids the redundancy this change fixed.

**Hero render + composition, 2026-07-28 — several standing rules were knowingly relaxed
here at the client's direction. Read before "correcting" any of it.**

The client supplied a finished landing-page concept render and asked for it to become the
live hero. Like the original film, *every UI element in it was baked into the pixels*
(wordmark, nav, headline, two stat cards, CTA pill). It is cropped to `x 360–1404,
y 165–805` of the 1792×1008 source — the one window containing none of that chrome — then
upscaled 2×. Re-cropping wider on any side reintroduces baked text that will ghost behind
the real markup. The source render is kept at
`../lumina-site-original-assets-backup/` alongside the film originals.

Everything in the render is now live DOM instead: `.hero-lede` (kicker + headline + sub),
`.hero-stats` (two `.glass` cards), `.hero-cta` (`.btn-pill`). Deviations from this file's
own rules, all deliberate:

- **The render is a different property** from every other asset (which all depict the
  Dabouq villa). This breaks "every asset depicts the same property" — flagged to the
  client, who chose it anyway. The band and Cedar House card still show the real villa.
- **Palette stayed locked.** The render's amber/cyan light is photographic only; no new
  colour tokens were introduced. `.btn-pill` and the stat cards use `--gold`/`--gold-lt`.
- **The headline is `.display` in caps**, not the render's sans — "never set headlines in
  the sans" still holds. `text-transform:uppercase` bridges the two.
- **The `Lumina.` wordmark was kept**, not the render's letterspaced `LUMINA`. Changing the
  brand mark is a bigger decision than a hero swap; ask before doing it.
- **No "Agents" nav item** (the render has one) — there is no agents section, so it would
  be a dead link. Nav is Home / Properties / Neighbourhoods / About / Contact + WhatsApp.
- **Stat copy is the site's own**, not the render's "180+ Exclusive Listings" — that would
  contradict "Six residences, quietly available" in the collection section.

**Hero replaced again 2026-07-28 (pod render, "elevated effects" concept).**
The client supplied a DesignCode artboard (`Lumina Landing.dc.html` + a 67KB
`support.js`). It was **not** deployed as-is and must not be: it pulls React,
ReactDOM and Babel from `unpkg.com` and transpiles its logic with `eval`, all
of which the deploy target's CSP (`script-src 'self'`, no `unsafe-eval`) blocks
outright — it would have shipped a blank page. It is also a fixed
`aspect-ratio:1792/1008` artboard with `href="#"` nav and no WhatsApp path.
The design was instead **ported to plain HTML/CSS** here: staggered per-line
headline, amber gradient on the final line, glass stat cards, glowing pill with
a looping light sweep, warm interior bloom, cyan plinth glow, cursor parallax.
No React, no runtime, no eval, no CDN. Source artboard kept out of the deploy at
`../Landing page with elevated effects/`.

`pod-hero.png` (1.6MB) was re-encoded to `pod-hero.jpg` (148KB) plus a 2KB
blurred companion. Unlike the previous plate it has **generous margins around
the structure**, so landscape can safely use `object-fit:cover` again; portrait
still switches to `contain` so the pod is never sliced.

The hero headline is the one place set in `--sans` (700, uppercase) rather than
`.display` — that is the concept's own type choice. Section headings below stay
serif. The rendered wordmark (`assets/lumina-logo.png`) replaces the CSS-drawn
`.mark` in the bar via `.mark-img`; `.mark` is still used by the boot screen and
footer.

**Superseded: hero fit notes below apply to the previous plate.**
Because the render is cropped tight to the building (baked-in UI occupied the
surrounding margins), `cover` clipped the silhouette at both wide and tall
aspects. The hero now uses a *fit-with-margin* instead:

- `.hero-fg` is sized with `max-width/max-height:100%` — the same result as
  `contain`, but the element box equals the plate, so edge effects land on the
  photo boundary rather than an oversized box.
- `--fit` is the reciprocal of a margin multiplier: `.847` = 1.18 margin in
  landscape, `.893` = 1.12 in portrait (`max-aspect-ratio:1/1`).
- `.hero-bg` is a 1.1KB pre-blurred copy of the same plate at `cover`, so the
  frame still reads full-bleed with no letterbox bars and no colour mismatch.
  It is pre-blurred at build time, not via `filter: blur()`, to stay off the
  compositor budget.
- **All hero motion is scoped inside the margin** — `heroBreathe` peaks at 1.04
  and cursor parallax is ±9px, so `--fit × 1.04` still clears the viewport at
  every aspect. Anything new added here must respect that budget or the crop
  comes straight back. Verified whole-structure-visible at 1920/1440/1280/1024/
  768/430/390.

Layout note: `.hero` is `align-items:stretch` (not `flex-end`) so `.hero-grid` fills it and
the `minmax(0,1fr)` first row floats the stat cards to the vertical centre while the
headline and CTA stay at the foot. A `(min-width:981px) and (max-height:820px)` query
trims type and padding so the CTA clears the fold on shorter laptop screens. In
`.hero-stats` the flex children are the `.depth` wrappers, **not** `.stat-card` — size
those with `.hero-stats>.depth`.

Every asset depicts the same property. When adding imagery, vary the **crop and
`object-position`** rather than repeating an identical framing — the villa already appears
in the band and the wide Cedar House card, and a third identical use reads as a slideshow.

## The listing data — repaired 2026-07-28, read before re-importing

`data/lumina-demo-leads.json` came out of a spreadsheet with no validation and
went through six repair passes. **If the source is ever re-imported, every one of
these will come back.** The scripts that did the work are disposable, but the
rules are not.

| Problem | What it looked like | Fix |
|---|---|---|
| Duplicate records | 10 records identical on every substantive field; refs and image folders differed because each import pass minted its own | Removed, keeping the richest (most photos → highest `quality_score` → lowest ref) |
| Empty shells | Refs 138, 139: no price, size, bedrooms, transaction or photos | Removed |
| Location spellings | 23 spellings for 12 districts — `Swefieh`/`Sweifeih`, `Um uthaina`/`Um Uthainah`, `4th-5ht Circle` | Normalised; `location_area` rebuilt as `<location> — Amman` |
| Excel date serials | `bedrooms: 46024` in two records — a date that landed in the wrong column | Cleared to unknown |
| Impossible sizes | `size_sqm: 21570` for an apartment | Cleared to unknown |
| Per-m² rates as prices | `885 JOD` for a 260 m² 4th Circle apartment is a rate | `price_unit: 'per_sqm'`, rendered `885 JOD/m²` |
| Monthly rents among annual | Five at 500–1,200 JOD where everything else is 6,000–120,000 | `needs_price_review: true`, rendered "Price on request" |
| Floor values | 25 spellings including `!st floor`, and `Villa`/`Building` (not floors) | Normalised to 15; non-floors cleared |
| Attribute noise | kitchen 4 distinct → 1, living_room 14 → 5, cooling 25 → 14 | Typos and casing repaired, separators unified to commas, ordering fixed so permutations collapse |
| Titles | 23 distinct across 112 records; 50 read "Abdoun Apartment for Rent" | Rebuilt as "Three-bedroom apartment with a terrace, 120 m²" → 85 distinct |

**Deduplicate *after* normalising, not before.** The first dedup pass ran on raw
values and missed refs 067/068, which were identical apart from `"New"` vs
`"new"`. They only became detectable once the fields were cleaned.

**Descriptions are generated, never hand-written.** They are composed from the
fields, so a bad field appears twice — once in the spec row and once in prose.
Repair the field and regenerate; do not edit the sentence.

**Nothing was invented.** Where a figure could not be trusted it is relabelled or
withheld, never replaced with a guess. `price_unit` and `needs_price_review` exist
so the UI can say what it does not know.

## Content that is still placeholder

Flag these rather than building on them as if true:

- `advisory@lumina-amman.com` and `info@qutaifan.com` — neither is a real address
- `js/site.js` held `962791234567` / `+962 7 9123 4567` as `LuminaConfig` defaults, and it
  rewrites every `wa.me` link on the pages that load it. That sent the whole listings page
  to a number that is not the business's. Corrected to the real `962771505250`
- Five listings show "Price on request" because their rent may be monthly rather than
  annual — refs **108, 114, 116, 127, 132**. Confirm the period and clear
  `needs_price_review` on each

## Pages, and which cluster they belong to

`index.html` is the "elevated" design (inline CSS, `--gold: #FFB25A`, Instrument type).
Every other page is the older system (`css/style.css`, `--gold: #C2A35A`, Inter). They
share `css/property-ui.css` and the property card, and nothing else. Do not assume a token
defined on one is available on the other.

**The area and insight pages were repointed on 2026-07-28.** They used to be Abdoun /
Dabouq / Dead Sea, and the site has never held a single listing in Dabouq, the Dead Sea,
Abdali, Khalda or Al Kursi — so two of the three area pages were showing three random
Amman apartments under the wrong heading, via the fallback in `areas.js`. They are now
Abdoun (61) / Swefieh (9) / The Circles (18), matched by `data-area` against `location`.

Both sets are generated, not hand-edited — the copy quotes counts and price ranges
computed from the JSON, so it cannot drift away from the inventory the way the old pages
did. Regenerate rather than editing in place if the data changes materially.

**The landing page still says Dabouq and Khalda** (`#hoods`, the footer). That is
deliberate — the client asked for the landing copy to be left alone — but it is now the
only place on the site naming districts with no stock. Worth raising.

**Navigation is unified everywhere except `index.html`**: Properties / Areas / Insights /
Sell With Us / Enquire. There were four different navs calling the same thing three names.

**Assets carry `?v=<date>`.** No cache headers, no build step, so a returning visitor keeps
whatever JS their browser cached — this is not theoretical, it is how the landing page kept
running an old picker after the file had changed. Bump the version in the HTML when
shipping JS or CSS changes.
- All six listings, their prices and specs
- Neighbourhood JOD/m² figures (1,450 / 1,250 / 1,100 / 1,300)
- Hero stats: 14 mandates, 61% off-market, 9 years
- The band caption's "sold in eleven days" claim

WhatsApp `+962 77 150 5250` **is** real and is wired throughout, including the contact form,
which composes the enquiry text and opens `wa.me` — there is no backend and none is needed.

## Non-negotiables

- `prefers-reduced-motion` must disable levitation, parallax, tilt, grain and smooth scroll.
- Tilt, magnetic buttons, cursor glow and any blur-by-depth effect are gated behind
  `(hover: hover) and (pointer: fine)` — never ship them to touch devices.
- `backdrop-filter` is already on ~12 glass panels. That is the performance ceiling.
  New compositor-heavy effects need a `min-width: 1024px` gate.
- Animate `transform` and `opacity` only. Never animate `backdrop-filter`, `width`,
  `height`, `top` or `left`.
- Keyboard focus stays visible. Contrast on text over media stays ≥ 4.5:1.
- No emoji in the UI. Icons are inline SVG.

## Enhancement backlog, in build order

Agreed priority from the last design review:

1. **Aperture bridge** — reveal the film section through an expanding `clip-path: inset()`
   driven by a sticky scroll range (42% → 0% → 42%). Highest impact.
2. **Per-line headline reveal** — split `.display` headlines into line spans, translate each
   from 110% with a stagger and dissolving blur.
3. **Overlap seams** — sections pull up ~8vh over the previous with a soft top mask, so no
   two sections meet on a hard horizontal line.
4. **Pinned collection head** — `position: sticky` on `.sec-head` while the card grid scrolls.
5. **Hero exit choreography** — reuse each panel's existing `--d` depth value so panels
   drift apart at different rates as the hero leaves.
6. **Lenis smooth scroll** (`lerp: 0.085`) — the only permitted dependency, and only if it is
   fully disabled under reduced motion.
7. Optional, desktop-gated: depth-of-field blur by distance from viewport centre (cap 3px),
   scroll-velocity `skewY` (cap 1.5°).

Explicitly rejected: ambient audio, horizontal-scroll collection, additional parallax layers.

## Working style for this repo

Small, reviewable diffs. One backlog item per commit. After each visual change, state what
to look at and at which viewport — the human verifies by eye, so a diff without a
"check this at 390px" note is incomplete.
