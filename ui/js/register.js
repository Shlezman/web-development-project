function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  }

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('register-form');
    const messageElement = document.getElementById('register-message');

    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        fetch('http://localhost:3000/api/users/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, email, password }),
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
            console.log('Registration successful');
            window.location.href = 'login.html';
            
        })
        .catch(error => {
            console.error('Error:', error);
            messageElement.textContent = 'Error: ' + (error.msg || error.errors[0].msg|| 'An unknown error occurred');
            messageElement.style.color = 'red';
        });
    });
});