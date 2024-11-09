class Cart {
    constructor() {
        this.items = [];
    }

    // Fetch the current cart order from the backend
    async loadCartFromBackend() {
        const API_BASE_URL = `${window.location.origin}/api`;

        const token = getCookie('jwt');

        try {
            const response = await fetch(`${API_BASE_URL}/orders?status=cart`, {
                method: 'GET',
                headers: {
                    'x-auth-token': token,
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();

            if (data.orders && data.orders.length > 0) {
                const order = data.orders[0];
                this.items = order.plants;
                this.orderId = order._id; // Store the order ID for later use
                this.displayCartItems();
            } else {
                document.getElementById('cart-items').innerHTML = '<p>Your cart is empty.</p>';
                document.getElementById('cart-total').innerHTML = '';
            }
        } catch (error) {
            console.error('Error loading cart:', error);
            document.getElementById('cart-items').innerHTML = '<p>Error loading cart. Please try again.</p>';
        }
    }

    // Display cart items and total amount
    displayCartItems() {
        const cartItemsContainer = document.getElementById('cart-items');
        const cartTotalContainer = document.getElementById('cart-total');

        if (this.items.length === 0) {
            cartItemsContainer.innerHTML = '<p>Your cart is empty.</p>';
            cartTotalContainer.innerHTML = '<h4>Total: $0.00</h4>';
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
            </tr>
        `;
        });

        cartHTML += '</tbody></table>';
        cartItemsContainer.innerHTML = cartHTML;
        cartTotalContainer.innerHTML = `<h4>Total: $${total.toFixed(2)}</h4>`;
    }


    // Send request to mark the cart as delivered
    async sendOrderToBackend() {
        const API_BASE_URL = `${window.location.origin}/api`;
        const token = getCookie('jwt');

        if (!this.orderId) {
            alert("No active cart order found.");
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/orders/${this.orderId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({ status: 'delivered' })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.errors?.[0]?.msg || 'Failed to place order');
            }

            alert('Order placed successfully!');
            this.items = []; // Clear cart
            this.displayCartItems(); // Refresh cart display
            document.getElementById('cart-total').innerHTML = '';
        } catch (error) {
            console.error('Error placing order:', error);
            alert('Failed to place order');
        }
    }
}

// Initialize and load the cart
const cart = new Cart();
document.addEventListener('DOMContentLoaded', () => {
    cart.loadCartFromBackend();
    document.getElementById('sendOrderToBackend').addEventListener('click', () => cart.sendOrderToBackend());
});
