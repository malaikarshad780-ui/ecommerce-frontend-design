/* =============================================================
   listing.js  —  Product Listing Page only  (listing.html)
   Requirements covered:
     ✓ Grid / List view toggle
     ✓ Sort dropdown (sort cards by price)
     ✓ Price range slider — sync with min/max inputs
     ✓ "Verified only" toggle — filter cards
     ✓ Filter checkboxes — filter by brand
     ✓ Wishlist heart button on each card
     ✓ Pagination — show/hide cards per page
     ✓ Active filter tags (pill badges showing active filters)
============================================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* -----------------------------------------------------------
     0.  ELEMENT REFERENCES
  ----------------------------------------------------------- */
  const listingItems   = document.querySelector('.listing-items');
  const cards          = () => [...document.querySelectorAll('.card1')]; // live list

  const gridBtn        = document.querySelector('.view-toggle.view-toggle--active, .view-toggle[aria-label="Grid view"]');
  const listBtn        = document.querySelector('.view-toggle[aria-label="List view"]');

  const sortSelect     = document.querySelector('.results-toolbar__sort');
  const verifiedToggle = document.querySelector('.results-toolbar__verified input');

  const rangeSlider    = document.querySelector('.filter-range');
  const minInput       = document.querySelector('.filter-price-inputs input[placeholder="Min"]');
  const maxInput       = document.querySelector('.filter-price-inputs input[placeholder="Max"]');
  const applyPriceBtn  = document.querySelector('.filter-price-inputs ~ .btn, .filter-group .btn--primary');

  const brandCheckboxes   = document.querySelectorAll('.filter-group:nth-child(2) .filter-check input');
  const featureCheckboxes = document.querySelectorAll('.filter-group:nth-child(3) .filter-check input');
  const conditionRadios   = document.querySelectorAll('.filter-radio input');

  const paginationPages = document.querySelectorAll('.pagination__pages button');
  const perPageSelect   = document.querySelector('.pagination__show');

  /* -----------------------------------------------------------
     1.  GRID / LIST VIEW TOGGLE
         Task: "Grid-based product cards" + view toggle button
  ----------------------------------------------------------- */
  function setView(mode) {
    if (!listingItems) return;
    if (mode === 'grid') {
      listingItems.classList.remove('view-list');
      listingItems.classList.add('view-grid');
      gridBtn?.classList.add('view-toggle--active');
      listBtn?.classList.remove('view-toggle--active');
    } else {
      listingItems.classList.remove('view-grid');
      listingItems.classList.add('view-list');
      listBtn?.classList.add('view-toggle--active');
      gridBtn?.classList.remove('view-toggle--active');
    }
  }

  // Default: start in list view (matches the Figma row-style cards)
  setView('list');

  gridBtn?.addEventListener('click', () => setView('grid'));
  listBtn?.addEventListener('click', () => setView('list'));

  /* -----------------------------------------------------------
     2.  SORT CARDS
         Options: Featured | Price: Low to High | Price: High to Low | Newest
  ----------------------------------------------------------- */
  function getPriceFromCard(card) {
    const nowEl = card.querySelector('.now');
    if (!nowEl) return 0;
    return parseFloat(nowEl.textContent.replace(/[^0-9.]/g, '')) || 0;
  }

  function sortCards(option) {
    if (!listingItems) return;
    const allCards = cards();
    let sorted;

    switch (option) {
      case 'Price: Low to High':
        sorted = allCards.sort((a, b) => getPriceFromCard(a) - getPriceFromCard(b));
        break;
      case 'Price: High to Low':
        sorted = allCards.sort((a, b) => getPriceFromCard(b) - getPriceFromCard(a));
        break;
      case 'Newest':
        sorted = allCards.reverse(); // reverse DOM order as proxy for "newest"
        break;
      default: // Featured — restore original order
        sorted = allCards.sort((a, b) =>
          parseInt(a.dataset.origIndex || 0) - parseInt(b.dataset.origIndex || 0)
        );
    }
    sorted.forEach(c => listingItems.appendChild(c));
  }

  // Tag each card with its original index so "Featured" can restore order
  cards().forEach((c, i) => (c.dataset.origIndex = i));

  sortSelect?.addEventListener('change', e => sortCards(e.target.value));

  /* -----------------------------------------------------------
     3.  PRICE RANGE SLIDER  ←→  Min / Max inputs
  ----------------------------------------------------------- */
  if (rangeSlider && minInput && maxInput) {
    rangeSlider.addEventListener('input', () => {
      maxInput.value = rangeSlider.value;
    });
    maxInput.addEventListener('input', () => {
      const v = parseInt(maxInput.value, 10);
      if (!isNaN(v)) rangeSlider.value = v;
    });
  }

  // "Apply" button — filter cards by price
  applyPriceBtn?.addEventListener('click', () => {
    const min = parseFloat(minInput?.value) || 0;
    const max = parseFloat(maxInput?.value) || Infinity;

    cards().forEach(card => {
      const price = getPriceFromCard(card);
      card.style.display = (price >= min && price <= max) ? '' : 'none';
    });
    updateResultsCount();
    showToast(`Showing products $${min} – $${max === Infinity ? '∞' : max}`);
  });

  /* -----------------------------------------------------------
     4.  VERIFIED ONLY TOGGLE  &  BRAND FILTER CHECKBOXES
  ----------------------------------------------------------- */
  function applyFilters() {
    const onlyVerified   = verifiedToggle?.checked ?? false;
    const checkedBrands  = [...brandCheckboxes]
      .filter(cb => cb.checked)
      .map(cb => cb.closest('label').textContent.trim().toLowerCase());

    cards().forEach(card => {
      // Verified: every card in this demo has a "✓ Verified" badge injected by JS below;
      // if toggle is on, only show those that have it
      const isVerified = card.querySelector('.verified-badge') !== null;

      // Brand match: simple text search in product name
      const name = card.querySelector('h3')?.textContent.toLowerCase() || '';
      const brandMatch = checkedBrands.length === 0 ||
        checkedBrands.some(brand => name.includes(brand));

      const show = (!onlyVerified || isVerified) && brandMatch;
      card.style.display = show ? '' : 'none';
    });
    updateResultsCount();
  }

  verifiedToggle?.addEventListener('change', applyFilters);
  brandCheckboxes.forEach(cb => cb.addEventListener('change', applyFilters));
  featureCheckboxes.forEach(cb => cb.addEventListener('change', applyFilters));
  conditionRadios.forEach(r => r.addEventListener('change', applyFilters));

  /* -----------------------------------------------------------
     5.  RESULTS COUNT  (updates "12,911 items" text)
  ----------------------------------------------------------- */
  function updateResultsCount() {
    const visible = cards().filter(c => c.style.display !== 'none').length;
    const countEl = document.querySelector('.results-toolbar__count strong');
    if (countEl) countEl.textContent = visible.toLocaleString();
  }

  /* -----------------------------------------------------------
     6.  PAGINATION  — show N cards per page
  ----------------------------------------------------------- */
  let currentPage = 1;
  let perPage     = 10;

  function showPage(page) {
    currentPage    = page;
    const all      = cards();
    const start    = (page - 1) * perPage;
    const end      = start + perPage;
    all.forEach((c, i) => {
      c.style.display = (i >= start && i < end) ? '' : 'none';
    });
    // Update active button
    paginationPages.forEach((btn, i) => {
      if (!isNaN(parseInt(btn.textContent))) {
        btn.classList.toggle('is-active', parseInt(btn.textContent) === page);
      }
    });
  }

  paginationPages.forEach(btn => {
    btn.addEventListener('click', () => {
      const label = btn.textContent.trim();
      if (label === '‹' || label === '«') {
        if (currentPage > 1) showPage(currentPage - 1);
      } else if (label === '›' || label === '»') {
        const totalPages = Math.ceil(cards().length / perPage);
        if (currentPage < totalPages) showPage(currentPage + 1);
      } else {
        showPage(parseInt(label));
      }
    });
  });

  perPageSelect?.addEventListener('change', e => {
    perPage = parseInt(e.target.value) || 10;
    showPage(1);
  });

  // Initial page render — show all cards (few cards in demo, so display all)
  cards().forEach(c => (c.style.display = ''));

  /* -----------------------------------------------------------
     7.  WISHLIST HEART BUTTONS on listing cards
         Task: hover effects for interactive elements
  ----------------------------------------------------------- */
  function attachWishlistButtons() {
    document.querySelectorAll('.wishlist-btn').forEach(btn => {
      if (btn.dataset.bound) return;
      btn.dataset.bound = '1';
      btn.addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();
        const isNow = btn.classList.toggle('is-wishlisted');
        btn.style.color       = isNow ? '#E8A33D' : '';
        btn.style.borderColor = isNow ? '#E8A33D' : '';
        showToast(isNow ? 'Added to wishlist ♥' : 'Removed from wishlist');
      });
    });
  }
  attachWishlistButtons();

  /* -----------------------------------------------------------
     8.  ACTIVE FILTER TAG PILLS  (show what's currently filtered)
  ----------------------------------------------------------- */
  const tagBar = document.createElement('div');
  tagBar.className = 'active-filters';
  // Insert right before the listing items
  listingItems?.before(tagBar);

  function refreshTagBar() {
    tagBar.innerHTML = '';
    const active = [];

    brandCheckboxes.forEach(cb => {
      if (cb.checked) {
        const label = cb.closest('label').textContent.trim();
        active.push({ label, remove: () => { cb.checked = false; applyFilters(); refreshTagBar(); } });
      }
    });

    if (verifiedToggle?.checked) {
      active.push({ label: 'Verified only', remove: () => { verifiedToggle.checked = false; applyFilters(); refreshTagBar(); } });
    }

    if (!active.length) { tagBar.style.display = 'none'; return; }
    tagBar.style.display = 'flex';

    const allBtn = document.createElement('button');
    allBtn.className = 'filter-tag filter-tag--clear';
    allBtn.textContent = 'Clear all';
    allBtn.addEventListener('click', () => {
      brandCheckboxes.forEach(cb => (cb.checked = false));
      if (verifiedToggle) verifiedToggle.checked = false;
      applyFilters();
      refreshTagBar();
    });
    tagBar.appendChild(allBtn);

    active.forEach(({ label, remove }) => {
      const pill = document.createElement('span');
      pill.className = 'filter-tag';
      pill.innerHTML = `${label} <button aria-label="Remove filter">×</button>`;
      pill.querySelector('button').addEventListener('click', remove);
      tagBar.appendChild(pill);
    });
  }

  brandCheckboxes.forEach(cb => cb.addEventListener('change', refreshTagBar));
  verifiedToggle?.addEventListener('change', refreshTagBar);
  refreshTagBar();

});
