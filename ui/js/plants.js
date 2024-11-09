const token = getCookie('jwt');
const API_BASE_URL = `${window.location.protocol}//${window.location.hostname}:3000/api`;

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

async function getMap() {
    try {
      const response = await fetch(`${API_BASE_URL}/map`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
      });
      //const result = response.json();
      const resJson = await response.json();

      const final = atob(resJson.mapKey);
 
      return final;

    } catch (error) {
      console.error('Error:', error);
    }
  }
 
const searchForm = document.getElementById('search-form');
const plantsContainer = document.getElementById('plants-container');
const prevPageBtn = document.getElementById('prev-page');
const nextPageBtn = document.getElementById('next-page');
const currentPageSpan = document.getElementById('current-page');

let pageLimit = 8;
let currentPage = 1;
let totalPages = 1;

searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    currentPage = 1;
    fetchPlants();
});

prevPageBtn.addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        fetchPlants();
    }
});

nextPageBtn.addEventListener('click', () => {
    if (currentPage < totalPages) {
        currentPage++;
        fetchPlants();
    }
});

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
            // Refresh the plants list after creating a new plant
            window.location.href = 'index.html';
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Failed to create plant');
        });
});

function fetchPlants() {
    const formData = new FormData(searchForm);
    const API_BASE_URL = `${window.location.protocol}//${window.location.hostname}:3000/api`;

    const queryParams = new URLSearchParams(formData);

    // Add pagination parameters
    queryParams.set('limit', pageLimit);
    queryParams.set('page', currentPage);

    // Handle empty price filters
    const minPriceInput = document.getElementById('minPrice');
    if (!minPriceInput.value) {
        queryParams.delete('minPrice');
    }

    const maxPriceInput = document.getElementById('maxPrice');
    if (!maxPriceInput.value) {
        queryParams.delete('maxPrice');
    }

    // Update UI to show loading state
    plantsContainer.innerHTML = '<p>Loading plants...</p>';
    updatePaginationUI();

    fetch(`${API_BASE_URL}/plants/search?${queryParams}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Update pagination state
            totalPages = data.totalPages || 1;
            displayPlants(data);
        })
        .catch(error => {
            console.error('Error fetching plants:', error);
            plantsContainer.innerHTML = '<p>Error fetching plants. Please try again.</p>';
            updatePaginationUI();
        });
}

function displayPlants(data) {
    plantsContainer.innerHTML = '';

    if (data.plants && data.plants.length > 0) {
        data.plants.forEach((plant, index) => {
            const plantCard = document.createElement('div');
            plantCard.className = 'plant-card';
            plantCard.innerHTML = `
                <h3>${plant.name}</h3>
                <p>Category: ${plant.category}</p>
                <p>Price: $${plant.price.toFixed(2)}</p>
                <p>Description: ${plant.description}</p>
                <p>Origin Country: ${plant.originCountry}</p>
                <div id="country-map-${index}" class="country-map"></div>
                <button class="btn btn-primary" onclick="addToCart('${plant._id}', 1)">Add to Cart</button>
            `;
            plantsContainer.appendChild(plantCard);

            // Initialize the map for every plant
            getMap()
            .then(mapKey => {
                CountryMap(plant.originCountry, `country-map-${index}`, mapKey);;
            })
            .catch(error => {
                console.error('Error:', error);
            });
        });

        updatePaginationUI();
    } else {
        plantsContainer.innerHTML = '<p>No plants found.</p>';
        currentPage = 1;
        totalPages = 1;
        updatePaginationUI();
    }
}

async function addToCart(plantId, quantity = 1) {
    const API_BASE_URL = `${window.location.protocol}//${window.location.hostname}:3000/api`;
    const token = getCookie('jwt');

    // Ensure quantity is a positive integer
    quantity = parseInt(quantity, 10);
    if (isNaN(quantity) || quantity < 1) {
        alert('Invalid quantity');
        return;
    }

    try {
        // Step 1: Check for an existing cart order
        const cartOrders = await fetch(`${API_BASE_URL}/orders?status=cart`, {
            method: 'GET',
            headers: {
                'x-auth-token': token,
                'Content-Type': 'application/json'
            }
        }).then(response => response.json());

        let plantsInCart = [];
        if (cartOrders && cartOrders.orders.length > 0) {
            // If a cart order exists, retrieve its plants
            const order = cartOrders.orders[0];
            const orderId = order._id;

            // Check if the plant is already in the cart
            let plantExists = false;
            plantsInCart = order.plants.map(plantItem => {
                if (plantItem.plant._id === plantId) {
                    plantExists = true;
                    return {
                        plant: plantItem.plant._id,
                        quantity: plantItem.quantity + quantity
                    };
                }
                return {
                    plant: plantItem.plant._id,
                    quantity: plantItem.quantity
                };
            });

            // If the plant is not in the cart, add it as a new item
            if (!plantExists) {
                plantsInCart.push({ plant: plantId, quantity });
            }

            // Update the existing order with the modified plants array
            const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({ plants: plantsInCart })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.errors?.[0]?.msg || 'Failed to update cart');
            }

            alert('Plant added to your cart.');
        } else {
            // If no cart order exists, create a new cart order
            const response = await fetch(`${API_BASE_URL}/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({
                    plants: [{ plant: plantId, quantity }]
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.errors?.[0]?.msg || 'Failed to create cart');
            }

            alert('New cart created and plant added.');
        }
    } catch (error) {
        console.error('Error adding to cart:', error);
        alert(error.message);
    }
}



function updatePaginationUI() {
    currentPageSpan.textContent = `Page ${currentPage} of ${totalPages}`;
    prevPageBtn.disabled = currentPage <= 1;
    nextPageBtn.disabled = currentPage >= totalPages;
}

// Initial load
fetchPlants();