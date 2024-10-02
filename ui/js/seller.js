//const { error } = require("console");

const API_BASE_URL = `${window.location.protocol}//${window.location.hostname}:3000/api`;
const isAdmin = getCookie('isAdmin') === 'true';
const token = getCookie('jwt');  

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}


const salesData = [
    { month: 'Jan', sales: 4000 },
    { month: 'Feb', sales: 3000 },
    { month: 'Mar', sales: 5000 },
    { month: 'Apr', sales: 4500 },
    { month: 'May', sales: 6000 },
    { month: 'Jun', sales: 5500 },
];

let editingProductId = null;

function renderProductTable(products) {
    const tbody = document.querySelector('#productTable tbody');
    tbody.innerHTML = '';
    console.log(products)
    products.forEach(product => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${product.name}</td>
            <td> <input type="number" value="${product.price.toFixed(2)}" id="price-${product._id}" onchange="updatePrice('${product._id}', this)" /> </td>
            <td>${product.stock}</td>
            <td>
                <button onclick="editProduct('${product._id}')">Edit</button>
                <button onclick="deletePlant('${product._id}')">Delete</button>
            </td>
        `;
    });
}
function handleResponse(response) {
    if (!response.ok) {
        return response.json().then(errorData => {
            throw errorData;
        });
    }
    return response.json();
}

async function updatePrice(productId, newPrice) {
    try {
      const response = await fetch(`${API_BASE_URL}/plants/${productId}/price`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({ price: +newPrice }),
        credentials: 'include'
      });
  
    //   if (!response.ok) {
    //     console.log(error)
    //     throw new Error('Failed to update price');
    //   }
  
      const updatedProduct = await response.json();
      console.log('Price updated successfully:', updatedProduct);
      // You might want to update your local state or trigger a re-fetch of data here
    } catch (error) {
      console.error('Error updating price:', error);
      // Handle the error (e.g., show an error message to the user)
    }
  }

async function fetchPlants() {
    // const formData = new FormData(searchForm);

    // const queryParams = new URLSearchParams(formData);
    
    // const minPriceInput = document.getElementById('minPrice');
    // if (!minPriceInput.value) {
    //     queryParams.delete('minPrice')
    // }

    // const maxPriceInput = document.getElementById('maxPrice');
    // if (!maxPriceInput.value) {
    //     queryParams.delete('maxPrice')
    // }

    try {
        const response = await fetch(`${API_BASE_URL}/plants`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token
          },
          credentials: 'include'
        });
    
        const data = await handleResponse(response);
        console.log(data);
        return data;
      } catch (error) {
        console.error('Error fetching plants:', error);
        plantsContainer.innerHTML = '<p>Error fetching plants. Please try again.</p>';
        throw error; // Re-throw the error if you want calling code to handle it
      }
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
document.getElementById('create-plant-btn').addEventListener('click', function() {
    document.getElementById('create-plant-modal').style.display = 'block';
});

document.getElementById('close-create-plant').addEventListener('click', function() {
    document.getElementById('create-plant-modal').style.display = 'none';
});

document.getElementById('create-plant-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const API_BASE_URL = `${window.location.protocol}//${window.location.hostname}:3000/api`;
    
    const plantData = {
        name: document.getElementById('plant-name').value,
        description: document.getElementById('plant-description').value,
        price: parseFloat(document.getElementById('plant-price').value), 
        category: document.getElementById('plant-category').value,
        originCountry: document.getElementById('plant-origin-country').value,
        indoor: document.getElementById('indoor').checked
    };

    const token = getCookie('jwt'); 

    fetch(`${API_BASE_URL}/plants`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token
        },
        body: JSON.stringify(plantData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to create plant');
        }
        return response.json();
    })
    .then(data => {
        alert('Plant created successfully');
        document.getElementById('create-plant-modal').style.display = 'none';
        document.getElementById('create-plant-form').reset();
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Failed to create plant');
    });
});
async function deletePlant(plantId){
    try {
        const response = await fetch(`${API_BASE_URL}/plants/${plantId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token
          },
          credentials: 'include'
        });
    
        const data = await handleResponse(response);
        console.log(data)
        await initializePlants()
        return data;
      } catch (error) {
        console.error('Error fetching plants:', error);
        plantsContainer.innerHTML = '<p>Error fetching deleting plant. Please try again.</p>';
        throw error; // Re-throw the error if you want calling code to handle it
      }
}

async function initializePlants() {
    try {
        plants = await fetchPlants();
        renderProductTable(plants);
    } catch (error) {
      console.error('Error loading plants:', error);
    }
  }

initializePlants()
initSalesChart();