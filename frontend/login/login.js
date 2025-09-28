// frontend/login/login.js

document.querySelector('.btn-login').addEventListener('click', async function (e) {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    // You can add a <p id="message"></p> to your login.html for error messages

    try {
        const res = await fetch('http://localhost:5500/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (res.ok) {
            // Store user info and token from YOUR backend
            localStorage.setItem('healthnova_user', JSON.stringify(data.user));
            localStorage.setItem('healthnova_token', data.token);

            // Redirect to the main dashboard
            window.location.href = '../dashboard/index.html'; 
        } else {
            alert(`Login Failed: ${data.message}`);
        }
    } catch (error) {
        console.error("Login Error:", error);
        alert('An error occurred. Please check your connection and try again.');
    }
});