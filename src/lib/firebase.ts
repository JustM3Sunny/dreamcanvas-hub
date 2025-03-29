
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "YOUR_API_KEY", // Replace with your Firebase API Key
  authDomain: "YOUR_AUTH_DOMAIN", // Replace with your Firebase Auth Domain
  projectId: "YOUR_PROJECT_ID", // Replace with your Firebase Project ID
  storageBucket: "YOUR_STORAGE_BUCKET", // Replace with your Firebase Storage Bucket
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID", // Replace with your Firebase Messaging Sender ID
  appId: "YOUR_APP_ID", // Replace with your Firebase App ID
  measurementId: "YOUR_MEASUREMENT_ID" // Replace with your Firebase Measurement ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const storage = getStorage(app);
export const db = getFirestore(app);

export default app;
