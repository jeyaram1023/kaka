// js_order.js - Orders page with OTP display

const ordersListContainer = document.getElementById('orders-list');

// Load orders with OTP display
async function loadOrders() {
    if (!window.currentUser) {
        if (ordersListContainer) {
            ordersListContainer.innerHTML = '<p>Please log in to see your orders.</p>';
        }
        return;
    }
    
    showLoader();
    if (ordersListContainer) {
        ordersListContainer.innerHTML = '';
    }
    
    try {
        const { data: orders, error } = await supabase
            .from('orders')
            .select('*')
            .eq('user_id', window.currentUser.id)
            .order('created_at', { ascending: false });

        if (error) throw error;

        if (!orders || orders.length === 0) {
            if (ordersListContainer) {
                ordersListContainer.innerHTML = `
                    <div class="empty-state">
                        <img src="https://uploads.onecompiler.io/42q5e2pr5/43nvveyp4/1000133809.png" alt="No Orders Illustration">
                        <p>You haven't placed any orders yet.</p>
                    </div>
                `;
            }
            return;
        }

        orders.forEach(order => {
            const orderCard = document.createElement('div');
            orderCard.className = 'order-card';
            const orderDate = new Date(order.created_at).toLocaleDateString('en-IN', {
                day: 'numeric', 
                month: 'long', 
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            const itemsHtml = order.order_details.map(item => `
                <div class="order-item-detail">
                    <span>${item.name} (x${item.quantity})</span>
                    <span>₹${(item.price * item.quantity).toFixed(2)}</span>
                </div>
            `).join('');

            // Enhanced order card with OTP display
            orderCard.innerHTML = `
                <div class="order-card-header">
                    <h5>Order ID: ...${order.payment_token.slice(-8)}</h5>
                    <span class="order-status ${order.status}">${order.status.toUpperCase()}</span>
                </div>
                <div class="order-card-body">
                    <p><strong>Date:</strong> ${orderDate}</p>
                    <p><strong>Total Amount:</strong> ₹${order.total_amount.toFixed(2)}</p>
                    <div class="otp-container">
                        <strong>Delivery OTP:</strong>
                        <span class="otp-code">${order.otp || 'N/A'}</span>
                    </div>
                    <div class="order-breakdown">
                        <p><strong>Item Charge:</strong> ₹${(order.total_amount - order.platform_fee - order.gst - order.delivery_fee).toFixed(2)}</p>
                        <p><strong>Platform Charge:</strong> ₹${order.platform_fee.toFixed(2)}</p>
                        ${order.gst > 0 ? `<p><strong>GST (10%):</strong> ₹${order.gst.toFixed(2)}</p>` : ''}
                        ${order.delivery_fee > 0 ? `<p><strong>Delivery Charge:</strong> ₹${order.delivery_fee.toFixed(2)}</p>` : ''}
                    </div>
                    <hr>
                    <h6>Items:</h6>
                    ${itemsHtml}
                </div>
            `;
            
            if (ordersListContainer) {
                ordersListContainer.appendChild(orderCard);
            }
        });
    } catch (error) {
        console.error('Error loading orders:', error);
        if (ordersListContainer) {
            ordersListContainer.innerHTML = '<p class="message error">Could not load your orders. Please try again later.</p>';
        }
    } finally {
        hideLoader();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Only load orders if we're on the orders page
    if (document.getElementById('orders-page-content') && 
        document.getElementById('orders-page-content').classList.contains('active')) {
        loadOrders();
    }
});

// Listen for navigation to orders page
window.addEventListener('ordersPageActivated', loadOrders);

// Make function globally available
window.loadOrders = loadOrders;