import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '@/constants/api';
import { auth } from '@/config/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  User as FirebaseUser,
  updateProfile // Import updateProfile
} from 'firebase/auth';

interface User {
  _id: string;
  name: string;
  email: string;
  role?: 'user' | 'admin';
  metrics?: {
    age?: number;
    gender?: 'male' | 'female';
    height?: number;
    weight?: number;
    activityLevel?: 'sedentary' | 'light' | 'moderate' | 'active' | 'extreme';
    goal?: 'lose' | 'maintain' | 'gain';
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        // Verify token and get user
        const response = await api.get<User>('/auth/me');
        if (response.success && response.data) {
          setUser(response.data);
        } else {
          await AsyncStorage.removeItem('token');
        }
      }
    } catch (error) {
      console.log('Error loading user:', error);
      await AsyncStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<User> => {
    try {
      // 1. Firebase Login
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // 2. Backend Sync (Simplified)
      const response = await api.post('/auth/firebase', {
        email: firebaseUser.email,
        uid: firebaseUser.uid
      }) as any;

      if (response.success && response.token && response.data) {
        await AsyncStorage.setItem('token', response.token);
        await AsyncStorage.setItem('userId', response.data._id);
        setUser(response.data);
        return response.data;
      } else {
        // If backend sync fails, we should probably sign out from firebase too
        await signOut(auth);
        throw new Error(response.error || 'Backend sync failed');
      }
    } catch (error: any) {
      console.error("Login Check:", error);
      throw new Error(error.message || 'Login failed');
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      // 1. Firebase Register
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Update Firebase Profile Name (Optional but good practice)
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: name });
      }

      // 2. Backend Sync (Simplified)
      const response = await api.post('/auth/firebase', {
        email: firebaseUser.email,
        uid: firebaseUser.uid,
        name: name
      }) as any;

      if (response.success && response.token && response.data) {
        await AsyncStorage.setItem('token', response.token);
        await AsyncStorage.setItem('userId', response.data._id);
        setUser(response.data);
      } else {
        await signOut(auth);
        throw new Error(response.error || 'Backend sync failed');
      }
    } catch (error: any) {
      console.log("Register Check:", error.message);
      throw new Error(error.message || 'Registration failed');
    }
  };

  const logout = async () => {
    await signOut(auth); // Firebase SignOut
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('userId');
    setUser(null);
  };

  const refreshUser = async () => {
    await loadUser();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}


