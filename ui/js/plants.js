const API_KEY = atob("QUl6YVN5RENmWmEyalhXZm1fc3dlY2tPdDJjZ1dCWnhSSzRXZ3JB")

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

const searchForm = document.getElementById('search-form');
const plantsContainer = document.getElementById('plants-container');
const prevPageBtn = document.getElementById('prev-page');
const nextPageBtn = document.getElementById('next-page');
const currentPageSpan = document.getElementById('current-page');

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
                <p>In Stock: ${plant.inStock}</p>
                <p>Average Rating: ${plant.avgRating}</p>
                <p>Number of Reviews: ${plant.numReviews}</p>
            `;
            plantsContainer.appendChild(plantCard);

            // Initialize the map for every plant
            CountryMap(plant.originCountry, `country-map-${index}`, API_KEY);
        });

        updatePaginationUI();
    } else {
        plantsContainer.innerHTML = '<p>No plants found.</p>';
        // Reset pagination when no results are found
        currentPage = 1;
        totalPages = 1;
        updatePaginationUI();
    }
}

function updatePaginationUI() {
    currentPageSpan.textContent = `Page ${currentPage} of ${totalPages}`;
    prevPageBtn.disabled = currentPage <= 1;
    nextPageBtn.disabled = currentPage >= totalPages;
}

// Initial load
fetchPlants();