/* =============================================================
   main.js  —  Shared across ALL pages (index, listing, product, cart)
   Requirements covered:
     ✓ JavaScript-based search bar in header with live dropdown
     ✓ Mobile hamburger menu open / close
     ✓ Sticky header shadow on scroll
     ✓ Countdown timer (Deals section on home page)
     ✓ Newsletter form feedback
     ✓ Cart badge counter (reads localStorage)
     ✓ Toast notification utility
     ✓ Cart page renderer with image display  ← FIXED
============================================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* -----------------------------------------------------------
     1.  MOBILE HAMBURGER MENU
  ----------------------------------------------------------- */
  const hamburgerBtn    = document.getElementById('hamburgerBtn');
  const mobileMenu      = document.getElementById('mobileMenu');
  const closeMobileBtn  = document.getElementById('closeMobileMenu');
  const overlay         = document.getElementById('overlay');

  function openMenu() {
    mobileMenu?.classList.add('is-open');
    overlay?.classList.add('is-visible');
    hamburgerBtn?.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }
  function closeMenu() {
    mobileMenu?.classList.remove('is-open');
    overlay?.classList.remove('is-visible');
    hamburgerBtn?.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  hamburgerBtn?.addEventListener('click', openMenu);
  closeMobileBtn?.addEventListener('click', closeMenu);
  overlay?.addEventListener('click', closeMenu);

  /* -----------------------------------------------------------
     2.  STICKY HEADER — drop-shadow on scroll
  ----------------------------------------------------------- */
  const siteHeader = document.getElementById('siteHeader');
  window.addEventListener('scroll', () => {
    if (!siteHeader) return;
    siteHeader.style.boxShadow =
      window.scrollY > 10 ? '0 2px 14px rgba(0,0,0,0.09)' : '';
  }, { passive: true });

  /* -----------------------------------------------------------
     3.  COUNTDOWN TIMER  (used on index.html deals section)
  ----------------------------------------------------------- */
  const cdDays  = document.getElementById('cd-days');
  const cdHours = document.getElementById('cd-hours');
  const cdMins  = document.getElementById('cd-mins');
  const cdSecs  = document.getElementById('cd-secs');

  if (cdDays && cdHours && cdMins && cdSecs) {
    const STORAGE_KEY = 'dealCountdownTarget';
    let target = parseInt(localStorage.getItem(STORAGE_KEY), 10);
    if (!target || target < Date.now()) {
      target = Date.now() + 4 * 24 * 60 * 60 * 1000;
      localStorage.setItem(STORAGE_KEY, target);
    }

    function pad(n) { return String(n).padStart(2, '0'); }
    function tick() {
      const diff = target - Date.now();
      if (diff <= 0) {
        cdDays.textContent = cdHours.textContent =
        cdMins.textContent = cdSecs.textContent = '00';
        return;
      }
      cdDays.textContent  = pad(Math.floor(diff / 86400000));
      cdHours.textContent = pad(Math.floor((diff % 86400000) / 3600000));
      cdMins.textContent  = pad(Math.floor((diff % 3600000)  / 60000));
      cdSecs.textContent  = pad(Math.floor((diff % 60000)    / 1000));
    }
    tick();
    setInterval(tick, 1000);
  }

  /* -----------------------------------------------------------
     4.  SEARCH BAR — live autocomplete dropdown
  ----------------------------------------------------------- */
  const searchInput = document.querySelector('.search-form input[type="search"]');
  const searchForm  = document.querySelector('.search-form');

  const PRODUCT_CATALOGUE = [
    'Canon Camera EOS 2000, Black 10x zoom',
    'GoPro HERO6 4K Action Camera',
    'Headset for gaming with mic',
    'Smartwatch silver color modern',
    'Blue wallet for men leather',
    'Jeans bag for travel',
    'Mens Polo T-shirt Cotton Slim',
    'Apple Watch Series Space Gray',
    'Basketball Crew Socks Long',
    'Wireless keyboard and mouse combo',
    'USB-C hub 7-in-1 aluminium',
    'Portable Bluetooth speaker waterproof',
    'Running shoes lightweight breathable',
    'Sports water bottle stainless steel',
    'Laptop stand adjustable aluminium',
    'iPhone 14 Pro case leather',
    'Samsung Galaxy S22 screen protector',
    'Ring light 18 inch LED',
  ];

  if (searchInput && searchForm) {
    const dropdown = document.createElement('ul');
    dropdown.className = 'search-dropdown';
    dropdown.setAttribute('role', 'listbox');
    searchForm.appendChild(dropdown);

    function buildSuggestions(query) {
      dropdown.innerHTML = '';
      const q = query.trim().toLowerCase();
      if (!q) { dropdown.classList.remove('is-open'); return; }
      const hits = PRODUCT_CATALOGUE.filter(p => p.toLowerCase().includes(q)).slice(0, 7);
      if (!hits.length) { dropdown.classList.remove('is-open'); return; }
      hits.forEach(item => {
        const li = document.createElement('li');
        li.setAttribute('role', 'option');
        const i = item.toLowerCase().indexOf(q);
        li.innerHTML =
          item.slice(0, i) +
          '<strong>' + item.slice(i, i + q.length) + '</strong>' +
          item.slice(i + q.length);
        li.addEventListener('mousedown', () => {
          searchInput.value = item;
          dropdown.classList.remove('is-open');
        });
        dropdown.appendChild(li);
      });
      dropdown.classList.add('is-open');
    }

    searchInput.addEventListener('input',  e => buildSuggestions(e.target.value));
    searchInput.addEventListener('focus',  e => buildSuggestions(e.target.value));
    searchInput.addEventListener('blur',   ()  => setTimeout(() => dropdown.classList.remove('is-open'), 160));

    searchInput.addEventListener('keydown', e => {
      const items = [...dropdown.querySelectorAll('li')];
      const cur   = dropdown.querySelector('li.is-active');
      let idx     = items.indexOf(cur);
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        cur?.classList.remove('is-active');
        const next = items[idx + 1] ?? items[0];
        next?.classList.add('is-active');
        searchInput.value = next?.textContent ?? searchInput.value;
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        cur?.classList.remove('is-active');
        const prev = items[idx - 1] ?? items[items.length - 1];
        prev?.classList.add('is-active');
        searchInput.value = prev?.textContent ?? searchInput.value;
      } else if (e.key === 'Escape') {
        dropdown.classList.remove('is-open');
      }
    });

    searchForm.addEventListener('submit', e => {
      e.preventDefault();
      const q = searchInput.value.trim();
      if (q) {
        dropdown.classList.remove('is-open');
        showToast(`Searching for "${q}" …`);
      }
    });
  }

  /* -----------------------------------------------------------
     5.  NEWSLETTER FORM — feedback on submit
  ----------------------------------------------------------- */
  const newsletterForm = document.querySelector('.newsletter-form');
  newsletterForm?.addEventListener('submit', e => {
    e.preventDefault();
    const emailInput = newsletterForm.querySelector('input[type="email"]');
    showToast(`Subscribed! Welcome, ${emailInput?.value || 'reader'} 🎉`);
    emailInput && (emailInput.value = '');
  });

  /* -----------------------------------------------------------
     6.  CART BADGE — refresh counter from localStorage
  ----------------------------------------------------------- */
  refreshCartBadge();

  /* -----------------------------------------------------------
     7.  CART PAGE RENDER  (only runs if #cartItemsContainer exists)
  ----------------------------------------------------------- */
  if (document.getElementById('cartItemsContainer')) {
    renderCartPage();
  }
});


/* =============================================================
   SHARED UTILITIES  (called by listing.js, product.js, and cart page)
============================================================= */

/* ---- Cart helpers ---- */
function getCart() {
  try { return JSON.parse(localStorage.getItem('cart') || '[]'); }
  catch { return []; }
}

function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
  refreshCartBadge();
}

/*
 * addToCart(item)
 *
 * Required fields:  id, name, price
 * Optional fields:  qty, size, oldPrice, image   ← image was being lost before!
 *
 * FIX: image is now always stored; falls back to a placeholder if empty/missing.
 */
function addToCart(item) {
  if (!item || !item.id || !item.name || item.price == null) {
    console.warn('addToCart: missing required fields (id / name / price)', item);
    return;
  }

  const cart     = getCart();
  const existing = cart.find(c => c.id === item.id && c.size === (item.size || ''));

  if (existing) {
    existing.qty += item.qty || 1;
  } else {
    cart.push({
      id:       String(item.id),
      name:     item.name,
      price:    parseFloat(item.price)    || 0,
      oldPrice: parseFloat(item.oldPrice) || 0,
      qty:      item.qty                  || 1,
      size:     item.size                 || '',
      // ✅ KEY FIX: always persist the image URL
      image:    (item.image && String(item.image).trim() !== '')
                  ? item.image
                  : 'https://placehold.co/80x80?text=No+Image',
    });
  }

  saveCart(cart);
}

function removeFromCart(id, size = '') {
  const cart = getCart().filter(c => !(c.id === String(id) && c.size === size));
  saveCart(cart);
}

function updateCartQty(id, size = '', newQty) {
  if (newQty < 1) { removeFromCart(id, size); return; }
  const cart = getCart();
  const item = cart.find(c => c.id === String(id) && c.size === size);
  if (!item) return;
  item.qty = newQty;
  saveCart(cart);
}

function refreshCartBadge() {
  const total = getCart().reduce((s, i) => s + i.qty, 0);

  // Look for the cart button: first by id="cartBadge", then by text content
  let badge = document.getElementById('cartBadge');

  if (!badge) {
    const accountLinks = [...document.querySelectorAll('.account-link')];
    // Find whichever link mentions "cart"
    const cartBtn = accountLinks.find(el =>
      el.textContent.toLowerCase().includes('cart')
    ) || accountLinks[3];

    if (cartBtn) {
      cartBtn.style.position = 'relative';
      badge = cartBtn.querySelector('.cart-badge');
      if (!badge) {
        badge = document.createElement('span');
        badge.className = 'cart-badge';
        cartBtn.appendChild(badge);
      }
    }
  }

  if (badge) {
    badge.textContent   = total;
    badge.style.display = total > 0 ? 'flex' : 'none';
  }
}

/* ---- Wishlist helpers ---- */
function getWishlist() {
  try { return JSON.parse(localStorage.getItem('wishlist') || '[]'); }
  catch { return []; }
}
function saveWishlist(list) {
  localStorage.setItem('wishlist', JSON.stringify(list));
}

/* ---- Toast notification ---- */
function showToast(msg, type = 'success') {
  let box = document.getElementById('toastContainer');
  if (!box) {
    box = document.createElement('div');
    box.id = 'toastContainer';
    document.body.appendChild(box);
  }
  const t = document.createElement('div');
  t.className = `toast toast--${type}`;
  t.textContent = msg;
  box.appendChild(t);
  requestAnimationFrame(() => t.classList.add('is-visible'));
  setTimeout(() => {
    t.classList.remove('is-visible');
    setTimeout(() => t.remove(), 320);
  }, 3000);
}


/* =============================================================
   CART PAGE RENDERER
   ---------------------------------------------------------------
   Drop this into cart.html:

     <div id="cartEmpty"  style="display:none">Your cart is empty.</div>
     <div id="cartItemsContainer"></div>
     <div id="cartSummary">
       <p>Items: <span id="cartCount"></span></p>
       <p>Subtotal: <span id="cartSubtotal"></span></p>
       <p>Total: <strong id="cartTotal"></strong></p>
     </div>

   The function is called automatically when the page loads.
============================================================= */
function renderCartPage() {
  const container   = document.getElementById('cartItemsContainer');
  const emptyMsg    = document.getElementById('cartEmpty');
  const cartSummary = document.getElementById('cartSummary');
  if (!container) return;

  function draw() {
    const cart = getCart();
    container.innerHTML = '';

    // --- Empty state ---
    if (cart.length === 0) {
      if (emptyMsg)    emptyMsg.style.display    = 'block';
      if (cartSummary) cartSummary.style.display = 'none';
      return;
    }
    if (emptyMsg)    emptyMsg.style.display    = 'none';
    if (cartSummary) cartSummary.style.display = '';

    let subtotal = 0;

    cart.forEach(item => {
      subtotal += item.price * item.qty;

      // ✅ FIX: read stored image; fall back to placeholder if broken
      const imgSrc = (item.image && item.image.trim() !== '')
        ? item.image
        : 'https://placehold.co/80x80?text=No+Image';

      const row = document.createElement('div');
      row.className = 'cart-item';
      row.innerHTML = `
        <img
          src="${imgSrc}"
          alt="${item.name}"
          class="cart-item__img"
          onerror="this.src='https://placehold.co/80x80?text=No+Image'"
        />
        <div class="cart-item__info">
          <p class="cart-item__name">${item.name}</p>
          ${item.size ? `<p class="cart-item__size">Size: ${item.size}</p>` : ''}
          <p class="cart-item__price">$${item.price.toFixed(2)}</p>
        </div>
        <div class="cart-item__controls">
          <button class="qty-btn" data-action="dec" data-id="${item.id}" data-size="${item.size}">−</button>
          <span class="qty-val">${item.qty}</span>
          <button class="qty-btn" data-action="inc" data-id="${item.id}" data-size="${item.size}">+</button>
          <button class="cart-item__remove" data-id="${item.id}" data-size="${item.size}" title="Remove">🗑</button>
        </div>
        <p class="cart-item__line-total">$${(item.price * item.qty).toFixed(2)}</p>
      `;
      container.appendChild(row);
    });

    // Update summary
    const totalQty   = cart.reduce((s, i) => s + i.qty, 0);
    const subtotalEl = document.getElementById('cartSubtotal');
    const totalEl    = document.getElementById('cartTotal');
    const countEl    = document.getElementById('cartCount');

    if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    if (totalEl)    totalEl.textContent    = `$${subtotal.toFixed(2)}`;
    if (countEl)    countEl.textContent    = `${totalQty} item${totalQty !== 1 ? 's' : ''}`;

    // Wire quantity buttons
    container.querySelectorAll('.qty-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id   = btn.dataset.id;
        const size = btn.dataset.size || '';
        const c    = getCart().find(x => x.id === id && x.size === size);
        if (!c) return;
        updateCartQty(id, size, c.qty + (btn.dataset.action === 'inc' ? 1 : -1));
        draw();
      });
    });

    // Wire remove buttons
    container.querySelectorAll('.cart-item__remove').forEach(btn => {
      btn.addEventListener('click', () => {
        removeFromCart(btn.dataset.id, btn.dataset.size || '');
        showToast('Item removed from cart', 'info');
        draw();
      });
    });
  }

  draw();
}