/**
 * BELLESOGNO — shared logic used by shop.html and product.html
 * (index.html has its own simpler copy of the fetch pattern, since it
 * only needs config + a read-only product list, no cart.)
 */

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz0tnGbw7SW0b6qcnqTrvNZ0-7iH054sV29gbAEWbtTfsnKoNDZefU0I29OCvQYkOP4/exec';

const CART_KEY = 'bellesogno_cart';

function formatPrice(n) {
  return '৳' + Number(n).toLocaleString('en-IN');
}

// ── Fetching (fetch() first, JSONP fallback — same pattern as index.html) ──
function loadViaJsonp(action, onSuccess) {
  const callbackName = '__cb_' + action + '_' + Date.now();
  window[callbackName] = function (data) {
    onSuccess(data);
    delete window[callbackName];
    script.remove();
  };
  const script = document.createElement('script');
  script.src = APPS_SCRIPT_URL + '?action=' + action + '&callback=' + callbackName;
  script.onerror = () => console.error('[JSONP] Failed to load', action);
  document.body.appendChild(script);
}

function fetchProducts(onSuccess) {
  fetch(APPS_SCRIPT_URL + '?action=getProducts')
    .then(r => r.json())
    .then(data => {
      if (data && data.status === 'ok' && Array.isArray(data.data)) {
        onSuccess(data.data);
      } else {
        console.warn('[Products] Bad response:', data);
      }
    })
    .catch(() => {
      console.warn('[Products] fetch() blocked, falling back to JSONP');
      loadViaJsonp('getProducts', (data) => {
        if (data && data.status === 'ok' && Array.isArray(data.data)) {
          onSuccess(data.data);
        }
      });
    });
}

// ── Cart (stored in localStorage — no backend session on a static site) ──
// Shape: [{ productID, name, variantLabel, price, quantity }]
function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch (_) {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadge();
}

function addToCart(item) {
  const cart = getCart();
  // Same product + same variant already in cart? Bump the quantity instead
  // of adding a duplicate line.
  const existing = cart.find(c => c.productID === item.productID && c.variantLabel === item.variantLabel);
  if (existing) {
    existing.quantity += item.quantity;
  } else {
    cart.push(item);
  }
  saveCart(cart);
}

function removeFromCart(productID, variantLabel) {
  const cart = getCart().filter(c => !(c.productID === productID && c.variantLabel === variantLabel));
  saveCart(cart);
}

function getCartCount() {
  return getCart().reduce((sum, item) => sum + item.quantity, 0);
}

function updateCartBadge() {
  const badge = document.getElementById('cartBadge');
  if (!badge) return;
  const count = getCartCount();
  badge.textContent = count;
  badge.style.display = count > 0 ? 'flex' : 'none';
}

document.addEventListener('DOMContentLoaded', updateCartBadge);
