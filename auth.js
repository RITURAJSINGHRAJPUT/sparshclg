// Authentication Management System for Sparsh NFC
// Handles Firebase authentication, user state, and protected routes

// Initialize Firebase Auth (will be available after firebase-config.js loads)
let auth = null;

// Wait for Firebase to be available
document.addEventListener('DOMContentLoaded', function() {
    // Try to get auth from window (set by firebase-config.js)
    if (window.firebaseAuth) {
        auth = window.firebaseAuth;
        initializeAuthListeners();
    } else if (typeof firebase !== 'undefined' && firebase.auth) {
        auth = firebase.auth();
        initializeAuthListeners();
    } else {
        console.warn('Firebase Auth not available. Make sure Firebase SDK is loaded and configured.');
    }
});

// Auth state listener
function initializeAuthListeners() {
    auth.onAuthStateChanged(function(user) {
        if (user) {
            // User is signed in
            updateUIForLoggedInUser(user);
            saveUserToStorage(user);
        } else {
            // User is signed out
            updateUIForLoggedOutUser();
            clearUserFromStorage();
        }
    });
}

// Sign up with email and password
async function signUp(email, password, displayName = '') {
    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        // Update display name if provided
        if (displayName) {
            await user.updateProfile({
                displayName: displayName
            });
        }
        
        // Send email verification
        await user.sendEmailVerification();
        
        return { success: true, user: user };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Sign in with email and password
async function signIn(email, password) {
    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        return { success: true, user: userCredential.user };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Sign out
async function signOut() {
    try {
        await auth.signOut();
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Send password reset email
async function sendPasswordReset(email) {
    try {
        await auth.sendPasswordResetEmail(email);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Get current user
function getCurrentUser() {
    return auth ? auth.currentUser : null;
}

// Check if user is authenticated
function isAuthenticated() {
    return auth && auth.currentUser !== null;
}

// Update UI for logged in user
function updateUIForLoggedInUser(user) {
    // Update header login link to user profile
    const loginLinks = document.querySelectorAll('a[href*="login"], a[href="#"]');
    loginLinks.forEach(link => {
        if (link.textContent.trim().toLowerCase() === 'login') {
            link.textContent = user.displayName || user.email.split('@')[0];
            link.href = 'dashboard.html';
            link.classList.add('user-profile-link');
        }
    });
    
    // Add logout button
    addLogoutButton();
    
    // Update mobile menu
    updateMobileMenuForLoggedIn(user);
}

// Update UI for logged out user
function updateUIForLoggedOutUser() {
    const userProfileLinks = document.querySelectorAll('.user-profile-link');
    userProfileLinks.forEach(link => {
        link.textContent = 'Login';
        link.href = 'login.html';
        link.classList.remove('user-profile-link');
    });
    
    // Remove logout button
    removeLogoutButton();
    
    // Update mobile menu
    updateMobileMenuForLoggedOut();
}

// Add logout button to header
function addLogoutButton() {
    // Remove existing logout button if any
    removeLogoutButton();
    
    const loginLink = document.querySelector('a[href*="login"]:not(.mobile-menu-item)');
    if (loginLink && !document.getElementById('logout-btn')) {
        const logoutBtn = document.createElement('button');
        logoutBtn.id = 'logout-btn';
        logoutBtn.className = 'ml-4 text-sm font-medium text-gray-600 hover:text-primary transition hidden sm:inline-block';
        logoutBtn.textContent = 'Logout';
        logoutBtn.style.setProperty('--text-primary', 'var(--color-primary)');
        logoutBtn.addEventListener('click', handleLogout);
        
        // Insert after login link
        if (loginLink.parentNode) {
            loginLink.parentNode.insertBefore(logoutBtn, loginLink.nextSibling);
        }
    }
}

// Remove logout button
function removeLogoutButton() {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.remove();
    }
}

// Handle logout
async function handleLogout() {
    const result = await signOut();
    if (result.success) {
        window.location.href = 'index.html';
    } else {
        alert('Error logging out: ' + result.error);
    }
}

// Update mobile menu for logged in user
function updateMobileMenuForLoggedIn(user) {
    const mobileLoginLink = document.querySelector('.mobile-menu-item[href*="login"]');
    if (mobileLoginLink) {
        mobileLoginLink.textContent = user.displayName || user.email.split('@')[0];
        mobileLoginLink.href = 'dashboard.html';
    }
    
    // Add logout to mobile menu if not exists
    if (!document.getElementById('mobile-logout-btn')) {
        const logoutBtn = document.createElement('button');
        logoutBtn.id = 'mobile-logout-btn';
        logoutBtn.className = 'mobile-menu-item block w-full text-left text-lg font-medium text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition';
        logoutBtn.textContent = 'Logout';
        logoutBtn.addEventListener('click', handleLogout);
        
        const mobileMenu = document.querySelector('#mobile-menu nav');
        if (mobileMenu) {
            mobileMenu.appendChild(logoutBtn);
        }
    }
}

// Update mobile menu for logged out user
function updateMobileMenuForLoggedOut() {
    const mobileLoginLink = document.querySelector('.mobile-menu-item[href*="dashboard"]');
    if (mobileLoginLink) {
        mobileLoginLink.textContent = 'Login';
        mobileLoginLink.href = 'login.html';
    }
    
    const mobileLogoutBtn = document.getElementById('mobile-logout-btn');
    if (mobileLogoutBtn) {
        mobileLogoutBtn.remove();
    }
}

// Save user to localStorage
function saveUserToStorage(user) {
    const userData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        emailVerified: user.emailVerified
    };
    localStorage.setItem('sparshUser', JSON.stringify(userData));
}

// Clear user from localStorage
function clearUserFromStorage() {
    localStorage.removeItem('sparshUser');
}

// Require authentication for protected pages
function requireAuth() {
    if (!isAuthenticated()) {
        // Save the current URL to redirect back after login
        localStorage.setItem('redirectAfterLogin', window.location.pathname);
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// Export functions for use in other scripts
if (typeof window !== 'undefined') {
    window.sparshAuth = {
        signUp,
        signIn,
        signOut,
        sendPasswordReset,
        getCurrentUser,
        isAuthenticated,
        requireAuth
    };
}

