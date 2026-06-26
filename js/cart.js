/* =============================================================
   cart.js  —  Cart Page only  (cart.html)
   Renders items from localStorage into #cartItemsList
   Updates order summary totals
   Handles qty change, remove, remove-all, coupon, wishlist
============================================================= */

document.addEventListener('DOMContentLoaded', () => {

  const cartItemsList  = document.getElementById('cartItemsList');
  const cartEmpty      = document.getElementById('cartEmpty');
  const cartBox        = document.getElementById('cartBox');
  const cartTitle      = document.getElementById('cartTitle');
  const removeAllBtn   = document.getElementById('removeAllBtn');

  const summarySubtotal = document.getElementById('summarySubtotal');
  const summaryDiscount = document.getElementById('summaryDiscount');
  const summaryTax      = document.getElementById('summaryTax');
  const summaryTotal    = document.getElementById('summaryTotal');

  const couponInput    = document.getElementById('couponInput');
  const applyCouponBtn = document.getElementById('applyCouponBtn');
  const checkoutBtn    = document.getElementById('checkoutBtn');

  const savedSection   = document.getElementById('savedSection');
  const savedGrid      = document.getElementById('savedGrid');

  let discountAmount = 0;

  /* -----------------------------------------------------------
     MAIN RENDER
  ----------------------------------------------------------- */
  function renderCart() {
    const cart = getCart();
    cartItemsList.innerHTML = '';

    if (cart.length === 0) {
      cartEmpty.style.display = 'block';
      cartBox.style.display   = 'none';
      updateTitle(0);
      updateSummary(0);
      return;
    }

    cartEmpty.style.display = 'none';
    cartBox.style.display   = '';

    cart.forEach(item => {
      // ✅ Always show image — use stored one or fallback placeholder
      const imgSrc = (item.image && item.image.trim() !== '')
        ? item.image
        : 'https://placehold.co/80x80?text=No+Image';

      const row = document.createElement('div');
      row.className = 'cart-item';
      row.dataset.id   = item.id;
      row.dataset.size = item.size || '';

      row.innerHTML = `
        <img
          class="cart-item__img"
          src="${imgSrc}"
          alt="${item.name}"
          onerror="this.src='https://placehold.co/80x80?text=No+Image'"
        />

        <div class="cart-item__info">
          <p class="cart-item__name">${item.name}</p>
          <p class="cart-item__meta">
            ${item.size  ? `<span>Size: <b>${item.size}</b></span>` : ''}
            ${item.color ? `<span>Color: <b>${item.color}</b></span>` : ''}
          </p>
          <div class="cart-item__actions">
            <button class="cart-item__remove" data-id="${item.id}" data-size="${item.size || ''}">Remove</button>
            <button class="cart-item__save"   data-id="${item.id}" data-name="${item.name}" data-price="${item.price}" data-img="${imgSrc}">Save for later</button>
          </div>
        </div>

        <div class="cart-item__right">
          <p class="cart-item__price">$${(item.price * item.qty).toFixed(2)}</p>
          <div class="cart-qty">
            <button class="cart-qty__btn" data-action="dec" data-id="${item.id}" data-size="${item.size || ''}">−</button>
            <input  class="cart-qty__input" type="number" min="1" value="${item.qty}" data-id="${item.id}" data-size="${item.size || ''}" />
            <button class="cart-qty__btn" data-action="inc" data-id="${item.id}" data-size="${item.size || ''}">+</button>
          </div>
        </div>
      `;

      cartItemsList.appendChild(row);
    });

    // Wire up buttons
    cartItemsList.querySelectorAll('.cart-qty__btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id   = btn.dataset.id;
        const size = btn.dataset.size || '';
        const c    = getCart().find(x => x.id === id && x.size === size);
        if (!c) return;
        const newQty = c.qty + (btn.dataset.action === 'inc' ? 1 : -1);
        updateCartQty(id, size, newQty);
        renderCart();
      });
    });

    cartItemsList.querySelectorAll('.cart-qty__input').forEach(input => {
      input.addEventListener('change', () => {
        const v = parseInt(input.value, 10);
        if (!isNaN(v) && v >= 1) {
          updateCartQty(input.dataset.id, input.dataset.size || '', v);
          renderCart();
        }
      });
    });

    cartItemsList.querySelectorAll('.cart-item__remove').forEach(btn => {
      btn.addEventListener('click', () => {
        removeFromCart(btn.dataset.id, btn.dataset.size || '');
        showToast('Item removed from cart', 'info');
        renderCart();
      });
    });

    cartItemsList.querySelectorAll('.cart-item__save').forEach(btn => {
      btn.addEventListener('click', () => {
        // Move item to wishlist
        const list = getWishlist();
        if (!list.find(i => i.id === btn.dataset.id)) {
          list.push({
            id:    btn.dataset.id,
            name:  btn.dataset.name,
            price: parseFloat(btn.dataset.price),
            image: btn.dataset.img,
          });
          saveWishlist(list);
        }
        removeFromCart(btn.dataset.id, btn.dataset.size || '');
        showToast('Saved for later ♥');
        renderCart();
        renderSaved();
      });
    });

    const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
    updateTitle(cart.reduce((s, i) => s + i.qty, 0));
    updateSummary(subtotal);
  }

  /* -----------------------------------------------------------
     SUMMARY
  ----------------------------------------------------------- */
  function updateTitle(count) {
    if (cartTitle) cartTitle.textContent = `My cart (${count})`;
  }

  function updateSummary(subtotal) {
    const tax   = subtotal * 0.01;
    const total = subtotal - discountAmount + tax;

    if (summarySubtotal) summarySubtotal.textContent = `$${subtotal.toFixed(2)}`;
    if (summaryDiscount) summaryDiscount.textContent = `- $${discountAmount.toFixed(2)}`;
    if (summaryTax)      summaryTax.textContent      = `+ $${tax.toFixed(2)}`;
    if (summaryTotal)    summaryTotal.textContent    = `$${Math.max(0, total).toFixed(2)}`;
  }

  /* -----------------------------------------------------------
     REMOVE ALL
  ----------------------------------------------------------- */
  removeAllBtn?.addEventListener('click', () => {
    if (!confirm('Remove all items from cart?')) return;
    saveCart([]);
    renderCart();
    showToast('Cart cleared', 'info');
  });

  /* -----------------------------------------------------------
     COUPON
  ----------------------------------------------------------- */
  const VALID_COUPONS = { 'SAVE10': 10, 'WELCOME5': 5, 'DEAL20': 20 };

  applyCouponBtn?.addEventListener('click', () => {
    const code = couponInput?.value.trim().toUpperCase();
    if (VALID_COUPONS[code]) {
      discountAmount = VALID_COUPONS[code];
      showToast(`Coupon applied! -$${discountAmount} discount 🎉`);
      const subtotal = getCart().reduce((s, i) => s + i.price * i.qty, 0);
      updateSummary(subtotal);
    } else {
      showToast('Invalid coupon code.', 'error');
    }
  });

  /* -----------------------------------------------------------
     CHECKOUT
  ----------------------------------------------------------- */
  checkoutBtn?.addEventListener('click', () => {
    if (getCart().length === 0) {
      showToast('Your cart is empty!', 'error');
      return;
    }
    showToast('Proceeding to checkout… 🚀');
  });

  /* -----------------------------------------------------------
     SAVED / WISHLIST SECTION
  ----------------------------------------------------------- */
  function renderSaved() {
    const list = getWishlist();
    if (!savedGrid || !savedSection) return;

    if (list.length === 0) {
      savedSection.style.display = 'none';
      return;
    }
    savedSection.style.display = '';
    savedGrid.innerHTML = '';

    list.forEach(item => {
      const imgSrc = (item.image && item.image.trim() !== '')
        ? item.image
        : 'https://placehold.co/140x140?text=No+Image';

      const card = document.createElement('div');
      card.className = 'saved-card';
      card.innerHTML = `
        <img class="saved-card__img" src="${imgSrc}" alt="${item.name}"
             onerror="this.src='https://placehold.co/140x140?text=No+Image'" />
        <div class="saved-card__body">
          <p class="saved-card__price">$${parseFloat(item.price).toFixed(2)}</p>
          <p class="saved-card__name">${item.name}</p>
          <button class="move-to-cart-btn" data-id="${item.id}">
            🛒 Move to cart
          </button>
        </div>
      `;

      card.querySelector('.move-to-cart-btn').addEventListener('click', () => {
        addToCart({ ...item, qty: 1 });
        const wl = getWishlist().filter(i => i.id !== item.id);
        saveWishlist(wl);
        showToast('Moved to cart!');
        renderCart();
        renderSaved();
      });

      savedGrid.appendChild(card);
    });
  }

  /* -----------------------------------------------------------
     INIT
  ----------------------------------------------------------- */
  renderCart();
  renderSaved();
});