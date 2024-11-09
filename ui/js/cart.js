class Cart {
    constructor() {
        this.items = [];
    }

    // Fetch the current cart order from the backend
    loadCartFromBackend() {
        const API_BASE_URL = `${window.location.protocol}//${window.location.hostname}:3000/api`;
        const token = getCookie('jwt');

        $.ajax({
            url: `${API_BASE_URL}/orders?status=cart`,
            method: 'GET',
            headers: {
                'x-auth-token': token,
                'Content-Type': 'application/json'
            },
            success: (data) => {
                if (data.orders && data.orders.length > 0) {
                    const order = data.orders[0];
                    this.items = order.plants;
                    this.orderId = order._id;
                    this.displayCartItems();
                } else {
                    $('#cart-items').html('<p>Your cart is empty.</p>');
                    $('#cart-total').html('');
                }
            },
            error: (error) => {
                console.error('Error loading cart:', error);
                $('#cart-items').html('<p>Error loading cart. Please try again.</p>');
            }
        });
    }

    // Display cart items and total amount
    displayCartItems() {
        const cartItemsContainer = $('#cart-items');
        const cartTotalContainer = $('#cart-total');

        if (this.items.length === 0) {
            cartItemsContainer.html('<p>Your cart is empty.</p>');
            cartTotalContainer.html('<h4>Total: $0.00</h4>');
            return;
        }

        let cartHTML = '<table class="table"><thead><tr><th>Product</th><th>Price</th><th>Quantity</th><th>Total</th></tr></thead><tbody>';
        let total = 0;

        this.items.forEach(item => {
            const itemTotal = item.quantity * item.plant.price;
            total += itemTotal;
            cartHTML += `
            <tr>
                <td>${item.plant.name}</td>
                <td>$${item.plant.price.toFixed(2)}</td>
                <td>${item.quantity}</td>
                <td>$${itemTotal.toFixed(2)}</td>
            </tr>`;
        });

        cartHTML += '</tbody></table>';
        cartItemsContainer.html(cartHTML);
        cartTotalContainer.html(`<h4>Total: $${total.toFixed(2)}</h4>`);
    }

    // Send request to mark the cart as delivered
    sendOrderToBackend() {
        const API_BASE_URL = `${window.location.protocol}//${window.location.hostname}:3000/api`;
        const token = getCookie('jwt');

        if (!this.orderId) {
            alert("No active cart order found.");
            return;
        }

        $.ajax({
            url: `${API_BASE_URL}/orders/${this.orderId}/status`,
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token
            },
            data: JSON.stringify({ status: 'delivered' }),
            success: () => {
                alert('Order placed successfully!');
                this.items = []; // Clear cart
                this.displayCartItems(); // Refresh cart display
                $('#cart-total').html('');
            },
            error: (error) => {
                console.error('Error placing order:', error);
                alert('Failed to place order');
            }
        });
    }
}

// Initialize and load the cart
const cart = new Cart();
$(document).ready(() => {
    cart.loadCartFromBackend();
    $('#sendOrderToBackend').on('click', () => cart.sendOrderToBackend());
});
