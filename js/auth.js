// Google Auth Configuration
const GOOGLE_CLIENT_ID = '830162422312-5h3nq1bohtktfhg4ksodt0jjsbeuria9.apps.googleusercontent.com';

let currentUser = null;

// Initialize Google Sign-In
function initGoogleAuth() {
    // Load saved user from localStorage
    const savedUser = localStorage.getItem('googleUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        updateAuthUI();
    }
}

// Handle Google Sign-In callback
function handleCredentialResponse(response) {
    const payload = parseJwt(response.credential);
    
    currentUser = {
        id: payload.sub,
        name: payload.name,
        email: payload.email,
        picture: payload.picture
    };
    
    // Save to localStorage
    localStorage.setItem('googleUser', JSON.stringify(currentUser));
    
    updateAuthUI();
    
    // Close login modal if open
    closeLoginModal();
}

// Parse JWT token
function parseJwt(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
}

// Update UI based on auth state
function updateAuthUI() {
    const authContainer = document.getElementById('authContainer');
    if (!authContainer) return;
    
    if (currentUser) {
        authContainer.innerHTML = `
            <div class="user-menu">
                <button class="user-btn" onclick="toggleUserDropdown()">
                    <img src="${currentUser.picture}" alt="${currentUser.name}" class="user-avatar">
                    <span class="user-name">${currentUser.name.split(' ')[0]}</span>
                </button>
                <div class="user-dropdown" id="userDropdown">
                    <div class="user-dropdown-header">
                        <img src="${currentUser.picture}" alt="${currentUser.name}">
                        <div>
                            <strong>${currentUser.name}</strong>
                            <small>${currentUser.email}</small>
                        </div>
                    </div>
                    <div class="user-dropdown-menu">
                        <a href="./kirim-berita/">📝 Kirim Berita</a>
                        <button onclick="logout()">🚪 Keluar</button>
                    </div>
                </div>
            </div>
        `;
    } else {
        authContainer.innerHTML = `
            <button class="login-btn" onclick="showLoginModal()">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                Masuk
            </button>
        `;
    }
}

// Toggle user dropdown
function toggleUserDropdown() {
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) {
        dropdown.classList.toggle('active');
    }
}

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.user-menu')) {
        const dropdown = document.getElementById('userDropdown');
        if (dropdown) dropdown.classList.remove('active');
    }
});

// Show login modal
function showLoginModal() {
    let modal = document.getElementById('loginModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'loginModal';
        modal.className = 'login-modal-overlay';
        modal.innerHTML = `
            <div class="login-modal">
                <button class="login-modal-close" onclick="closeLoginModal()">×</button>
                <div class="login-modal-content">
                    <h2>Masuk ke MarendalSatu</h2>
                    <p>Masuk untuk berkomentar dan mengirim berita</p>
                    <div id="googleSignInBtn" class="google-signin-wrapper"></div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Render Google button
        google.accounts.id.renderButton(
            document.getElementById('googleSignInBtn'),
            { 
                theme: 'outline', 
                size: 'large',
                width: 280,
                text: 'signin_with',
                shape: 'rectangular'
            }
        );
    }
    modal.classList.add('active');
}

// Close login modal
function closeLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// Logout
function logout() {
    currentUser = null;
    localStorage.removeItem('googleUser');
    updateAuthUI();
    
    // Reload page to reset state
    location.reload();
}

// Check if user is logged in
function isLoggedIn() {
    return currentUser !== null;
}

// Get current user
function getCurrentUser() {
    return currentUser;
}

// Require login for action
function requireLogin(callback) {
    if (isLoggedIn()) {
        callback();
    } else {
        showLoginModal();
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initGoogleAuth();
});
