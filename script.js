// script.js — vanilla JS for nav toggle and contact form behavior
(function(){
  // set copyright years for each page instance
  function setYears(){
    var y = new Date().getFullYear();
    var ids = ['year','year-2','year-3','year-4'];
    ids.forEach(function(id){
      var el = document.getElementById(id);
      if(el) el.textContent = y;
    });
  }
  setYears();

  // menu toggle for multiple pages (buttons have different IDs)
  function hookMenu(buttonId, navId){
    var btn = document.getElementById(buttonId);
    var nav = document.getElementById(navId);
    if(!btn || !nav){
      // attempt generic toggle
      btn = document.getElementById('menu-toggle');
      nav = document.getElementById('main-nav');
    }
    if(!btn || !nav) return;
    btn.addEventListener('click', function(){
      var expanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!expanded));
      nav.classList.toggle('show');
    });
  }
  hookMenu('menu-toggle','main-nav');
  hookMenu('menu-toggle-2','main-nav-2');
  hookMenu('menu-toggle-3','main-nav-3');
  hookMenu('menu-toggle-4','main-nav-4');

  // Contact form handling — supports optional Formspree integration via data-form-endpoint
  var contactForm = document.getElementById('contact-form');
  if(contactForm){
    contactForm.addEventListener('submit', function(e){
      e.preventDefault();
      var name = document.getElementById('fullname').value.trim();
      var email = document.getElementById('email').value.trim();
      var message = document.getElementById('message').value.trim();
      var status = document.getElementById('contact-status');
      if(!name || !email || !message){
        if(status) status.textContent = 'Please fill all fields.';
        return;
      }

      var endpoint = contactForm.getAttribute('data-form-endpoint');
      var submitBtn = contactForm.querySelector('button[type="submit"]');
      if(endpoint && endpoint.trim() !== ''){
        // send to Formspree (or similar) using fetch
        if(submitBtn) submitBtn.disabled = true;
        var formData = new FormData(contactForm);
        fetch(endpoint, {
          method: 'POST',
          body: formData,
          headers: {
            'Accept': 'application/json'
          }
        }).then(function(res){
          if(res.ok){
            if(status) status.textContent = 'Thanks — we received your message.';
            contactForm.reset();
          } else {
            return res.json().then(function(data){
              var err = (data && data.error) ? data.error : 'Submission failed.';
              if(status) status.textContent = err;
            });
          }
        }).catch(function(){
          if(status) status.textContent = 'Network error — please try again later.';
        }).finally(function(){ if(submitBtn) submitBtn.disabled = false; });
      } else {
        // fallback: open mailto in user's email client
        var body = encodeURIComponent('Name: ' + name + '\nEmail: ' + email + '\n\n' + message);
        var subject = encodeURIComponent('Contact from Bazaar website');
        window.location.href = 'mailto:support@bazaar.example?subject=' + subject + '&body=' + body;
      }
    });
  }

  // Product search + filter (client-side) with suggestions dropdown
  var searchInput = document.getElementById('product-search');
  var filterSelect = document.getElementById('product-filter');
  var suggestionsDiv = document.getElementById('search-suggestions');

  function getAllProducts() {
    var cards = document.querySelectorAll('.product-card');
    var products = [];
    cards.forEach(function(card) {
      var name = card.getAttribute('data-name') || '';
      var category = card.getAttribute('data-category') || '';
      var h3 = card.querySelector('h3');
      var displayName = h3 ? h3.textContent : name;
      products.push({
        name: name,
        displayName: displayName,
        category: category,
        element: card
      });
    });
    return products;
  }

  function showSuggestions(query) {
    if (!suggestionsDiv) return;
    
    if (query.trim() === '') {
      suggestionsDiv.classList.remove('show');
      return;
    }

    var allProducts = getAllProducts();
    var matches = allProducts.filter(function(p) {
      return p.name.toLowerCase().indexOf(query.toLowerCase()) !== -1;
    });

    if (matches.length === 0) {
      suggestionsDiv.innerHTML = '<div class="suggestion-item no-results">❌ No products found</div>';
      suggestionsDiv.classList.add('show', 'empty');
      return;
    }

    var html = '';
    matches.forEach(function(product) {
      var icon = product.category === 'men' ? '👔' : product.category === 'women' ? '👗' : '🧒';
      html += '<div class="suggestion-item" data-product="' + product.name + '">';
      html += '<span class="suggestion-icon">' + icon + '</span>';
      html += '<span class="suggestion-name">' + product.displayName + '</span>';
      html += '<span class="suggestion-category">' + (product.category.charAt(0).toUpperCase() + product.category.slice(1)) + '</span>';
      html += '</div>';
    });

    suggestionsDiv.innerHTML = html;
    suggestionsDiv.classList.add('show');
    suggestionsDiv.classList.remove('empty');

    // Add click handlers to suggestions
    var items = suggestionsDiv.querySelectorAll('.suggestion-item');
    items.forEach(function(item) {
      item.addEventListener('click', function() {
        var productName = item.getAttribute('data-product');
        searchInput.value = productName;
        suggestionsDiv.classList.remove('show');
        filterProducts();
      });
    });
  }

  function filterProducts(){
    var q = searchInput ? searchInput.value.trim().toLowerCase() : '';
    var cat = filterSelect ? filterSelect.value : 'all';
    var cards = document.querySelectorAll('.product-card');
    cards.forEach(function(card){
      var name = (card.getAttribute('data-name') || '').toLowerCase();
      var category = (card.getAttribute('data-category') || '').toLowerCase();
      var matchesSearch = q === '' || name.indexOf(q) !== -1;
      var matchesCategory = (cat === 'all') || (category === cat);
      if(matchesSearch && matchesCategory){
        card.style.display = '';
      } else {
        card.style.display = 'none';
      }
    });
  }

  if(searchInput) {
    searchInput.addEventListener('input', function(e) {
      showSuggestions(e.target.value);
      filterProducts();
    });
    // Close suggestions when clicking outside
    document.addEventListener('click', function(e) {
      if (e.target !== searchInput && !suggestionsDiv.contains(e.target)) {
        suggestionsDiv.classList.remove('show');
      }
    });
  }
  if(filterSelect) filterSelect.addEventListener('change', filterProducts);
    // ----- Client-side auth nav handling -----
    // This updates the nav auth link to show Login or "Name (Logout)" when a user is stored in localStorage.
    function updateAuthLink(){
      var authLink = document.getElementById('auth-link');
      if(!authLink) return;
      var raw = localStorage.getItem('user');
      var user = null;
      try { user = raw ? JSON.parse(raw) : null; } catch(e){ user = null; }

      if(user){
        // replace link element to avoid duplicate handlers
        var name = user.name || (user.email ? user.email.split('@')[0] : 'User');
        var replacement = authLink.cloneNode(false);
        replacement.textContent = name + ' (Logout)';
        replacement.href = '#';
        replacement.addEventListener('click', function(e){
          e.preventDefault();
          localStorage.removeItem('user');
          // small UX: show logged out state briefly then reload nav
          updateAuthLink();
        });
        authLink.parentNode.replaceChild(replacement, authLink);
      } else {
        var replacement2 = authLink.cloneNode(false);
        replacement2.textContent = 'Login';
        replacement2.href = 'login.html';
        authLink.parentNode.replaceChild(replacement2, authLink);
      }
    }

    // initialize auth link on load
    updateAuthLink();

    // ----- Shopping cart (localStorage) -----
    var CART_KEY = 'bazaar_cart_v1';

    function getCart(){
      try{ return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); } catch(e){ return []; }
    }
    function saveCart(cart){ localStorage.setItem(CART_KEY, JSON.stringify(cart || [])); }

    function updateCartCount(){
      var cart = getCart();
      var count = cart.reduce(function(acc,item){ return acc + (item.qty||1); }, 0);
      // find or create cart link in nav
      var existing = document.getElementById('nav-cart-link');
      if(!existing){
        var authLink = document.getElementById('auth-link');
        if(authLink && authLink.parentNode){
          var a = document.createElement('a');
          a.href = 'cart.html';
          a.id = 'nav-cart-link';
          a.innerHTML = 'Cart <span id="cart-count" class="cart-count">0</span>';
          authLink.parentNode.insertBefore(a, authLink);
        }
      }
      var counter = document.getElementById('cart-count');
      if(counter) counter.textContent = count;
    }

    // add to cart handler (delegated)
    document.addEventListener('click', function(e){
      var btn = e.target.closest && e.target.closest('.add-to-cart');
      if(!btn) return;
      e.preventDefault();
      // find the product card
      var card = btn.closest('.product-card');
      if(!card) return;
      var name = (card.querySelector('h3') && card.querySelector('h3').textContent) || card.getAttribute('data-name') || 'Product';
      var imgEl = card.querySelector('img.product-img');
      var img = imgEl ? imgEl.getAttribute('src') : '';
      var price = parseFloat(btn.getAttribute('data-price') || card.getAttribute('data-price') || '0') || 0;
      var cart = getCart();
      // if same product (by name+image) exists, increment qty
      var found = cart.find(function(it){ return it.name === name && it.image === img && it.price === price; });
      if(found){ found.qty = (found.qty||1) + 1; }
      else { cart.push({ name: name, image: img, price: price, qty: 1 }); }
      saveCart(cart);
      updateCartCount();
      // small feedback
      btn.textContent = 'Added ✓';
      setTimeout(function(){ btn.textContent = 'Add to Cart'; }, 900);
    });

    // If on cart page, render cart
    function renderCartPage(){
      var container = document.getElementById('cart-container');
      if(!container) return;
      var cart = getCart();
      container.innerHTML = '';
      var h = document.createElement('h1'); h.textContent = 'Your Cart'; container.appendChild(h);
      if(!cart || cart.length === 0){
        var p = document.createElement('p'); p.textContent = 'Your cart is empty.'; container.appendChild(p); return;
      }
      var list = document.createElement('div'); list.className = 'cart-list';
      var total = 0;
      cart.forEach(function(item, idx){
        var card = document.createElement('div'); card.className = 'cart-item';
        var img = document.createElement('img'); img.src = item.image || 'assets/images/placeholder.png'; img.className = 'cart-item-img'; img.alt = item.name;
        var info = document.createElement('div'); info.className = 'cart-item-info';
        var title = document.createElement('h3'); title.textContent = item.name;
        var price = document.createElement('div'); price.className = 'muted'; price.textContent = '₹' + (item.price||0) + ' × ' + (item.qty||1);
        var remove = document.createElement('button'); remove.className = 'btn'; remove.textContent = 'Remove';
        remove.addEventListener('click', function(){
          var c = getCart(); c.splice(idx,1); saveCart(c); renderCartPage(); updateCartCount();
        });
        info.appendChild(title); info.appendChild(price); info.appendChild(remove);
        card.appendChild(img); card.appendChild(info);
        list.appendChild(card);
        total += (item.price||0) * (item.qty||1);
      });
      container.appendChild(list);
      var totalBlock = document.createElement('div'); totalBlock.className = 'cart-total';
      totalBlock.innerHTML = '<strong>Total:</strong> ₹' + total.toFixed(2);
      container.appendChild(totalBlock);
      var checkoutWrap = document.createElement('p');
      var checkout = document.createElement('button'); checkout.className = 'btn btn-primary'; checkout.textContent = 'Checkout / Place Order';
      checkout.addEventListener('click', function(){ window.location.href = 'order.html'; });
      checkoutWrap.appendChild(checkout); container.appendChild(checkoutWrap);
    }

    // If on order page, wire form
    function initOrderPage(){
      var form = document.getElementById('order-form');
      if(!form) return;
      form.addEventListener('submit', function(e){
        e.preventDefault();
        var name = form.querySelector('input[name="name"]').value.trim();
        var phone = form.querySelector('input[name="phone"]').value.trim();
        var address = form.querySelector('textarea[name="address"]').value.trim();
        var payment = form.querySelector('input[name="payment"]:checked');
        var status = document.getElementById('order-status');
        if(!name || !phone || !address || !payment){ if(status) status.textContent = 'Please fill all fields.'; return; }
        // clear cart and show success
        localStorage.removeItem(CART_KEY);
        updateCartCount();
        form.style.display = 'none';
        if(status) status.innerHTML = '<strong>Your order has been placed successfully. Thank you for shopping with Bazaar!</strong>';
      });
    }

    // initialize cart count and page-specific render
    updateCartCount();
    if(document.getElementById('cart-container')) renderCartPage();
    if(document.getElementById('order-form')) initOrderPage();
  })();
