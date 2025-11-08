// Admin Functions for Sparsh NFC Dashboard
// Manages products, orders, and users

import { 
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    orderBy,
    limit,
    where
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

import { db } from "./firebase-config.js";

// ==================== ADMIN AUTHENTICATION ====================

// Get admin email from Firestore config
async function getAdminEmail() {
    try {
        const adminRef = doc(db, 'config', 'admin');
        const adminSnap = await getDoc(adminRef);
        
        if (adminSnap.exists()) {
            return { success: true, adminEmail: adminSnap.data().email };
        } else {
            // If no admin is set, return null (first time setup)
            return { success: true, adminEmail: null };
        }
    } catch (error) {
        console.error('Error getting admin email:', error);
        return { success: false, error: error.message };
    }
}

// Set admin email in Firestore config
async function setAdminEmail(email) {
    try {
        const adminRef = doc(db, 'config', 'admin');
        await setDoc(adminRef, {
            email: email,
            updatedAt: new Date().toISOString()
        }, { merge: true });
        
        return { success: true };
    } catch (error) {
        console.error('Error setting admin email:', error);
        return { success: false, error: error.message };
    }
}

// Hardcoded admin credentials
const ADMIN_EMAIL = 'admin@gmail.com';
const ADMIN_PASSWORD = '799020';

// Check if email/password matches admin credentials
function isAdminCredentials(email, password) {
    return email.toLowerCase() === ADMIN_EMAIL.toLowerCase() && password === ADMIN_PASSWORD;
}

// Check if current user is admin
async function isAdmin(userEmail) {
    try {
        // Check hardcoded admin email first
        if (userEmail && userEmail.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
            return { success: true, isAdmin: true };
        }
        
        // Also check Firestore for backward compatibility
        const adminResult = await getAdminEmail();
        if (!adminResult.success) {
            return { success: false, isAdmin: false, error: adminResult.error };
        }
        
        const isAdminUser = adminResult.adminEmail && adminResult.adminEmail.toLowerCase() === userEmail.toLowerCase();
        return { success: true, isAdmin: isAdminUser };
    } catch (error) {
        console.error('Error checking admin status:', error);
        return { success: false, isAdmin: false, error: error.message };
    }
}

// ==================== PRODUCTS ====================

// Get all products
async function getAllProducts() {
    try {
        const productsRef = collection(db, 'products');
        
        // Try with orderBy first, but fallback to simple query if it fails
        let querySnapshot;
        try {
            const q = query(productsRef, orderBy('createdAt', 'desc'));
            querySnapshot = await getDocs(q);
        } catch (orderByError) {
            // If orderBy fails (e.g., missing index or field), try without it
            console.warn('orderBy failed, trying without orderBy:', orderByError);
            querySnapshot = await getDocs(productsRef);
        }
        
        const products = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            products.push({ 
                id: doc.id, 
                ...data,
                // Ensure createdAt exists for sorting
                createdAt: data.createdAt || data.updatedAt || new Date().toISOString()
            });
        });
        
        // Sort manually if needed
        products.sort((a, b) => {
            const dateA = new Date(a.createdAt || 0);
            const dateB = new Date(b.createdAt || 0);
            return dateB - dateA; // Descending order
        });
        
        console.log(`Fetched ${products.length} products from Firestore`);
        return { success: true, products: products };
    } catch (error) {
        console.error('Error getting products:', error);
        return { success: false, error: error.message, products: [] };
    }
}

// Get single product
async function getProduct(productId) {
    try {
        const productRef = doc(db, 'products', productId);
        const productSnap = await getDoc(productRef);
        
        if (productSnap.exists()) {
            return { success: true, product: { id: productSnap.id, ...productSnap.data() } };
        } else {
            return { success: false, error: 'Product not found' };
        }
    } catch (error) {
        console.error('Error getting product:', error);
        return { success: false, error: error.message };
    }
}

// Add new product
async function addProduct(productData) {
    try {
        const productsRef = collection(db, 'products');
        
        const product = {
            ...productData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            active: productData.active !== undefined ? productData.active : true
        };
        
        const docRef = await addDoc(productsRef, product);
        
        return { success: true, productId: docRef.id };
    } catch (error) {
        console.error('Error adding product:', error);
        return { success: false, error: error.message };
    }
}

// Update product
async function updateProduct(productId, productData) {
    try {
        const productRef = doc(db, 'products', productId);
        
        const updateData = {
            ...productData,
            updatedAt: new Date().toISOString()
        };
        
        await updateDoc(productRef, updateData);
        
        return { success: true };
    } catch (error) {
        console.error('Error updating product:', error);
        return { success: false, error: error.message };
    }
}

// Delete product
async function deleteProduct(productId) {
    try {
        const productRef = doc(db, 'products', productId);
        await deleteDoc(productRef);
        
        return { success: true };
    } catch (error) {
        console.error('Error deleting product:', error);
        return { success: false, error: error.message };
    }
}

// ==================== ORDERS ====================

// Get all orders
async function getAllOrders() {
    try {
        const ordersRef = collection(db, 'orders');
        
        // Try with orderBy first, but fallback to simple query if it fails
        let querySnapshot;
        try {
            const q = query(ordersRef, orderBy('createdAt', 'desc'), limit(100));
            querySnapshot = await getDocs(q);
        } catch (orderByError) {
            // If orderBy fails (e.g., missing index or field), try without it
            console.warn('orderBy failed, trying without orderBy:', orderByError);
            querySnapshot = await getDocs(ordersRef);
        }
        
        const orders = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            orders.push({ 
                id: doc.id, 
                ...data,
                // Ensure createdAt exists for sorting
                createdAt: data.createdAt || data.updatedAt || new Date().toISOString()
            });
        });
        
        // Sort manually if needed
        orders.sort((a, b) => {
            const dateA = new Date(a.createdAt || 0);
            const dateB = new Date(b.createdAt || 0);
            return dateB - dateA; // Descending order
        });
        
        console.log(`Fetched ${orders.length} orders from Firestore`);
        return { success: true, orders: orders };
    } catch (error) {
        console.error('Error getting orders:', error);
        return { success: false, error: error.message, orders: [] };
    }
}

// Get single order
async function getOrder(orderId) {
    try {
        const orderRef = doc(db, 'orders', orderId);
        const orderSnap = await getDoc(orderRef);
        
        if (orderSnap.exists()) {
            return { success: true, order: { id: orderSnap.id, ...orderSnap.data() } };
        } else {
            return { success: false, error: 'Order not found' };
        }
    } catch (error) {
        console.error('Error getting order:', error);
        return { success: false, error: error.message };
    }
}

// Update order status
async function updateOrderStatus(orderId, status) {
    try {
        const orderRef = doc(db, 'orders', orderId);
        
        await updateDoc(orderRef, {
            status: status,
            updatedAt: new Date().toISOString()
        });
        
        return { success: true };
    } catch (error) {
        console.error('Error updating order status:', error);
        return { success: false, error: error.message };
    }
}

// ==================== USERS ====================

// Get all users
async function getAllUsers() {
    try {
        const usersRef = collection(db, 'users');
        
        // Try with orderBy first, but fallback to simple query if it fails
        let querySnapshot;
        try {
            const q = query(usersRef, orderBy('createdAt', 'desc'), limit(100));
            querySnapshot = await getDocs(q);
        } catch (orderByError) {
            // If orderBy fails (e.g., missing index or field), try without it
            console.warn('orderBy failed, trying without orderBy:', orderByError);
            try {
                // Try with lastUpdated
                const q2 = query(usersRef, orderBy('lastUpdated', 'desc'), limit(100));
                querySnapshot = await getDocs(q2);
            } catch (error2) {
                // If that also fails, get all without ordering
                console.warn('orderBy with lastUpdated also failed, getting all users:', error2);
                querySnapshot = await getDocs(usersRef);
            }
        }
        
        const users = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            users.push({ 
                id: doc.id, 
                uid: doc.id, 
                ...data,
                // Ensure createdAt exists for sorting
                createdAt: data.createdAt || data.lastUpdated || new Date().toISOString()
            });
        });
        
        // Sort manually if needed
        users.sort((a, b) => {
            const dateA = new Date(a.createdAt || 0);
            const dateB = new Date(b.createdAt || 0);
            return dateB - dateA; // Descending order
        });
        
        console.log(`Fetched ${users.length} users from Firestore`);
        return { success: true, users: users };
    } catch (error) {
        console.error('Error getting users:', error);
        return { success: false, error: error.message, users: [] };
    }
}

// Get single user
async function getUser(userId) {
    try {
        console.log('getUser called with userId:', userId);
        
        if (!userId) {
            console.error('getUser: userId is required');
            return { success: false, error: 'User ID is required' };
        }
        
        const userRef = doc(db, 'users', userId);
        console.log('User reference created:', userRef.path);
        
        const userSnap = await getDoc(userRef);
        console.log('User snapshot retrieved, exists:', userSnap.exists());
        
        if (userSnap.exists()) {
            const userData = userSnap.data();
            console.log('User data retrieved:', userData);
            return { success: true, user: { id: userSnap.id, uid: userSnap.id, ...userData } };
        } else {
            console.warn('User document does not exist for userId:', userId);
            // Try to find user by email as fallback
            try {
                const usersRef = collection(db, 'users');
                const q = query(usersRef, where('email', '==', userId));
                const querySnapshot = await getDocs(q);
                
                if (!querySnapshot.empty) {
                    const userDoc = querySnapshot.docs[0];
                    const userData = userDoc.data();
                    console.log('User found by email:', userData);
                    return { success: true, user: { id: userDoc.id, uid: userDoc.id, ...userData } };
                }
            } catch (queryError) {
                console.warn('Error querying by email:', queryError);
            }
            
            return { success: false, error: `User not found with ID: ${userId}` };
        }
    } catch (error) {
        console.error('Error getting user:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        return { success: false, error: error.message || 'Failed to get user' };
    }
}

// ==================== EXPORT ====================

// Export functions for use in admin dashboard
if (typeof window !== 'undefined') {
    window.adminFunctions = {
        // Admin Auth
        getAdminEmail,
        setAdminEmail,
        isAdmin,
        isAdminCredentials,
        ADMIN_EMAIL,
        ADMIN_PASSWORD,
        
        // Products
        getAllProducts,
        getProduct,
        addProduct,
        updateProduct,
        deleteProduct,
        
        // Orders
        getAllOrders,
        getOrder,
        updateOrderStatus,
        
        // Users
        getAllUsers,
        getUser
    };
}

export {
    getAdminEmail,
    setAdminEmail,
    isAdmin,
    getAllProducts,
    getProduct,
    addProduct,
    updateProduct,
    deleteProduct,
    getAllOrders,
    getOrder,
    updateOrderStatus,
    getAllUsers,
    getUser
};

