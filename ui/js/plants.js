//const { prefix } = require('./config');
const searchForm = document.getElementById('search-form');
const plantsContainer = document.getElementById('plants-container');
const prevPageBtn = document.getElementById('prev-page');
const nextPageBtn = document.getElementById('next-page');
const currentPageSpan = document.getElementById('current-page');

let currentPage = 1;

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
    currentPage++;
    fetchPlants();
});

function fetchPlants() {
    const formData = new FormData(searchForm);
    const API_BASE_URL = `${window.location.protocol}//${window.location.hostname}:3000/api`;

    const queryParams = new URLSearchParams(formData);
    
    const minPriceInput = document.getElementById('minPrice');
    if (!minPriceInput.value) {
        queryParams.delete('minPrice')
    }

    const maxPriceInput = document.getElementById('maxPrice');
    if (!maxPriceInput.value) {
        queryParams.delete('maxPrice')
    }


    fetch(`${API_BASE_URL}/plants/search?${queryParams}`)
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

function displayPlants(data) {
    plantsContainer.innerHTML = '';

    if (data.plants && data.plants.length > 0) {
        data.plants.forEach(plant => {
            const plantCard = document.createElement('div');
            plantCard.className = 'plant-card';
            plantCard.innerHTML = `
                <h3>${plant.name}</h3>
                <p>Category: ${plant.category}</p>
                <p>Price: $${plant.price.toFixed(2)}</p>
                <p>Description: ${plant.description}</p>
                <p>Origin Country: ${plant.originCountry}</p>
                <p>In Stock: ${plant.inStock}</p>
                <p>Average Rating: ${plant.avgRating}</p>
                <p>Number of Reviews: ${plant.numReviews}</p>
            `;
            plantsContainer.appendChild(plantCard);
        });

        currentPageSpan.textContent = currentPage;
        prevPageBtn.disabled = currentPage === 1;
        nextPageBtn.disabled = !data.hasNextPage;
    } else {
        plantsContainer.innerHTML = '<p>No plants found.</p>';
    }
}

// Initial fetch
fetchPlants();