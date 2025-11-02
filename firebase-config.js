// Firebase Configuration and Initialization
// Using Firebase Modular SDK v12.5.0

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-storage.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCzMMRgfGToTivdiTzNA72LUy0iKk3tr4w",
    authDomain: "sparsh-ecom.firebaseapp.com",
    projectId: "sparsh-ecom",
    storageBucket: "sparsh-ecom.firebasestorage.app",
    messagingSenderId: "405204364717",
    appId: "1:405204364717:web:47e1d41102f1f6b3894524"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Export for use in other scripts
if (typeof window !== 'undefined') {
    window.firebaseApp = app;
    window.firebaseAuth = auth;
    window.firebaseDb = db;
    window.firebaseStorage = storage;
}

export { app, auth, db, storage };

