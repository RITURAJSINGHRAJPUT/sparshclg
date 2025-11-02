# Firebase Authentication Setup Guide

This guide will help you set up Firebase Authentication for your Sparsh NFC website.

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Follow the setup wizard:
   - Enter project name (e.g., "Sparsh NFC")
   - Enable/disable Google Analytics (optional)
   - Click "Create project"

## Step 2: Enable Authentication

1. In your Firebase project, go to **Authentication** in the left sidebar
2. Click **Get Started**
3. Go to the **Sign-in method** tab
4. Enable the following providers:
   - **Email/Password**: Click, enable, and save
   - **Google**: Click, enable, and save (optional)
   - **Facebook**: Click, enable, and save (optional)

## Step 3: Get Your Firebase Configuration

1. In Firebase Console, click the ⚙️ (gear icon) next to "Project Overview"
2. Select **Project settings**
3. Scroll down to **Your apps** section
4. Click the **Web** icon (`</>`) if you haven't added a web app yet
5. Register your app with a nickname (e.g., "Sparsh NFC Web")
6. Copy the `firebaseConfig` object

## Step 4: Update firebase-config.js

1. Open `firebase-config.js` in your project
2. Replace the placeholder values with your Firebase configuration:

```javascript
const firebaseConfig = {
    apiKey: "AIzaSyC...",                    // Your API Key
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abc123"
};
```

## Step 5: Configure Firebase Security Rules (Optional)

For production, update your Firestore security rules:

1. Go to **Firestore Database** in Firebase Console
2. Go to **Rules** tab
3. Add rules to protect user data:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /orders/{orderId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Step 6: Test Authentication

1. Open `login.html` in your browser
2. Try creating a new account
3. Check Firebase Console > Authentication > Users to verify the user was created
4. Try signing in with the credentials

## Features Included

✅ Email/Password Authentication  
✅ Sign Up with email verification  
✅ Sign In  
✅ Password Reset  
✅ Protected Routes (Checkout requires login)  
✅ User Dashboard  
✅ Auto-login state persistence  
✅ Logout functionality  

## Social Login Setup (Optional)

### Google Sign-In

1. In Firebase Console > Authentication > Sign-in method
2. Enable **Google** provider
3. Add your project's OAuth consent screen details
4. Add authorized domains

### Facebook Sign-In

1. Create a Facebook App at [Facebook Developers](https://developers.facebook.com/)
2. In Firebase Console > Authentication > Sign-in method
3. Enable **Facebook** provider
4. Add your Facebook App ID and App Secret

## Troubleshooting

- **"Firebase not initialized"**: Check that `firebase-config.js` has correct values
- **"Invalid API Key"**: Verify your API key in Firebase Console
- **Email verification not working**: Check spam folder and Firebase email settings
- **Login redirect not working**: Ensure `auth.js` is loaded after `firebase-config.js`

## Security Notes

- Never commit your Firebase config with real credentials to public repositories
- Use environment variables for production
- Enable Firebase App Check for additional security
- Regularly update Firebase SDK versions

## Next Steps

After setup, you can:
- Customize email templates in Firebase Console
- Add user profile pictures using Firebase Storage
- Store user orders in Firestore
- Implement additional features like order tracking

