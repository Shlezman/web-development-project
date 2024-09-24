class Cart {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('cart')) || [];
    }

    getItems(){
        return this.items

    }

    addItem(item) {
        this.items.push(item);
    }

    removeItem(itemId) {
        this.items = this.items.filter(item => item.id !== itemId);
    }

    getTotal() {
        return this.items.reduce((total, item) => total + item.price, 0);
    }

    // Other methods as needed
}

// Usage
const cart = new Cart();
export default cart;
console.log(cart.items)
function loadCart() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        cart.items = JSON.parse(savedCart);
    }
}

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Display cart items
function displayCartItems() {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalContainer = document.getElementById('cart-total');

    if (cart.items.length === 0) {
        cartItemsContainer.innerHTML = '<p>Your cart is empty.</p>';
        cartTotalContainer.innerHTML = '';
        return;
    }

    let cartHTML = '<table class="table"><thead><tr><th>Product</th><th>Price</th><th>Quantity</th><th>Total</th><th>Action</th></tr></thead><tbody>';
    let total = 0;
    console.log(cart.items)
    cart.getItems().forEach(item => {
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
    //updateCartCount();

    // Add event listener for search form
    // const searchForm = document.getElementById('search-form');
    // if (searchForm) {
    //     searchForm.addEventListener('submit', handleSearch);
    // } else {
    //     console.error("search-form element not found");
    // }
});
