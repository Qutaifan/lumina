# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What Lumina Is

Boutique luxury real estate company in Amman, Jordan. Targets high-net-worth Jordanians, Gulf investors (KSA/UAE/Kuwait/Qatar), and expats. Properties: apartments, villas, penthouses in Abdoun, Dabouq, Dair Ghbar, Um Uthaina, Abdali. Price range: JOD 200K–3M+. Commission: 2.5% buyer side, 5% on exclusive listings.

This is a **business operations repo**, not a software product. There is no build system, no tests, no CI. Most files are Markdown. The website is static HTML/CSS/JS.

## Website

**Stack:** Pure HTML, single shared CSS (`website/css/style.css`), vanilla JS (`website/js/site.js`). No framework, no bundler.

**Deploy:** Cloudflare Pages (see `website/CLOUDFLARE_PAGES_DEPLOYMENT.md`). Just push the `website/` folder.

**To preview locally:**
```bash
cd website && python3 -m http.server 8080
```

**Design system (do not deviate):**
- Colors: `--navy #0D1B2A`, `--gold #C9A84C`, `--white #F9F7F4` — all defined as CSS vars in `style.css`
- Fonts: Playfair Display (headlines), Inter (body) — loaded from Google Fonts
- Max width 1280px, section padding 100px, container 40px horizontal
- Tone: confident, discreet, specific facts — never "amazing deal", "best price", "don't miss out"

**Pages built:** `index.html`, `listings.html`, `property-details.html`. Still needed: `/about`, `/contact`, `/valuation`.

**Key components:** `.property-card`, `.btn-gold`, `.btn-outline-gold`, `.label` (gold eyebrow), `.gold-line`, `.whatsapp-float`. Every page must have a floating WhatsApp button and at least one primary CTA above the fold.

**Images:** All in `website/assets/images/` — currently placeholders. Replace with real photos: hero 1920×1080, gallery 1600×900, cards 800×600.

**WhatsApp number** (not yet configured): update `https://wa.me/9627XXXXXXXX` across all pages.

## Folder Structure Logic

| Folder | What goes here |
|--------|----------------|
| `brand/` | Colors, typography, tone of voice, templates |
| `website/` | HTML/CSS/JS + copy drafts in `copy/` |
| `leads/` | Lead tracker CSV + outreach scripts |
| `properties/` | Listing template + active/pipeline listings |
| `buyers/` | Buyer profiles and matching logic |
| `operations/` | Deal flow, commission model, workflows |
| `discord/` | Discord server structure and channel guide |
| `ai-stack/` | Approved AI tools and saved prompts |
| `docs/` | Master plan and roadmap |

## Lead & Deal Workflow

Leads: HOT (budget confirmed, <90 day timeline) / WARM / COLD / CLOSED / DEAD. Respond within 2 hours. Log everything in `leads/lead-tracker.csv`.

Deal stages 1–9: Listing Acquired → Listed → Viewings Active → Offer → Negotiation → MOU Signed → Due Diligence → Transfer → Closed.

Scripts in `leads/scripts/`. Sourcing checklist at `properties/sourcing-checklist.md`.

## Current Roadmap Status

Phase 1 (Week 1) and Phase 2 (Week 2, website) are in progress. See `docs/roadmap.md` for full checklist. Track at `docs/roadmap.md` — update checkboxes as items complete.

## Guardrails

- No CRM software, no automation, no chatbot until first 10 deals closed
- The website is static — do not introduce a framework or build step without a strong reason
- Listings are managed as Markdown files, not a database
- Copy tone: see `brand/tone-of-voice.md` before writing any client-facing text
