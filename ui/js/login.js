//const { prefix } = require('./config');
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
        
        fetch(`https://bug-free-engine-x9j4gp9pw5v3r6g-3000.app.github.dev/api/users/login`, {
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