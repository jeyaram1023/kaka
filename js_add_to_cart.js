// js_add_to_cart.js - Cart functionality with Door Delivery switch

// DOM Elements
const cartItemsContainer = document.getElementById('cart-items-container');
const cartSummaryDiv = document.getElementById('cart-summary');
const cartEmptyView = document.getElementById('cart-empty-view');
const placeOrderButton = document.getElementById('place-order-button');
const disclaimerModal = document.getElementById('disclaimer-modal');
const disclaimerOkButton = document.getElementById('disclaimer-accept-btn');
const disclaimerCancelButton = document.getElementById('disclaimer-cancel-btn');

// Bill details elements
const cartSubtotalSpan = document.getElementById('cart-subtotal');
const cartPlatformFeeSpan = document.getElementById('cart-platform-fee');
const cartGstSpan = document.getElementById('cart-gst');
const cartDeliveryFeeSpan = document.getElementById('cart-delivery-fee');
const cartGrandTotalSpan = document.getElementById('cart-grand-total');

// Delivery switch and bill rows
const doorDeliverySwitch = document.getElementById('door-delivery-switch');
const gstRow = document.getElementById('gst-row');
const deliveryRow = document.getElementById('delivery-row');

// Constants
const PLATFORM_FEE = 5.00;
const GST_RATE = 0.10;

// Cart management functions
function getCart() {
    return JSON.parse(localStorage.getItem('streetrCart')) || [];
}

function saveCart(cart) {
    localStorage.setItem('streetrCart', JSON.stringify(cart));
    window.dispatchEvent(new CustomEvent('cartUpdated'));
}

function addToCart(item) {
    let cart = getCart();
    const existingItem = cart.find(cartItem => cartItem.id == item.id);

    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ ...item, quantity: 1 });
    }

    saveCart(cart);
    alert(`${item.name} added to cart!`);
    displayCartItems();
}

function updateCartQuantity(itemId, change) {
    let cart = getCart();
    const itemIndex = cart.findIndex(cartItem => cartItem.id == itemId);

    if (itemIndex > -1) {
        cart[itemIndex].quantity += change;
        if (cart[itemIndex].quantity <= 0) {
            cart.splice(itemIndex, 1);
        }
    }

    saveCart(cart);
    displayCartItems();
}

// Calculate delivery fee based on subtotal
function calculateDeliveryFee(subtotal) {
    if (subtotal <= 100) return 10;
    if (subtotal <= 200) return 15;
    if (subtotal <= 500) return 20;
    if (subtotal <= 1000) return 25;
    return 30;
}

// Update bill details based on delivery switch
function updateBillDetails() {
    const cart = getCart();
    const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const isDelivery = doorDeliverySwitch ? doorDeliverySwitch.checked : false;

    let gst = 0;
    let deliveryFee = 0;
    let grandTotal = subtotal + PLATFORM_FEE;

    // Display charges based on the switch
    if (isDelivery) {
        gst = subtotal * GST_RATE;
        deliveryFee = calculateDeliveryFee(subtotal);
        grandTotal += gst + deliveryFee;

        if (gstRow) gstRow.classList.remove('hidden');
        if (deliveryRow) deliveryRow.classList.remove('hidden');
    } else {
        if (gstRow) gstRow.classList.add('hidden');
        if (deliveryRow) deliveryRow.classList.add('hidden');
    }

    // Update the UI
    if (cartSubtotalSpan) cartSubtotalSpan.textContent = `₹${subtotal.toFixed(2)}`;
    if (cartPlatformFeeSpan) cartPlatformFeeSpan.textContent = `₹${PLATFORM_FEE.toFixed(2)}`;
    if (cartGstSpan) cartGstSpan.textContent = `₹${gst.toFixed(2)}`;
    if (cartDeliveryFeeSpan) cartDeliveryFeeSpan.textContent = `₹${deliveryFee.toFixed(2)}`;
    if (cartGrandTotalSpan) cartGrandTotalSpan.textContent = `₹${grandTotal.toFixed(2)}`;
}

// Display cart items
function displayCartItems() {
    if (!cartItemsContainer) return;
    
    const cart = getCart();
    cartItemsContainer.innerHTML = '';

    if (cart.length === 0) {
        if (cartSummaryDiv) cartSummaryDiv.classList.add('hidden');
        if (cartEmptyView) cartEmptyView.classList.remove('hidden');
        return;
    }

    if (cartSummaryDiv) cartSummaryDiv.classList.remove('hidden');
    if (cartEmptyView) cartEmptyView.classList.add('hidden');

    cart.forEach(item => {
        const itemSubtotal = item.price * item.quantity;
        const itemElement = document.createElement('div');
        itemElement.className = 'cart-item-card';
        itemElement.innerHTML = `
            <img src="${item.image_url || 'assets/placeholder-food.png'}" alt="${item.name}" onerror="this.src='assets/placeholder-food.png'">
            <div class="cart-item-details">
                <h5>${item.name}</h5>
                <p>Price: ₹${item.price.toFixed(2)}</p>
                <div class="cart-item-footer">
                    <div class="quantity-controls">
                        <button class="quantity-btn" data-id="${item.id}" data-change="-1">-</button>
                        <span>${item.quantity}</span>
                        <button class="quantity-btn" data-id="${item.id}" data-change="1">+</button>
                    </div>
                    <span class="cart-item-subtotal">₹${itemSubtotal.toFixed(2)}</span>
                </div>
            </div>
        `;
        cartItemsContainer.appendChild(itemElement);
    });

    // Add event listeners to quantity buttons
    cartItemsContainer.querySelectorAll('.quantity-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const itemId = btn.dataset.id;
            const change = parseInt(btn.dataset.change);
            updateCartQuantity(itemId, change);
        });
    });

    // Initial bill calculation
    updateBillDetails();
}

// Event listeners
function initializeCartEventListeners() {
    // Delivery switch change
    if (doorDeliverySwitch) {
        doorDeliverySwitch.addEventListener('change', updateBillDetails);
    }

    // Place order button - show disclaimer
    if (placeOrderButton) {
        placeOrderButton.addEventListener('click', () => {
            if (disclaimerModal) {
                disclaimerModal.classList.remove('hidden');
            }
        });
    }

    // Disclaimer OK button - proceed to payment
    if (disclaimerOkButton) {
        disclaimerOkButton.addEventListener('click', () => {
            if (disclaimerModal) {
                disclaimerModal.classList.add('hidden');
            }
            // Store delivery preference
            const isDelivery = doorDeliverySwitch ? doorDeliverySwitch.checked : false;
            sessionStorage.setItem('isDelivery', isDelivery);
            navigateToPage('payment-page');
        });
    }

    // Disclaimer Cancel button
    if (disclaimerCancelButton) {
        disclaimerCancelButton.addEventListener('click', () => {
            if (disclaimerModal) {
                disclaimerModal.classList.add('hidden');
            }
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeCartEventListeners();
    displayCartItems();
});

// Listen for cart updates
window.addEventListener('cartUpdated', displayCartItems);

// Make functions globally available
window.addToCart = addToCart;
window.displayCartItems = displayCartItems;
window.getCart = getCart;
window.saveCart = saveCart;
window.updateCartQuantity = updateCartQuantity;