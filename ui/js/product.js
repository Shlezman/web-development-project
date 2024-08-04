// Product data (in a real application, this would likely come from a server)
const products = [
    { id: 1, name: "Smartphone", price: 499.99, image: "https://via.placeholder.com/200x200.png?text=Smartphone", description: "A high-end smartphone with the latest features." },
    { id: 2, name: "Laptop", price: 799.99, image: "https://via.placeholder.com/200x200.png?text=Laptop", description: "A powerful laptop suitable for both work and gaming." },
    { id: 3, name: "Headphones", price: 99.99, image: "https://via.placeholder.com/200x200.png?text=Headphones", description: "Comfortable over-ear headphones with noise cancellation." },
    { id: 4, name: "Smartwatch", price: 199.99, image: "https://via.placeholder.com/200x200.png?text=Smartwatch", description: "A feature-packed smartwatch to track your fitness and stay connected." }
];

function getProductDetails(productId) {
    return products.find(product => product.id === productId);
}

function displayProductDetails(product) {
    const productDetails = document.getElementById('product-details');
    productDetails.innerHTML = `
        <div class="row">
            <div class="col-md-6">
                <img src="${product.image}" alt="${product.name}" class="img-fluid">
            </div>
            <div class="col-md-6">
                <h1>${product.name}</h1>
                <p class="lead">${product.description}</p>
                <p class="price">$${product.price.toFixed(2)}</p>
                <button class="btn btn-primary" onclick="addToCart(${product.id})">Add to Cart</button>
            </div>
        </div>
    `;
}

function addToCart(productId) {
    console.log(`Product ${productId} added to cart`);
    // Implement actual add to cart functionality here
}

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get('id'));

    if (productId) {
        const product = getProductDetails(productId);
        if (product) {
            displayProductDetails(product);
        } else {
            document.getElementById('product-details').innerHTML = '<p>Product not found.</p>';
        }
    } else {
        document.getElementById('product-details').innerHTML = '<p>No product specified.</p>';
    }
});