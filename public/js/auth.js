class Auth {
  static async register(username, email, password) {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, email, password })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: error.message };
    }
  }

  static async login(email, password) {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();
      localStorage.setItem('token', data.token);
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      return data;
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: error.message };
    }
  }

  static logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login.html';
  }

  static isAuthenticated() {
    return !!localStorage.getItem('token');
  }

  static getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  static showLoginForm() {
    document.getElementById('authForms').innerHTML = `
      <div class="auth-form">
        <h3 class="mb-3">Login</h3>
        <form id="loginForm">
          <div class="mb-3 position-relative">
            <label for="loginEmail" class="form-label">Email</label>
            <input type="email" class="form-control" id="loginEmail" required>
          </div>
          <div class="mb-3 position-relative">
            <label for="loginPassword" class="form-label">Password</label>
            <input type="password" class="form-control" id="loginPassword" required>
            <button type="button" class="btn btn-link position-absolute end-0 top-50 translate-middle-y pe-3" id="togglePassword">
              <i class="fas fa-eye"></i>
            </button>
          </div>
          <button type="submit" class="btn btn-primary">Login</button>
        </form>
      </div>
    `;
    
    // Password toggle functionality
    document.getElementById('togglePassword').addEventListener('click', function() {
      const passwordInput = document.getElementById('loginPassword');
      const icon = this.querySelector('i');
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);
      icon.classList.toggle('fa-eye-slash');
    });
    
    // Form submission
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const email = document.getElementById('loginEmail').value;
      const password = document.getElementById('loginPassword').value;

      const result = await Auth.login(email, password);
      if (result.success) {
        window.location.href = '/dashboard.html';
      } else {
        alert(result.message || 'Login failed');
      }
    });
  }
}