function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

$(document).ready(function () {
    const registerForm = $('#register-form');
    const messageElement = $('#register-message');
    const API_BASE_URL = `${window.location.protocol}//${window.location.hostname}:3000/api`;
    const token = getCookie('jwt');

    // Post a welcome post after registration
    function postFB(post) {
        $.ajax({
            url: `${API_BASE_URL}/fb`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token
            },
            data: JSON.stringify({ "fb": post }),
            success: function (result) {
                console.log('fb post posted:', result);
            },
            error: function (error) {
                console.error('Error posting on fb:', error);
            }
        });
    }
    registerForm.on('submit', function (e) {
        e.preventDefault();

        const username = $('#username').val();
        const email = $('#email').val();
        const password = $('#password').val();

        $.ajax({
            url: `${API_BASE_URL}/users/register`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            data: JSON.stringify({ username, email, password }),
            xhrFields: { withCredentials: true },
            success: function (data) {
                console.log('Registration successful');
                postFB(`A new member has joined us! Welcome ${username}!`);
                window.location.href = 'login.html';
            },
            error: function (jqXHR) {
                const errorMessage = jqXHR.responseJSON?.msg || jqXHR.responseJSON?.errors?.[0]?.msg || 'An unknown error occurred';
                console.error('Error:', errorMessage);
                messageElement.text('Error: ' + errorMessage).css('color', 'red');
            }
        });
    });
});
