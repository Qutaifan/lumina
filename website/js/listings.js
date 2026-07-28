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
        const p = Number(l.price_jod_raw);
        if (!Number.isFinite(p)) return false;
        const isRent = /rent/i.test(safeText(l.transaction));
        const isSale = /sale/i.test(safeText(l.transaction));
        switch (budget) {
          case 'rent-under-15k': return isRent && p < 15000;
          case 'rent-15-30k': return isRent && p >= 15000 && p <= 30000;
          case 'rent-30k-plus': return isRent && p > 30000;
          case 'sale-under-400k': return isSale && p < 400000;
          case 'sale-400-800k': return isSale && p >= 400000 && p <= 800000;
          case 'sale-800k-plus': return isSale && p > 800000;
          default: return true;
        }
      });
    }
    renderListings(list);
  };

  const populateLocations = listings => {
    const sel = document.getElementById('filter-location');
    if (!sel) return;
    const locs = [...new Set(listings.map(l => safeText(l.location).trim()).filter(Boolean))].sort();
    const current = sel.value;
    sel.innerHTML = '<option value="">All Locations</option>';
    locs.forEach(loc => {
      const opt = document.createElement('option');
      opt.value = loc;
      opt.textContent = loc;
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
