function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  }

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    const messageElement = document.getElementById('login-message');

    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const API_BASE_URL = `${window.location.protocol}//${window.location.hostname}:3000/api`;


        fetch(`${API_BASE_URL}/users/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
            credentials: 'include'
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(errorData => {
                    throw errorData;
                });
            }
            return response.json();
        })
        .then(data => {
            console.log('Login successful');
            const username = getCookie('username');
            console.log('Logged in user:', username);
            window.location.href = 'index.html';
            
        })
        .catch(error => {
            console.error('Error:', error);
            messageElement.textContent = 'Error: ' + (error.msg || 'An unknown error occurred');
            messageElement.style.color = 'red';
        });
    });
});