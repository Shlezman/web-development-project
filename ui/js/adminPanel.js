function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

const viewUserOrders = (userId, username) => {
    window.location.href = `order-history.html?adminView=true&username=${username}`;
};

$(document).ready(function () {
    renderHeader('admin');
    const API_BASE_URL = `${window.location.protocol}//${window.location.hostname}:3000/api`;
    const token = getCookie('jwt');

    if (!token) {
        $('#admin-content').hide();
        $('#unauthorized-message').show();
        return;
    }

    $('#admin-content').show();
    $('#unauthorized-message').hide();

    // Display messages function
    function showMessage(message, isError = false) {
        const messageElement = $('#message');
        messageElement
            .text(message)
            .removeClass('alert-success alert-danger')
            .addClass(isError ? 'alert alert-danger' : 'alert alert-success')
            .show();
        setTimeout(() => messageElement.hide(), 5000);
    }

    // Make User Admin
    $('#make-admin-form').on('submit', function (e) {
        e.preventDefault();
        const userId = $('#make-admin-userId').val();
        $.ajax({
            url: `${API_BASE_URL}/users/make-admin/${userId}`,
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token
            },
            success: function () {
                showMessage('User promoted to admin successfully');
                $('#make-admin-form')[0].reset();
            },
            error: function () {
                showMessage('Failed to make user an admin', true);
            }
        });
    });

    // Delete User
    $('#delete-user-form').on('submit', function (e) {
        e.preventDefault();
        const userId = $('#delete-userId').val();
        $.ajax({
            url: `${API_BASE_URL}/users/${userId}`,
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token
            },
            success: function () {
                showMessage('User deleted successfully');
                $('#delete-user-form')[0].reset();
            },
            error: function () {
                showMessage('Failed to delete user', true);
            }
        });
    });

    // Search Users
    $('#search-users-form').on('submit', function (e) {
        e.preventDefault();

        // Prepare form data, only including fields with values
        const formData = {
            username: $('#search-username').val(),
            email: $('#search-email').val(),
            isAdmin: $('#search-isAdmin').val(),
            sort: $('#search-sort').val(),
            page: $('#search-page').val(),
            limit: $('#search-limit').val()
        };

        // Remove empty values from formData
        const queryParams = {};
        Object.keys(formData).forEach(key => {
            if (formData[key]) {
                queryParams[key] = formData[key];
            }
        });

        // Make the AJAX request with only valid parameters
        $.ajax({
            url: `${API_BASE_URL}/users/search`,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token
            },
            data: queryParams,
            success: function (data) {
                displayUsers(data.users);
                showMessage('Users fetched successfully');
                $('#search-users-form')[0].reset();
            },
            error: function () {
                showMessage('Failed to search users', true);
            }
        });
    });

    // Fetch and display all users
    $('#get-all-users').on('click', function () {
        $.ajax({
            url: `${API_BASE_URL}/users/all`,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token
            },
            success: function (data) {
                displayUsers(data);
                showMessage('All users fetched successfully');
            },
            error: function () {
                showMessage('Failed to fetch users', true);
            }
        });
    });
    function renderPerUserChart(data) {
        const width = 360; // Adjusted for side-by-side display
        const height = 360;
        const margin = { top: 20, right: 30, bottom: 40, left: 50 };

        const svg = d3.select("#per-user-chart").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const xScale = d3.scaleBand()
            .domain(data.map(d => d.username))
            .range([0, width])
            .padding(0.1);

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.totalAmount) || 0])
            .nice()
            .range([height, 0]);

        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(xScale))
            .selectAll("text")
            .attr("transform", "rotate(-45)")
            .style("text-anchor", "end");

        svg.append("g").call(d3.axisLeft(yScale));

        svg.selectAll(".bar")
            .data(data)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", d => xScale(d.username))
            .attr("y", d => yScale(d.totalAmount))
            .attr("width", xScale.bandwidth())
            .attr("height", d => height - yScale(d.totalAmount))
            .attr("fill", "steelblue");
    }

    function renderHourlySalesChart(data) {
        const width = 360; // Adjusted for side-by-side display
        const height = 360;
        const margin = { top: 20, right: 30, bottom: 40, left: 50 };

        const svg = d3.select("#hourly-sales-chart").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const xScale = d3.scaleLinear()
            .domain([0, 23])
            .range([0, width]);

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.totalSales) || 0])
            .nice()
            .range([height, 0]);

        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(xScale).ticks(24));

        svg.append("g").call(d3.axisLeft(yScale));

        svg.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 2)
            .attr("d", d3.line()
                .x(d => xScale(d._id.hour))
                .y(d => yScale(d.totalSales)));
    }

    // Display users in a card layout
    function displayUsers(users) {
        const usersListElement = $('#users-list');
        usersListElement.empty();

        if (!users || users.length === 0) {
            usersListElement.append('<div class="alert alert-info">No users found.</div>');
            return;
        }

        users.forEach(user => {
            const userCard = `
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">${user.username}</h5>
                        <p class="card-text">
                            <strong>Email:</strong> ${user.email}<br>
                            <strong>Role:</strong> ${user.isAdmin ? 'Admin' : 'User'}<br>
                            <strong>User ID:</strong> ${user._id}
                        </p>
                        <button onclick="viewUserOrders('${user._id}', '${user.username}')" 
                                class="btn btn-info btn-sm">View Order History</button>
                    </div>
                </div>`;
            usersListElement.append(userCard);
        });
    }

    function renderPerUserChart(data) {
        const width = 360;
        const height = 360;
        const margin = { top: 40, right: 30, bottom: 60, left: 50 };

        const svg = d3.select("#per-user-chart").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        svg.append("text")
            .attr("x", width / 2)
            .attr("y", -20)
            .attr("text-anchor", "middle")
            .attr("font-size", "16px")
            .attr("font-weight", "bold")
            .text("Total Purchases Per User");

        const xScale = d3.scaleBand()
            .domain(data.map(d => d.username))
            .range([0, width])
            .padding(0.1);

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.totalAmount) || 0])
            .nice()
            .range([height, 0]);

        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(xScale))
            .selectAll("text")
            .attr("transform", "rotate(-45)")
            .style("text-anchor", "end");

        svg.append("g").call(d3.axisLeft(yScale));

        svg.selectAll(".bar")
            .data(data)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", d => xScale(d.username))
            .attr("y", d => yScale(d.totalAmount))
            .attr("width", xScale.bandwidth())
            .attr("height", d => height - yScale(d.totalAmount))
            .attr("fill", "steelblue");
    }

    function renderHourlySalesChart(data) {
        const width = 360;
        const height = 360;
        const margin = { top: 40, right: 30, bottom: 60, left: 50 };

        const svg = d3.select("#hourly-sales-chart").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        svg.append("text")
            .attr("x", width / 2)
            .attr("y", -20)
            .attr("text-anchor", "middle")
            .attr("font-size", "16px")
            .attr("font-weight", "bold")
            .text("Total Sales Per Hour");

        // Aggregate total sales per hour across all dates
        const salesByHour = Array.from(
            d3.rollup(data, v => d3.sum(v, d => d.totalSales), d => d._id.hour),
            ([hour, totalSales]) => ({ hour, totalSales })
        );

        // Create scales
        const xScale = d3.scaleBand()
            .domain(salesByHour.map(d => d.hour))
            .range([0, width])
            .padding(0.1);

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(salesByHour, d => d.totalSales) || 0])
            .nice()
            .range([height, 0]);

        // X-axis
        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(xScale).tickFormat(d => `Hour ${d}`))
            .selectAll("text")
            .attr("transform", "rotate(-45)")
            .style("text-anchor", "end");

        // Y-axis
        svg.append("g").call(d3.axisLeft(yScale));

        // Draw bars
        svg.selectAll(".bar")
            .data(salesByHour)
            .join("rect")
            .attr("class", "bar")
            .attr("x", d => xScale(d.hour))
            .attr("y", d => yScale(d.totalSales))
            .attr("width", xScale.bandwidth())
            .attr("height", d => height - yScale(d.totalSales))
            .attr("fill", "steelblue");
    }



// Fetch and render chart data
    $.ajax({
        url: `${API_BASE_URL}/orders/purchases/per-user`,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token
        },
        success: function (data) {
            renderPerUserChart(data);
        },
        error: function () {
            showMessage('Failed to load per-user chart', true);
        }
    });

    $.ajax({
        url: `${API_BASE_URL}/orders/purchases/hourly-sales`,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token
        },
        success: function (data) {
            renderHourlySalesChart(data.hourlySales);
        },
        error: function () {
            showMessage('Failed to load hourly sales chart', true);
        }
    });

});
