let cart = JSON.parse(localStorage.getItem('cart')) || []
const products = [
    { id: 1, name: "Smartphone", price: 499.99, image: "https://via.placeholder.com/200x200.png?text=Smartphone", description: "A high-end smartphone with the latest features." },
    { id: 2, name: "Laptop", price: 799.99, image: "https://via.placeholder.com/200x200.png?text=Laptop", description: "A powerful laptop suitable for both work and gaming." },
    { id: 3, name: "Headphones", price: 99.99, image: "https://via.placeholder.com/200x200.png?text=Headphones", description: "Comfortable over-ear headphones with noise cancellation." },
    { id: 4, name: "Smartwatch", price: 199.99, image: "https://via.placeholder.com/200x200.png?text=Smartwatch", description: "A feature-packed smartwatch to track your fitness and stay connected." }
];

function getProductDetails(productId) {
    return products.find(product => product.id === productId);
}


function renderHeader(activePage) {
    const headerContainer = document.getElementById('header');
    if (headerContainer) {
        const header = new Header(activePage);
        headerContainer.innerHTML = header.render();
    }
}



class ProductComponent {
    constructor(product) {
        this.product = product;
    }

    render() {
        return `
            <div class="col-md-3 mb-4">
                <div class="card product-card">
                    <a href="product.html?id=${this.product.id}" class="text-decoration-none">
                        <img src="${this.product.image}" class="card-img-top" alt="${this.product.name}">
                        <div class="card-body">
                            <h5 class="card-title text-dark">${this.product.name}</h5>
                            <p class="card-text price">$${this.product.price.toFixed(2)}</p>
                        </div>
                    </a>
                    <div class="card-footer">
                        <button class="btn btn-primary btn-sm" onclick="addToCart(${this.product.id})">Add to Cart</button>
                    </div>
                </div>
            </div>
        `;
    }
}

function displayProducts(productsToDisplay) {
    const productList = document.getElementById("product-list");
    if (!productList) {
        console.error("product-list element not found");
        return;
    }

    // If productsToDisplay is an event or not provided, use the global products array
    if (!(productsToDisplay && Array.isArray(productsToDisplay))) {
        console.log("Using default products array");
        productsToDisplay = products;
    }

    if (productsToDisplay.length === 0) {
        productList.innerHTML = '<p class="col-12">No products found.</p>';
    } else {
        productList.innerHTML = productsToDisplay.map(product => new ProductComponent(product).render()).join('');
    }

    console.log("Products displayed");
}



// Search products function
function searchProducts(query) {
    return products.filter(product =>
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.description.toLowerCase().includes(query.toLowerCase())
    );
}


// Save cart to localStorage
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function loadCart() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
}


// Update cart count
function updateCartCount() {
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        cartCount.textContent = cart.reduce((total, item) => total + item.quantity, 0);
    }
}

// Add to cart function
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (product) {
        const existingItem = cart.find(item => item.id === productId);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({ ...product, quantity: 1 });
            localStorage.setItem('cart', JSON.stringify(cart));
        }
        updateCartCount();
        console.log(`Product ${productId} added to cart`);
        console.log("Current cart:", cart);
    }
}




document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM content loaded");

    const searchForm = document.getElementById('header');

    if (searchForm) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const searchQuery = document.getElementById('search-input').value;
            console.log("Search query:", searchQuery);
            const searchResults = searchProducts(searchQuery);
            console.log("Search results:", searchResults);
            displayProducts(searchResults);
        });
    } else {
        console.error("search-form element not found");
    }

    // Initial display of all products
    console.log("Attempting to display all products");
    console.log("Products array:", products);
    displayProducts();

    // Initialize cart count
    updateCartCount();

    // Render header
    renderHeader(window.location.pathname.includes('cart.html') ? 'cart' : 'home');
});

