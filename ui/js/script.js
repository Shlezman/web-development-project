// Product data
const products = [
    { id: 1, name: "Smartphone", price: 499.99, image: "https://via.placeholder.com/200x200.png?text=Smartphone" },
    { id: 2, name: "Laptop", price: 799.99, image: "https://via.placeholder.com/200x200.png?text=Laptop" },
    { id: 3, name: "Headphones", price: 99.99, image: "https://via.placeholder.com/200x200.png?text=Headphones" },
    { id: 4, name: "Smartwatch", price: 199.99, image: "https://via.placeholder.com/200x200.png?text=Smartwatch" }
];

// Product component class
class ProductComponent {
    constructor(product) {
        this.product = product;
    }

    render() {
        return `
            <div class="col-md-3 mb-4">
                <div class="card product-card">
                    <img src="${this.product.image}" class="card-img-top" alt="${this.product.name}">
                    <div class="card-body">
                        <h5 class="card-title">${this.product.name}</h5>
                        <p class="card-text price">$${this.product.price.toFixed(2)}</p>
                        <button class="btn btn-primary btn-sm" onclick="addToCart(${this.product.id})">Add to Cart</button>
                    </div>
                </div>
            </div>
        `;
    }
}

// Display products function
function displayProducts() {
    const productList = document.getElementById("product-list");
    productList.innerHTML = products.map(product => new ProductComponent(product).render()).join('');
}

// Call this function when the page loads
document.addEventListener('DOMContentLoaded', displayProducts);

// Placeholder function for adding to cart (to be implemented later)
function addToCart(productId) {
    console.log(`Product ${productId} added to cart`);
}