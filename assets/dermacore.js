/* ============================================================
   DERMACORE — Interactive JavaScript
   FAQ accordion, purchase toggle, gallery, sticky ATC
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {

  // ── FAQ Accordion ──
  const faqItems = document.querySelectorAll('.dc-faq__item');
  faqItems.forEach(function (item) {
    const question = item.querySelector('.dc-faq__question');
    if (!question) return;
    question.addEventListener('click', function () {
      const isOpen = item.classList.contains('open');
      // Close all
      faqItems.forEach(function (i) { i.classList.remove('open'); });
      // Open clicked (unless it was already open)
      if (!isOpen) { item.classList.add('open'); }
    });
  });

  // ── Purchase Toggle (One-Time vs Subscribe) ──
  const purchaseToggle = document.querySelector('.dc-purchase-toggle');
  if (purchaseToggle) {
    const options = purchaseToggle.querySelectorAll('.dc-purchase-toggle__option');
    const priceDisplay = document.querySelector('.dc-product-price-display');
    const stickyPrice = document.getElementById('stickyPrice');

    options.forEach(function (opt) {
      opt.addEventListener('click', function () {
        options.forEach(function (o) { o.classList.remove('active'); });
        opt.classList.add('active');

        const type = opt.getAttribute('data-purchase-type');
        const oneTimePrice = opt.closest('.dc-purchase-toggle').getAttribute('data-price-onetime') || 'R599.99';
        const subPrice = opt.closest('.dc-purchase-toggle').getAttribute('data-price-sub') || 'R499.99';

        const displayPrice = type === 'subscribe' ? subPrice : oneTimePrice;
        if (priceDisplay) { priceDisplay.textContent = displayPrice; }
        if (stickyPrice) { stickyPrice.textContent = displayPrice; }

        // Update hidden input for subscription vs one-time
        const hiddenInput = document.querySelector('#purchaseTypeInput');
        if (hiddenInput) { hiddenInput.value = type; }
      });
    });
  }

  // ── Product Image Gallery ──
  const thumbs = document.querySelectorAll('.dc-product__thumb');
  const mainImage = document.querySelector('.dc-product__main-image img');
  if (thumbs.length && mainImage) {
    thumbs.forEach(function (thumb) {
      thumb.addEventListener('click', function () {
        thumbs.forEach(function (t) { t.classList.remove('active'); });
        thumb.classList.add('active');
        const src = thumb.getAttribute('data-full-src') || thumb.querySelector('img')?.src;
        if (src) {
          mainImage.style.opacity = '0';
          setTimeout(function () {
            mainImage.src = src;
            mainImage.style.opacity = '1';
          }, 200);
        }
      });
    });
  }

  // ── Quantity Control ──
  const qtyValue = document.querySelector('.dc-qty-control__value');
  const qtyMinus = document.querySelector('.dc-qty-minus');
  const qtyPlus = document.querySelector('.dc-qty-plus');
  if (qtyValue && qtyMinus && qtyPlus) {
    qtyMinus.addEventListener('click', function () {
      let val = parseInt(qtyValue.textContent) || 1;
      if (val > 1) { qtyValue.textContent = val - 1; }
    });
    qtyPlus.addEventListener('click', function () {
      let val = parseInt(qtyValue.textContent) || 1;
      qtyValue.textContent = val + 1;
    });
  }

  // ── Sticky Add to Cart ──
  const stickyAtc = document.getElementById('stickyAtc');
  const productAtc = document.querySelector('.dc-product__atc-wrap');

  if (stickyAtc && productAtc) {
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) {
            stickyAtc.classList.add('visible');
            stickyAtc.setAttribute('aria-hidden', 'false');
          } else {
            stickyAtc.classList.remove('visible');
            stickyAtc.setAttribute('aria-hidden', 'true');
          }
        });
      },
      { threshold: 0, rootMargin: '-80px 0px 0px 0px' }
    );
    observer.observe(productAtc);
  }

  // ── Add to Cart Form ──
  const addToCartForm = document.getElementById('addToCartForm');
  if (addToCartForm) {
    addToCartForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const btn = addToCartForm.querySelector('.dc-product__atc');
      const variantId = addToCartForm.querySelector('[name="id"]')?.value;
      const qty = parseInt(document.querySelector('.dc-qty-control__value')?.textContent) || 1;

      if (!variantId) {
        alert('Please select your options.');
        return;
      }

      if (btn) {
        btn.textContent = 'Adding...';
        btn.disabled = true;
      }

      fetch('/cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ id: variantId, quantity: qty }),
      })
        .then(function (res) {
          if (!res.ok) { throw new Error('Cart error'); }
          return res.json();
        })
        .then(function () {
          if (btn) {
            btn.textContent = 'Added ✓';
            btn.style.background = 'var(--navy)';
            setTimeout(function () {
              btn.textContent = 'Add to Routine';
              btn.style.background = '';
              btn.disabled = false;
            }, 2000);
          }
          // Update cart count
          return fetch('/cart.js');
        })
        .then(function (res) { return res.json(); })
        .then(function (cart) {
          const cartCount = document.querySelector('.dc-header__cart-count');
          if (cartCount) { cartCount.textContent = cart.item_count; }
        })
        .catch(function (err) {
          console.error('Cart error:', err);
          if (btn) {
            btn.textContent = 'Error — Try Again';
            btn.disabled = false;
          }
        });
    });
  }

  // ── Smooth scroll for anchor links ──
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = 80;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    });
  });

  // ── Header shadow on scroll ──
  const header = document.querySelector('.dc-header');
  if (header) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 20) {
        header.style.boxShadow = '0 4px 24px rgba(26,26,46,0.07)';
      } else {
        header.style.boxShadow = 'none';
      }
    }, { passive: true });
  }

  // ── Newsletter form ──
  const newsletterForms = document.querySelectorAll('.dc-newsletter__form');
  newsletterForms.forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const input = form.querySelector('.dc-newsletter__input');
      const btn = form.querySelector('.dc-newsletter__btn');
      if (!input?.value) return;
      if (btn) {
        btn.textContent = 'Subscribed ✓';
        btn.disabled = true;
      }
    });
  });

});
