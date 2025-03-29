
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  // Check for environment variables first, then fallback to localStorage for development
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || localStorage.getItem('FIREBASE_API_KEY') || "YOUR_API_KEY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || localStorage.getItem('FIREBASE_AUTH_DOMAIN') || "YOUR_AUTH_DOMAIN",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || localStorage.getItem('FIREBASE_PROJECT_ID') || "YOUR_PROJECT_ID",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || localStorage.getItem('FIREBASE_STORAGE_BUCKET') || "YOUR_STORAGE_BUCKET",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || localStorage.getItem('FIREBASE_MESSAGING_SENDER_ID') || "YOUR_MESSAGING_SENDER_ID",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || localStorage.getItem('FIREBASE_APP_ID') || "YOUR_APP_ID",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || localStorage.getItem('FIREBASE_MEASUREMENT_ID') || "YOUR_MEASUREMENT_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const storage = getStorage(app);
export const db = getFirestore(app);

// Check if Firebase is properly configured
if (firebaseConfig.apiKey === "YOUR_API_KEY") {
  console.warn("Firebase is not properly configured. Please set up Firebase API keys in your environment variables or localStorage.");
}

export default app;
