
var PRODUCTS = [
  { id: 'p1', name: 'Samsung Galaxy S21', category: 'electronics', price: 45000, img: 's21ultra.jpg' },
  { id: 'p2', name: 'Samsung A12', category: 'electronics', price: 15000, img: 'sa12.jpg' },
  { id: 'p3', name: 'Blue T-Shirt', category: 'clothes', price: 1200, img: 'bltst.jpg' },
  { id: 'p4', name: 'Ladies Jacket', category: 'clothes', price: 3500, img: 'ldjckt.jpg' },
  { id: 'p5', name: 'Air Fryer 8L', category: 'home', price: 5300, img: 'airfr.jpg' },
  { id: 'p6', name: 'Bluetooth Speaker', category: 'electronics', price: 3500, img: 'blthtsp.jpg' },
  { id: 'p7', name: 'Samsung TV 43\"', category: 'electronics', price: 42000, img: 'stv.jpg' },
  { id: 'p8', name: 'Cookware Set', category: 'home', price: 2800, img: 'cookware.jpg' },
  { id: 'p9', name: ' Samsung S25 Ultra', category: 'electronics', price: 127000, img: 's25ultra.jpg' },
  { id: 'p10', name: 'Table top gas cooker', category: 'home', price: 2800, img: 'table top cooker.jpg' },
  { id: 'p11', name: 'Gilbeys gin', category: 'drinks', price: 1550, img: 'glbs.jpg' },
  { id: 'p12', name: 'markbook', category: 'electronics', price: 87210, img: 'mcbook.jpg' }

];

var LS_CART = 'demo_cart';
var LS_WISH = 'demo_wish';

// load state safely
var cart = [];
var wish = [];
try {
  cart = JSON.parse(localStorage.getItem(LS_CART) || '[]');
} catch (e) { cart = []; }
try {
  wish = JSON.parse(localStorage.getItem(LS_WISH) || '[]');
} catch (e) { wish = []; }

// DOM helpers
function qs(sel, root) {
  root = root || document;
  return root.querySelector(sel);
}
function qsa(sel, root) {
  root = root || document;
  var nodeList = root.querySelectorAll(sel);
  // convert NodeList to array
  return Array.prototype.slice.call(nodeList || []);
}
function el(tag, cls) {
  var e = document.createElement(tag);
  if (cls) { e.className = cls; }
  return e;
}


function initShared() {
  var searchInput = qs('#searchInput');
  var searchBtn = qs('#searchBtn');

  if (searchBtn && searchInput) {
    searchBtn.addEventListener('click', function () {
      var q = (searchInput.value || '').trim();
      var target = 'index.html' + (q ? '?q=' + encodeURIComponent(q) : '');
      window.location.href = target;
    });
    searchInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { searchBtn.click(); }
    });
  }

  // cat buttons on home
  var catBtns = qsa('.cat-btn');
  for (var i = 0; i < catBtns.length; i++) {
    (function (b) {
      b.addEventListener('click', function () {
        var cat = b.getAttribute('data-cat') || '';
        var target = 'index.html' + (cat && cat !== 'all' ? '?cat=' + encodeURIComponent(cat) : '');
        window.location.href = target;
      });
    })(catBtns[i]);
  }

  // category filters on categories page
  var catFilters = qsa('.cat-filter');
  for (i = 0; i < catFilters.length; i++) {
    (function (b) {
      b.addEventListener('click', function () {
        var cat = b.getAttribute('data-cat') || 'all';
        var grid = qs('#catGrid');
        if (grid) {
          var list = PRODUCTS.slice();
          if (cat !== 'all') {
            var filtered = [];
            for (var j = 0; j < list.length; j++) {
              if (list[j].category === cat) filtered.push(list[j]);
            }
            renderGrid(filtered, grid);
          } else {
            renderGrid(list, grid);
          }
        }
      });
    })(catFilters[i]);
  }

  //counts in header/footer
  updateCountsInDOM();
}

//product card and append to parent grid
function productCard(product, parent) {
  if (!parent || !product) return;
  var card = el('div', 'card');

  var heart = el('div', 'heart');
  heart.innerHTML = '❤';
  if (wish.indexOf(product.id) !== -1) {
    heart.className = heart.className + ' liked';
  }
  heart.addEventListener('click', function () {
    toggleWish(product.id, heart);
  });
  card.appendChild(heart);

  var img = el('img');
  img.alt = product.name;
  img.src = product.img || '#';
  card.appendChild(img);

  var title = el('div', 'title');
  title.textContent = product.name;
  card.appendChild(title);

  var price = el('div', 'price');
  price.textContent = 'KSh ' + (product.price || 0).toLocaleString();
  card.appendChild(price);

  var actions = el('div', 'actions');
  var add = el('button', 'btn-add');
  add.textContent = 'Add to cart';
  add.addEventListener('click', function () { addToCart(product.id); });
  var likeBtn = el('button', 'btn-like');
  likeBtn.textContent = 'Like';
  likeBtn.addEventListener('click', function () { toggleWish(product.id, heart); });

  actions.appendChild(add);
  actions.appendChild(likeBtn);
  card.appendChild(actions);

  parent.appendChild(card);
}

// render list into gridElement
function renderGrid(list, gridElement) {
  if (!gridElement) return;
  gridElement.innerHTML = '';
  if (!list || list.length === 0) {
    gridElement.innerHTML = '<p>No products found</p>';
    return;
  }
  for (var i = 0; i < list.length; i++) {
    productCard(list[i], gridElement);
  }
}

// toggle wishlist
function toggleWish(id, heartEl) {
  var idx = wish.indexOf(id);
  if (idx >= 0) {
    wish.splice(idx, 1);
    if (heartEl) { heartEl.className = heartEl.className.replace(/\bliked\b/, '').trim(); }
  } else {
    wish.push(id);
    if (heartEl) { heartEl.className = heartEl.className + ' liked'; }
  }
  try { localStorage.setItem(LS_WISH, JSON.stringify(wish)); } catch (e) {}
  updateCountsInDOM();
}

// render wishlist grid
function renderWishGrid() {
  var grid = qs('#wishGrid');
  if (!grid) return;
  grid.innerHTML = '';
  if (!wish || wish.length === 0) {
    grid.innerHTML = '<p>Your wishlist is empty</p>';
    return;
  }
  for (var i = 0; i < wish.length; i++) {
    var pid = wish[i];
    var p = null;
    for (var k = 0; k < PRODUCTS.length; k++) {
      if (PRODUCTS[k].id === pid) { p = PRODUCTS[k]; break; }
    }
    if (p) productCard(p, grid);
  }
}

// add to cart
function addToCart(id) {
  var item = null;
  for (var i = 0; i < cart.length; i++) {
    if (cart[i].id === id) { item = cart[i]; break; }
  }
  if (item) {
    item.qty = (item.qty || 0) + 1;
  } else {
    cart.push({ id: id, qty: 1 });
  }
  try { localStorage.setItem(LS_CART, JSON.stringify(cart)); } catch (e) {}
  updateCountsInDOM();
  flash('Added to cart');
}

// render cart list
function renderCartList() {
  var listEl = qs('#cartList');
  var totalEl = qs('#cartTotal');
  if (!listEl) return;
  listEl.innerHTML = '';
  if (!cart || cart.length === 0) {
    listEl.innerHTML = '<p>Your cart is empty</p>';
    if (totalEl) { totalEl.textContent = '0'; }
    return;
  }
  var total = 0;
  for (var i = 0; i < cart.length; i++) {
    var ci = cart[i];
    var p = null;
    for (var j = 0; j < PRODUCTS.length; j++) {
      if (PRODUCTS[j].id === ci.id) { p = PRODUCTS[j]; break; }
    }
    if (!p) continue;

    var row = el('div', 'cart-item');

    var img = el('img');
    img.src = p.img || '#';
    img.alt = p.name;
    row.appendChild(img);

    var info = el('div', 'info');
    info.innerHTML = '<div style="font-weight:700">' + p.name + '</div>' +
                     '<div class="price">KSh ' + p.price.toLocaleString() + '</div>';

                    
var info = el('div', 'info');

var status = '';
if (ci.purchased) {
  status = '<div class="status" style="color:green;font-weight:600;">✅ Purchased - Waiting for delivery</div>';
}

info.innerHTML = '<div style="font-weight:700">' + p.name + '</div>' +
                 '<div class="price">KSh ' + p.price.toLocaleString() + '</div>' +
                 status;

row.appendChild(info);

    var qty = el('div', 'qty');
    var minus = el('button');
    minus.textContent = '-';
    (function (pid) { minus.addEventListener('click', function () { changeQty(pid, -1); }); })(ci.id);

    var num = el('span');
    num.textContent = ci.qty;
    num.style.minWidth = '20px';
    num.style.display = 'inline-block';
    num.style.textAlign = 'center';

    var plus = el('button');
    plus.textContent = '+';
    (function (pid) { plus.addEventListener('click', function () { changeQty(pid, +1); }); })(ci.id);

    var remove = el('button', 'ghost');
    remove.textContent = 'Remove';
    remove.style.marginLeft = '8px';
    (function (pid) { remove.addEventListener('click', function () { removeFromCart(pid); }); })(ci.id);

    qty.appendChild(minus);
    qty.appendChild(num);
    qty.appendChild(plus);
    qty.appendChild(remove);
    row.appendChild(qty);

    listEl.appendChild(row);

    total += (p.price || 0) * (ci.qty || 0);
  }
  if (totalEl) totalEl.textContent = total.toLocaleString();
}

// change quantity
function changeQty(id, delta) {
  var idx = -1;
  for (var i = 0; i < cart.length; i++) { if (cart[i].id === id) { idx = i; break; } }
  if (idx === -1) return;
  cart[idx].qty = (cart[idx].qty || 0) + delta;
  if (cart[idx].qty <= 0) { cart.splice(idx, 1); }
  try { localStorage.setItem(LS_CART, JSON.stringify(cart)); } catch (e) {}
  renderCartList();
  updateCountsInDOM();
}

// remove from cart
function removeFromCart(id) {
  var newCart = [];
  for (var i = 0; i < cart.length; i++) { if (cart[i].id !== id) newCart.push(cart[i]); }
  cart = newCart;
  try { localStorage.setItem(LS_CART, JSON.stringify(cart)); } catch (e) {}
  renderCartList();
  updateCountsInDOM();
}

// purchase 
function purchase() {
  if (!cart || cart.length === 0) { alert('Cart is empty'); return; }
  
  var total = 0;
  for (var i = 0; i < cart.length; i++) {
    var p = PRODUCTS.find(function(x){ return x.id === cart[i].id; });
    if (p) total += (p.price || 0) * (cart[i].qty || 0);
  }
  localStorage.setItem('pending_total', total);
  window.location.href = 'payment.html';
}

// clear cart
function clearCart() {
  if (confirm('Clear cart?')) {
    cart = [];
    try { localStorage.setItem(LS_CART, JSON.stringify(cart)); } catch (e) {}
    renderCartList();
    updateCountsInDOM();
  }
}

//header/footer counts
function updateCountsInDOM() {
  var cartCount = 0;
  for (var i = 0; i < cart.length; i++) { cartCount += (cart[i].qty || 0); }
  var wishCount = (wish && wish.length) ? wish.length : 0;

  var cartNodes = qsa('#cartCount');
  for (i = 0; i < cartNodes.length; i++) { cartNodes[i].textContent = cartCount; }
  var cartNodesBottom = qsa('#cartCountBottom');
  for (i = 0; i < cartNodesBottom.length; i++) { cartNodesBottom[i].textContent = cartCount; }

  var wishNodes = qsa('#wishCount');
  for (i = 0; i < wishNodes.length; i++) { wishNodes[i].textContent = wishCount; }
  var wishNodesBottom = qsa('#wishCountBottom');
  for (i = 0; i < wishNodesBottom.length; i++) { wishNodesBottom[i].textContent = wishCount; }
}

// small toast
function flash(txt) {
  var t = el('div');
  t.textContent = txt;
  t.style.position = 'fixed';
  t.style.bottom = '78px';
  t.style.left = '50%';
  t.style.transform = 'translateX(-50%)';
  t.style.background = 'rgba(0,0,0,0.8)';
  t.style.color = '#fff';
  t.style.padding = '8px 12px';
  t.style.borderRadius = '8px';
  t.style.zIndex = 9999;
  document.body.appendChild(t);
  setTimeout(function () { try { t.parentNode.removeChild(t); } catch (e) {} }, 900);
}

// read query param
function getQueryParam(name) {
  var search = window.location.search || '';
  if (search.indexOf('?') === 0) search = search.substring(1);
  var pairs = search.split('&');
  for (var i = 0; i < pairs.length; i++) {
    var p = pairs[i].split('=');
    if (decodeURIComponent(p[0] || '') === name) return decodeURIComponent(p[1] || '');
  }
  return null;
}

// page inits
function initHome() {
  var grid = qs('#productsGrid');
  if (!grid) return;
  var q = getQueryParam('q');
  var cat = getQueryParam('cat');
  var list = PRODUCTS.slice();
  if (q) {
    var ql = q.toLowerCase();
    var filtered = [];
    for (var i = 0; i < list.length; i++) {
      if ((list[i].name || '').toLowerCase().indexOf(ql) !== -1) filtered.push(list[i]);
    }
    list = filtered;
  }
  if (cat && cat !== 'all') {
    var tmp = [];
    for (i = 0; i < list.length; i++) { if (list[i].category === cat) tmp.push(list[i]); }
    list = tmp;
  }
  renderGrid(list, grid);
}

function initCategories() {
  var grid = qs('#catGrid');
  if (!grid) return;
  renderGrid(PRODUCTS, grid);
}

function initCartPage() {
  renderCartList();
  var checkout = qs('#checkoutBtn');
  if (checkout) checkout.addEventListener('click', purchase);
  var clearBtn = qs('#clearCartBtn');
  if (clearBtn) clearBtn.addEventListener('click', clearCart);
}

function initWishlistPage() {
  renderWishGrid();
}

// Start
document.addEventListener('DOMContentLoaded', function () {
  try {
    initShared();
    updateCountsInDOM();

    if (qs('#productsGrid')) initHome();
    if (qs('#catGrid')) initCategories();
    if (qs('#cartList')) initCartPage();
    if (qs('#wishGrid')) initWishlistPage();
  } catch (err) {
   
    try { console.error('app.js startup error:', err && err.message ? err.message : err); } catch (e) {}
  }
});

