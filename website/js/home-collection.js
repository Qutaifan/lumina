// LUMINA — home collection
// Picks the featured slice of the Excel-imported inventory and renders
// it into the landing page grid.
//
// The card itself is built by js/property-card.js, which listings.js
// also uses — the featured six and the full portfolio are the same
// component, so they can only ever look and behave the same.

(function () {
  'use strict';

  const grid = document.getElementById('home-collection-grid');
  if (!grid) return;

  const DATA_URL = 'data/lumina-demo-leads.json';
  const FEATURED = 6;

  /* This used to be "every sale listing first, then the rest". That made
     sense when sales were the rare premium end, but the sale records are
     now the weakest on the site — several quote a rate per m² rather
     than a price, and four of them share the title "4th Circle Apartment
     for Sale". The shop window was three copies of the same card.
     Pick for variety and photography instead. */
  const pickFeatured = listings => {
    const ok = listings.filter(l =>
      (l.photo_count || 0) > 0 && l.image_url &&
      !l.needs_price_review && l.price_unit !== 'per_sqm');
    const pool = ok.length >= FEATURED ? ok : listings.filter(l => (l.photo_count || 0) > 0);

    const score = l =>
      (Number(l.photo_count) || 0) +
      (Number(l.size_sqm) > 0 ? 3 : 0) +
      (l.bedrooms ? 2 : 0) +
      (/villa|rooftop/i.test(l.property_type || '') ? 4 : 0);

    const ranked = [...pool].sort((a, b) => score(b) - score(a));

    /* One per title and one per area first, so six cards read as six
       properties rather than one property photographed six times. */
    const out = [], titles = new Set(), areas = new Set();
    for (const l of ranked) {
      if (out.length >= FEATURED) break;
      const t = String(l.title || '').toLowerCase();
      const a = String(l.location || '').toLowerCase();
      if (titles.has(t) || areas.has(a)) continue;
      titles.add(t); areas.add(a); out.push(l);
    }
    // relax the area rule if the portfolio is concentrated enough to need it
    for (const l of ranked) {
      if (out.length >= FEATURED) break;
      const t = String(l.title || '').toLowerCase();
      if (titles.has(t)) continue;
      titles.add(t); out.push(l);
    }
    return out.slice(0, FEATURED);
  };

  fetch(DATA_URL)
    .then(r => {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    })
    .then(data => {
      if (!Array.isArray(data) || !data.length) throw new Error('empty');
      const build = window.Lumina && window.Lumina.buildPropertyCard;
      if (typeof build !== 'function') throw new Error('property-card.js did not load');

      grid.replaceChildren(
        // the first card runs full width — it is the one with room for
        // a 16:9 cover, so it gets the best photograph of the six
        ...pickFeatured(data).map((l, i) => build(l, i, { wide: i === 0 }))
      );
      window.Lumina.activateCards(grid);
    })
    .catch(err => {
      console.error('Home collection load failed:', err);
      grid.innerHTML = `
        <p class="lede" style="grid-column:1/-1">
          Portfolio is loading slowly.
          <a href="listings.html" style="color:var(--gold);text-decoration:underline">View all properties →</a>
        </p>`;
    });
})();
