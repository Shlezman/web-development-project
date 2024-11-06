function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

document.addEventListener('DOMContentLoaded', function() {
    renderHeader('admin'); 
    const API_BASE_URL = `${window.location.protocol}//${window.location.hostname}:3000/api`;
    const adminContent = document.getElementById('admin-content');
    const unauthorizedMessage = document.getElementById('unauthorized-message');
    const messageElement = document.getElementById('message');
    const makeAdminForm = document.getElementById('make-admin-form');
    const deleteUserForm = document.getElementById('delete-user-form');
    const searchUsersForm = document.getElementById('search-users-form');
    const getAllUsersButton = document.getElementById('get-all-users');
    const usersListElement = document.getElementById('users-list');

    const isAdmin = getCookie('isAdmin') === 'true';
    const token = getCookie('jwt');  

    if (!isAdmin || !token) {
        adminContent.style.display = 'none';
        unauthorizedMessage.style.display = 'block';
        return;
    }

    adminContent.style.display = 'block';
    unauthorizedMessage.style.display = 'none';

    function showMessage(message, isError = false) {
        messageElement.textContent = message;
        messageElement.className = isError ? 'alert alert-danger' : 'alert alert-success';
        messageElement.style.display = 'block';
        setTimeout(() => messageElement.style.display = 'none', 5000);
    }

    makeAdminForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const userId = document.getElementById('make-admin-userId').value;
        fetch(`${API_BASE_URL}/users/make-admin/${userId}`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'x-auth-token': token  
            },
            credentials: 'include'
        })
        .then(handleResponse)
        .then(data => {
            showMessage('User made admin successfully');
            makeAdminForm.reset();})
        .catch(handleError);
    });

    deleteUserForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const userId = document.getElementById('delete-userId').value;
        fetch(`${API_BASE_URL}/users/${userId}`, {
            method: 'DELETE',
            headers: { 
                'Content-Type': 'application/json',
                'x-auth-token': token  
            },
            credentials: 'include'
        })
        .then(handleResponse)
        .then(data => {
            showMessage('User deleted successfully');
            deleteUserForm.reset();})
        .catch(handleError);
    });

    searchUsersForm.addEventListener('submit', function(e) {
        e.preventDefault();

        // Collect all form values into an object
        const formData = {
            username: document.getElementById('search-username').value,
            email: document.getElementById('search-email').value,
            isAdmin: document.getElementById('search-isAdmin').value,
            minCredit: document.getElementById('search-minCredit').value,
            maxCredit: document.getElementById('search-maxCredit').value,
            sort: document.getElementById('search-sort').value,
            page: document.getElementById('search-page').value,
            limit: document.getElementById('search-limit').value
        };

        // Create URLSearchParams, filtering out empty values
        const queryParams = new URLSearchParams();
        Object.entries(formData).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
                queryParams.append(key, value);
            }
        });

        // Make the API request
        fetch(`${API_BASE_URL}/users/search?${queryParams}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token
            },
            credentials: 'include'
        })
            .then(handleResponse)
            .then(data => {
                displayUsers(data.users);
                showMessage('Users fetched successfully');
                searchUsersForm.reset();
            })
            .catch(handleError);
    });

    getAllUsersButton.addEventListener('click', function() {
        fetch(`${API_BASE_URL}/users/all`, {
            method: 'GET',
            headers: { 
                'Content-Type': 'application/json',
                'x-auth-token': token  
            },
            credentials: 'include'
        })
        .then(handleResponse)
        .then(data => {
            displayUsers(data);
            showMessage('All users fetched successfully');
        })
        .catch(handleError);
    });

    function handleResponse(response) {
        if (!response.ok) {
            return response.json().then(errorData => {
                throw errorData;
            });
        }
        return response.json();
    }

    function handleError(error) {
        showMessage(error.message || 'An error occurred', true);
    }

    function displayUsers(users) {
        usersListElement.innerHTML = '';
        users.forEach(user => {
            const userDiv = document.createElement('div');
            userDiv.className = 'card mb-2';
            userDiv.innerHTML = `
                <div class="card-body">
                    <h5 class="card-title">${user.username}</h5>
                    <p class="card-text">
                        Email: ${user.email}<br>
                        Admin: ${user.isAdmin ? 'Yes' : 'No'}<br>
                        Credit: ${user.credit}<br>
                        UserID: ${user._id}
                    </p>
                </div>
            `;
            usersListElement.appendChild(userDiv);
        });
    }
});