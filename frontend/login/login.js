// frontend/login/login.js

document.addEventListener('DOMContentLoaded', () => {
  // --- Password visibility toggle ---
  const toggleBtn = document.querySelector('.toggle-password');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const input = document.getElementById('password');
      const icon = toggleBtn.querySelector('i');
      if (input.type === 'password') {
        input.type = 'text';
        icon.classList.replace('fa-eye', 'fa-eye-slash');
      } else {
        input.type = 'password';
        icon.classList.replace('fa-eye-slash', 'fa-eye');
      }
    });
  }

  // --- Login form submission ---
  const loginBtn = document.querySelector('.btn-login');
  if (loginBtn) {
    loginBtn.addEventListener('click', async function (e) {
      e.preventDefault();

      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const errorEl = document.getElementById('login-error');

      // Clear previous error
      if (errorEl) { errorEl.textContent = ''; errorEl.style.display = 'none'; }

      // Show loading state
      const originalText = loginBtn.textContent;
      loginBtn.innerHTML = '<span class="loading-spinner"></span>Logging in…';
      loginBtn.disabled = true;

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

          loginBtn.textContent = 'Success ✓';
          // Redirect to the main dashboard
          window.location.href = '../dashboard/index.html';
        } else {
          if (errorEl) {
            errorEl.textContent = data.message || 'Login failed. Please check your credentials.';
            errorEl.style.display = 'block';
          }
          loginBtn.textContent = originalText;
          loginBtn.disabled = false;
        }
      } catch (error) {
        console.error("Login Error:", error);
        if (errorEl) {
          errorEl.textContent = 'Cannot connect to the server. Please try again later.';
          errorEl.style.display = 'block';
        }
        loginBtn.textContent = originalText;
        loginBtn.disabled = false;
      }
    });
  }
});