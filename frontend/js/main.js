const API_URL = 'http://localhost:3000/api';

const loginForm = document.getElementById('login');
const registerForm = document.getElementById('register');
const showRegisterLink = document.getElementById('show-register');
const showLoginLink = document.getElementById('show-login');
const loginDiv = document.getElementById('login-form');
const registerDiv = document.getElementById('register-form');
const authMessage = document.getElementById('auth-message');

// Toggle between forms
showRegisterLink.addEventListener('click', (e) => {
    e.preventDefault();
    loginDiv.style.display = 'none';
    registerDiv.style.display = 'block';
});

showLoginLink.addEventListener('click', (e) => {
    e.preventDefault();
    registerDiv.style.display = 'none';
    loginDiv.style.display = 'block';
});

// Register logic
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;

    const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
    });

    const data = await res.json();
    if (res.ok) {
        authMessage.textContent = 'Registration successful! Please log in.';
        authMessage.style.color = 'green';
        registerForm.reset();
        showLoginLink.click(); // Switch to login form
    } else {
        authMessage.textContent = `Error: ${data.message}`;
        authMessage.style.color = 'red';
    }
});

// Login logic
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (res.ok) {
        // Store user info and token in localStorage
        localStorage.setItem('healthnova_user', JSON.stringify(data.user));
        localStorage.setItem('healthnova_token', data.token);
        // Redirect to dashboard
        window.location.href = 'dashboard.html';
    } else {
        authMessage.textContent = `Error: ${data.message}`;
        authMessage.style.color = 'red';
    }
});