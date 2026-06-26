/* =============================================================
   main.js  —  Shared across ALL pages (index, listing, product)
   Requirements covered:
     ✓ JavaScript-based search bar in header (non-functional, styled only)
       → upgraded to live suggestion dropdown
     ✓ Mobile hamburger menu open / close
     ✓ Sticky header shadow on scroll
     ✓ Countdown timer (Deals section on home page)
     ✓ Newsletter form feedback
     ✓ Cart badge counter (reads localStorage)
     ✓ Toast notification utility (used by listing.js & product.js)
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
    // Target: 4 days from when the page first loads
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
         Task: "JavaScript-based search bar in the header"
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
    // Inject dropdown list
    const dropdown = document.createElement('ul');
    dropdown.className = 'search-dropdown';
    dropdown.setAttribute('role', 'listbox');
    searchForm.appendChild(dropdown);

    function buildSuggestions(query) {
      dropdown.innerHTML = '';
      const q = query.trim().toLowerCase();
      if (!q) { dropdown.classList.remove('is-open'); return; }

      const hits = PRODUCT_CATALOGUE
        .filter(p => p.toLowerCase().includes(q))
        .slice(0, 7);

      if (!hits.length) { dropdown.classList.remove('is-open'); return; }

      hits.forEach(item => {
        const li  = document.createElement('li');
        li.setAttribute('role', 'option');
        // Bold the matched portion
        const i   = item.toLowerCase().indexOf(q);
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

    // Keyboard navigation (↑ ↓ Esc)
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

    // Prevent real page reload in demo
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
});


/* =============================================================
   SHARED UTILITIES  (called by listing.js and product.js too)
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
function addToCart(item) {
  const cart     = getCart();
  const existing = cart.find(c => c.id === item.id && c.size === item.size);
  if (existing) {
    existing.qty += item.qty || 1;
  } else {
    cart.push({ ...item, qty: item.qty || 1 });
  }
  saveCart(cart);
}
function refreshCartBadge() {
  const total   = getCart().reduce((s, i) => s + i.qty, 0);
  // The "My cart" button is the 4th .account-link
  const cartBtn = document.querySelectorAll('.account-link')[3];
  if (!cartBtn) return;
  cartBtn.style.position = 'relative';
  let badge = cartBtn.querySelector('.cart-badge');
  if (!badge) {
    badge = document.createElement('span');
    badge.className = 'cart-badge';
    cartBtn.appendChild(badge);
  }
  badge.textContent   = total;
  badge.style.display = total > 0 ? 'flex' : 'none';
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
