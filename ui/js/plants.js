const token = getCookie('jwt');
const API_BASE_URL = `${window.location.protocol}//${window.location.hostname}:3000/api`;

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

const searchForm = $('#search-form');
const plantsContainer = $('#plants-container');
const prevPageBtn = $('#prev-page');
const nextPageBtn = $('#next-page');
const currentPageSpan = $('#current-page');
async function getMap() {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `${API_BASE_URL}/map`,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token
            },
            success: function (resJson) {
                resolve(atob(resJson.mapKey));
            },
            error: function (error) {
                console.error('Error:', error);
                reject(error);
            }
        });
    });
}


let pageLimit = 8;
let currentPage = 1;
let totalPages = 1;

searchForm.on('submit', function (e) {
    e.preventDefault();
    currentPage = 1;
    fetchPlants();
});

prevPageBtn.on('click', function () {
    if (currentPage > 1) {
        currentPage--;
        fetchPlants();
    }
});

nextPageBtn.on('click', function () {
    if (currentPage < totalPages) {
        currentPage++;
        fetchPlants();
    }
});

$('#create-plant-btn').on('click', function () {
    $('#create-plant-modal').show();
});

$('#close-create-plant').on('click', function () {
    $('#create-plant-modal').hide();
});

$('#create-plant-form').on('submit', function (e) {
    e.preventDefault();
    const API_BASE_URL = `${window.location.protocol}//${window.location.hostname}:3000/api`;
    const plantData = {
        name: $('#plant-name').val(),
        description: $('#plant-description').val(),
        price: parseFloat($('#plant-price').val()),
        category: $('#plant-category').val(),
        originCountry: $('#plant-origin-country').val(),
        indoor: $('#indoor').is(':checked')
    };

    const token = getCookie('jwt');

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
            window.location.href = 'index.html';
        },
        error: function (error) {
            console.error('Error:', error);
            alert('Failed to create plant');
        }
    });
});

function fetchPlants() {
    const API_BASE_URL = `${window.location.protocol}//${window.location.hostname}:3000/api`;

    // Collect form data using jQuery serialize method
    const formData = $('#search-form').serializeArray();
    const queryParams = {};

    // Process form data and add only valid values
    $.each(formData, function (i, field) {
        if (field.value) { // Only add non-empty values
            queryParams[field.name] = field.value;
        }
    });

    // Pagination parameters
    queryParams.limit = pageLimit;
    queryParams.page = currentPage;

    plantsContainer.html('<p>Loading plants...</p>');
    updatePaginationUI();

    $.ajax({
        url: `${API_BASE_URL}/plants/search`,
        method: 'GET',
        data: queryParams,
        success: function (data) {
            totalPages = data.totalPages || 1;
            displayPlants(data);
        },
        error: function (error) {
            console.error('Error fetching plants:', error);
            plantsContainer.html('<p>Error fetching plants. Please try again.</p>');
            updatePaginationUI();
        }
    });
}

async function fetchCommonNames(plantName) {
    // Extract the first word from the plant name
    const firstWord = plantName.split(' ')[0];

    try {
        const response = await $.ajax({
            url: `${API_BASE_URL}/plants/common-names`,
            method: 'GET',
            data: { prefix: firstWord } // Send only the first word as the prefix
        });
        return response; // Returns an array of common names
    } catch (error) {
        console.error(`Error fetching common names for ${firstWord}:`, error);
        return [];
    }
}

async function displayPlants(data) {
    plantsContainer.empty();
    if (data.plants && data.plants.length > 0) {
        $.each(data.plants, async function (index, plant) {
            const plantCard = `
                <div class="plant-card">
                    <h3>${plant.name}</h3>
                    <p id="common-names-${index}" style="display: none;"><strong>Common Names:</strong> Loading...</p>
                    <button class="btn btn-secondary show-common-names" data-plant-name="${plant.name}" id="show-common-names-${index}">Show Common Names</button>
                    <p>Category: ${plant.category}</p>
                    <p>Price: $${plant.price.toFixed(2)}</p>
                    <p>Description: ${plant.description}</p>
                    <p>Origin Country: ${plant.originCountry}</p>
                    <div id="country-map-${index}" class="country-map" style="width:100%; height:200px;"></div>
                    <button class="btn btn-primary" onclick="addToCart('${plant._id}', 1)">Add to Cart</button>
                </div>`;
            plantsContainer.append(plantCard);

            // Initialize the map for each plant after appending to DOM
            try {
                const mapKey = await getMap();
                CountryMap(plant.originCountry, `country-map-${index}`, mapKey);
            } catch (error) {
                console.error('Error loading map:', error);
            }
        });

        // Add click event listener for the "Show Common Names" button
        $('.show-common-names').on('click', async function () {
            const plantName = $(this).data('plant-name');
            const index = $(this).attr('id').split('-').pop();
            const commonNamesElement = $(`#common-names-${index}`);

            // Show loading, fetch, and display common names
            commonNamesElement.show().text('Loading...');
            const commonNames = await fetchCommonNames(plantName);
            const commonNamesText = commonNames.length > 0 ? commonNames.join(', ') : 'No common names available';
            commonNamesElement.html(`<strong>Common Names:</strong> ${commonNamesText}`);

            // Hide button after displaying common names
            $(this).hide();
        });

        updatePaginationUI();
    } else {
        plantsContainer.html('<p>No plants found.</p>');
        currentPage = 1;
        totalPages = 1;
        updatePaginationUI();
    }
}





function addToCart(plantId, quantity = 1) {
    const API_BASE_URL = `${window.location.protocol}//${window.location.hostname}:3000/api`;
    const token = getCookie('jwt');

    quantity = parseInt(quantity, 10);
    if (isNaN(quantity) || quantity < 1) {
        alert('Invalid quantity');
        return;
    }

    $.ajax({
        url: `${API_BASE_URL}/orders?status=cart`,
        method: 'GET',
        headers: {
            'x-auth-token': token,
            'Content-Type': 'application/json'
        },
        success: function (cartOrders) {
            let plantsInCart = [];
            if (cartOrders && cartOrders.orders.length > 0) {
                const order = cartOrders.orders[0];
                const orderId = order._id;

                let plantExists = false;

                if (Array.isArray(order.plants)) {  // Ensure order.plants is an array
                    plantsInCart = order.plants.map(plantItem => {
                        if (plantItem.plant && plantItem.plant._id === plantId) { // Check plantItem.plant exists
                            plantExists = true;
                            return {
                                plant: plantItem.plant._id,
                                quantity: plantItem.quantity + quantity
                            };
                        }
                        return {
                            plant: plantItem.plant ? plantItem.plant._id : null,
                            quantity: plantItem.quantity
                        };
                    });
                }

                if (!plantExists) {
                    plantsInCart.push({ plant: plantId, quantity });
                }

                // Filter out invalid entries with null plant IDs
                plantsInCart = plantsInCart.filter(item => item.plant !== null);

                $.ajax({
                    url: `${API_BASE_URL}/orders/${orderId}`,
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-auth-token': token
                    },
                    data: JSON.stringify({ plants: plantsInCart }),
                    success: function () {
                        alert('Plant added to your cart.');
                    },
                    error: function (error) {
                        console.error('Failed to update cart:', error);
                        alert('Failed to update cart');
                    }
                });
            } else {
                $.ajax({
                    url: `${API_BASE_URL}/orders`,
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-auth-token': token
                    },
                    data: JSON.stringify({ plants: [{ plant: plantId, quantity }] }),
                    success: function () {
                        alert('New cart created and plant added.');
                    },
                    error: function (error) {
                        console.error('Failed to create cart:', error);
                        alert('Failed to create cart');
                    }
                });
            }
        },
        error: function (error) {
            console.error('Error adding to cart:', error);
            alert('Failed to retrieve cart orders');
        }
    });
}



function updatePaginationUI() {
    currentPageSpan.text(`Page ${currentPage} of ${totalPages}`);
    prevPageBtn.prop('disabled', currentPage <= 1);
    nextPageBtn.prop('disabled', currentPage >= totalPages);
}

fetchPlants();
