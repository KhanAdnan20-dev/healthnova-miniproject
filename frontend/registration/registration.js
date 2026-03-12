// frontend/registration/registration.js

document.addEventListener('DOMContentLoaded', () => {
  // --- Password visibility toggle (for both password fields) ---
  document.querySelectorAll('.toggle-password').forEach(toggleBtn => {
    toggleBtn.addEventListener('click', () => {
      const input = toggleBtn.parentElement.querySelector('input');
      const icon = toggleBtn.querySelector('i');
      if (input.type === 'password') {
        input.type = 'text';
        icon.classList.replace('fa-eye', 'fa-eye-slash');
      } else {
        input.type = 'password';
        icon.classList.replace('fa-eye-slash', 'fa-eye');
      }
    });
  });

  // --- Password strength meter ---
  const passwordInput = document.getElementById('password');
  const strengthBar = document.getElementById('strength-bar');
  const strengthText = document.getElementById('strength-text');

  const getPasswordStrength = (pw) => {
    let score = 0;
    if (pw.length >= 6) score++;
    if (pw.length >= 10) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score; // 0-5
  };

  if (passwordInput && strengthBar && strengthText) {
    passwordInput.addEventListener('input', () => {
      const pw = passwordInput.value;
      if (!pw) {
        strengthBar.style.width = '0';
        strengthText.textContent = '';
        return;
      }
      const score = getPasswordStrength(pw);
      const levels = [
        { width: '20%', color: '#dc3545', text: 'Very Weak' },
        { width: '40%', color: '#fd7e14', text: 'Weak' },
        { width: '60%', color: '#ffc107', text: 'Fair' },
        { width: '80%', color: '#28a745', text: 'Strong' },
        { width: '100%', color: '#155724', text: 'Very Strong' },
      ];
      const level = levels[Math.max(0, Math.min(score, levels.length) - 1)];
      strengthBar.style.width = level.width;
      strengthBar.style.background = level.color;
      strengthText.textContent = level.text;
      strengthText.style.color = level.color;

      // Also re-check match if confirm field has value
      checkPasswordMatch();
    });
  }

  // --- Real-time password match validation ---
  const confirmInput = document.getElementById('confirmPassword');
  const matchMsg = document.getElementById('password-match-msg');

  const checkPasswordMatch = () => {
    if (!confirmInput || !matchMsg || !passwordInput) return;
    const confirm = confirmInput.value;
    if (!confirm) { matchMsg.textContent = ''; matchMsg.className = 'password-match-msg'; return; }
    if (passwordInput.value === confirm) {
      matchMsg.textContent = '✓ Passwords match';
      matchMsg.className = 'password-match-msg match-success';
    } else {
      matchMsg.textContent = '✗ Passwords do not match';
      matchMsg.className = 'password-match-msg match-error';
    }
  };

  if (confirmInput) {
    confirmInput.addEventListener('input', checkPasswordMatch);
  }

  // --- Signup form submission with loading state ---
  const signupBtn = document.querySelector('.btn-signup');
  if (signupBtn) {
    signupBtn.addEventListener('click', async function (e) {
      e.preventDefault();

      const name = document.getElementById('fullName').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirmPassword').value;
      const messageDiv = document.getElementById('message');

      if (password !== confirmPassword) {
        messageDiv.textContent = 'Passwords do not match!';
        messageDiv.className = 'error';
        return;
      }

      // Show loading state
      const originalText = signupBtn.textContent;
      signupBtn.innerHTML = '<span class="loading-spinner"></span>Creating Account…';
      signupBtn.disabled = true;

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
          signupBtn.textContent = 'Success ✓';
          setTimeout(() => {
            window.location.href = '../login/login.html';
          }, 2000);
        } else {
          messageDiv.textContent = `Error: ${data.message}`;
          messageDiv.className = 'error';
          signupBtn.textContent = originalText;
          signupBtn.disabled = false;
        }
      } catch (error) {
        console.error("Registration Error:", error);
        messageDiv.textContent = 'Cannot connect to the server. Please try again later.';
        messageDiv.className = 'error';
        signupBtn.textContent = originalText;
        signupBtn.disabled = false;
      }
    });
  }
});