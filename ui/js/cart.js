// Display cart items
function displayCartItems() {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalContainer = document.getElementById('cart-total');

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p>Your cart is empty.</p>';
        cartTotalContainer.innerHTML = '';
        return;
    }

    let cartHTML = '<table class="table"><thead><tr><th>Product</th><th>Price</th><th>Quantity</th><th>Total</th><th>Action</th></tr></thead><tbody>';
    let total = 0;

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        cartHTML += `
            <tr>
                <td>${item.name}</td>
                <td>$${item.price.toFixed(2)}</td>
                <td>${item.quantity}</td>
                <td>$${itemTotal.toFixed(2)}</td>
                <td><button class="btn btn-sm btn-danger" onclick="removeFromCart(${item.id})">Remove</button></td>
            </tr>
        `;
    });

    cartHTML += '</tbody></table>';
    cartItemsContainer.innerHTML = cartHTML;
    cartTotalContainer.innerHTML = `<h4>Total: $${total.toFixed(2)}</h4>`;
}

// Remove item from cart
function removeFromCart(productId) {
    const index = cart.findIndex(item => item.id === productId);
    if (index !== -1) {
        cart.splice(index, 1);
        updateCartCount();
        displayCartItems();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Render header
    renderHeader('cart');

    loadCart();
    displayCartItems();
    updateCartCount();

    // Add event listener for search form
    const searchForm = document.getElementById('search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', handleSearch);
    } else {
        console.error("search-form element not found");
    }
});

// ... (keep the rest of the existing code)