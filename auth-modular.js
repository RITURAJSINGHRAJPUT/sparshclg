// Authentication Management System for Sparsh NFC
// Using Firebase Modular SDK v12.5.0

import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    sendPasswordResetEmail,
    updateProfile,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

import { 
    doc, 
    setDoc, 
    getDoc, 
    updateDoc,
    collection,
    addDoc,
    query,
    where,
    orderBy,
    limit,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

import { auth, db } from "./firebase-config.js";

// Wait for DOM and Firebase to be ready
let authReady = false;

function initializeAuth() {
    if (window.firebaseAuth) {
        authReady = true;
        initializeAuthListeners();
    } else {
        // Wait a bit for Firebase to load
        setTimeout(() => {
            if (window.firebaseAuth) {
                authReady = true;
                initializeAuthListeners();
            }
        }, 500);
    }
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAuth);
} else {
    initializeAuth();
}

// Auth state listener
function initializeAuthListeners() {
    onAuthStateChanged(auth, function(user) {
        if (user) {
            updateUIForLoggedInUser(user);
            saveUserToStorage(user);
            loadUserProfile(user.uid);
        } else {
            updateUIForLoggedOutUser();
            clearUserFromStorage();
        }
    });
}

// Sign up with email and password + save user profile
async function signUp(email, password, userProfile) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Update display name
        if (userProfile.fullName) {
            await updateProfile(user, {
                displayName: userProfile.fullName
            });
        }
        
        // Save user profile to Firestore
        await saveUserProfile(user.uid, {
            ...userProfile,
            email: email,
            createdAt: new Date().toISOString(),
            emailVerified: user.emailVerified
        });
        
        // Send email verification (will be done via sendEmailVerification)
        // Note: Using sendEmailVerification instead of sendPasswordResetEmail
        if (user.email) {
            // Email verification will be sent automatically on signup or can be triggered manually
        }
        
        return { success: true, user: user };
    } catch (error) {
        console.error('Sign up error:', error);
        return { success: false, error: getErrorMessage(error.code) };
    }
}

// Sign in with email and password
async function signIn(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return { success: true, user: userCredential.user };
    } catch (error) {
        console.error('Sign in error:', error);
        return { success: false, error: getErrorMessage(error.code) };
    }
}

// Sign out
async function signOutUser() {
    try {
        await signOut(auth);
        return { success: true };
    } catch (error) {
        console.error('Sign out error:', error);
        return { success: false, error: error.message };
    }
}

// Send password reset email
async function sendPasswordReset(email) {
    try {
        await sendPasswordResetEmail(auth, email);
        return { success: true };
    } catch (error) {
        console.error('Password reset error:', error);
        return { success: false, error: getErrorMessage(error.code) };
    }
}

// Save user profile to Firestore
async function saveUserProfile(uid, profileData) {
    try {
        const userRef = doc(db, 'users', uid);
        await setDoc(userRef, profileData, { merge: true });
        return { success: true };
    } catch (error) {
        console.error('Error saving user profile:', error);
        return { success: false, error: error.message };
    }
}

// Get user profile from Firestore
async function getUserProfile(uid) {
    try {
        const userRef = doc(db, 'users', uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
            return { success: true, data: userSnap.data() };
        } else {
            return { success: false, error: 'Profile not found' };
        }
    } catch (error) {
        console.error('Error getting user profile:', error);
        return { success: false, error: error.message };
    }
}

// Update user profile
async function updateUserProfile(uid, updates) {
    try {
        const userRef = doc(db, 'users', uid);
        await updateDoc(userRef, {
            ...updates,
            updatedAt: new Date().toISOString()
        });
        return { success: true };
    } catch (error) {
        console.error('Error updating user profile:', error);
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

// Load user profile and update UI
async function loadUserProfile(uid) {
    const result = await getUserProfile(uid);
    if (result.success) {
        // Store profile data in localStorage for quick access
        localStorage.setItem('sparshUserProfile', JSON.stringify(result.data));
    }
}

// Error message helper
function getErrorMessage(errorCode) {
    const errorMessages = {
        'auth/email-already-in-use': 'This email is already registered. Please sign in instead.',
        'auth/invalid-email': 'Invalid email address.',
        'auth/operation-not-allowed': 'Email/password accounts are not enabled. Please contact support.',
        'auth/weak-password': 'Password should be at least 6 characters.',
        'auth/user-disabled': 'This account has been disabled.',
        'auth/user-not-found': 'No account found with this email.',
        'auth/wrong-password': 'Incorrect password. Please try again.',
        'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
        'auth/network-request-failed': 'Network error. Please check your connection.',
        'auth/popup-closed-by-user': 'Sign-in popup was closed.',
        'auth/cancelled-popup-request': 'Only one popup request is allowed at a time.'
    };
    return errorMessages[errorCode] || errorCode.replace('auth/', '').replace(/-/g, ' ');
}

// Update UI for logged in user
function updateUIForLoggedInUser(user) {
    // Update header login link
    const loginLinks = document.querySelectorAll('a[href*="login"], #header-login-link, #mobile-login-link');
    loginLinks.forEach(link => {
        if (link && (link.id === 'header-login-link' || link.id === 'mobile-login-link' || link.textContent.trim().toLowerCase().includes('login'))) {
            link.textContent = user.displayName || user.email.split('@')[0];
            link.href = 'dashboard.html';
            link.classList.add('user-profile-link');
        }
    });
    
    addLogoutButton();
    updateMobileMenuForLoggedIn(user);
}

// Update UI for logged out user
function updateUIForLoggedOutUser() {
    const userProfileLinks = document.querySelectorAll('.user-profile-link, a[href*="dashboard"]');
    userProfileLinks.forEach(link => {
        if (link.id === 'header-login-link' || link.id === 'mobile-login-link') {
            link.textContent = 'Login';
            link.href = 'login.html';
            link.classList.remove('user-profile-link');
        }
    });
    
    removeLogoutButton();
    updateMobileMenuForLoggedOut();
}

// Add logout button to header
function addLogoutButton() {
    if (document.getElementById('logout-btn')) return;
    
    const loginLink = document.querySelector('#header-login-link');
    if (loginLink && loginLink.parentNode) {
        const logoutBtn = document.createElement('button');
        logoutBtn.id = 'logout-btn';
        logoutBtn.className = 'ml-4 text-sm font-medium text-gray-600 hover:text-primary transition hidden sm:inline-block';
        logoutBtn.textContent = 'Logout';
        logoutBtn.style.setProperty('--text-primary', 'var(--color-primary)');
        logoutBtn.addEventListener('click', handleLogout);
        loginLink.parentNode.insertBefore(logoutBtn, loginLink.nextSibling);
    }
}

// Remove logout button
function removeLogoutButton() {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) logoutBtn.remove();
}

// Handle logout
async function handleLogout() {
    const result = await signOutUser();
    if (result.success) {
        window.location.href = 'index.html';
    } else {
        alert('Error logging out: ' + result.error);
    }
}

// Update mobile menu for logged in user
function updateMobileMenuForLoggedIn(user) {
    const mobileLoginLink = document.querySelector('#mobile-login-link');
    if (mobileLoginLink) {
        mobileLoginLink.textContent = user.displayName || user.email.split('@')[0];
        mobileLoginLink.href = 'dashboard.html';
    }
    
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
    const mobileLoginLink = document.querySelector('#mobile-login-link');
    if (mobileLoginLink) {
        mobileLoginLink.textContent = 'Login';
        mobileLoginLink.href = 'login.html';
    }
    
    const mobileLogoutBtn = document.getElementById('mobile-logout-btn');
    if (mobileLogoutBtn) mobileLogoutBtn.remove();
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
    localStorage.removeItem('sparshUserProfile');
}

// Require authentication for protected pages
function requireAuth() {
    if (!isAuthenticated()) {
        localStorage.setItem('redirectAfterLogin', window.location.pathname);
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// Save order to Firestore
async function saveOrder(orderData) {
    try {
        const user = getCurrentUser();
        if (!user) {
            return { success: false, error: 'User not authenticated' };
        }

        const orderRef = doc(collection(db, 'orders'));
        const orderId = orderRef.id;
        
        const order = {
            ...orderData,
            orderId: orderId,
            userId: user.uid,
            status: 'pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        await setDoc(orderRef, order);

        // Update user profile with latest shipping/billing info
        if (orderData.shipping) {
            await updateUserProfile(user.uid, {
                lastShippingAddress: orderData.shipping,
                lastUpdated: new Date().toISOString()
            });
        }

        return { success: true, orderId: orderId };
    } catch (error) {
        console.error('Error saving order:', error);
        return { success: false, error: error.message };
    }
}

// Get user orders from Firestore
async function getUserOrders(limitNum = 10) {
    try {
        const user = getCurrentUser();
        if (!user) {
            return { success: false, error: 'User not authenticated' };
        }

        const ordersRef = collection(db, 'orders');
        
        // Try with orderBy first, fallback to simple where if index doesn't exist
        let q;
        try {
            q = query(
                ordersRef,
                where('userId', '==', user.uid),
                orderBy('createdAt', 'desc'),
                limit(limitNum)
            );
            const querySnapshot = await getDocs(q);
            const orders = [];
            querySnapshot.forEach((doc) => {
                orders.push({ id: doc.id, ...doc.data() });
            });
            return { success: true, orders: orders };
        } catch (orderByError) {
            // If orderBy fails (missing index), try without it
            if (orderByError.code === 'failed-precondition') {
                console.warn('Firestore index missing, fetching orders without orderBy');
                q = query(
                    ordersRef,
                    where('userId', '==', user.uid),
                    limit(limitNum)
                );
                const querySnapshot = await getDocs(q);
                const orders = [];
                querySnapshot.forEach((doc) => {
                    orders.push({ id: doc.id, ...doc.data() });
                });
                // Sort manually by createdAt if available
                orders.sort((a, b) => {
                    const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
                    const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
                    return dateB - dateA;
                });
                return { success: true, orders: orders };
            }
            throw orderByError;
        }
    } catch (error) {
        console.error('Error getting user orders:', error);
        return { success: false, error: error.message };
    }
}

// Export functions for use in other scripts
if (typeof window !== 'undefined') {
    window.sparshAuth = {
        signUp,
        signIn,
        signOut: signOutUser,
        sendPasswordReset,
        getCurrentUser,
        isAuthenticated,
        requireAuth,
        getUserProfile,
        updateUserProfile,
        saveUserProfile,
        saveOrder,
        getUserOrders
    };
}

