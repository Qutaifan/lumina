// LUMINA — home collection
// Renders featured portfolio cards from the Excel-imported inventory,
// using photos matched by reference number under /assets/listings/{ref}/
//
// Each card is a floating object: .rv → .depth → .lev → .card. Clicking
// one opens the gallery from js/property-viewer.js rather than navigating
// away; the overlay carries the link to the full particulars page.

(function () {
  'use strict';

  const grid = document.getElementById('home-collection-grid');
  if (!grid) return;

  const DATA_URL = 'data/lumina-demo-leads.json';
  const PLACEHOLDER = 'assets/images/hero-luxury-villa.jpg';
  const FEATURED = 6;

  /* Levitation params, one row per card. Hand-picked rather than random
     so the six never drift into sync — that unison pulse is the whole
     failure mode this table exists to avoid. */
  const FLOAT = [
    { d: 20, dur: 12.5, amp: 11, delay: 0,    rot: .30 },
    { d: 13, dur:  9.8, amp:  8, delay: -2.4, rot: .20 },
    { d: 17, dur: 14.2, amp: 13, delay: -5.1, rot: .26 },
    { d: 11, dur: 11.1, amp:  9, delay: -1.3, rot: .34 },
    { d: 22, dur: 13.4, amp: 12, delay: -3.7, rot: .18 },
    { d: 15, dur: 10.6, amp: 10, delay: -6.2, rot: .28 },
  ];

  const formatPrice = (value, transaction) => {
    const amount = Number(value);
    if (!Number.isFinite(amount)) return 'Price on request';
    const base = `${amount.toLocaleString('en-US')} JOD`;
    const tx = String(transaction || '').trim();
    return tx ? `${base} · ${tx}` : base;
  };

  const imgSrc = listing => {
    const src = (listing.image_url || '').trim();
    if (!src) return PLACEHOLDER;
    return src.startsWith('/') ? src.slice(1) : src;
  };

  const shotCount = listing => {
    const n = Array.isArray(listing.images) ? listing.images.length : 0;
    return n || Number(listing.photo_count) || 0;
  };

  const pickFeatured = listings => {
    const withPhotos = listings.filter(l => (l.photo_count || 0) > 0 && l.image_url);
    const pool = withPhotos.length ? withPhotos : listings;
    // Prefer variety: sale first, then rent; keep ref order otherwise
    const sale = pool.filter(l => /sale/i.test(l.transaction || ''));
    const rest = pool.filter(l => !/sale/i.test(l.transaction || ''));
    return [...sale, ...rest].slice(0, FEATURED);
  };

  const openFor = listing => {
    if (window.Lumina && typeof window.Lumina.openViewer === 'function') {
      window.Lumina.openViewer(listing);
    } else {
      // Viewer script missing or failed to parse — the details page is
      // still the honest destination, so degrade to it rather than to
      // a dead click.
      window.location.href = `property-details.html?id=${encodeURIComponent(listing.id)}`;
    }
  };

  const createCard = (listing, index) => {
    const f = FLOAT[index % FLOAT.length];

    /* Outer: grid item + scroll reveal. */
    const shell = document.createElement('div');
    shell.className = `prop-float rv${index === 0 ? ' wide' : ''}`;
    if (index > 0) shell.style.setProperty('--rvd', `${index * 90}ms`);

    /* Cursor parallax. */
    const depth = document.createElement('div');
    depth.className = 'depth';
    depth.style.setProperty('--d', `${f.d}px`);

    /* Levitation. Separate element on purpose — a CSS animation on the
       card itself would outrank the inline transform the tilt handler
       writes, and the tilt would silently stop working. */
    const lev = document.createElement('div');
    lev.className = 'lev';
    lev.style.setProperty('--dur',   `${f.dur}s`);
    lev.style.setProperty('--amp',   `${f.amp}px`);
    lev.style.setProperty('--delay', `${f.delay}s`);
    lev.style.setProperty('--rot',   `${f.rot}deg`);

    const article = document.createElement('article');
    article.className = 'card tilt';

    const spec = document.createElement('span');
    spec.className = 'spec';
    spec.setAttribute('aria-hidden', 'true');

    const media = document.createElement('div');
    media.className = 'card-media';
    const img = document.createElement('img');
    img.src = imgSrc(listing);
    img.alt = `${listing.title || 'Property'} — ${listing.location || listing.location_area || 'Amman'}`;
    img.loading = 'lazy';
    img.decoding = 'async';
    img.addEventListener('error', () => { img.src = PLACEHOLDER; }, { once: true });
    media.appendChild(img);

    const where = listing.location || listing.location_area || '';
    if (where) {
      const tag = document.createElement('span');
      tag.className = 'card-tag';
      tag.textContent = where;
      media.appendChild(tag);
    }

    const tx = String(listing.transaction || '').trim();
    if (tx) {
      const badge = document.createElement('span');
      badge.className = 'card-badge';
      badge.textContent = tx;
      media.appendChild(badge);
    }

    const shots = shotCount(listing);
    if (shots > 1) {
      const chip = document.createElement('span');
      chip.className = 'card-shots';
      chip.innerHTML =
        `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"
           stroke-linejoin="round" aria-hidden="true">
           <rect x="1.6" y="4.2" width="12.8" height="9.2" rx="2"/>
           <circle cx="8" cy="8.8" r="2.6"/><path d="M5.4 4.2l1-1.6h3.2l1 1.6"/>
         </svg><span>${shots} photos</span>`;
      media.appendChild(chip);
    }

    const body = document.createElement('div');
    body.className = 'card-body';

    const kicker = document.createElement('p');
    kicker.className = 'kicker';
    const parts = [
      listing.ref ? `Ref ${listing.ref}` : null,
      listing.location || null,
      listing.property_type || null,
    ].filter(Boolean);
    kicker.textContent = parts.join(' · ');

    const title = document.createElement('h3');
    title.className = 'display';
    title.textContent = listing.title || 'Residence';

    const specs = document.createElement('ul');
    specs.className = 'specs';
    const specItems = [];
    if (listing.size_sqm) specItems.push(`<li><span class="num">${Number(listing.size_sqm).toLocaleString('en-US')}</span> m²</li>`);
    if (listing.bedrooms) specItems.push(`<li><span class="num">${listing.bedrooms}</span> bedrooms</li>`);
    if (listing.bathrooms) specItems.push(`<li><span class="num">${listing.bathrooms}</span> baths</li>`);
    if (listing.floor) specItems.push(`<li>${listing.floor}</li>`);
    specs.innerHTML = specItems.join('') || '<li>Particulars on request</li>';

    const price = document.createElement('div');
    price.className = 'price';
    const priceVal = listing.price_jod_test_margin != null ? listing.price_jod_test_margin : listing.price_jod_raw;
    const amount = document.createElement('b');
    amount.className = 'num';
    amount.textContent = formatPrice(priceVal, listing.transaction);

    const view = document.createElement('button');
    view.type = 'button';
    view.className = 'view-btn';
    view.setAttribute('aria-label', `View property — ${listing.title || 'Residence'}`);
    view.innerHTML = `
      <span>View property</span>
      <span class="arrow" aria-hidden="true">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 8h10M9 4l4 4-4 4"/></svg>
      </span>`;
    view.addEventListener('click', e => { e.stopPropagation(); openFor(listing); });

    price.append(amount, view);
    body.append(kicker, title, specs, price);
    article.append(spec, media, body);

    /* The whole card is a target too, but the button above is the one
       that carries the accessible name and the keyboard path. */
    article.style.cursor = 'pointer';
    article.addEventListener('click', () => openFor(listing));

    lev.appendChild(article);
    depth.appendChild(lev);
    shell.appendChild(depth);
    return shell;
  };

  fetch(DATA_URL)
    .then(r => {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    })
    .then(data => {
      if (!Array.isArray(data) || !data.length) throw new Error('empty');
      const featured = pickFeatured(data);
      grid.replaceChildren(...featured.map(createCard));
      // re-trigger scroll reveal + tilt now that the cards exist
      if (window.Lumina && typeof window.Lumina.refreshReveals === 'function') {
        window.Lumina.refreshReveals();
      } else {
        grid.querySelectorAll('.rv').forEach(el => el.classList.add('in'));
      }
      if (window.Lumina && typeof window.Lumina.bindTilt === 'function') {
        window.Lumina.bindTilt(grid);
      }
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
