// Cart Management System for Sparsh NFC
// Handles adding items, removing items, updating quantities, and displaying cart count

// Cart data structure:
// {
//   id: string (unique identifier)
//   name: string
//   type: string ('classic' | 'premium' | 'corporate')
//   price: number
//   quantity: number
//   image: string
//   finish: string
//   sku: string
// }

// Get cart from localStorage
function getCart() {
    const cart = localStorage.getItem('sparshCart');
    return cart ? JSON.parse(cart) : [];
}

// Save cart to localStorage
function saveCart(cart) {
    localStorage.setItem('sparshCart', JSON.stringify(cart));
    updateCartCount(); // Update the cart badge whenever cart changes
}

// Add item to cart
function addToCart(product) {
    const cart = getCart();
    const existingItem = cart.find(item => 
        item.id === product.id && item.finish === product.finish
    );

    if (existingItem) {
        // Update quantity if item already exists
        existingItem.quantity += product.quantity || 1;
    } else {
        // Add new item
        cart.push({
            id: product.id,
            name: product.name,
            type: product.type,
            price: product.price,
            quantity: product.quantity || 1,
            image: product.image,
            finish: product.finish || 'default',
            sku: product.sku
        });
    }

    saveCart(cart);
    showAddToCartNotification();
    return cart;
}

// Remove item from cart
function removeFromCart(itemId, finish) {
    let cart = getCart();
    cart = cart.filter(item => 
        !(item.id === itemId && item.finish === finish)
    );
    saveCart(cart);
    return cart;
}

// Update item quantity in cart
function updateCartQuantity(itemId, finish, quantity) {
    const cart = getCart();
    const item = cart.find(item => 
        item.id === itemId && item.finish === finish
    );
    
    if (item) {
        if (quantity <= 0) {
            return removeFromCart(itemId, finish);
        }
        item.quantity = quantity;
        saveCart(cart);
    }
    return cart;
}

// Get total cart count
function getCartCount() {
    const cart = getCart();
    return cart.reduce((total, item) => total + item.quantity, 0);
}

// Get cart total price
function getCartTotal() {
    const cart = getCart();
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// Calculate GST (18%)
function calculateGST(subtotal) {
    return subtotal * 0.18;
}

// Update cart badge in header
function updateCartCount() {
    const count = getCartCount();
    const cartBadge = document.getElementById('cart-count-badge');
    const cartCountSpan = document.getElementById('cart-count');
    
    if (cartBadge) {
        if (count > 0) {
            cartBadge.style.display = 'inline-flex';
            if (cartCountSpan) {
                cartCountSpan.textContent = count;
            } else {
                cartBadge.textContent = count;
            }
        } else {
            cartBadge.style.display = 'none';
        }
    }
}

// Show notification when item is added to cart
function showAddToCartNotification() {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'fixed top-24 right-4 bg-green-500 text-white px-6 py-4 rounded-lg shadow-xl z-50 flex items-center space-x-2';
    notification.innerHTML = `
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        <span class="font-semibold">Item added to cart!</span>
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.transition = 'opacity 0.3s';
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Render cart items on cart page
function renderCartItems() {
    const cart = getCart();
    const cartContainer = document.getElementById('cart-items-container');
    const couponSection = document.getElementById('coupon-section');
    
    if (!cartContainer) return;
    
    if (cart.length === 0) {
        cartContainer.innerHTML = `
            <div class="bg-white p-12 rounded-2xl shadow-xl text-center">
                <!-- Empty Cart Illustration -->
                <div class="mb-6 flex justify-center">
                    <svg class="w-32 h-32" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect width="120" height="120" rx="20" fill="#FFD6FF"/>
                        <rect x="30" y="40" width="60" height="50" rx="5" fill="#E7C6FF" stroke="#C8B6FF" stroke-width="2"/>
                        <path d="M35 40L40 25C40 22.7909 41.7909 21 44 21H76C78.2091 21 80 22.7909 80 25L85 40" stroke="#C8B6FF" stroke-width="2" fill="none"/>
                        <circle cx="50" cy="75" r="5" fill="#6b4c9e"/>
                        <circle cx="70" cy="75" r="5" fill="#6b4c9e"/>
                        <path d="M45 60L55 50L65 60" stroke="#6b4c9e" stroke-width="2" stroke-linecap="round"/>
                        <circle cx="90" cy="45" r="8" fill="#B8C0FF" opacity="0.6"/>
                        <circle cx="100" cy="35" r="5" fill="#E7C6FF" opacity="0.6"/>
                    </svg>
                </div>
                <h2 class="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
                <p class="text-gray-600 mb-6">Add some items to your cart to continue shopping.</p>
                <a href="index.html#shop" class="inline-flex items-center px-8 py-3 rounded-full font-semibold text-white" style="background-color: var(--color-primary);">
                    Continue Shopping
                </a>
            </div>
        `;
        if (couponSection) couponSection.style.display = 'none';
        updateOrderSummary([]);
        return;
    }
    
    if (couponSection) couponSection.style.display = 'block';
    
    cartContainer.innerHTML = cart.map(item => {
        const totalPrice = item.price * item.quantity;
        return `
            <div class="flex flex-col sm:flex-row items-center bg-white p-6 rounded-2xl shadow-xl border border-gray-100 cart-item" data-id="${item.id}" data-finish="${item.finish}">
                <img src="${item.image}" alt="${item.name}" class="w-24 h-auto rounded-lg mr-6 mb-4 sm:mb-0">
                
                <div class="flex-grow">
                    <h2 class="text-xl font-bold text-dark mb-1">${item.name}</h2>
                    <p class="text-sm text-gray-500">${item.finish !== 'default' ? item.finish : 'Standard Finish'}</p>
                    <p class="text-xs text-gray-400 mt-1">SKU: ${item.sku}</p>
                </div>

                <div class="flex items-center space-x-6 mt-4 sm:mt-0">
                    <!-- Quantity Control -->
                    <div class="flex items-center">
                        <label for="qty_${item.id}_${item.finish}" class="sr-only">Quantity</label>
                        <input 
                            type="number" 
                            id="qty_${item.id}_${item.finish}" 
                            value="${item.quantity}" 
                            min="1" 
                            class="quantity-input cart-quantity"
                            data-id="${item.id}"
                            data-finish="${item.finish}"
                            data-price="${item.price}"
                        >
                    </div>
                    <!-- Price -->
                    <div class="text-xl font-extrabold text-dark w-32 text-right">
                        ₹ ${totalPrice.toLocaleString('en-IN')}
                    </div>
                    <!-- Remove Button -->
                    <button 
                        class="remove-item text-gray-400 hover:text-red-500 transition" 
                        aria-label="Remove ${item.name}"
                        data-id="${item.id}"
                        data-finish="${item.finish}"
                    >
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
            </div>
        `;
    }).join('');
    
    // Attach event listeners
    attachCartEventListeners();
    
    // Update order summary
    updateOrderSummary(cart);
}

// Update order summary on cart page
function updateOrderSummary(cart) {
    const subtotal = getCartTotal();
    const gst = calculateGST(subtotal);
    const total = subtotal + gst;
    
    const subtotalElement = document.getElementById('cart-subtotal');
    const gstElement = document.getElementById('cart-gst');
    const totalElement = document.getElementById('cart-total');
    const itemCountElement = document.getElementById('cart-item-count');
    
    if (itemCountElement) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        itemCountElement.textContent = totalItems;
    }
    
    if (subtotalElement) {
        subtotalElement.textContent = `₹ ${subtotal.toLocaleString('en-IN')}`;
    }
    
    if (gstElement) {
        gstElement.textContent = `₹ ${gst.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
    }
    
    if (totalElement) {
        totalElement.textContent = `₹ ${total.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
    }
}

// Attach event listeners for cart interactions
function attachCartEventListeners() {
    // Quantity update listeners
    document.querySelectorAll('.cart-quantity').forEach(input => {
        input.addEventListener('change', function() {
            const itemId = this.dataset.id;
            const finish = this.dataset.finish;
            const quantity = parseInt(this.value) || 1;
            updateCartQuantity(itemId, finish, quantity);
            renderCartItems(); // Re-render to update prices
        });
    });
    
    // Remove item listeners
    document.querySelectorAll('.remove-item').forEach(button => {
        button.addEventListener('click', function() {
            const itemId = this.dataset.id;
            const finish = this.dataset.finish;
            if (confirm('Are you sure you want to remove this item from your cart?')) {
                removeFromCart(itemId, finish);
                renderCartItems(); // Re-render cart
            }
        });
    });
}

// Initialize cart on page load
document.addEventListener('DOMContentLoaded', function() {
    // Update cart count badge
    updateCartCount();
    
    // If we're on the cart page, render items
    if (document.getElementById('cart-items-container')) {
        renderCartItems();
    }
});

