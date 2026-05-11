// firebase-config.js
// TODO: Replace the config below with your actual Firebase project configuration.
// 1. Go to Firebase Console (console.firebase.google.com)
// 2. Create a new project, then add a Web App
// 3. Enable Firestore Database (Start in Test Mode for now)
// 4. Copy the firebaseConfig object below:

const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

let db = null;

try {
    // Initialize Firebase only if the user has replaced YOUR_API_KEY
    if (firebaseConfig.apiKey !== "YOUR_API_KEY") {
        firebase.initializeApp(firebaseConfig);
        db = firebase.firestore();
        console.log("Firebase initialized successfully.");
    } else {
        console.warn("Firebase is not configured yet. Running in local mock mode.");
    }
} catch (error) {
    console.error("Firebase initialization error", error);
}

// Expose db to window so React components can use it
window.db = db;
