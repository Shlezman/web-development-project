// twitter auth
const { TwitterApi } = require('twitter-api-v2');

const client = new TwitterApi({
  appKey: atob("RmxWdTNCclJ5WmkyTUtnM3RCRjdZUmN1cg=="),
  appSecret: atob("WEZMaUlzdWJqTjczYmpTVjdjTXhZdEpLRTVycjRUdWhjQUNtQ1hKZmNOeDgzbG1UMmU="),
  accessToken: atob("MTg1MTIzOTQ4OTE0MzcwNTYwMC1KV0dCNkkwVkswZk5OZXJWQ1RxamhEb3NrVXJjY0U="),
  accessSecret: atob("ajVFdWxYeGdja3dJWXNoSjlWNjE0NENTMjIzZEkxOEdrbW9LWnQ0SWl5QmMz")
});

//post tweet function
async function postTweet(message) {
    try {
      const response = await client.v2.tweet(message);
      console.log('Tweet posted:', response.data);
    } catch (error) {
      console.error('Error posting tweet:', error);
    }
  }

//const { prefix } = require('./config');
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  }

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('register-form');
    const messageElement = document.getElementById('register-message');
    const API_BASE_URL = `${window.location.protocol}//${window.location.hostname}:3000/api`;

    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        fetch(`${API_BASE_URL}/users/register`, {
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
            postTweet('A new member has joined us! welcome ${username}!');
        })
        .catch(error => {
            console.error('Error:', error);
            messageElement.textContent = 'Error: ' + (error.msg || error.errors[0].msg|| 'An unknown error occurred');
            messageElement.style.color = 'red';
        });
    });
});