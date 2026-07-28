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

  const pickFeatured = listings => {
    const withPhotos = listings.filter(l => (l.photo_count || 0) > 0 && l.image_url);
    const pool = withPhotos.length ? withPhotos : listings;
    // Prefer variety: sale first, then rent; keep ref order otherwise
    const sale = pool.filter(l => /sale/i.test(l.transaction || ''));
    const rest = pool.filter(l => !/sale/i.test(l.transaction || ''));
    return [...sale, ...rest].slice(0, FEATURED);
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
