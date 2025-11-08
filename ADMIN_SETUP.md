# Admin Dashboard Setup Guide

## Admin Credentials

**Email:** `admin@gmail.com`  
**Password:** `799020`

## Setup Instructions

### Option 1: Automatic Setup (Recommended)

1. Go to `login.html`
2. Enter admin credentials:
   - Email: `admin@gmail.com`
   - Password: `799020`
3. Click "Sign in"
4. The system will automatically:
   - Create the admin account in Firebase if it doesn't exist
   - Set the admin email in Firestore
   - Redirect you to the admin dashboard

### Option 2: Manual Setup in Firebase Console

If automatic setup doesn't work, create the admin account manually:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (`sparsh-ecom`)
3. Go to **Authentication** → **Users**
4. Click **Add user**
5. Enter:
   - Email: `admin@gmail.com`
   - Password: `799020`
6. Click **Add user**
7. Now login with these credentials on `login.html`

## Accessing Admin Dashboard

1. Login with admin credentials on `login.html`
2. You'll be automatically redirected to `admin-dashboard.html`
3. If you're already logged in, navigate directly to `admin-dashboard.html`

## Features

- **Products Management**: Add, edit, delete, and view all products
- **Orders Management**: View all orders and order details
- **Users Management**: View all registered users and their profiles
- **Admin Profile**: Click on your profile card in the sidebar to view your admin profile

## Troubleshooting

### "Please login to access admin dashboard" error

1. Make sure you're logged in with `admin@gmail.com`
2. Check browser console for errors
3. Clear browser cache and cookies
4. Try logging out and logging back in

### Admin account not found

1. Create the admin account manually in Firebase Console (see Option 2 above)
2. Or use the automatic setup (Option 1)

### Cannot access dashboard

1. Verify your email is exactly `admin@gmail.com` (case-insensitive)
2. Check that you're using password `799020`
3. Make sure Firebase Authentication is enabled in your project
4. Check browser console for detailed error messages

