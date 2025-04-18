
import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, 
  signInWithPopup, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider
} from 'firebase/auth';
import { auth, googleProvider, isCurrentDomainAuthorized, createRequiredIndexes } from '../lib/firebase';
import { toast } from 'sonner';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
      
      if (user) {
        // If user is logged in, check and create required indexes
        createRequiredIndexes();
      }
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    try {
      // Check if current domain is likely authorized before attempting sign in
      if (!isCurrentDomainAuthorized()) {
        const currentDomain = window.location.hostname;
        toast.warning(
          <div className="space-y-2">
            <p>This domain may not be authorized for Firebase authentication</p>
            <p className="text-xs text-gray-300">
              Add <span className="font-mono bg-gray-800 px-1 rounded">{currentDomain}</span> to Firebase Console ➝ Authentication ➝ Settings ➝ Authorized domains
            </p>
          </div>, 
          { duration: 8000 }
        );
      }

      await signInWithPopup(auth, googleProvider);
      toast.success('Successfully signed in!');
    } catch (error: any) {
      console.error('Error signing in with Google', error);
      
      if (error.code === 'auth/unauthorized-domain') {
        const currentDomain = window.location.hostname;
        toast.error(
          <div className="space-y-2">
            <p>Domain not authorized for Firebase authentication</p>
            <p className="text-xs text-gray-300">
              Add <span className="font-mono bg-gray-800 px-1 rounded">{currentDomain}</span> to Firebase Console ➝ Authentication ➝ Settings ➝ Authorized domains
            </p>
          </div>, 
          { duration: 8000 }
        );
      } else if (error.code === 'auth/popup-blocked') {
        toast.error('Pop-up was blocked by your browser. Please allow pop-ups for this site.');
      } else if (error.code === 'auth/popup-closed-by-user') {
        toast.info('Sign-in cancelled.');
      } else {
        toast.error(`Failed to sign in: ${error.message}`);
      }
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      toast.success('Successfully signed out!');
    } catch (error: any) {
      console.error('Error signing out', error);
      toast.error(`Failed to sign out: ${error.message}`);
    }
  };

  const value = {
    currentUser,
    loading,
    signInWithGoogle,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
