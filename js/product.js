/* =============================================================
   product.js  —  Product Details Page only  (product.html)
============================================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* -----------------------------------------------------------
     1.  THUMBNAIL GALLERY
  ----------------------------------------------------------- */
  const mainImg   = document.getElementById('mainProductImage');
  const thumbBtns = document.querySelectorAll('.product-gallery__thumbs .thumb');

  thumbBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (mainImg && btn.dataset.img) {
        mainImg.style.opacity = '0';
        setTimeout(() => {
          mainImg.src         = btn.dataset.img;
          mainImg.alt         = btn.querySelector('img')?.alt || '';
          mainImg.style.opacity = '1';
        }, 160);
      }
      thumbBtns.forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
    });
  });
  if (mainImg) mainImg.style.transition = 'opacity 0.16s ease';

  /* -----------------------------------------------------------
     2.  TAB PANELS
  ----------------------------------------------------------- */
  const tabNavBtns = document.querySelectorAll('.tab-nav__item');
  const tabPanels  = document.querySelectorAll('.tab-panel');

  tabNavBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabNavBtns.forEach(b => b.classList.remove('is-active'));
      tabPanels.forEach(p  => p.classList.remove('is-active'));
      btn.classList.add('is-active');
      document.getElementById(`tab-${btn.dataset.tab}`)?.classList.add('is-active');
    });
  });

  /* -----------------------------------------------------------
     3.  SIZE SELECTOR
  ----------------------------------------------------------- */
  const sizeSelect = document.getElementById('sizeSelect');
  const sizePills  = document.querySelectorAll('.size-pill');

  sizePills.forEach(pill => {
    pill.addEventListener('click', () => {
      sizePills.forEach(p => p.classList.remove('is-active'));
      pill.classList.add('is-active');
      if (sizeSelect) sizeSelect.value = pill.dataset.size;
    });
  });

  sizeSelect?.addEventListener('change', () => {
    sizePills.forEach(p =>
      p.classList.toggle('is-active', p.dataset.size === sizeSelect.value)
    );
  });

  /* -----------------------------------------------------------
     4.  QUANTITY STEPPER
  ----------------------------------------------------------- */
  const qtyInput   = document.getElementById('qtyInput');
  const qtyDecrBtn = document.getElementById('qtyDecr');
  const qtyIncrBtn = document.getElementById('qtyIncr');

  qtyDecrBtn?.addEventListener('click', () => {
    const v = parseInt(qtyInput.value, 10);
    if (v > 1) qtyInput.value = v - 1;
  });
  qtyIncrBtn?.addEventListener('click', () => {
    qtyInput.value = parseInt(qtyInput.value, 10) + 1;
  });
  qtyInput?.addEventListener('change', () => {
    const v = parseInt(qtyInput.value, 10);
    if (isNaN(v) || v < 1) qtyInput.value = 1;
  });

  /* -----------------------------------------------------------
     5.  ADD TO CART
         KEY FIX: saves full item object including img, color,
         material, seller so cart.html can display everything
  ----------------------------------------------------------- */
  const addToCartBtn = document.getElementById('addToCartBtn');

  addToCartBtn?.addEventListener('click', () => {
    const size = sizeSelect?.value;
    const qty  = parseInt(qtyInput?.value, 10) || 1;

    if (!size) {
      showToast('Please select a size first.', 'error');
      sizeSelect?.focus();
      return;
    }

    /* Read the current main image so whatever thumbnail the
       user selected is what appears in the cart */
    const currentImg = mainImg?.src || 'assets/images/products/cloth/bitmap.png';

    addToCart({
      id:       'polo-tshirt-001',
      name:     'Mens Polo T-shirt Cotton Base Layer Slim Muscle',
      price:    98,
      size:     size,
      color:    'Blue',
      material: 'Cotton',
      seller:   'Artel Market',
      qty:      qty,
      Image:      currentImg,     /* ← uses whatever image is showing */
    });

    showToast(`✓ Added ${qty}× Size ${size} to cart!`);

    const original = addToCartBtn.textContent;
    addToCartBtn.textContent         = '✓ Added to Cart';
    addToCartBtn.style.background    = '#2BB36A';
    addToCartBtn.style.pointerEvents = 'none';
    setTimeout(() => {
      addToCartBtn.textContent         = original;
      addToCartBtn.style.background    = '';
      addToCartBtn.style.pointerEvents = '';
    }, 2200);
  });

  /* -----------------------------------------------------------
     6.  WISHLIST / SAVE FOR LATER
  ----------------------------------------------------------- */
  const saveLaterBtn = document.querySelector('.save-later');
  const PRODUCT_ID   = 'polo-tshirt-001';

  function isWishlisted() {
    return getWishlist().some(i => i.id === PRODUCT_ID);
  }
  function renderWishlistBtn() {
    if (!saveLaterBtn) return;
    if (isWishlisted()) {
      saveLaterBtn.textContent = '♥ Saved';
      saveLaterBtn.style.color = '#E8A33D';
    } else {
      saveLaterBtn.textContent = '♡ Save for later';
      saveLaterBtn.style.color = '';
    }
  }

  saveLaterBtn?.addEventListener('click', e => {
    e.preventDefault();
    let list = getWishlist();
    if (isWishlisted()) {
      list = list.filter(i => i.id !== PRODUCT_ID);
      saveWishlist(list);
      showToast('Removed from wishlist.');
    } else {
      list.push({
        id:    PRODUCT_ID,
        name:  'Mens Polo T-shirt Cotton Base Layer Slim Muscle',
        price: 98,
       image: mainImg?.src || 'assets/images/products/cloth/bitmap.png',
      showToast('Saved to wishlist ♥');
    }
    renderWishlistBtn();
  });
  renderWishlistBtn();

  /* -----------------------------------------------------------
     7.  SEND INQUIRY
  ----------------------------------------------------------- */
  const inquiryBtn = document.querySelector('.supplier-card .btn--primary');
  inquiryBtn?.addEventListener('click', () => {
    showToast('Inquiry sent to Guanjoi Trading LLC!');
    inquiryBtn.textContent      = '✓ Inquiry Sent';
    inquiryBtn.disabled         = true;
    inquiryBtn.style.background = '#2BB36A';
    setTimeout(() => {
      inquiryBtn.textContent      = 'Send inquiry';
      inquiryBtn.disabled         = false;
      inquiryBtn.style.background = '';
    }, 3500);
  });

  /* -----------------------------------------------------------
     8.  CUSTOMER REVIEWS — rendered dynamically
  ----------------------------------------------------------- */
  const reviewsPanel = document.getElementById('tab-reviews');
  if (reviewsPanel) {
    const REVIEWS = [
      { author: 'Ahmed K.',  rating: 5, date: 'May 2026', text: 'Great fabric quality, slim fit is true to size. Ordered 200 units — all arrived well-packed.' },
      { author: 'Sara M.',   rating: 4, date: 'Apr 2026', text: 'Good bulk deal. Slight colour variation in a few pieces but supplier fixed it quickly.' },
      { author: 'David L.',  rating: 5, date: 'Mar 2026', text: 'Fast shipping to UK. Excellent packaging. Already placed a second order.' },
      { author: 'Priya R.',  rating: 4, date: 'Feb 2026', text: 'Comfortable and durable. Minor stitching issue on 3/50 pcs but acceptable.' },
      { author: 'Carlos V.', rating: 5, date: 'Jan 2026', text: 'Top-notch quality for wholesale. Customisation service was easy and professional.' },
    ];
    const avg = (REVIEWS.reduce((s, r) => s + r.rating, 0) / REVIEWS.length).toFixed(1);

    function stars(n) {
      return Array.from({ length: 5 }, (_, i) =>
        `<span style="color:${i < Math.round(n) ? '#E8A33D' : '#ddd'}">★</span>`
      ).join('');
    }

    reviewsPanel.innerHTML = `
      <div style="display:flex;align-items:center;gap:18px;background:#F5F6F8;border-radius:8px;padding:18px 22px;margin-bottom:22px">
        <div style="font-size:44px;font-weight:700;color:#1A1A1A;line-height:1">${avg}</div>
        <div>
          <div style="font-size:20px;margin-bottom:4px">${stars(parseFloat(avg))}</div>
          <p style="font-size:12.5px;color:#767676">Based on ${REVIEWS.length} verified reviews</p>
        </div>
      </div>
      <div style="display:flex;flex-direction:column;gap:14px">
        ${REVIEWS.map(r => `
          <div style="border:1px solid #E5E7EB;border-radius:6px;padding:14px 18px;background:#fff">
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px;flex-wrap:wrap">
              <span style="font-weight:600;font-size:13.5px;color:#1A1A1A">${r.author}</span>
              <span style="font-size:14px">${stars(r.rating)}</span>
              <span style="font-size:12px;color:#767676;margin-left:auto">${r.date}</span>
            </div>
            <p style="font-size:13.5px;color:#333;line-height:1.65;margin:0">${r.text}</p>
          </div>
        `).join('')}
      </div>
    `;
  }

  /* -----------------------------------------------------------
     9.  HOVER EFFECTS on related product cards
  ----------------------------------------------------------- */
  document.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('mouseenter', () => { card.style.boxShadow = '0 8px 24px rgba(47,111,237,0.14)'; });
    card.addEventListener('mouseleave', () => { card.style.boxShadow = ''; });
  });

});