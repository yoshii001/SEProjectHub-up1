import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { User } from '../types';

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
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

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const register = async (email: string, password: string, displayName: string) => {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(user, { displayName });
  };

  const logout = async () => {
    await signOut(auth);
  };

  const mapFirebaseUser = (firebaseUser: FirebaseUser): User => {
    // For demo purposes, if the user is john@example.com, map to userId1
    // This allows the existing data to be visible
    let mappedId = firebaseUser.uid;
    if (firebaseUser.email === 'john@example.com') {
      mappedId = 'userId1';
    }

    return {
      id: mappedId,
      email: firebaseUser.email!,
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
      createdAt: new Date(firebaseUser.metadata.creationTime!)
    };
  };

  useEffect(() => {
    console.log('🔄 Setting up auth state listener');
    
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      console.log('👤 Auth state changed:', firebaseUser ? 'Logged in' : 'Logged out');
      if (firebaseUser) {
        console.log('📧 User email:', firebaseUser.email);
        console.log('🆔 User ID:', firebaseUser.uid);
        const mappedUser = mapFirebaseUser(firebaseUser);
        console.log('🗂️ Mapped user ID:', mappedUser.id);
        setCurrentUser(mappedUser);
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => {
      console.log('🔄 Cleaning up auth state listener');
      unsubscribe();
    };
  }, []);

  const value = {
    currentUser,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};