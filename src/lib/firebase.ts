
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getFirestore, enableIndexedDbPersistence, collection, getDocs } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';
import { toast } from 'sonner';

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
                 "imgs-e2d36.appspot.com", 
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

// Enable offline persistence where supported
if (typeof window !== 'undefined') {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
    } else if (err.code === 'unimplemented') {
      console.warn('The current browser does not support offline persistence.');
    }
  });
}

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

// Get the current domain for better error messages
const currentDomain = typeof window !== 'undefined' ? window.location.hostname : 'unknown';

// Log Firebase configuration status
console.log("Firebase initialized with project:", firebaseConfig.projectId);
console.log("Current domain:", currentDomain);

// Helper function to check if the current domain is authorized
export const isCurrentDomainAuthorized = () => {
  // Common Firebase authorized domains
  const commonAuthorizedDomains = [
    'localhost',
    firebaseConfig.authDomain,
    `${firebaseConfig.projectId}.web.app`,
    `${firebaseConfig.projectId}.firebaseapp.com`,
    'preview--dreamcanvas-hub.lovable.app',
    'lovable.dev',
    'lovableproject.com'
  ];
  
  return commonAuthorizedDomains.includes(currentDomain) || 
         currentDomain.includes('lovableproject.com') || 
         currentDomain.includes('lovable.dev');
};

// Check if Firebase is properly configured with real values
if (firebaseConfig.apiKey === "AIzaSyB76w-iL5EHs3zBDgn7WEfodneAhoqt6qY") {
  console.info("Using the default Firebase configuration");
} else if (firebaseConfig.apiKey.includes("VITE_FIREBASE")) {
  console.warn("Firebase environment variables not found. Using fallback configuration.");
}

// Helper to create required indexes if missing
export const createRequiredIndexes = async () => {
  try {
    // Test query that requires the index
    const imagesRef = collection(db, 'images');
    await getDocs(imagesRef);
    return true;
  } catch (error: any) {
    if (error.code === 'failed-precondition' && error.message.includes('index')) {
      // Extract the index creation URL
      const indexUrlMatch = error.message.match(/https:\/\/console\.firebase\.google\.com[^\s"]+/);
      if (indexUrlMatch && indexUrlMatch[0]) {
        const indexUrl = indexUrlMatch[0];
        toast.error(
          {
            title: "Firebase index required",
            description: "Create the required index by clicking the link in the console error or visiting Firebase Console",
            action: {
              label: "Open Console",
              onClick: () => window.open(indexUrl, '_blank')
            },
            duration: 10000
          }
        );
        console.error(`Firebase index required: ${indexUrl}`);
      }
    }
    return false;
  }
};

export default app;
