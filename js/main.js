// =====================================================
// Mobile menu toggle
// =====================================================
const hamburgerBtn = document.getElementById('hamburgerBtn');
const closeMobileMenu = document.getElementById('closeMobileMenu');
const mobileMenu = document.getElementById('mobileMenu');
const overlay = document.getElementById('overlay');

function openMenu() {
  mobileMenu.classList.add('is-open');
  overlay.classList.add('is-visible');
  hamburgerBtn.setAttribute('aria-expanded', 'true');
}

function closeMenu() {
  mobileMenu.classList.remove('is-open');
  overlay.classList.remove('is-visible');
  hamburgerBtn.setAttribute('aria-expanded', 'false');
}

hamburgerBtn?.addEventListener('click', openMenu);
closeMobileMenu?.addEventListener('click', closeMenu);
overlay?.addEventListener('click', closeMenu);

// =====================================================
// Product gallery — thumbnail click swaps main image
// =====================================================
const mainProductImage = document.getElementById('mainProductImage');
const thumbs = document.querySelectorAll('.thumb');

thumbs.forEach((thumb) => {
  thumb.addEventListener('click', () => {
    const newSrc = thumb.getAttribute('data-img');
    if (mainProductImage && newSrc) {
      mainProductImage.setAttribute('src', newSrc);
    }
    thumbs.forEach((t) => t.classList.remove('is-active'));
    thumb.classList.add('is-active');
  });
});

// =====================================================
// Product tabs — Description / Reviews / Shipping / About seller
// =====================================================
const tabButtons = document.querySelectorAll('.tab-nav__item');
const tabPanels = document.querySelectorAll('.tab-panel');

tabButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    const target = btn.getAttribute('data-tab');

    tabButtons.forEach((b) => b.classList.remove('is-active'));
    tabPanels.forEach((p) => p.classList.remove('is-active'));

    btn.classList.add('is-active');
    document.getElementById('tab-' + target)?.classList.add('is-active');
  });
});

// =====================================================
// Deals countdown timer — counts down from current values
// =====================================================
const cdDays = document.getElementById('cd-days');
const cdHours = document.getElementById('cd-hours');
const cdMins = document.getElementById('cd-mins');
const cdSecs = document.getElementById('cd-secs');

if (cdDays && cdHours && cdMins && cdSecs) {
  // Deal end time: 4 days, 13 hours, 34 min, 56 sec from page load
  let remaining = (4 * 86400) + (13 * 3600) + (34 * 60) + 56;

  function pad(n) { return String(n).padStart(2, '0'); }

  function renderCountdown() {
    const days = Math.floor(remaining / 86400);
    const hours = Math.floor((remaining % 86400) / 3600);
    const mins = Math.floor((remaining % 3600) / 60);
    const secs = remaining % 60;
    cdDays.textContent = pad(days);
    cdHours.textContent = pad(hours);
    cdMins.textContent = pad(mins);
    cdSecs.textContent = pad(secs);
  }

  renderCountdown();
  setInterval(() => {
    if (remaining > 0) {
      remaining -= 1;
      renderCountdown();
    }
  }, 1000);
}

// =====================================================
// Sticky header shadow on scroll
// =====================================================
const header = document.getElementById('siteHeader');
window.addEventListener('scroll', () => {
  if (window.scrollY > 8) {
    header.style.boxShadow = '0 4px 14px rgba(0,0,0,0.06)';
  } else {
    header.style.boxShadow = 'none';
  }
});
