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
            const userDiv = `
            <div class="card mb-2">
                <div class="card-body">
                    <h5 class="card-title">${user.username}</h5>
                    <p class="card-text">
                        Email: ${user.email}<br>
                        Admin: ${user.isAdmin ? 'Yes' : 'No'}<br>
                        UserID: ${user._id}
                    </p>
                    <div class="mt-2">
                        <button onclick="viewUserOrders('${user._id}', '${user.username}')" class="btn btn-info view-orders-btn">View Order History</button>
                    </div>
                </div>
            </div>`;
            usersListElement.append(userDiv);
        });
    }
});
