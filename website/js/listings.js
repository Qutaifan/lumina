// LUMINA — listings.js
// Renders the full Excel-imported portfolio (photos matched by ref).

(function () {
  'use strict';

  const grid = document.getElementById('listings-grid');
  const count = document.getElementById('listing-count');
  const whatsappNumber = (window.LuminaConfig && window.LuminaConfig.whatsapp) || '962771505250';

  let allListings = [];

  const safeText = value => (value === null || value === undefined) ? '' : String(value);

  const whatsappUrl = message => `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

  const listingMessage = listing => [
    'Hello, I came across this property on Lumina and it caught my attention:',
    '',
    safeText(listing.title),
    listing.ref ? `Ref: ${listing.ref}` : null,
    safeText(listing.location_area),
    '',
    'Is it still available? I would like to know more.'
  ].filter(Boolean).join('\n');

  const viewingMessage = listing => [
    'Hello, I would like to schedule a viewing for:',
    '',
    safeText(listing.title),
    listing.ref ? `Ref: ${listing.ref}` : null,
    safeText(listing.location_area),
    '',
    'Please contact me.'
  ].filter(Boolean).join('\n');

  /* The card itself comes from js/property-card.js, the same builder the
     landing page uses — that is the only way the two grids stay
     identical. What is page-specific is passed in: the listings page
     keeps its two WhatsApp routes, which the home grid does not have. */
  const createListingCard = (listing, index) => {
    /* The gallery carries the enquiry route too, so a viewer opened
       from a card is not a dead end. */
    listing.__askUrl = whatsappUrl(listingMessage(listing));
    return window.Lumina.buildPropertyCard(listing, index, {
      /* No `wide` card here. The home grid features one; on a 124-card
         portfolio a double-width item just breaks the rhythm. */
      wide: false,
      /* Stagger reads as intentional across six cards. Across 124 it
         reads as a page that will not finish loading. */
      stagger: false,
      actions: [
        { label: 'Request Details',  href: whatsappUrl(listingMessage(listing)), primary: true },
        { label: 'Schedule Viewing', href: whatsappUrl(viewingMessage(listing)) },
      ],
    });
  };

  const renderListings = listings => {
    try {
      if (typeof (window.Lumina && window.Lumina.buildPropertyCard) !== 'function') {
        throw new Error('property-card.js did not load');
      }
      if (!listings.length) {
        const empty = document.createElement('div');
        empty.className = 'listing-error';
        empty.textContent = 'No properties match these filters.';
        grid.replaceChildren(empty);
      } else {
        grid.replaceChildren(...listings.map(createListingCard));
        /* Filtering replaces the whole grid, so reveal and tilt have to
           be re-bound every render, not just on first paint. */
        window.Lumina.activateCards(grid);
      }
      if (count) count.textContent = String(listings.length);
    } catch (err) {
      console.error('Lumina renderListings error:', err);
      showFallback(err.message);
    }
  };

  const showFallback = (detail) => {
    console.error('Lumina listings fallback triggered:', detail || 'unknown');
    const message = document.createElement('div');
    message.className = 'listing-error';
    message.textContent = 'Portfolio is temporarily unavailable. Please try again later.';
    grid.replaceChildren(message);
    if (count) count.textContent = '0';
  };

  const activeType = () => {
    const pill = document.querySelector('.type-pill.active');
    return (pill && pill.getAttribute('data-type')) || 'all';
  };

  /* Every footer on the site links to listings.html?type=villa,
     ?location=abdoun and so on. Nothing read those parameters, so all
     of them landed on the unfiltered page — the links looked like
     filters and behaved like a plain link to the portfolio. */
  const applyUrlFilters = listings => {
    const q = new URLSearchParams(window.location.search);

    const type = (q.get('type') || '').trim().toLowerCase();
    if (type) {
      const pill = [...document.querySelectorAll('.type-pill')]
        .find(p => (p.getAttribute('data-type') || '').toLowerCase() === type);
      if (pill) {
        document.querySelectorAll('.type-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
      }
    }

    /* Match loosely: the links are slugs ("dair-ghbar", "um-uthaina")
       while the data holds display names ("Dair Ghbar"). */
    const loc = (q.get('location') || '').trim().toLowerCase().replace(/[-_]+/g, ' ');
    if (loc) {
      const sel = document.getElementById('filter-location');
      const match = [...(sel ? sel.options : [])]
        .find(o => o.value && o.value.toLowerCase().replace(/[-_]+/g, ' ') === loc);
      if (sel && match) sel.value = match.value;
    }

    const budget = (q.get('budget') || '').trim();
    const bsel = document.getElementById('filter-budget');
    if (budget && bsel && [...bsel.options].some(o => o.value === budget)) bsel.value = budget;
  };

  const applyFilters = () => {
    let list = allListings.slice();
    const type = activeType();
    if (type && type !== 'all') {
      list = list.filter(l => safeText(l.property_type).toLowerCase().includes(type.toLowerCase()));
    }
    const locSel = document.getElementById('filter-location');
    const loc = locSel && locSel.value ? locSel.value.trim() : '';
    if (loc) {
      list = list.filter(l =>
        safeText(l.location).toLowerCase().includes(loc.toLowerCase()) ||
        safeText(l.location_area).toLowerCase().includes(loc.toLowerCase())
      );
    }
    const budgetSel = document.getElementById('filter-budget');
    const budget = budgetSel && budgetSel.value ? budgetSel.value : '';
    if (budget) {
      list = list.filter(l => {
        const isRent = /rent/i.test(safeText(l.transaction));
        const isSale = /sale/i.test(safeText(l.transaction));
        if (budget === 'for-sale') return isSale;

        const p = Number(l.price_jod_raw);
        /* A rate per m² is not comparable with an annual rent, and a
           figure held back for review is not comparable with anything.
           Either way it cannot answer a budget question. */
        if (!Number.isFinite(p) || l.needs_price_review || l.price_unit === 'per_sqm') return false;

        switch (budget) {
          case 'rent-under-10k':  return isRent && p < 10000;
          case 'rent-10-15k':     return isRent && p >= 10000 && p < 15000;
          case 'rent-15-20k':     return isRent && p >= 15000 && p < 20000;
          case 'rent-20-30k':     return isRent && p >= 20000 && p < 30000;
          case 'rent-30k-plus':   return isRent && p >= 30000;
          default: return true;
        }
      });
    }
    renderListings(list);
  };

  const populateLocations = listings => {
    const sel = document.getElementById('filter-location');
    if (!sel) return;
    /* Count as we go, so the filter says how much is behind each option
       rather than offering an area with one listing as an equal choice. */
    const counts = new Map();
    listings.forEach(l => {
      const k = safeText(l.location).trim();
      if (k) counts.set(k, (counts.get(k) || 0) + 1);
    });
    const locs = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));

    const current = sel.value;
    sel.innerHTML = '<option value="">All areas</option>';
    locs.forEach(([loc, n]) => {
      const opt = document.createElement('option');
      opt.value = loc;
      opt.textContent = `${loc} (${n})`;
      sel.appendChild(opt);
    });
    if (current) sel.value = current;
  };

  if (grid) {
    /* Relative, not root-absolute: a GitHub Pages project deploy serves
       this from /lumina/, where a leading slash 404s. */
    fetch('data/lumina-demo-leads.json')
      .then(response => {
        if (!response.ok) throw new Error('HTTP ' + response.status);
        return response.json();
      })
      .then(data => {
        if (!Array.isArray(data)) throw new Error('Data is not an array');
        allListings = data;
        populateLocations(data);
        /* After populateLocations, so the location option a deep link
           asks for exists to be selected. */
        applyUrlFilters(data);
        applyFilters();
      })
      .catch(err => showFallback(err.message));
  } else {
    console.error('Lumina: listings-grid element not found in DOM');
  }

  document.querySelectorAll('.type-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.type-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      applyFilters();
    });
  });

  const locSel = document.getElementById('filter-location');
  if (locSel) locSel.addEventListener('change', applyFilters);
  const budgetSel = document.getElementById('filter-budget');
  if (budgetSel) budgetSel.addEventListener('change', applyFilters);
})();
