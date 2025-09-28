// frontend/registration/registration.js

document.querySelector('.btn-signup').addEventListener('click', async function (e) {
    e.preventDefault(); // Prevent the form from submitting the old way

    const name = document.getElementById('fullName').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const messageDiv = document.getElementById('message');

    if (password !== confirmPassword) {
        messageDiv.textContent = 'Passwords do not match!';
        messageDiv.className = 'error'; // Use for styling
        return;
    }

    try {
        const res = await fetch('http://localhost:5500/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });

        const data = await res.json();

        if (res.ok) {
            messageDiv.textContent = 'Registration successful! Redirecting to login...';
            messageDiv.className = 'success';
            setTimeout(() => {
                window.location.href = '../login/login.html';
            }, 2000);
        } else {
            messageDiv.textContent = `Error: ${data.message}`;
            messageDiv.className = 'error';
        }
    } catch (error) {
        console.error("Registration Error:", error);
        messageDiv.textContent = 'Cannot connect to the server. Please try again later.';
        messageDiv.className = 'error';
    }
});