// DOM Elements
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const showRegisterLink = document.getElementById('show-register');
const showLoginLink = document.getElementById('show-login');
const signinForm = document.getElementById('signin-form');
const signupForm = document.getElementById('signup-form');

// Show/Hide Forms
function showRegister() {
    loginForm.classList.add('hidden');
    registerForm.classList.remove('hidden');
}

function showLogin() {
    registerForm.classList.add('hidden');
    loginForm.classList.remove('hidden');
}

// Event Listeners
if (showRegisterLink) {
    showRegisterLink.addEventListener('click', (e) => {
        e.preventDefault();
        showRegister();
    });
}

if (showLoginLink) {
    showLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        showLogin();
    });
}

// Handle Form Submissions
if (signinForm) {
    signinForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        try {
            // Here you would typically make an API call to your backend
            // For demo purposes, we'll just simulate a successful login
            const user = { email, name: email.split('@')[0] };
            localStorage.setItem('user', JSON.stringify(user));
            showAuthMessage('Login successful! Redirecting...', 'success');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        } catch (error) {
            showAuthMessage('Invalid email or password', 'error');
        }
    });
}

if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        if (password !== confirmPassword) {
            showAuthMessage('Passwords do not match', 'error');
            return;
        }

        try {
            // Here you would typically make an API call to your backend
            // For demo purposes, we'll just simulate a successful registration
            const user = { email, name };
            localStorage.setItem('user', JSON.stringify(user));
            showAuthMessage('Registration successful! Redirecting...', 'success');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        } catch (error) {
            showAuthMessage('Registration failed. Please try again.', 'error');
        }
    });
}

// Show auth messages
function showAuthMessage(message, type) {
    // Remove any existing message
    const existingMessage = document.querySelector('.auth-message');
    if (existingMessage) {
        existingMessage.remove();
    }

    // Create new message
    const messageDiv = document.createElement('div');
    messageDiv.className = `auth-message ${type}`;
    messageDiv.textContent = message;

    // Insert message at the top of the form
    const activeForm = document.querySelector('.auth-form:not(.hidden)');
    const form = activeForm.querySelector('form');
    form.insertBefore(messageDiv, form.firstChild);

    // Remove message after 5 seconds
    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
}

// Check Authentication Status
function checkAuth() {
    const user = localStorage.getItem('user');
    if (user && window.location.pathname.includes('login.html')) {
        window.location.href = 'index.html';
    }
}

// Initialize
checkAuth();