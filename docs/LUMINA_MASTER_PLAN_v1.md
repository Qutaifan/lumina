# LUMINA MASTER PLAN v1
*Luxury Real Estate — Jordan*
*Version: 1.0 | Date: 2026-06-27*

---

## WHAT LUMINA IS

Lumina is a boutique luxury real estate company operating in Amman, Jordan.

We source, market, and close deals on premium apartments, villas, penthouses,
and investment properties for high-net-worth buyers, Gulf investors, and expats.

We are not a portal. We are not a tech product. We are a real estate business
that uses technology as leverage — not as the product.

---

## TARGET MARKET

Buyers:
- High-net-worth Jordanians
- Gulf buyers (KSA, UAE, Kuwait, Qatar)
- Expats returning to Jordan
- Real estate investors seeking yield or capital appreciation

Properties:
- Luxury apartments (150sqm+, premium finishes)
- Villas (private, gated, land included)
- Penthouses (rooftop, panoramic views)
- Investment properties (rental yield, capital growth story)

Locations (priority order):
1. Abdoun
2. Dabouq
3. Dair Ghbar
4. Um Uthaina
5. Abdali

Price range: JOD 200,000 — JOD 3,000,000+

---

## FOLDER STRUCTURE

```
Lumina/
├── brand/
│   ├── logo/                  # logo files (SVG, PNG, dark/light variants)
│   ├── colors.md              # brand palette, typography
│   ├── tone-of-voice.md       # how we speak to clients
│   └── templates/             # email, WhatsApp, proposal templates
│
├── website/
│   ├── sitemap.md             # full sitemap
│   ├── copy/                  # page copy drafts
│   │   ├── home.md
│   │   ├── about.md
│   │   ├── listings.md
│   │   └── contact.md
│   └── assets/                # images, videos, brochures
│
├── leads/
│   ├── intake-form.md         # lead capture fields
│   ├── lead-tracker.csv       # active leads (manual or Notion)
│   ├── scripts/               # WhatsApp, call, email scripts
│   │   ├── first-contact.md
│   │   ├── follow-up.md
│   │   └── closing.md
│   └── sources.md             # where leads come from + priority
│
├── properties/
│   ├── listing-template.md    # standard property profile format
│   ├── sourcing-checklist.md  # how to evaluate and onboard a listing
│   ├── active/                # one file per active listing
│   └── pipeline/              # properties under evaluation
│
├── buyers/
│   ├── buyer-profile.md       # standard buyer profile format
│   ├── active/                # one file per qualified buyer
│   └── matching-logic.md      # how to match buyer to listing
│
├── operations/
│   ├── daily-workflow.md      # what to do every day
│   ├── weekly-review.md       # what to review every week
│   ├── deal-flow.md           # stages from listing to close
│   ├── commission-model.md    # fee structure
│   └── legal/                 # contract templates, JDs
│
├── discord/
│   ├── structure.md           # server layout
│   └── channel-guide.md       # what each channel is for
│
├── ai-stack/
│   ├── tools.md               # approved AI tools in use
│   └── prompts/               # saved prompts for recurring tasks
│
└── docs/
    ├── LUMINA_MASTER_PLAN_v1.md   ← THIS FILE
    └── roadmap.md
```

---

## WEBSITE SITEMAP

### Public Pages

```
luminaluxury.com/
├── /                          Home
├── /properties                All Listings (filterable)
│   ├── /properties/apartments
│   ├── /properties/villas
│   ├── /properties/penthouses
│   └── /properties/investment
├── /property/[slug]           Individual Property Page
├── /neighborhoods             Area guides (Abdoun, Dabouq, etc.)
│   ├── /neighborhoods/abdoun
│   ├── /neighborhoods/dabouq
│   ├── /neighborhoods/dair-ghbar
│   ├── /neighborhoods/um-uthaina
│   └── /neighborhoods/abdali
├── /about                     Who we are
├── /services
│   ├── /services/buyers       For Buyers
│   ├── /services/sellers      For Sellers
│   └── /services/investors    For Investors
├── /contact                   Contact + Inquiry Form
└── /valuation                 Free Property Valuation (lead magnet)
```

### Key Conversion Points (every page has):
- WhatsApp CTA button (floating)
- Inquiry form (name, phone, budget, interest)
- "Book a Private Viewing" button on every listing

---

## LEAD GENERATION WORKFLOW

### Sources (priority order)

1. WhatsApp direct (fastest close rate)
2. Website inquiry form
3. Instagram DMs (luxury property content)
4. Gulf buyer referrals
5. Developer relationships (off-plan leads)
6. Expat community groups

### Lead Intake

When a lead comes in:

```
STEP 1 — Capture
  Name / Phone / WhatsApp
  Source (how did they find us)
  Interest (buy/invest/looking)
  Budget range
  Timeline (how soon)

STEP 2 — Qualify (within 2 hours)
  Call or WhatsApp within 2 hours
  Ask the 5 qualifying questions (see scripts/)
  Tag: Hot / Warm / Cold

STEP 3 — Match
  Match to active listings
  If no match → add to buyer pipeline
  Send 2-3 property options max (do not overwhelm)

STEP 4 — View
  Book private viewing within 48 hours for Hot leads
  Send viewing confirmation + property brief

STEP 5 — Follow-up
  Same day after viewing: WhatsApp message
  Day 3: follow-up call
  Day 7: new options if no decision
  Day 14: monthly check-in (warm/cold leads)
```

### Lead Status Tags
- HOT: budget confirmed, timeline <90 days, engaged
- WARM: budget indicated, timeline unclear
- COLD: browsing, no timeline, unresponsive
- CLOSED: deal done
- DEAD: no response after 3 attempts

---

## PROPERTY ACQUISITION WORKFLOW

### How we source listings

```
STEP 1 — Identify
  Target: owners of premium properties in our 5 zones
  Sources:
    - Direct owner outreach (WhatsApp, calls)
    - Developer relationships (new builds, off-plan)
    - Agent referrals (co-broker deals)
    - Word of mouth from buyers

STEP 2 — Qualify the Listing
  Checklist (see properties/sourcing-checklist.md):
    □ Location in our target zones
    □ Property condition (A, B, or C grade)
    □ Owner's price expectation vs market
    □ Title deed status (clean, no liens)
    □ Reason for selling
    □ Exclusivity (exclusive vs open listing)

STEP 3 — List
  Photograph + video walk-through
  Write property brief (English + Arabic)
  Upload to website
  Push to WhatsApp broadcast list
  Post on Instagram

STEP 4 — Manage
  Weekly update to owner
  Price feedback from buyer viewings
  Negotiate price adjustment if needed after 30 days

STEP 5 — Close
  Buyer offer → seller negotiation
  MOU signed
  Legal review
  Transfer and commission collected
```

### Listing Priority
Pursue EXCLUSIVE listings first.
Co-broker listings second.
Open market third.

---

## BUYER ACQUISITION WORKFLOW

```
STEP 1 — Attract
  Website SEO (luxury apartments Amman, villas Abdoun, etc.)
  Instagram content (property tours, area guides, lifestyle)
  Gulf buyer ads (Meta targeting: KSA, UAE, Kuwait)
  WhatsApp broadcast (existing contacts)

STEP 2 — Capture
  Every visitor → WhatsApp CTA or form
  Every inquiry → logged same day

STEP 3 — Qualify
  5 questions by WhatsApp or call:
    1. What type of property are you looking for?
    2. Which areas are you considering?
    3. What is your budget range?
    4. When are you looking to move / invest?
    5. Are you buying cash or with financing?

STEP 4 — Nurture
  Hot leads: daily contact until viewing
  Warm leads: weekly update with new listings
  Cold leads: monthly newsletter with market insight

STEP 5 — Close
  Private viewing → follow-up → offer → negotiation → close
```

---

## DISCORD OPERATING ENVIRONMENT

### Server Name: Lumina HQ

```
CATEGORY: COMMAND
  #daily-brief          — what's happening today (leads, viewings, tasks)
  #decisions            — where decisions get made and logged

CATEGORY: LEADS
  #new-leads            — every new inquiry logged here
  #hot-leads            — leads marked HOT, daily follow-up
  #viewing-schedule     — confirmed viewings
  #closed-deals         — wins logged here

CATEGORY: PROPERTIES
  #new-listings         — new properties added
  #price-changes        — price updates on active listings
  #pipeline             — properties under evaluation

CATEGORY: MARKETING
  #content-calendar     — Instagram and WhatsApp content plan
  #posted-today         — what went live today
  #ideas                — content and campaign ideas

CATEGORY: OPERATIONS
  #tasks                — to-do items and action items
  #weekly-review        — weekly performance summary
  #documents            — links to key docs and templates

CATEGORY: PRIVATE
  #financials           — commission tracking, revenue
  #legal                — contract notes
```

---

## DAILY OPERATING WORKFLOW

### Morning (9:00 — 9:30)

```
□ Open #daily-brief — review yesterday's open items
□ Check WhatsApp — respond to all messages
□ Review #new-leads — log any overnight inquiries
□ Confirm today's viewings
□ Post one piece of content (Instagram or WhatsApp broadcast)
```

### Midday (12:00 — 13:00)

```
□ Follow up with all HOT leads
□ Update lead tracker (status changes)
□ Call any warm leads not contacted in 5+ days
□ Check with any viewing that happened → outcome?
```

### End of Day (17:00 — 17:30)

```
□ Log all leads contacted today in tracker
□ Post #daily-brief update in Discord
□ Set tomorrow's priorities
□ Any property sourcing calls made → log outcome
```

### Weekly (Sunday)

```
□ Weekly review: leads added / viewings done / offers made / deals closed
□ Review listing performance (which properties had most inquiries)
□ Instagram content plan for the week
□ WhatsApp broadcast to warm/cold leads (new listings, market update)
□ Reach out to 3 new property owners (sourcing)
```

---

## COMMISSION MODEL

- Standard: 2.5% of deal value (buyer side)
- Exclusive listing: 2.5% + 2.5% = 5% total
- Co-broker split: 50/50 on buyer side commission
- Developer off-plan: 3%–5% (developer-paid)
- Minimum deal size we pursue: JOD 150,000

---

## DEAL FLOW STAGES

```
STAGE 1 — LISTING ACQUIRED
STAGE 2 — LISTED (live on website + marketed)
STAGE 3 — VIEWINGS ACTIVE (at least 1 viewing scheduled or done)
STAGE 4 — OFFER RECEIVED
STAGE 5 — NEGOTIATION
STAGE 6 — MOU SIGNED
STAGE 7 — DUE DILIGENCE (legal, title check)
STAGE 8 — TRANSFER IN PROGRESS
STAGE 9 — CLOSED (commission collected)
```

---

## PRIORITY ROADMAP

### WEEK 1 — Foundation
```
□ Finalize brand (name, logo, colors, tone)
□ Set up Discord server (Lumina HQ structure above)
□ Create WhatsApp Business account + broadcast list
□ Set up basic Instagram account
□ Create lead tracker (Notion or simple CSV)
□ Write first-contact and follow-up scripts
□ Reach out to 10 property owners in Abdoun/Dabouq
□ Build list of first 5 target listings
```

### WEEK 2 — Website
```
□ Register luminaluxury.com (or best available)
□ Build website (see sitemap)
□ Write copy for Home, About, Contact
□ Add first 3 listings with photos
□ Set up WhatsApp CTA on all pages
□ Set up Google My Business (Lumina Real Estate Jordan)
```

### WEEK 3 — Lead Generation
```
□ First Instagram post series (3 posts: area guide, property tour, market insight)
□ WhatsApp broadcast to first 50 contacts
□ Run first Meta ad (Gulf buyer targeting, $50 test budget)
□ Set up inquiry form → WhatsApp notification pipeline
□ Reach out to expat community groups
```

### WEEK 4 — First Deals
```
□ Target: 10 qualified leads in pipeline
□ Target: 3 viewings completed
□ Target: 1 offer made
□ Review what's working → double down
□ Review what's not working → cut
```

### MONTH 2 — Scale
```
□ 5 exclusive listings secured
□ 20 qualified buyers in pipeline
□ First deal closed
□ Referral network activated
□ Developer relationships established (2+ developers)
```

---

## WHAT NOT TO BUILD (YET)

- No CRM software (use CSV + Discord until first 10 deals)
- No complex automation (manual is faster at this stage)
- No mobile app
- No chatbot
- No complex AI pipeline
- No portal (we are not Lamudi)

Build the business first. Add technology when it solves a real bottleneck.

---

## SUCCESS METRICS (MONTH 1)

| Metric | Target |
|---|---|
| Listings acquired | 5 |
| Leads generated | 30 |
| Qualified leads | 10 |
| Viewings completed | 5 |
| Offers made | 1 |
| Deals closed | 0–1 |
| Commission earned | JOD 0–7,500 |

---

*LUMINA MASTER PLAN v1 — Built for execution, not presentation.*
