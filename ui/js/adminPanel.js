function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

const viewUserOrders = (userId, username) => {
    window.location.href = `order-history.html?adminView=true&username=${username}`;
}

$(document).ready(function () {
    renderHeader('admin');
    const API_BASE_URL = `${window.location.protocol}//${window.location.hostname}:3000/api`;
    const adminContent = $('#admin-content');
    const unauthorizedMessage = $('#unauthorized-message');
    const messageElement = $('#message');
    const makeAdminForm = $('#make-admin-form');
    const deleteUserForm = $('#delete-user-form');
    const searchUsersForm = $('#search-users-form');
    const getAllUsersButton = $('#get-all-users');
    const usersListElement = $('#users-list');

    const isAdmin = getCookie('isAdmin') === 'true';
    const token = getCookie('jwt');

    if (!isAdmin || !token) {
        adminContent.hide();
        unauthorizedMessage.show();
        return;
    }

    adminContent.show();
    unauthorizedMessage.hide();

    function showMessage(message, isError = false) {
        messageElement.text(message);
        messageElement.removeClass('alert-success alert-danger').addClass(isError ? 'alert alert-danger' : 'alert alert-success').show();
        setTimeout(() => messageElement.hide(), 5000);
    }

    makeAdminForm.on('submit', function (e) {
        e.preventDefault();
        const userId = $('#make-admin-userId').val();

        $.ajax({
            url: `${API_BASE_URL}/users/make-admin/${userId}`,
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token
            },
            success: function (data) {
                showMessage('User made admin successfully');
                makeAdminForm[0].reset();
            },
            error: handleError
        });
    });

    deleteUserForm.on('submit', function (e) {
        e.preventDefault();
        const userId = $('#delete-userId').val();

        $.ajax({
            url: `${API_BASE_URL}/users/${userId}`,
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token
            },
            success: function (data) {
                showMessage('User deleted successfully');
                deleteUserForm[0].reset();
            },
            error: handleError
        });
    });

    searchUsersForm.on('submit', function (e) {
        e.preventDefault();

        const formData = {
            username: $('#search-username').val(),
            email: $('#search-email').val(),
            isAdmin: $('#search-isAdmin').val(),
            sort: $('#search-sort').val(),
            page: $('#search-page').val(),
            limit: $('#search-limit').val()
        };

        const queryParams = {};
        $.each(formData, function (key, value) {
            if (value) queryParams[key] = value;
        });

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
                searchUsersForm[0].reset();
            },
            error: handleError
        });
    });

    getAllUsersButton.on('click', function () {
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
            error: handleError
        });
    });

    function handleError(error) {
        const errorMessage = error.responseJSON?.errors?.[0]?.msg || 'An error occurred';
        showMessage(errorMessage, true);
    }

    function displayUsers(users) {
        usersListElement.empty();
        users.forEach(user => {
            const userDiv = document.createElement('div');
            userDiv.className = 'card mb-2';
            userDiv.innerHTML = `
            <div class="card-body bg-white text-dark p-4 border border-light shadow-sm rounded-lg">
                <!-- Title and Admin Badge -->
                <h5 class="card-title d-flex justify-content-between align-items-center mb-3">
                    <span class="font-weight-bold">${user.username}</span>
                    <span class="badge badge-${user.isAdmin ? 'success' : 'secondary'} font-weight-normal">
                        ${user.isAdmin ? 'Admin' : 'User'}
                    </span>
                </h5>
                
                <!-- User Info -->
                <p class="card-text text-muted mb-4">
                    <i class="bi bi-envelope"></i> <strong>${user.email}</strong> <br>
                    <i class="bi bi-person-badge"></i> <strong>UserID:</strong> ${user._id}
                </p>
                
                <!-- Button Section -->
                <div class="mt-3">
                    <button onclick="viewUserOrders('${user._id}', '${user.username}')" 
                            class="btn btn-success btn-lg btn-block hover-green transition-all">
                        <i class="bi bi-box-arrow-in-right"></i> View Order History
                    </button>
                </div>
            </div>

        `;
            usersListElement.appendChild(userDiv);
        });
    }
});
