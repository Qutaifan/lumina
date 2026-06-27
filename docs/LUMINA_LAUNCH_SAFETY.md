# Lumina Launch Safety

STATUS: TEST PREVIEW ONLY

This document defines the safety checks for Lumina demo preview sharing. The current listings are workflow test leads, not owner-approved public inventory.

## Required Demo Wording

“This is a demo test run, not final live inventory.”

## Pricing Rule

Lumina demo pricing uses 5% test margin. Rounding uses commercial half-up rounding: under 500,000 JOD round to nearest 5,000; 500,000 JOD and above round to nearest 10,000. Halfway values round upward.

Required pricing disclaimer:

“Demo price includes a test margin for workflow simulation only. Final pricing requires owner approval and live market verification.”

## Location Privacy Rule

Required location privacy disclaimer:

“Map shows the general area only. Exact property location is shared privately after buyer qualification and viewing approval.”

Allowed public location handling:
- area name
- city/destination
- neighborhood-level description
- general area map

Forbidden public location handling:
- exact property pin
- exact coordinates
- exact street address
- owner address
- private building name unless safely public and already generalized
- scraped map pin from source

## Public Claim Guardrails

Forbidden public claims:
- Exclusive Listing
- Exclusive Listings
- Verified Listings
- number one agency
- largest portfolio
- guaranteed
- best prices
- limited offer

Safe replacements:
- Demo Lead
- Demo Preview
- Curated Residence
- Private Viewing
- Test Listing
- Workflow Test
- Private Advisory
- Owner verification required
- Availability subject to live verification

## Source/Data Guardrails

- Do not claim Lumina owns, controls, or exclusively represents demo leads.
- Do not claim availability is confirmed.
- Do not scrape or publish private contacts.
- Replace source listing photos with licensed/free demo-safe imagery.
- Keep exact source pricing in internal JSON/CSV only; public-facing display should show Lumina demo pricing with disclaimers.
- Public display normalized to area-level location for privacy where a source contains more specific location wording.

## Static Deployment Guardrail

Cloudflare Pages manual Upload Assets compatibility must remain:
- Build command: none
- Output directory: /
- No React/npm build pipeline/backend/database/Wrangler/API-key dependency.

## Final Launch Blockers

Before final launch, Lumina must replace placeholders, confirm owner approval, verify availability/pricing/media rights, and remove all demo-only language or convert it to verified owner-approved public copy.
