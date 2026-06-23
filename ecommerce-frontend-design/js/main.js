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
