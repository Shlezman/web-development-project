let products = [
    { id: 1, name: 'Monstera Deliciosa', price: 29.99, stock: 50 },
    { id: 2, name: 'Snake Plant', price: 19.99, stock: 30 },
    { id: 3, name: 'Fiddle Leaf Fig', price: 39.99, stock: 20 },
];

const salesData = [
    { month: 'Jan', sales: 4000 },
    { month: 'Feb', sales: 3000 },
    { month: 'Mar', sales: 5000 },
    { month: 'Apr', sales: 4500 },
    { month: 'May', sales: 6000 },
    { month: 'Jun', sales: 5500 },
];

let editingProductId = null;

function renderProductTable() {
    const tbody = document.querySelector('#productTable tbody');
    tbody.innerHTML = '';
    products.forEach(product => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${product.name}</td>
            <td>$${product.price.toFixed(2)}</td>
            <td>${product.stock}</td>
            <td>
                <button onclick="editProduct(${product.id})">Edit</button>
                <button onclick="deleteProduct(${product.id})">Delete</button>
            </td>
        `;
    });
}

function fetchPlants() {
    const formData = new FormData(searchForm);

    const queryParams = new URLSearchParams(formData);
    
    const minPriceInput = document.getElementById('minPrice');
    if (!minPriceInput.value) {
        queryParams.delete('minPrice')
    }

    const maxPriceInput = document.getElementById('maxPrice');
    if (!maxPriceInput.value) {
        queryParams.delete('maxPrice')
    }


    fetch(`https://bug-free-engine-x9j4gp9pw5v3r6g-3000.app.github.dev/api/plants/search?${queryParams}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            displayPlants(data);
        })
        .catch(error => {
            console.error('Error fetching plants:', error);
            plantsContainer.innerHTML = '<p>Error fetching plants. Please try again.</p>';
        });
}

function openAddProductModal() {
    document.getElementById('addProductModal').style.display = 'block';
}

function closeAddProductModal() {
    document.getElementById('addProductModal').style.display = 'none';
    clearProductForm();
}

function clearProductForm() {
    document.getElementById('productName').value = '';
    document.getElementById('productPrice').value = '';
    document.getElementById('productStock').value = '';
    editingProductId = null;
}

function saveProduct() {
    const name = document.getElementById('productName').value;
    const price = parseFloat(document.getElementById('productPrice').value);
    const stock = parseInt(document.getElementById('productStock').value);

    if (editingProductId) {
        const index = products.findIndex(p => p.id === editingProductId);
        products[index] = { ...products[index], name, price, stock };
    } else {
        const newId = Math.max(...products.map(p => p.id), 0) + 1;
        products.push({ id: newId, name, price, stock });
    }

    renderProductTable();
    closeAddProductModal();
}

function editProduct(id) {
    const product = products.find(p => p.id === id);
    if (product) {
        document.getElementById('productName').value = product.name;
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productStock').value = product.stock;
        editingProductId = id;
        openAddProductModal();
    }
}

function deleteProduct(id) {
    products = products.filter(p => p.id !== id);
    renderProductTable();
}

function initSalesChart() {
    const ctx = document.getElementById('salesChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: salesData.map(d => d.month),
            datasets: [{
                label: 'Sales',
                data: salesData.map(d => d.sales),
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Initialize the page
renderProductTable();
initSalesChart();