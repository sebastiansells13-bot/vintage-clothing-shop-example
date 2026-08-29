/**
 * Cart state (localStorage-backed) + a self-contained shipping estimator.
 *
 * No backend, no payment processor — this is a fully functional cart and a
 * genuinely-computed shipping estimate, but "Place Order" on the checkout
 * page is a labeled demo, not a real charge. Swap that one step for a real
 * payment processor (Stripe Checkout, Square, etc.) for a live store; the
 * cart/shipping logic here needs no changes to keep working alongside it.
 *
 * Depends on `window.PRODUCTS` and `window.SHOP_CONFIG`, both defined by
 * products-data.js (loaded before this file).
 */
(function () {
  "use strict";

  var CART_KEY = "rr_cart";

  function getCart() {
    try {
      var raw = window.localStorage.getItem(CART_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  function saveCart(cart) {
    try {
      window.localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch (e) {
      // Storage unavailable (private browsing, disabled storage, etc.) —
      // the cart simply won't persist across page loads.
    }
  }

  function findProduct(id) {
    var products = window.PRODUCTS || [];
    for (var i = 0; i < products.length; i++) {
      if (products[i].id === id) return products[i];
    }
    return null;
  }

  function addToCart(id, qty) {
    var cart = getCart();
    cart[id] = (cart[id] || 0) + (qty || 1);
    saveCart(cart);
    renderCartCount();
  }

  function setQuantity(id, qty) {
    var cart = getCart();
    if (qty <= 0) {
      delete cart[id];
    } else {
      cart[id] = qty;
    }
    saveCart(cart);
    renderCartCount();
  }

  function removeFromCart(id) {
    setQuantity(id, 0);
  }

  function getCartItems() {
    var cart = getCart();
    var items = [];
    Object.keys(cart).forEach(function (id) {
      var product = findProduct(id);
      if (!product) return; // product removed from catalog since it was added
      items.push({
        product: product,
        quantity: cart[id],
        lineTotal: Math.round(product.price * cart[id] * 100) / 100,
      });
    });
    return items;
  }

  function getCartTotals(items) {
    var subtotal = 0;
    var weight = 0;
    items.forEach(function (item) {
      subtotal += item.lineTotal;
      weight += item.product.weight * item.quantity;
    });
    return {
      subtotal: Math.round(subtotal * 100) / 100,
      weight: Math.round(weight * 100) / 100,
      count: items.reduce(function (sum, i) { return sum + i.quantity; }, 0),
    };
  }

  // --- Shipping estimator -------------------------------------------------
  // A deterministic, self-contained estimate: a weight-based rate band plus
  // a small per-zone surcharge simulating carrier zone pricing (distance
  // between the shop's origin zip and the destination zip's leading digit).
  // This is NOT a live carrier rate lookup — replace with a real carrier API
  // (USPS/UPS/FedEx) for exact production rates.

  function estimateZone(originZip, destZip) {
    if (!/^\d{5}$/.test(destZip)) return 8; // non-US / malformed -> farthest zone
    var o = parseInt(originZip.charAt(0), 10);
    var d = parseInt(destZip.charAt(0), 10);
    var diff = Math.abs(o - d);
    return Math.min(Math.max(diff, 1), 8);
  }

  function calculateShipping(destZip, totalWeight, subtotal) {
    var config = window.SHOP_CONFIG || { originZip: "00000", freeShippingThreshold: Infinity };

    if (subtotal >= config.freeShippingThreshold) {
      return {
        cost: 0,
        detail: "Free shipping — order over $" + config.freeShippingThreshold.toFixed(2),
      };
    }
    if (!/^\d{5}$/.test(destZip)) {
      return { cost: null, detail: "Enter a 5-digit US zip code to estimate shipping." };
    }
    if (totalWeight <= 0) {
      return { cost: 0, detail: "—" };
    }

    var base;
    if (totalWeight <= 1) base = 4.99;
    else if (totalWeight <= 3) base = 7.99;
    else if (totalWeight <= 5) base = 11.99;
    else base = 11.99 + (totalWeight - 5) * 1.5;

    var zone = estimateZone(config.originZip, destZip);
    var zoneSurcharge = (zone - 1) * 0.4;
    var cost = Math.round((base + zoneSurcharge) * 100) / 100;

    return {
      cost: cost,
      detail: "Zone " + zone + " · " + totalWeight.toFixed(1) + " lb estimated",
    };
  }

  // --- Rendering ------------------------------------------------------------

  function formatMoney(n) {
    return "$" + n.toFixed(2);
  }

  // Root-relative product image paths (e.g. "/img/products/comics.jpg") are
  // correct as written in HTML that Eleventy renders at build time — its
  // html-base-plugin rewrites them for the deployed pathPrefix automatically.
  // But images inserted here via innerHTML are runtime DOM, invisible to
  // that build-time rewrite, so they need window.SITE_BASE prepended
  // manually (see products-data.njk) or they'd 404 under a subpath deploy.
  function assetUrl(path) {
    return (window.SITE_BASE || "") + path;
  }

  function renderCartCount() {
    var el = document.getElementById("cart-count");
    if (!el) return;
    var items = getCartItems();
    var totals = getCartTotals(items);
    el.textContent = totals.count > 0 ? String(totals.count) : "";
    el.hidden = totals.count === 0;
  }

  function wireAddToCartButtons() {
    var buttons = document.querySelectorAll("[data-add-to-cart]");
    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        addToCart(btn.getAttribute("data-add-to-cart"), 1);
        var original = btn.textContent;
        btn.textContent = "Added ✓";
        btn.disabled = true;
        setTimeout(function () {
          btn.textContent = original;
          btn.disabled = false;
        }, 1200);
      });
    });
  }

  function renderCartPage() {
    var itemsEl = document.getElementById("cart-items");
    var emptyEl = document.getElementById("cart-empty");
    var summaryEl = document.getElementById("cart-summary");
    if (!itemsEl) return; // not on the cart page

    var items = getCartItems();

    if (items.length === 0) {
      itemsEl.hidden = true;
      if (summaryEl) summaryEl.hidden = true;
      if (emptyEl) emptyEl.hidden = false;
      return;
    }

    if (emptyEl) emptyEl.hidden = true;
    itemsEl.hidden = false;
    if (summaryEl) summaryEl.hidden = false;

    itemsEl.innerHTML = "";
    items.forEach(function (item) {
      var row = document.createElement("div");
      row.className = "cart-row";
      row.innerHTML =
        '<img src="' + assetUrl(item.product.image) + '" alt="" class="cart-row__image">' +
        '<div class="cart-row__body">' +
        "<h3>" + item.product.title + "</h3>" +
        '<p class="cart-row__meta">' +
        (item.product.size ? "Size " + item.product.size + " · " : "") +
        item.product.condition + " · " + formatMoney(item.product.price) + " each</p>" +
        "</div>" +
        '<div class="cart-row__qty">' +
        '<button type="button" data-qty-decrease>−</button>' +
        '<span>' + item.quantity + '</span>' +
        '<button type="button" data-qty-increase>+</button>' +
        "</div>" +
        '<p class="cart-row__total">' + formatMoney(item.lineTotal) + '</p>' +
        '<button type="button" class="cart-row__remove" data-remove aria-label="Remove">✕</button>';

      row.querySelector("[data-qty-decrease]").addEventListener("click", function () {
        setQuantity(item.product.id, item.quantity - 1);
        renderCartPage();
      });
      row.querySelector("[data-qty-increase]").addEventListener("click", function () {
        setQuantity(item.product.id, item.quantity + 1);
        renderCartPage();
      });
      row.querySelector("[data-remove]").addEventListener("click", function () {
        removeFromCart(item.product.id);
        renderCartPage();
      });

      itemsEl.appendChild(row);
    });

    var totals = getCartTotals(items);
    setText("cart-subtotal", formatMoney(totals.subtotal));
    setText("cart-weight", totals.weight.toFixed(1) + " lb");

    var zipInput = document.getElementById("shipping-zip");
    var shippingResultEl = document.getElementById("shipping-result");
    var grandTotalEl = document.getElementById("cart-grand-total");
    var checkoutLink = document.getElementById("checkout-link");

    function updateShipping() {
      var zip = zipInput ? zipInput.value.trim() : "";
      var result = calculateShipping(zip, totals.weight, totals.subtotal);
      if (shippingResultEl) shippingResultEl.textContent = result.detail;
      if (result.cost !== null && grandTotalEl) {
        grandTotalEl.textContent = formatMoney(totals.subtotal + result.cost);
        if (checkoutLink) checkoutLink.setAttribute("aria-disabled", "false");
      } else if (grandTotalEl) {
        grandTotalEl.textContent = "—";
      }
    }

    var calcBtn = document.getElementById("calc-shipping-btn");
    if (calcBtn) calcBtn.addEventListener("click", updateShipping);
    if (zipInput) {
      zipInput.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
          e.preventDefault();
          updateShipping();
        }
      });
    }
    updateShipping();
  }

  function renderCheckoutPage() {
    var itemsEl = document.getElementById("checkout-items");
    if (!itemsEl) return; // not on the checkout page

    var items = getCartItems();
    var emptyEl = document.getElementById("checkout-empty");
    var formEl = document.getElementById("checkout-form");

    if (items.length === 0) {
      if (emptyEl) emptyEl.hidden = false;
      if (formEl) formEl.hidden = true;
      return;
    }
    if (emptyEl) emptyEl.hidden = true;
    if (formEl) formEl.hidden = false;

    itemsEl.innerHTML = "";
    items.forEach(function (item) {
      var row = document.createElement("li");
      row.textContent = item.quantity + " × " + item.product.title + " — " + formatMoney(item.lineTotal);
      itemsEl.appendChild(row);
    });

    var totals = getCartTotals(items);
    setText("checkout-subtotal", formatMoney(totals.subtotal));

    var zipInput = document.getElementById("checkout-zip");
    var shippingEl = document.getElementById("checkout-shipping");
    var totalEl = document.getElementById("checkout-total");
    var placeOrderBtn = document.getElementById("place-order-btn");

    function currentShipping() {
      var zip = zipInput ? zipInput.value.trim() : "";
      return calculateShipping(zip, totals.weight, totals.subtotal);
    }

    function updateTotals() {
      var result = currentShipping();
      if (shippingEl) shippingEl.textContent = result.cost !== null ? formatMoney(result.cost) + " (" + result.detail + ")" : result.detail;
      if (totalEl) totalEl.textContent = result.cost !== null ? formatMoney(totals.subtotal + result.cost) : "—";
      if (placeOrderBtn) placeOrderBtn.disabled = result.cost === null;
    }

    if (zipInput) zipInput.addEventListener("input", updateTotals);
    updateTotals();

    if (placeOrderBtn) {
      placeOrderBtn.addEventListener("click", function () {
        var result = currentShipping();
        if (result.cost === null) return;
        saveCart({}); // clear cart — this is a simulated order
        renderCartCount();
        if (formEl) formEl.hidden = true;
        var confirmEl = document.getElementById("order-confirmation");
        if (confirmEl) confirmEl.hidden = false;
      });
    }
  }

  function setText(id, text) {
    var el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  document.addEventListener("DOMContentLoaded", function () {
    renderCartCount();
    wireAddToCartButtons();
    renderCartPage();
    renderCheckoutPage();
  });
})();
