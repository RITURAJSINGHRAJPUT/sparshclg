# Firestore Security Rules Setup Guide

## Problem
You're seeing "Missing or insufficient permissions" error when trying to view orders and users in the admin dashboard.

## Solution
Update your Firestore security rules to allow admin access.

## Step-by-Step Instructions

### Option 1: Update Rules in Firebase Console (Recommended)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **sparsh-ecom**
3. Navigate to **Firestore Database** → **Rules** tab
4. Replace the existing rules with the following:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to check if user is admin
    function isAdmin() {
      return request.auth != null && 
             request.auth.token.email != null &&
             request.auth.token.email.toLowerCase() == 'admin@gmail.com';
    }
    
    // Helper function to check if user owns the resource
    function isOwner(userId) {
      return request.auth != null && request.auth.uid == userId;
    }
    
    // Config collection - only admin can read/write
    match /config/{document=**} {
      allow read, write: if isAdmin();
    }
    
    // Products collection - public read, admin write
    match /products/{productId} {
      allow read: if true; // Anyone can read products
      allow create, update, delete: if isAdmin(); // Only admin can modify
    }
    
    // Orders collection
    match /orders/{orderId} {
      // Users can read their own orders
      allow read: if isOwner(resource.data.userId);
      // Admin can read all orders
      allow read: if isAdmin();
      // Users can create their own orders
      allow create: if request.auth != null && 
                       request.resource.data.userId == request.auth.uid;
      // Admin can update/delete any order
      allow update, delete: if isAdmin();
    }
    
    // Users collection
    match /users/{userId} {
      // Users can read their own profile
      allow read: if isOwner(userId);
      // Admin can read all user profiles
      allow read: if isAdmin();
      // Users can create/update their own profile
      allow create, update: if request.auth != null && 
                              request.resource.data.uid == request.auth.uid;
      // Admin can update/delete any user profile
      allow update, delete: if isAdmin();
    }
    
    // Default: deny all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

5. Click **Publish** to save the rules
6. Wait a few seconds for the rules to propagate
7. Refresh your admin dashboard

### Option 2: Using Firebase CLI (Advanced)

If you have Firebase CLI installed:

1. Copy the `firestore.rules` file to your project root
2. Run:
   ```bash
   firebase deploy --only firestore:rules
   ```

## What These Rules Do

1. **Admin Access**: Users with email `admin@gmail.com` can:
   - Read/write all products
   - Read all orders and users
   - Update/delete any order or user profile
   - Manage config collection

2. **User Access**: Regular authenticated users can:
   - Read all products (public)
   - Read their own orders
   - Create their own orders
   - Read/update their own profile

3. **Security**: All other access is denied by default

## Testing

After updating the rules:

1. Make sure you're logged in as `admin@gmail.com`
2. Refresh the admin dashboard
3. Navigate to Orders and Users sections
4. You should now see the data without permission errors

## Troubleshooting

### Still seeing permission errors?

1. **Verify you're logged in as admin**:
   - Check the browser console
   - Look for your email in the authentication state
   - Make sure it's exactly `admin@gmail.com`

2. **Check Firestore rules are published**:
   - Go to Firebase Console → Firestore → Rules
   - Verify the rules are saved and published
   - Rules take a few seconds to propagate

3. **Clear browser cache**:
   - Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
   - Or clear cache and cookies

4. **Check Firebase Console for errors**:
   - Go to Firebase Console → Firestore → Rules
   - Look for any validation errors
   - Fix any syntax errors

### Rules not working?

If the rules still don't work, you can temporarily use more permissive rules for testing (NOT recommended for production):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

**⚠️ WARNING**: This allows any authenticated user to read/write everything. Only use for testing, then switch back to the secure rules above.

## Security Notes

- The admin email is hardcoded as `admin@gmail.com` in the rules
- Make sure this matches your actual admin email
- For production, consider using custom claims instead of email checking
- Regularly review and update your security rules

