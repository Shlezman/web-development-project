const API_BASE_URL = `${window.location.protocol}//${window.location.hostname}:3000/api`;
const token = getCookie('jwt');
const salesData = [
    { month: 'Jan', sales: 4000 },
    { month: 'Feb', sales: 3000 },
    { month: 'Mar', sales: 5000 },
    { month: 'Apr', sales: 4500 },
    { month: 'May', sales: 6000 },
    { month: 'Jun', sales: 5500 },
];

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

function renderProductTable(products) {
    const tbody = $('#productTable tbody');
    tbody.empty();
    products.forEach(product => {
        const row = `
            <tr>
                <td>${product.name}</td>
                <td><input type="number" value="${product.price.toFixed(2)}" id="price-${product._id}" onchange="updatePrice('${product._id}', this)" /></td>
                <td>
                    <button onclick="editProduct('${product._id}')">Save Changes</button>
                    <button onclick="deletePlant('${product._id}')">Delete</button>
                </td>
            </tr>`;
        tbody.append(row);
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

function updatePrice(productId, inputElement) {
    const newPrice = parseFloat(inputElement.value);
    if (isNaN(newPrice)) {
        console.error('Invalid price');
        return;
    }

    $.ajax({
        url: `${API_BASE_URL}/plants/${productId}/price`,
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token
        },
        data: JSON.stringify({ price: newPrice }),
        success: function (updatedProduct) {
            console.log('Price updated successfully:', updatedProduct);
            inputElement.value = updatedProduct.price.toFixed(2);
        },
        error: function (error) {
            console.error('Error updating price:', error);
            alert('Failed to update price. Please try again.');
        }
    });
}

function fetchPlants() {
    return $.ajax({
        url: `${API_BASE_URL}/plants`,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token
        },
        success: function (data) {
            console.log('Plants fetched successfully:', data);
            renderProductTable(data);
        },
        error: function (error) {
            console.error('Error fetching plants:', error);
            $('#productTable tbody').html('<tr><td colspan="3">Error fetching plants. Please try again.</td></tr>');
        }
    });
}

function openAddProductModal() {
    $('#addProductModal').show();
}

function closeAddProductModal() {
    $('#addProductModal').hide();
    clearProductForm();
}

function saveProduct() {
    const plantData = {
        name: $('#plant-name').val(),
        description: $('#plant-description').val(),
        price: parseFloat($('#plant-price').val()),
        category: $('#plant-category').val(),
        originCountry: $('#plant-origin-country').val(),
    };

    $.ajax({
        url: `${API_BASE_URL}/plants`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token
        },
        data: JSON.stringify(plantData),
        success: function (data) {
            alert('Plant created successfully');
            $('#create-plant-modal').hide();
            $('#create-plant-form')[0].reset();
            fetchPlants(); // Refresh the table
        },
        error: function (error) {
            console.error('Error:', error);
            alert('Failed to create plant');
        }
    });
}

function deletePlant(plantId) {
    $.ajax({
        url: `${API_BASE_URL}/plants/${plantId}`,
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token
        },
        success: function (data) {
            console.log('Plant deleted successfully:', data);
            fetchPlants(); // Refresh the table
        },
        error: function (error) {
            console.error('Error deleting plant:', error);
            alert('Failed to delete plant. Please try again.');
        }
    });
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

// Event listeners for create plant modal
$('#create-plant-btn').on('click', function () {
    $('#create-plant-modal').show();
});

$('#close-create-plant').on('click', function () {
    $('#create-plant-modal').hide();
});

// Initialize page
$(document).ready(function () {
    fetchPlants();
    initSalesChart();
});
