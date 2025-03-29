
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 
          localStorage.getItem('FIREBASE_API_KEY') || 
          "AIzaSyB76w-iL5EHs3zBDgn7WEfodneAhoqt6qY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 
              localStorage.getItem('FIREBASE_AUTH_DOMAIN') || 
              "imgs-e2d36.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 
             localStorage.getItem('FIREBASE_PROJECT_ID') || 
             "imgs-e2d36",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 
                 localStorage.getItem('FIREBASE_STORAGE_BUCKET') || 
                 "imgs-e2d36.appspot.com", // Corrected the storage bucket URL
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || 
                     localStorage.getItem('FIREBASE_MESSAGING_SENDER_ID') || 
                     "777726030782",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || 
         localStorage.getItem('FIREBASE_APP_ID') || 
         "1:777726030782:web:cd1e909d14c0d33daf7fef",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 
                 localStorage.getItem('FIREBASE_MEASUREMENT_ID') || 
                 "G-EYETNNBTLS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const storage = getStorage(app);
export const db = getFirestore(app);

// Initialize Analytics only in browser environment
let analytics = null;
if (typeof window !== 'undefined') {
  try {
    analytics = getAnalytics(app);
  } catch (error) {
    console.warn("Firebase Analytics failed to initialize:", error);
  }
}
export const analyticsInstance = analytics;

// Log Firebase configuration status
console.log("Firebase initialized with project:", firebaseConfig.projectId);

// Check if Firebase is properly configured with real values
if (firebaseConfig.apiKey === "AIzaSyB76w-iL5EHs3zBDgn7WEfodneAhoqt6qY") {
  console.info("Using the default Firebase configuration");
} else if (firebaseConfig.apiKey.includes("VITE_FIREBASE")) {
  console.warn("Firebase environment variables not found. Using fallback configuration.");
}

export default app;
